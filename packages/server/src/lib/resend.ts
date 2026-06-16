/**
 * Resend Service — 郵件發送
 */
import { Resend } from "resend";
import EmailWelcome from "../emails/welcome.js";
import EmailPitchApproved from "../emails/pitch-approved.js";
import EmailInvestorMatch from "../emails/investor-match.js";
import EmailFollowupReminder from "../emails/followup-reminder.js";
import { CONFIG, isResendConfigured } from "./config.js";

export class ResendService {
  private resend: Resend | null;

  constructor() {
    this.resend = isResendConfigured() ? new Resend(CONFIG.resendApiKey) : null;
  }

  async sendWelcome(email: string, name: string) {
    if (!this.resend) return { success: false, error: "Resend 未配置" };
    const { data, error } = await this.resend.emails.send({
      from: "LaunchGate <noreply@launchgate.io>", to: [email],
      subject: `🎉 歡迎加入 LaunchGate, ${name}！`, html: EmailWelcome(name),
    });
    return { success: !!data, error };
  }

  async sendPitchApproved(email: string, pitchTitle: string, pitchId: string) {
    if (!this.resend) return { success: false, error: "Resend 未配置" };
    const { data, error } = await this.resend.emails.send({
      from: "LaunchGate <noreply@launchgate.io>", to: [email],
      subject: `✅ 你的投資簡報「${pitchTitle}」已通過審核！`, html: EmailPitchApproved(pitchTitle, pitchId),
    });
    return { success: !!data, error };
  }

  async sendInvestorMatch(email: string, investorName: string, pitchTitle: string, matchScore: number) {
    if (!this.resend) return { success: false, error: "Resend 未配置" };
    const { data, error } = await this.resend.emails.send({
      from: "LaunchGate <noreply@launchgate.io>", to: [email],
      subject: `🤝 新的投資人匹配：${investorName}`, html: EmailInvestorMatch(investorName, pitchTitle, matchScore),
    });
    return { success: !!data, error };
  }

  async sendFollowupReminder(email: string, taskTitle: string, scheduledAt: string) {
    if (!this.resend) return { success: false, error: "Resend 未配置" };
    const { data, error } = await this.resend.emails.send({
      from: "LaunchGate <noreply@launchgate.io>", to: [email],
      subject: `📱 跟進提醒：${taskTitle}`, html: EmailFollowupReminder(taskTitle, scheduledAt),
    });
    return { success: !!data, error };
  }

  async sendBatch(recipients: { email: string; name: string }[], subject: string, templateFn: (name: string) => string) {
    if (!this.resend) return { success: false, error: "Resend 未配置" };
    const emails = recipients.map(({ email, name }) => ({
      from: "LaunchGate <noreply@launchgate.io>", to: [email], subject, html: templateFn(name),
    }));
    const results = await Promise.allSettled(emails.map((e) => this.resend!.emails.send(e)));
    return { success: true, sent: results.filter((r) => r.status === "fulfilled").length, failed: results.filter((r) => r.status === "rejected").length };
  }

  getUnsubscribeLink(email: string) {
    return `${CONFIG.appUrl}/unsubscribe?email=${encodeURIComponent(email)}`;
  }
}