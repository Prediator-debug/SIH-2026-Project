import { NextResponse } from 'next/server';
import { fetchBackend } from '@/lib/api-client';

const FALLBACK_INSPECTIONS = [
  {
    id: "INS-2026-001",
    productId: "CMD-001",
    product_name: "Parle-G Original Gluco Biscuits 800g",
    manufacturer: "Parle Products Pvt. Ltd., Vile Parle East, Mumbai, MH - 400057",
    officerId: "officer@lmd.gov.in",
    date: "2026-09-08T11:20:00Z",
    status: "Compliant",
    compliance_score: 96.5,
    declarations: {
      Manufacturer: { value: "Parle Products Pvt. Ltd., Mumbai", confidence: 0.96 },
      Net_Quantity: { value: "800g", confidence: 0.98 },
      MRP: { value: "₹85.00", confidence: 0.99 },
      MRP_Tax_Text: { value: "incl. of all taxes", confidence: 0.94 },
      Date_of_Mfg_or_Expiry: { value: "08/2026", confidence: 0.95 },
      Consumer_Care: { value: "1800-22-2211, customercare@parle.biz", confidence: 0.92 },
      Country_of_Origin: { value: "India", confidence: 0.99 }
    }
  },
  {
    id: "INS-2026-002",
    productId: "CMD-004",
    product_name: "Aashirvaad Superior MP Shuddh Chakki Atta 5kg",
    manufacturer: "ITC Limited, 37 J.L. Nehru Road, Kolkata - 700071",
    officerId: "officer@lmd.gov.in",
    date: "2026-09-09T15:45:00Z",
    status: "Potentially Non-Compliant",
    compliance_score: 68.0,
    declarations: {
      Manufacturer: { value: "ITC Limited, Kolkata", confidence: 0.95 },
      Net_Quantity: { value: "5kg", confidence: 0.97 },
      MRP: { value: "₹245.00", confidence: 0.98 },
      Date_of_Mfg_or_Expiry: { value: "07/2026", confidence: 0.91 },
      Consumer_Care: { value: "1800-425-4444", confidence: 0.89 },
      Country_of_Origin: { value: "India", confidence: 0.95 }
    }
  }
];

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const endpoint = `/api/inspections/history${queryString ? `?${queryString}` : ''}`;

    const res = await fetchBackend(endpoint, {
      cache: 'no-store',
      timeoutMs: 4000,
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch history from backend' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
