/**
 * Speech-to-Text Module using Web Speech API
 * Free, unlimited usage - built into browsers
 */

export class VoiceRecognition {
  constructor(options = {}) {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      throw new Error('Speech Recognition not supported in this browser. Please use Chrome, Edge, or Safari.');
    }
    
    this.recognition = new SpeechRecognition();
    
    // Configuration
    this.recognition.continuous = options.continuous || false;
    this.recognition.interimResults = options.interimResults !== false;
    this.recognition.lang = options.lang || 'en-US';
    this.recognition.maxAlternatives = 1;
    
    // State
    this._isListening = false;
    
    // Callbacks
    this.onResult = null;
    this.onInterimResult = null;
    this.onError = null;
    this.onStateChange = null;
    this.onEnd = null;
    
    // Set up event handlers
    this._setupEventHandlers();
  }
  
  _setupEventHandlers() {
    this.recognition.onstart = () => {
      this._isListening = true;
      this.onStateChange?.('listening');
    };
    
    this.recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;
      const isFinal = result.isFinal;
      
      if (isFinal) {
        this.onResult?.(transcript, confidence);
      } else {
        this.onInterimResult?.(transcript);
      }
    };
    
    this.recognition.onerror = (event) => {
      this._isListening = false;
      
      // Handle specific errors
      const errorMessages = {
        'no-speech': 'No speech detected. Please try again.',
        'audio-capture': 'No microphone found. Please check your microphone.',
        'not-allowed': 'Microphone access denied. Please allow microphone access.',
        'network': 'Network error occurred. Please check your connection.',
        'aborted': 'Speech recognition was aborted.',
        'service-not-allowed': 'Speech service not allowed.'
      };
      
      const message = errorMessages[event.error] || `Speech recognition error: ${event.error}`;
      this.onError?.(event.error, message);
      this.onStateChange?.('error');
    };
    
    this.recognition.onend = () => {
      this._isListening = false;
      this.onEnd?.();
      this.onStateChange?.('idle');
    };
    
    this.recognition.onsoundstart = () => {
      this.onStateChange?.('hearing');
    };
    
    this.recognition.onsoundend = () => {
      // Sound ended, waiting for final result
    };
  }
  
  /**
   * Start listening for speech
   */
  start() {
    if (this._isListening) {
      console.warn('Already listening');
      return;
    }
    
    try {
      this.recognition.start();
    } catch (error) {
      // Handle case where recognition is already started
      if (error.name === 'InvalidStateError') {
        this.recognition.stop();
        setTimeout(() => this.recognition.start(), 100);
      } else {
        throw error;
      }
    }
  }
  
  /**
   * Stop listening
   */
  stop() {
    if (this._isListening) {
      this.recognition.stop();
    }
  }
  
  /**
   * Abort listening (immediate stop without waiting for results)
   */
  abort() {
    this.recognition.abort();
    this._isListening = false;
  }
  
  /**
   * Check if currently listening
   */
  isListening() {
    return this._isListening;
  }
  
  /**
   * Set language for recognition
   */
  setLanguage(lang) {
    this.recognition.lang = lang;
  }
  
  /**
   * Check if browser supports speech recognition
   */
  static isSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }
}

export default VoiceRecognition;
