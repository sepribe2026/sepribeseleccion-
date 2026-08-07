import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { email, name, cargo, interviewDate, notes } = await req.json();
    const isInterview = !!interviewDate;

    if (!email) return NextResponse.json({ error: 'Email requerido' }, { status: 400 });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'sepribe2026@gmail.com',
        pass: 'egennqljsajttxiy'
      }
    });

    const formattedDate = isInterview ? new Date(interviewDate.split(' ')[0] + 'T12:00:00').toLocaleDateString('es-EC', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '____________________';
    const time = isInterview ? (interviewDate.split(' ')[1] || '09:00') : '____________________';

    const htmlMessage = `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: #111111; padding: 24px; text-align: center;">
          <h2 style="color: white; margin: 0; font-size: 20px;">Proceso de Selección</h2>
          <p style="color: #94a3b8; margin: 8px 0 0; font-size: 14px;">SEPRIBE CIA.LTDA.</p>
        </div>
        <div style="padding: 32px; background: white;">
          <p>¡Hola <strong>${name || 'candidat@'}</strong>! 😊</p>
          <p>Gracias por tu interés en formar parte de SEPRIBE Cía. Ltda. Nos complace informarte que tu perfil ha sido preseleccionado y queremos invitarte a una entrevista presencial.</p>
          
          <div style="background: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 24px 0;">
            <p style="margin: 0 0 12px; font-size: 15px;">📅 <strong>Fecha:</strong> ${formattedDate}</p>
            <p style="margin: 0 0 12px; font-size: 15px;">🕒 <strong>Hora:</strong> ${time}</p>
            <p style="margin: 0; font-size: 15px;">📍 <strong>Dirección:</strong><br/>SEPRIBE Cía. Ltda.<br/>Félix Saura N46-114 y Marcos Jofre.</p>
          </div>
          
          <p>Al llegar, por favor acércate al área de Monitoreo, donde te indicarán cómo continuar con el proceso.</p>
          <p>Si por algún motivo no puedes asistir o tienes alguna duda, comunícate con nosotros al <strong>099 702 6597</strong>.</p>
          
          <p>¡Esperamos conocerte pronto y te deseamos mucho éxito en esta etapa del proceso de selección!</p>
        </div>
        <div style="background: #f8fafc; padding: 16px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 12px; color: #94a3b8;">Este correo fue enviado por el equipo de Talento Humano de SEPRIBE CIA.LTDA.</p>
        </div>
      </div>`;

    const mailOptions = {
      from: 'Talento Humano SEPRIBE <sepribe2026@gmail.com>',
      to: email,
      subject: `Citación a Entrevista: ${cargo || 'Candidato'}`,
      html: htmlMessage
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error enviando mail con Nodemailer:', error);
    return NextResponse.json({ 
      error: `Error Nodemailer: ${error.message}`
    }, { status: 500 });
  }
}
