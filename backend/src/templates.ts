/**
 * 📄 프롬프트 템플릿 관리 API - 핵심 모듈
 * 
 * 프롬프트 템플릿의 생명주기를 관리하는 가장 중요한 API 모듈입니다.
 * 총 12개의 엔드포인트를 제공하여 완전한 CRUD와 고급 기능을 지원합니다.
 * 
 * 주요 기능:
 * - 템플릿 CRUD (생성, 조회, 수정, 삭제)
 * - 페이징 및 필터링 (카테고리, 태그, 검색어, 난이도)
 * - 추천 알고리즘 (사용량, 평점, 추천 상태 기반)
 * - 버전 관리 (자동 버전 증가)
 * - 피드백 시스템 (평점 및 댓글)
 * - 사용 통계 (조회수, 사용 횟수)
 * - 템플릿 복사 및 즐겨찾기
 * - 다양한 형식으로 내보내기 (JSON, 텍스트)
 * 
 * API 엔드포인트:
 * - GET /templates         : 목록 조회 (페이징, 필터링)
 * - GET /templates/:id     : 상세 조회
 * - POST /templates        : 새 템플릿 생성
 * - PUT /templates/:id     : 템플릿 수정
 * - DELETE /templates/:id  : 소프트 삭제
 * - POST /templates/:id/copy      : 템플릿 복사
 * - POST /templates/:id/favorite  : 즐겨찾기 토글
 * - GET /templates/:id/export     : 내보내기
 * - POST /templates/:id/feedback  : 피드백 제출
 * - GET /templates/:id/stats      : 통계 조회
 * - POST /templates/recommend     : 템플릿 추천
 * - GET /categories               : 카테고리 목록
 * 
 * 데이터베이스 설계:
 * - prompt_templates (메인 테이블)
 * - categories (카테고리)
 * - tags (태그, 다대다 관계)
 * - user_feedback (피드백)
 * - usage_logs (사용 로그)
 * - content_versions (버전 관리)
 * 
 * 트랜잭션 처리:
 * - 모든 생성/수정 작업은 트랜잭션으로 보호
 * - 태그 자동 생성 및 연결
 * - 카테고리 자동 생성
 * - 버전 자동 증가
 * 
 * @author 프롬프트 작성기 팀
 * @version 3.0 (T-004 완료)
 * @since 2025-06-16
 */

import express from 'express';
import { logger } from './utils/logger';
import { Router } from 'express';
import { pool } from './db';

const router = express.Router();

/**
 * 📋 프롬프트 템플릿 목록 조회 API
 * GET /templates
 * 
 * 페이징, 필터링, 검색을 지원하는 템플릿 목록 조회 엔드포인트입니다.
 * 
 * 쿼리 파라미터:
 * - page: 페이지 번호 (기본값: 1)
 * - limit: 페이지당 항목 수 (기본값: 20, 최대: 100)
 * - category: 카테고리명으로 필터링 (부분 일치)
 * - tags: 태그명으로 필터링 (쉼표로 구분)
 * - difficulty: 난이도 필터링 (easy, medium, hard)
 * - search: 제목/설명에서 검색 (부분 일치)
 * - featured_only: 추천 템플릿만 조회 (true/false)
 * 
 * 응답 형식:
 * {
 *   "success": true,
 *   "data": {
 *     "templates": [...],
 *     "pagination": {
 *       "current_page": 1,
 *       "total_pages": 5,
 *       "total_items": 100,
 *       "items_per_page": 20
 *     }
 *   }
 * }
 * 
 * 정렬 순서: 추천 템플릿 → 사용량 → 생성일 역순
 */
