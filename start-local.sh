#!/bin/bash
# 로컬 개발 환경 전체 실행 스크립트
# Backend와 Frontend를 동시에 실행합니다.

# 프로젝트 루트 디렉토리 확인
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Backend 환경 변수 설정
export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/config/serviceAccountKey.json"
export PORT="8080"
export ENVIRONMENT="development"  # 개발 환경으로 설정 (CORS에서 localhost 허용)

echo "=========================================="
echo "로컬 개발 환경 시작"
echo "=========================================="
echo "Backend: http://localhost:8080"
echo "Frontend: http://localhost:5173"
echo "=========================================="
echo ""

# Backend 프로세스 ID 저장용
BACKEND_PID=""

# 종료 핸들러 함수
cleanup() {
    echo ""
    echo "=========================================="
    echo "로컬 개발 환경 종료 중..."
    echo "=========================================="
    
    # Backend 프로세스 종료
    if [ ! -z "$BACKEND_PID" ]; then
        echo "Backend 프로세스 종료 중... (PID: $BACKEND_PID)"
        kill $BACKEND_PID 2>/dev/null
        wait $BACKEND_PID 2>/dev/null
    fi
    
    # Frontend 프로세스 종료 (Vite는 자동으로 종료됨)
    echo "모든 프로세스 종료 완료"
    exit 0
}

# SIGINT (Ctrl+C) 및 SIGTERM 신호 처리
trap cleanup SIGINT SIGTERM

# Backend 빌드 (코드 변경사항 반영)
echo "Backend 빌드 중..."
cd backend
go build -o myapp.exe . 2>&1
if [ $? -ne 0 ]; then
    echo "XXX Backend 빌드 실패!"
    exit 1
fi
cd ..
echo "VVV Backend 빌드 완료"
echo ""

# Backend를 백그라운드로 실행
echo "Backend 시작 중..."
backend/myapp.exe &
BACKEND_PID=$!

# Backend가 시작될 때까지 잠시 대기
sleep 2

# Backend 프로세스가 실행 중인지 확인
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "XXX Backend 시작 실패!"
    exit 1
fi

echo "VVV Backend 실행 중 (PID: $BACKEND_PID)"
echo ""

# Frontend 실행
echo "Frontend 시작 중..."
npm run dev

# Frontend가 종료되면 cleanup 실행
cleanup

