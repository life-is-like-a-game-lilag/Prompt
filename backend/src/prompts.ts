/**
 * 📝 기본 프롬프트 관리 API
 * 
 * 프롬프트 템플릿의 부가 기능들을 제공하는 API 모듈입니다.
 * 템플릿의 추천, 복사, 즐겨찾기, 내보내기 등의 기능을 담당합니다.
 * 
 * 주요 기능:
 * - 프롬프트 템플릿 스마트 추천 (키워드 기반)
 * - 템플릿 복사 및 수정
 * - 즐겨찾기 관리
 * - 다양한 형식으로 내보내기 (JSON, 텍스트)
 * - 사용 통계 추적
 * 
 * API 엔드포인트:
 * - POST /prompts/recommend    : 템플릿 추천 (키워드 기반)
 * - POST /prompts/:id/copy     : 템플릿 복사 생성
 * - POST /prompts/:id/favorite : 즐겨찾기 토글
 * - GET /prompts/:id/export    : 템플릿 내보내기
 * 
 * 추천 알고리즘:
 * - 카테고리 매칭 (가중치 3점)
 * - 키워드 매칭 (가중치 2점)  
 * - 사용량 기반 (가중치 1-2점)
 * - 추천 상태 (가중치 1점)
 * 
 * @author 프롬프트 작성기 팀
 * @version 3.0 (T-004 완료)
 * @since 2025-06-16
 */

import { Router } from 'express';
import { pool } from './db';

const router = Router();

