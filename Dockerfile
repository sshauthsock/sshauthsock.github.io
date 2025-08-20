# 빌드 단계
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Go 모듈 의존성 복사 및 캐싱
COPY backend/go.mod backend/go.sum ./
RUN go mod download

# 나머지 Go 소스 코드 복사
COPY backend/ .

# Go 애플리케이션 빌드
RUN CGO_ENABLED=0 GOOS=linux go build -o /wind-app-backend .

# 최종 실행 단계
FROM alpine:latest

# 필요한 경우 SSL/TLS 인증서 포함
RUN apk --no-cache add ca-certificates

WORKDIR /app

# 빌드 단계에서 생성된 바이너리 복사
COPY --from=builder /wind-app-backend .

# Cloud Run은 PORT 환경 변수를 통해 포트를 알려줌
ENV PORT=8080
# 주석: 이전 경고를 해결하기 위해 ENV 형식을 수정했습니다.
EXPOSE 8080

# 애플리케이션 실행
CMD ["./wind-app-backend"]
