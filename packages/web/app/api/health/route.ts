// ============================================
// API Route — 健康檢查
// ============================================
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "launchgate-web",
    timestamp: new Date().toISOString(),
  });
}