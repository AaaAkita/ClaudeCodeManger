---
name: web-crawler
description: 网络爬虫开发专家，提供 Scrapy、Playwright、反爬虫对抗、数据清洗等技术
---

# 网络爬虫开发专家

## 描述
专注于网络爬虫开发，涵盖 HTTP 请求、动态渲染、反爬虫对抗、数据清洗、分布式爬虫等技术。

## 触发条件
- 网络爬虫
- 数据抓取
- Scrapy / Playwright / Selenium
- 反爬虫对抗
- 数据清洗

## 技术栈

### 1. Python 爬虫

```python
import requests
from bs4 import BeautifulSoup
import json
import time
import random

class WebCrawler:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
    
    def fetch(self, url, retries=3):
        for i in range(retries):
            try:
                response = self.session.get(url, timeout=10)
                response.raise_for_status()
                return response.text
            except Exception as e:
                if i == retries - 1:
                    raise e
                time.sleep(random.uniform(1, 3))
    
    def parse(self, html):
        soup = BeautifulSoup(html, 'html.parser')
        return soup
    
    def save(self, data, filename):
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

# 使用示例
crawler = WebCrawler()
html = crawler.fetch('https://example.com')
soup = crawler.parse(html)
titles = [h2.text for h2 in soup.find_all('h2')]
```

### 2. Playwright 动态渲染

```python
from playwright.sync_api import sync_playwright

class DynamicCrawler:
    def __init__(self):
        self.playwright = sync_playwright().start()
        self.browser = self.playwright.chromium.launch(headless=True)
    
    def fetch(self, url):
        page = self.browser.new_page()
        page.goto(url, wait_until='networkidle')
        content = page.content()
        page.close()
        return content
    
    def close(self):
        self.browser.close()
        self.playwright.stop()
```

### 3. 反爬虫对抗

```python
import random
import time

class AntiDetection:
    @staticmethod
    def random_delay(min_sec=1, max_sec=3):
        time.sleep(random.uniform(min_sec, max_sec))
    
    @staticmethod
    def rotate_user_agent():
        agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
        ]
        return random.choice(agents)
    
    @staticmethod
    def add_proxy():
        # 使用代理池
        proxies = [
            'http://proxy1.com:8080',
            'http://proxy2.com:8080'
        ]
        return {'http': random.choice(proxies), 'https': random.choice(proxies)}
```

## 最佳实践
1. 遵守 robots.txt
2. 控制请求频率，避免对目标网站造成压力
3. 使用代理池轮换 IP
4. 处理 JavaScript 渲染（Playwright/Selenium）
5. 数据去重和清洗
6. 异常处理和重试机制
