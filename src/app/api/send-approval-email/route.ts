import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import QRCode from 'qrcode';

export async function POST(req: NextRequest) {
  try {
    const { candidateName, candidateEmail } = await req.json();

    if (!candidateEmail) {
      return NextResponse.json({ error: 'Se requiere el email del candidato.' }, { status: 400 });
    }

    const smtpHost = process.env.SMTP_HOST || 'smtp.office365.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER || 'uneteanuestroequipo@ec.marathon-sports.com';
    const smtpPass = process.env.SMTP_PASS || '';
    const onboardingUrl = process.env.ONBOARDING_URL || 'http://localhost:3000/onboarding';

    if (!smtpPass) {
      return NextResponse.json({ error: 'SMTP_PASS no está configurado en las variables de entorno.' }, { status: 500 });
    }

    // 1. Generar QR como buffer PNG
    const qrBuffer = await QRCode.toBuffer(onboardingUrl, {
      type: 'png',
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    });

    // 2. Configurar transporter nodemailer
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false, // TLS
      auth: { user: smtpUser, pass: smtpPass },
      tls: { ciphers: 'SSLv3' },
    });

    // 3. Cuerpo HTML del correo
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #1a1a1a;">
        <div style="background: #1a1a2e; padding: 32px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 1px;">SUPERDEPORTE S.A.</h1>
          <p style="color: #aab4be; margin: 8px 0 0; font-size: 13px;">SOLICITUD DE DOCUMENTOS</p>
        </div>

        <div style="padding: 32px 40px; background: #ffffff;">
          <p style="font-size: 15px; margin: 0 0 20px;">Estimado/a <strong>${candidateName || 'candidato/a'}</strong>,</p>

          <p style="font-size: 14px; line-height: 1.7; margin: 0 0 16px;">
            A nombre de <strong>SUPERDEPORTE S.A.</strong> es un placer darte la bienvenida, esperamos que disfrutes con nosotros de nuestra actividad favorita, el deporte.
          </p>

          <p style="font-size: 14px; line-height: 1.7; margin: 0 0 16px;">
            Estamos orgullosos de ofrecer la mejor experiencia deportiva a nuestros consumidores a través de una asesoría del más alto nivel. Nos caracterizamos por ser un equipo que juega fuerte, que juega para ganar, sin excusas, siempre obedeciendo las reglas del juego.
          </p>

          <p style="font-size: 14px; line-height: 1.7; margin: 0 0 24px;">
            Estamos convencidos que tus competencias nos llevarán a lograr las metas que nos hemos propuesto. Eres parte de esta comunidad de apasionados por el deporte, dispuestos a transformar su entorno y contagiar esta pasión, volviéndose dueños del resultado y siempre trabajando hacia un mismo objetivo.
          </p>

          <div style="background: #f8f9fa; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
            <p style="font-size: 14px; font-weight: bold; margin: 0 0 16px; color: #374151;">
              📋 Por favor, completa tu formulario de ingreso escaneando el siguiente código QR:
            </p>
            <img src="cid:qr_onboarding" alt="QR Onboarding" style="width: 200px; height: 200px;" />
            <p style="font-size: 12px; color: #6b7280; margin: 12px 0 0;">
              O ingresa directamente en: <a href="${onboardingUrl}" style="color: #2563eb;">${onboardingUrl}</a>
            </p>
          </div>

          <p style="font-size: 13px; color: #6b7280; margin: 24px 0 0;">
            Si tienes alguna consulta, no dudes en comunicarte con nosotros.<br/>
            Bienvenido/a al equipo 🏆
          </p>
        </div>

        <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
          SUPERDEPORTE S.A. · uneteanuestroequipo@ec.marathon-sports.com
        </div>
      </div>
    `;

    // 4. Enviar el correo
    await transporter.sendMail({
      from: `"SUPERDEPORTE S.A. - Selección" <${smtpUser}>`,
      to: candidateEmail,
      subject: 'SOLICITUD DOCUMENTOS MARATHON SPORTS',
      priority: 'high',
      html: htmlBody,
      attachments: [
        {
          filename: 'QR_Onboarding.png',
          content: qrBuffer,
          cid: 'qr_onboarding', // Para embeber en HTML con cid:
        },
      ],
    });

    return NextResponse.json({ success: true, message: `Correo enviado a ${candidateEmail}` });

  } catch (error: any) {
    console.error('Error enviando correo de aprobación:', error);
    return NextResponse.json({ error: 'Error al enviar el correo: ' + error.message }, { status: 500 });
  }
}
