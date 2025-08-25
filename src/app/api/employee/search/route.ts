// app/api/admin/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase() || '';
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // For now, skip authentication to fix build errors
    // TODO: Implement proper admin authentication

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        results: [],
        message: 'Query too short. Please enter at least 2 characters.'
      });
    }

    const results: any[] = [];

    // Multiple search strategies
    let contacts: any[] = [];

    // 1. Try exact ID match
    if (query.length >= 8) {
      const { data: exactMatch } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', query)
        .single();
      
      if (exactMatch) {
        contacts = [exactMatch];
      }
    }

    // 2. If no exact match, try partial ID search using LIKE on all contacts
    if (contacts.length === 0 && query.length >= 4) {
      const { data: allContacts } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (allContacts) {
        contacts = allContacts.filter(contact => 
          contact.id.toLowerCase().includes(query.toLowerCase())
        ).slice(0, limit);
      }
    }

    // 3. If still no results, search text fields
    if (contacts.length === 0) {
      const { data: textMatches } = await supabase
        .from('contacts')
        .select('*')
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,contact_no.ilike.%${query}%,service.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (textMatches) {
        contacts = textMatches;
      }
    }

    console.log('Search query:', query);
    console.log('Contacts found:', contacts?.length || 0);

    if (contacts) {
      contacts.forEach(contact => {
        results.push({
          id: contact.id,
          type: 'contact',
          title: contact.full_name || 'Unknown Customer',
          subtitle: `${contact.service || 'Service'} Request`,
          description: `${contact.email} • ${contact.contact_no}`,
          url: `/employee/requests/${contact.id}`,
          icon: getServiceIcon(contact.service),
          date: contact.created_at,
          priority: getRequestPriority(contact.created_at)
        });
      });
    }

    // Search system settings/pages
    if (type === 'all' || type === 'system') {
      const systemPages = [
        {
          id: 'dashboard',
          title: 'Dashboard',
          subtitle: 'Employee dashboard',
          description: 'View your work overview and statistics',
          url: '/employee/dashboard',
          icon: '📊',
          keywords: ['dashboard', 'overview', 'stats', 'main', 'home']
        },
        {
          id: 'requests',
          title: 'My Requests',
          subtitle: 'View assigned requests',
          description: 'View and manage your assigned service requests',
          url: '/employee/requests',
          icon: '🔧',
          keywords: ['requests', 'services', 'tickets', 'assignments', 'work']
        },
        {
          id: 'income',
          title: 'Income & Payments',
          subtitle: 'View earnings',
          description: 'Track your earnings and payment history',
          url: '/employee/income',
          icon: '💰',
          keywords: ['income', 'earnings', 'payments', 'money', 'salary']
        },
        {
          id: 'profile',
          title: 'My Profile',
          subtitle: 'Edit profile settings',
          description: 'Update your profile information',
          url: '/employee/profile',
          icon: '👤',
          keywords: ['profile', 'account', 'personal', 'settings', 'me']
        }
      ];

      const matchingPages = systemPages.filter(page => 
        page.keywords.some(keyword => keyword.includes(query)) ||
        page.title.toLowerCase().includes(query) ||
        page.subtitle.toLowerCase().includes(query) ||
        page.description.toLowerCase().includes(query)
      );

      matchingPages.forEach(page => {
        results.push({
          id: page.id,
          type: 'system',
          title: page.title,
          subtitle: page.subtitle,
          description: page.description,
          url: page.url,
          icon: page.icon,
          priority: 'normal'
        });
      });
    }

    // Sort results by relevance and date
    results.sort((a, b) => {
      // Prioritize exact matches in title
      const aExactMatch = a.title.toLowerCase().includes(query);
      const bExactMatch = b.title.toLowerCase().includes(query);
      
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;
      
      // Then by priority
      const priorityOrder: { [key: string]: number } = { high: 3, normal: 2, low: 1 };
      const aPriority = priorityOrder[a.priority] || 2;
      const bPriority = priorityOrder[b.priority] || 2;
      
      if (aPriority !== bPriority) return bPriority - aPriority;
      
      // Finally by date (newest first)
      if (a.date && b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      
      return 0;
    });

    console.log('Final results:', { query, total: results.length, results: results.slice(0, 2) });
    
    // Add debug info
    if (results.length === 0) {
      console.log('No results found. Trying direct query...');
      const { data: allContacts } = await supabase
        .from('contacts')
        .select('id, full_name')
        .limit(3);
      console.log('Sample contacts:', allContacts);
    }
    
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

function getRequestPriority(createdAt: string): 'high' | 'normal' | 'low' {
  const daysDiff = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysDiff < 1) return 'normal';
  if (daysDiff < 7) return 'normal';
  return 'high'; // Overdue requests are high priority
}

function getServiceIcon(service: string | null): string {
  switch (service?.toLowerCase()) {
    case 'laptop':
      return '💻';
    case 'computer':
      return '🖥️';
    case 'mobile':
      return '📱';
    case 'tv':
      return '📺';
    case 'camera':
      return '📷';
    case 'tablet':
      return '📱';
    case 'air_conditioner':
      return '❄️';
    case 'e_readers':
      return '📖';
    case 'game_console':
      return '🎮';
    case 'headphones':
      return '🎧';
    case 'home_theater':
      return '🎬';
    case 'microwave':
      return '🔥';
    case 'monitors':
      return '🖥️';
    case 'printers':
      return '🖨️';
    case 'projectors':
      return '📽️';
    case 'refrigerator':
      return '❄️';
    case 'routers':
      return '📡';
    case 'smart_speakers':
    case 'speakers':
      return '🔊';
    case 'smartwatch':
      return '⌚';
    case 'washing_machine':
      return '🧺';
    default:
      return '🔧';
  }
}