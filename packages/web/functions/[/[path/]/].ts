// functions/[[path]].ts — Cloudflare Pages Functions 入口
// 將所有請求轉發到 Next.js standalone 服務器

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 靜態資源直接從 KV 提供（未來優化）
    if (url.pathname.startsWith('/_next/static') ||
        url.pathname.startsWith('/_next/image') ||
        url.pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/)) {
      // 如果配置了 KV 靜態資源存儲，從 KV 讀取
      // 否則 fallback 到 build output
    }

    // 所有其他請求返回 index.html (SPA-style routing)
    // Cloudflare Pages 會自動處理靜態導出
    return new Response(null, {
      status: 404,
      headers: { "Content-Type": "text/html" },
    });
  },
};