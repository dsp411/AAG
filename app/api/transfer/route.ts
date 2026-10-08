import { NextRequest, NextResponse } from 'next/server';
import { transferMoneyP2P } from '@/lib/server-storage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { senderUsername, receiverUsername, fromBankAccountId, amount, memo } = body;

    if (!senderUsername || !receiverUsername || !fromBankAccountId || typeof amount !== 'number') {
      return NextResponse.json(
        { success: false, error: 'senderUsername, receiverUsername, fromBankAccountId, and valid amount are required.' },
        { status: 400 }
      );
    }

    const result = await transferMoneyP2P(
      senderUsername,
      receiverUsername,
      fromBankAccountId,
      amount,
      memo
    );

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Transfer API error:', error);
    return NextResponse.json({ success: false, error: 'Failed to process bank wire transfer.' }, { status: 500 });
  }
}
