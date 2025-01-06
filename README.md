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

# 部署開發流程

## 前置準備
1. **準備專案結構**
    - `client/`: 前端專案
    - `server/`: 後端專案

2. **環境變數設置**
    - 在 `server/` 資料夾下建立 `.env` 文件，包含以下內容：
      ```env
      MONGO_URI=your-code
      JWT_SECRET=your-code
      JWT_EXPIRE=your-code
      EMAIL_USER=your-email@gmail.com
      EMAIL_PASS=your-email-password
      ```
    - 在 `client/` 資料夾下建立 `.env.production` 文件，包含以下內容：
      ```env
      VITE_API_BASE_URL=https://<your-backend-service>.onrender.com/api
      ```

3. **新增 `.gitignore` 文件**
    - 確保環境變數檔案被忽略：
      ```
      **/node_modules
      client/dist
      server/.env
      ```

## 部屬流程

### 部屬後端
1. **Render 平台設置**
    - 登入 [Render](https://render.com/) 並建立新服務：
        - 選擇 **Web Service**。
        - 設定名稱，例如 `ilive-backend`。
        - 指定後端的 Git 儲存庫。
        - 選擇 Branch，例如 `master`。
        - 填寫 Root Directory：
          ```
          server
          ```
        - Build Command：
          ```
          npm install
          ```
        - Start Command：
          ```
          npm start
          ```

2. **檢查日誌**
    - 在 Render 的 **Logs** 頁面確認是否啟動成功。
    - 確認服務已在指定的 URL 運行，例如：https://ilive-backend.onrender.com。

### 部屬前端
1. **Render 平台設置**
    - 登入 [Render](https://render.com/) 並建立新服務：
        - 選擇 **Web Service**。
        - 設定名稱，例如 `ilive-frontend`。
        - 指定前端的 Git 儲存庫。
        - 選擇 Branch，例如 `master`。
        - 填寫 Root Directory：
          ```
          client
          ```
        - Build Command：
          ```
          npm install && npm run build
          ```
        - Start Command：
          ```
          serve -s dist
          ```

2. **檢查日誌**
    - 在 Render 的 **Logs** 頁面確認是否啟動成功。
    - 確認服務已在指定的 URL 運行，例如：https://ilive-frontend.onrender.com。

## 測試與驗證
1. **後端測試**
    - 使用 Postman 測試 API。
    - 測試例如 `/api/auth/register`、`/api/products` 等路徑。

2. **前端驗證**
    - 開啟前端部署的 URL，驗證功能是否正常。
    - 確認前端是否成功請求後端 API。

## 注意事項
- 確保環境變數中的機密資訊（如密碼和金鑰）正確無誤。
- Render 部屬時，若有更改設定或程式碼，需重新觸發部屬。
    - 點選 `Deploy latest commit` 或 `Clear build cache & deploy`。
- 確保 `.gitignore` 文件正確設置，避免環境變數檔案被提交到 Git。

## 常見問題排解
- **日誌中出現錯誤訊息**：
    - 檢查環境變數是否正確設置。
    - 確認 Build Command 和 Start Command 是否正確。

- **前端請求後端失敗**：
    - 確保 `.env.production` 中的 `VITE_API_BASE_URL` 指向正確的後端 URL。
    - 檢查 CORS 設定是否允許跨域請求。

- **部署後更新未生效**：
    - 確保最新的程式碼已推送到 Git 儲存庫。
    - 使用 Render 的 `Clear build cache & deploy` 重新部屬。


## 開發團隊
- 前端開發：Me
- 後端開發：Me
- UI/UX 設計：ME
- AI工具：Claude Sonnet3.5
