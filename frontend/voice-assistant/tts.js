/**
 * Text-to-Speech Module using Web Speech API
 * Free, unlimited usage - built into browsers
 */

export class TextToSpeech {
    constructor(options = {}) {
        if (!window.speechSynthesis) {
            throw new Error('Speech Synthesis not supported in this browser.');
        }

        this.synth = window.speechSynthesis;
        this.voice = null;
        this.rate = options.rate || 1.0;
        this.pitch = options.pitch || 1.0;
        this.volume = options.volume || 1.0;

        // Callbacks
        this.onStart = null;
        this.onEnd = null;
        this.onError = null;
        this.onStateChange = null;

        // Preferred voices (in order of preference)
        this.preferredVoices = options.preferredVoices || [
            'Google UK English Female',
            'Google UK English Male',
            'Google US English',
            'Microsoft Zira',
            'Microsoft David',
            'Samantha',
            'Karen',
            'Daniel',
            'Moira',
            'Alex'
        ];

        // Load voices
        this._loadVoices();
    }

    _loadVoices() {
        const loadVoiceList = () => {
            const voices = this.synth.getVoices();

            if (voices.length === 0) return;

            // Find preferred voice
            for (const preferred of this.preferredVoices) {
                const found = voices.find(v => v.name.includes(preferred));
                if (found) {
                    this.voice = found;
                    console.log('🔊 Selected voice:', found.name);
                    break;
                }
            }

            // Fallback to first English voice
            if (!this.voice) {
                this.voice = voices.find(v => v.lang.startsWith('en')) || voices[0];
                if (this.voice) {
                    console.log('🔊 Fallback voice:', this.voice.name);
                }
            }
        };

        // Chrome loads voices asynchronously
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = loadVoiceList;
        }

        loadVoiceList();
    }

    /**
     * Get list of available voices
     */
    getVoices() {
        return this.synth.getVoices();
    }

    /**
     * Set voice by name
     */
    setVoice(voiceName) {
        const voices = this.synth.getVoices();
        const found = voices.find(v => v.name.includes(voiceName));
        if (found) {
            this.voice = found;
            return true;
        }
        return false;
    }

    /**
     * Add natural pauses to text for better speech
     */
    _addNaturalPauses(text) {
        return text
            .replace(/\. /g, '. ... ')      // Pause after sentences
            .replace(/! /g, '! ... ')       // Pause after exclamations
            .replace(/\? /g, '? ... ')      // Pause after questions
            .replace(/, /g, ', ');          // Brief pause after commas
    }

    /**
     * Speak text
     * @param {string} text - Text to speak
     * @param {object} options - Override options for this utterance
     * @returns {Promise} Resolves when speech is complete
     */
    speak(text, options = {}) {
        return new Promise((resolve, reject) => {
            // Cancel any ongoing speech
            this.stop();

            // Workaround for Chrome bug where synthesis stops after ~15 seconds
            // Split long text into chunks
            const chunks = this._splitIntoChunks(text);

            const speakChunk = (index) => {
                if (index >= chunks.length) {
                    this.onEnd?.();
                    this.onStateChange?.('idle');
                    resolve();
                    return;
                }

                const chunk = options.addPauses !== false
                    ? this._addNaturalPauses(chunks[index])
                    : chunks[index];

                const utterance = new SpeechSynthesisUtterance(chunk);

                if (this.voice) {
                    utterance.voice = this.voice;
                }

                utterance.rate = options.rate || this.rate;
                utterance.pitch = options.pitch || this.pitch;
                utterance.volume = options.volume || this.volume;

                utterance.onstart = () => {
                    if (index === 0) {
                        this.onStart?.();
                        this.onStateChange?.('speaking');
                    }
                };

                utterance.onend = () => {
                    speakChunk(index + 1);
                };

                utterance.onerror = (event) => {
                    // Ignore 'interrupted' errors (happens when we call stop())
                    if (event.error === 'interrupted') {
                        resolve();
                        return;
                    }
                    this.onError?.(event);
                    this.onStateChange?.('error');
                    reject(event);
                };

                this.synth.speak(utterance);
            };

            speakChunk(0);
        });
    }

    /**
     * Split text into chunks to avoid Chrome's 15-second limit
     */
    _splitIntoChunks(text, maxLength = 200) {
        if (text.length <= maxLength) {
            return [text];
        }

        const chunks = [];
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        let currentChunk = '';

        for (const sentence of sentences) {
            if ((currentChunk + sentence).length <= maxLength) {
                currentChunk += sentence;
            } else {
                if (currentChunk) {
                    chunks.push(currentChunk.trim());
                }
                currentChunk = sentence;
            }
        }

        if (currentChunk) {
            chunks.push(currentChunk.trim());
        }

        return chunks;
    }

    /**
     * Stop speaking
     */
    stop() {
        this.synth.cancel();
    }

    /**
     * Pause speaking
     */
    pause() {
        this.synth.pause();
    }

    /**
     * Resume speaking
     */
    resume() {
        this.synth.resume();
    }

    /**
     * Check if currently speaking
     */
    isSpeaking() {
        return this.synth.speaking;
    }

    /**
     * Check if browser supports speech synthesis
     */
    static isSupported() {
        return !!window.speechSynthesis;
    }
}

export default TextToSpeech;
