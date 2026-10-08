import { NextRequest, NextResponse } from 'next/server';
import { markServerMessagesAsRead } from '@/lib/server-storage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { senderUsername, receiverUsername } = body;

    if (!senderUsername || !receiverUsername) {
      return NextResponse.json(
        { success: false, error: 'senderUsername and receiverUsername required.' },
        { status: 400 }
      );
    }

    await markServerMessagesAsRead(senderUsername, receiverUsername);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Chat read POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to mark messages as read.' }, { status: 500 });
  }
}
