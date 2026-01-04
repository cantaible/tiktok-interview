# API Contract: `/api/ai-refresh` (New in v2)

**Purpose**: Batch refresh AI-generated content (summaries + tags) for selected articles  
**Method**: POST, GET, DELETE  
**Authentication**: None (local-first, no auth required)

---

## POST `/api/ai-refresh`

**Description**: Initiates batch AI refresh for specified articles

### Request

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "articleIds": ["uuid-1", "uuid-2", "uuid-3", "uuid-4", "uuid-5"]
}
```

**TypeScript Interface**:
```typescript
interface AIRefreshRequest {
  /** Array of article IDs to refresh (max 50) */
  articleIds: string[];
}
```

**Validation Rules**:
- `articleIds` must be non-empty array
- Each ID must exist in `articles` table
- Max 50 articles per request (UI enforces 5, but API allows flexibility)
- Duplicate IDs are deduplicated server-side

### Response (200 OK)

**Body**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "total": 5,
  "status": "in-progress"
}
```

**TypeScript Interface**:
```typescript
interface AIRefreshResponse {
  /** Unique session ID for polling progress */
  sessionId: string;
  
  /** Total number of articles to process */
  total: number;
  
  /** Initial status (always "in-progress") */
  status: 'in-progress';
}
```

### Error Responses

**400 Bad Request**:
```json
{
  "error": "Invalid article IDs",
  "details": ["uuid-999 does not exist"]
}
```

**500 Internal Server Error**:
```json
{
  "error": "Failed to initialize AI refresh session",
  "message": "Database connection failed"
}
```

---

## GET `/api/ai-refresh?sessionId={uuid}`

**Description**: Polls progress of ongoing AI refresh batch

### Request

**Query Parameters**:
- `sessionId` (required): UUID returned from POST request

**Example**:
```
GET /api/ai-refresh?sessionId=550e8400-e29b-41d4-a716-446655440000
```

### Response (200 OK)

**Body (In Progress)**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "progress": 3,
  "total": 5,
  "status": "in-progress"
}
```

**Body (Completed)**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "progress": 5,
  "total": 5,
  "status": "completed",
  "results": {
    "succeeded": 5,
    "failed": 0,
    "errors": []
  }
}
```

**Body (Error)**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "progress": 2,
  "total": 5,
  "status": "error",
  "error": "LLM API rate limit exceeded",
  "results": {
    "succeeded": 2,
    "failed": 3,
    "errors": [
      { "articleId": "uuid-3", "error": "Timeout after 30s" },
      { "articleId": "uuid-4", "error": "Invalid response format" },
      { "articleId": "uuid-5", "error": "API rate limit" }
    ]
  }
}
```

**TypeScript Interface**:
```typescript
interface AIRefreshProgressResponse {
  sessionId: string;
  progress: number;
  total: number;
  status: 'in-progress' | 'completed' | 'cancelled' | 'error';
  error?: string;
  results?: {
    succeeded: number;
    failed: number;
    errors: Array<{
      articleId: string;
      error: string;
    }>;
  };
}
```

### Error Responses

**404 Not Found**:
```json
{
  "error": "Session not found",
  "sessionId": "invalid-uuid"
}
```

---

## DELETE `/api/ai-refresh?sessionId={uuid}`

**Description**: Cancels ongoing AI refresh batch

### Request

**Query Parameters**:
- `sessionId` (required): UUID of session to cancel

**Example**:
```
DELETE /api/ai-refresh?sessionId=550e8400-e29b-41d4-a716-446655440000
```

### Response (200 OK)

**Body**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "cancelled",
  "progress": 2,
  "total": 5,
  "message": "AI refresh cancelled, 2 of 5 articles updated"
}
```

**TypeScript Interface**:
```typescript
interface AIRefreshCancelResponse {
  sessionId: string;
  status: 'cancelled';
  progress: number;
  total: number;
  message: string;
}
```

### Error Responses

**404 Not Found**:
```json
{
  "error": "Session not found or already completed"
}
```

**409 Conflict**:
```json
{
  "error": "Cannot cancel completed session",
  "status": "completed"
}
```

---

## Implementation Notes

### Batch Processing Algorithm

```typescript
async function processAIRefreshBatch(
  articleIds: string[],
  signal: AbortSignal,
  sessionId: string
): Promise<void> {
  const session = refreshSessions.get(sessionId);
  
  for (let i = 0; i < articleIds.length; i++) {
    if (signal.aborted) {
      session.status = 'cancelled';
      break;
    }
    
    try {
      const article = db.getArticleById(articleIds[i]);
      const aiResult = await llmClient.generateSummary(
        article.content,
        { signal }
      );
      
      db.updateArticleAIContent(
        articleIds[i],
        aiResult.summary,
        aiResult.tags
      );
      
      session.progress++;
    } catch (error) {
      session.results.errors.push({
        articleId: articleIds[i],
        error: error.message
      });
      session.results.failed++;
    }
  }
  
  session.status = session.results.failed > 0 ? 'error' : 'completed';
  cleanupSession(sessionId);
}
```

### Client-Side Polling Pattern

```typescript
// components/AIRefreshButton.tsx
async function startAIRefresh(articleIds: string[]) {
  const initRes = await fetch('/api/ai-refresh', {
    method: 'POST',
    body: JSON.stringify({ articleIds })
  });
  const { sessionId, total } = await initRes.json();
  
  setIsRefreshing(true);
  setProgress(0);
  setTotal(total);
  
  const intervalId = setInterval(async () => {
    const progressRes = await fetch(`/api/ai-refresh?sessionId=${sessionId}`);
    const { progress, status, results } = await progressRes.json();
    
    setProgress(progress);
    
    if (status === 'completed') {
      clearInterval(intervalId);
      setIsRefreshing(false);
      toast.success(`${results.succeeded} articles refreshed`);
    } else if (status === 'error') {
      clearInterval(intervalId);
      setIsRefreshing(false);
      toast.error(`Failed to refresh ${results.failed} articles`);
    }
  }, 500);  // Poll every 500ms
  
  return { sessionId, cancelFn: () => handleCancel(sessionId, intervalId) };
}
```

### Rate Limiting (Optional Enhancement)

```typescript
// Prevent abuse: Max 1 batch per user per 10 seconds
const rateLimiter = new Map<string, number>();  // IP -> last request timestamp

export function checkRateLimit(ip: string): boolean {
  const lastRequest = rateLimiter.get(ip) || 0;
  const now = Date.now();
  
  if (now - lastRequest < 10_000) {
    return false;  // Rate limit exceeded
  }
  
  rateLimiter.set(ip, now);
  return true;
}
```

---

## Cost Analysis

**LLM API Pricing** (Aliyun Bailian):
- Input: ¥0.001 per 1K tokens (~500 words)
- Output: ¥0.002 per 1K tokens (~500 words)

**Per Article Cost**:
- Input: 2000 words (article content) = 4K tokens = ¥0.004
- Output: 200 words (summary + tags) = 0.4K tokens = ¥0.0008
- **Total**: ~¥0.005 per article

**Batch Cost** (5 articles):
- ¥0.005 × 5 = **¥0.025 per batch** (~$0.0035 USD)

**Monthly Estimate** (100 batches/day × 30 days):
- ¥0.025 × 100 × 30 = **¥75/month** (~$10 USD)
