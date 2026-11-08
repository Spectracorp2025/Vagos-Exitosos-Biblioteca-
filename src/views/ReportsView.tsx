import React, { useState, useEffect } from 'react';
import { Publication, Report, ReportType, ReportStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { firestoreService } from '../services/firestoreService';
import {
  AlertOctagon,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Search,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface ReportsViewProps {
  publications: Publication[];
  initialSelectedPublication?: Publication | null;
  onSelectPublication: (pub: Publication) => void;
  onNavigate: (section: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  publications,
  initialSelectedPublication,
  onSelectPublication,
  onNavigate,
}) => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'create' | 'my-reports'>('create');

  // Form State
  const [selectedPubId, setSelectedPubId] = useState<string>(
    initialSelectedPublication ? initialSelectedPublication.id : ''
  );
  const [reportType, setReportType] = useState<ReportType>('enlace_caido');
  const [description, setDescription] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // User's Reports List
  const [myReports, setMyReports] = useState<Report[]>([]);

  useEffect(() => {
    if (initialSelectedPublication) {
      setSelectedPubId(initialSelectedPublication.id);
      setActiveTab('create');
    }
  }, [initialSelectedPublication]);

  // Subscribe to reports
  useEffect(() => {
    const unsubscribe = firestoreService.subscribeReports(
      user?.uid || null,
      isAdmin,
      (reports) => {
        setMyReports(reports);
      }
    );
    return () => unsubscribe();
  }, [user?.uid, isAdmin]);

  const reportTypeLabels: Record<ReportType, { label: string; desc: string }> = {
    enlace_caido: { label: 'Enlace caído', desc: 'El link de descarga o página web ya no funciona o fue borrado.' },
    archivo_danado: { label: 'Archivo dañado', desc: 'El archivo ZIP, RAR o ISO arroja error de suma de verificación o está corrupto.' },
    apk_no_funciona: { label: 'APK que no funciona', desc: 'La aplicación o juego se cierra al abrir o marca error de análisis.' },
    error_instalacion: { label: 'Error de instalación', desc: 'No se puede instalar en el dispositivo o faltan archivos en el paquete.' },
    informacion_incorrecta: { label: 'Información incorrecta', desc: 'Los requisitos, versión o detalles descritos no coinciden con la realidad.' },
    pagina_caida: { label: 'Página web caída', desc: 'El servidor del sitio web o portal no responde.' },
    posible_malicioso: { label: 'Posible contenido malicioso', desc: 'Alerta de virus, malware, adware o comportamiento sospechoso.' },
    otro: { label: 'Otro problema', desc: 'Cualquier otra anomalía no categorizada arriba.' },
  };

  const statusConfig: Record<ReportStatus, { label: string; color: string; icon: any }> = {
    pendiente: {
      label: 'Pendiente',
      color: 'bg-amber-950/60 text-amber-300 border-amber-800/40',
      icon: Clock,
    },
    en_revision: {
      label: 'En Revisión',
      color: 'bg-blue-950/60 text-blue-300 border-blue-800/40',
      icon: HelpCircle,
    },
    solucionado: {
      label: 'Solucionado',
      color: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40',
      icon: CheckCircle2,
    },
    rechazado: {
      label: 'Rechazado',
      color: 'bg-rose-950/60 text-rose-300 border-rose-800/40',
      icon: XCircle,
    },
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!selectedPubId) {
      setErrorMessage('Por favor selecciona la publicación que deseas reportar.');
      return;
    }

    if (!description.trim()) {
      setErrorMessage('Por favor describe cuál es el problema que encontraste.');
      return;
    }

    const pub = publications.find((p) => p.id === selectedPubId);
    if (!pub) {
      setErrorMessage('La publicación seleccionada no existe.');
      return;
    }

    setIsSubmitting(true);
    try {
      const fullDesc = additionalInfo.trim()
        ? `${description.trim()}\n\n[Información Adicional]: ${additionalInfo.trim()}`
        : description.trim();

      await firestoreService.createReport({
        publicationId: pub.id,
        publicationTitle: pub.title,
        userId: user?.uid || 'anon_member',
        userDisplayName: user?.displayName || 'Miembro de Vagos',
        reportType,
        description: fullDesc,
      });

      setSuccessMessage('¡Reporte enviado exitosamente a los administradores de Vagos Exitosos!');
      setDescription('');
      setAdditionalInfo('');
      setActiveTab('my-reports');
    } catch (err: any) {
      setErrorMessage('Error al enviar el reporte: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="flex h-2 w-2 rounded-full bg-amber-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Control de Calidad Comunitario
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Centro de Reportes
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-gray-300">
          Notifica enlaces caídos, archivos dañados o cualquier irregularidad para mantener la biblioteca impecable.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-purple-900/40">
        <button
          type="button"
          onClick={() => setActiveTab('create')}
          className={`flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'create'
              ? 'border-pink-500 text-pink-300 bg-purple-950/20'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <AlertOctagon className="h-4 w-4" />
          <span>Enviar Nuevo Reporte</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('my-reports')}
          className={`flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'my-reports'
              ? 'border-pink-500 text-pink-300 bg-purple-950/20'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Historial de Reportes ({myReports.length})</span>
        </button>
      </div>

      {successMessage && (
        <div className="rounded-2xl border border-emerald-600/50 bg-emerald-950/60 p-4 text-xs sm:text-sm text-emerald-200 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-2xl border border-rose-600/50 bg-rose-950/60 p-4 text-xs sm:text-sm text-rose-200 flex items-center gap-3">
          <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* TAB 1: FORMULARIO DE REPORTE */}
      {activeTab === 'create' && (
        <form
          onSubmit={handleSubmitReport}
          className="rounded-3xl border border-purple-900/50 bg-[#111222] p-6 sm:p-8 shadow-2xl shadow-purple-950/40 space-y-6"
        >
          {/* Select Publication */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">
              1. Seleccionar la Publicación Afectada <span className="text-pink-500">*</span>
            </label>
            <select
              required
              value={selectedPubId}
              onChange={(e) => setSelectedPubId(e.target.value)}
              className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] px-4 py-3 text-sm text-white focus:border-pink-500 focus:outline-none"
            >
              <option value="">-- Elige una publicación de la biblioteca --</option>
              {publications.map((pub) => (
                <option key={pub.id} value={pub.id}>
                  [{pub.type.toUpperCase()}] {pub.title} (por {pub.authorName})
                </option>
              ))}
            </select>
          </div>

          {/* Select Issue Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-400 mb-3">
              2. Tipo de Problema Detectado <span className="text-pink-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(Object.keys(reportTypeLabels) as ReportType[]).map((key) => {
                const item = reportTypeLabels[key];
                const isSelected = reportType === key;
                return (
                  <label
                    key={key}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-pink-500 bg-pink-950/40 text-white'
                        : 'border-purple-900/30 bg-[#16172d] text-gray-400 hover:text-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportType"
                      value={key}
                      checked={isSelected}
                      onChange={() => setReportType(key)}
                      className="mt-1 accent-pink-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">{item.label}</div>
                      <div className="text-[11px] text-gray-400 leading-tight mt-0.5">{item.desc}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Issue Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">
              3. Descripción del Problema <span className="text-pink-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explica qué sucede: por ejemplo, 'El enlace de Google Drive pide acceso y no es público', o 'Al descomprimir el archivo OBB marca error de CRC en la parte 2'..."
              className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none resize-none"
            />
          </div>

          {/* Optional Additional Info */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">
              4. Información Adicional (Opcional)
            </label>
            <input
              type="text"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Ej. Probado en Samsung Galaxy S23 con Android 14"
              className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-purple-900/30 flex items-center justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 via-rose-600 to-pink-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-purple-900/50 hover:opacity-95 transition-all"
            >
              <Send className="h-4 w-4" />
              <span>{isSubmitting ? 'Enviando reporte...' : 'Enviar Reporte a Moderación'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: HISTORIAL DE REPORTES Y ESTADO */}
      {activeTab === 'my-reports' && (
        <div className="space-y-4">
          {myReports.length > 0 ? (
            myReports.map((rep) => {
              const status = statusConfig[rep.status] || statusConfig.pendiente;
              const StatusIcon = status.icon;
              const formattedDate = new Date(rep.createdAt).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={rep.id}
                  className="rounded-2xl border border-purple-900/40 bg-[#121323] p-5 shadow-lg shadow-purple-950/30 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-900/30 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-purple-400">ID: {rep.id}</span>
                        <span className="text-[11px] text-gray-500">• {formattedDate}</span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                        {rep.publicationTitle}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${status.color}`}
                      >
                        <StatusIcon className="h-3.5 w-3.5" />
                        <span>{status.label}</span>
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-300">
                    <span className="text-gray-400 block mb-1">
                      Motivo: <strong className="text-white">{reportTypeLabels[rep.reportType]?.label || rep.reportType}</strong>
                    </span>
                    <p className="rounded-xl bg-[#0e0f1c] p-3 text-xs text-gray-300 leading-relaxed whitespace-pre-line border border-purple-950">
                      {rep.description}
                    </p>
                  </div>

                  {/* Admin notes if resolved or reviewed */}
                  {rep.adminNotes && (
                    <div className="rounded-xl border border-purple-600/30 bg-purple-950/40 p-3 text-xs text-purple-200">
                      <strong className="text-pink-400 block mb-0.5">Respuesta de la Administración:</strong>
                      <p>{rep.adminNotes}</p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="rounded-3xl border border-dashed border-purple-900/50 bg-[#111221] p-12 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-purple-400 mb-3" />
              <h3 className="text-base font-bold text-white">No tienes reportes activos</h3>
              <p className="mt-1 text-xs text-gray-400">
                Cuando reportes un enlace caído o archivo defectuoso, aquí podrás seguir el estado de resolución en tiempo real.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('create')}
                className="mt-4 rounded-xl bg-purple-700 px-4 py-2 text-xs font-bold text-white hover:bg-purple-600"
              >
                Hacer un reporte ahora
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
