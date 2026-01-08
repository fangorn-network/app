import { NextResponse } from 'next/server';

export async function GET() {
  const jwt = process.env.PINATA_JWT;
  // TODO: Delete this. We DO NOT want to pass our JWT over the wire.
  if (!jwt) {
    return NextResponse.json(
      { error: 'PINATA_JWT not configured' },
      { status: 500 }
    );
  }

  return NextResponse.json({ jwt });
}