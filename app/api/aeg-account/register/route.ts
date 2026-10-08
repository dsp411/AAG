import { NextRequest, NextResponse } from 'next/server';
import { getServerAccount, saveServerAccount, saveServerPortfolio } from '@/lib/server-storage';
import { UserAccount } from '@/types/finance';
import { createDavisPortfolio, createCleanPortfolio } from '@/lib/initial-data';
import { validateAppUsername } from '@/lib/username-rules';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password, fullName, currency, starterType } = body;

    if (!username || !password || !fullName) {
      return NextResponse.json(
        { success: false, error: 'Username, password, and full name are required.' },
        { status: 400 }
      );
    }

    const validation = validateAppUsername(String(username));
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.errorMessage || 'Invalid username format (1-30 characters, letters, numbers, dots, and underscores only).',
        },
        { status: 400 }
      );
    }

    const cleanUsername = validation.normalized;

    const existing = await getServerAccount(cleanUsername);
    if (existing) {
      return NextResponse.json(
        { success: false, error: `@${cleanUsername} is already taken. Please choose another username.` },
        { status: 409 }
      );
    }

    const newUser: UserAccount = {
      id: `usr_${cleanUsername}_${Date.now()}`,
      username: cleanUsername,
      password: String(password),
      fullName: String(fullName).trim(),
      currency: currency || 'USD',
      createdAt: new Date().toISOString().split('T')[0],
    };

    await saveServerAccount(newUser);

    // Create initial portfolio on server
    const initialPortfolio =
      starterType === 'executive'
        ? {
            ...createDavisPortfolio(),
            user: newUser,
          }
        : createCleanPortfolio(newUser);

    await saveServerPortfolio(cleanUsername, initialPortfolio);

    return NextResponse.json({
      success: true,
      user: newUser,
      portfolio: initialPortfolio,
      message: 'AAG Account successfully created and cloud synced!',
    });
  } catch (error) {
    console.error('AAG Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create AAG account on server.' },
      { status: 500 }
    );
  }
}
