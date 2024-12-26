# iLive 智慧家電購物網站

一個現代化的智慧家電電商平台，提供完整的購物體驗和後台管理系統。

## 功能特點

### 前台功能
- 商品瀏覽與搜尋
- 會員系統（註冊/登入）
- 購物車功能
- 個人資料管理


### 後台管理
- 商品管理
- 訂單管理
- 會員管理
- 商品銷售量統計
- 管理員權限控制

## 技術架構

### 前端技術

- **前端框架**：Vue 3
- **UI 框架**：Element Plus
- **狀態管理**：Vuex 4
- **路由**：Vue Router 4
- **構建工具**：Vite
- **HTTP 客戶端**：Axios

### 後端技術

- **運行環境**：Node.js
- **Web 框架**：Express.js
- **數據庫**：MongoDB Atlas（使用 Mongoose ODM）
- **身份驗證**：JWT（jsonwebtoken）
- **密碼加密**：bcryptjs
- **郵件服務**：Nodemailer
- **開發工具**：Nodemon


## 安裝步驟

1. 安裝依賴
```bash
# 安裝前端依賴
cd client
npm install

# 安裝後端依賴
cd server
npm install
```

2. 環境配置
```bash
# 在 server 目錄下建立 .env 文件
DATABASE_URL=你的MongoDB數據庫連接字符串
JWT_SECRET=你的JWT密鑰
```

3. 啟動開發服務器
```bash
# 啟動前端服務
cd client
npm run dev

# 啟動後端服務
cd server
npm run dev
```

## 專案結構

```
├── client/                 # 前端專案目錄
│   ├── public/            # 靜態資源
│   ├── src/               # 源代碼
│   │   ├── assets/       # 資源文件
│   │   ├── components/   # 組件
│   │   ├── router/       # 路由配置
│   │   ├── store/        # Vuex 狀態管理
│   │   ├── views/        # 頁面視圖
│   │   └── App.vue       # 根組件
│   └── package.json
│
└── server/                # 後端專案目錄
    ├── config/           # 配置文件
    ├── controllers/      # 控制器
    ├── models/          # 數據模型
    ├── routes/          # 路由
    └── package.json
```

## 部署說明

1. 前端部署
```bash
cd client
npm run build
```

2. 後端部署
```bash
cd server
npm run build
```

## 開發團隊
- 前端開發：Me
- 後端開發：Me
- UI/UX 設計：ME
- AI工具：Claude Sonnet3.5

## 版本歷史
- v0.0.0 (2024-12-26) - 初始版本
