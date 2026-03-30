// Voice utilities for speech recognition and synthesis

export const isSpeechRecognitionSupported = () => {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
};

export const isSpeechSynthesisSupported = () => {
  return 'speechSynthesis' in window;
};

export const getSpeechRecognition = () => {
  if (!isSpeechRecognitionSupported()) {
    throw new Error('Speech recognition not supported in this browser');
  }
  return window.SpeechRecognition || window.webkitSpeechRecognition;
};

export const speakText = (text, options = {}) => {
  if (!isSpeechSynthesisSupported()) {
    console.warn('Speech synthesis not supported in this browser');
    return Promise.reject(new Error('Speech synthesis not supported'));
  }

  // Validate input
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    console.warn('Invalid text for speech synthesis');
    return Promise.reject(new Error('Invalid text for speech synthesis'));
  }

  // Clean the text
  const cleanText = text.trim().substring(0, 200); // Limit length to prevent errors

  try {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Set safe options
    utterance.rate = Math.max(0.1, Math.min(10, options.rate || 1.0));
    utterance.pitch = Math.max(0, Math.min(2, options.pitch || 1.0));
    utterance.volume = Math.max(0, Math.min(1, options.volume || 1.0));
    utterance.lang = options.lang || 'en-US';

    return new Promise((resolve, reject) => {
      // Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        console.warn('Speech synthesis timeout - forcing completion');
        window.speechSynthesis.cancel();
        resolve();
      }, 10000); // 10 second timeout

      utterance.onstart = () => {
        try {
          if (options.onStart) options.onStart();
        } catch (err) {
          console.warn('Error in onStart callback:', err);
        }
      };

      utterance.onend = () => {
        clearTimeout(timeout);
        try {
          if (options.onEnd) options.onEnd();
          resolve();
        } catch (err) {
          console.warn('Error in onEnd callback:', err);
          resolve(); // Still resolve even if callback fails
        }
      };

      utterance.onerror = (event) => {
        clearTimeout(timeout);
        console.error('Speech synthesis error:', event);
        try {
          if (options.onError) options.onError(event);
        } catch (err) {
          console.warn('Error in onError callback:', err);
        }
        // Don't reject the promise, just log the error
        resolve(); // Resolve to prevent breaking the flow
      };

      window.speechSynthesis.speak(utterance);
    });
  } catch (error) {
    console.error('Error creating speech synthesis utterance:', error);
    return Promise.reject(error);
  }
};

export const stopSpeaking = () => {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
};

export const getAvailableVoices = () => {
  if (!isSpeechSynthesisSupported()) {
    return [];
  }
  return window.speechSynthesis.getVoices();
};

// Get voice preferences for different types of content
export const getVoicePreferences = (contentType = 'default') => {
  const voices = getAvailableVoices();
  
  const preferences = {
    tutor: {
      lang: 'en-US',
      rate: 0.9,
      pitch: 1.0,
      preferredNames: ['Microsoft Zira', 'Google US English', 'Samantha']
    },
    explanation: {
      lang: 'en-US', 
      rate: 0.8,
      pitch: 1.0,
      preferredNames: ['Microsoft Zira', 'Google US English', 'Karen']
    },
    default: {
      lang: 'en-US',
      rate: 1.0,
      pitch: 1.0,
      preferredNames: []
    }
  };

  return preferences[contentType] || preferences.default;
};
