/**
 * InternPath Voice Assistant - Main Module
 * Orchestrates STT → AI → TTS pipeline
 */

import { VoiceRecognition } from './stt.js';
import { TextToSpeech } from './tts.js';
import { AIProvider, GROQ_MODELS } from './ai-provider.js';
import { ContextFetcher } from './context.js';
import { ConversationManager } from './conversation.js';

// Voice Assistant States
export const VoiceState = {
    IDLE: 'idle',
    LISTENING: 'listening',
    PROCESSING: 'processing',
    SPEAKING: 'speaking',
    ERROR: 'error'
};

export class InternPathVoiceAssistant {
    constructor(config = {}) {
        // Configuration
        this.config = {
            groqApiKey: config.groqApiKey || null,
            authToken: config.authToken || null,
            apiBaseUrl: config.apiBaseUrl || '/api',
            useMockData: config.useMockData || false,
            autoSpeak: config.autoSpeak !== false,
            model: config.model || GROQ_MODELS.LLAMA_70B,
            ...config
        };

        // State
        this.state = VoiceState.IDLE;
        this.isInitialized = false;

        // Event callbacks
        this.onStateChange = null;
        this.onTranscript = null;
        this.onInterimTranscript = null;
        this.onResponse = null;
        this.onError = null;
        this.onReady = null;

        // Initialize components
        this._initializeComponents();
    }

    _initializeComponents() {
        try {
            // Speech-to-Text
            this.stt = new VoiceRecognition();
            this.stt.onResult = (transcript, confidence) => {
                this._handleSpeechResult(transcript, confidence);
            };
            this.stt.onInterimResult = (transcript) => {
                this.onInterimTranscript?.(transcript);
            };
            this.stt.onError = (error, message) => {
                this._handleError(error, message);
            };
            this.stt.onEnd = () => {
                if (this.state === VoiceState.LISTENING) {
                    this._setState(VoiceState.IDLE);
                }
            };

            // Text-to-Speech
            this.tts = new TextToSpeech();
            this.tts.onStart = () => {
                this._setState(VoiceState.SPEAKING);
            };
            this.tts.onEnd = () => {
                this._setState(VoiceState.IDLE);
            };
            this.tts.onError = (error) => {
                this._handleError('tts_error', 'Speech synthesis failed');
            };

            // AI Provider
            this.ai = new AIProvider({
                groqApiKey: this.config.groqApiKey,
                model: this.config.model
            });

            // Context Fetcher
            this.context = new ContextFetcher({
                apiBaseUrl: this.config.apiBaseUrl,
                authToken: this.config.authToken,
                useMockData: this.config.useMockData
            });

            // Conversation Manager
            this.conversation = new ConversationManager({ maxHistory: 10 });

            this.isInitialized = true;
            this.onReady?.();

            console.log('🎙️ Voice Assistant initialized');

        } catch (error) {
            console.error('Failed to initialize Voice Assistant:', error);
            this._handleError('init_error', error.message);
        }
    }

    /**
     * Set API key
     */
    setApiKey(apiKey) {
        this.config.groqApiKey = apiKey;
        this.ai.setApiKey(apiKey);
    }

    /**
     * Set auth token for InternPath API
     */
    setAuthToken(token) {
        this.config.authToken = token;
        this.context.setAuthToken(token);
    }

    /**
     * Start listening for user speech
     */
    async startListening() {
        if (!this.isInitialized) {
            this._handleError('not_initialized', 'Voice assistant not initialized');
            return;
        }

        // Stop any ongoing speech
        if (this.state === VoiceState.SPEAKING) {
            this.tts.stop();
        }

        // Start listening
        this._setState(VoiceState.LISTENING);
        this.stt.start();
    }

    /**
     * Stop listening
     */
    stopListening() {
        this.stt.stop();
        if (this.state === VoiceState.LISTENING) {
            this._setState(VoiceState.IDLE);
        }
    }

    /**
     * Toggle listening state
     */
    toggle() {
        if (this.state === VoiceState.LISTENING) {
            this.stopListening();
        } else if (this.state === VoiceState.SPEAKING) {
            this.stopSpeaking();
        } else {
            this.startListening();
        }
    }

    /**
     * Stop speaking
     */
    stopSpeaking() {
        this.tts.stop();
        this._setState(VoiceState.IDLE);
    }

