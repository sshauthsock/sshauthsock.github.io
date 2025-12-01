/**
 * Service Worker 버전 자동 업데이트 스크립트
 * 빌드 시 실행되어 Service Worker의 CACHE_VERSION을 타임스탬프 기반으로 업데이트
 */
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const SW_PATH = join(process.cwd(), 'public', 'sw.js');

try {
  // Service Worker 파일 읽기
  let swContent = readFileSync(SW_PATH, 'utf8');
  
  // 타임스탬프 기반 버전 생성 (YYYYMMDDHHmmss 형식)
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:T]/g, '').split('.')[0]; // YYYYMMDDHHmmss
  const newVersion = `v${timestamp}`;
  
  // CACHE_VERSION 업데이트
  const versionRegex = /const CACHE_VERSION = ['"](.*?)['"];?/;
  if (versionRegex.test(swContent)) {
    swContent = swContent.replace(versionRegex, `const CACHE_VERSION = '${newVersion}';`);
  } else {
    // 버전이 없으면 추가
    swContent = swContent.replace(
      /const CACHE_NAME = /,
      `const CACHE_VERSION = '${newVersion}';\nconst CACHE_NAME = `
    );
  }
  
  // 파일 저장
  writeFileSync(SW_PATH, swContent, 'utf8');
} catch (error) {
  process.exit(1);
}

