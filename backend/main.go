package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"
	"unicode"

	"baram-yeon/backend/config"
	"baram-yeon/backend/logger"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go/v4"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"google.golang.org/api/iterator"
	"google.golang.org/api/option"
)

type StatValue struct {
	Level            int                    `json:"level" firestore:"level"`
	BindStat         map[string]interface{} `json:"bindStat,omitempty" firestore:"bindStat,omitempty"`
	RegistrationStat map[string]interface{} `json:"registrationStat,omitempty" firestore:"registrationStat,omitempty"`
}
type CreatureInfo struct {
	Grade     string      `json:"grade,omitempty" firestore:"grade,omitempty"`
	Type      string      `json:"type,omitempty" firestore:"type,omitempty"`
	Influence string      `json:"influence,omitempty" firestore:"influence,omitempty"`
	Name      string      `json:"name" firestore:"name"`
	Image     string      `json:"image" firestore:"image"`
	Stats     []StatValue `json:"stats" firestore:"stats"`
}

type BondCalculationRequest struct {
	Creatures []CreatureInput `json:"creatures"`
}
type CreatureInput struct {
	Name  string `json:"name"`
	Level int    `json:"level"`
}
type StatDetail struct {
	Name  string      `json:"name"`
	Key   string      `json:"key"`
	Value interface{} `json:"value"`
}
type CalculationResult struct {
	Combination    []string       `json:"combination"`
	Spirits        []CreatureInfo `json:"spirits"`
	GradeEffects   []StatDetail   `json:"gradeEffects"`
	FactionEffects []StatDetail   `json:"factionEffects"`
	BindStats      []StatDetail   `json:"bindStats"`
	GradeScore     float64        `json:"gradeScore"`
	FactionScore   float64        `json:"factionScore"`
	BindScore      float64        `json:"bindScore"`
	ScoreWithBind  float64        `json:"scoreWithBind"`
}
type BondRankingItem struct {
	Spirits       []CreatureInfo `json:"spirits"`
	Combination   []string       `json:"combination"`
	GradeScore    float64        `json:"gradeScore"`
	FactionScore  float64        `json:"factionScore"`
	BindScore     float64        `json:"bindScore"`
	ScoreWithBind float64        `json:"scoreWithBind"`
	GradeCounts   map[string]int `json:"gradeCounts"`
	FactionCounts map[string]int `json:"factionCounts"`
}
type StatRankingItem struct {
	Name      string  `json:"name"`
	Image     string  `json:"image"`
	Influence string  `json:"influence"`
	Value     float64 `json:"value"`
}

type SoulCalculationRequest struct {
	Type         string `json:"type"`
	CurrentLevel int    `json:"currentLevel"`
	TargetLevel  int    `json:"targetLevel"`
	OwnedSouls   struct {
		High int `json:"high"`
		Mid  int `json:"mid"`
		Low  int `json:"low"`
	} `json:"ownedSouls"`
}
type SoulCalculationResult struct {
	Required     RequiredSouls `json:"required"`
	MaxLevelInfo MaxLevelInfo  `json:"maxLevelInfo"`
}
type RequiredSouls struct {
	Exp          int            `json:"exp"`
	Souls        map[string]int `json:"souls"`
	IsSufficient bool           `json:"isSufficient"`
	Needed       map[string]int `json:"needed"`
}
type MaxLevelInfo struct {
	Level             int  `json:"level"`
	OwnedExp          int  `json:"ownedExp"`
	RemainingExp      int  `json:"remainingExp"`
	NextLevelExp      int  `json:"nextLevelExp"`
	ProgressPercent   int  `json:"progressPercent"`
	IsTargetReachable bool `json:"isTargetReachable"`
	ExpShortage       int  `json:"expShortage"`
}

var SOUL_VALUES = map[string]int{"high": 1000, "mid": 100, "low": 10}

type ChakDataResponse struct {
	Constants ChakConstants                        `json:"constants"`
	Equipment map[string]map[string]map[string]int `json:"equipment"`
	Costs     map[string]int                       `json:"costs"`
}
type ChakConstants struct {
	Parts  []string `json:"parts"`
	Levels []string `json:"levels"`
}
type ChakStatState map[string]struct {
	Level      int    `json:"level"`
	Value      int    `json:"value"`
	IsUnlocked bool   `json:"isUnlocked"`
	IsFirst    bool   `json:"isFirst"`
	Part       string `json:"part"`
	PartLevel  string `json:"partLevel"`
	StatName   string `json:"statName"`
	MaxValue   int    `json:"maxValue"`
}
type ChakCalculationRequest struct {
	StatState     ChakStatState `json:"statState"`
	UserResources struct {
		GoldButton int `json:"goldButton"`
		ColorBall  int `json:"colorBall"`
	} `json:"userResources"`
}
type ChakCalculationResult struct {
	Summary   map[string]int `json:"summary"`
	Resources struct {
		GoldButton struct {
			Consumed  int `json:"consumed"`
			Remaining int `json:"remaining"`
		} `json:"goldButton"`
		ColorBall struct {
			Consumed  int `json:"consumed"`
			Remaining int `json:"remaining"`
		} `json:"colorBall"`
	} `json:"resources"`
}

type App struct {
	firestoreClient *firestore.Client
	creatureData    []CreatureInfo
	soulExpTable    map[string][]int
	rawChakData     map[string]map[string]map[string]int
	chakConstants   ChakConstants
	chakCosts       map[string]int
	dataLoadMutex   sync.RWMutex
	isDataLoaded    bool
	// 캐시 메타데이터
	creatureDataLastUpdated time.Time
	chakDataLastUpdated     time.Time
	cacheTTL                time.Duration // 캐시 TTL (기본값: 30일)
}

