LaunchGate - Launch as a Service Platform
============================================

項目結構：
packages/server/          # MCP Server (Node.js + TypeScript)
  ├── src/
  │   ├── index.ts         # 服務入口
  │   ├── lib/prisma.ts    # Prisma 客戶端
  │   ├── modules/
  │   │   ├── event-orchestrator.ts
  │   │   ├── demo-theater.ts
  │   │   ├── pitch-engine.ts
  │   │   ├── network-engine.ts
  │   │   ├── capital-matcher.ts
  │   │   ├── oneclick-network.ts
  │   │   ├── followup-crm.ts
  │   │   └── community-hub.ts
  │   └── seed.ts          # 初始數據腳本
  ├── package.json
  ├── tsconfig.json
  ├── Dockerfile
  └── prisma/schema.prisma

packages/web/             # Next.js 前端
  ├── app/
  │   ├── page.tsx          # 首頁
  │   ├── layout.tsx         # 全局佈局
  │   ├── dashboard/page.tsx  # 後台儀表板
  │   ├── events/page.tsx     # 活動列表
  │   ├── pitches/page.tsx    # 投資簡報
  │   ├── investors/page.tsx  # 投資人匹配
  │   ├── profile/page.tsx    # 聚客跟進
  │   └── mcp/page.tsx        # MCP 連接配置
  ├── lib/
  │   ├── mcp-client.ts       # MCP Client SDK
  │   └── mcp-client-browser.ts
  ├── styles/globals.css
  ├── next.config.js
  └── Dockerfile

cloudflare/workers/        # Edge 部署
  ├── wrangler.toml
  ├── src/
  │   ├── worker.ts           # 入口 (McAgent)
  │   ├── worker-complete.ts  # 完整整合版
  │   └── modules/
  │       ├── event-orchestrator-edge.ts
  │       ├── demo-theater-edge.ts
  │       ├── pitch-engine-edge.ts
  │       ├── capital-matcher-edge.ts
  │       ├── network-engine-edge.ts
  │       ├── followup-crm-edge.ts
  │       ├── oneclick-network-edge.ts
  │       └── community-hub-edge.ts
  └── sessions.ts

nginx/                      # 反代配置
  └── nginx.conf

k8s/                        # K8s 部署
  └── deployment.yaml

database/
  └── init-db.sql            # PostgreSQL Schema

scripts/
  └── test-mcp-client.mjs    # MCP 集成測試

deploy-cloudflare.sh         # Cloudflare 部署腳本
docker-compose.yml           # 開發環境
start-dev.sh                 # 快速啟動
turbo.json
package.json
README.md
docs/ADND.md                 # 架構設計文件
mcp-config.schema.json       # MCP 配置 Schema

============================================
核心設計原則：
1. Cloudflare + MCP 極致成本
2. Vercel + K8s 靈活操控
3. 適配永遠優先（預留接口）
4. Dockerfile 長治久安
5. Magic Moment 留存
6. 積極使用工具增強效率
7. 部分開源（Apache 2.0 / MIT）

可用工具模組：
- health_check          服務健康檢查
- create_event          創建活動（研討會）
- list_events           列出活動
- register_event        註冊活動
- submit_demo           提交產品演練
- get_demos             瀏覽演練（Magic Moment）
- vote_demo             演練投票
- create_pitch          創建投資簡報
- get_pitch             查看簡報詳情
- broadcast_pitch       一鍵全網發布
- search_investors      搜索投資人
- send_connection_request 發送連接
- match_investors       AI 匹配投資人
- generate_match_report  生成匹配報告
- create_followup       創建跟進任務
- get_pending_followups 查看待辦跟進
- get_community_feed    社區動態
- search_community_members 搜索社區成員
- get_dashboard_stats   儀表板統計
- auto_generate_followups 自動批量生成跟進