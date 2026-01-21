/**
 * AI Provider Module - Groq API Integration with Fallbacks
 * Uses FREE Groq API (14,400 requests/day)
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Available Groq models (all FREE) - Updated January 2025
export const GROQ_MODELS = {
    LLAMA_70B: 'llama-3.3-70b-versatile',     // Best quality (replaces deprecated 3.1)
    LLAMA_8B: 'llama-3.1-8b-instant',         // Ultra-fast
    MIXTRAL: 'mixtral-8x7b-32768',            // Long context
    GEMMA: 'gemma2-9b-it'                     // Good balance
};

export class AIProvider {
    constructor(config = {}) {
        this.groqApiKey = config.groqApiKey || null;
        this.model = config.model || GROQ_MODELS.LLAMA_70B;
        this.maxTokens = config.maxTokens || 300;
        this.temperature = config.temperature || 0.7;

        // Rate limiting
        this.requestQueue = [];
        this.lastRequestTime = 0;
        this.minRequestInterval = 2000; // 2 seconds between requests (30/min limit)
    }

    /**
     * Set API key
     */
    setApiKey(apiKey) {
        this.groqApiKey = apiKey;
    }

    /**
     * Build system prompt with user context
     */
    buildSystemPrompt(userContext) {
        const ctx = userContext || {};

        return `You are the InternPath Voice Assistant - a friendly AI mentor helping students prepare for tech internships.

## Your Personality:
- Warm, encouraging, like a helpful senior friend
- Speaks NATURALLY - actual conversation, not a script
- Uses casual language (it's, you're, gonna, wanna)
- Shows genuine enthusiasm about tech
- Patient and supportive when users struggle

## Current User:
- Name: ${ctx.name || 'there'}
- Goal: ${ctx.goal || 'tech'} Developer
- Current Streak: ${ctx.streak || 0} days
- Completed: ${ctx.completedSkills || 0}/${ctx.totalSkills || 0} skills
${ctx.recentSkill ? `- Recently learned: ${ctx.recentSkill}` : ''}

## Response Rules:
1. Keep it SHORT - 2-4 sentences for simple questions
2. Sound NATURAL - like talking to a friend
3. Use their NAME sometimes
4. Reference their GOAL when giving advice
5. Be ENCOURAGING
6. NO bullet points or formal structure
7. NO "As an AI" phrases
8. NEVER mention you're an AI or have limitations

## Good Response Example:
"Hey ${ctx.name || 'there'}! Looking at your progress, you've been doing great. I'd suggest trying React Hooks next - it's basically how modern React works and once you get it, everything clicks. Want me to explain what hooks do?"

## Remember:
- You're having a VOICE conversation, so keep responses speakable
- Avoid long lists, code blocks, or technical jargon unless asked
- Be conversational and friendly!`;
    }

    /**
     * Get AI response from Groq
     */
    async getResponse(userMessage, userContext, conversationHistory = []) {
        if (!this.groqApiKey) {
            throw new Error('Groq API key not set. Please provide your API key.');
        }

        // Rate limiting
        await this._waitForRateLimit();

        const systemPrompt = this.buildSystemPrompt(userContext);

        const messages = [
            { role: 'system', content: systemPrompt },
            ...conversationHistory.slice(-10), // Keep last 10 messages for context
            { role: 'user', content: userMessage }
        ];

        try {
            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.groqApiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: messages,
                    max_tokens: this.maxTokens,
                    temperature: this.temperature,
                    stream: false
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                if (response.status === 401) {
                    throw new Error('Invalid API key. Please check your Groq API key.');
                } else if (response.status === 429) {
                    throw new Error('Rate limit exceeded. Please wait a moment and try again.');
                } else if (response.status === 503) {
                    throw new Error('Groq service is temporarily unavailable. Please try again.');
                }

                throw new Error(errorData.error?.message || `API error: ${response.status}`);
            }

            const data = await response.json();

            if (!data.choices || !data.choices[0]) {
                throw new Error('Invalid response from AI');
            }

            this.lastRequestTime = Date.now();

            return data.choices[0].message.content;

        } catch (error) {
            console.error('AI Provider Error:', error);
            throw error;
        }
    }

    /**
     * Wait for rate limit
     */
    async _waitForRateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;

        if (timeSinceLastRequest < this.minRequestInterval) {
            const waitTime = this.minRequestInterval - timeSinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }

    /**
     * Validate API key by making a test request
     */
    async validateApiKey(apiKey) {
        const testKey = apiKey || this.groqApiKey;

        if (!testKey) {
            return { valid: false, error: 'No API key provided' };
        }

        try {
            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${testKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [{ role: 'user', content: 'Hi' }],
                    max_tokens: 5
                })
            });

            if (response.ok) {
                return { valid: true };
            } else if (response.status === 401) {
                return { valid: false, error: 'Invalid API key' };
            } else {
                return { valid: false, error: `API error: ${response.status}` };
            }
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }

    /**
     * Set model
     */
    setModel(model) {
        if (Object.values(GROQ_MODELS).includes(model)) {
            this.model = model;
        } else {
            console.warn('Unknown model, using default');
        }
    }
}

export default AIProvider;
