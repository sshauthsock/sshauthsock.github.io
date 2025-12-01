/**
 * 이미지를 WebP 형식으로 변환하는 스크립트
 * 
 * 사용법: node scripts/convert-to-webp.js
 * 
 * - public/assets/img/ 디렉토리의 모든 이미지를 WebP로 변환
 * - 원본 파일은 유지 (백업)
 * - 변환 결과를 로그로 출력
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGE_DIR = path.join(__dirname, '../public/assets/img');
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png'];
const SKIP_FORMATS = ['.gif']; // GIF는 애니메이션이 있을 수 있으므로 스킵

const stats = {
  total: 0,
  converted: 0,
  skipped: 0,
  errors: 0,
  sizeReduction: 0, // bytes
};

/**
 * 디렉토리 내의 모든 이미지 파일을 재귀적으로 찾기
 */
async function findImageFiles(dir) {
  const files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      const subFiles = await findImageFiles(fullPath);
      files.push(...subFiles);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (SUPPORTED_FORMATS.includes(ext)) {
        files.push(fullPath);
      } else if (SKIP_FORMATS.includes(ext)) {
        stats.skipped++;
      }
    }
  }

  return files;
}

/**
 * 단일 이미지를 WebP로 변환
 */
async function convertToWebP(inputPath) {
  try {
    const ext = path.extname(inputPath).toLowerCase();
    const dir = path.dirname(inputPath);
    const basename = path.basename(inputPath, ext);
    const outputPath = path.join(dir, `${basename}.webp`);

    // 이미 WebP 파일이 존재하면 스킵
    try {
      await fs.access(outputPath);
      stats.skipped++;
      return;
    } catch {
      // 파일이 없으면 계속 진행
    }

    // 원본 파일 크기
    const originalStats = await fs.stat(inputPath);
    const originalSize = originalStats.size;

    // WebP로 변환
    await sharp(inputPath)
      .webp({ 
        quality: 85, // 품질 설정 (0-100, 85는 좋은 균형)
        effort: 6,   // 압축 노력 (0-6, 6이 가장 느리지만 최고 품질)
      })
      .toFile(outputPath);

    // 변환된 파일 크기
    const webpStats = await fs.stat(outputPath);
    const webpSize = webpStats.size;
    const reduction = originalSize - webpSize;
    const reductionPercent = ((reduction / originalSize) * 100).toFixed(1);

    stats.converted++;
    stats.sizeReduction += reduction;

    return { originalSize, webpSize, reduction };
  } catch (error) {
    stats.errors++;
    return null;
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  try {
    // 이미지 파일 찾기
    const imageFiles = await findImageFiles(IMAGE_DIR);
    stats.total = imageFiles.length;

    if (stats.total === 0) {
      return;
    }

    // 각 이미지 변환
    for (const file of imageFiles) {
      await convertToWebP(file);
    }

  } catch (error) {
    process.exit(1);
  }
}

// 스크립트 실행
main();