var appLogger = logger.New()


func NewApp(ctx context.Context) (*App, error) {
	var appOpts []option.ClientOption

	err := godotenv.Load("../.env") 
	if err != nil {
		appLogger.Warn(".env file not loaded from ../.env: %v (This is normal in production environments, but unexpected in local build. Check path/encoding/permissions.)", err)
	}

	projectID := os.Getenv("GCP_PROJECT_ID")
	if projectID == "" {
	
		projectID = os.Getenv("GOOGLE_CLOUD_PROJECT")
		if projectID == "" {
			projectID = "baram-yeon" 
			appLogger.Warn("GCP_PROJECT_ID and GOOGLE_CLOUD_PROJECT environment variables not set. Using default: %s", projectID)
		} else {
			appLogger.Info("GCP_PROJECT_ID not set, using GOOGLE_CLOUD_PROJECT: %s", projectID)
		}
	} else {
		appLogger.Info("Using GCP_PROJECT_ID: %s", projectID)
	}


	conf := &firebase.Config{
		ProjectID: projectID,
	}

	// Render/Railway 환경 변수에서 JSON 문자열 확인
	credsJSON := os.Getenv("GOOGLE_APPLICATION_CREDENTIALS_JSON")
	if credsJSON != "" {
		// JSON 문자열을 사용하여 인증 (Render/Railway 환경)
		creds := []byte(credsJSON)
		appOpts = append(appOpts, option.WithCredentialsJSON(creds))
		appLogger.Info("Firebase 앱이 GOOGLE_APPLICATION_CREDENTIALS_JSON 환경 변수를 사용하여 초기화됩니다 (Render/Railway 환경).")
	} else {
		// 로컬 개발 환경: 파일 경로 사용
		serviceAccountPath := os.Getenv("GOOGLE_APPLICATION_CREDENTIALS")
		if serviceAccountPath != "" {
			appOpts = append(appOpts, option.WithCredentialsFile(serviceAccountPath))
			appLogger.Info("Firebase 앱이 '%s' 경로의 서비스 계정 키를 사용하여 초기화됩니다 (로컬 개발 환경).", serviceAccountPath)
		} else {
			// GOOGLE_APPLICATION_CREDENTIALS 환경 변수가 설정되지 않았다면 (Cloud Run 등),
			// appOpts에 credentials 파일을 추가하지 않아 기본 애플리케이션 자격증명(DAC)을 사용하도록 합니다.
			// Cloud Run은 --service-account로 지정된 서비스 계정을 자동으로 사용합니다.
			appLogger.Info("GOOGLE_APPLICATION_CREDENTIALS 환경 변수가 설정되지 않았습니다. 기본 애플리케이션 자격증명(Default Application Credentials)을 사용합니다 (Cloud Run 환경에서 일반적).")
		}
	}

	app, err := firebase.NewApp(ctx, conf, appOpts...)
	if err != nil {
		return nil, fmt.Errorf("error initializing firebase app: %w", err)
	}
	client, err := app.Firestore(ctx)
	if err != nil {
		return nil, fmt.Errorf("error initializing firestore client: %w", err)
	}
	return &App{
		firestoreClient: client,
		chakCosts: map[string]int{
			"unlockFirst":   500,
			"unlockOther":   500,
			"upgradeFirst":  500,
			"upgradeOther0": 400,
			"upgradeOther1": 500,
			"upgradeOther2": 500,
		},
		dataLoadMutex:          sync.RWMutex{},
		isDataLoaded:           true,
		cacheTTL:               30 * 24 * time.Hour, // 기본 TTL: 30일 (당분간 업데이트 없음)
		creatureDataLastUpdated: time.Time{},
		chakDataLastUpdated:     time.Time{},
	}, nil
}

func (a *App) Close() error {
	if a.firestoreClient != nil {
		return a.firestoreClient.Close()
	}
	return nil
}

func (a *App) loadAllCreatureData(ctx context.Context) error {
	a.dataLoadMutex.Lock()
	defer a.dataLoadMutex.Unlock()

	appLogger.Info("Loading all creature data from the 'creatures' collection...")

	iter := a.firestoreClient.Collection("creatures").Documents(ctx)
	defer iter.Stop()

	var finalCreatureList []CreatureInfo

	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return fmt.Errorf("failed to iterate creature documents from 'creatures' collection: %w", err)
		}

		var creature CreatureInfo
		if err := doc.DataTo(&creature); err != nil {
			appLogger.Warn("Failed to convert document %s to CreatureInfo from 'creatures' collection. Skipping. %v", doc.Ref.ID, err)
			continue
		}

		sort.Slice(creature.Stats, func(i, j int) bool {
			return creature.Stats[i].Level < creature.Stats[j].Level
		})

		finalCreatureList = append(finalCreatureList, creature)
	}

	a.creatureData = finalCreatureList
	a.creatureDataLastUpdated = time.Now()
	appLogger.Info("Successfully loaded %d unique creature data entries from 'creatures' collection. Cache updated at %s", len(a.creatureData), a.creatureDataLastUpdated.Format(time.RFC3339))
	return nil
}

func (a *App) loadSoulExpTableData() {
	a.dataLoadMutex.Lock()
	defer a.dataLoadMutex.Unlock()
	appLogger.Info("Loading soul exp table...")
	a.soulExpTable = map[string][]int{
		"legend":   {0, 717, 789, 867, 1302, 1431, 1575, 1732, 1905, 3239, 3563, 3919, 4312, 4742, 9484, 10433, 11476, 17214, 18935, 28403, 31243, 31868, 32505, 33155, 33818, 33818},           // Lv 0-25, total 26 elements
		"immortal": {0, 2151, 2367, 2601, 3906, 4293, 4725, 5196, 5715, 9717, 10689, 11757, 12936, 14226, 28452, 31299, 34428, 51642, 56805, 85209, 93729, 95604, 97515, 99465, 101454, 101454}, // Lv 0-25, total 26 elements
	}
	appLogger.Info("Soul exp table loaded.")
}

