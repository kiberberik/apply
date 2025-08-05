import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!process.env.NEXT_PUBLIC_PLATONUS_API_URL || !process.env.PLATONUS_API_KEY) {
      return NextResponse.json({ error: 'Platonus API configuration is missing' }, { status: 500 });
    }

    const platonusResponse = await fetch(
      `${process.env.NEXT_PUBLIC_PLATONUS_API_URL}/rest/ApplicantIntake/save`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.PLATONUS_API_KEY}`,
        },
        body: JSON.stringify(body),
      },
    );

    if (!platonusResponse.ok) {
      const errorText = await platonusResponse.text();
      console.error('Platonus API error:', {
        status: platonusResponse.status,
        statusText: platonusResponse.statusText,
        response: errorText,
      });
      return NextResponse.json(
        {
          error: 'Platonus API error',
          status: platonusResponse.status,
          details: errorText,
        },
        { status: platonusResponse.status },
      );
    }

    const data = await platonusResponse.json();
    return NextResponse.json(data, { status: platonusResponse.status });
  } catch (error) {
    console.error('Error in platonus save route:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
