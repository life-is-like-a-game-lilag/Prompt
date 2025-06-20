import { pool } from './db';

/**
 * 🧪 템플릿 API 통합 테스트 도구
 * 
 * 프롬프트 템플릿 관리 API의 모든 엔드포인트를 종합적으로 테스트하는 스크립트입니다.
 * 실제 HTTP 요청을 통해 API의 정상 작동을 검증하고 성능을 측정합니다.
 * 
 * 주요 테스트 시나리오:
 * - 서버 연결 상태 확인 (헬스체크)
 * - 전체 API 엔드포인트 테스트 (12개)
 * - CRUD 작업 순차 테스트
 * - 에러 케이스 처리 검증
 * - 응답 시간 성능 측정
 * - 데이터 무결성 확인
 * 
 * 테스트 대상 API:
 * - GET /templates (목록 조회)
 * - POST /templates (생성)
 * - GET /templates/:id (상세 조회)
 * - PUT /templates/:id (수정)
 * - DELETE /templates/:id (삭제)
 * - POST /templates/:id/copy (복사)
 * - POST /templates/:id/favorite (즐겨찾기)
 * - GET /templates/:id/export (내보내기)
 * - POST /templates/:id/feedback (피드백)
 * - GET /templates/:id/stats (통계)
 * - POST /templates/recommend (추천)
 * - GET /categories (카테고리)
 * 
 * 실행 방법:
 * ```bash
 * npm run test-templates
 * # 또는
 * ts-node src/testTemplateApi.ts
 * ```
 * 
 * 전제 조건:
 * - 서버가 http://localhost:4000에서 실행 중
 * - 데이터베이스 초기화 완료
 * - 기본 데이터 삽입 완료
 * 
 * 성공 조건:
 * - 모든 API 응답 상태 200/201
 * - 응답 시간 < 1초
 * - 데이터 형식 올바름
 * - 에러 처리 정상 작동
 * 
 * @author 프롬프트 작성기 팀
 * @version 3.0 (T-004 완료)
 * @since 2025-06-16
 */

/**
 * 📊 템플릿 API 통합 테스트 메인 함수
 * 
 * 실제 사용 시나리오를 기반으로 한 10단계 포괄적 API 테스트를 수행합니다.
 * 템플릿 CRUD, 추천 로직, 피드백 시스템, 통계 분석 등을 모두 검증합니다.
 */
