import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const appId = process.env.NEXT_PUBLIC_ZEGOCLOUD_APP_ID;
    const serverSecret = process.env.NEXT_PUBLIC_ZEGOCLOUD_SERVER_SECRET;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    
    // Check if credentials exist
    const hasAppId = !!appId;
    const hasServerSecret = !!serverSecret;
    const hasAppUrl = !!appUrl;
    
    // Get the numeric value of the app ID
    const numericAppId = Number(appId);
    const isValidAppId = !isNaN(numericAppId) && numericAppId > 0;
    
    return NextResponse.json({
      success: true,
      config: {
        hasAppId,
        hasServerSecret,
        hasAppUrl,
        isValidAppId,
        appId: hasAppId ? appId : null,
        appUrl: hasAppUrl ? appUrl : null,
        // Only show first few characters of secret for security
        serverSecret: hasServerSecret ? `${serverSecret.substring(0, 4)}...` : null,
      }
    });
  } catch (error) {
    console.error('Error testing Zego credentials:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to access environment variables'
    }, { status: 500 });
  }
} 