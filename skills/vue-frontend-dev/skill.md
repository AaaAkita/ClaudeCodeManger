---
name: vue-frontend-dev
description: Vue 3 前端开发专家，提供组件开发、状态管理、路由配置、UI 组件库集成等全方位支持
---

# Vue 3 前端开发专家

## 描述
专注于 Vue 3 生态系统的前端开发 Skill，涵盖组件开发、状态管理、路由配置、UI 组件库集成、性能优化等。

## 触发条件
当用户涉及以下主题时触发：
- Vue 3 / Vue 2 开发
- 前端组件开发
- Element Plus / Ant Design Vue 等 UI 库
- Pinia / Vuex 状态管理
- Vue Router 路由配置
- Vite / Webpack 构建工具
- TypeScript + Vue 开发
- 前端性能优化

## 技术栈

### 核心框架
- **Vue 3** (Composition API / Options API)
- **TypeScript** 类型支持
- **Vite** 构建工具（推荐）

### UI 组件库
- **Element Plus** - 企业级后台首选
- **Ant Design Vue** - 阿里生态
- **Naive UI** - 现代化组件库
- **Vuetify** - Material Design

### 状态管理
- **Pinia** - Vue 3 官方推荐
- **Vuex** - Vue 2 遗留项目

### 路由
- **Vue Router 4** - Vue 3 配套

### 工具库
- **VueUse** - 实用组合式函数
- **Axios** - HTTP 请求
- **Day.js** - 日期处理

## 项目结构规范

```
my-vue-project/
├── public/                 # 静态资源
├── src/
│   ├── api/               # API 接口
│   │   ├── modules/       # 按模块组织的 API
│   │   └── request.ts     # Axios 封装
│   ├── assets/            # 样式、图片、字体
│   │   ├── styles/
│   │   └── images/
│   ├── components/        # 公共组件
│   │   ├── common/        # 通用组件
│   │   └── business/      # 业务组件
│   ├── composables/       # 组合式函数
│   ├── directives/        # 自定义指令
│   ├── layouts/           # 布局组件
│   ├── router/            # 路由配置
│   │   ├── index.ts
│   │   └── modules/       # 路由模块
│   ├── stores/            # Pinia 状态管理
│   │   ├── modules/
│   │   └── index.ts
│   ├── utils/             # 工具函数
│   ├── views/             # 页面视图
│   │   ├── login/
│   │   ├── dashboard/
│   │   └── ...
│   ├── App.vue
│   └── main.ts
├── types/                 # 全局类型定义
├── .env.*                 # 环境变量
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## 代码规范

### Vue 3 Composition API 最佳实践

```typescript
<script setup lang="ts">
// 1. 导入排序：Vue核心 -> 第三方 -> 本地
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import type { UserInfo } from '@/types/user'

// 2. 类型定义
interface Props {
  userId: string
  editable?: boolean
}

// 3. Props 和 Emits
const props = withDefaults(defineProps<Props>(), {
  editable: false
})

const emit = defineEmits<{
  update: [user: UserInfo]
  delete: [id: string]
}>()

// 4. 响应式数据
const loading = ref(false)
const userInfo = ref<UserInfo | null>(null)
const errorMessage = ref('')

// 5. 计算属性
const displayName = computed(() => {
  return userInfo.value?.nickname || userInfo.value?.username || '未命名'
})

// 6. 方法
async function fetchUserData() {
  loading.value = true
  try {
    const data = await useUserStore().fetchUser(props.userId)
    userInfo.value = data
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '获取失败'
  } finally {
    loading.value = false
  }
}

function handleUpdate() {
  if (userInfo.value) {
    emit('update', userInfo.value)
  }
}

// 7. 生命周期
onMounted(() => {
  fetchUserData()
})

// 8. 监听器
watch(() => props.userId, (newId) => {
  if (newId) fetchUserData()
})
</script>
```

### 组件模板规范

```vue
<template>
  <div class="user-card" :class="{ 'is-editable': editable }">
    <!-- 加载状态 -->
    <el-skeleton v-if="loading" :rows="3" animated />
    
    <!-- 错误状态 -->
    <el-alert
      v-else-if="errorMessage"
      :title="errorMessage"
      type="error"
      closable
      @close="errorMessage = ''"
    />
    
    <!-- 正常内容 -->
    <template v-else-if="userInfo">
      <div class="user-header">
        <el-avatar :src="userInfo.avatar" :size="64" />
        <h3 class="user-name">{{ displayName }}</h3>
      </div>
      
      <div class="user-actions" v-if="editable">
        <el-button type="primary" @click="handleUpdate">
          更新信息
        </el-button>
      </div>
    </template>
    
    <!-- 空状态 -->
    <el-empty v-else description="暂无用户数据" />
  </div>
</template>

<style scoped lang="scss">
.user-card {
  padding: 20px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  
  &.is-editable {
    border: 2px solid var(--el-color-primary);
  }
  
  .user-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
  }
  
  .user-name {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }
  
  .user-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}
</style>
```

## 常用功能实现

### 1. Axios 封装

```typescript
// src/api/request.ts
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = useUserStore().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器
request.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => {
    const message = error.response?.data?.message || '请求失败'
    ElMessage.error(message)
    
    if (error.response?.status === 401) {
      useUserStore().logout()
    }
    
    return Promise.reject(error)
  }
)

export default request
```

### 2. Pinia Store 示例

```typescript
// src/stores/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import request from '@/api/request'
import type { UserInfo } from '@/types/user'

export const useUserStore = defineStore('user', () => {
  // State
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(null)
  
  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => userInfo.value?.username)
  
  // Actions
  async function login(credentials: { username: string; password: string }) {
    const { token: newToken, user } = await request.post('/auth/login', credentials)
    token.value = newToken
    userInfo.value = user
    localStorage.setItem('token', newToken)
    return user
  }
  
  async function fetchUser(id: string) {
    const data = await request.get(`/users/${id}`)
    return data
  }
  
  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
  }
  
  return {
    token,
    userInfo,
    isLoggedIn,
    username,
    login,
    fetchUser,
    logout
  }
})
```

### 3. Vue Router 配置

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { public: true }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '仪表盘', icon: 'dashboard' }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/users/index.vue'),
        meta: { title: '用户管理', icon: 'user' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (!to.meta.public && !userStore.isLoggedIn) {
    next('/login')
  } else {
    next()
  }
})

export default router
```

## 性能优化

### 1. 组件懒加载
```typescript
const AsyncComponent = defineAsyncComponent(() => 
  import('./HeavyComponent.vue')
)
```

### 2. 虚拟列表（大数据量）
使用 `vue-virtual-scroller` 或 Element Plus 的 `el-table` 虚拟滚动

### 3. 图片优化
```vue
<el-image 
  :src="imageUrl" 
  lazy
  :preview-src-list="previewList"
/>
```

### 4. 缓存策略
```typescript
// 组件缓存
<keep-alive :include="['Dashboard', 'UserList']">
  <component :is="currentComponent" />
</keep-alive>
```

## 调试技巧

1. **Vue DevTools** - 必备调试工具
2. **VSCode 插件** - Volar (Vue 3)、TypeScript Vue Plugin
3. **浏览器控制台** - `__VUE__` 查看 Vue 实例

## 参考资源

- [Vue 3 官方文档](https://vuejs.org/)
- [Element Plus](https://element-plus.org/)
- [Pinia 文档](https://pinia.vuejs.org/)
- [Vue Router](https://router.vuejs.org/)
