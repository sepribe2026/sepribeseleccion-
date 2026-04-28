import { NextRequest, NextResponse } from 'next/server';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import { supabase } from '@/lib/supabase';

// Helper for parsing raw email source
const parseEmail = async (source: Buffer) => {
  return await simpleParser(source);
};

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json(); // Se puede pasar del lado del cliente por seguridad, pero usaremos el que dijiste
    
    // Conexión IMAP
    const client = new ImapFlow({
      host: 'outlook.office365.com',
      port: 993,
      secure: true,
      auth: {
        user: 'uneteanuestroequipo@ec.marathon-sports.com',
        pass: password || 'Toq91332'
      },
      logger: console // Activar logger para ver el error exacto en la terminal
    });

    await client.connect();

    // Seleccionamos la bandeja de entrada
    const lock = await client.getMailboxLock('INBOX');
    let processedCount = 0;
    const resumes = [];

    try {
      if (client.mailbox.exists === 0) {
        return NextResponse.json({ success: true, message: 'La bandeja de entrada está vacía.', data: [] });
      }

      // Traemos solo los últimos 10 correos usando sequence numbers negativos o simplemente limitamos el iterador
      // '1:*' trae todos, puede fallar si hay decenas de miles. Usaremos un rango seguro, ej: los últimos 50.
      const total = client.mailbox.exists;
      const start = Math.max(1, total - 50); // Últimos 50 mensajes
      
      for await (let msg of client.fetch(`${start}:*`, { source: true, uid: true })) {
        if (processedCount >= 10) break; // Procesar máximo 10 en esta prueba

        // Revisar si este UID ya está en Supabase
        const { data: existing } = await supabase
          .from('email_resumes')
          .select('email_uid')
          .eq('email_uid', msg.uid.toString())
          .maybeSingle();

        if (existing) continue; // Ya fue procesado

        // Parsear el correo
        const parsed = await parseEmail(msg.source);
        
        // Buscar si tiene adjuntos PDF o Word
        const attachments = parsed.attachments.filter(att => 
          att.contentType === 'application/pdf' || 
          att.contentType.includes('wordprocessingml') ||
          att.contentType.includes('msword')
        );

        if (attachments.length > 0) {
          const file = attachments[0]; 
          
          // Subir a Supabase Storage
          const fileName = `resume_${msg.uid}_${file.filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          const { error: uploadError } = await supabase.storage
            .from('candidate-documents') 
            .upload(fileName, file.content, { upsert: true, contentType: file.contentType });

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('candidate-documents')
              .getPublicUrl(fileName);

            const payload = {
              email_uid: msg.uid.toString(),
              sender_email: parsed.from?.value[0]?.address || 'Desconocido',
              sender_name: parsed.from?.value[0]?.name || '',
              subject: parsed.subject || 'Sin Asunto',
              received_date: parsed.date || new Date(),
              file_name: file.filename,
              pdf_url: publicUrl,
              classification_status: 'PENDING'
            };

            const { error: dbError } = await supabase.from('email_resumes').insert([payload]);

            if (!dbError) {
              resumes.push(payload);
              processedCount++;
            } else {
              console.error('Error guardando en Supabase:', dbError);
            }
          } else {
            console.error('Error subiendo PDF:', uploadError);
          }
        }
      }
    } finally {
      lock.release();
    }

    await client.logout();

    return NextResponse.json({ 
      success: true, 
      message: `Se procesaron ${processedCount} nuevos correos con hojas de vida.`,
      data: resumes
    });

  } catch (error: any) {
    console.error('Error IMAP detallado:', error);
    
    // Detectar bloqueo de Microsoft 365
    let friendlyError = error.message;
    if (friendlyError.includes('Command failed') || friendlyError.includes('AUTHENTICATE failed')) {
      friendlyError = 'Microsoft Office 365 bloqueó la conexión. La cuenta requiere una "Contraseña de Aplicación" (App Password) porque Microsoft ya no permite leer correos usando contraseñas normales por motivos de seguridad.';
    }

    return NextResponse.json(
      { 
        error: 'Error conectando al correo', 
        details: friendlyError,
        serverResponse: error.responseStatus || error.response || ''
      },
      { status: 500 }
    );
  }
}
