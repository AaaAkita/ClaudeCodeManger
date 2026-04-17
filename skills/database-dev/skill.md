---
name: database-dev
description: 数据库开发专家，提供 MySQL、PostgreSQL、MongoDB、Redis 设计、优化和最佳实践
---

# 数据库开发专家

## 描述
专注于数据库设计与开发，涵盖关系型数据库（MySQL、PostgreSQL）、NoSQL（MongoDB）、缓存（Redis）的设计、优化和最佳实践。

## 触发条件
- 数据库设计
- MySQL / PostgreSQL / MongoDB / Redis
- SQL 优化
- 数据库迁移
- 索引设计
- 分库分表

## 核心技能

### 1. 数据库设计规范

```sql
-- MySQL 表设计示例
CREATE TABLE users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    email VARCHAR(255) NOT NULL COMMENT '邮箱',
    username VARCHAR(50) NOT NULL COMMENT '用户名',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
    status TINYINT DEFAULT 1 COMMENT '状态: 1-正常 0-禁用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT '删除时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_email (email),
    UNIQUE KEY uk_username (username),
    KEY idx_status_created (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';
```

### 2. 索引优化
- 选择性高的列优先
- 最左前缀原则
- 避免冗余索引
- 定期分析慢查询

### 3. Redis 使用模式

```go
// 缓存模式
package cache

import (
    "context"
    "encoding/json"
    "time"
    "github.com/redis/go-redis/v9"
)

type Cache struct {
    client *redis.Client
    ttl    time.Duration
}

func (c *Cache) Get(ctx context.Context, key string, dest interface{}) error {
    data, err := c.client.Get(ctx, key).Result()
    if err != nil {
        return err
    }
    return json.Unmarshal([]byte(data), dest)
}

func (c *Cache) Set(ctx context.Context, key string, value interface{}) error {
    data, err := json.Marshal(value)
    if err != nil {
        return err
    }
    return c.client.Set(ctx, key, data, c.ttl).Err()
}
```

## 最佳实践
1. 字段NOT NULL，有默认值
2. 使用合适的数据类型
3. 大字段单独存储
4. 敏感数据加密存储
5. 软删除代替硬删除
