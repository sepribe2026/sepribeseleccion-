import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@microsoft/microsoft-graph-client';
import { ConfidentialClientApplication } from '@azure/msal-node';

export async function POST(req: NextRequest) {
  const clientId = process.env.AZURE_CLIENT_ID || '69f4a759-9537-4f11-b398-47a7f6ef8e83';
  const tenantId = process.env.AZURE_TENANT_ID || 'a25466cf-9db0-4555-b90b-3b29d4097ff2';
  const clientSecret = process.env.AZURE_CLIENT_SECRET || 'vg98Q~Zt5MJ2ui6mpjM~CCFiPGB8o5fObGM4ZbXm';
  const senderEmail = process.env.SMTP_USER || 'uneteanuestroequipo@sepribe.com.ec';

  try {
    const { 
      candidateName,
      candidateCedula,
      candidatePosition,
      companySlug,
      backgroundChecks
    } = await req.json();

    if (!candidateName || !candidateCedula) {
      return NextResponse.json({ error: 'Faltan datos del candidato' }, { status: 400 });
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

    const checksHtml = Object.entries(backgroundChecks || {}).map(([key, value]) => {
      const color = value === 'OK' ? 'green' : value === 'NO APTO' ? 'red' : 'gray';
      return `<li><strong>${key}:</strong> <span style="color: ${color}; font-weight: bold;">${value}</span></li>`;
    }).join('');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #fbbf24;">Solicitud de Verificación Legal</h2>
        <p>El departamento de Recursos Humanos solicita la verificación legal de los antecedentes del siguiente candidato para la empresa <strong>${companySlug}</strong>:</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Candidato:</strong> ${candidateName}</p>
          <p><strong>Cédula:</strong> ${candidateCedula}</p>
          <p><strong>Cargo al que postula:</strong> ${candidatePosition}</p>
        </div>

        <h3>Estado de las Verificaciones:</h3>
        <ul>
          ${checksHtml || '<li>No se han reportado verificaciones aún.</li>'}
        </ul>

        <p style="margin-top: 30px;">Por favor, ingresar a los portales correspondientes para realizar la verificación a profundidad.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #999;">Este es un mensaje automático generado por el Sistema de Selección de ${companySlug.toUpperCase()}.</p>
      </div>
    `;

    const sendMail = {
      message: {
        subject: `Verificación Legal Requerida: ${candidateName} - ${candidateCedula}`,
        body: { contentType: 'HTML', content: htmlContent },
        toRecipients: [{ emailAddress: { address: 'sepribe.legal@gmail.com' } }]
      }
    };

    await client.api(`/users/${senderEmail}/sendMail`).post(sendMail);

    return NextResponse.json({ success: true, message: 'Correo enviado a Legal' });
  } catch (error: any) {
    console.error('Error enviando correo a Legal con Graph API:', error);
    const errorDetail = error.response?.data?.error?.message || error.message;
    return NextResponse.json({ error: 'Error Graph API: ' + errorDetail }, { status: 500 });
  }
}
