# Lilith Training Tracker

## What This Is

一個自託管的運動記錄 Web 應用，讓 Lilith 每日記錄有氧運動與棒式/捲腹的達成狀態、心跳、運動類型，以及每週的體脂肪、體重與腰圍。自動計算月度達成率，取代原本的 Excel 追蹤表。

## Core Value

每日運動記錄的快速輸入與持久保存 — 打開頁面、選下拉選單、填數字、存檔，整個流程不超過 30 秒。

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] 月曆式介面顯示整月每日運動記錄
- [ ] 每日有氧運動：下拉選單（Y/N）+ 運動類型下拉 + 心跳輸入
- [ ] 每日棒式/捲腹：下拉選單（Y/N）+ 項目下拉 + 心跳輸入
- [ ] 未達成時可填寫備註（加班、生理期等）
- [ ] 每週左側輸入體脂肪%、體重 kg、腰圍 cm
- [ ] 自動計算月度有氧達成率與棒式/捲腹達成率
- [ ] 月份切換導航（前一月/後一月）
- [ ] 資料寫入 SQLite 資料庫持久保存
- [ ] 簡單密碼保護（單人使用）
- [ ] 可 Docker 部署於自託管伺服器
- [ ] 匯入既有 Excel 歷史資料（2025 + 2026）

### Out of Scope

- 多使用者系統 — 單人使用，不需要使用者管理
- 社群分享功能 — 純個人記錄工具
- 行動裝置原生 App — Web 優先，RWD 即可
- 複雜的統計分析圖表 — v1 只需達成率計算
- OAuth 第三方登入 — 密碼保護足夠

## Context

- 原始資料存於 Excel 檔案 `Lilith Training Plan (1).xlsx`，包含 2025 和 2026 兩個 Sheet
- 2025 Sheet 格式：每週一行 Plan + 一行 Actually，有氧和 Workout 交替
- 2026 Sheet 格式：每週兩行（有氧 + 棒式/捲腹），左側有週度量測（Body Fat/Weight/Waist），右側有逐週記錄
- 心跳格式為「有氧心跳/捲腹心跳」（如 149/113），部分只有單一數字
- 運動類型包含：超慢跑(30mins)、爆裂飛輪、踏步機(30mins)、Tabata 15 mins、爬樓梯(40mins)、渣打半馬、腳踏車
- Workout 項目包含：棒式*5(30秒)、捲腹(10次)、深蹲(10次)、提臀(10次)、弓箭步(10次)、上胸(10次)、Workout*2

## Constraints

- **Tech Stack**: Node.js + Fastify + TypeScript + SQLite (better-sqlite3) — 單人使用無併發需求，SQLite 最簡
- **Frontend**: Vanilla HTML/CSS/JS — 單人工具，零框架依賴
- **Package Manager**: pnpm — 遵循專案規範
- **Deploy**: Docker + docker-compose — 自託管部署
- **DB Migration**: 不得修改既有 migration 檔案

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| SQLite over PostgreSQL | 單人使用、零外部依賴、備份即複製檔案 | — Pending |
| Vanilla JS over React | 單人工具、部署最簡、無 build step | — Pending |
| Fastify over Express | 效能較好、TypeScript 支援較佳、Schema 驗證內建 | — Pending |
| 雙欄位心跳（有氧/捲腹分開） | 對應 Excel 的 149/113 格式，資料結構更清晰 | — Pending |
| 運動類型下拉 + 自訂 | 常用項目快速選取，特殊項目可自由輸入 | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-17 after initialization*
