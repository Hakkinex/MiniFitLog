# STATE.md: Lilith Training Tracker

**Last updated:** 2026-06-17

## Project Reference

See: .planning/PROJECT.md (updated 2026-06-17)

**Core value:** 每日運動記錄的快速輸入與持久保存
**Current focus:** Phase 1 — Database Foundation

## Current Phase

**Phase 1: Database Foundation**
- Status: Not Started
- Goal: 建立 SQLite 資料庫 schema、migration、repository 層

## Phase Progress

| Phase | Name | Status | Completion |
|-------|------|--------|------------|
| 1 | Database Foundation | Not Started | 0% |
| 2 | Backend API | Not Started | 0% |
| 3 | Frontend Calendar UI | Not Started | 0% |
| 4 | Excel Data Import | Not Started | 0% |
| 5 | Deployment | Not Started | 0% |

## Active Decisions

| Decision | Status | Context |
|----------|--------|---------|
| SQLite over PostgreSQL | Decided | 單人使用、零外部依賴 |
| Vanilla JS over React | Decided | 單人工具、零 build step |
| Fastify over Express | Decided | 效能 + TS 支援 |
| 雙欄位心跳 | Decided | 對應 149/113 格式 |
| 下拉 + 自訂運動類型 | Decided | 常用快速選 + 特殊自訂 |

## Session Notes

- 2026-06-17: 專案初始化，從 Excel 分析出完整資料結構
