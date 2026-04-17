---
name: auth-system
description: 登录注册系统开发专家，提供 JWT、OAuth2、Session、权限控制等认证方案
---

# 登录注册系统开发专家

## 描述
专注于用户认证与授权系统开发，涵盖 JWT、OAuth2、Session、RBAC 权限控制、双因素认证等。

## 触发条件
- 登录注册功能
- JWT / OAuth2 / Session
- 权限控制 RBAC
- 密码加密
- 双因素认证
- SSO 单点登录

## 核心实现

### 1. JWT 认证 (Go)

```go
package auth

import (
    "time"
    "github.com/golang-jwt/jwt/v5"
)

type Claims struct {
    UserID   string `json:"user_id"`
    Username string `json:"username"`
    jwt.RegisteredClaims
}

func GenerateToken(userID, username string, secret []byte) (string, error) {
    claims := Claims{
        UserID:   userID,
        Username: username,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
            IssuedAt:  jwt.NewNumericDate(time.Now()),
        },
    }
    
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(secret)
}

func ParseToken(tokenString string, secret []byte) (*Claims, error) {
    token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
        return secret, nil
    })
    
    if claims, ok := token.Claims.(*Claims); ok && token.Valid {
        return claims, nil
    }
    return nil, err
}
```

### 2. 密码安全

```go
import "golang.org/x/crypto/bcrypt"

// 密码加密
func HashPassword(password string) (string, error) {
    bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
    return string(bytes), err
}

// 密码验证
func CheckPassword(password, hash string) bool {
    err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
    return err == nil
}
```

### 3. RBAC 权限模型

```go
type Role struct {
    ID          string
    Name        string
    Permissions []Permission
}

type Permission struct {
    Resource string // 资源: user, order, product
    Action   string // 操作: create, read, update, delete
}

// 检查权限
func (r *Role) HasPermission(resource, action string) bool {
    for _, p := range r.Permissions {
        if p.Resource == resource && p.Action == action {
            return true
        }
    }
    return false
}
```

## 安全建议
1. 密码最小8位，包含大小写+数字+特殊字符
2. 登录失败限制（5次失败锁定15分钟）
3. 使用 HTTPS
4. Token 设置合理过期时间
5. 敏感操作需要二次验证
