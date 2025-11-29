# 바연화연: 바람의나라: 연 환수, 결속, 착 정보 계산기

[![GitHub Actions CI/CD](https://github.com/sshauthsock/sshauthsock.github.io/actions/workflows/deploy-frontend.yml/badge.svg)](https://github.com/sshauthsock/sshauthsock.github.io/actions/workflows/deploy-frontend.yml)

## 📖 프로젝트 소개

`바연화연`은 넥슨의 인기 모바일 게임 **'바람의나라: 연'** 플레이어들을 위한 환수 정보 및 심층 계산기 웹 서비스입니다. 게임 내 환수 시스템(환수 정보, 결속, 환수혼, 착)을 분석하고 최적의 성장 및 세팅을 돕기 위해 개발되었습니다.

**🌐 라이브 사이트:** [https://sshauthsock.github.io/](https://sshauthsock.github.io/)

## ✨ 주요 기능

- **환수 정보 조회:** 모든 환수(수호, 탑승, 변신)의 상세 능력치, 등록 효과, 장착 효과를 제공합니다.
- **환수 결속 최적화:** 보유 환수들 중 가장 높은 능력치 시너지를 제공하는 **6마리 결속 조합**을 유전 알고리즘 기반으로 찾아냅니다.
- **환수 혼 계산:** 환수 레벨업에 필요한 환수혼(최상급, 상급, 하급)의 총량 및 보유 환수혼으로 달성 가능한 최대 레벨을 계산합니다.
- **착 세팅 계산:** 장비 부위별 '착' 강화에 따른 능력치 변화를 시뮬레이션하고, 원하는 능력치를 위한 최적의 착 부위를 검색합니다.
- **환수 랭킹:** 결속 점수 및 특정 능력치 기준의 환수 랭킹을 제공하여 플레이어의 육성 목표 설정에 도움을 줍니다.
- **내정보 관리:** 프로파일별로 기본 스탯, 환수 결속 설정, 각인 정보를 관리하고 실시간 스탯 증감을 확인할 수 있습니다.

## 🛠 기술 스택

### 프론트엔드

- **언어:** 순수 JavaScript (Vanilla JS), HTML5, CSS3
- **빌드 도구:** [Vite](https://vitejs.dev/) (빠른 개발 서버 및 최적화된 프로덕션 빌드)
- **호스팅:** [GitHub Pages](https://pages.github.com/) (정적 웹사이트 호스팅)
- **캐싱:** localStorage, sessionStorage, IndexedDB (대용량 데이터용)

### 백엔드

- **언어:** [Go (Golang)](https://go.dev/)
- **웹 프레임워크:** [Gin Web Framework](https://gin-gonic.com/) (빠르고 경량화된 API 서버)
- **데이터베이스:** [Google Cloud Firestore](https://cloud.google.com/firestore) (확장 가능한 NoSQL 문서 데이터베이스)
- **호스팅:** [Render](https://render.com/) (서버리스 컨테이너 서비스)
- **알고리즘:** 유전 알고리즘 (Genetic Algorithm)을 활용한 최적 조합 탐색

### 인프라 및 DevOps

- **CI/CD:** [GitHub Actions](https://docs.github.com/en/actions) (지속적 통합 및 배포 파이프라인)
- **컨테이너:** Docker
- **인프라 관리:** Render Dashboard (render.yaml 기반 설정)

## 🚀 빠른 시작

### 전제 조건

- [Node.js](https://nodejs.org/) (v18 이상) 및 [npm](https://www.npmjs.com/)
- [Go (Golang)](https://go.dev/dl/) (v1.23 이상)
- [Google Cloud CLI (gcloud CLI)](https://cloud.google.com/sdk/docs/install) (Firestore 접근용, 로컬 개발 시)

### 로컬 개발 환경 실행

1. **저장소 클론**

   ```bash
   git clone https://github.com/sshauthsock/sshauthsock.github.io.git
   cd sshauthsock.github.io/
   ```

2. **프론트엔드 의존성 설치**

   ```bash
   npm install
   ```

3. **GCP 인증 설정** (Firestore 접근용, 로컬 개발 시)

   ```bash
   gcloud auth application-default login
   gcloud config set project YOUR_PROJECT_ID
   ```

   또는 `config/serviceAccountKey.json` 파일을 사용할 수 있습니다.

4. **로컬 환경 실행**

   ```bash
   # 방법 1: 통합 스크립트 사용 (권장)
   npm run local
   # 또는
   bash start-local.sh

   # 방법 2: 개별 실행
   # 터미널 1: 백엔드
   cd backend/
   go mod tidy
   go run main.go

   # 터미널 2: 프론트엔드
   npm run dev
   ```

5. **브라우저에서 접속**
   - 프론트엔드: http://localhost:5173
   - 백엔드 API: http://localhost:8080

## 📁 프로젝트 구조

```
sshauthsock.github.io/
├── backend/                 # Go 백엔드 서버
│   ├── main.go             # 메인 서버 파일
│   ├── genetic_algorithm.go # 유전 알고리즘 구현
│   ├── calculator.go        # 계산 로직
│   ├── filter.go            # 필터링 로직
│   ├── exhaustive_search.go # 완전 탐색 알고리즘
│   ├── validation.go        # 입력 검증
│   ├── middleware.go        # 미들웨어 (CORS, Rate Limiting 등)
│   ├── monitoring.go        # 모니터링 및 헬스체크
│   ├── config/              # 설정 파일
│   └── logger/              # 로깅 유틸리티
├── js/                      # 프론트엔드 JavaScript
│   ├── main.js             # 메인 진입점
│   ├── api.js               # API 통신
│   ├── state.js             # 상태 관리
│   ├── pages/               # 페이지별 모듈
│   │   ├── bondCalculator.js    # 결속 계산기
│   │   ├── soulCalculator.js    # 환수혼 계산기
│   │   ├── chakCalculator.js    # 착 계산기
│   │   ├── spiritInfo.js        # 환수 정보
│   │   ├── spiritRanking.js     # 환수 랭킹
│   │   └── myInfo.js            # 내정보 관리
│   │       └── myInfo/          # 내정보 서브모듈
│   ├── components/          # 재사용 컴포넌트
│   └── utils/               # 유틸리티 함수
│       ├── cache.js         # 캐싱 유틸리티
│       ├── indexedDB.js      # IndexedDB 관리
│       ├── storage.js        # Storage 관리
│       └── ...
├── public/                  # 정적 파일
│   ├── assets/             # 이미지, CSS 등
│   └── manifest.json       # PWA 매니페스트
├── dist/                   # 빌드 출력 디렉토리
├── index.html              # 메인 HTML 파일
├── vite.config.js          # Vite 설정
├── Dockerfile              # Docker 이미지 빌드 파일
├── render.yaml             # Render 배포 설정
└── package.json            # Node.js 의존성
```

## 🔧 개발 가이드

### 프론트엔드 개발

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

### 백엔드 개발

```bash
cd backend/

# 의존성 설치
go mod tidy

# 서버 실행
go run main.go

# 빌드
go build -o myapp.exe .
```

### 환경 변수 설정

백엔드 실행을 위해 다음 환경 변수가 필요합니다:

**로컬 개발 환경:**

- `GOOGLE_APPLICATION_CREDENTIALS`: GCP 서비스 계정 키 파일 경로 (또는 `config/serviceAccountKey.json` 사용)
- `PORT`: 서버 포트 (기본값: 8080)
- `ENVIRONMENT`: 환경 설정 (development/production)
- `GCP_PROJECT_ID`: GCP 프로젝트 ID (기본값: baram-yeon)

**Render 배포 환경:**

- `PORT`: 서버 포트 (Render가 자동 설정)
- `ENVIRONMENT`: production
- `ALLOWED_ORIGINS`: 허용된 CORS Origin (예: https://sshauthsock.github.io)
- `GCP_PROJECT_ID`: GCP 프로젝트 ID
- `GOOGLE_APPLICATION_CREDENTIALS_JSON`: GCP 서비스 계정 키 JSON 문자열 (Render 대시보드에서 설정)

## 📦 배포

이 프로젝트는 GitHub Actions를 통해 자동으로 배포됩니다.

- **프론트엔드:** `main` 브랜치에 푸시 시 자동으로 GitHub Pages에 배포
- **백엔드:** Render를 통해 수동 배포 또는 Render의 자동 배포 기능 사용

자세한 배포 가이드는 [docs/README.md](docs/README.md)를 참고하세요.

## 🧪 주요 알고리즘

### 유전 알고리즘 (Genetic Algorithm)

환수 결속 최적 조합을 찾기 위해 유전 알고리즘을 사용합니다:

- **인구 크기 (Population Size):** 200개 조합
- **최대 세대 수 (Max Generations):** 100세대
- **엘리트 크기 (Elite Size):** 상위 20개 조합 보존
- **돌연변이 확률 (Mutation Rate):** 30%
- **조합 크기 (Combination Size):** 6마리

알고리즘은 등급 효과, 세력 효과, 결속 스탯을 종합적으로 평가하여 최적의 조합을 찾습니다.

## 🤝 기여하기

버그 리포트, 기능 제안, Pull Request를 환영합니다!

1. 이 저장소를 Fork합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/AmazingFeature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/AmazingFeature`)
5. Pull Request를 생성합니다

## 📄 라이선스

이 프로젝트는 개인 프로젝트입니다.

## 🔗 관련 링크

- **라이브 사이트:** [https://sshauthsock.github.io/](https://sshauthsock.github.io/)
- **상세 문서:** [docs/README.md](docs/README.md)
- **게임 공식 사이트:** [바람의나라: 연](https://baram.nexon.com/)

## 📝 변경 이력

자세한 변경 이력은 [CHANGELOG.md](CHANGELOG.md)를 참고하세요.

---

**바연화연**으로 더 나은 환수 세팅을 만들어보세요! 🎮✨
