import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@microsoft/microsoft-graph-client';
import { ConfidentialClientApplication } from '@azure/msal-node';

export async function POST(req: NextRequest) {
  const clientId = process.env.AZURE_CLIENT_ID || '69f4a759-9537-4f11-b398-47a7f6ef8e83';
  const tenantId = process.env.AZURE_TENANT_ID || 'a25466cf-9db0-4555-b90b-3b29d4097ff2';
  const clientSecret = process.env.AZURE_CLIENT_SECRET || 'vg98Q~Zt5MJ2ui6mpjM~CCFiPGB8o5fObGM4ZbXm';
  const senderEmail = process.env.SMTP_USER || 'uneteanuestroequipo@sepribe.com.ec';

  try {
    const { email, name, cargo } = await req.json();

    if (!email) return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
    if (!cargo) return NextResponse.json({ error: 'Cargo requerido' }, { status: 400 });

    // 1. Obtener Token de Acceso Azure
    const msalConfig = {
      auth: { clientId, authority: `https://login.microsoftonline.com/${tenantId}`, clientSecret }
    };
    const cca = new ConfidentialClientApplication(msalConfig);
    const authResponse = await cca.acquireTokenByClientCredential({
      scopes: ['https://graph.microsoft.com/.default']
    });

    if (!authResponse || !authResponse.accessToken) {
      throw new Error('No se pudo obtener el token de acceso de Azure');
    }

    const client = Client.init({
      authProvider: (done) => done(null, authResponse.accessToken)
    });

    const htmlMessage = `
      <div style="font-family: sans-serif; line-height: 1.7; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        
        <div style="background: #0f172a; padding: 24px; text-align: center;">
          <h2 style="color: white; margin: 0; font-size: 20px;">Proceso de Selección</h2>
          <p style="color: #94a3b8; margin: 8px 0 0; font-size: 14px;">SEPRIBE CIA.LTDA.</p>
        </div>

        <div style="padding: 32px; background: white;">
          <p>Hola <strong>${name || 'Candidato/a'}</strong>,</p>
          
          <p>Muchas gracias por compartir tu hoja de vida con nosotros. Valoramos mucho el tiempo que dedicaste a postular a la vacante de <strong>${cargo}</strong>.</p>

          <p>Tras revisar cuidadosamente tu perfil, te informamos que en esta ocasión no continuaremos con tu proceso, ya que estamos buscando una especialización técnica específica para los retos de este rol.</p>

          <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 24px 0;">
            <p style="margin: 0; color: #475569; font-size: 14px;">
              💼 Tu perfil permanecerá en nuestra base de datos para <strong>futuras oportunidades</strong> que se alineen con tu experiencia.
            </p>
          </div>

          <p>Te agradecemos nuevamente por el interés en formar parte de nuestro equipo y te deseamos mucho éxito en tus próximos desafíos profesionales.</p>

          <br/>
          <p style="margin-bottom: 4px;">Saludos cordiales,</p>
          <p><strong>Talento Humano</strong><br/>SEPRIBE CIA.LTDA.</p>
        </div>

        <div style="background: #f8fafc; padding: 16px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 12px; color: #94a3b8;">Este correo fue enviado por el equipo de Talento Humano de SEPRIBE CIA.LTDA.</p>
        </div>
      </div>`;

    const sendMail = {
      message: {
        subject: `Agradecimiento por tu postulación: ${cargo}`,
        body: { contentType: 'HTML', content: htmlMessage },
        toRecipients: [{ emailAddress: { address: email } }]
      }
    };

    await client.api(`/users/${senderEmail}/sendMail`).post(sendMail);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error enviando mail de agradecimiento:', error);
    const errorDetail = error.response?.data?.error?.message || error.message;
    const errorCode = error.response?.data?.error?.code || 'UNKNOWN';
    return NextResponse.json({
      error: `Error Graph API (${errorCode}): ${errorDetail}`
    }, { status: 500 });
  }
}
