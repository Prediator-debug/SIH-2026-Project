import { NextResponse } from 'next/server';
import { fetchBackend } from '@/lib/api-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await fetchBackend('/api/analytics/category_distribution', {
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch category distribution' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