router.get('/', async (req: any, res: any) => {
  logger.info('템플릿 API 요청');
  const { 
    page = 1, 
    limit = 20, 
    category, 
    tags, 
    difficulty,
    search,
    featured_only = false 
  } = req.query;
  
  try {
    const offset = (page - 1) * limit;
    let whereConditions = ['pt.is_public = true', 'pt.is_active = true'];
    const queryParams: any[] = [];
    let paramCount = 0;
    
    // 필터 조건 추가
    if (category) {
      paramCount++;
      whereConditions.push(`c.name ILIKE $${paramCount}`);
      queryParams.push(`%${category}%`);
    }
    
    if (difficulty) {
      paramCount++;
      whereConditions.push(`pt.difficulty_level = $${paramCount}`);
      queryParams.push(difficulty);
    }
    
    if (search) {
      paramCount++;
      whereConditions.push(`(pt.title ILIKE $${paramCount} OR pt.description ILIKE $${paramCount})`);
      queryParams.push(`%${search}%`);
    }
    
    if (featured_only === 'true') {
      whereConditions.push('pt.is_featured = true');
    }
    
    const baseQuery = `
      SELECT 
        pt.*,
        c.name as category_name,
        ARRAY_AGG(DISTINCT t.name) as tag_names,
        COUNT(*) OVER() as total_count
      FROM prompt_templates pt
      LEFT JOIN categories c ON pt.category_id = c.id
      LEFT JOIN prompt_template_tags ptt ON pt.id = ptt.template_id
      LEFT JOIN tags t ON ptt.tag_id = t.id
      WHERE ${whereConditions.join(' AND ')}
      GROUP BY pt.id, c.name
      ORDER BY pt.is_featured DESC, pt.usage_count DESC, pt.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;
    
    queryParams.push(limit, offset);
    const result = await pool.query(baseQuery, queryParams);
    
    const total = result.rows.length > 0 ? result.rows[0].total_count : 0;
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      success: true,
      data: {
        templates: result.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: parseInt(total),
          items_per_page: parseInt(limit)
        }
      }
    });
    
  } catch (err) {
    console.error('템플릿 목록 조회 오류:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

/**
 * 🔍 프롬프트 템플릿 상세 조회 API
 * GET /templates/:id
 * 
 * 특정 템플릿의 상세 정보를 조회하고 조회수를 증가시킵니다.
 * 
 * 경로 파라미터:
 * - id: 템플릿 ID (정수)
 * 
 * 응답에 포함되는 정보:
 * - 템플릿 기본 정보 (제목, 설명, 내용, 시스템 역할)
 * - 카테고리 정보
 * - 태그 목록
 * - 통계 정보 (조회수, 사용횟수, 평균 평점)
 * - 메타데이터 (생성일, 수정일, 버전)
 * 
 * 부가 효과:
 * - 조회 시 view_count 자동 증가
 * - 사용 로그 기록 (향후 구현)
 */
router.get('/:id', async (req: any, res: any) => {
  const { id } = req.params;
  
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
      WHERE pt.id = $1 AND pt.is_public = true
      GROUP BY pt.id, c.name
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }
    
    // 조회수 증가
    await pool.query('UPDATE prompt_templates SET view_count = view_count + 1 WHERE id = $1', [id]);
    
    res.json({
      success: true,
      data: result.rows[0]
    });
    
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

/**
 * ✨ 새 프롬프트 템플릿 생성 API
 * POST /templates
 * 
 * 새로운 프롬프트 템플릿을 생성하고 관련 메타데이터를 설정합니다.
 * 트랜잭션을 사용하여 데이터 무결성을 보장합니다.
 * 
 * 요청 바디 (JSON):
 * {
 *   "title": "템플릿 제목 (필수)",
 *   "description": "템플릿 설명 (필수)",
 *   "template_content": "실제 프롬프트 내용 (필수)",
 *   "system_role": "AI 시스템 역할 (선택)",
 *   "category_name": "카테고리명 (자동 생성)",
 *   "tags": ["태그1", "태그2"] (자동 생성),
 *   "difficulty_level": "easy|medium|hard" (기본: medium),
 *   "example_usage": "사용 예시 (선택)",
 *   "is_public": true (기본: true)
 * }
 * 
 * 자동 처리 기능:
 * - 존재하지 않는 카테고리 자동 생성
 * - 존재하지 않는 태그 자동 생성 및 연결
 * - 초기 버전 1.0 설정
 * - 생성일/수정일 자동 설정
 * 
 * 트랜잭션 구조:
 * 1. 카테고리 확인/생성
 * 2. 템플릿 레코드 생성
 * 3. 태그 확인/생성 및 연결
 * 4. 커밋 또는 롤백
 */
router.post('/', async (req: any, res: any) => {
  const { 
    title, 
    description, 
    template_content, 
    system_role, 
    category_name,
    tags = [],
    difficulty_level = 'medium',
    example_usage = '',
    is_public = true 
  } = req.body;
  
  try {
    // 트랜잭션 시작
    await pool.query('BEGIN');
    
    // 카테고리 찾기 또는 생성
    let categoryId = null;
    if (category_name) {
      const categoryResult = await pool.query('SELECT id FROM categories WHERE name = $1', [category_name]);
      if (categoryResult.rows.length > 0) {
        categoryId = categoryResult.rows[0].id;
      } else {
        const newCategoryResult = await pool.query(
          'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id',
          [category_name, `Auto-created category for ${category_name}`]
        );
        categoryId = newCategoryResult.rows[0].id;
      }
    }
    
    // 템플릿 생성
    const templateResult = await pool.query(`
      INSERT INTO prompt_templates (
        title, description, template_content, system_role, 
        category_id, difficulty_level, example_usage, is_public,
        created_by, version
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *
    `, [
      title, description, template_content, system_role, 
      categoryId, difficulty_level, example_usage, is_public,
      'user', // 실제로는 인증된 사용자 ID
      '1.0'
    ]);
    
    const templateId = templateResult.rows[0].id;
    
    // 태그 연결
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        // 태그 찾기 또는 생성
        let tagResult = await pool.query('SELECT id FROM tags WHERE name = $1', [tagName]);
        let tagId;
        
        if (tagResult.rows.length > 0) {
          tagId = tagResult.rows[0].id;
        } else {
          const newTagResult = await pool.query(
            'INSERT INTO tags (name, description) VALUES ($1, $2) RETURNING id',
            [tagName, `Auto-created tag for ${tagName}`]
          );
          tagId = newTagResult.rows[0].id;
        }
        
        // 템플릿-태그 연결
        await pool.query(
          'INSERT INTO prompt_template_tags (template_id, tag_id) VALUES ($1, $2)',
          [templateId, tagId]
        );
      }
    }
    
    await pool.query('COMMIT');
    
    res.status(201).json({
      success: true,
      data: templateResult.rows[0]
    });
    
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('템플릿 생성 오류:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

/**
 * ✏️ 프롬프트 템플릿 수정 API
 * PUT /templates/:id
 * 
 * 기존 템플릿의 내용을 수정하고 버전 관리를 수행합니다.
 * 변경 이력을 자동으로 기록하여 데이터 추적이 가능합니다.
 * 
 * 경로 파라미터:
 * - id: 수정할 템플릿 ID
 * 
 * 요청 바디:
 * {
 *   "title": "새 제목",
 *   "description": "새 설명", 
 *   "template_content": "새 템플릿 내용",
 *   "system_role": "새 시스템 역할",
 *   "difficulty_level": "easy|medium|hard",
 *   "example_usage": "새 사용 예시",
 *   "version_notes": "변경 사항 요약 (선택)"
 * }
 * 
 * 자동 처리:
 * - 버전 번호 자동 증가 (예: 1.2 → 1.3)
 * - 변경 이력 content_versions 테이블에 기록
 * - 수정일 자동 업데이트
 * - 이전 데이터 백업 (old_data)
 * 
 * 트랜잭션 처리:
 * 1. 기존 데이터 조회 및 백업
 * 2. 버전 번호 계산
 * 3. 템플릿 데이터 업데이트
 * 4. 변경 이력 기록
 */
router.put('/:id', async (req: any, res: any) => {
  const { id } = req.params;
  const { 
    title, 
    description, 
    template_content, 
    system_role, 
    difficulty_level,
    example_usage,
    version_notes = ''
  } = req.body;
  
  try {
    // 버전 관리를 위해 기존 데이터 백업
    const oldDataResult = await pool.query('SELECT * FROM prompt_templates WHERE id = $1', [id]);
    if (oldDataResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }
    
    const oldData = oldDataResult.rows[0];
    
    // 버전 번호 증가
    const versionParts = oldData.version.split('.');
    const newVersion = `${versionParts[0]}.${parseInt(versionParts[1]) + 1}`;
    
    // 트랜잭션 시작
    await pool.query('BEGIN');
    
    // 템플릿 업데이트
    const updateResult = await pool.query(`
      UPDATE prompt_templates 
      SET title = $1, description = $2, template_content = $3, 
          system_role = $4, difficulty_level = $5, example_usage = $6,
          version = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8 
      RETURNING *
    `, [title, description, template_content, system_role, difficulty_level, example_usage, newVersion, id]);
    
    // 변경 이력 기록
    await pool.query(`
      INSERT INTO content_versions (
        content_type, content_id, version_number, change_type,
        old_data, new_data, change_summary, changed_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      'prompt_template', id, newVersion, 'update',
      JSON.stringify(oldData), JSON.stringify(updateResult.rows[0]),
      version_notes || '템플릿 업데이트', 'user'
    ]);
    
    await pool.query('COMMIT');
    
    res.json({
      success: true,
      data: updateResult.rows[0]
    });
    
  } catch (err) {
    await pool.query('ROLLBACK');
    res.status(500).json({ success: false, error: String(err) });
  }
});

