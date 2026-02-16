import { NextRequest, NextResponse } from 'next/server';
import { appendUser } from '@/lib/csvHandler';
import { UserData } from '@/types';

/**
 * POST /api/saveUser
 * Saves user registration data to CSV
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, carNumber } = body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== 'string' || !/^\d+$/.test(phone)) {
      return NextResponse.json(
        { error: 'Phone must be a valid number' },
        { status: 400 }
      );
    }

    const carNum = parseInt(carNumber, 10);
    if (isNaN(carNum) || carNum < 1 || carNum > 99) {
      return NextResponse.json(
        { error: 'Car number must be between 1 and 99' },
        { status: 400 }
      );
    }

    // Prepare user data
    const userData: UserData = {
      name: name.trim(),
      phone: phone.trim(),
      carNumber: carNum,
      timestamp: new Date().toISOString(),
    };

    // Save to CSV
    await appendUser(userData);

    return NextResponse.json(
      { success: true, message: 'User registered successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving user:', error);
    return NextResponse.json(
      { error: 'Failed to save user data' },
      { status: 500 }
    );
  }
}

/**
 * Handle OPTIONS for CORS (if needed)
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
