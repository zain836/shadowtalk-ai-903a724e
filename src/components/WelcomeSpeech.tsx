import React, { useEffect } from 'react';

const WelcomeSpeech = () => {
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisited');

    if (!hasVisited) {
      const speak = () => {
        const text = "Welcome i am ShadowTalk-AI please signup and take my experience enjoy!!!";
        const utterance = new SpeechSynthesisUtterance(text);

        // Find a better voice.
        const voices = window.speechSynthesis.getVoices();
        let selectedVoice = voices.find(voice => voice.name === 'Google US English');
        if (!selectedVoice) {
            selectedVoice = voices.find(voice => voice.lang === 'en-US' && voice.name.includes('Female'));
        }
        if (!selectedVoice) {
            selectedVoice = voices.find(voice => voice.lang === 'en-US');
        }

        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
        
        utterance.lang = 'en-US';
        utterance.rate = 1;
        utterance.pitch = 1;

        // Clean up text for speech
        utterance.text = text.replace(/[#*`]/g, '').replace(/\n+/g, ' ');

        window.speechSynthesis.speak(utterance);
        localStorage.setItem('hasVisited', 'true');
        
        // Remove the event listener once it has been used.
        window.speechSynthesis.onvoiceschanged = null;
      };

      if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          speak();
        } else {
          window.speechSynthesis.onvoiceschanged = speak;
        }
      }
    }
  }, []);

  return null; // This component does not render anything
};

export default WelcomeSpeech;
