#!/bin/bash
# 이 스크립트는 프로젝트 루트 디렉토리에서 실행된다고 가정합니다.

# GOOGLE_APPLICATION_CREDENTIALS 환경 변수 설정
# 현재 스크립트 파일 위치를 기준으로 config/serviceAccountKey.json 파일의 절대 경로를 설정합니다.
export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/config/serviceAccountKey.json"

# PORT 환경 변수 설정 (backend 앱이 사용할 포트)
export PORT="8080"

# 환경 변수 설정 확인 (디버깅용, 필요 없으면 나중에 삭제 가능)
echo "GOOGLE_APPLICATION_CREDENTIALS=$GOOGLE_APPLICATION_CREDENTIALS"
echo "PORT=$PORT"

echo "Starting backend application (myapp.exe)..."

# myapp.exe 실행
# (참고: 빌드 시 Go 모듈 경로가 `myapp.exe`에 포함되므로 `backend/myapp.exe`가 아니라 `myapp.exe` 입니다.)
backend/myapp.exe

echo "Backend application stopped."
