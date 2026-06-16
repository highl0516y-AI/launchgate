/**
 * 跟進提醒郵件
 */
import { CONFIG } from "../lib/config.js";

export default function EmailFollowupReminder(taskTitle: string, scheduledAt: string) {
  const appUrl = CONFIG.appUrl;
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Follow-up Reminder</title>
<style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0f172a;color:#f1f5f9;margin:0;padding:0}.container{max-width:600px;margin:0 auto;padding:40px 20px}.card{background:#1e293b;border:1px solid #334155;border-radius:12px;padding:40px}.logo{font-size:32px;font-weight:bold;background:linear-gradient(135deg,#6366f1,#818cf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:24px}.greeting{font-size:24px;font-weight:600;margin-bottom:16px}.body-text{font-size:16px;line-height:1.6;color:#94a3b8;margin-bottom:24px}.button{display:inline-block;background:linear-gradient(135deg,#6366f1,#818cf8);color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px}.footer{margin-top:32px;padding-top:24px;border-top:1px solid #334155;color:#64748b;font-size:14px}</style></head><body>
<div class="container"><div class="card">
<div class="logo">📱 跟進提醒</div>
<div class="greeting">提醒！</div>
<div class="body-text"><p>你有一個待辦跟進任務：</p><p><strong>${taskTitle}</strong></p><p>預定時間：${new Date(scheduledAt).toLocaleString('zh-TW')}</p></div>
<a href="${appUrl}/profile" class="button">查看我的任務</a>
<div class="footer"><p>&copy; 2025 LaunchGate. All rights reserved.</p></div>
</div></div></body></html>`;
}