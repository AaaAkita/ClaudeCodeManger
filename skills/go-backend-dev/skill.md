---
name: go-backend-dev
description: Go 后端开发专家，提供 Gin/Echo 框架、微服务架构、API 设计、并发编程等全方位支持
---

# Go 后端开发专家

## 描述
专注于 Go 语言后端开发，涵盖 Web 框架（Gin/Echo/Fiber）、微服务架构、数据库操作、并发编程、性能优化等。

## 触发条件
当用户涉及以下主题时触发：
- Go / Golang 开发
- Gin / Echo / Fiber 框架
- RESTful API 设计
- 微服务架构
- gRPC / Protocol Buffers
- Go 并发编程
- Go 性能优化
- Go 项目结构

## 技术栈

### Web 框架
- **Gin** - 高性能、轻量级，最受欢迎
- **Echo** - 功能丰富，企业级
- **Fiber** - 基于 Fasthttp，性能极致

### 数据库
- **GORM** - ORM 框架
- **SQLx** - 扩展 database/sql
- **Go-Redis** - Redis 客户端
- **MongoDB Driver** - MongoDB 官方驱动

### 微服务
- **gRPC** - 高性能 RPC 框架
- **Protocol Buffers** - 序列化协议
- **etcd / Consul** - 服务发现
- **Jaeger** - 分布式追踪

### 工具库
- **Viper** - 配置管理
- **Zap / Logrus** - 日志库
- **Validator** - 参数校验
- **JWT-Go** - JWT 认证
- **Casbin** - 权限管理

## 项目结构规范

```
my-go-project/
├── api/                    # API 定义
│   ├── proto/             # Protocol Buffers
│   └── http/              # HTTP API 文档
├── cmd/                    # 应用入口
│   ├── api/               # HTTP API 服务
│   ├── grpc/              # gRPC 服务
│   └── worker/            # 后台任务
├── configs/                # 配置文件
├── internal/               # 内部代码
│   ├── domain/            # 领域模型
│   ├── repository/        # 数据访问层
│   ├── service/           # 业务逻辑层
│   ├── handler/           # 处理层 (HTTP/gRPC)
│   ├── middleware/        # 中间件
│   └── pkg/               # 内部工具包
├── pkg/                    # 公共库（可被外部引用）
│   ├── logger/
│   ├── database/
│   ├── cache/
│   └── utils/
├── scripts/                # 脚本文件
├── deployments/            # 部署配置
├── tests/                  # 测试文件
├── go.mod
├── go.sum
├── Makefile
└── README.md
```

## 代码规范

### 标准项目布局

```go
// cmd/api/main.go
package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"myapp/internal/handler"
	"myapp/internal/repository"
	"myapp/internal/service"
	"myapp/pkg/config"
	"myapp/pkg/database"
	"myapp/pkg/logger"

	"github.com/gin-gonic/gin"
)

func main() {
	// 初始化配置
	cfg := config.Load()

	// 初始化日志
	log := logger.New(cfg.LogLevel)

	// 初始化数据库
	db, err := database.New(cfg.Database)
	if err != nil {
		log.Fatal("failed to connect database", err)
	}

	// 初始化依赖
	userRepo := repository.NewUserRepository(db)
	userService := service.NewUserService(userRepo, log)
	userHandler := handler.NewUserHandler(userService)

	// 设置路由
	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(loggerMiddleware(log))

	api := router.Group("/api/v1")
	{
		users := api.Group("/users")
		{
			users.GET("", userHandler.List)
			users.GET("/:id", userHandler.Get)
			users.POST("", userHandler.Create)
			users.PUT("/:id", userHandler.Update)
			users.DELETE("/:id", userHandler.Delete)
		}
	}

	// 启动服务器
	srv := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: router,
	}

	// 优雅关闭
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal("failed to start server", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Info("shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("server forced to shutdown", err)
	}

	log.Info("server exited")
}
```

### Handler 层

```go
// internal/handler/user_handler.go
package handler

import (
	"net/http"
	"strconv"

	"myapp/internal/domain"
	"myapp/internal/service"

	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	service *service.UserService
}

func NewUserHandler(s *service.UserService) *UserHandler {
	return &UserHandler{service: s}
}

func (h *UserHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "10"))

	users, total, err := h.service.List(c.Request.Context(), page, size)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  users,
		"total": total,
		"page":  page,
		"size":  size,
	})
}

func (h *UserHandler) Get(c *gin.Context) {
	id := c.Param("id")
	user, err := h.service.GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

func (h *UserHandler) Create(c *gin.Context) {
	var req domain.CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.service.Create(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, user)
}
```

### Service 层

```go
// internal/service/user_service.go
package service

import (
	"context"
	"errors"
	"time"

	"myapp/internal/domain"
	"myapp/internal/repository"
	"myapp/pkg/logger"

	"golang.org/x/crypto/bcrypt"
)

type UserService struct {
	repo   *repository.UserRepository
	logger logger.Logger
}

func NewUserService(repo *repository.UserRepository, log logger.Logger) *UserService {
	return &UserService{
		repo:   repo,
		logger: log,
	}
}

func (s *UserService) Create(ctx context.Context, req *domain.CreateUserRequest) (*domain.User, error) {
	// 检查用户是否已存在
	existing, _ := s.repo.GetByEmail(ctx, req.Email)
	if existing != nil {
		return nil, errors.New("email already exists")
	}

	// 密码加密
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		s.logger.Error("failed to hash password", err)
		return nil, err
	}

	user := &domain.User{
		Email:     req.Email,
		Password:  string(hashedPassword),
		Username:  req.Username,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := s.repo.Create(ctx, user); err != nil {
		s.logger.Error("failed to create user", err)
		return nil, err
	}

	return user, nil
}

func (s *UserService) GetByID(ctx context.Context, id string) (*domain.User, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *UserService) List(ctx context.Context, page, size int) ([]*domain.User, int64, error) {
	offset := (page - 1) * size
	return s.repo.List(ctx, offset, size)
}
```