    /**
     * Handle speech recognition result
     */
    async _handleSpeechResult(transcript, confidence) {
        if (!transcript || transcript.trim().length === 0) {
            this._setState(VoiceState.IDLE);
            return;
        }

        console.log('🎤 User said:', transcript);

        // Notify transcript
        this.onTranscript?.(transcript);

        // Add to conversation
        this.conversation.addUserMessage(transcript);

        // Process with AI
        await this._processWithAI(transcript);
    }

    /**
     * Process user input with AI
     */
    async _processWithAI(transcript) {
        this._setState(VoiceState.PROCESSING);

        try {
            // Check API key
            if (!this.config.groqApiKey) {
                throw new Error('API key not set. Please provide your Groq API key.');
            }

            // Fetch user context
            const userContext = await this.context.fetchContext();

            // Get conversation history
            const history = this.conversation.getLastMessages(10);

            // Get AI response
            const response = await this.ai.getResponse(transcript, userContext, history);

            console.log('🤖 AI response:', response);

            // Add to conversation
            this.conversation.addAssistantMessage(response);

            // Notify response
            this.onResponse?.(response);

            // Speak response
            if (this.config.autoSpeak) {
                await this.speak(response);
            } else {
                this._setState(VoiceState.IDLE);
            }

        } catch (error) {
            console.error('AI processing error:', error);
            this._handleError('ai_error', error.message);
        }
    }

    /**
     * Speak text
     */
    async speak(text) {
        if (!text) return;

        this._setState(VoiceState.SPEAKING);

        try {
            await this.tts.speak(text);
            this._setState(VoiceState.IDLE);
        } catch (error) {
            console.error('TTS error:', error);
            this._setState(VoiceState.IDLE);
        }
    }

    /**
     * Send text message (without speech recognition)
     */
    async sendMessage(message) {
        if (!message || message.trim().length === 0) return;

        this.onTranscript?.(message);
        this.conversation.addUserMessage(message);
        await this._processWithAI(message);
    }

    /**
     * Update state
     */
    _setState(newState) {
        const oldState = this.state;
        this.state = newState;

        if (oldState !== newState) {
            console.log(`📊 State: ${oldState} → ${newState}`);
            this.onStateChange?.(newState, oldState);
        }
    }

    /**
     * Handle errors
     */
    _handleError(code, message) {
        console.error(`❌ Error [${code}]:`, message);
        this._setState(VoiceState.ERROR);
        this.onError?.({ code, message });

        // Auto-recover to idle after a moment
        setTimeout(() => {
            if (this.state === VoiceState.ERROR) {
                this._setState(VoiceState.IDLE);
            }
        }, 3000);
    }

    /**
     * Get current state
     */
    getState() {
        return this.state;
    }

    /**
     * Check if listening
     */
    isListening() {
        return this.state === VoiceState.LISTENING;
    }

    /**
     * Check if speaking
     */
    isSpeaking() {
        return this.state === VoiceState.SPEAKING;
    }

    /**
     * Check if processing
     */
    isProcessing() {
        return this.state === VoiceState.PROCESSING;
    }

    /**
     * Check if busy (not idle)
     */
    isBusy() {
        return this.state !== VoiceState.IDLE;
    }

    /**
     * Clear conversation history
     */
    clearConversation() {
        this.conversation.clear();
        console.log('🗑️ Conversation cleared');
    }

    /**
     * Get conversation history
     */
    getConversationHistory() {
        return this.conversation.getFullHistory();
    }

    /**
     * Validate API key
     */
    async validateApiKey(apiKey) {
        return await this.ai.validateApiKey(apiKey);
    }

    /**
     * Check browser support
     */
    static checkSupport() {
        return {
            speechRecognition: VoiceRecognition.isSupported(),
            speechSynthesis: TextToSpeech.isSupported(),
            isSupported: VoiceRecognition.isSupported() && TextToSpeech.isSupported()
        };
    }

    /**
     * Destroy instance
     */
    destroy() {
        this.stopListening();
        this.stopSpeaking();
        this.conversation.clear();
        this.isInitialized = false;
        console.log('🛑 Voice Assistant destroyed');
    }
}

// Export everything
export { VoiceRecognition } from './stt.js';
export { TextToSpeech } from './tts.js';
export { AIProvider, GROQ_MODELS } from './ai-provider.js';
export { ContextFetcher } from './context.js';
export { ConversationManager } from './conversation.js';

export default InternPathVoiceAssistant;
