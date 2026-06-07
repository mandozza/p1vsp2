import { NextResponse } from 'next/server';
import { getRecentMessages } from '@/actions/chat.actions';

export async function GET() {
  const messages = await getRecentMessages();
  return NextResponse.json(messages);
}
