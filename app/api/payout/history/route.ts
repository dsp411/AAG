import { NextRequest, NextResponse } from 'next/server';
import { getPayoutHistoryForUser, getAllPayoutRecords } from '@/lib/payout-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (username) {
      const records = await getPayoutHistoryForUser(username);
      return NextResponse.json({
        success: true,
        username,
        records,
      });
    }

    const allRecords = await getAllPayoutRecords();
    return NextResponse.json({
      success: true,
      records: allRecords,
    });
  } catch (err: any) {
    console.error('Payout History API error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Failed to fetch payout records',
      },
      { status: 500 }
    );
  }
}
