/**
 * Seed Script — 初始化數據
 */
import { prisma } from "./lib/prisma.js";

async function main() {
  const count = await prisma.user.count();
  if (count > 0) {
    console.log("✅ 數據已存在，跳過種子");
    return;
  }

  // 創建初始用戶
  await prisma.user.createMany({
    data: [
      { name: "管理員", email: "admin@launchgate.io", role: "ADMIN" },
      { name: "投資人張", email: "investor@demo.com", role: "INVESTOR" },
      { name: "創業者李", email: "founder@demo.com", role: "STARTUP" },
    ],
  });
  console.log("✅ 種子用戶已創建");

  // 創建初始興趣
  const interests = ["AI", "Web3", "SaaS", "Fintech", "HealthTech", "EduTech", "GreenTech", "Hardware"];
  for (const name of interests) {
    await prisma.interest.create({ data: { name } });
  }
  console.log("✅ 興趣數據已創建");

  await prisma.$disconnect();
}

main().catch(console.error);