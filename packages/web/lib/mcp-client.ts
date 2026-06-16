// MCP Client SDK 封裝 — 供 Web App 使用
// 使用 MCP v1.8 Streamable HTTP 協議

export class LaunchGateClient {
  private serverUrl: string;

  constructor(serverUrl: string = "http://localhost:3001") {
    this.serverUrl = serverUrl.replace(/\/+$/, "");
  }

  // ---- MCP 工具調用 ----

  async healthCheck() {
    return this.callTool("health_check", {});
  }

  async createEvent(data: any) {
    return this.callTool("create_event", data);
  }

  async listEvents(filters?: any) {
    return this.callTool("list_events", filters || {});
  }

  async registerEvent(eventId: string, role?: string) {
    return this.callTool("register_event", { eventId, role });
  }

  async submitDemo(data: any) {
    return this.callTool("submit_demo", data);
  }

  async getDemos(filters?: any) {
    return this.callTool("get_demos", filters || {});
  }

  async voteDemo(demoId: string, value: "up" | "down") {
    return this.callTool("vote_demo", { demoId, value });
  }

  async createPitch(data: any) {
    return this.callTool("create_pitch", data);
  }

  async getPitch(pitchId: string) {
    return this.callTool("get_pitch", { pitchId });
  }

  async broadcastPitch(pitchId: string, platforms: string[], message?: string) {
    return this.callTool("broadcast_pitch", { pitchId, platforms, message });
  }

  async searchInvestors(filters?: any) {
    return this.callTool("search_investors", filters || {});
  }

  async matchInvestors(pitchId: string, maxResults?: number) {
    return this.callTool("match_investors", { pitchId, maxResults });
  }

  async generateMatchReport(pitchId: string, format?: string) {
    return this.callTool("generate_match_report", { pitchId, format });
  }

  async sendConnection(targetId: string, type?: string, message?: string) {
    return this.callTool("send_connection_request", { targetId, type, message });
  }

  async createFollowUp(data: any) {
    return this.callTool("create_followup", data);
  }

  async getPendingFollowups(daysAhead?: number) {
    return this.callTool("get_pending_followups", { daysAhead });
  }

  async getDashboardStats() {
    return this.callTool("get_dashboard_stats", {});
  }

  async getCommunityFeed(limit?: number) {
    return this.callTool("get_community_feed", { limit });
  }

  async searchCommunityMembers(query: string, sector?: string) {
    return this.callTool("search_community_members", { query, sector });
  }

  async shareResource(data: any) {
    return this.callTool("share_resource", data);
  }

  async getUpcomingEvents(limit?: number) {
    return this.callTool("get_upcoming", { limit });
  }

  async getLeaderboard() {
    return this.callTool("get_leaderboard", {});
  }

  // ---- MCP Streamable HTTP 調用 ----

  private async callTool(toolName: string, params: any) {
    try {
      // MCP v1.8 Streamable HTTP 協議：使用 /mcp 端點
      const response = await fetch(`${this.serverUrl}/mcp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: Date.now(),
          method: "tools/call",
          params: { name: toolName, arguments: params },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`MCP Error: ${response.status} ${error}`);
      }

      const data = await response.json();
      return data.result || data;
    } catch (error) {
      console.error(`MCP call failed: ${toolName}`, error);
      throw error;
    }
  }
}