# MiniFitLog

[English](README.md)

MiniFitLog 是一個自託管的運動、飲食、BMR 與熱量赤字追蹤 Web app。它用 Docker 部署，取代原本用試算表記錄的流程。

每位使用者都必須用 email 與密碼註冊。運動、飲食、BMR 與設定資料都會依使用者隔離保存。

## 目錄

- [安全性](#安全性)
- [背景](#背景)
- [功能](#功能)
- [設計色票](#設計色票)
- [安裝](#安裝)
- [使用方式](#使用方式)
- [API](#api)
- [貢獻](#貢獻)
- [授權](#授權)

## 安全性

密碼使用 Node.js 內建 `crypto.scrypt` 加鹽雜湊保存。瀏覽器 cookie 只保存隨機 session token，不保存使用者密碼。

SQLite 資料表會用 `user_id` 區分使用者資料。若資料庫中已有舊版無使用者歸屬的資料，第一位註冊使用者會接收這些舊資料。

請勿提交真實 credential、database dump、private key、token 或 `.env` 檔案。

## 背景

MiniFitLog 是為自託管設計的小型個人追蹤工具。後端是 TypeScript Fastify server，資料庫使用 `better-sqlite3` 操作 SQLite，前端是由同一個 server 提供的靜態 HTML/CSS/JavaScript。

Docker 部署時，應用資料會持久保存在 `training-data` volume。

## 功能

- Email 與密碼註冊 / 登入。
- 每位使用者資料隔離。
- 月曆式運動記錄。
- 每日有氧、訓練項目、心跳與備註追蹤。
- 每週體脂、體重與腰圍記錄。
- 食物庫管理，可記錄來源、熱量、蛋白質與備註。
- 早餐、午餐、晚餐餐次追蹤。
- 每週 BMR 記錄與往後套用。
- 熱量攝取與赤字統計。
- Server 啟動時自動執行 SQLite migration。
- Docker Compose 部署。

## 設計色票

MiniFitLog 使用清爽的健身儀表板配色。之後新增或調整 UI 時，請沿用這組 token：

| Token | 色碼 | 用途 |
| --- | --- | --- |
| Primary Green | `#22C55E` | 主要操作、成功狀態、目前選取的導覽。 |
| Secondary Blue | `#0EA5E9` | 次要操作、focus 狀態、運動相關強調色。 |
| Background | `#F8FAFC` | App 背景。 |
| Card White | `#FFFFFF` | 卡片、面板、對話框、表單底色。 |
| Main Text | `#0F172A` | 標題與主要文字。 |
| Muted Text | `#64748B` | 標籤、輔助文字、metadata。 |
| Border | `#E2E8F0` | 分隔線、表單邊框、卡片邊框。 |
| Warning Orange | `#F97316` | 熱量警示與注意狀態。 |
| Danger Red | `#EF4444` | 刪除操作與錯誤狀態。 |

## 安裝

安裝 dependencies：

```bash
pnpm install
```

執行 database migrations：

```bash
pnpm db:migrate
```

編譯 TypeScript server：

```bash
pnpm build
```

## 使用方式

啟動 development server：

```bash
pnpm dev
```

啟動已編譯的 server：

```bash
pnpm start
```

執行測試：

```bash
pnpm test
```

使用 Docker Compose 部署：

```bash
docker compose up -d
```

開啟 app：

```text
http://localhost:3000
```

第一次使用時請開啟 `/login`，先用 email 與密碼註冊。註冊完成後，即可用同一組 email 與密碼登入。

### 環境變數

| 變數 | 預設值 | 說明 |
| --- | --- | --- |
| `PORT` | `3000` | HTTP port。 |
| `HOST` | `0.0.0.0` | HTTP host。 |
| `DB_PATH` | `data/training.db` | SQLite database 路徑。 |

### 指令

| 指令 | 說明 |
| --- | --- |
| `pnpm dev` | 使用 `tsx watch` 啟動 development server。 |
| `pnpm build` | 將 TypeScript 編譯到 `dist/`。 |
| `pnpm start` | 啟動已編譯的 server。 |
| `pnpm test` | 執行 Vitest tests。 |
| `pnpm db:migrate` | 執行 SQLite migrations。 |
| `pnpm lint` | 若專案已安裝 ESLint，執行 lint。 |

## API

除了 auth endpoints 以外，所有應用 API 都需要已登入的 session。

### Auth

| Method | Path | 說明 |
| --- | --- | --- |
| `GET` | `/api/auth/status` | 回傳註冊與登入狀態。 |
| `POST` | `/api/auth/register` | 使用 email 與密碼註冊。 |
| `POST` | `/api/auth/login` | 使用 email 與密碼登入。 |
| `POST` | `/api/auth/logout` | 登出並清除 session cookie。 |

### Training

| Method | Path | 說明 |
| --- | --- | --- |
| `GET` | `/api/months/:year/:month` | 取得每月運動資料與統計。 |
| `PUT` | `/api/daily/:date` | 儲存每日運動記錄。 |
| `PUT` | `/api/weekly/:date` | 儲存每週身體指標。 |
| `POST` | `/api/import` | 匯入週指標與每日記錄。 |

### Food 與 Settings

| Method | Path | 說明 |
| --- | --- | --- |
| `GET` | `/api/foods` | 列出目前使用者的食物項目。 |
| `GET` | `/api/foods/sources` | 列出食物來源。 |
| `GET` | `/api/foods/search` | 搜尋食物項目。 |
| `POST` | `/api/foods` | 建立食物項目。 |
| `PUT` | `/api/foods/:id` | 更新食物項目。 |
| `DELETE` | `/api/foods/:id` | 刪除食物項目。 |
| `GET` | `/api/food/months/:year/:month` | 取得每月餐次與 BMR 資料。 |
| `PUT` | `/api/food/daily/:date/:meal` | 儲存早餐、午餐或晚餐記錄。 |
| `PUT` | `/api/food/bmr/:date` | 儲存 BMR 記錄。 |
| `PUT` | `/api/food/bmr-cascade/:date` | 將 BMR 往後套用。 |
| `GET` | `/api/settings` | 列出目前使用者設定。 |
| `GET` | `/api/settings/:key` | 讀取單一設定。 |
| `PUT` | `/api/settings` | 儲存單一設定。 |

## 貢獻

請保持變更範圍明確，並遵循既有 route -> service -> repository 分層。

- Request validation 使用 Zod schema。
- Database access 保持在 `src/repositories/`。
- 不修改既有 migration 檔案，需要 schema 變更時新增 migration。
- 行為變更需要新增或更新測試。
- 送出前執行 `pnpm test` 與 `pnpm build`。

## 授權

ISC
