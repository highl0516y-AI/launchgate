/**
 * 歡迎郵件模板
 */
import { CONFIG } from "../lib/config.js";

export default function EmailWelcome(name: string) {
  const appUrl = CONFIG.appUrl;
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Welcome to LaunchGate</title>
<style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0f172a;color:#f1f5f9;margin:0;padding:0}.container{max-width:600px;margin:0 auto;padding:40px 20px}.card{background:#1e293b;border:1px solid #334155;border-radius:12px;padding:40px}.logo{font-size:32px;font-weight:bold;background:linear-gradient(135deg,#6366f1,#f59e0b);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:24px}.greeting{font-size:24px;font-weight:600;margin-bottom:16px}.body-text{font-size:16px;line-height:1.6;color:#94a3b8;margin-bottom:24px}.button{display:inline-block;background:linear-gradient(135deg,#6366f1,#4f46e5);color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px}.footer{margin-top:32px;padding-top:24px;border-top:1px solid #334155;color:#64748b;font-size:14px}</style></head><body>
<div class="container"><div class="card">
<div class="logo">🚀 LaunchGate</div>
<div class="greeting">你好，${name}！</div>
<div class="body-text"><p>歡迎加入 LaunchGate — 全方位 Launch as a Service 平台！</p><ul><li>✅ 發布和管理研討會/活動</li><li>✅ 展示產品演練，吸引投資人關注</li><li>✅ 一鍵發布投資簡報到全網</li><li>✅ 智能匹配最適合的投資人</li><li>✅ 自動化追蹤，不錯過任何機會</li></ul></div>
<a href="${appUrl}" class="button">立即開始 →</a>
<div class="footer"><p>有任何問題？隨時回覆此郵件聯繫我們。</p><p>&copy; 2025 LaunchGate. All rights reserved.</p><p><a href="${appUrl}/unsubscribe" style="color:#64748b;">取消訂閱</a></p></div>
</div></div></body></html>`;
}