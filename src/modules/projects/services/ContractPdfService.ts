import html2pdf from 'html2pdf.js';
import type { ProjectFormData } from '../types/project.types';

const STANDARD_TERMS = [
  {
    id: 'objeto_contrato',
    title: 'Primera: OBJETO DEL CONTRATO',
    content: 'El presente contrato se suscribe a los efectos de encomendar la tarea de dirección y construcción de la obra según las especificaciones técnicas y ubicación detalladas en el proyecto. La obra se ejecutará conforme a planos, memorias descriptivas y especificaciones técnicas aprobadas.',
  },
  {
    id: 'aporte_partes',
    title: 'Segunda: APORTE DE LAS PARTES',
    content: 'El Cliente aportará la suma total establecida en el proyecto, representando el 100% de la inversión para la construcción. Los pagos se realizarán según el cronograma acordado: un anticipo inicial y cuotas mensuales dentro de los primeros 10 días de cada mes.',
  },
  {
    id: 'diferencias_finalizacion',
    title: 'Tercera: DIFERENCIAS Y FINALIZACIÓN DE APORTES',
    content: 'En el caso de que el Cliente en el transcurso del contrato no cumpliera en tiempo y forma con los desembolsos dinerarios establecidos, la obra se amoldará a los ritmos de dichos desembolsos. La entrega final de obra será realizada una vez finalizados la totalidad de los aportes contractuales.',
  },
  {
    id: 'lugar_pago',
    title: 'Cuarta: LUGAR DE PAGO',
    content: 'Los desembolsos dinerarios deberán ser abonados durante los primeros 10 (diez) días de cada mes en las oficinas del Estudio o mediante transferencia bancaria a la cuenta designada. Se emitirá el comprobante correspondiente por cada pago recibido.',
  },
  {
    id: 'plazo_ejecucion',
    title: 'Quinta: PLAZO DE EJECUCIÓN',
    content: 'La tarea de proyecto, dirección y construcción de la obra se iniciará en la fecha establecida y se finalizará según el cronograma acordado. Los plazos podrán ser modificados por causas de fuerza mayor, condiciones climáticas adversas, o incumplimiento en los pagos del Cliente.',
  },
  {
    id: 'calidad_constructiva',
    title: 'Sexta: CALIDAD CONSTRUCTIVA',
    content: 'La obra se materializa de manera tradicional con materiales de primera calidad: estructura de hormigón armado según cálculo, mampostería de ladrillo hueco revocada, cubierta con estructura metálica y chapa galvanizada, instalaciones sanitarias y eléctricas completas, carpinterías de aluminio, aberturas de seguridad, pisos de porcelanato, y terminaciones de primera calidad en todos los rubros.',
  },
  {
    id: 'responsabilidad',
    title: 'Séptima: RESPONSABILIDAD',
    content: 'El Director de Obra será solidariamente responsable por las contingencias que pudieran surgir durante la ejecución de la obra y hasta su aprobación de final de obra. También será responsable por los vicios que pudieran surgir finalizada la obra por el plazo establecido por el Art. 1255 del Código Civil y Comercial de la Nación, sus acordes, concordantes y demás leyes complementarias.',
  },
  {
    id: 'domicilios_competencia',
    title: 'Octava: DOMICILIOS Y COMPETENCIA',
    content: 'Para todas las notificaciones derivadas del presente convenio, las partes constituyen los domicilios especiales denunciados en el contrato. En caso de litigio, las partes se someterán exclusivamente a la competencia de los tribunales ordinarios correspondientes, con expresa renuncia a cualesquiera otras que pudieran corresponderles.',
  },
  {
    id: 'sellado_ley',
    title: 'Novena: SELLADO DE LEY',
    content: 'El gasto de sellado del presente contrato será soportado según lo establecido por las partes de común acuerdo, conforme a la legislación vigente en materia de sellado de contratos.',
  },
  {
    id: 'normas',
    title: 'Décima: NORMAS',
    content: 'El presente contrato se regirá por las normas del Art. 1251 y siguientes del Código Civil y Comercial de la Nación, sus acordes, concordantes y leyes supletorias aplicables en materia de locación de obra y servicios profesionales.',
  },
];

