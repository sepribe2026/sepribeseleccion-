import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { email, name, observation, portalUrl } = await req.json();
    const onboardingUrl = portalUrl || `https://uneteanuestroequipo.ec.aseyco.com/superdeporte/onboarding`;

    if (!email) return NextResponse.json({ error: 'Email requerido' }, { status: 400 });

    const smtpHost = process.env.SMTP_HOST || 'smtp.office365.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER || 'uneteanuestroequipo@sepribe.com.ec';
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

    const message = `Hola ${name},\n\nTu expediente de ingreso a SEPRIBE CIA.LTDA. ha sido revisado y requiere algunas correcciones.\n\nOBSERVACIÓN:\n${observation}\n\nPor favor, ingresa nuevamente al portal de onboarding y completa la información solicitada correctamente.\n\nPortal: ${onboardingUrl}\n\nSaludos cordiales,\nTalento Humano - SEPRIBE CIA.LTDA.`;

    await transporter.sendMail({
      from: `"RRHH Selección" <${smtpUser}>`,
      to: email,
      subject: `Acción Requerida: Corrección en tu Expediente de Ingreso`,
      text: message,
      html: `<div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: #ef4444; padding: 24px; text-align: center;">
          <h2 style="color: white; margin: 0; font-size: 20px;">Corrección de Expediente</h2>
          <p style="color: #fee2e2; margin: 8px 0 0; font-size: 14px;">SEPRIBE CIA.LTDA.</p>
        </div>
        <div style="padding: 32px; background: white;">
          <p>Hola <strong>${name}</strong>,</p>
          <p>Hemos revisado la información de tu ficha de ingreso y hemos detectado que algunos datos o documentos requieren ser corregidos antes de proceder con tu contratación.</p>
          
          <div style="background: #fff5f5; padding: 20px; border-radius: 8px; border: 1px solid #feb2b2; margin: 24px 0;">
            <p style="margin: 0; color: #9b1c1c; font-weight: bold;">⚠️ Observación de RRHH:</p>
            <p style="margin: 8px 0 0; color: #c53030;">${observation}</p>
          </div>
          
          <p>Por favor, ingresa nuevamente al portal usando el siguiente enlace para completar los datos correctamente:</p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${onboardingUrl}" style="background: #002f6c; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Corregir Información</a>
          </div>
          
          <p style="font-size: 13px; color: #64748b;">Si tienes dudas sobre esta observación, puedes responder a este correo.</p>
          <br/>
          <p style="margin-bottom: 4px;">Saludos cordiales,</p>
          <p><strong>Talento Humano</strong><br/>SEPRIBE CIA.LTDA.</p>
        </div>
      </div>`
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error enviando mail de rechazo:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
