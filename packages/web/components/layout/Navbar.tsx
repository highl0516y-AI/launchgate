// ============================================
// Navbar Component
// ============================================
"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "首頁" },
    { href: "/events", label: "活動" },
    { href: "/pitches", label: "投資簡報" },
    { href: "/investors", label: "投資人" },
    { href: "/profile", label: "我的任務" },
    { href: "/dashboard", label: "後台" },
  ];

  return (
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
                {item.label}
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
                {item.label}
              </Link>
            ))}
            <button className="btn-primary w-full mt-2">登入 / 註冊</button>
          </div>
        </div>
      )}
    </nav>
  );
}