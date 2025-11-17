package config

import (
	"log"
	"os"
)

type Config struct {
	GCPProjectID          string
	ServiceAccountKeyPath string
	Port                  string
	AllowedOrigins        string
	Environment           string
}

func Load() *Config {
	env := os.Getenv("ENVIRONMENT")
	if env == "" {
		env = "production"
	}

	return &Config{
		GCPProjectID:          getEnv("GCP_PROJECT_ID", "baram-yeon"),
		ServiceAccountKeyPath: os.Getenv("GOOGLE_APPLICATION_CREDENTIALS"),
		Port:                  getEnv("PORT", "8080"),
		AllowedOrigins:        getEnv("ALLOWED_ORIGINS", "https://sshauthsock.github.io"),
		Environment:           env,
	}
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		log.Printf("Warning: %s not set, using default: %s", key, defaultValue)
		return defaultValue
	}
	return value
}

