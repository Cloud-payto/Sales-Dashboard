// Chat Types for Claude AI Integration

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  context?: ChatContext;
}

export interface ChatResponse {
  success: boolean;
  message?: string;
  error?: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface ChatContext {
  currentPage?: string;
  selectedAccount?: string;
  selectedRoute?: string;
  filters?: Record<string, unknown>;
  summary?: Record<string, unknown>;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}
