package logger

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
)

type LogLevel string

const (
	DEBUG LogLevel = "DEBUG"
	INFO  LogLevel = "INFO"
	WARN  LogLevel = "WARN"
	ERROR LogLevel = "ERROR"
)

type Logger struct {
	level  LogLevel
	logger *log.Logger
}

func New() *Logger {
	levelStr := os.Getenv("LOG_LEVEL")
	if levelStr == "" {
		levelStr = "INFO"
	}

	level := LogLevel(levelStr)
	if os.Getenv("ENVIRONMENT") == "production" {
		level = INFO // 프로덕션에서는 DEBUG 로그 제거
	}

	return &Logger{
		level:  level,
		logger: log.New(os.Stdout, "", log.LstdFlags),
	}
}

func (l *Logger) shouldLog(level LogLevel) bool {
	levels := map[LogLevel]int{
		DEBUG: 0,
		INFO:  1,
		WARN:  2,
		ERROR: 3,
	}
	return levels[level] >= levels[l.level]
}

func (l *Logger) Debug(format string, v ...interface{}) {
	if l.shouldLog(DEBUG) {
		l.log("DEBUG", format, v...)
	}
}

func (l *Logger) Info(format string, v ...interface{}) {
	if l.shouldLog(INFO) {
		l.log("INFO", format, v...)
	}
}

func (l *Logger) Warn(format string, v ...interface{}) {
	if l.shouldLog(WARN) {
		l.log("WARN", format, v...)
	}
}

func (l *Logger) Error(format string, v ...interface{}) {
	if l.shouldLog(ERROR) {
		l.log("ERROR", format, v...)
	}
}

func (l *Logger) log(level, format string, v ...interface{}) {
	logEntry := map[string]interface{}{
		"level":   level,
		"message": fmt.Sprintf(format, v...),
	}

	if os.Getenv("ENVIRONMENT") == "production" {
		jsonData, _ := json.Marshal(logEntry)
		l.logger.Println(string(jsonData))
	} else {
		l.logger.Printf("[%s] %s", level, fmt.Sprintf(format, v...))
	}
}