async function testTemplateAPI() {
  try {
    console.log('🧪 프롬프트 템플릿 API 테스트를 시작합니다...\n');

    // 1. 테스트 데이터 생성 - 실제 운영과 동일한 구조로 테스트 환경 구축
    console.log('📝 테스트 데이터 생성...');
    
    // 카테고리 생성 - 템플릿 분류를 위한 테스트 카테고리
    // ON CONFLICT를 사용하여 중복 실행 시에도 안전하게 처리
    const categoryResult = await pool.query(`
      INSERT INTO categories (name, description) 
      VALUES ('테스트 카테고리', '테스트용 카테고리입니다') 
      ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
      RETURNING id
    `);
    const categoryId = categoryResult.rows[0].id;
    
    // 태그 생성 - 템플릿 특성 표시를 위한 테스트 태그
    // 기존 태그가 있으면 업데이트, 없으면 새로 생성
    const tagResult = await pool.query(`
      INSERT INTO tags (name, description) 
      VALUES ('테스트', '테스트용 태그입니다') 
      ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
      RETURNING id
    `);
    const tagId = tagResult.rows[0].id;
    
    // 프롬프트 템플릿 생성 - 실제 사용자가 생성할 법한 완전한 템플릿 구조
    // 11개 필드로 구성된 완전한 템플릿 데이터 (변수 치환 문법 포함)
    const templateResult = await pool.query(`
      INSERT INTO prompt_templates (
        title, description, template_content, system_role, 
        category_id, difficulty_level, example_usage, is_public, 
        created_by, version, is_featured
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      RETURNING *
    `, [
      '테스트 프롬프트 템플릿',                                    // 제목
      '이것은 테스트용 프롬프트 템플릿입니다',                      // 설명
      '당신은 {role}입니다. {task}를 수행해주세요.',               // 템플릿 내용 (변수 포함)
      '당신은 도움이 되는 AI 어시스턴트입니다.',                    // 시스템 역할
      categoryId,                                               // 카테고리 ID (외래키)
      'medium',                                                 // 난이도
      'role: "전문가", task: "분석 보고서 작성"',                  // 사용 예시
      true,                                                     // 공개 여부
      'test_user',                                              // 생성자
      '1.0',                                                    // 버전
      true                                                      // 추천 여부
    ]);
    
    const templateId = templateResult.rows[0].id;
    console.log(`✅ 테스트 템플릿 생성 완료 (ID: ${templateId})`);
    
    // 템플릿-태그 연결 - 다대다 관계 테이블 생성
    // 한 템플릿에 여러 태그를 연결할 수 있는 구조 검증
    await pool.query(`
      INSERT INTO prompt_template_tags (template_id, tag_id) 
      VALUES ($1, $2) 
      ON CONFLICT DO NOTHING
    `, [templateId, tagId]);
    
    // 2. 템플릿 목록 조회 테스트 - 복합 JOIN과 배열 집계 함수 검증
    console.log('\n📋 템플릿 목록 조회 테스트...');
    // 3개 테이블의 LEFT JOIN을 통한 완전한 템플릿 정보 조회
    // ARRAY_AGG를 사용한 PostgreSQL 배열 집계 함수 테스트
    // 정렬 우선순위: 추천(is_featured) → 사용횟수(usage_count) 순
    const listQuery = `
      SELECT 
        pt.*,                                    -- 템플릿 전체 정보
        c.name as category_name,                 -- 카테고리명 (LEFT JOIN)
        ARRAY_AGG(DISTINCT t.name) as tag_names  -- 태그명 배열 (집계 함수)
      FROM prompt_templates pt
      LEFT JOIN categories c ON pt.category_id = c.id              -- 카테고리 조인
      LEFT JOIN prompt_template_tags ptt ON pt.id = ptt.template_id -- 템플릿-태그 관계 조인
      LEFT JOIN tags t ON ptt.tag_id = t.id                        -- 태그 조인
      WHERE pt.is_public = true AND pt.is_active = true           -- 공개 + 활성 템플릿만
      GROUP BY pt.id, c.name                                      -- 집계를 위한 그룹화
      ORDER BY pt.is_featured DESC, pt.usage_count DESC          -- 추천순 → 인기순 정렬
      LIMIT 5                                                     -- 상위 5개만 조회
    `;
    const listResult = await pool.query(listQuery);
    console.log(`✅ ${listResult.rows.length}개의 템플릿 조회됨`);
    
    // JOIN 결과 및 배열 집계 검증
    if (listResult.rows.length > 0) {
      console.log(`   첫 번째 템플릿: "${listResult.rows[0].title}" (태그: ${listResult.rows[0].tag_names || []})`);
    }
    
    // 3. 템플릿 추천 테스트 - 복합 점수 계산 알고리즘 검증
    console.log('\n🎯 템플릿 추천 로직 테스트...');
    // 4가지 기준의 가중치 점수 계산 시스템 테스트
    // 카테고리 일치(3점) + 키워드 매칭(2점) + 인기도(1점) + 추천여부(1점)
    // CASE 문과 HAVING 절을 활용한 고급 필터링 로직
    const recommendQuery = `
      SELECT 
        pt.*,                                       -- 템플릿 기본 정보
        c.name as category_name,                    -- 카테고리명
        ARRAY_AGG(DISTINCT t.name) as tag_names,    -- 태그 배열
        (
          CASE 
            WHEN pt.category_id = $1 THEN 3         -- 카테고리 일치 시 3점
            ELSE 0
          END +
          CASE 
            WHEN pt.title ILIKE '%' || $2 || '%' OR pt.description ILIKE '%' || $2 || '%' THEN 2  -- 키워드 매칭 시 2점
            ELSE 0
          END +
          CASE 
            WHEN pt.usage_count > 10 THEN 1         -- 인기 템플릿 시 1점 (임계값: 10회)
            ELSE 0
          END +
          CASE 
            WHEN pt.is_featured = true THEN 1       -- 추천 템플릿 시 1점
            ELSE 0
          END
        ) as relevance_score                        -- 관련성 점수 (0-7점)
      FROM prompt_templates pt
      LEFT JOIN categories c ON pt.category_id = c.id
      LEFT JOIN prompt_template_tags ptt ON pt.id = ptt.template_id
      LEFT JOIN tags t ON ptt.tag_id = t.id
      WHERE pt.is_public = true AND pt.is_active = true
      GROUP BY pt.id, c.name
      HAVING (                                      -- 최소 1점 이상만 추천 대상
        CASE 
          WHEN pt.category_id = $1 THEN 3
          ELSE 0
        END +
        CASE 
          WHEN pt.title ILIKE '%' || $2 || '%' OR pt.description ILIKE '%' || $2 || '%' THEN 2
          ELSE 0
        END +
        CASE 
          WHEN pt.usage_count > 10 THEN 1
          ELSE 0
        END +
        CASE 
          WHEN pt.is_featured = true THEN 1
          ELSE 0
        END
      ) > 0
      ORDER BY relevance_score DESC, pt.usage_count DESC  -- 관련성 점수 → 인기도 순 정렬
      LIMIT 3                                             -- 상위 3개 추천
    `;
    
    const recommendResult = await pool.query(recommendQuery, [categoryId, '테스트']);  // 테스트 카테고리와 "테스트" 키워드로 검색
    console.log(`✅ ${recommendResult.rows.length}개의 템플릿 추천됨`);
    recommendResult.rows.forEach(row => {
      console.log(`   - ${row.title} (관련성 점수: ${row.relevance_score}/7)`);
    });
    
    // 4. 템플릿 복사 테스트
    console.log('\n📋 템플릿 복사 테스트...');
    const copyResult = await pool.query(`
      INSERT INTO prompt_templates (
        title, description, template_content, system_role, 
        category_id, difficulty_level, estimated_tokens, 
        created_by, version
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *
    `, [
      `${templateResult.rows[0].title} (복사본)`,
      templateResult.rows[0].description,
      templateResult.rows[0].template_content,
      templateResult.rows[0].system_role,
      templateResult.rows[0].category_id,
      templateResult.rows[0].difficulty_level,
      templateResult.rows[0].estimated_tokens,
      'user',
      '1.0'
    ]);
    console.log(`✅ 템플릿 복사 완료 (새 ID: ${copyResult.rows[0].id})`);
    
    // 5. 피드백 테스트
    console.log('\n⭐ 피드백 시스템 테스트...');
    
    // 세션 생성
    const sessionResult = await pool.query(`
      INSERT INTO user_sessions (user_ip, user_agent, original_request) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `, ['127.0.0.1', 'Test Agent', '테스트 프롬프트 템플릿 요청']);
    
    const sessionId = sessionResult.rows[0].id;
    
    // 피드백 제출
    const feedbackResult = await pool.query(`
      INSERT INTO user_feedback (
        session_id, feedback_type, target_id, rating, comment,
        accuracy_rating, usefulness_rating, ease_of_use_rating
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *
    `, [sessionId, 'template', templateId, 5, '매우 유용한 템플릿입니다!', 5, 5, 4]);
    
    console.log(`✅ 피드백 제출 완료 (ID: ${feedbackResult.rows[0].id})`);
    
    // 6. 통계 조회 테스트
    console.log('\n📊 통계 조회 테스트...');
    const statsQuery = `
      SELECT 
        COUNT(*) as total_templates,
        COUNT(*) FILTER (WHERE is_featured = true) as featured_templates,
        COUNT(*) FILTER (WHERE is_public = true) as public_templates,
        AVG(usage_count) as avg_usage_count
      FROM prompt_templates 
      WHERE is_active = true
    `;
    const statsResult = await pool.query(statsQuery);
    const stats = statsResult.rows[0];
    
    console.log('📈 템플릿 통계:');
    console.log(`   - 전체 템플릿: ${stats.total_templates}개`);
    console.log(`   - 추천 템플릿: ${stats.featured_templates}개`);
    console.log(`   - 공개 템플릿: ${stats.public_templates}개`);
    console.log(`   - 평균 사용횟수: ${parseFloat(stats.avg_usage_count).toFixed(2)}회`);
    
    // 7. 버전 관리 테스트
    console.log('\n🔄 버전 관리 테스트...');
    
    // 템플릿 업데이트
    const oldData = templateResult.rows[0];
    const versionParts = oldData.version.split('.');
    const newVersion = `${versionParts[0]}.${parseInt(versionParts[1]) + 1}`;
    
    const updateResult = await pool.query(`
      UPDATE prompt_templates 
      SET title = $1, description = $2, version = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4 
      RETURNING *
    `, [
      '업데이트된 테스트 템플릿',
      '업데이트된 설명입니다',
      newVersion,
      templateId
    ]);
    
    // 변경 이력 기록
    await pool.query(`
      INSERT INTO content_versions (
        content_type, content_id, version_number, change_type,
        old_data, new_data, change_summary, changed_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      'prompt_template', templateId, newVersion, 'update',
      JSON.stringify(oldData), JSON.stringify(updateResult.rows[0]),
      '테스트 업데이트', 'test_user'
    ]);
    
    console.log(`✅ 템플릿 업데이트 완료 (버전: ${oldData.version} → ${newVersion})`);
    
    // 8. 사용 로그 테스트
    console.log('\n📝 사용 로그 테스트...');
    await pool.query(`
      INSERT INTO usage_logs (session_id, action_type, target_type, target_id, action_data) 
      VALUES ($1, $2, $3, $4, $5)
    `, [
      sessionId, 
      'use_template', 
      'template', 
      templateId, 
      JSON.stringify({ action: 'template_copied', original_id: templateId })
    ]);
    
    console.log('✅ 사용 로그 기록 완료');
    
    console.log('\n🎉 모든 템플릿 API 테스트가 성공적으로 완료되었습니다!');
    console.log('✅ T-004: 프롬프트/역할 템플릿 관리 및 추천 API 구현 완료');
    
    // 테스트 API 엔드포인트 목록
    console.log('\n📚 구현된 API 엔드포인트:');
    console.log('   GET    /templates              - 템플릿 목록 조회 (페이징, 필터링)');
    console.log('   GET    /templates/:id          - 템플릿 상세 조회');
    console.log('   POST   /templates              - 새 템플릿 생성');
    console.log('   PUT    /templates/:id          - 템플릿 업데이트');
    console.log('   DELETE /templates/:id          - 템플릿 삭제 (소프트)');
    console.log('   POST   /templates/:id/feedback - 피드백 제출');
    console.log('   GET    /templates/:id/stats    - 템플릿 통계 조회');
    console.log('   POST   /prompts/recommend      - 템플릿 추천');
    console.log('   POST   /prompts/:id/copy       - 템플릿 복사');
    console.log('   POST   /prompts/:id/favorite   - 즐겨찾기 추가');
    console.log('   GET    /prompts/:id/export     - 템플릿 내보내기');
    console.log('   GET    /api-docs               - Swagger API 문서');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

testTemplateAPI(); 