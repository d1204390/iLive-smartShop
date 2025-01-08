# 專案管理-期末報告-iLive 智慧家電購物網站

🔗 線上展示：https://ilive-shop.onrender.com/

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

# iLive 技術棧選擇說明

## 前端技術選擇

### 1. Vue 3 作為前端框架
- **選擇原因**：
    - Composition API 提供更好的代碼組織和邏輯復用
    - 較 Vue 2 有更好的 TypeScript 支持
    - 性能更優，虛擬 DOM 重寫和 Tree-shaking 支持
    - 更小的打包體積，提升加載速度
    - 活躍的社區支持和豐富的生態系統

### 2. Element Plus UI 框架
- **選擇原因**：
    - 專為 Vue 3 設計，完美整合
    - 豐富的組件庫，減少重複開發
    - 完善的中文文檔和社區支持
    - 高度可定製化的主題系統
    - 響應式設計支持
    - 完整的無障礙支持

### 3. Vuex 4 狀態管理
- **選擇原因**：
    - Vue 3 官方推薦的狀態管理方案
    - 集中式的狀態管理，便於維護
    - 適合處理複雜的數據流
    - 內置的開發工具支持，便於調試
    - 模組化設計，適合大型應用

### 4. Vue Router 4
- **選擇原因**：
    - Vue 3 官方路由解決方案
    - 支持動態路由和懶加載
    - 良好的導航守衛機制
    - HTML5 History 模式支持
    - 完整的編程式導航 API

## 後端技術選擇

### 1. Node.js + Express.js
- **選擇原因**：
    - 使用 JavaScript 全端開發，減少技術切換成本
    - Express.js 輕量且靈活，適合快速開發
    - 豐富的中間件生態系統
    - 優秀的非阻塞 I/O 性能
    - 容易部署和擴展

### 2. MongoDB + Mongoose
- **選擇原因**：
    - NoSQL 數據庫，適合處理非結構化數據
    - 靈活的數據模型，便於應對需求變更
    - 良好的水平擴展能力
    - Mongoose 提供強大的數據驗證和中間件
    - 原生支持 JSON 格式，與 Node.js 完美配合

### 3. JWT 身份驗證
- **選擇原因**：
    - 無狀態認證，減少服務器負擔
    - 跨域支持好，適合前後端分離架構
    - 可以攜帶用戶信息，減少數據庫查詢
    - 安全性高，支持簽名驗證
    - 擴展性好，支持多種加密算法

## 開發工具選擇

### 1. Vite 作為構建工具
- **選擇原因**：
    - 極快的開發服務器啟動速度
    - 優秀的熱更新性能
    - 原生 ESM 支持，提升開發體驗
    - 內置優化配置，簡化打包過程
    - Vue 3 官方推薦的構建工具

### 2. ESLint + Prettier
- **選擇原因**：
    - 統一的代碼風格規範
    - 自動化的代碼格式化
    - 可以在提交前自動檢查和修復
    - 豐富的規則配置選項
    - IDE 整合支持

## 部署平台選擇

### 1. Render 作為部署平台
- **選擇原因**：
    - 提供免費的部署方案
    - 自動化的部署流程
    - 支持 Node.js 應用
    - 內建的 SSL 支持
    - 簡單的環境變量管理
    - 完善的日誌系統

### 2. MongoDB Atlas 作為數據庫服務
- **選擇原因**：
    - 提供免費的數據庫託管
    - 自動備份和恢復功能
    - 內建的監控和報警系統
    - 良好的擴展性
    - 全球分佈式部署選項

## 技術整合的優勢

1. **開發效率**
    - 前後端使用同一語言（JavaScript/Node.js）
    - 完整的開發工具鏈
    - 豐富的第三方庫支持

2. **維護性**
    - 統一的代碼風格
    - 模組化的項目結構
    - 清晰的技術文檔

3. **性能優化**
    - 前端打包優化
    - 數據庫查詢優化
    - 緩存策略支持

4. **擴展性**
    - 微服務架構支持
    - 水平擴展能力
    - 第三方服務集成

## 項目心得

在開發這個專案的過程中，我瞭解了：

1. **技術選型的重要性**
    - 如何根據專案需求選擇合適的技術棧
    - 權衡不同技術方案的優劣

2. **項目架構設計**
    - 如何設計可擴展的系統架構
    - 模組化和組件化的實踐經驗

3. **工程化實踐**
    - 版本控制工作流程
    - 部署流程自動化
    - 代碼質量控制

4. **問題解決能力**
    - 如何分析和解決複雜問題
    - 技術文檔的重要性
    - 持續學習的必要性


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
├── client/               # 前端專案目錄
│   ├── public/           # 靜態資源
│   ├── src/              # 源代碼
│   │   ├── assets/       # 資源文件
│   │   ├── components/   # 組件
│   │   ├── router/       # 路由配置
│   │   ├── store/        # Vuex 狀態管理
│   │   ├── views/        # 頁面視圖
│   │   └── App.vue       # 根組件
│   └── package.json
│
└── server/               # 後端專案目錄
    ├── config/           # 配置文件
    ├── controllers/      # 控制器
    ├── models/           # 數據模型
    ├── routes/           # 路由
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


## 開發
- 前端開發：Me
- 後端開發：Me
- UI/UX 設計：ME
- AI工具：Claude Sonnet3.5
