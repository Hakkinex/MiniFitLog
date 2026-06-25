# Roadmap: Lilith Training Tracker

**Created:** 2026-06-17
**Mode:** MVP (Vertical Slices)

---

### Phase 1: Database Foundation
**Goal:** 建立 SQLite 資料庫 schema、migration、repository 層
**Mode:** mvp
**Success Criteria**:
1. pnpm test 通過 — schema 建立、CRUD 操作正確
2. weekly_metrics 與 daily_records 表可正確寫入與查詢
3. 所有 DB 存取透過 repository 層，無直接查詢

**Requirements:** DB-01, DB-02, DB-03, DB-04

---

### Phase 2: Backend API
**Goal:** 完成 Fastify API endpoints，含 Zod 驗證、認證 middleware、Result 錯誤處理
**Mode:** mvp
**Success Criteria**:
1. GET /api/months/:year/:month 回傳整月資料含達成率計算
2. PUT /api/daily/:date 可更新每日記錄
3. PUT /api/weekly/:date 可更新週度量測
4. Zod 驗證阻擋無效輸入
5. 未帶密碼的請求被 401 阻擋

**Requirements:** API-01, API-02, API-03, API-05, API-06, API-07

---

### Phase 3: Frontend Calendar UI
**Goal:** 月曆式 HTML 介面，含下拉選單、心跳輸入、週度量測、達成率計算、月份導航
**Mode:** mvp
**Success Criteria**:
1. 月曆按週排列顯示每日格子
2. 有氧/捲腹下拉選單可選 Y/N，選 N 可填備註
3. 運動類型/捲腹項目下拉含預設選項 + 其他自訂
4. 修改後自動透過 API 儲存
5. 月底顯示有氧達成率與棒式/捲腹達成率
6. 密碼登入頁面阻擋未授權存取

**Requirements:** UI-01, UI-02, UI-03, UI-04, UI-05, UI-06, UI-07, UI-08, UI-09, UI-10

---

### Phase 4: Excel Data Import
**Goal:** 匯入既有 Excel 歷史資料（2025 + 2026）至 SQLite
**Mode:** mvp
**Success Criteria**:
1. 2025 Sheet 資料正確解析並寫入 DB
2. 2026 Sheet 資料正確解析並寫入 DB
3. 匯入後前端可顯示歷史資料

**Requirements:** API-04, IMP-01, IMP-02, IMP-03

---

### Phase 5: Deployment
**Goal:** Docker 化部署，含 README 文件
**Mode:** mvp
**Success Criteria**:
1. docker-compose up 可啟動完整應用
2. SQLite 資料透過 volume 持久保存
3. README 含完整 setup 說明

**Requirements:** DEP-01, DEP-02, DEP-03, DEP-04

---

*Roadmap created: 2026-06-17*
