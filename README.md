# 바연화연: 바람의나라: 연 환수, 결속, 착 정보 계산기

[![GitHub Actions CI/CD](https://github.com/sshauthsock/sshauthsock.github.io/actions/workflows/deploy-frontend.yml/badge.svg)](https://github.com/sshauthsock/sshauthsock.github.io/actions/workflows/deploy-frontend.yml) [![GitHub Actions CI/CD](https://github.com/sshauthsock/sshauthsock.github.io/actions/workflows/deploy-backend.yml/badge.svg)](https://github.com/sshauthsock/sshauthsock.github.io/actions/workflows/deploy-backend.yml)

## 프로젝트 소개

`바연화연`은 넥슨의 인기 모바일 게임 **'바람의나라: 연'** 플레이어들을 위한 환수 정보 및 심층 계산기 웹 서비스입니다. 게임 내 환수 시스템(환수 정보, 결속, 환수혼, 착)을 분석하고 최적의 성장 및 세팅을 돕기 위해 개발되었습니다.

## 주요 기능

- **환수 정보 조회:** 모든 환수(수호, 탑승, 변신)의 상세 능력치, 등록 효과, 장착 효과를 제공합니다.
- **환수 결속 최적화:** 보유 환수들 중 가장 높은 능력치 시너지를 제공하는 5마리 결속 조합을 유전 알고리즘 기반으로 찾아냅니다.
- **환수 혼 계산:** 환수 레벨업에 필요한 환수혼(최상급, 상급, 하급)의 총량 및 보유 환수혼으로 달성 가능한 최대 레벨을 계산합니다.
- **착 세팅 계산:** 장비 부위별 '착' 강화에 따른 능력치 변화를 시뮬레이션하고, 원하는 능력치를 위한 최적의 착 부위를 검색합니다.
- **환수 랭킹:** 결속 점수 및 특정 능력치 기준의 환수 랭킹을 제공하여 플레이어의 육성 목표 설정에 도움을 줍니다.

## 기술 스택

이 프로젝트는 현대적인 웹 및 클라우드 기술 스택을 조합하여 개발되었습니다.

**프론트엔드:**

- **언어:** 순수 JavaScript (Vanilla JS), HTML5, CSS3
- **빌드 도구:** [Vite](https://vitejs.dev/) (빠른 개발 서버 및 최적화된 프로덕션 빌드)
- **호스팅:** [GitHub Pages](https://pages.github.com/) (정적 웹사이트 호스팅)

**백엔드:**

- **언어:** [Go (Golang)](https://go.dev/)
- **웹 프레임워크:** [Gin Web Framework](https://gin-gonic.com/) (빠르고 경량화된 API 서버)
- **데이터베이스:** [Google Cloud Firestore](https://cloud.google.com/firestore) (확장 가능한 NoSQL 문서 데이터베이스)
- **호스팅:** [Google Cloud Run](https://cloud.google.com/run) (서버리스 컨테이너 서비스)

**인프라 관리:**

- **IaC (Infrastructure as a Code):** [Terraform](https://www.terraform.io/) (Google Cloud 인프라 정의 및 관리)

**CI/CD:**

- **자동화 도구:** [GitHub Actions](https://docs.github.com/en/actions) (지속적 통합 및 배포 파이프라인)

## 프로젝트 설정 및 실행 (개발 환경)

프로젝트를 로컬에서 개발하고 실행하기 위한 단계별 가이드입니다.

### 전제 조건

- [Node.js](https://nodejs.org/) (v18 이상) 및 [npm](https://www.npmjs.com/) (또는 [Yarn](https://yarnpkg.com/))
- [Go (Golang)](https://go.dev/dl/) (v1.23 이상)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (또는 Docker Engine)
- [Google Cloud CLI (gcloud CLI)](https://cloud.google.com/sdk/docs/install)
- [Terraform CLI](https://developer.hashicorp.com/terraform/downloads)

### 1. 저장소 클론

bash

```bash
git clone https://github.com/sshauthsock/sshauthsock.github.io.git
cd sshauthsock.github.io/
```

### 2. 프론트엔드 설정 및 실행

bash

```bash
# Node.js 의존성 설치
npm install

# Vite 개발 서버 실행
npm run dev
# 브라우저에서 http://localhost:3000 으로 접속 (Vite가 자동으로 열어줄 수 있음)
```

### 3. 백엔드 설정 및 실행

**3.1. GCP 인증 (로컬에서 Firestore 접근용)**

로컬에서 백엔드 앱이 Firestore에 접근하려면, `gcloud` CLI를 통해 인증 정보를 설정해야 합니다.

bash

```bash
# 애플리케이션 기본 사용자 인증 정보 로그인 (브라우저가 열리고 Google 계정으로 로그인)
gcloud auth application-default login

# Firestore 데이터가 있는 GCP 프로젝트 ID로 설정 (예: baram-yeon)
gcloud config set project baram-yeon
```

**3.2. Go 모듈 다운로드 및 실행**

bash

```bash
cd backend/
go mod tidy
go run main.go
# 기본적으로 8080 포트에서 실행됩니다.
```

## 배포 가이드 (CI/CD 자동화)

이 프로젝트의 배포는 GitHub Actions를 통해 완전히 자동화되어 있습니다. 수동 배포는 초기 인프라 설정 또는 긴급 복구 상황에서만 필요합니다.

### 1. Google Cloud Platform (GCP) 초기 설정

새로운 GCP 프로젝트를 만들었거나, 기존 프로젝트의 설정을 클린하게 시작하려는 경우에만 필요합니다.

1. **새 GCP 프로젝트 생성:** GCP 콘솔에서 새로운 프로젝트를 생성하고 프로젝트 ID를 확인합니다 (예: `bayeon-hwayeon-469602`).
2. **API 활성화:** 새 프로젝트에서 다음 API들을 활성화합니다: `Cloud Run API`, `Cloud Build API`, `Cloud Datastore API` (or `Cloud Firestore API`), `Artifact Registry API`, `IAM API`, `Service Usage API`.
3. **서비스 계정 생성 및 권한 부여:**
   - **배포자 서비스 계정:** (예: `github-actions-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com`)
     - 역할: `소유자` (Owner) - 초기 설정 및 테스트용 (운영 시 `Cloud Run 개발자`, `Artifact Registry 작성자`, `서비스 계정 사용자` 등으로 최소화 고려)
   - **런타임 서비스 계정:** (예: `wind-backend-runtime-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com`)
     - 역할: `Cloud Datastore 소유자` (Cloud Datastore Owner) - Firestore 데이터 접근용 (운영 시 `Cloud Datastore 사용자`로 최소화 고려)
4. **Workload Identity Federation (WIF) 설정:**
   - GCP 콘솔에서 `IAM 및 관리자` > `워크로드 ID 제휴`로 이동합니다.
   - 풀(`github-actions-pool`) 및 공급업체(`github-provider`)를 생성합니다.
   - **발급기관 URI:** `https://token.actions.githubusercontent.com`
   - **속성 조건:** `attribute.repository == "sshauthsock/sshauthsock.github.io"` (정확한 GitHub 저장소 경로)
   - **"리소스 이름" 복사:** 공급업체 세부 정보 페이지에서 `projects/YOUR_PROJECT_NUMBER/.../providers/github-provider` 형태의 전체 리소스 이름을 복사합니다.

### 2. GitHub Secrets 설정

GitHub 저장소(`Settings` > `Secrets and variables` > `Actions`)에 다음 Secrets를 설정합니다.

- `GCP_PROJECT_ID`: (새 GCP 프로젝트 ID)
- `AR_LOCATION`: (Artifact Registry 리전, 예: `asia-northeast3`)
- `AR_REPO_NAME`: (Artifact Registry 저장소 이름, 예: `go-backend-repo`)
- `CR_SERVICE_NAME`: (Cloud Run 서비스 이름, 예: `wind-app-backend`)
- `GCP_WORKLOAD_IDENTITY_PROVIDER`: (WIF 공급업체 리소스 이름, 예: `projects/YOUR_PROJECT_NUMBER/.../github-provider`)
- `GCP_DEPLOYER_SA_EMAIL`: (배포자 서비스 계정 이메일, 예: `github-actions-deployer@...`)
- `GCP_RUNTIME_SA_EMAIL`: (런타임 서비스 계정 이메일, 예: `wind-backend-runtime-sa@...`)
- **`GCP_SA_KEY_FOR_BUILD`**: **`93165002755-compute@developer.gserviceaccount.com` (Compute Engine 기본 서비스 계정)의 JSON 키 내용을 base64로 인코딩한 문자열.** (이것이 `iam.serviceAccounts.getAccessToken` 오류를 우회하는 핵심)

### 3. 인프라 배포 (Terraform)

`terraform` 디렉토리에 정의된 IaC 코드를 사용하여 GCP 인프라를 배포합니다.

1. **로컬 Terraform 변수 설정:**

   - `terraform/terraform.tfvars` 파일을 열고 GCP 프로젝트 ID와 로컬 인증에 사용할 JSON 키 파일 경로를 설정합니다.
     terraform
     ```terraform
     gcp_project_id = "bayeon-hwayeon-469602"
     gcp_deployer_sa_key_path = "C:/Path/To/Your/github-actions-deployer-key.json" # 로컬 PC에 저장된 JSON 키 파일 경로
     ```
   - 이 `gcp_deployer_sa_key_path`에 사용될 JSON 키는 `github-actions-deployer@...` 계정의 키 파일입니다.

2. **Terraform 실행:**

   bash

   ```bash
   cd terraform/
   terraform init      # 초기 설정 (최초 1회 또는 provider 변경 시)
   terraform plan      # 배포 계획 미리보기 (변경 사항 확인)
   terraform apply     # 실제 인프라 배포
   ```

   - `terraform apply` 완료 시 Cloud Run 서비스, Artifact Registry, 서비스 계정 권한 등이 생성/설정됩니다. `cloud_run_service_url`이 출력됩니다.

### 4. 코드 배포 (GitHub Actions CI/CD)

코드 변경 시 프론트엔드와 백엔드가 자동으로 배포됩니다.

1. **프론트엔드 코드 변경 시:** (`index.html`, `public/`, `js/` 등)

   - 변경사항 커밋 및 `main` 브랜치 푸시.
   - `deploy-frontend.yml` 워크플로우가 자동으로 Vite 빌드 및 GitHub Pages 배포.
   - `js/api.js` 파일의 `BASE_URL`을 Cloud Run 서비스의 최종 URL로 업데이트 (`terraform apply` 출력 또는 GCP 콘솔에서 확인).

2. **백엔드 코드 변경 시:** (`backend/` 디렉토리 또는 `Dockerfile` 파일)

   - 변경사항 커밋 및 `main` 브랜치 푸시.
   - `deploy-backend.yml` 워크플로우가 자동으로 실행:
     - Docker 이미지 빌드 (`Dockerfile` 기반).
     - Artifact Registry에 이미지 푸시.
     - Cloud Run 서비스에 최신 이미지 배포.