func (a *App) loadChakDataFromFirestore(ctx context.Context) error {
	a.dataLoadMutex.Lock()
	defer a.dataLoadMutex.Unlock()
	appLogger.Info("Loading chak data from Firestore...")
	// chakData still in jsonData
	// 문서 ID는 환경 변수에서 가져오거나, 최신 문서를 자동으로 찾도록 개선 필요
	chakDocID := os.Getenv("CHAK_DATA_DOC_ID")
	if chakDocID == "" {
		chakDocID = "data-1745204108850" // 기본값 (하위 호환성)
		appLogger.Warn("CHAK_DATA_DOC_ID environment variable not set, using default: %s", chakDocID)
	}
	doc, err := a.firestoreClient.Collection("jsonData").Doc(chakDocID).Get(ctx)
	if err != nil {
		return fmt.Errorf("failed to get chakData from Firestore: %w", err)
	}

	if err := doc.DataTo(&a.rawChakData); err != nil {
		return fmt.Errorf("failed to unmarshal chakData from Firestore document: %w", err)
	}

	if len(a.rawChakData) == 0 {
		return fmt.Errorf("chak data was unmarshalled but is empty. Check Firestore document structure")
	}

	//동일 부위에서 동일 레벨에 중복 스텟이있는경우 1 을 추가 예를들어 피해저항1
	partsForUI := []string{"투구", "무기", "방패", "의상", "망토", "신발", "목걸이", "반지", "반지", "보조", "보조"}
	levelsSet := make(map[string]bool)
	for _, partData := range a.rawChakData {
		for level := range partData {
			levelsSet[level] = true
		}
	}

	levels := make([]string, 0, len(levelsSet))
	for level := range levelsSet {
		levels = append(levels, level)
	}
	sort.Slice(levels, func(i, j int) bool {
		numI, _ := strconv.Atoi(strings.TrimPrefix(levels[i], "lv"))
		numJ, _ := strconv.Atoi(strings.TrimPrefix(levels[j], "lv"))
		return numI < numJ
	})

	formattedLevels := make([]string, len(levels))
	for i, lv := range levels {
		num, _ := strconv.Atoi(strings.TrimPrefix(lv, "lv"))
		formattedLevels[i] = fmt.Sprintf("+%d", num)
	}

	a.chakConstants = ChakConstants{
		Parts:  partsForUI,
		Levels: formattedLevels,
	}

	a.chakDataLastUpdated = time.Now()
	appLogger.Info("Chak data loaded successfully. Cache updated at %s", a.chakDataLastUpdated.Format(time.RFC3339))
	return nil
}