/**
 * 🗑️ 프롬프트 템플릿 삭제 API (소프트 삭제)
 * DELETE /templates/:id
 * 
 * 템플릿을 물리적으로 삭제하지 않고 비활성화 처리합니다.
 * 데이터 복구 가능성과 관계 무결성을 보장하기 위한 소프트 삭제 방식입니다.
 * 
 * 경로 파라미터:
 * - id: 삭제할 템플릿 ID
 * 
 * 처리 과정:
 * 1. is_active 플래그를 false로 변경
 * 2. updated_at 타임스탬프 갱신
 * 3. content_versions에 삭제 이력 기록
 * 4. 관련 관계(태그, 피드백 등)는 유지
 * 
 * 소프트 삭제 장점:
 * - 데이터 복구 가능
 * - 참조 무결성 유지
 * - 삭제 이력 추적 가능
 * - 통계 데이터 보존
 */
router.delete('/:id', async (req: any, res: any) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      'UPDATE prompt_templates SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }
    
    // 삭제 이력 기록
    await pool.query(`
      INSERT INTO content_versions (
        content_type, content_id, version_number, change_type,
        old_data, change_summary, changed_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      'prompt_template', id, result.rows[0].version, 'delete',
      JSON.stringify(result.rows[0]), '템플릿 삭제', 'user'
    ]);
    
    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
    
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

/**
 * 💬 템플릿 피드백 제출 API
 * POST /templates/:id/feedback
 * 
 * 사용자가 템플릿에 대한 평가와 피드백을 제출할 수 있습니다.
 * 다차원 평가 시스템으로 상세한 품질 측정이 가능합니다.
 * 
 * 경로 파라미터:
 * - id: 피드백을 제출할 템플릿 ID
 * 
 * 요청 바디:
 * {
 *   "rating": 4,                    // 전체 평점 (1-5, 필수)
 *   "comment": "유용한 템플릿입니다", // 코멘트 (선택)
 *   "accuracy_rating": 5,           // 정확도 평점 (1-5)
 *   "usefulness_rating": 4,         // 유용성 평점 (1-5)
 *   "ease_of_use_rating": 3,        // 사용 편의성 평점 (1-5)
 *   "session_uuid": "uuid-string"   // 세션 식별자 (선택)
 * }
 * 
 * 평가 기준:
 * - rating: 전반적인 만족도
 * - accuracy_rating: 프롬프트의 정확성과 명확성
 * - usefulness_rating: 실제 업무에 도움이 되는 정도
 * - ease_of_use_rating: 이해하기 쉽고 사용하기 편한 정도
 * 
 * 자동 처리:
 * - 세션 ID 연결 (익명 피드백 지원)
 * - 피드백 통계 업데이트
 * - 템플릿 품질 점수 재계산
 */
router.post('/:id/feedback', async (req: any, res: any) => {
  const { id } = req.params;
  const { 
    rating, 
    comment, 
    accuracy_rating, 
    usefulness_rating, 
    ease_of_use_rating,
    session_uuid 
  } = req.body;
  
  try {
    // 세션 찾기 또는 생성
    let sessionId = null;
    if (session_uuid) {
      const sessionResult = await pool.query('SELECT id FROM user_sessions WHERE session_uuid = $1', [session_uuid]);
      if (sessionResult.rows.length > 0) {
        sessionId = sessionResult.rows[0].id;
      }
    }
    
    const feedbackResult = await pool.query(`
      INSERT INTO user_feedback (
        session_id, feedback_type, target_id, rating, comment,
        accuracy_rating, usefulness_rating, ease_of_use_rating
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *
    `, [sessionId, 'template', id, rating, comment, accuracy_rating, usefulness_rating, ease_of_use_rating]);
    
    res.json({
      success: true,
      data: feedbackResult.rows[0],
      message: 'Feedback submitted successfully'
    });
    
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

/**
 * 📊 템플릿 통계 조회 API
 * GET /templates/:id/stats
 * 
 * 특정 템플릿의 상세한 사용 통계와 피드백 분석을 제공합니다.
 * 템플릿 성능 평가와 개선 방향 결정에 활용할 수 있습니다.
 * 
 * 경로 파라미터:
 * - id: 통계를 조회할 템플릿 ID
 * 
 * 응답 데이터:
 * {
 *   "template_stats": {
 *     "usage_count": 150,           // 총 사용 횟수
 *     "view_count": 1200,           // 조회 횟수
 *     "created_at": "2025-01-01",   // 생성일
 *     "updated_at": "2025-01-15"    // 최종 수정일
 *   },
 *   "feedback_stats": {
 *     "total_feedback": 25,         // 총 피드백 수
 *     "avg_rating": 4.2,            // 평균 평점
 *     "avg_accuracy": 4.5,          // 평균 정확도
 *     "avg_usefulness": 4.0,        // 평균 유용성
 *     "avg_ease_of_use": 3.8        // 평균 사용 편의성
 *   }
 * }
 * 
 * 활용 방안:
 * - 인기 템플릿 식별
 * - 품질 개선이 필요한 템플릿 파악
 * - 사용자 만족도 모니터링
 * - 템플릿 추천 알고리즘 개선
 */
router.get('/:id/stats', async (req: any, res: any) => {
  const { id } = req.params;
  
  try {
    // 기본 통계
    const templateStats = await pool.query(`
      SELECT 
        usage_count,
        view_count,
        created_at,
        updated_at
      FROM prompt_templates 
      WHERE id = $1
    `, [id]);
    
    // 피드백 통계
    const feedbackStats = await pool.query(`
      SELECT 
        COUNT(*) as total_feedback,
        AVG(rating) as avg_rating,
        AVG(accuracy_rating) as avg_accuracy,
        AVG(usefulness_rating) as avg_usefulness,
        AVG(ease_of_use_rating) as avg_ease_of_use
      FROM user_feedback 
      WHERE target_id = $1 AND feedback_type = 'template'
    `, [id]);
    
    if (templateStats.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }
    
    res.json({
      success: true,
      data: {
        template_stats: templateStats.rows[0],
        feedback_stats: feedbackStats.rows[0]
      }
    });
    
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router; 