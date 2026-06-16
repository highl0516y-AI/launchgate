// ============================================
// LaunchGate Web — App Layout & Navigation
// ============================================

"use client";

import { useState } from "react";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "首頁", icon: "🏠" },
    { href: "/events", label: "活動", icon: "🎤" },
    { href: "/pitches", label: "投資簡報", icon: "📊" },
    { href: "/investors", label: "投資人", icon: "🤝" },
    { href: "/profile", label: "我的任務", icon: "📱" },
    { href: "/dashboard", label: "後台", icon: "⚙️" },
  ];

  return (
    <html lang="zh-Hant">
      <head>
        <title>LaunchGate - Launch as a Service</title>
        <meta name="description" content="全方位發佈平台 — 研討會發佈、產品演練、演說集資" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-2xl">🚀</span>
                <span className="text-xl font-bold gradient-text">LaunchGate</span>
              </Link>
              <div className="hidden md:flex items-center gap-6">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}
                    className="text-text-secondary hover:text-primary transition-colors text-sm font-medium">
                    {item.icon} {item.label}
                  </Link>
                ))}
                <button className="btn-primary text-sm">登入 / 註冊</button>
              </div>
              <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
                <div className="w-6 h-6 flex flex-col justify-center gap-1.5">
                  <span className="w-full h-0.5 bg-primary block" />
                  <span className="w-full h-0.5 bg-primary block" />
                  <span className="w-full h-0.5 bg-primary block" />
                </div>
              </button>
            </div>
          </div>
          {menuOpen && (
            <div className="md:hidden border-t border-slate-800/50 bg-slate-950/95 backdrop-blur-xl">
              <div className="px-4 py-4 space-y-3">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}
                    className="block text-text-secondary hover:text-primary transition-colors py-2"
                    onClick={() => setMenuOpen(false)}>
                    {item.icon} {item.label}
                  </Link>
                ))}
                <button className="btn-primary w-full mt-2">登入 / 註冊</button>
              </div>
            </div>
          )}
        </nav>
        <div className="pt-16 min-h-screen">{children}</div>
        <footer className="border-t border-slate-800/50 mt-24">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-bold gradient-text mb-4">LaunchGate</h3>
                <p className="text-text-secondary text-sm">一站式 Launch as a Service 平台</p>
              </div>
              <div>
                <h4 className="font-bold mb-3">產品</h4>
                <ul className="space-y-2 text-text-secondary text-sm">
                  <li><Link href="/events" className="hover:text-primary transition">活動管理</Link></li>
                  <li><Link href="/pitches" className="hover:text-primary transition">投資簡報</Link></li>
                  <li><Link href="/investors" className="hover:text-primary transition">投資人匹配</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-3">公司</h4>
                <ul className="space-y-2 text-text-secondary text-sm">
                  <li><a href="#" className="hover:text-primary transition">關於我們</a></li>
                  <li><a href="#" className="hover:text-primary transition">聯絡方式</a></li>
                  <li><a href="#" className="hover:text-primary transition">隱私政策</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-3">聯繫</h4>
                <ul className="space-y-2 text-text-secondary text-sm">
                  <li>📧 contact@launchgate.io</li>
                  <li>📞 +886-800-123-456</li>
                  <li>📍 Taipei, Taiwan</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-slate-800/50 mt-8 pt-8 text-center text-text-secondary text-sm">
              © 2025 LaunchGate. MCP Server 開源 (Apache 2.0)
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}