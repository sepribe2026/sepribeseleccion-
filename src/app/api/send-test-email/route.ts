import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@microsoft/microsoft-graph-client';
import { ConfidentialClientApplication } from '@azure/msal-node';

export async function POST(req: NextRequest) {
  const clientId = process.env.AZURE_CLIENT_ID || '69f4a759-9537-4f11-b398-47a7f6ef8e83';
  const tenantId = process.env.AZURE_TENANT_ID || 'a25466cf-9db0-4555-b90b-3b29d4097ff2';
  const clientSecret = process.env.AZURE_CLIENT_SECRET || 'vg98Q~Zt5MJ2ui6mpjM~CCFiPGB8o5fObGM4ZbXm';
  const senderEmail = process.env.SMTP_USER || 'uneteanuestroequipo@ec.marathon-sports.com';

  try {
    const { email, name, cargo, candidateId } = await req.json();

    if (!email || !candidateId) {
      return NextResponse.json({ error: 'Email y candidateId son requeridos' }, { status: 400 });
    }

    // 1. Obtener Token de Acceso
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

    // Construir URL del examen dinámicamente según el host
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host') || 'localhost:3000';
    const testUrl = `${protocol}://${host}/evaluacion/${candidateId}`;

    const htmlMessage = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #0f172a, #1e293b); padding: 32px 24px; text-align: center;">
          <h2 style="color: white; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">Evaluación Psicométrica</h2>
          <p style="color: #94a3b8; margin: 8px 0 0; font-size: 14px; font-weight: 500;">Proceso de Selección - Superdeporte S.A.</p>
        </div>
        <div style="padding: 32px 24px; background: white;">
          <p style="font-size: 16px; margin-top: 0;">Estimado(a) <strong>${name || 'Candidato'}</strong>,</p>
          <p style="font-size: 15px; color: #475569;">Para continuar con tu postulación al cargo de <strong>${cargo || 'nuestra vacante disponible'}</strong>, solicitamos que completes las siguientes evaluaciones psicométricas obligatorias:</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 24px 0;">
            <h4 style="margin: 0 0 12px; color: #0f172a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">📋 Secciones de Evaluación:</h4>
            <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #475569;">
              <li style="margin-bottom: 6px;"><strong>Verbal:</strong> Prueba de sinónimos y léxico (5 Minutos).</li>
              <li style="margin-bottom: 6px;"><strong>Espacial:</strong> Rotación y orientación de figuras (5 Minutos).</li>
              <li style="margin-bottom: 6px;"><strong>Lógico:</strong> Continuación de series y secuencias (6 Minutos).</li>
              <li style="margin-bottom: 6px;"><strong>Numérico:</strong> Resolución de problemas matemáticos básicos (5 Minutos).</li>
              <li style="margin-bottom: 6px;"><strong>Abstracto:</strong> Razonamiento de matrices y patrones (20 Minutos).</li>
              <li style="margin-bottom: 6px;"><strong>Ética:</strong> Decisiones éticas y de cumplimiento (Sin Límite).</li>
              <li style="margin-bottom: 0;"><strong>DISC:</strong> Perfil de comportamiento y emociones (Sin Límite).</li>
            </ul>
          </div>
          
          <p style="text-align: center; margin: 32px 0 20px;">
            <a href="${testUrl}" target="_blank" style="background: #2563eb; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);">
              Iniciar Evaluación en Línea
            </a>
          </p>

          <div style="text-align: center; margin: 24px 0; border-top: 1px solid #f1f5f9; padding-top: 24px;">
            <p style="font-size: 13px; color: #64748b; margin-bottom: 12px;">O escanea el código QR desde tu teléfono celular para realizar el test:</p>
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(testUrl)}" alt="QR Test" style="display: block; margin: 0 auto; width: 180px; height: 180px; padding: 8px; border: 1px solid #e2e8f0; border-radius: 8px; background: white;"/>
          </div>

          <div style="background: #fffbeb; border: 1px solid #fef3c7; padding: 14px; border-radius: 8px; margin: 24px 0; font-size: 13px; color: #b45309;">
            ⚠️ <strong>Recomendación importante:</strong> Asegúrate de estar en un ambiente tranquilo y sin interrupciones. Una vez que inicies un sub-test, el temporizador correrá continuamente y no podrá pausarse.
          </div>

          <p style="font-size: 14px; color: #475569; margin-bottom: 0;">Atentamente,</p>
          <p style="font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 4px;">Departamento de Selección y Desarrollo de Talentos<br/>Superdeporte S.A.</p>
        </div>
      </div>
    `;

    const sendMail = {
      message: {
        subject: `Invitación a Evaluación Psicométrica - Selección: ${cargo || ''}`,
        body: { contentType: 'HTML', content: htmlMessage },
        toRecipients: [{ emailAddress: { address: email } }]
      }
    };

    await client.api(`/users/${senderEmail}/sendMail`).post(sendMail);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error enviando mail con Graph API:', error);
    const errorDetail = error.response?.data?.error?.message || error.message;
    const errorCode = error.response?.data?.error?.code || 'UNKNOWN';
    return NextResponse.json({ 
      error: `Error Graph API (${errorCode}): ${errorDetail}`
    }, { status: 500 });
  }
}
