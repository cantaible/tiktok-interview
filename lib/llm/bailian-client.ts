// Aliyun Bailian LLM client wrapper
// Note: This is a placeholder implementation since Aliyun Bailian SDK may not be fully available
// In production, you would use the actual @alicloud/bailian20231229 SDK

export interface LLMResult {
  summary: string | null;
  tags: string[] | null;
}

export interface EnrichmentInput {
  title: string;
  content?: string;
}

export class BailianClient {
  private apiKey: string;
  private workspaceId: string;
  private timeout: number;

  constructor(config: { apiKey?: string; workspaceId?: string; timeout?: number } = {}) {
    this.apiKey = config.apiKey || process.env.ALIYUN_BAILIAN_API_KEY || "";
    this.workspaceId = config.workspaceId || process.env.ALIYUN_BAILIAN_WORKSPACE_ID || "";
    this.timeout = config.timeout || 10000;

    if (!this.apiKey) {
      console.warn(
        "⚠️  ALIYUN_BAILIAN_API_KEY not configured. LLM enrichment will be disabled."
      );
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey && !!this.workspaceId;
  }

  async generateSummary(title: string, content?: string): Promise<string | null> {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      // Placeholder: In production, call actual Aliyun Bailian API
      // For MVP, we'll generate mock summaries
      const text = content || title;
      const summary = text.substring(0, 97) + "...";
      return summary;

      /* Production implementation would look like:
      const client = new BailianClient20231229({ ... });
      const response = await client.callModel({
        workspaceId: this.workspaceId,
        prompt: generateSummaryPrompt(title, content),
        model: "qwen-max",
      });
      return response.data.output;
      */
    } catch (error) {
      console.error("LLM summary generation failed:", error);
      return null;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async generateTags(title: string, _content?: string): Promise<string[] | null> {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      // Placeholder: In production, call actual Aliyun Bailian API
      // For MVP, we'll extract simple tags from title
      const words = title.split(/[\s,，、]+/);
      const tags = words
        .filter((w) => w.length > 2 && w.length < 20)
        .slice(0, 5)
        .map((w) => w.replace(/[^\w\u4e00-\u9fa5]/g, ""));

      return tags.length >= 2 ? tags.slice(0, 5) : null;

      /* Production implementation would look like:
      const client = new BailianClient20231229({ ... });
      const response = await client.callModel({
        workspaceId: this.workspaceId,
        prompt: generateTagsPrompt(title, content),
        model: "qwen-max",
      });
      const tagsString = response.data.output;
      return tagsString.split(/[,，]/).map(t => t.trim());
      */
    } catch (error) {
      console.error("LLM tags generation failed:", error);
      return null;
    }
  }

  async enrichArticle(input: EnrichmentInput): Promise<LLMResult> {
    const [summary, tags] = await Promise.all([
      this.generateSummary(input.title, input.content),
      this.generateTags(input.title, input.content),
    ]);

    return { summary, tags };
  }

  // Batch process articles with graceful degradation
  async enrichBatch(inputs: EnrichmentInput[]): Promise<LLMResult[]> {
    if (!this.isConfigured()) {
      console.log("ℹ️  LLM not configured, skipping enrichment");
      return inputs.map(() => ({ summary: null, tags: null }));
    }

    console.log(`🤖 Enriching ${inputs.length} articles with LLM...`);

    const results = await Promise.allSettled(
      inputs.map((input) => this.enrichArticle(input))
    );

    return results.map((result) => {
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        console.error("LLM enrichment failed for article:", result.reason);
        return { summary: null, tags: null };
      }
    });
  }
}

// Export singleton instance
export const llmClient = new BailianClient();
