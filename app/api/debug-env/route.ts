import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check for Zegocloud-related environment variables
    const zegoAppId = process.env.NEXT_PUBLIC_ZEGOCLOUD_APP_ID;
    const zegoServerSecret = process.env.NEXT_PUBLIC_ZEGOCLOUD_SERVER_SECRET;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    // Return masked values for security
    return NextResponse.json({
      success: true,
      environment: {
        NEXT_PUBLIC_ZEGOCLOUD_APP_ID: zegoAppId ? `${zegoAppId.substring(0, 3)}...` : null,
        NEXT_PUBLIC_ZEGOCLOUD_SERVER_SECRET: zegoServerSecret ? `${zegoServerSecret.substring(0, 4)}...` : null,
        NEXT_PUBLIC_APP_URL: appUrl,
      },
      validZegoConfig: Boolean(zegoAppId && zegoServerSecret),
      rawEnvKeys: Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: `Error checking environment: ${error}`
    }, { status: 500 });
  }
} 