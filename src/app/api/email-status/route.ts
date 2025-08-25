import { NextRequest, NextResponse } from 'next/server';
import { retryFailedEmails, getEmailDeliveryStats } from '@/lib/emailRetry';

export async function GET() {
  try {
    const stats = await getEmailDeliveryStats();
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error('Error getting email status:', error);
    return NextResponse.json({ error: 'Failed to get email status' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    if (action === 'retry') {
      await retryFailedEmails();
      const stats = await getEmailDeliveryStats();
      return NextResponse.json({ 
        success: true, 
        message: 'Retry process completed',
        stats 
      });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error processing email action:', error);
    return NextResponse.json({ error: 'Failed to process action' }, { status: 500 });
  }
}