class ContractPdfService {
  private formatCurrency(amount: number | undefined, currency: 'ARS' | 'USD' = 'ARS'): string {
    if (!amount) return '0';
    return currency === 'USD'
      ? `USD ${amount.toLocaleString('es-AR')}`
      : `$${amount.toLocaleString('es-AR')}`;
  }

  private generateContractHTML(formData: ProjectFormData): string {
    const today = new Date().toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const signatureDate = formData.signatureDate
      ? new Date(formData.signatureDate).toLocaleDateString('es-AR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : today;

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <style>
          @page {
            size: A4;
            margin: 20mm;
          }
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #000;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 {
            text-align: center;
            font-size: 18pt;
            font-weight: bold;
            margin-bottom: 10px;
            text-transform: uppercase;
          }
          h2 {
            font-size: 12pt;
            font-weight: bold;
            margin-top: 20px;
            margin-bottom: 10px;
          }
          h3 {
            font-size: 11pt;
            font-weight: bold;
            margin-top: 15px;
            margin-bottom: 8px;
          }
          h4 {
            font-size: 11pt;
            font-weight: bold;
            margin-top: 12px;
            margin-bottom: 6px;
          }
          p {
            text-align: justify;
            margin: 8px 0;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }
          .project-info {
            background-color: #f5f5f5;
            padding: 15px;
            margin: 20px 0;
            border: 1px solid #ccc;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-top: 10px;
          }
          .info-item {
            font-size: 10pt;
          }
          .info-label {
            font-weight: bold;
            display: inline-block;
            width: 120px;
          }
          .clause {
            margin: 20px 0;
            page-break-inside: avoid;
          }
          .clause-title {
            font-weight: bold;
            margin-bottom: 8px;
          }
          .signatures {
            margin-top: 40px;
            page-break-inside: avoid;
          }
          .signature-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-top: 30px;
          }
          .signature-box {
            border-top: 1px solid #000;
            padding-top: 10px;
          }
          .signature-label {
            font-size: 9pt;
            color: #666;
            margin-bottom: 5px;
          }
          .signature-name {
            font-weight: bold;
            font-size: 11pt;
          }
          .signature-details {
            font-size: 9pt;
            color: #666;
            margin-top: 3px;
          }
          .digital-signature {
            background-color: #e8f5e9;
            border: 1px solid #4caf50;
            padding: 10px;
            margin-top: 5px;
            border-radius: 4px;
          }
          .digital-signature-label {
            font-size: 9pt;
            color: #2e7d32;
            font-weight: bold;
            margin-bottom: 3px;
          }
          .digital-signature-info {
            font-size: 9pt;
            color: #2e7d32;
          }
          .footer {
            margin-top: 30px;
            font-size: 9pt;
            text-align: center;
            color: #666;
            border-top: 1px solid #ccc;
            padding-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>CONTRATO DE CONSTRUCCIÓN</h1>
          <p style="text-align: center; font-size: 10pt; margin-top: 5px;">
            Expediente Nº: ${formData.projectName || 'SIN NÚMERO'}
          </p>
        </div>

        <h2>ENTRE:</h2>
        <p>
          <strong>EL CONTRATISTA:</strong> [Nombre del Estudio/Empresa], con domicilio en [Dirección],
          en adelante "EL CONTRATISTA"
        </p>
        <p>
          <strong>EL CLIENTE:</strong> ${formData.clientName || '[Nombre del Cliente]'},
          ${formData.clientTaxId ? `CUIT/CUIL ${formData.clientTaxId},` : ''} con domicilio en ${formData.propertyAddress || '[Dirección]'},
          en adelante "EL CLIENTE"
        </p>

        <div class="project-info">
          <h3>DATOS DEL PROYECTO</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Proyecto:</span>
              ${formData.projectName}
            </div>
            <div class="info-item">
              <span class="info-label">Ubicación:</span>
              ${formData.propertyAddress}
            </div>
            <div class="info-item">
              <span class="info-label">Valor Total:</span>
              ${this.formatCurrency(formData.totalAmount, formData.currency)}
            </div>
            <div class="info-item">
              <span class="info-label">Anticipo:</span>
              ${this.formatCurrency(formData.downPaymentAmount, formData.currency)}
              ${formData.downPaymentPercentage ? ` (${formData.downPaymentPercentage}%)` : ''}
            </div>
            <div class="info-item">
              <span class="info-label">Plan de Pagos:</span>
              ${formData.installmentCount} cuotas de ${this.formatCurrency(formData.installmentAmount, formData.currency)}
            </div>
            ${formData.estimatedStartDate ? `
            <div class="info-item">
              <span class="info-label">Fecha de Inicio:</span>
              ${new Date(formData.estimatedStartDate).toLocaleDateString('es-AR')}
            </div>
            ` : ''}
          </div>
        </div>

        <h2>CLÁUSULAS</h2>
        ${STANDARD_TERMS.map(term => `
          <div class="clause">
            <h4 class="clause-title">${term.title}</h4>
            <p>${term.content}</p>
          </div>
        `).join('')}

        ${formData.specialConditions ? `
          <div class="clause">
            <h4 class="clause-title">CONDICIONES ESPECIALES</h4>
            <p>${formData.specialConditions}</p>
          </div>
        ` : ''}

        <div class="signatures">
          <p>
            En prueba de conformidad, se firman <strong>dos (2) ejemplares</strong> de un mismo tenor y a un solo efecto,
            en la ciudad de [Ciudad], a los ${today}.
          </p>

          <div class="signature-grid">
            <div class="signature-box">
              <div class="signature-label">Firma del Contratista</div>
              <div class="signature-name">[Nombre del Estudio]</div>
            </div>
            <div class="signature-box">
              <div class="signature-label">Firma del Cliente</div>
              <div class="signature-name">${formData.clientName}</div>
              ${formData.clientTaxId ? `<div class="signature-details">CUIT/CUIL: ${formData.clientTaxId}</div>` : ''}

              ${formData.contractSigned && formData.clientSignature ? `
                <div class="digital-signature">
                  <div class="digital-signature-label">✓ FIRMA DIGITAL CERTIFICADA</div>
                  <div class="digital-signature-info">
                    Firmado por: ${formData.clientSignature}<br>
                    Fecha y hora: ${signatureDate}
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        </div>

        <div class="footer">
          <p>
            Documento generado digitalmente por Nivexa - Sistema de Gestión de Proyectos<br>
            Fecha de generación: ${new Date().toLocaleString('es-AR')}
          </p>
        </div>
      </body>
      </html>
    `;
  }

  async generatePDF(formData: ProjectFormData): Promise<Blob> {
    const htmlContent = this.generateContractHTML(formData);

    // Create a temporary element to render the HTML
    const element = document.createElement('div');
    element.innerHTML = htmlContent;
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    document.body.appendChild(element);

    try {
      const opt = {
        margin: 0,
        filename: `contrato-${formData.projectName?.replace(/\s+/g, '-') || 'proyecto'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        }
      };

      const pdf = await html2pdf().set(opt).from(element).output('blob');
      return pdf;
    } finally {
      // Clean up
      document.body.removeChild(element);
    }
  }

  async generateAndDownload(formData: ProjectFormData): Promise<void> {
    const pdfBlob = await this.generatePDF(formData);
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contrato-${formData.projectName?.replace(/\s+/g, '-') || 'proyecto'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const contractPdfService = new ContractPdfService();