func main() {
	appLogger.Info("Starting server...")
	
	// 프로덕션 환경에서는 Gin을 release 모드로 설정
	if os.Getenv("ENVIRONMENT") == "production" || os.Getenv("GIN_MODE") == "release" {
		gin.SetMode(gin.ReleaseMode)
		appLogger.Info("Gin running in release mode")
	}
	
	err := godotenv.Load()
	if err != nil {
		appLogger.Warn(".env file not loaded: %v (This is normal in production environments)", err)
	}

	rand.Seed(time.Now().UnixNano())

	ctx := context.Background()
	app, err := NewApp(ctx)
	if err != nil {
		appLogger.Error("Failed to initialize application: %v", err)
		log.Fatalf("FATAL: Failed to initialize application: %v", err)
	}
	defer app.Close()

	var wg sync.WaitGroup
	errChan := make(chan error, 2) // creature data와 chak data 로드

	wg.Add(1)
	go func() {
		defer wg.Done()
		if err := app.loadAllCreatureData(ctx); err != nil {
			errChan <- fmt.Errorf("creature data loading failed: %w", err)
		}
	}()

	wg.Add(1)
	go func() {
		defer wg.Done()
		if err := app.loadChakDataFromFirestore(ctx); err != nil {
			errChan <- fmt.Errorf("chak data loading failed: %w", err)
		}
	}()

	app.loadSoulExpTableData()

	wg.Wait()
	close(errChan)

	app.dataLoadMutex.Lock()
	for loadErr := range errChan {
		appLogger.Error("Error during initial data load: %v", loadErr)
		app.isDataLoaded = false // If ANY error, mark as not fully loaded
	}
	if app.isDataLoaded {
		appLogger.Info("All initial data loaded successfully.")
	} else {
		appLogger.Warn("Not all initial data loaded successfully. Some API endpoints may not function.")
	}
	app.dataLoadMutex.Unlock()

	// 백그라운드 캐시 자동 갱신 시작
	go app.startCacheRefreshLoop(ctx)

	router := gin.Default()
	
	// Render.com 프록시 환경을 위한 설정
	// Render.com은 프록시를 사용하므로 X-Forwarded-* 헤더를 신뢰해야 함
	router.SetTrustedProxies([]string{"0.0.0.0/0"}) // Render.com의 모든 프록시 신뢰
	router.ForwardedByClientIP = true
	
	// CORS 보안 강화: 특정 도메인만 허용
	cfg := config.Load()
	corsConfig := cors.DefaultConfig()
	
	// 환경 변수에서 허용된 Origin 목록 가져오기
	allowedOrigins := cfg.AllowedOrigins
	if allowedOrigins == "" {
		// 기본값: 프로덕션 도메인
		allowedOrigins = "https://sshauthsock.github.io"
	}
	
	// 쉼표로 구분된 Origin 목록을 배열로 변환
	originsList := strings.Split(allowedOrigins, ",")
	// 공백 제거
	for i := range originsList {
		originsList[i] = strings.TrimSpace(originsList[i])
	}
	
	// 개발 환경일 때 localhost 자동 추가
	if cfg.Environment != "production" {
		localhostOrigins := []string{
			"http://localhost:5173",
			"http://localhost:3000",
			"http://127.0.0.1:5173",
			"http://127.0.0.1:3000",
			"http://[::1]:5173",
			"http://[::1]:3000",
		}
		// 중복 제거하면서 localhost 추가
		originMap := make(map[string]bool)
		for _, origin := range originsList {
			originMap[origin] = true
		}
		for _, origin := range localhostOrigins {
			if !originMap[origin] {
				originsList = append(originsList, origin)
			}
		}
		appLogger.Info("Development mode: Added localhost origins to CORS")
	}
	
	corsConfig.AllowOrigins = originsList
	corsConfig.AllowAllOrigins = false // 모든 Origin 허용 비활성화
	corsConfig.AllowMethods = []string{"GET", "POST", "OPTIONS"}
	corsConfig.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	corsConfig.AllowCredentials = false // Credentials 허용 안 함 (보안)
	corsConfig.ExposeHeaders = []string{"Content-Length", "Content-Type"} // 노출할 헤더
	corsConfig.MaxAge = 12 * time.Hour // Preflight 캐시 시간
	
	appLogger.Info("CORS configured. Allowed origins: %v", originsList)
	router.Use(cors.New(corsConfig))

	// 보안 헤더 미들웨어 적용 (모든 요청에 대해 보안 헤더 추가)
	router.Use(SecurityHeadersMiddleware())

	// 모니터링 미들웨어 적용 (모든 요청에 대해 메트릭 수집)
	router.Use(MonitoringMiddleware())

	// Rate Limiting 미들웨어 적용 (API 엔드포인트에만)
	// 요청 본문 크기 제한: 1MB (POST 요청에만 적용)
	router.Use(MaxBodySizeMiddleware(1 << 20)) // 1MB

	// Health check 엔드포인트 (모니터링 미들웨어 적용, Rate Limiting 제외)
	router.GET("/health", app.healthCheckHandler)

	api := router.Group("/api")
	// API 그룹에 Rate Limiting 적용
	api.Use(RateLimitMiddleware())
	{
		api.GET("/alldata", app.getAllData)
		api.POST("/calculate/bond", app.calculateBond)
		api.GET("/rankings", app.getRankingsHandler)
		api.GET("/soul/exp-table", app.getSoulExpTable)
		api.POST("/calculate/soul", app.calculateSoulHandler)
		api.GET("/chak/data", app.getChakData)
		api.POST("/calculate/chak", app.calculateChakHandler)
		// 캐시 관리 엔드포인트
		api.GET("/cache/status", app.getCacheStatus)
		api.POST("/cache/refresh", app.refreshCache)
		// 모니터링 엔드포인트
		api.GET("/metrics", app.getMetricsHandler)
	}

	appLogger.Info("Server is running on port %s", cfg.Port)
	router.Run(":" + cfg.Port)
}

// ======== 핸들러 함수들 ========
func (a *App) checkDataReady(c *gin.Context) bool {
	a.dataLoadMutex.RLock()
	defer a.dataLoadMutex.RUnlock()
	if !a.isDataLoaded {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Server is still loading initial data or failed to load. Please try again shortly."})
		return false
	}
	return true
}

func (a *App) getAllData(c *gin.Context) {
	if !a.checkDataReady(c) {
		return
	}
	a.dataLoadMutex.RLock()
	defer a.dataLoadMutex.RUnlock()
	c.JSON(http.StatusOK, a.creatureData)
}

func (a *App) calculateBond(c *gin.Context) {
	if !a.checkDataReady(c) {
		return
	}
	var req BondCalculationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		appLogger.Warn("Invalid JSON in calculateBond request: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body format"})
		return
	}

	// 입력 검증
	if err := validateBondRequest(&req); err != nil {
		appLogger.Warn("Validation failed in calculateBond: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	numCreatures := len(req.Creatures)

	a.dataLoadMutex.RLock()
	defer a.dataLoadMutex.RUnlock()

	var creatureType string
	if len(req.Creatures) > 0 {
		for _, creatureData := range a.creatureData {
			if creatureData.Name == req.Creatures[0].Name {
				creatureType = creatureData.Type
				break
			}
		}
	}

	if creatureType == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Could not determine a valid creature type from the provided creatures"})
		return
	}

	// 필터링 비활성화: 최적 조합을 놓치지 않도록 모든 환수 사용
	// 필터링이 최적 조합에 필요한 환수를 제외할 수 있음
	filteredCreatures := req.Creatures
	
	// 디버깅: 선택된 환수 목록 로그
	if numCreatures > 6 {
		appLogger.Info("Using all %d selected creatures for calculation (no filtering applied)", numCreatures)
		
		// 필터링 후에도 여전히 많으면 상위 우선순위 환수만 선택
		// Render.com 무료 플랜 타임아웃(약 2분)을 고려하여 조정
		maxForExhaustive := 20 // 20C6 = 38,760 조합 (타임아웃 내 계산 가능)
		if numCreatures > maxForExhaustive {
			filteredCreatures = selectTopPriorityCreatures(req.Creatures, a.creatureData, maxForExhaustive)
			appLogger.Info("Selected top %d priority creatures from %d total for calculation.", maxForExhaustive, numCreatures)
		}
	}

	var result CalculationResult
	startTime := time.Now()

	if len(filteredCreatures) <= 6 {
		appLogger.Info("Calculating simple sum for %d creatures of type '%s'.", len(filteredCreatures), creatureType)
		result = calculateCombinationStats(filteredCreatures, creatureType, a.creatureData) // Pass a.creatureData
	} else {
		// Render.com 무료 플랜 타임아웃(약 2분)을 고려하여 알고리즘 선택
		// 20개 이하: exhaustive search (20C6 = 38,760 조합, 타임아웃 내 계산 가능)
		// 20개 초과: GA 사용 (너무 많은 조합으로 exhaustive search가 타임아웃 발생)
		maxExhaustiveSearch := 20 // Render.com 타임아웃을 고려하여 30 → 20으로 조정
		if len(filteredCreatures) <= maxExhaustiveSearch {
			appLogger.Info("Using exhaustive search to find optimal combination from %d filtered creatures of type '%s' (deterministic result).", len(filteredCreatures), creatureType)
			result = findOptimalCombinationExhaustive(filteredCreatures, creatureType, a.creatureData)
		} else {
			appLogger.Info("Using genetic algorithm to find optimal combination from %d filtered creatures of type '%s' (too many for exhaustive search, using GA for faster convergence).", len(filteredCreatures), creatureType)
			result = findOptimalCombinationWithGA(filteredCreatures, creatureType, a.creatureData)
		}
	}

	elapsedTime := time.Since(startTime)
	appLogger.Info("Calculation took %s", elapsedTime)

	c.JSON(http.StatusOK, result)
}

