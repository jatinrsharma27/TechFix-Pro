import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Return mock contacts data when Supabase is not available
    const mockContacts = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        device_type: 'Laptop',
        device_model: 'MacBook Pro',
        issue_description: 'Screen flickering',
        status: 'pending',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '098-765-4321',
        device_type: 'Phone',
        device_model: 'iPhone 13',
        issue_description: 'Battery not charging',
        status: 'in_progress',
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ];

    return NextResponse.json(mockContacts);

  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json([]);
  }
}