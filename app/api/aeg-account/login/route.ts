import { NextRequest, NextResponse } from 'next/server';
import { getServerAccount, getServerPortfolio, saveServerPortfolio } from '@/lib/server-storage';
import { createCleanPortfolio } from '@/lib/initial-data';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required.' },
        { status: 400 }
      );
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const account = await getServerAccount(cleanUsername);

    if (!account) {
      return NextResponse.json(
        { success: false, error: 'No AAG account found with this username. Please sign up first.' },
        { status: 404 }
      );
    }

    if (account.password !== password) {
      return NextResponse.json(
        { success: false, error: 'Incorrect password for this AAG account.' },
        { status: 401 }
      );
    }

    // Retrieve or initialize their cloud-synced portfolio
    let portfolio = await getServerPortfolio(cleanUsername);
    if (!portfolio) {
      portfolio = createCleanPortfolio(account);
      await saveServerPortfolio(cleanUsername, portfolio);
    }

    return NextResponse.json({
      success: true,
      user: account,
      portfolio,
      message: 'AAG Account authenticated successfully. Cloud data synchronized!',
    });
  } catch (error) {
    console.error('AAG Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Server authentication failed.' },
      { status: 500 }
    );
  }
}
