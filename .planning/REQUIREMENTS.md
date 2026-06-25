# Requirements: Lilith Training Tracker

**Defined:** 2026-06-17
**Core Value:** 每日運動記錄的快速輸入與持久保存

## v1 Requirements

### Database

- [ ] **DB-01**: SQLite 資料庫含 weekly_metrics 表（date, body_fat, weight, waist）
- [ ] **DB-02**: SQLite 資料庫含 daily_records 表（date, exercise_type, exercise_custom, cardio_done, cardio_heartbeat, plank_done, plank_heartbeat, plank_type, plank_custom, note）
- [ ] **DB-03**: 所有 DB query 透過 repository 層存取，route handler 不得直接查詢 DB
- [ ] **DB-04**: DB migration 腳本可初始化 schema

### API

- [ ] **API-01**: GET /api/months/:year/:month 取得整月資料（含週度量測 + 每日記錄 + 達成率計算）
- [ ] **API-02**: PUT /api/daily/:date 更新每日運動記錄
- [ ] **API-03**: PUT /api/weekly/:date 更新週度量測（體脂肪、體重、腰圍）
- [ ] **API-04**: POST /api/import 匯入 Excel 歷史資料
- [ ] **API-05**: 所有 endpoint 使用 Zod schema 驗證輸入（body/params/query）
- [ ] **API-06**: 使用 Result<T, E> pattern 處理業務錯誤
- [ ] **API-07**: 簡單密碼認證 middleware（單一環境變數 AUTH_PASSWORD）

### Frontend — 月曆介面

- [ ] **UI-01**: 月曆式佈局，按週排列（SUN-SAT），還原 Excel 的週結構
- [ ] **UI-02**: 每日格子含：有氧達成下拉（Y/N）、運動類型下拉（超慢跑/爆裂飛輪/踏步機/Tabata/爬樓梯/其他）、有氧心跳輸入
- [ ] **UI-03**: 每日格子含：棒式/捲腹達成下拉（Y/N）、項目下拉（棒式/捲腹/深蹲/提臀/弓箭步/上胸/其他）、捲腹心跳輸入
- [ ] **UI-04**: 選擇「其他」時顯示自訂輸入框
- [ ] **UI-05**: 選擇 N（未達成）時顯示備註輸入框
- [ ] **UI-06**: 每週左側區域可輸入體脂肪%、體重 kg、腰圍 cm
- [ ] **UI-07**: 月底右下角自動計算並顯示：有氧達成率%、棒式/捲腹達成率%
- [ ] **UI-08**: 月份切換導航（◀ 前一月 / 後一月 ▶）
- [ ] **UI-09**: 修改後自動透過 API 儲存至資料庫
- [ ] **UI-10**: 密碼登入頁面，未登入時阻擋存取

### Data Import

- [ ] **IMP-01**: 解析 Excel 2025 Sheet 格式（Plan + Actually 行結構）
- [ ] **IMP-02**: 解析 Excel 2026 Sheet 格式（有氧 + 棒式/捲腹行結構 + 週度量測）
- [ ] **IMP-03**: 匯入腳本將歷史資料寫入 SQLite

### Deployment

- [ ] **DEP-01**: Dockerfile 建置 Node.js 應用
- [ ] **DEP-02**: docker-compose.yml 含 SQLite volume mount
- [ ] **DEP-03**: 環境變數支援：PORT、AUTH_PASSWORD
- [ ] **DEP-04**: README.md 含 setup、env vars、dev/test/build 指令

## v2 Requirements

### Statistics

- **STAT-01**: 體脂肪/體重/腰圍的月度趨勢折線圖
- **STAT-02**: 達成率的月度比較圖表
- **STAT-03**: 運動類型分佈統計

### Enhancements

- **ENH-01**: 匯出月度資料為 CSV
- **ENH-02**: 手機版 RWD 佈局優化
- **ENH-03**: 深色模式

## Out of Scope

| Feature | Reason |
|---------|--------|
| 多使用者系統 | 單人使用，不需要使用者管理 |
| 社群分享 | 純個人記錄工具 |
| 原生 App | Web 優先，RWD 即可 |
| OAuth 登入 | 密碼保護足夠 |
| 即時通知 | 無推送需求 |
| PostgreSQL | 單人場景 SQLite 足夠 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DB-01 | Phase 1 | Pending |
| DB-02 | Phase 1 | Pending |
| DB-03 | Phase 1 | Pending |
| DB-04 | Phase 1 | Pending |
| API-01 | Phase 2 | Pending |
| API-02 | Phase 2 | Pending |
| API-03 | Phase 2 | Pending |
| API-04 | Phase 4 | Pending |
| API-05 | Phase 2 | Pending |
| API-06 | Phase 2 | Pending |
| API-07 | Phase 2 | Pending |
| UI-01 | Phase 3 | Pending |
| UI-02 | Phase 3 | Pending |
| UI-03 | Phase 3 | Pending |
| UI-04 | Phase 3 | Pending |
| UI-05 | Phase 3 | Pending |
| UI-06 | Phase 3 | Pending |
| UI-07 | Phase 3 | Pending |
| UI-08 | Phase 3 | Pending |
| UI-09 | Phase 3 | Pending |
| UI-10 | Phase 3 | Pending |
| IMP-01 | Phase 4 | Pending |
| IMP-02 | Phase 4 | Pending |
| IMP-03 | Phase 4 | Pending |
| DEP-01 | Phase 5 | Pending |
| DEP-02 | Phase 5 | Pending |
| DEP-03 | Phase 5 | Pending |
| DEP-04 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 28 total
- Mapped to phases: 28
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-17*
*Last updated: 2026-06-17 after initial definition*
