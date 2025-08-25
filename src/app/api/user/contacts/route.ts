import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { notifyAllParties } from "@/lib/notifyAllParties";

export async function POST(req: Request) {
  const { full_name, contact_no, email, address, service, brand_name, model_name, description } = await req.json();

  // Validate required fields
  if (!full_name || !contact_no || !email || !service || !brand_name || !model_name) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Validate service type
  const validServices = [
    'laptop', 'computer', 'mobile', 'tv', 'camera', 'tablet',
    'smartwatch', 'game_console', 'e_readers', 'headphones',
    'microwave', 'refrigerator', 'washing_machine', 'air_conditioner',
    'smart_speakers', 'printers', 'projectors', 'routers',
    'monitors', 'home_theater', 'speakers'
  ];
  if (!validServices.includes(service)) {
    return NextResponse.json({ error: "Invalid service type" }, { status: 400 });
  }

  try {
    // Insert contact into database
    const { data: contactData, error } = await supabase.from("contacts").insert({
      full_name,
      contact_no,
      email,
      address,
      service,
      brand_name,
      model_name,
      description,
    }).select().single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: "Failed to submit contact form" }, { status: 500 });
    }

    // Notify all parties about new request
    try {
      await notifyAllParties({
        requestId: contactData.id,
        type: 'new_request',
        userTitle: 'Request Created',
        userMessage: `Your ${service} repair request has been submitted successfully`,
        adminTitle: 'New Service Request',
        adminMessage: `${full_name} submitted a new ${service} repair request`,
        priority: 'high'
      });
    } catch (notifError) {
      console.error('Failed to send notification:', notifError);
    }

    return NextResponse.json({ message: "Contact form submitted successfully!" });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}