func (a *App) getRankingsHandler(c *gin.Context) {
	if !a.checkDataReady(c) {
		return
	}
	category := c.Query("category")
	rankingType := c.Query("type")

	if category == "" || rankingType == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "category and type query parameters are required"})
		return
	}

	a.dataLoadMutex.RLock()
	defer a.dataLoadMutex.RUnlock()

	switch rankingType {
	case "bond":
		rankings := calculateBondRankings(category, a.creatureData) // Pass a.creatureData
		c.JSON(http.StatusOK, gin.H{"rankings": rankings})
	case "stat":
		statKey := c.Query("statKey")
		if statKey == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "statKey query parameter is required for stat ranking"})
			return
		}
		rankings := calculateStatRankings(category, statKey, a.creatureData) // Pass a.creatureData
		c.JSON(http.StatusOK, gin.H{"rankings": rankings})
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid ranking type"})
	}
}

func (a *App) getSoulExpTable(c *gin.Context) {
	if !a.checkDataReady(c) {
		return
	}
	a.dataLoadMutex.RLock()
	defer a.dataLoadMutex.RUnlock()
	if a.soulExpTable == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Soul experience table not loaded"})
		return
	}
	c.JSON(http.StatusOK, a.soulExpTable)
}

func (a *App) calculateSoulHandler(c *gin.Context) {
	if !a.checkDataReady(c) {
		return
	}
	var req SoulCalculationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		appLogger.Warn("Invalid JSON in calculateSoulHandler request: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body format"})
		return
	}

	// 입력 검증
	if err := validateSoulRequest(&req); err != nil {
		appLogger.Warn("Validation failed in calculateSoulHandler: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	a.dataLoadMutex.RLock()
	defer a.dataLoadMutex.RUnlock()

	result, err := calculateSoulStats(req, a.soulExpTable) // Pass a.soulExpTable
	if err != nil {
		appLogger.Error("calculateSoulStats failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to calculate soul stats. Please try again."})
		return
	}
	if jsonBytes, marshalErr := json.Marshal(result); marshalErr == nil {
		log.Printf("DEBUG: calculateSoulStats successful response: %s", string(jsonBytes))
	} else {
		log.Printf("DEBUG: calculateSoulStats successful, but failed to marshal result for logging: %v", marshalErr)
	}
	c.JSON(http.StatusOK, result)
}

func (a *App) getChakData(c *gin.Context) {
	if !a.checkDataReady(c) {
		return
	}
	a.dataLoadMutex.RLock()
	defer a.dataLoadMutex.RUnlock()

	if a.rawChakData == nil || a.chakConstants.Parts == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Chak data not loaded"})
		return
	}

	response := ChakDataResponse{
		Constants: a.chakConstants,
		Equipment: a.rawChakData,
		Costs:     a.chakCosts,
	}

	c.JSON(http.StatusOK, response)
}

func (a *App) calculateChakHandler(c *gin.Context) {
	if !a.checkDataReady(c) {
		return
	}
	var req ChakCalculationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		appLogger.Warn("Invalid JSON in calculateChakHandler request: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body format"})
		return
	}

	// 입력 검증
	if err := validateChakRequest(&req); err != nil {
		appLogger.Warn("Validation failed in calculateChakHandler: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	a.dataLoadMutex.RLock()
	defer a.dataLoadMutex.RUnlock()

	result, err := calculateChakStats(req, a.rawChakData, a.chakCosts)
	if err != nil {
		appLogger.Error("calculateChakStats failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to calculate chak stats. Please try again."})
		return
	}
	c.JSON(http.StatusOK, result)
}

