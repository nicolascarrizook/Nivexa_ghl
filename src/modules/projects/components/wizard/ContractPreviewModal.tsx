import { X, FileText, Download, CheckCircle } from 'lucide-react';
import { useRef, useState } from 'react';
import type { ProjectFormData } from '../../types/project.types';

interface ContractPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: Partial<ProjectFormData>;
  onSign: (signatureData: { clientSignature: string; date: string }) => void;
}

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

export function ContractPreviewModal({
  isOpen,
  onClose,
  formData,
  onSign,
}: ContractPreviewModalProps) {
  const [clientSignature, setClientSignature] = useState('');
  const [isSigning, setIsSigning] = useState(false);
  const contractRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleSign = () => {
    if (!clientSignature.trim()) {
      alert('Por favor ingrese su nombre completo para firmar');
      return;
    }

    const signatureData = {
      clientSignature: clientSignature.trim(),
      date: new Date().toISOString(),
    };

    onSign(signatureData);
    onClose();
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: number | undefined, currency: 'ARS' | 'USD' = 'ARS') => {
    if (!amount) return '0';
    return currency === 'USD'
      ? `USD ${amount.toLocaleString('es-AR')}`
      : `$${amount.toLocaleString('es-AR')}`;
  };

  const today = new Date().toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900">Previsualización del Contrato</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Imprimir"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contract Content */}
        <div className="flex-1 overflow-y-auto p-8" ref={contractRef}>
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Contract Header */}
            <div className="text-center border-b border-gray-300 pb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                CONTRATO DE CONSTRUCCIÓN
              </h1>
              <p className="text-sm text-gray-600">
                Expediente Nº: {formData.projectName || 'SIN NÚMERO'}
              </p>
            </div>

            {/* Parties */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">ENTRE:</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  <strong>EL CONTRATISTA:</strong> [Nombre del Estudio/Empresa], con domicilio en [Dirección],
                  en adelante "EL CONTRATISTA"
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  <strong>EL CLIENTE:</strong> {formData.clientName || '[Nombre del Cliente]'},
                  {formData.clientTaxId && ` CUIT/CUIL ${formData.clientTaxId},`} con domicilio en {formData.propertyAddress || '[Dirección]'},
                  en adelante "EL CLIENTE"
                </p>
              </div>
            </div>

            {/* Project Details */}
            <div className="bg-gray-50 rounded-lg p-6 space-y-3">
              <h3 className="text-base font-semibold text-gray-900 mb-4">DATOS DEL PROYECTO</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Proyecto:</span>
                  <span className="ml-2 text-gray-900 font-medium">{formData.projectName}</span>
                </div>
                <div>
                  <span className="text-gray-600">Ubicación:</span>
                  <span className="ml-2 text-gray-900 font-medium">{formData.propertyAddress}</span>
                </div>
                <div>
                  <span className="text-gray-600">Valor Total:</span>
                  <span className="ml-2 text-gray-900 font-medium">
                    {formatCurrency(formData.totalAmount, formData.currency)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Anticipo:</span>
                  <span className="ml-2 text-gray-900 font-medium">
                    {formatCurrency(formData.downPaymentAmount, formData.currency)}
                    {formData.downPaymentPercentage && ` (${formData.downPaymentPercentage}%)`}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Plan de Pagos:</span>
                  <span className="ml-2 text-gray-900 font-medium">
                    {formData.installmentCount} cuotas de {formatCurrency(formData.installmentAmount, formData.currency)}
                  </span>
                </div>
                {formData.estimatedStartDate && (
                  <div>
                    <span className="text-gray-600">Fecha de Inicio:</span>
                    <span className="ml-2 text-gray-900 font-medium">
                      {new Date(formData.estimatedStartDate).toLocaleDateString('es-AR')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Standard Terms */}
            <div className="space-y-6">
              <h3 className="text-base font-semibold text-gray-900">CLÁUSULAS</h3>
              {STANDARD_TERMS.map((term, index) => (
                <div key={term.id} className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-900">{term.title}</h4>
                  <p className="text-sm text-gray-700 leading-relaxed text-justify">
                    {term.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Special Conditions */}
            {formData.specialConditions && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-900">CONDICIONES ESPECIALES</h4>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {formData.specialConditions}
                </p>
              </div>
            )}

            {/* Signature Section */}
            <div className="border-t border-gray-300 pt-8 mt-8 space-y-8">
              <p className="text-sm text-gray-700">
                En prueba de conformidad, se firman <strong>dos (2) ejemplares</strong> de un mismo tenor y a un solo efecto,
                en la ciudad de [Ciudad], a los {today}.
              </p>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="border-t border-gray-400 pt-2">
                    <p className="text-xs text-gray-600 mb-1">Firma del Contratista</p>
                    <p className="text-sm text-gray-900 font-medium">[Nombre del Estudio]</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="border-t border-gray-400 pt-2">
                    <p className="text-xs text-gray-600 mb-1">Firma del Cliente</p>
                    <p className="text-sm text-gray-900 font-medium">{formData.clientName}</p>
                    {formData.clientTaxId && (
                      <p className="text-xs text-gray-600">CUIT/CUIL: {formData.clientTaxId}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Signature Input */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="max-w-3xl mx-auto">
            {!isSigning ? (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Revise el contrato antes de continuar
                </p>
                <button
                  onClick={() => setIsSigning(true)}
                  className="px-6 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Firmar Contrato
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Firma Digital - Ingrese su nombre completo
                  </label>
                  <input
                    type="text"
                    value={clientSignature}
                    onChange={(e) => setClientSignature(e.target.value)}
                    placeholder="Nombre completo del cliente"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Al firmar, acepta todos los términos y condiciones del contrato
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsSigning(false)}
                    className="flex-1 px-6 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSign}
                    disabled={!clientSignature.trim()}
                    className="flex-1 px-6 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Confirmar Firma
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
