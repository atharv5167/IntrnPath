# Voice Assistant Module

AI-powered voice assistant for InternPath using **100% FREE APIs**.

## Features

- 🎤 **Voice-to-Voice Conversation** - Talk naturally with the AI
- 🧠 **Groq AI** - Ultra-fast LLM responses (14,400 free requests/day)
- 🗣️ **Web Speech API** - Free, unlimited speech recognition and synthesis
- 📊 **Context-Aware** - Knows your learning progress, goals, and streak
- 💬 **Conversation History** - Maintains context across multiple turns

## Browser Support

- ✅ **Chrome** (Desktop & Android) - Full support, best experience
- ✅ **Edge** - Full support
- ✅ **Safari** (iOS 14.5+) - Full support
- ⚠️ **Firefox** - TTS only (no speech recognition)

## Setup

### 1. Get FREE Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up (no credit card required)
3. Create API Key (starts with `gsk_`)
4. Copy the key

### 2. Add API Key

Replace `YOUR_GROQ_API_KEY_HERE` in both:
- `frontend/dashboard.html` (line ~801)
- `frontend/roadmap-preview.html` (line ~803)

Or add to your `.env` file:
```
GROQ_API_KEY=gsk_your_key_here
```

### 3. Test

1. Open `http://localhost:3000/frontend/dashboard.html`
2. Click the floating mic button (bottom-right)
3. Allow microphone access
4. Speak: "Hello, what can you help me with?"
5. Listen to the AI response

## Files

```
frontend/voice-assistant/
├── index.js           # Main orchestrator
├── ai-provider.js     # Groq API integration
├── stt.js            # Speech-to-Text (Web Speech API)
├── tts.js            # Text-to-Speech (Web Speech API)
├── context.js        # User context fetcher
├── conversation.js   # Conversation history
└── voice-widget.css  # Widget styles
```

## Usage

The voice button appears on:
- Dashboard (all tabs: Progress, Matrix, Roadmap, Profile)
- Roadmap Preview page

### Button States

- **Orange** (idle) - Ready to listen
- **Red pulsing** (listening) - Recording your voice
- **Orange spinning** (processing) - AI is thinking
- **Green** (speaking) - AI is responding

### Conversation Panel

Click the mic button to start. The conversation panel shows:
- Your speech (right side, orange)
- AI responses (left side, gray)
- Current status (listening/processing/speaking)

## Customization

### Change AI Model

Edit `dashboard.html` and `roadmap-preview.html`:
```javascript
const voiceAssistant = new InternPathVoiceAssistant({
  model: 'llama-3.1-8b-instant', // Faster, less accurate
  // or
  model: 'llama-3.3-70b-versatile', // Default, best quality
});
```

### Adjust Voice Speed

Edit `voice-assistant/tts.js`:
```javascript
utterance.rate = 0.95; // Slower (0.1 to 10)
utterance.pitch = 1.0; // Pitch (0 to 2)
```

## Troubleshooting

**"API key not working"**
- Make sure key starts with `gsk_`
- Get new key from [console.groq.com/keys](https://console.groq.com/keys)

**"Microphone not working"**
- Check browser permissions
- Must use HTTPS or localhost
- Try Chrome/Edge for best support

**"No speech output"**
- Check device volume
- Try different browser
- Check browser console for errors

## Free Tier Limits

| Service | Limit | Cost |
|---------|-------|------|
| Groq API | 14,400 requests/day | **FREE** |
| Web Speech API | Unlimited | **FREE** |

**Total cost: $0 forever!**

## Architecture

```
User speaks → Web Speech API (STT) → Groq AI (LLM) → Web Speech API (TTS) → User hears
                                            ↓
                                    InternPath Context
                                    (user data, progress)
```

## Credits

Built for InternPath - AI-powered internship preparation platform.

Tech Stack:
- [Groq](https://groq.com) - Ultra-fast LLM inference
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) - Browser speech features
- Llama 3.3 70B - Open-source language model
