/**
 * API route to check if AI features are configured
 */

import { NextResponse } from 'next/server';
import { llmClient } from '@/lib/llm/bailian-client';

export async function GET() {
  return NextResponse.json({
    isConfigured: llmClient.isConfigured(),
  });
}
