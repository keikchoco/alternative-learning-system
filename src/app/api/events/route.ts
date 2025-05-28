import { NextResponse } from 'next/server';
import eventsData from '@/data/events.json';

export async function GET() {
  try {
    return NextResponse.json(eventsData);
  } catch (error) {
    console.error('Error loading events:', error);
    return NextResponse.json(
      { error: 'Failed to load events' },
      { status: 500 }
    );
  }
}
