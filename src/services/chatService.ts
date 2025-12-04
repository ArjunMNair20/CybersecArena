// Use proxy in development, or full URL in production
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'http://localhost:3001');

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface ChatResponse {
  response: string;
  sessionId: string;
}

class ChatService {
  private sessionId: string;

  constructor() {
    // Generate a unique session ID for this user session
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  async sendMessage(message: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          sessionId: this.sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatResponse = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to get response from AI. Please make sure the backend server is running.');
    }
  }

  async clearHistory(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/api/chat/clear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
        }),
      });
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      const data = await response.json();
      return data.status === 'ok';
    } catch (error) {
      return false;
    }
  }

  getSessionId(): string {
    return this.sessionId;
  }
}

export default new ChatService();

