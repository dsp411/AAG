import { NextRequest, NextResponse } from 'next/server';
import { getServerPortfolio, saveServerPortfolio } from '@/lib/server-storage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ success: false, error: 'Username parameter is required.' }, { status: 400 });
    }

    const portfolio = await getServerPortfolio(username);
    if (!portfolio) {
      return NextResponse.json({ success: false, error: 'Portfolio not found on server.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, portfolio });
  } catch (error) {
    console.error('AEG Portfolio GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve portfolio.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, portfolio } = body;

    if (!username || !portfolio) {
      return NextResponse.json(
        { success: false, error: 'Username and portfolio payload are required.' },
        { status: 400 }
      );
    }

    await saveServerPortfolio(username, portfolio);
    return NextResponse.json({ success: true, message: 'Cloud portfolio synchronized across all devices.' });
  } catch (error) {
    console.error('AEG Portfolio Sync POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to sync portfolio.' }, { status: 500 });
  }
}
