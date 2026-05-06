import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import OpenAI from 'openai';
import { PdfReader } from 'pdfreader';

export async function POST(req: NextRequest) {
  try {
    const { id, apiKey } = await req.json();
    if (!id) return NextResponse.json({ error: 'Falta ID' }, { status: 400 });

    const openaiKey = (apiKey || process.env.OPENAI_API_KEY || '').trim();
    const openai = new OpenAI({ apiKey: openaiKey });

    const { data: resume } = await supabase.from('email_resumes').select('*').eq('id', id).single();
    if (!resume) throw new Error('Candidato no encontrado');

    let storageFileName = resume.file_name;
    if (resume.pdf_url) {
      const parts = resume.pdf_url.split('candidate-documents/');
      if (parts.length > 1) storageFileName = decodeURIComponent(parts[1].split('?')[0]);
    }

    const { data: fileData, error: downloadError } = await supabase.storage.from('candidate-documents').download(storageFileName);
    if (downloadError || !fileData) throw new Error('Error al descargar PDF');

    const buffer = Buffer.from(await fileData.arrayBuffer());
    
    // EXTRACCIÓN DE TEXTO CON PDFREADER
    const pdfText = await new Promise<string>((resolve, reject) => {
      let textChunks: string[] = [];
      const reader = new PdfReader();
      reader.parseBuffer(buffer, (err, item) => {
        if (err) {
          console.error('PdfReader Error:', err);
          reject(err);
        } else if (!item) {
          // Fin del archivo
          resolve(textChunks.join(' '));
        } else if (item.text) {
          textChunks.push(item.text);
        }
      });
    });

    console.log('Texto extraído (longitud):', pdfText.length);
    if (!pdfText || pdfText.trim().length < 10) {
       throw new Error('El PDF parece estar vacío o es una imagen escaneada que no contiene texto extraíble.');
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Eres un experto en RRHH. Extrae los datos en JSON." },
        { 
          role: "user", 
          content: `Analiza este CV:\n${pdfText}\n\nJSON: { "city": "...", "position": "...", "summary": "...", "experience_years": "...", "education_level": "...", "skills": "...", "languages": "...", "phone": "...", "main_achievement": "...", "key_tools": "..." }`
        }
      ],
      response_format: { type: "json_object" }
    });

    const aiData = JSON.parse(response.choices[0].message.content || '{}');
    await supabase.from('email_resumes').update({
      city: aiData.city || '',
      position: aiData.position || '',
      ai_summary: aiData.summary || '',
      experience_years: aiData.experience_years || '',
      education_level: aiData.education_level || '',
      skills: aiData.skills || '',
      languages: aiData.languages || '',
      sender_phone: aiData.phone || '',
      main_achievement: aiData.main_achievement || '',
      key_tools: aiData.key_tools || '',
      classification_status: 'REVIEWED',
    }).eq('id', id);

    return NextResponse.json({ success: true, data: aiData });
  } catch (error: any) {
    console.error('Error IA:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
