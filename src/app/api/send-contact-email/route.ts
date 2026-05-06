import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { email, name, cargo, interviewDate, notes } = await req.json();
    const isInterview = !!interviewDate;

    if (!email) return NextResponse.json({ error: 'Email requerido' }, { status: 400 });

    const smtpHost = process.env.SMTP_HOST || 'smtp.office365.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER || 'uneteanuestroequipo@ec.marathon-sports.com';
    const smtpPass = process.env.SMTP_PASS || '';

    if (!smtpPass) {
      return NextResponse.json({ error: 'SMTP_PASS no configurado' }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false, // TLS
      auth: { user: smtpUser, pass: smtpPass },
      tls: { ciphers: 'SSLv3' },
    });

    const formattedDate = isInterview ? new Date(interviewDate.split(' ')[0] + 'T12:00:00').toLocaleDateString('es-EC', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '';
    const time = isInterview ? interviewDate.split(' ')[1] || '09:00' : '';

    const message = isInterview 
      ? `Estimad@ candidat@,\n\nNos complace informarte que has pasado la primera etapa de nuestro proceso de selección para Superdeporte S.A. Para la siguiente fase, deberás asistir a una entrevista presencial y/o virtual.\n\nTe enviamos los detalles para que puedas asistir:\n📅Fecha: ${formattedDate}\n⏰Hora: ${time}\n📍Lugar: Av Galo Plaza Lasso 13205 de los Ceresos.\n\nTe esperamos.`
      : `Hola ${name || 'Candidato'},\n\nTe saludamos de RRHH de Superdeporte S.A. Estamos revisando tu perfil para el cargo de ${cargo} y nos gustaría agendar una entrevista.\n\nPor favor, confírmanos tu disponibilidad.\n\nSaludos cordiales,\nEquipo de Selección.`;

    const htmlMessage = isInterview 
      ? `<div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: #0f172a; padding: 24px; text-align: center;">
            <h2 style="color: white; margin: 0; font-size: 20px;">Proceso de Selección</h2>
            <p style="color: #94a3b8; margin: 8px 0 0; font-size: 14px;">Superdeporte S.A.</p>
          </div>
          <div style="padding: 32px; background: white;">
            <p>Estimad@ candidat@,</p>
            <p>Nos complace informarte que <strong>has pasado la primera etapa</strong> de nuestro proceso de selección. Para la siguiente fase, deberás asistir a una entrevista presencial y/o virtual.</p>
            
            <div style="background: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 24px 0;">
              <p style="margin: 0 0 12px; font-size: 15px;">📅 <strong>Fecha:</strong> ${formattedDate}</p>
              <p style="margin: 0 0 12px; font-size: 15px;">⏰ <strong>Hora:</strong> ${time}</p>
              <p style="margin: 0; font-size: 15px;">📍 <strong>Lugar:</strong> Av Galo Plaza Lasso 13205 de los Ceresos.</p>
            </div>
            
            <p>Por favor, confirma tu asistencia respondiendo a este correo. Te esperamos puntualmente.</p>
            <br/>
            <p style="margin-bottom: 4px;">Saludos cordiales,</p>
            <p><strong>Equipo de Selección Talentos</strong><br/>Superdeporte S.A.</p>
          </div>
        </div>`
      : `<div style="font-family: sans-serif; line-height: 1.6; color: #333;">
          <p>Hola <strong>${name || 'Candidato'}</strong>,</p>
          <p>Te saludamos de RRHH de <strong>SUPERDEPORTE S.A.</strong></p>
          <p>Estamos revisando tu perfil para el cargo de <strong>${cargo}</strong> y nos gustaría agendar una entrevista.</p>
          <p>Por favor, confírmanos tu disponibilidad respondiendo a este correo.</p>
          <br/>
          <p>Saludos cordiales,<br/><strong>Equipo de Selección</strong></p>
        </div>`;

    await transporter.sendMail({
      from: `"RRHH Selección" <${smtpUser}>`,
      to: email,
      subject: isInterview ? `Citación a Entrevista: ${cargo}` : `Proceso de Selección: ${cargo}`,
      text: message,
      html: htmlMessage
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error enviando mail de contacto:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