func calculateBondRankings(category string, allCreatureData []CreatureInfo) []BondRankingItem {
	var allCategoryCreatures []CreatureInfo
	for _, creature := range allCreatureData {
		if creature.Type == category {
			allCategoryCreatures = append(allCategoryCreatures, creature)
		}
	}

	if len(allCategoryCreatures) < 6 {
		return []BondRankingItem{}
	}

	creature25Stats := make(map[string]map[string]interface{})
	for _, c := range allCategoryCreatures {
		for _, s := range c.Stats {
			if s.Level == 25 {
				// Combine bind and registration stats for a comprehensive score for selection
				combinedStats := make(map[string]interface{})
				if s.BindStat != nil {
					for k, v := range s.BindStat {
						combinedStats[k] = v
					}
				}
				if s.RegistrationStat != nil {
					for k, v := range s.RegistrationStat {
						// Summing up if key exists, otherwise add
						if existingVal, ok := combinedStats[k]; ok {
							combinedStats[k] = ToFloat(existingVal) + ToFloat(v) // utils.ToFloat 사용
						} else {
							combinedStats[k] = v
						}
					}
				}
				creature25Stats[c.Name] = combinedStats
				break
			}
		}
	}

	// 환수를 등급, 그리고 25레벨 기준 점수로 정렬 (높은 등급, 높은 점수 우선)
	sort.SliceStable(allCategoryCreatures, func(i, j int) bool {
		gradeOrder := map[string]int{"불멸": 1, "전설": 2}
		orderA := gradeOrder[allCategoryCreatures[i].Grade]
		orderB := gradeOrder[allCategoryCreatures[j].Grade]

		if orderA != orderB {
			return orderA < orderB // 불멸 우선, 그 다음 전설
		}

		// 같은 등급 내에서는 25레벨 점수 기준으로 내림차순 정렬
		scoreA := calculateWeightedScore(creature25Stats[allCategoryCreatures[i].Name])
		scoreB := calculateWeightedScore(creature25Stats[allCategoryCreatures[j].Name])
		return scoreA > scoreB
	})

	// maxCandidatesForCombination 값을 조절하여 계산 부하를 관리. (예: 10, 12, 15)
	maxCandidatesForCombination := 15
	var candidatesForRanking []CreatureInfo
	if len(allCategoryCreatures) > maxCandidatesForCombination {
		candidatesForRanking = allCategoryCreatures[:maxCandidatesForCombination]
	} else {
		candidatesForRanking = allCategoryCreatures
	}

	log.Printf("Generating bond combinations from %d selected candidates (max %d) for category %s.", len(candidatesForRanking), maxCandidatesForCombination, category)

	combinations := [][]CreatureInfo{}
	// generateCombinations 함수에 선별된 candidatesForRanking 전달
	generateCombinations(candidatesForRanking, 6, 0, []CreatureInfo{}, &combinations)

	var results []BondRankingItem
	for _, combo := range combinations {
		var inputs []CreatureInput
		for _, creature := range combo {
			inputs = append(inputs, CreatureInput{Name: creature.Name, Level: 25}) // 랭킹은 25레벨 기준
		}

		// calculateCombinationStats 호출 시 allCreatureData 전달
		calcResult := calculateCombinationStats(inputs, category, allCreatureData)

		bondItem := BondRankingItem{
			Spirits:       combo,
			Combination:   calcResult.Combination,
			GradeScore:    calcResult.GradeScore,
			FactionScore:  calcResult.FactionScore,
			BindScore:     calcResult.BindScore,
			ScoreWithBind: calcResult.ScoreWithBind,
			GradeCounts:   countGrades(combo),
			FactionCounts: countFactions(combo),
		}
		results = append(results, bondItem)
	}

	// 최종 결과를 점수 기준으로 내림차순 정렬
	sort.Slice(results, func(i, j int) bool {
		return results[i].ScoreWithBind > results[j].ScoreWithBind
	})

	// 상위 100개만 반환하여 프론트엔드 전송 데이터 양 조절
	if len(results) > 100 {
		return results[:100]
	}
	return results
}

func calculateStatRankings(category string, statKey string, allCreatureData []CreatureInfo) []StatRankingItem {
	var results []StatRankingItem

	for _, creature := range allCreatureData {
		if creature.Type == category {
			var totalValue float64 // totalValue는 항상 float64

			isBindScore := statKey == "bind"
			isRegScore := statKey == "registration"

			for _, stat := range creature.Stats {
				if stat.Level == 25 { // Always use max level for rankings
					if isBindScore && stat.BindStat != nil {
						totalValue = calculateWeightedScore(stat.BindStat)
					} else if isRegScore && stat.RegistrationStat != nil {
						totalValue = calculateWeightedScore(stat.RegistrationStat)
					} else { // Specific stat key (e.g., "damageResistance")
						bindVal, bindOk := stat.BindStat[statKey]
						regVal, regOk := stat.RegistrationStat[statKey]

						if !bindOk && !regOk {
							totalValue = 0.0
							log.Printf("Debug: StatKey '%s' not found for creature '%s' at Lv 25. Value set to 0.0", statKey, creature.Name)
						} else {
							convertedBindVal := ToFloat(bindVal) // utils.ToFloat 사용
							convertedRegVal := ToFloat(regVal)   // utils.ToFloat 사용
							totalValue = convertedBindVal + convertedRegVal
							log.Printf("Debug: Creature '%s' StatKey '%s' (Bind: %v, Reg: %v) -> Calculated totalValue: %f", creature.Name, statKey, bindVal, regVal, totalValue)
						}
					}
					break // Found level 25 stats, no need to check other levels
				}
			}

			results = append(results, StatRankingItem{
				Name:      creature.Name,
				Image:     creature.Image,
				Influence: creature.Influence,
				Value:     totalValue, // float64로 할당됨을 컴파일러가 보장
			})
		}
	}

	sort.Slice(results, func(i, j int) bool {
		return results[i].Value > results[j].Value
	})

	return results
}


