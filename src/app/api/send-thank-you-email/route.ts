import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { email, name, cargo } = await req.json();

    if (!email) return NextResponse.json({ error: 'Email requerido' }, { status: 400 });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'sepribe2026@gmail.com',
        pass: 'egennqljsajttxiy'
      }
    });

    const htmlMessage = `
      <div style="font-family: sans-serif; line-height: 1.7; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        
        <div style="background: #111111; padding: 24px; text-align: center;">
          <h2 style="color: white; margin: 0; font-size: 20px;">Proceso de Selección</h2>
          <p style="color: #94a3b8; margin: 8px 0 0; font-size: 14px;">SEPRIBE CIA.LTDA.</p>
        </div>

        <div style="padding: 32px; background: white;">
          <p>¡Hola <strong>${name || 'Candidato/a'}</strong>! 😊</p>
          
          <p>Queremos agradecerte sinceramente por el tiempo que nos brindaste y por el interés demostrado en formar parte de SEPRIBE Cía. Ltda.</p>

          <p>Después de revisar cuidadosamente tu perfil y el proceso de selección, en esta ocasión hemos decidido continuar con otros candidatos cuyo perfil se ajusta de mejor manera a los requerimientos de la vacante de <strong>${cargo}</strong>.</p>

          <div style="background: #f8fafc; border-left: 4px solid #fbbf24; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 24px 0;">
            <p style="margin: 0; color: #475569; font-size: 14px;">
              Agradecemos tu participación y te deseamos muchos éxitos en tus proyectos profesionales. Conservaremos tu información en nuestra base de datos para futuras oportunidades que puedan ajustarse a tu experiencia y perfil.
            </p>
          </div>

          <p>Te deseamos el mayor de los éxitos en tu desarrollo profesional y esperamos que en el futuro podamos coincidir en una nueva oportunidad laboral.</p>

          <br/>
          <p style="margin-bottom: 4px;">Saludos cordiales,</p>
          <p><strong>Talento Humano</strong><br/>SEPRIBE CIA.LTDA.</p>
        </div>

        <div style="background: #f8fafc; padding: 16px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 12px; color: #94a3b8;">Este correo fue enviado por el equipo de Talento Humano de SEPRIBE CIA.LTDA.</p>
        </div>
      </div>`;

    const mailOptions = {
      from: 'Talento Humano SEPRIBE <sepribe2026@gmail.com>',
      to: email,
      subject: `Agradecimiento por tu postulación: ${cargo || 'Candidato'}`,
      html: htmlMessage
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error enviando mail de agradecimiento:', error);
    return NextResponse.json({
      error: `Error Nodemailer: ${error.message}`
    }, { status: 500 });
  }
}