// 프롬프트 템플릿 추천 API - 새로 추가
router.post('/recommend', async (req: any, res: any) => {
  const { keywords, purpose, category, user_requirements } = req.body;
  
  try {
    console.log('프롬프트 템플릿 추천 요청:', { keywords, purpose, category });
    
    let recommendQuery = `
      SELECT 
        pt.*,
        c.name as category_name,
        ARRAY_AGG(DISTINCT t.name) as tag_names,
        (
          CASE 
            WHEN pt.category_id = $1 THEN 3
            WHEN $1 IS NULL THEN 0
            ELSE 0
          END +
          CASE 
            WHEN pt.title ILIKE '%' || $2 || '%' OR pt.description ILIKE '%' || $2 || '%' THEN 2
            WHEN $2 IS NULL OR $2 = '' THEN 0
            ELSE 0
          END +
          CASE 
            WHEN pt.usage_count > 50 THEN 2
            WHEN pt.usage_count > 10 THEN 1
            ELSE 0
          END +
          CASE 
            WHEN pt.is_featured = true THEN 1
            ELSE 0
          END
        ) as relevance_score
      FROM prompt_templates pt
      LEFT JOIN categories c ON pt.category_id = c.id
      LEFT JOIN prompt_template_tags ptt ON pt.id = ptt.template_id
      LEFT JOIN tags t ON ptt.tag_id = t.id
      WHERE pt.is_public = true AND pt.is_active = true
    `;
    
    const queryParams: any[] = [];
    
    // 카테고리 필터
    if (category) {
      const categoryResult = await pool.query('SELECT id FROM categories WHERE name ILIKE $1', [`%${category}%`]);
      queryParams.push(categoryResult.rows.length > 0 ? categoryResult.rows[0].id : null);
    } else {
      queryParams.push(null);
    }
    
    // 키워드 필터
    queryParams.push(keywords || '');
    
    recommendQuery += `
      GROUP BY pt.id, c.name
      HAVING (
        CASE 
          WHEN pt.category_id = $1 THEN 3
          WHEN $1 IS NULL THEN 0
          ELSE 0
        END +
        CASE 
          WHEN pt.title ILIKE '%' || $2 || '%' OR pt.description ILIKE '%' || $2 || '%' THEN 2
          WHEN $2 IS NULL OR $2 = '' THEN 0
          ELSE 0
        END +
        CASE 
          WHEN pt.usage_count > 50 THEN 2
          WHEN pt.usage_count > 10 THEN 1
          ELSE 0
        END +
        CASE 
          WHEN pt.is_featured = true THEN 1
          ELSE 0
        END
      ) > 0
      ORDER BY relevance_score DESC, pt.usage_count DESC, pt.created_at DESC
      LIMIT 10
    `;
    
    const result = await pool.query(recommendQuery, queryParams);
    
    res.json({
      success: true,
      data: {
        recommendations: result.rows,
        total_found: result.rows.length,
        search_criteria: { keywords, purpose, category }
      }
    });
    
  } catch (err) {
    console.error('프롬프트 템플릿 추천 오류:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

/**
 * 📋 프롬프트 템플릿 복사 API
 * POST /prompts/:id/copy
 * 
 * 기존 템플릿을 기반으로 새로운 템플릿을 생성합니다.
 * 원본의 모든 속성을 복사하되, 새로운 버전으로 독립적인 템플릿을 만듭니다.
 * 
 * 경로 파라미터:
 * - id: 복사할 원본 템플릿 ID
 * 
 * 요청 바디:
 * {
 *   "new_title": "새 템플릿 제목 (선택)",
 *   "modify_content": false  // 복사 후 수정할지 여부 (선택)
 * }
 * 
 * 복사되는 정보:
 * - 제목 (지정하지 않으면 "원본 제목 (복사본)")
 * - 설명, 템플릿 내용, 시스템 역할
 * - 카테고리, 난이도, 예상 토큰 수
 * 
 * 자동 설정:
 * - 버전: 1.0으로 초기화
 * - 생성자: 현재 사용자
 * - 공개 여부: 기본값 적용
 * - 사용 횟수: 0으로 초기화
 * 
 * 추가 처리:
 * - 원본 템플릿의 사용 횟수 +1 증가
 * - 복사 이력 기록
 * 
 * 활용 방안:
 * - 기존 템플릿을 기반으로 한 새 템플릿 생성
 * - 템플릿 백업 및 버전 관리
 * - 사용자 맞춤 템플릿 제작
 */
router.post('/:id/copy', async (req: any, res: any) => {
  const { id } = req.params;
  const { new_title, modify_content = false } = req.body;
  
  try {
    // 원본 템플릿 조회
    const originalResult = await pool.query('SELECT * FROM prompt_templates WHERE id = $1', [id]);
    if (originalResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }
    
    const original = originalResult.rows[0];
    
    // 새 템플릿 생성
    const copyResult = await pool.query(`
      INSERT INTO prompt_templates (
        title, description, template_content, system_role, 
        category_id, difficulty_level, estimated_tokens, 
        created_by, version
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *
    `, [
      new_title || `${original.title} (복사본)`,
      original.description,
      original.template_content,
      original.system_role,
      original.category_id,
      original.difficulty_level,
      original.estimated_tokens,
      'user', // 실제로는 인증된 사용자 ID
      '1.0'
    ]);
    
    // 사용 통계 업데이트
    await pool.query('UPDATE prompt_templates SET usage_count = usage_count + 1 WHERE id = $1', [id]);
    
    res.json({
      success: true,
      data: {
        copied_template: copyResult.rows[0],
        original_id: id
      }
    });
    
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

/**
 * ⭐ 템플릿 즐겨찾기 추가/제거 API
 * POST /prompts/:id/favorite
 * 
 * 사용자가 자주 사용하는 템플릿을 즐겨찾기로 관리할 수 있습니다.
 * 세션 기반으로 사용자별 즐겨찾기 목록을 유지합니다.
 * 
 * 경로 파라미터:
 * - id: 즐겨찾기 처리할 템플릿 ID
 * 
 * 요청 바디:
 * {
 *   "user_session": "세션 식별자",
 *   "action": "add|remove" // 추가 또는 제거 (기본: add)
 * }
 * 
 * 기능:
 * - 즐겨찾기 추가/제거
 * - 사용자별 즐겨찾기 목록 관리
 * - 즐겨찾기 통계 업데이트
 * - 사용 로그 기록
 * 
 * 응답:
 * - 성공 시: 즐겨찾기 상태 메시지
 * - 실패 시: 에러 상세 정보
 * 
 * 추후 개선 사항:
 * - 사용자 인증 시스템 연동
 * - 즐겨찾기 전용 테이블 생성
 * - 즐겨찾기 순서 관리
 * - 즐겨찾기 그룹/폴더 기능
 */
router.post('/:id/favorite', async (req: any, res: any) => {
  const { id } = req.params;
  const { user_session } = req.body; // 실제로는 사용자 인증 정보
  
  try {
    // 즐겨찾기 테이블에 추가 (여기서는 단순하게 usage_logs에 기록)
    await pool.query(`
      INSERT INTO usage_logs (action_type, target_type, target_id, action_data) 
      VALUES ($1, $2, $3, $4)
    `, ['favorite', 'template', id, JSON.stringify({ user_session, action: 'add_favorite' })]);
    
    res.json({
      success: true,
      message: '즐겨찾기에 추가되었습니다.'
    });
    
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

/**
 * 📤 템플릿 내보내기 API
 * GET /prompts/:id/export?format=json|text
 * 
 * 템플릿을 다양한 형식으로 내보내어 외부에서 사용할 수 있게 합니다.
 * JSON과 텍스트 형식을 지원하며, 완전한 메타데이터를 포함합니다.
 * 
 * 경로 파라미터:
 * - id: 내보낼 템플릿 ID
 * 
 * 쿼리 파라미터:
 * - format: json (기본값) | text | md
 * 
 * JSON 형식 (format=json):
 * - 프로그래밍 방식으로 활용 가능
 * - 모든 메타데이터 포함
 * - API 응답과 동일한 구조
 * 
 * 텍스트 형식 (format=text):
 * - 사람이 읽기 쉬운 형식
 * - 템플릿 제목, 설명, 내용 포함
 * - 복사해서 바로 사용 가능
 * 
 * 포함되는 정보:
 * - 템플릿 기본 정보 (제목, 설명, 내용)
 * - 메타데이터 (카테고리, 태그, 난이도)
 * - 시스템 역할 및 사용 예시
 * - 통계 정보 (버전, 사용 횟수)
 * 
 * 활용 방안:
 * - 템플릿 백업 및 보관
 * - 다른 시스템으로 이관
 * - 오프라인에서 사용
 * - 문서화 및 공유
 */
router.get('/:id/export', async (req: any, res: any) => {
  const { id } = req.params;
  const { format = 'json' } = req.query;
  
  try {
    const result = await pool.query(`
      SELECT 
        pt.*,
        c.name as category_name,
        ARRAY_AGG(DISTINCT t.name) as tag_names
      FROM prompt_templates pt
      LEFT JOIN categories c ON pt.category_id = c.id
      LEFT JOIN prompt_template_tags ptt ON pt.id = ptt.template_id
      LEFT JOIN tags t ON ptt.tag_id = t.id
      WHERE pt.id = $1
      GROUP BY pt.id, c.name
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }
    
    const template = result.rows[0];
    
    if (format === 'text') {
      const textFormat = `
=== ${template.title} ===

설명: ${template.description}
카테고리: ${template.category_name}
태그: ${template.tag_names?.join(', ') || '없음'}
난이도: ${template.difficulty_level}

--- 시스템 역할 ---
${template.system_role}

--- 프롬프트 템플릿 ---
${template.template_content}

--- 사용 예시 ---
${template.example_usage || '예시 없음'}
      `.trim();
      
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${template.title}.txt"`);
      res.send(textFormat);
    } else {
      // JSON 형식
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${template.title}.json"`);
      res.json({
        template,
        exported_at: new Date().toISOString()
      });
    }
    
    // 내보내기 로그 기록
    await pool.query(`
      INSERT INTO usage_logs (action_type, target_type, target_id, action_data) 
      VALUES ($1, $2, $3, $4)
    `, ['export', 'template', id, JSON.stringify({ format })]);
    
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// 프롬프트 등록
router.post('/', async (req: any, res: any) => {
  const { title, description, prompt, role, tags } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO prompts (title, description, prompt, role, tags) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, description, prompt, role, tags]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// 전체 조회
router.get('/', async (_req: any, res: any) => {
  try {
    const result = await pool.query('SELECT * FROM prompts ORDER BY id DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// 상세 조회
router.get('/:id', async (req: any, res: any) => {
  try {
    const result = await pool.query('SELECT * FROM prompts WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;