// generateCombinations is a recursive helper for combination generation.
func generateCombinations(items []CreatureInfo, k, start int, current []CreatureInfo, result *[][]CreatureInfo) {
	if len(current) == k {
		combo := make([]CreatureInfo, k)
		copy(combo, current)
		*result = append(*result, combo)
		return
	}
	for i := start; i < len(items); i++ {
		generateCombinations(items, k, i+1, append(current, items[i]), result)
	}
}

func countGrades(combo []CreatureInfo) map[string]int {
	counts := make(map[string]int)
	for _, c := range combo {
		counts[c.Grade]++
	}
	return counts
}

func countFactions(combo []CreatureInfo) map[string]int {
	counts := make(map[string]int)
	for _, c := range combo {
		counts[c.Influence]++
	}
	return counts
}

// calculateWeightedScore calculates a specific score based on predefined stats.
func calculateWeightedScore(stats map[string]interface{}) float64 {
	var score float64
	score += ToFloat(stats["damageResistancePenetration"]) // utils.ToFloat 사용
	score += ToFloat(stats["damageResistance"])            // utils.ToFloat 사용
	score += ToFloat(stats["pvpDamagePercent"]) * 10       // utils.ToFloat 사용
	score += ToFloat(stats["pvpDefensePercent"]) * 10      // utils.ToFloat 사용
	return score
}

// calculateSoulStats calculates required and reachable levels for soul enhancement.
func calculateSoulStats(req SoulCalculationRequest, expTable map[string][]int) (SoulCalculationResult, error) {
	log.Printf("DEBUG: calculateSoulStats called with CurrentLevel: %d, TargetLevel: %d, Type: %s, OwnedSouls: %+v",
		req.CurrentLevel, req.TargetLevel, req.Type, req.OwnedSouls)

	soulExpTableForType, ok := expTable[req.Type]
	if !ok {
		return SoulCalculationResult{}, fmt.Errorf("invalid soul type: %s", req.Type)
	}

	totalRequiredExp := 0
	if req.TargetLevel > req.CurrentLevel {
		if req.TargetLevel >= len(soulExpTableForType) {
			return SoulCalculationResult{}, fmt.Errorf("target level %d is out of bounds for %s type (max %d)", req.TargetLevel, req.Type, len(soulExpTableForType)-1)
		}
		for i := req.CurrentLevel + 1; i <= req.TargetLevel; i++ {
			totalRequiredExp += soulExpTableForType[i]
		}
	} else if req.TargetLevel <= req.CurrentLevel {
		log.Printf("DEBUG: TargetLevel (%d) is <= CurrentLevel (%d), no exp required.", req.TargetLevel, req.CurrentLevel)
		totalRequiredExp = 0
	}
	log.Printf("DEBUG: Total required exp: %d", totalRequiredExp)

	requiredSouls := RequiredSouls{
		Exp:    totalRequiredExp,
		Souls:  make(map[string]int),
		Needed: make(map[string]int),
	}
	tempExp := totalRequiredExp
	requiredSouls.Souls["high"] = tempExp / SOUL_VALUES["high"]
	tempExp %= SOUL_VALUES["high"]
	requiredSouls.Souls["mid"] = tempExp / SOUL_VALUES["mid"]
	tempExp %= SOUL_VALUES["mid"]
	requiredSouls.Souls["low"] = (tempExp + SOUL_VALUES["low"] - 1) / SOUL_VALUES["low"] // Round up low souls
	log.Printf("DEBUG: Required souls (high: %d, mid: %d, low: %d)", requiredSouls.Souls["high"], requiredSouls.Souls["mid"], requiredSouls.Souls["low"])

	ownedExp := req.OwnedSouls.High*SOUL_VALUES["high"] + req.OwnedSouls.Mid*SOUL_VALUES["mid"] + req.OwnedSouls.Low*SOUL_VALUES["low"]
	log.Printf("DEBUG: Total owned exp: %d", ownedExp)

	maxLevelInfo := MaxLevelInfo{
		Level:    req.CurrentLevel,
		OwnedExp: ownedExp,
	}

	remainingOwnedExp := ownedExp
	for i := req.CurrentLevel + 1; i < len(soulExpTableForType); i++ {
		if remainingOwnedExp >= soulExpTableForType[i] {
			remainingOwnedExp -= soulExpTableForType[i]
			maxLevelInfo.Level = i
			log.Printf("DEBUG: Reached Lv %d, remaining exp: %d", maxLevelInfo.Level, remainingOwnedExp)
		} else {
			log.Printf("DEBUG: Cannot reach Lv %d, not enough exp. Exp needed: %d", i, soulExpTableForType[i])
			break
		}
	}
	maxLevelInfo.RemainingExp = remainingOwnedExp
	if maxLevelInfo.Level < len(soulExpTableForType)-1 {
		maxLevelInfo.NextLevelExp = soulExpTableForType[maxLevelInfo.Level+1]
		if maxLevelInfo.NextLevelExp > 0 {
			maxLevelInfo.ProgressPercent = (remainingOwnedExp * 100) / maxLevelInfo.NextLevelExp
		}
	} else {
		maxLevelInfo.NextLevelExp = 0
		maxLevelInfo.ProgressPercent = 100
	}
	log.Printf("DEBUG: MaxLevelInfo after calculation: %+v", maxLevelInfo)

	requiredSouls.IsSufficient = ownedExp >= totalRequiredExp
	maxLevelInfo.IsTargetReachable = maxLevelInfo.Level >= req.TargetLevel
	if !requiredSouls.IsSufficient {
		neededExp := totalRequiredExp - ownedExp
		if neededExp < 0 {
			neededExp = 0
		}
		maxLevelInfo.ExpShortage = neededExp
		requiredSouls.Needed["high"] = neededExp / SOUL_VALUES["high"]
		neededExp %= SOUL_VALUES["high"]
		requiredSouls.Needed["mid"] = neededExp / SOUL_VALUES["mid"]
		neededExp %= SOUL_VALUES["mid"]
		requiredSouls.Needed["low"] = (neededExp + SOUL_VALUES["low"] - 1) / SOUL_VALUES["low"]
		log.Printf("DEBUG: Needed souls (high: %d, mid: %d, low: %d)", requiredSouls.Needed["high"], requiredSouls.Needed["mid"], requiredSouls.Needed["low"])
	}

	return SoulCalculationResult{
		Required:     requiredSouls,
		MaxLevelInfo: maxLevelInfo,
	}, nil
}

