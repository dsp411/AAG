import { NextRequest, NextResponse } from 'next/server';
import {
  getServerAccounts,
  getServerAccount,
  saveServerAccount,
  getServerPortfolio,
  saveServerPortfolio,
} from '@/lib/server-storage';
import { UserAccount } from '@/types/finance';
import { createDavisPortfolio, createCleanPortfolio } from '@/lib/initial-data';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, fullName, avatarUrl, googleId, currency, starterType } = body;

    if (!email || !fullName) {
      return NextResponse.json(
        { success: false, error: 'Google email and name are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(fullName).trim();

    // Derive base username from email (before @)
    let baseUsername = cleanEmail.split('@')[0].replace(/[^a-z0-9_]/g, '');
    if (baseUsername.length < 3) baseUsername = `user_${baseUsername}`;

    // Look for existing account by email or username
    const allAccounts = await getServerAccounts();
    let existing = allAccounts.find(
      a => (a.email && a.email.toLowerCase() === cleanEmail) || a.username.toLowerCase() === baseUsername
    );

    const isDavisMaster = cleanEmail === 'davissandhu2@gmail.com' || baseUsername === 'davis';

    if (existing) {
      // Existing Google account or matching username -> update and login
      const updatedUser: UserAccount = {
        ...existing,
        fullName: existing.fullName || cleanName,
        email: cleanEmail,
        avatarUrl: avatarUrl || existing.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
        authProvider: 'google',
        googleId: googleId || existing.googleId,
        isMasterAdmin: isDavisMaster || existing.isMasterAdmin,
      };

      await saveServerAccount(updatedUser);

      let portfolio = await getServerPortfolio(updatedUser.username);
      if (!portfolio) {
        portfolio = isDavisMaster ? createDavisPortfolio() : createCleanPortfolio(updatedUser);
        await saveServerPortfolio(updatedUser.username, portfolio);
      }

      return NextResponse.json({
        success: true,
        user: updatedUser,
        portfolio,
        isNewUser: false,
        message: `Welcome back, ${updatedUser.fullName}! Authenticated via Google.`,
      });
    }

    // New Google Account Creation
    // Ensure unique username
    let finalUsername = baseUsername;
    let counter = 1;
    while (allAccounts.some(a => a.username.toLowerCase() === finalUsername.toLowerCase())) {
      finalUsername = `${baseUsername}_${counter}`;
      counter++;
    }

    const newUser: UserAccount = {
      id: `usr_google_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      username: finalUsername,
      password: `google_oauth_${Date.now()}`,
      fullName: cleanName,
      email: cleanEmail,
      currency: currency || 'USD',
      createdAt: new Date().toISOString().split('T')[0],
      avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
      authProvider: 'google',
      googleId: googleId || `gid_${Date.now()}`,
      isMasterAdmin: isDavisMaster,
    };

    await saveServerAccount(newUser);

    // Initialize cloud portfolio
    const initialPortfolio =
      starterType === 'executive' || isDavisMaster
        ? {
            ...createDavisPortfolio(),
            user: newUser,
          }
        : createCleanPortfolio(newUser);

    await saveServerPortfolio(finalUsername, initialPortfolio);

    return NextResponse.json({
      success: true,
      user: newUser,
      portfolio: initialPortfolio,
      isNewUser: true,
      message: `AAG Account created successfully with Google for ${newUser.fullName}!`,
    });
  } catch (error) {
    console.error('Google Auth Route error:', error);
    return NextResponse.json(
      { success: false, error: 'Google authentication service encountered an error.' },
      { status: 500 }
    );
  }
}
