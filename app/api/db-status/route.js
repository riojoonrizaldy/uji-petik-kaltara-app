import { NextResponse } from 'next/server';
import { getDbStatus } from '@/lib/db';

export async function GET() {
  try {
    const status = await getDbStatus();
    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json({
      connected: false,
      type: 'unknown',
      message: error.message,
    });
  }
}
