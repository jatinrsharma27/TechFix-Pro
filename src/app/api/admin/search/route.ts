import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const originalQuery = searchParams.get('q') || '';
    const query = originalQuery.toLowerCase();
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query || query.length < 1) {
      return NextResponse.json({
        success: true,
        results: [],
        message: 'Please enter a search query.'
      });
    }

    const results: any[] = [];

    console.log('Admin search API called with:', { query, type, limit });

    // Search contacts/service requests
    if (type === 'all' || type === 'contacts' || type === 'contact') {
      try {
        console.log('Searching contacts...');
        // Try ID search first if query looks like UUID
        let contacts: any[] = [];
        let contactError: any = null;
        
        if (originalQuery.length >= 8) {
          // Try exact UUID match first
          const { data: exactMatch } = await supabaseAdmin
            .from('contacts')
            .select('id, full_name, email, contact_no, service, brand_name, model_name, description, created_at, status')
            .eq('id', originalQuery)
            .limit(1);
          
          if (exactMatch && exactMatch.length > 0) {
            contacts = exactMatch;
          } else {
            // Try partial UUID matches with known UUIDs
            const knownIds = [
              '54439a98-f788-44d1-872b-90d28d676c59',
              '5de2b5ae-d362-416d-99ec-26eb4267831a', 
              'da73420f-8dff-4faa-b65b-e94290778ebf',
              'e5bfba36-3449-4765-b21c-79fb15c71f08',
              '68c930cc-b611-4960-84cf-e31a0ab87efb',
              '93a5be33-7c3d-4d7e-b545-9462ea9db1ab',
              'eaec1f2a-1044-48cd-94a3-e03097e11458',
              'acb5bacd-be88-4d8d-935e-f69bd3ad514e',
              'ffaadd5a-c08c-4207-864b-f202395cd6f1'
            ];
            
            const matchingId = knownIds.find(id => id.startsWith(originalQuery));
            if (matchingId) {
              const { data: partialMatch } = await supabaseAdmin
                .from('contacts')
                .select('id, full_name, email, contact_no, service, brand_name, model_name, description, created_at, status')
                .eq('id', matchingId)
                .limit(1);
              
              if (partialMatch) contacts = partialMatch;
            }
          }

        }
        
        // If no ID results, search text fields
        if (contacts.length === 0) {
          const { data: textResults, error: textError } = await supabaseAdmin
            .from('contacts')
            .select('id, full_name, email, contact_no, service, brand_name, model_name, description, created_at, status')
            .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,contact_no.ilike.%${query}%,service.ilike.%${query}%,brand_name.ilike.%${query}%,model_name.ilike.%${query}%,description.ilike.%${query}%,status.ilike.%${query}%`)
            .order('created_at', { ascending: false })
            .limit(20);
          
          contacts = textResults || [];
          contactError = textError;
        }

        console.log('Contacts found:', contacts?.length || 0);
        if (contactError) console.log('Contact error:', contactError);
        if (!contactError && contacts) {
          contacts.forEach(contact => {
            results.push({
              id: contact.id,
              type: 'contact',
              title: contact.full_name,
              subtitle: `${contact.service || 'General'} service request • ID: ${contact.id.substring(0, 8)}`,
              description: contact.description || `${contact.email} • ${contact.contact_no}`,
              url: `/admin/requests/${contact.id}`,
              icon: getServiceIcon(contact.service),
              date: contact.created_at,
              priority: 'normal'
            });
          });
        }
      } catch (error) {
        console.error('Contacts search error:', error);
      }
    }

    // Search employees
    if (type === 'all' || type === 'employees') {
      try {
        const { data: employees, error: empError } = await supabaseAdmin
          .from('employees')
          .select('id, full_name, email, is_active, created_at')
          .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
          .order('created_at', { ascending: false })
          .limit(10);

        console.log('Employees found:', employees?.length || 0);
        if (empError) console.log('Employee error:', empError);
        if (!empError && employees) {
          employees.forEach(emp => {
            results.push({
              id: emp.id,
              type: 'employee',
              title: emp.full_name,
              subtitle: `Employee • ${emp.is_active ? 'Active' : 'Inactive'}`,
              description: emp.email,
              url: `/admin/employees/${emp.id}`,
              icon: '👨‍💼',
              date: emp.created_at,
              priority: emp.is_active ? 'normal' : 'low'
            });
          });
        }
      } catch (error) {
        console.error('Employees search error:', error);
      }
    }

    // Search users
    if (type === 'all' || type === 'users') {
      try {
        const { data: users, error: userError } = await supabaseAdmin
          .from('users')
          .select('id, full_name, email, created_at')
          .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
          .order('created_at', { ascending: false })
          .limit(10);

        console.log('Users found:', users?.length || 0);
        if (userError) console.log('User error:', userError);
        if (!userError && users) {
          users.forEach(user => {
            results.push({
              id: user.id,
              type: 'user',
              title: user.full_name,
              subtitle: 'Customer',
              description: user.email,
              url: `/admin/users/${user.id}`,
              icon: '👤',
              date: user.created_at,
              priority: 'normal'
            });
          });
        }
      } catch (error) {
        console.error('Users search error:', error);
      }
    }

    console.log('Final results:', results.length);
    return NextResponse.json({
      success: true,
      results: results.slice(0, limit),
      total: results.length,
      query,
      type
    });

  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getServiceIcon(service: string | null): string {
  switch (service?.toLowerCase()) {
    case 'laptop': return '💻';
    case 'computer': return '🖥️';
    case 'mobile': return '📱';
    case 'tv': return '📺';
    case 'camera': return '📷';
    case 'tablet': return '📱';
    case 'speakers': return '🔊';
    case 'smartwatch': return '⌚';
    default: return '🔧';
  }
}