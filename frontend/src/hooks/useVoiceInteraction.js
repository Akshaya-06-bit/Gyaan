import { useState, useEffect, useRef, useCallback } from 'react';
import { isSpeechRecognitionSupported, isSpeechSynthesisSupported, speakText, stopSpeaking, getSpeechRecognition } from '../utils/voiceUtils';

export const useVoiceInteraction = (options = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [listeningTranscript, setListeningTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState({
    recognition: false,
    synthesis: false
  });
  const [retryCount, setRetryCount] = useState(0);

  const recognitionRef = useRef(null);
  const onTranscriptCallback = useRef(options.onTranscript);
  const onSpeakingStartCallback = useRef(options.onSpeakingStart);
  const onSpeakingEndCallback = useRef(options.onSpeakingEnd);

  // Update callbacks when options change
  useEffect(() => {
    onTranscriptCallback.current = options.onTranscript;
    onSpeakingStartCallback.current = options.onSpeakingStart;
    onSpeakingEndCallback.current = options.onSpeakingEnd;
  }, [options.onTranscript, options.onSpeakingStart, options.onSpeakingEnd]);

  // Check browser support
  useEffect(() => {
    setIsSupported({
      recognition: isSpeechRecognitionSupported(),
      synthesis: isSpeechSynthesisSupported()
    });
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (!isSupported.recognition) {
      console.log('Speech recognition not supported in this browser');
      return;
    }

    let recognition = null;
    
    try {
      const SpeechRecognition = getSpeechRecognition();
      recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = options.lang || 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
        setListeningTranscript('');
        setError(null);
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          
          if (result.isFinal) {
            finalTranscript += transcript + ' ';
            console.log('Final transcript:', transcript);
          } else {
            interimTranscript += transcript;
            console.log('Interim transcript:', transcript);
          }
        }

        const fullTranscript = finalTranscript + interimTranscript;
        setListeningTranscript(fullTranscript);
        
        if (onTranscriptCallback.current) {
          onTranscriptCallback.current(fullTranscript, finalTranscript, interimTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error, event.message);
        let errorMessage = event.error;
        let shouldRetry = false;
        
        // Provide user-friendly error messages
        switch (event.error) {
          case 'not-allowed':
            errorMessage = 'Microphone permission denied. Please allow microphone access.';
            break;
          case 'network':
            errorMessage = 'Network error. This is a common issue with speech recognition. Try these fixes: 1) Refresh the page, 2) Check internet connection, 3) Try a different browser, 4) Use Chrome for best results.';
            shouldRetry = true;
            break;
          case 'no-speech':
            errorMessage = 'No speech detected. Please try speaking clearly.';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone not available or is being used by another application.';
            break;
          case 'aborted':
            errorMessage = 'Speech recognition was stopped.';
            break;
          case 'service-not-allowed':
            errorMessage = 'Speech recognition service not allowed. This may be a browser or network issue.';
            shouldRetry = true;
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }
        
        setError(errorMessage);
        setIsListening(false);
        setListeningTranscript('');
        
        // Auto-retry for network errors (max 3 retries)
        if (shouldRetry && retryCount < 3) {
          console.log(`Retrying speech recognition (attempt ${retryCount + 1}/3)...`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            try {
              if (recognitionRef.current) {
                recognitionRef.current.start();
              }
            } catch (retryErr) {
              console.error('Retry failed:', retryErr);
            }
          }, 2000 * (retryCount + 1)); // Exponential backoff
        }
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
        setListeningTranscript('');
      };

      recognitionRef.current = recognition;
      console.log('Speech recognition initialized successfully');
      
    } catch (err) {
      console.error('Failed to initialize speech recognition:', err);
      setError(`Failed to initialize voice recognition: ${err.message}`);
    }

    return () => {
      if (recognition) {
        try {
          recognition.stop();
          recognition.abort();
        } catch (err) {
          console.warn('Error stopping speech recognition:', err);
        }
      }
    };
  }, [isSupported.recognition, options.lang]);

  const toggleListening = useCallback(() => {
    console.log('Toggle listening called, current state:', isListening);
    
    if (!recognitionRef.current) {
      console.error('Speech recognition not available');
      setError('Speech recognition not available. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      console.log('Stopping speech recognition');
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error('Error stopping speech recognition:', err);
        setError('Error stopping voice recognition');
      }
    } else {
      console.log('Starting speech recognition');
      // Always clear errors when attempting to start
      setError(null);
      setListeningTranscript('');
      setRetryCount(0);
      
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
        
        // Handle specific start errors
        if (err.name === 'NotAllowedError') {
          setError('Microphone permission denied. Please allow microphone access and try again.');
        } else if (err.name === 'NotFoundError') {
          setError('No microphone found. Please connect a microphone and try again.');
        } else if (err.name === 'NotReadableError') {
          setError('Microphone is being used by another application. Please close other apps using the microphone.');
        } else {
          setError(`Failed to start voice recognition: ${err.message}`);
        }
      }
    }
  }, [isListening]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;
    
    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setError('Failed to start listening');
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const speak = useCallback((text, speakOptions = {}) => {
    if (!isSupported.synthesis) {
      setError('Speech synthesis not supported');
      return Promise.reject(new Error('Speech synthesis not supported'));
    }

    const mergedOptions = {
      onStart: () => {
        setIsSpeaking(true);
        if (onSpeakingStartCallback.current) {
          try {
            onSpeakingStartCallback.current();
          } catch (err) {
            console.warn('Error in speaking start callback:', err);
          }
        }
      },
      onEnd: () => {
        setIsSpeaking(false);
        if (onSpeakingEndCallback.current) {
          try {
            onSpeakingEndCallback.current();
          } catch (err) {
            console.warn('Error in speaking end callback:', err);
          }
        }
      },
      onError: (err) => {
        setIsSpeaking(false);
        setError(err.error || 'Speech synthesis error');
        // Don't log to console too frequently to avoid spam
        if (err.error !== 'network') {
          console.error('Speech synthesis error:', err);
        }
      },
      ...speakOptions
    };

    return speakText(text, mergedOptions).catch((error) => {
      // Handle any uncaught errors from speakText
      console.error('Unhandled speech synthesis error:', error);
      setIsSpeaking(false);
      setError(error.message || 'Speech synthesis failed');
      // Return a resolved promise to prevent breaking the app flow
      return Promise.resolve();
    });
  }, [isSupported.synthesis]);

  const stopSpeakingCallback = useCallback(() => {
    stopSpeaking();
    setIsSpeaking(false);
  }, []);

  const clearError = useCallback(() => {
    console.log('clearError called - clearing error state');
    console.log('setError function:', typeof setError);
    console.log('setRetryCount function:', typeof setRetryCount);
    
    try {
      setError(null);
      setRetryCount(0);
      console.log('Error state cleared successfully');
    } catch (error) {
      console.error('Error in clearError:', error);
    }
  }, []);

  return {
    // State
    isListening,
    isSpeaking,
    listeningTranscript,
    error,
    isSupported,
    retryCount,
    
    // Methods
    toggleListening,
    startListening,
    stopListening,
    speak,
    stopSpeaking: stopSpeakingCallback,
    clearError
  };
};