// calculateChakStats calculates the total stats and resources consumed for Chak.
func calculateChakStats(req ChakCalculationRequest, rawChakData map[string]map[string]map[string]int, chakCosts map[string]int) (ChakCalculationResult, error) {
	summary := make(map[string]int)
	var consumedGold, consumedBalls int

	for _, state := range req.StatState {
		if state.IsUnlocked {
			displayName := strings.TrimRightFunc(state.StatName, func(r rune) bool {
				return unicode.IsDigit(r)
			})
			summary[displayName] += state.Value
		}
	}

	for _, state := range req.StatState {
		if !state.IsUnlocked {
			continue
		}

		if state.IsFirst {
			consumedBalls += state.Level * chakCosts["upgradeFirst"]
		} else {
			consumedGold += chakCosts["unlockOther"]
			if state.Level >= 1 {
				consumedBalls += chakCosts["upgradeOther0"]
			}
			if state.Level >= 2 {
				consumedBalls += chakCosts["upgradeOther1"]
			}
			if state.Level >= 3 {
				consumedBalls += chakCosts["upgradeOther2"]
			}
		}
	}

	result := ChakCalculationResult{
		Summary: summary,
	}
	result.Resources.GoldButton.Consumed = consumedGold
	result.Resources.GoldButton.Remaining = req.UserResources.GoldButton - consumedGold
	result.Resources.ColorBall.Consumed = consumedBalls
	result.Resources.ColorBall.Remaining = req.UserResources.ColorBall - consumedBalls

	return result, nil
}

// ======== 캐시 관리 함수들 ========

// startCacheRefreshLoop: 백그라운드에서 주기적으로 캐시를 갱신하는 루프
func (a *App) startCacheRefreshLoop(ctx context.Context) {
	ticker := time.NewTicker(a.cacheTTL)
	defer ticker.Stop()

	appLogger.Info("Cache refresh loop started. TTL: %v", a.cacheTTL)

	for {
		select {
		case <-ticker.C:
			appLogger.Info("Starting scheduled cache refresh...")
			
			// Creature 데이터 갱신
			if err := a.loadAllCreatureData(ctx); err != nil {
				appLogger.Error("Failed to refresh creature data cache: %v", err)
			} else {
				appLogger.Info("Creature data cache refreshed successfully")
			}

			// Chak 데이터 갱신
			if err := a.loadChakDataFromFirestore(ctx); err != nil {
				appLogger.Error("Failed to refresh chak data cache: %v", err)
			} else {
				appLogger.Info("Chak data cache refreshed successfully")
			}
		case <-ctx.Done():
			appLogger.Info("Cache refresh loop stopped")
			return
		}
	}
}

// getCacheStatus: 캐시 상태를 반환하는 엔드포인트
func (a *App) getCacheStatus(c *gin.Context) {
	a.dataLoadMutex.RLock()
	defer a.dataLoadMutex.RUnlock()

	creatureAge := time.Since(a.creatureDataLastUpdated)
	chakAge := time.Since(a.chakDataLastUpdated)

	status := gin.H{
		"isDataLoaded": a.isDataLoaded,
		"cacheTTL":     a.cacheTTL.String(),
		"creatureData": gin.H{
			"count":        len(a.creatureData),
			"lastUpdated":  a.creatureDataLastUpdated.Format(time.RFC3339),
			"age":          creatureAge.String(),
			"needsRefresh": creatureAge > a.cacheTTL,
		},
		"chakData": gin.H{
			"lastUpdated":  a.chakDataLastUpdated.Format(time.RFC3339),
			"age":          chakAge.String(),
			"needsRefresh": chakAge > a.cacheTTL,
		},
	}

	c.JSON(http.StatusOK, status)
}

// refreshCache: 수동으로 캐시를 갱신하는 엔드포인트
func (a *App) refreshCache(c *gin.Context) {
	// 요청 컨텍스트 사용 (타임아웃 및 취소 지원)
	ctx := c.Request.Context()
	
	var refreshType string
	if refreshType = c.Query("type"); refreshType == "" {
		refreshType = "all"
	}

	results := make(map[string]string)

	switch refreshType {
	case "creature", "all":
		if err := a.loadAllCreatureData(ctx); err != nil {
			results["creature"] = fmt.Sprintf("Failed: %v", err)
			appLogger.Error("Manual cache refresh failed for creature data: %v", err)
		} else {
			results["creature"] = "Success"
			appLogger.Info("Manual cache refresh succeeded for creature data")
		}

		if refreshType == "creature" {
			break
		}
		fallthrough
	case "chak":
		if err := a.loadChakDataFromFirestore(ctx); err != nil {
			results["chak"] = fmt.Sprintf("Failed: %v", err)
			appLogger.Error("Manual cache refresh failed for chak data: %v", err)
		} else {
			results["chak"] = "Success"
			appLogger.Info("Manual cache refresh succeeded for chak data")
		}
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid refresh type. Use 'creature', 'chak', or 'all'"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Cache refresh completed",
		"results": results,
	})
}
