import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const { 
      candidateName,
      candidateCedula,
      candidatePosition,
      companySlug,
      backgroundChecks
    } = await req.json()

    if (!candidateName || !candidateCedula) {
      return NextResponse.json({ error: 'Faltan datos del candidato' }, { status: 400 })
    }

    const checksHtml = Object.entries(backgroundChecks || {}).map(([key, value]) => {
      const color = value === 'OK' ? 'green' : value === 'NO APTO' ? 'red' : 'gray';
      return `<li><strong>${key}:</strong> <span style="color: ${color}; font-weight: bold;">${value}</span></li>`
    }).join('')

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
    `

    const data = await resend.emails.send({
      from: 'RRHH Sistema <reclutamiento@sepribe.com>',
      to: 'sepribe.legal@gmail.com',
      subject: `Verificación Legal Requerida: ${candidateName} - ${candidateCedula}`,
      html: htmlContent,
    })

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Error al enviar correo a Legal:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
