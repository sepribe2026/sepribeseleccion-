import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET: cargar trackings
// - Con ?cargo=X : todos los de ese cargo (para el ranking tab)
// - Sin parámetro : todos los no-PENDIENTE enriquecidos con datos del candidato (para el pipeline global)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cargo = searchParams.get('cargo');

  // --- Modo 1: filtrado por cargo (comportamiento original) ---
  if (cargo) {
    const { data, error } = await supabase
      .from('candidate_tracking')
      .select('*')
      .eq('cargo', cargo);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  // --- Modo 2: pipeline global - todos excepto PENDIENTE ---
  const { data: tracking, error: trackError } = await supabase
    .from('candidate_tracking')
    .select('*')
    .order('updated_at', { ascending: false });

  if (trackError) return NextResponse.json({ error: trackError.message }, { status: 500 });
  if (!tracking || tracking.length === 0) return NextResponse.json({ data: [] });

  // Obtener IDs únicos de resumes
  const resumeIds = [...new Set(tracking.map((t: any) => t.resume_id))];

  const { data: resumes, error: resumeError } = await supabase
    .from('email_resumes')
    .select('id, sender_name, sender_email, sender_phone, city, position, pdf_url')
    .in('id', resumeIds);

  if (resumeError) return NextResponse.json({ error: resumeError.message }, { status: 500 });

  const resumeMap: Record<string, any> = {};
  (resumes || []).forEach((r: any) => { resumeMap[r.id] = r; });

  const enriched = tracking.map((t: any) => ({
    ...t,
    candidate: resumeMap[t.resume_id] || null,
  }));

  return NextResponse.json({ data: enriched });
}

// POST: crear o actualizar el estado de seguimiento de un candidato
export async function POST(req: NextRequest) {
  try {
    const { resume_id, cargo, status, interview_date, notes } = await req.json();

    if (!resume_id || !cargo || !status) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('candidate_tracking')
      .upsert(
        { resume_id, cargo, status, interview_date: interview_date || null, notes: notes || null, updated_at: new Date().toISOString() },
        { onConflict: 'resume_id,cargo' }
      )
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
