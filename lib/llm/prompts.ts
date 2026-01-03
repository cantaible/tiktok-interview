// LLM prompt templates for Aliyun Bailian

export function generateSummaryPrompt(title: string, content?: string): string {
  return `Please generate a one-sentence summary (maximum 100 characters) for the following article:

Title: ${title}
${content ? `Content: ${content.substring(0, 500)}...` : ""}

Requirements:
- Must be under 100 characters
- One sentence only
- Capture the main point
- Chinese content should have Chinese summary, English content should have English summary

Summary:`;
}

export function generateTagsPrompt(title: string, content?: string): string {

  return `Please extract 2-5 relevant topic tags for the following article:

Title: ${title}
${content ? `Content: ${content.substring(0, 500)}...` : ""}

Requirements:
- Return 2-5 tags
- Each tag should be 1-3 words
- Use the same language as the article (Chinese/English)
- Focus on technology, companies, products, or key concepts
- Return as comma-separated list

Tags:`;
}
