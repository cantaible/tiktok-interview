/**
 * API route for global AI refresh operations
 * Implements v2 batch AI refresh with progress tracking (FR-002, FR-003, FR-004)
 */

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { batchGenerateSummaries } from '@/lib/llm/bailian-client';
import { batchUpdateArticleAI } from '@/lib/db/queries';

// In-memory store for active refresh sessions
// In production, use Redis or similar
interface RefreshSession {
  sessionId: string;
  total: number;
  processed: number;
  status: 'processing' | 'completed' | 'cancelled';
  abortController: AbortController;
}

const activeSessions = new Map<string, RefreshSession>();

/**
 * POST /api/ai-refresh - Initiate batch AI refresh
 */
export async function POST(request: NextRequest) {
  try {
    const { articleIds } = await request.json();

    if (!articleIds || !Array.isArray(articleIds) || articleIds.length === 0) {
      return NextResponse.json(
        { error: 'articleIds array is required' },
        { status: 400 }
      );
    }

    const sessionId = uuidv4();
    const abortController = new AbortController();

    // Create session
    const session: RefreshSession = {
      sessionId,
      total: articleIds.length,
      processed: 0,
      status: 'processing',
      abortController,
    };

    activeSessions.set(sessionId, session);

    // Start background processing (don't await)
    processAIRefresh(sessionId, articleIds, abortController).catch((error) => {
      console.error(`Session ${sessionId} failed:`, error);
      const s = activeSessions.get(sessionId);
      if (s) {
        s.status = 'completed';
      }
    });

    return NextResponse.json({
      sessionId,
      total: articleIds.length,
      message: 'AI refresh started',
    });
  } catch (error) {
    console.error('Failed to start AI refresh:', error);
    return NextResponse.json(
      { error: 'Failed to start AI refresh' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai-refresh?sessionId=xxx - Poll progress
 */
export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    const session = activeSessions.get(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const percentage = session.total > 0 
      ? (session.processed / session.total) * 100 
      : 0;

    return NextResponse.json({
      sessionId: session.sessionId,
      status: session.status,
      total: session.total,
      processed: session.processed,
      percentage,
    });
  } catch (error) {
    console.error('Failed to get progress:', error);
    return NextResponse.json(
      { error: 'Failed to get progress' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ai-refresh?sessionId=xxx - Cancel refresh
 */
export async function DELETE(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    const session = activeSessions.get(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Abort the operation
    session.abortController.abort();
    session.status = 'cancelled';

    return NextResponse.json({
      sessionId,
      message: 'AI refresh cancelled',
    });
  } catch (error) {
    console.error('Failed to cancel refresh:', error);
    return NextResponse.json(
      { error: 'Failed to cancel refresh' },
      { status: 500 }
    );
  }
}

/**
 * Background processing function
 */
async function processAIRefresh(
  sessionId: string,
  articleIds: string[],
  abortController: AbortController
): Promise<void> {
  const session = activeSessions.get(sessionId);
  if (!session) return;

  try {
    console.log(`🚀 Starting AI refresh session ${sessionId} for ${articleIds.length} articles`);
    
    // Generate summaries in batches
    const summaries = await batchGenerateSummaries(
      articleIds,
      abortController.signal,
      (processed) => {
        // Update progress callback
        const s = activeSessions.get(sessionId);
        if (s) {
          s.processed = processed;
        }
        console.log(`📊 Progress: ${processed}/${articleIds.length} articles processed`);
      }
    );

    console.log(`✅ Generated ${summaries.length} summaries`);
    console.log('Sample results:', summaries.slice(0, 2).map(s => ({
      id: s.articleId,
      summary: s.summary?.substring(0, 50),
      tags: s.tags
    })));

    // Check if cancelled
    if (abortController.signal.aborted) {
      console.log(`⚠️ Session ${sessionId} was cancelled`);
      session.status = 'cancelled';
      return;
    }

    // Batch update database
    console.log(`💾 Updating database with ${summaries.length} articles...`);
    await batchUpdateArticleAI(summaries);
    console.log(`✅ Database updated successfully`);

    session.status = 'completed';
    session.processed = session.total;
  } catch (error) {
    console.error('❌ AI refresh processing error:', error);
    session.status = 'completed';
  }
}