### Repository 层

```go
// internal/repository/user_repository.go
package repository

import (
	"context"
	"myapp/internal/domain"

	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(ctx context.Context, user *domain.User) error {
	return r.db.WithContext(ctx).Create(user).Error
}

func (r *UserRepository) GetByID(ctx context.Context, id string) (*domain.User, error) {
	var user domain.User
	err := r.db.WithContext(ctx).First(&user, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	var user domain.User
	err := r.db.WithContext(ctx).First(&user, "email = ?", email).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) List(ctx context.Context, offset, limit int) ([]*domain.User, int64, error) {
	var users []*domain.User
	var total int64

	err := r.db.WithContext(ctx).Model(&domain.User{}).Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	err = r.db.WithContext(ctx).Offset(offset).Limit(limit).Find(&users).Error
	if err != nil {
		return nil, 0, err
	}

	return users, total, nil
}

func (r *UserRepository) Update(ctx context.Context, user *domain.User) error {
	return r.db.WithContext(ctx).Save(user).Error
}

func (r *UserRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&domain.User{}, "id = ?", id).Error
}
```

### 领域模型

```go
// internal/domain/user.go
package domain

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID        string         `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Email     string         `json:"email" gorm:"uniqueIndex;not null"`
	Password  string         `json:"-" gorm:"not null"` // 不返回给前端
	Username  string         `json:"username"`
	Avatar    string         `json:"avatar"`
	Status    int            `json:"status" gorm:"default:1"` // 1: active, 0: inactive
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

type CreateUserRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Username string `json:"username" binding:"required,min=2,max=50"`
}

type UpdateUserRequest struct {
	Username string `json:"username" binding:"omitempty,min=2,max=50"`
	Avatar   string `json:"avatar" binding:"omitempty,url"`
	Status   *int   `json:"status" binding:"omitempty,oneof=0 1"`
}
```

## 中间件示例

```go
// internal/middleware/auth.go
package middleware

import (
	"net/http"
	"strings"

	"myapp/pkg/jwt"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware(jwtService *jwt.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "missing authorization header"})
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if !(len(parts) == 2 && parts[0] == "Bearer") {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid authorization header format"})
			c.Abort()
			return
		}

		claims, err := jwtService.ParseToken(parts[1])
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			c.Abort()
			return
		}

		c.Set("userID", claims.UserID)
		c.Set("email", claims.Email)
		c.Next()
	}
}

// internal/middleware/logger.go
package middleware

import (
	"time"

	"myapp/pkg/logger"

	"github.com/gin-gonic/gin"
)

func Logger(log logger.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		raw := c.Request.URL.RawQuery

		c.Next()

		latency := time.Since(start)
		clientIP := c.ClientIP()
		method := c.Request.Method
		statusCode := c.Writer.Status()

		if raw != "" {
			path = path + "?" + raw
		}

		log.Info("request",
			"status", statusCode,
			"latency", latency,
			"client_ip", clientIP,
			"method", method,
			"path", path,
		)
	}
}
```

## 并发编程

```go
// 使用 Worker Pool 处理任务
package worker

import (
	"context"
	"sync"
)

type Task func()

type Pool struct {
	workers int
	tasks   chan Task
	wg      sync.WaitGroup
}

func NewPool(workers int) *Pool {
	return &Pool{
		workers: workers,
		tasks:   make(chan Task, 100),
	}
}

func (p *Pool) Start(ctx context.Context) {
	for i := 0; i < p.workers; i++ {
		p.wg.Add(1)
		go p.worker(ctx)
	}
}

func (p *Pool) worker(ctx context.Context) {
	defer p.wg.Done()
	for {
		select {
		case task := <-p.tasks:
			task()
		case <-ctx.Done():
			return
		}
	}
}

func (p *Pool) Submit(task Task) {
	p.tasks <- task
}

func (p *Pool) Stop() {
	close(p.tasks)
	p.wg.Wait()
}
```

## 测试

```go
// internal/service/user_service_test.go
package service

import (
	"context"
	"testing"

	"myapp/internal/domain"
	"myapp/internal/repository/mocks"
	"myapp/pkg/logger"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestUserService_Create(t *testing.T) {
	mockRepo := new(mocks.UserRepository)
	mockLogger := logger.NewMock()
	service := NewUserService(mockRepo, mockLogger)

	ctx := context.Background()
	req := &domain.CreateUserRequest{
		Email:    "test@example.com",
		Password: "password123",
		Username: "testuser",
	}

	mockRepo.On("GetByEmail", ctx, req.Email).Return(nil, nil)
	mockRepo.On("Create", ctx, mock.AnythingOfType("*domain.User")).Return(nil)

	user, err := service.Create(ctx, req)

	assert.NoError(t, err)
	assert.NotNil(t, user)
	assert.Equal(t, req.Email, user.Email)
	assert.Equal(t, req.Username, user.Username)
	mockRepo.AssertExpectations(t)
}
```

## 性能优化

1. **使用 sync.Pool 复用对象**
2. **避免在热路径分配内存**
3. **使用 pprof 进行性能分析**
4. **启用 HTTP/2**
5. **使用连接池（数据库、Redis）**

## 参考资源

- [Go 官方文档](https://golang.org/doc/)
- [Gin 框架文档](https://gin-gonic.com/)
- [GORM 文档](https://gorm.io/)
- [Go 并发模式](https://github.com/tmrts/go-patterns)
