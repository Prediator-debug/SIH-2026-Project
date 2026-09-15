import { NextResponse } from 'next/server';
import { fetchBackend } from '@/lib/api-client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const res = await fetchBackend('/api/ecommerce/scrape-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
