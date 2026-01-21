/**
 * Conversation Manager Module
 * Manages chat history for multi-turn conversations
 */

export class ConversationManager {
    constructor(options = {}) {
        this.maxHistory = options.maxHistory || 10;
        this.history = [];
        this.metadata = {
            startTime: null,
            messageCount: 0,
            lastActivity: null
        };
    }

    /**
     * Add a message to the conversation history
     * @param {string} role - 'user' or 'assistant'
     * @param {string} content - Message content
     */
    addMessage(role, content) {
        if (!['user', 'assistant', 'system'].includes(role)) {
            console.warn('Invalid role:', role);
            return;
        }

        if (!content || typeof content !== 'string') {
            console.warn('Invalid content');
            return;
        }

        const message = {
            role: role,
            content: content.trim(),
            timestamp: Date.now()
        };

        this.history.push(message);

        // Update metadata
        if (!this.metadata.startTime) {
            this.metadata.startTime = message.timestamp;
        }
        this.metadata.messageCount++;
        this.metadata.lastActivity = message.timestamp;

        // Trim history if exceeds max
        if (this.history.length > this.maxHistory) {
            this.history = this.history.slice(-this.maxHistory);
        }
    }

    /**
     * Add user message
     */
    addUserMessage(content) {
        this.addMessage('user', content);
    }

    /**
     * Add assistant message
     */
    addAssistantMessage(content) {
        this.addMessage('assistant', content);
    }

    /**
     * Get conversation history for API calls
     * Returns only role and content (without timestamps)
     */
    getHistory() {
        return this.history.map(msg => ({
            role: msg.role,
            content: msg.content
        }));
    }

    /**
     * Get full history with metadata
     */
    getFullHistory() {
        return [...this.history];
    }

    /**
     * Get last N messages
     */
    getLastMessages(n = 5) {
        return this.history.slice(-n).map(msg => ({
            role: msg.role,
            content: msg.content
        }));
    }

    /**
     * Get last user message
     */
    getLastUserMessage() {
        for (let i = this.history.length - 1; i >= 0; i--) {
            if (this.history[i].role === 'user') {
                return this.history[i].content;
            }
        }
        return null;
    }

    /**
     * Get last assistant message
     */
    getLastAssistantMessage() {
        for (let i = this.history.length - 1; i >= 0; i--) {
            if (this.history[i].role === 'assistant') {
                return this.history[i].content;
            }
        }
        return null;
    }

    /**
     * Clear conversation history
     */
    clear() {
        this.history = [];
        this.metadata = {
            startTime: null,
            messageCount: 0,
            lastActivity: null
        };
    }

    /**
     * Get message count
     */
    getMessageCount() {
        return this.history.length;
    }

    /**
     * Check if conversation is empty
     */
    isEmpty() {
        return this.history.length === 0;
    }

    /**
     * Get conversation duration in milliseconds
     */
    getDuration() {
        if (!this.metadata.startTime) return 0;
        return (this.metadata.lastActivity || Date.now()) - this.metadata.startTime;
    }

    /**
     * Export conversation as JSON
     */
    export() {
        return {
            history: this.getFullHistory(),
            metadata: { ...this.metadata }
        };
    }

    /**
     * Import conversation from JSON
     */
    import(data) {
        if (data.history && Array.isArray(data.history)) {
            this.history = data.history;
        }
        if (data.metadata) {
            this.metadata = { ...this.metadata, ...data.metadata };
        }
    }

    /**
     * Get summary of conversation for context
     */
    getSummary() {
        const userMessages = this.history.filter(m => m.role === 'user');
        const topics = userMessages.map(m => m.content).join(' ').slice(0, 200);

        return {
            messageCount: this.history.length,
            duration: this.getDuration(),
            topics: topics
        };
    }
}

export default ConversationManager;
