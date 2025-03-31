import Vapi from '@vapi-ai/web'

if (!process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN) {
  console.error('[VAPI] Missing VAPI web token. Please check your environment variables.');
}

export const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN || 'missing-token');

// Add error handling for connection issues
vapi.on('error', (error) => {
  console.error('[VAPI] Connection error:', error);
});

// Add connection state logging
vapi.on('call-start', () => {
  console.log('[VAPI] Call started successfully');
});

vapi.on('call-end', () => {
  console.log('[VAPI] Call ended');
});