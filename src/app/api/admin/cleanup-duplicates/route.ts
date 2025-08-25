import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find and remove duplicate contacts based on email and contact_no
    const { data: duplicates, error: findError } = await supabaseAdmin
      .from('contacts')
      .select('id, email, contact_no, created_at')
      .order('created_at', { ascending: true });

    if (findError) {
      throw findError;
    }

    const seen = new Map();
    const duplicateIds: string[] = [];

    duplicates?.forEach(contact => {
      const key = `${contact.email}-${contact.contact_no}`;
      if (seen.has(key)) {
        // Keep the first one, mark others as duplicates
        duplicateIds.push(contact.id);
      } else {
        seen.set(key, contact.id);
      }
    });

    if (duplicateIds.length > 0) {
      const { error: deleteError } = await supabaseAdmin
        .from('contacts')
        .delete()
        .in('id', duplicateIds);

      if (deleteError) {
        throw deleteError;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Removed ${duplicateIds.length} duplicate contacts`,
      duplicatesRemoved: duplicateIds.length
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ 
      error: 'Failed to cleanup duplicates',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}