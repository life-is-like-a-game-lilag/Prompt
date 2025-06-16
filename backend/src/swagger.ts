import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '프롬프트 작성기 API',
      version: '1.0.0',
      description: '원하는 목적에 맞는 AI 모델과 프롬프트 템플릿을 추천해주는 API',
      contact: {
        name: 'API Support',
        email: 'support@prompt-maker.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        PromptTemplate: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: '템플릿 ID' },
            title: { type: 'string', description: '제목' },
            description: { type: 'string', description: '설명' },
            template_content: { type: 'string', description: '템플릿 내용' },
            system_role: { type: 'string', description: '시스템 역할' },
            category_name: { type: 'string', description: '카테고리명' },
            tag_names: { type: 'array', items: { type: 'string' }, description: '태그 목록' },
            difficulty_level: { type: 'string', enum: ['easy', 'medium', 'hard'], description: '난이도' },
            usage_count: { type: 'integer', description: '사용 횟수' },
            view_count: { type: 'integer', description: '조회수' },
            is_featured: { type: 'boolean', description: '추천 여부' },
            is_public: { type: 'boolean', description: '공개 여부' },
            created_at: { type: 'string', format: 'date-time', description: '생성일' },
            updated_at: { type: 'string', format: 'date-time', description: '수정일' }
          }
        },
        AIModel: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: '모델 ID' },
            name: { type: 'string', description: '모델명' },
            description: { type: 'string', description: '설명' },
            modality: { type: 'string', description: '모달리티 (text, image, multimodal)' },
            pricing_tier: { type: 'string', description: '가격 티어' },
            performance_score: { type: 'integer', description: '성능 점수 (1-10)' },
            provider_name: { type: 'string', description: '제공업체명' },
            provider_company: { type: 'string', description: '회사명' },
            is_active: { type: 'boolean', description: '활성화 여부' }
          }
        },
        Recommendation: {
          type: 'object',
          properties: {
            recommendations: { type: 'array', items: { $ref: '#/components/schemas/AIModel' } },
            match_reason: { type: 'string', description: '추천 이유' },
            confidence: { type: 'integer', description: '신뢰도 (0-100)' },
            matched_keywords: { type: 'array', items: { type: 'string' } }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', description: '성공 여부' },
            data: { type: 'object', description: '응답 데이터' },
            message: { type: 'string', description: '메시지' },
            error: { type: 'string', description: '오류 메시지' }
          }
        },
        Feedback: {
          type: 'object',
          properties: {
            rating: { type: 'integer', minimum: 1, maximum: 5, description: '전체 평점' },
            comment: { type: 'string', description: '코멘트' },
            accuracy_rating: { type: 'integer', minimum: 1, maximum: 5, description: '정확도 평점' },
            usefulness_rating: { type: 'integer', minimum: 1, maximum: 5, description: '유용성 평점' },
            ease_of_use_rating: { type: 'integer', minimum: 1, maximum: 5, description: '사용 편의성 평점' },
            session_uuid: { type: 'string', description: '세션 UUID' }
          },
          required: ['rating']
        }
      }
    }
  },
  apis: ['./src/*.ts'], // TypeScript 파일들에서 주석을 읽어옴
};

const specs = swaggerJSDoc(options);

export function setupSwagger(app: Express): void {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: '프롬프트 작성기 API 문서'
  }));
  
  // JSON 형태로도 제공
  app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
  
  console.log('📚 Swagger documentation available at http://localhost:4000/api-docs');
} 