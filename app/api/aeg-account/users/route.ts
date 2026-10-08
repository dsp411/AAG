import { NextResponse } from 'next/server';
import { getServerAccounts } from '@/lib/server-storage';

export async function GET() {
  try {
    const accounts = await getServerAccounts();
    // Return sanitized public profiles without passwords
    const sanitized = accounts.map(a => ({
      username: a.username,
      fullName: a.fullName,
      currency: a.currency,
      createdAt: a.createdAt,
    }));
    return NextResponse.json({ success: true, accounts: sanitized });
  } catch (error) {
    console.error('AEG Users GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve accounts.' }, { status: 500 });
  }
}
