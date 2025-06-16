import express from 'express';
import { logger } from '../utils/logger';

const router = express.Router();

// 샘플 프롬프트 데이터
const samplePrompts = [
  {
    id: 1,
    title: "코딩 도우미",
    description: "프로그래밍 문제를 해결해주는 AI",
    prompt: "당신은 숙련된 프로그래머입니다. 사용자의 코딩 질문에 친절하고 정확하게 답변해주세요.",
    role: "system",
    tags: ["코딩", "프로그래밍", "개발"],
    created_at: "2024-01-15",
    updated_at: "2024-01-15"
  },
  {
    id: 2,
    title: "번역가",
    description: "다양한 언어를 번역해주는 AI",
    prompt: "다음 텍스트를 한국어로 번역해주세요: ",
    role: "user",
    tags: ["번역", "언어", "다국어"],
    created_at: "2024-01-14",
    updated_at: "2024-01-14"
  },
  {
    id: 3,
    title: "창작 도우미",
    description: "창의적인 글쓰기를 도와주는 AI",
    prompt: "당신은 창의적인 작가입니다. 사용자가 제시한 주제로 흥미로운 이야기를 만들어주세요.",
    role: "system",
    tags: ["창작", "글쓰기", "스토리"],
    created_at: "2024-01-13",
    updated_at: "2024-01-13"
  },
  {
    id: 4,
    title: "수학 선생님",
    description: "수학 문제를 쉽게 설명해주는 AI",
    prompt: "다음 수학 문제의 풀이 과정을 단계별로 설명해주세요:",
    role: "user",
    tags: ["수학", "교육", "문제해결"],
    created_at: "2024-01-12",
    updated_at: "2024-01-12"
  },
  {
    id: 5,
    title: "요리 레시피",
    description: "맛있는 요리 레시피를 추천해주는 AI",
    prompt: "간단하고 맛있는 요리 레시피를 추천해주세요. 재료와 조리법을 자세히 알려주세요.",
    role: "user",
    tags: ["요리", "레시피", "음식"],
    created_at: "2024-01-11",
    updated_at: "2024-01-11"
  },
  {
    id: 6,
    title: "마케팅 전문가",
    description: "마케팅 전략을 제안해주는 AI",
    prompt: "당신은 10년 경력의 마케팅 전문가입니다. 효과적인 마케팅 전략을 제안해주세요.",
    role: "system",
    tags: ["마케팅", "비즈니스", "전략"],
    created_at: "2024-01-10",
    updated_at: "2024-01-10"
  },
  {
    id: 7,
    title: "영어 회화 연습",
    description: "영어 회화 실력을 향상시켜주는 AI",
    prompt: "영어로 자연스러운 대화를 나누며 실력을 향상시켜주세요. 문법 오류가 있으면 친절하게 교정해주세요.",
    role: "user",
    tags: ["영어", "회화", "교육"],
    created_at: "2024-01-09",
    updated_at: "2024-01-09"
  },
  {
    id: 8,
    title: "디자인 컨설턴트",
    description: "UI/UX 디자인 조언을 해주는 AI",
    prompt: "당신은 전문 UI/UX 디자이너입니다. 사용자 경험을 고려한 디자인 조언을 해주세요.",
    role: "system",
    tags: ["디자인", "UI", "UX"],
    created_at: "2024-01-08",
    updated_at: "2024-01-08"
  }
];

/**
 * @swagger
 * /prompts:
 *   get:
 *     summary: 프롬프트 목록 조회
 *     responses:
 *       200:
 *         description: 성공
 */
router.get('/', (req, res) => {
  try {
    logger.info('프롬프트 목록 조회 요청');
    
    res.json({
      success: true,
      data: samplePrompts,
      total: samplePrompts.length
    });
  } catch (error) {
    logger.error('프롬프트 목록 조회 실패', error as Error);
    res.status(500).json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * @swagger
 * /prompts:
 *   post:
 *     summary: 새 프롬프트 등록
 *     responses:
 *       201:
 *         description: 성공
 */
router.post('/', (req, res) => {
  try {
    const { title, description, prompt, role, tags } = req.body;
    
    logger.info('새 프롬프트 등록 요청', { 
      context: { title, role } 
    });
    
    const newPrompt = {
      id: samplePrompts.length + 1,
      title,
      description,
      prompt,
      role,
      tags,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    samplePrompts.push(newPrompt);
    
    res.status(201).json({
      success: true,
      data: newPrompt
    });
  } catch (error) {
    logger.error('프롬프트 등록 실패', error as Error);
    res.status(500).json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    });
  }
});

export default router; 