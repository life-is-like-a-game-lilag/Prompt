// API 응답 구조 표준화를 위한 타입 정의

export interface StandardApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  timestamp: string;
  status_code?: number;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    version?: string;
  };
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  timestamp: string;
  status_code: number;
  details?: any;
}

// 특정 API 응답 타입
export interface QuestionResponse {
  current_question: {
    step: number;
    question: string;
    options: Array<{
      value: string;
      label: string;
    }>;
  };
  total_steps: number;
  progress: number;
}

export interface CompletedResponse {
  completed: true;
  message: string;
}

export interface AIRecommendationResponse {
  recommendations: Array<{
    id: number;
    name: string;
    provider_company: string;
    description: string;
    pricing_tier: string;
    performance_score: number;
  }>;
  match_reason: string;
  confidence: number;
  matched_keywords: string[];
}

export interface HealthCheckResponse {
  status: 'OK' | 'ERROR';
  uptime: number;
  memory_usage?: {
    used: number;
    free: number;
    total: number;
  };
  environment: string;
} 