import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// POST /api/leads — Créer un nouveau lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contact, event, audience, intrigue, staging, means, chatAnswers, mode, score } = body;

    // Validation
    if (!contact?.firstname || !contact?.lastname || !contact?.email || !contact?.phone) {
      return NextResponse.json(
        { error: "Prénom, nom, email et téléphone sont obligatoires." },
        { status: 400 }
      );
    }

    // Générer la référence
    const year = new Date().getFullYear();
    const num = String(Math.floor(Math.random() * 9999)).padStart(4, "0");
    const ref = `MIP-${year}-${num}`;

    // Sauvegarder en base
    const { data: lead, error: dbError } = await supabase
      .from("leads")
      .insert({
        ref,
        mode: mode || "standard",
        score: score || 0,
        firstname: contact.firstname,
        lastname: contact.lastname,
        email: contact.email,
        phone: contact.phone,
        org: contact.org || null,
        slot: contact.slot || null,
        event_data: event || {},
        audience_data: audience || {},
        intrigue_data: intrigue || {},
        staging_data: staging || {},
        means_data: means || {},
        chat_answers: chatAnswers || {},
        ip_address: request.headers.get("x-forwarded-for") || "unknown",
        user_agent: request.headers.get("user-agent") || "unknown",
      })
      .select()
      .single();

    if (dbError) {
      console.error("Erreur Supabase:", dbError);
      return NextResponse.json({ error: "Erreur base de données." }, { status: 500 });
    }

    // Consentement RGPD
    await supabase.from("consents").insert({
      lead_id: lead.id,
      consent_type: "data_processing",
      ip_address: request.headers.get("x-forwarded-for") || "unknown",
    });

    // Log d'audit
    await supabase.from("audit_logs").insert({
      lead_id: lead.id,
      action: "lead_created",
      details: { mode, score, ref },
    });

    return NextResponse.json({ success: true, id: lead.id, ref });
  } catch (err) {
    console.error("Erreur POST /api/leads:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

// GET /api/leads — Lister les leads (pour le back-office)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const mode = searchParams.get("mode") || "all";
  const limit = parseInt(searchParams.get("limit") || "50");

  let query = supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (mode !== "all") {
    query = query.eq("mode", mode);
  }

  if (search) {
    query = query.or(
      `firstname.ilike.%${search}%,lastname.ilike.%${search}%,email.ilike.%${search}%,org.ilike.%${search}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Erreur récupération." }, { status: 500 });
  }

  return NextResponse.json({ leads: data });
}
