import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET: cargar todos los trackings de un cargo específico
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cargo = searchParams.get('cargo');

  if (!cargo) {
    return NextResponse.json({ error: 'Se requiere el parámetro cargo' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('candidate_tracking')
    .select('*')
    .eq('cargo', cargo);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
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
