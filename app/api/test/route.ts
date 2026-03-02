import { NextResponse } from 'next/server';

/**
 * Test endpoint to diagnose Gemini API issues
 */
export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY not set in environment' },
      { status: 500 }
    );
  }

  // Test 1: Check if API key has correct format
  const isValidFormat = apiKey.startsWith('AIza');
  console.log('[Test 1] API Key Format:', { isValidFormat, keyStart: apiKey.substring(0, 10) });

  // Test 2: Try listing models
  try {
    const listResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const listData = await listResponse.json();

    console.log('[Test 2] List Models Response:', {
      status: listResponse.status,
      modelCount: listData.models?.length || 0,
      models: listData.models?.map((m: any) => m.name).slice(0, 5),
    });

    if (listResponse.status === 200 && listData.models) {
      // Test 3: Try gemini-pro model directly
      const testPrompt = 'Hello, are you working?';
      const genResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: testPrompt }],
              },
            ],
          }),
        }
      );

      const genData = await genResponse.json();
      console.log('[Test 3] Generate Content Response:', {
        status: genResponse.status,
        hasContent: !!genData.candidates,
        error: genData.error?.message,
      });

      return NextResponse.json({
        test1: { pass: isValidFormat, message: 'API key format valid' },
        test2: {
          pass: listResponse.status === 200,
          status: listResponse.status,
          modelCount: listData.models?.length || 0,
          models: listData.models?.map((m: any) => ({
            name: m.name,
            displayName: m.displayName,
          })),
        },
        test3: {
          pass: genResponse.status === 200,
          status: genResponse.status,
          hasContent: !!genData.candidates,
          error: genData.error?.message,
        },
      });
    } else {
      return NextResponse.json({
        test1: { pass: isValidFormat, message: 'API key format valid' },
        test2: {
          pass: false,
          status: listResponse.status,
          error: listData.error?.message || 'Failed to list models',
        },
      });
    }
  } catch (error) {
    console.error('[Test] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
