/**
 * 🎯 API 타입 정의
 * 
 * 프론트엔드와 백엔드 간의 데이터 구조를 정의하여
 * 타입 안전성을 보장하고 개발 경험을 개선합니다.
 * 
 * @version 3.1.0
 * @since 2025-06-16
 */

// 기본 API 응답 구조
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
}

// AI 모델 정보
export interface AIModel {
  id: number;
  name: string;
  description: string;
  modality: string;
  pricing_tier: 'free' | 'standard' | 'premium';
  performance_score: number;
  provider_name: string;
  provider_company: string;
  provider_website?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// AI 추천 결과
export interface RecommendationResult {
  recommendations: AIModel[];
  match_reason: string;
  confidence: number;
  matched_keywords: string[];
}

// 대화형 질문 구조
export interface Question {
  step: number;
  question: string;
  options: QuestionOption[];
}

export interface QuestionOption {
  value: string;
  label: string;
}

// 질문 응답 데이터
export interface QuestionResponse {
  current_question: Question;
  total_steps: number;
  progress: number;
  completed?: boolean;
  message?: string;
}

// 채팅 메시지
export interface ChatMessage {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

// 프롬프트 템플릿
export interface PromptTemplate {
  id: number;
  title: string;
  description: string;
  template_content: string;
  system_role?: string;
  category_name: string;
  tag_names: string[];
  difficulty_level: 'easy' | 'medium' | 'hard';
  usage_count: number;
  view_count: number;
  is_featured: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

// 카테고리
export interface Category {
  id: number;
  name: string;
  description: string;
  sort_order: number;
  is_active: boolean;
}

// 태그
export interface Tag {
  id: number;
  name: string;
  description?: string;
  usage_count: number;
  created_at: string;
}

// 추천 요청
export interface RecommendRequest {
  requirements?: string;
  keywords: string[];
}

// 질문 요청
export interface QuestionRequest {
  initial_input?: string;
  step: number;
}

// 에러 타입
export interface ApiError {
  success: false;
  error: string;
  details?: any;
  timestamp: string;
}

// 로딩 상태
export interface LoadingState {
  isLoading: boolean;
  operation?: string;
}

// 피드백
export interface Feedback {
  rating: number;
  comment?: string;
  accuracy_rating?: number;
  usefulness_rating?: number;
  ease_of_use_rating?: number;
  session_uuid?: string;
}

// 사용자 설정
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'ko' | 'en';
  defaultComplexity: 'simple' | 'medium' | 'complex';
  defaultPriority: 'cost' | 'performance' | 'balanced';
}

// 검색 필터
export interface SearchFilters {
  category?: string;
  tags?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  featured?: boolean;
  sortBy?: 'newest' | 'popular' | 'rating';
}

// 페이지네이션
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// 검색 결과
export interface SearchResult<T> {
  items: T[];
  pagination: Pagination;
  filters: SearchFilters;
}

// 실시간 알림
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  duration?: number;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

// 성능 메트릭
export interface PerformanceMetric {
  apiResponseTime: number;
  renderTime: number;
  cacheHitRate: number;
  errorRate: number;
}

// 사용자 활동 추적
export interface UserActivity {
  sessionId: string;
  userId?: string;
  action: string;
  data?: any;
  timestamp: Date;
  userAgent: string;
  ipAddress?: string;
} 