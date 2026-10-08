import { NextRequest, NextResponse } from 'next/server';
import { getServerMessages, saveServerMessage, getUserChatThreads } from '@/lib/server-storage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const u1 = searchParams.get('u1');
    const u2 = searchParams.get('u2');
    const username = searchParams.get('username');

    if (u1 && u2) {
      const messages = await getServerMessages(u1, u2);
      return NextResponse.json({ success: true, messages });
    }

    if (username) {
      const threads = await getUserChatThreads(username);
      return NextResponse.json({ success: true, threads });
    }

    return NextResponse.json(
      { success: false, error: 'Provide either (u1 and u2) or username.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Chat GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve messages.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message || !message.senderUsername || !message.receiverUsername) {
      return NextResponse.json(
        { success: false, error: 'Sender, receiver, and message content are required.' },
        { status: 400 }
      );
    }

    const saved = await saveServerMessage(message);
    return NextResponse.json({ success: true, message: saved });
  } catch (error) {
    console.error('Chat POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send message.' }, { status: 500 });
  }
}
