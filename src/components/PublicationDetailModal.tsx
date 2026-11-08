import React, { useState } from 'react';
import { Publication } from '../types';
import {
  X,
  Download,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  HardDrive,
  Cpu,
  Layers,
  Terminal,
  FileCode,
  Calendar,
  User,
  ShieldCheck,
  Smartphone,
  Monitor,
  FolderArchive,
  Info,
} from 'lucide-react';

interface PublicationDetailModalProps {
  publication: Publication;
  onClose: () => void;
  onOpenReport: (pub: Publication) => void;
}

export const PublicationDetailModal: React.FC<PublicationDetailModalProps> = ({
  publication,
  onClose,
  onOpenReport,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyCode = () => {
    if (publication.scriptCode) {
      navigator.clipboard.writeText(publication.scriptCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const formattedDate = new Date(publication.createdAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const links = publication.downloadLinks || {};
  const additionalFiles = links.additionalFiles || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative my-8 w-full max-w-4xl rounded-3xl border border-purple-800/50 bg-[#0f101f] shadow-2xl shadow-purple-950/90 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-gray-300 backdrop-blur-md border border-purple-700/40 hover:bg-pink-600 hover:text-white transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Hero / Cover */}
        <div className="relative h-64 sm:h-72 md:h-80 w-full overflow-hidden bg-[#18192d]">
          <img
            src={publication.coverImage}
            alt={publication.title}
            className="h-full w-full object-cover object-center filter brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f101f] via-[#0f101f]/60 to-transparent" />

          {/* Overlay Info */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col justify-end">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="rounded-full border border-purple-500/50 bg-purple-950/80 px-3 py-1 text-xs font-bold text-purple-300 uppercase tracking-wider backdrop-blur-md">
                {publication.type}
              </span>
              {publication.platform && (
                <span className="rounded-full border border-pink-500/50 bg-pink-950/80 px-3 py-1 text-xs font-semibold text-pink-300 uppercase backdrop-blur-md">
                  {publication.platform}
                </span>
              )}
              {publication.version && (
                <span className="rounded-full border border-indigo-500/40 bg-indigo-950/80 px-3 py-1 text-xs font-mono text-indigo-300 backdrop-blur-md">
                  {publication.version}
                </span>
              )}
              {publication.fileSize && (
                <span className="rounded-full border border-cyan-500/40 bg-cyan-950/80 px-3 py-1 text-xs font-medium text-cyan-300 backdrop-blur-md">
                  {publication.fileSize}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
              {publication.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-300">
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-purple-400" />
                <span>Por <strong className="text-white">{publication.authorName}</strong></span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-pink-400" />
                <span>{formattedDate}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-8 max-h-[60vh] overflow-y-auto">
          {/* Description */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400 mb-2">
              Descripción del Recurso
            </h3>
            <p className="text-sm sm:text-base text-gray-200 leading-relaxed whitespace-pre-line bg-[#15162a] p-4 rounded-2xl border border-purple-900/30">
              {publication.description}
            </p>
          </div>

          {/* System Requirements (if any) */}
          {publication.requirements && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400 mb-3 flex items-center gap-2">
                <Cpu className="h-4 w-4 text-pink-400" />
                Requisitos del Sistema / Compatibilidad
              </h3>
              <div className="rounded-2xl border border-purple-900/40 bg-[#141527] p-4">
                {typeof publication.requirements === 'object' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    {publication.requirements.os && (
                      <div className="rounded-xl bg-[#1c1d33] p-3 border border-purple-900/20">
                        <span className="text-gray-400 block mb-1">Sistema Operativo</span>
                        <span className="font-semibold text-white">{publication.requirements.os}</span>
                      </div>
                    )}
                    {publication.requirements.ram && (
                      <div className="rounded-xl bg-[#1c1d33] p-3 border border-purple-900/20">
                        <span className="text-gray-400 block mb-1">Memoria RAM</span>
                        <span className="font-semibold text-white">{publication.requirements.ram}</span>
                      </div>
                    )}
                    {publication.requirements.storage && (
                      <div className="rounded-xl bg-[#1c1d33] p-3 border border-purple-900/20">
                        <span className="text-gray-400 block mb-1">Almacenamiento</span>
                        <span className="font-semibold text-white">{publication.requirements.storage}</span>
                      </div>
                    )}
                    {publication.requirements.cpu && (
                      <div className="rounded-xl bg-[#1c1d33] p-3 border border-purple-900/20">
                        <span className="text-gray-400 block mb-1">Procesador</span>
                        <span className="font-semibold text-white">{publication.requirements.cpu}</span>
                      </div>
                    )}
                    {publication.requirements.gpu && (
                      <div className="rounded-xl bg-[#1c1d33] p-3 border border-purple-900/20">
                        <span className="text-gray-400 block mb-1">Tarjeta Gráfica</span>
                        <span className="font-semibold text-white">{publication.requirements.gpu}</span>
                      </div>
                    )}
                    {publication.requirements.additional && (
                      <div className="rounded-xl bg-[#1c1d33] p-3 border border-purple-900/20 sm:col-span-2 md:col-span-3">
                        <span className="text-gray-400 block mb-1">Detalles Adicionales</span>
                        <span className="font-semibold text-white">{publication.requirements.additional}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-300 leading-relaxed">{publication.requirements}</p>
                )}
              </div>
            </div>
          )}

          {/* SCRIPT / CODE SECTION (If applicable) */}
          {publication.scriptCode && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-pink-400" />
                  Código o Comando del Script
                </h3>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 rounded-lg border border-purple-700/50 bg-purple-950/70 px-3 py-1.5 text-xs font-semibold text-purple-300 hover:bg-purple-900 hover:text-white transition-all"
                >
                  {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedCode ? '¡Copiado!' : 'Copiar comando'}</span>
                </button>
              </div>

              <div className="relative rounded-2xl border border-purple-900/60 bg-[#090a12] p-4 font-mono text-xs text-purple-200 overflow-x-auto shadow-inner">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-purple-950 text-[11px] text-gray-500">
                  <span>{publication.scriptLanguage ? publication.scriptLanguage.toUpperCase() : 'BASH / SHELL'}</span>
                  <span>Terminal</span>
                </div>
                <pre className="whitespace-pre">{publication.scriptCode}</pre>
              </div>
            </div>
          )}

          {/* DOWNLOAD & ACCESS BUTTONS (ORGANIZED BY TYPE) */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-pink-400 mb-3 flex items-center gap-2">
              <Download className="h-4 w-4 text-pink-400" />
              Enlaces de Descarga y Acceso Directo
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* APK Button */}
              {links.apkUrl && (
                <a
                  href={links.apkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-2xl border border-purple-600/40 bg-gradient-to-r from-purple-950/80 to-[#1b1c36] p-4 text-white hover:border-pink-500 hover:shadow-lg hover:shadow-purple-950 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/30 text-purple-300 group-hover:bg-pink-600/30 group-hover:text-pink-300 transition-colors">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Descargar APK</div>
                      <div className="text-[11px] text-gray-400">Instalador para Android</div>
                    </div>
                  </div>
                  <Download className="h-5 w-5 text-purple-400 group-hover:text-pink-400 transform group-hover:translate-y-0.5 transition-transform" />
                </a>
              )}

              {/* DATA Button */}
              {links.dataUrl && (
                <a
                  href={links.dataUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-2xl border border-purple-600/40 bg-gradient-to-r from-purple-950/80 to-[#1b1c36] p-4 text-white hover:border-pink-500 hover:shadow-lg hover:shadow-purple-950 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/30 text-purple-300 group-hover:bg-pink-600/30 group-hover:text-pink-300 transition-colors">
                      <Layers className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Descargar DATA</div>
                      <div className="text-[11px] text-gray-400">Archivos /data para el juego</div>
                    </div>
                  </div>
                  <Download className="h-5 w-5 text-purple-400 group-hover:text-pink-400 transform group-hover:translate-y-0.5 transition-transform" />
                </a>
              )}

              {/* OBB Button */}
              {links.obbUrl && (
                <a
                  href={links.obbUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-2xl border border-purple-600/40 bg-gradient-to-r from-purple-950/80 to-[#1b1c36] p-4 text-white hover:border-pink-500 hover:shadow-lg hover:shadow-purple-950 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/30 text-purple-300 group-hover:bg-pink-600/30 group-hover:text-pink-300 transition-colors">
                      <FolderArchive className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Descargar OBB</div>
                      <div className="text-[11px] text-gray-400">Datos principales Android /obb</div>
                    </div>
                  </div>
                  <Download className="h-5 w-5 text-purple-400 group-hover:text-pink-400 transform group-hover:translate-y-0.5 transition-transform" />
                </a>
              )}

              {/* ISO Button (Port / Emulator) */}
              {links.isoUrl && (
                <a
                  href={links.isoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-2xl border border-pink-600/50 bg-gradient-to-r from-pink-950/60 to-[#221731] p-4 text-white hover:border-purple-400 hover:shadow-lg hover:shadow-pink-950 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-600/30 text-pink-300 transition-colors">
                      <HardDrive className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Descargar ISO (Rom / Datos)</div>
                      <div className="text-[11px] text-pink-300">Imagen de disco / Emulación</div>
                    </div>
                  </div>
                  <Download className="h-5 w-5 text-pink-400 transform group-hover:translate-y-0.5 transition-transform" />
                </a>
              )}

              {/* PC Version Button */}
              {links.pcUrl && (
                <a
                  href={links.pcUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-2xl border border-indigo-600/40 bg-gradient-to-r from-indigo-950/70 to-[#181a33] p-4 text-white hover:border-indigo-400 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/30 text-indigo-300 transition-colors">
                      <Monitor className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Descargar para PC</div>
                      <div className="text-[11px] text-gray-400">Windows / Setup instalador</div>
                    </div>
                  </div>
                  <Download className="h-5 w-5 text-indigo-400 transform group-hover:translate-y-0.5 transition-transform" />
                </a>
              )}

              {/* Web Page Button */}
              {links.webUrl && (
                <a
                  href={links.webUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-2xl border border-cyan-600/40 bg-gradient-to-r from-cyan-950/70 to-[#142333] p-4 text-white hover:border-cyan-400 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-600/30 text-cyan-300 transition-colors">
                      <ExternalLink className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Abrir Página Web</div>
                      <div className="text-[11px] text-gray-400">Acceso online directo</div>
                    </div>
                  </div>
                  <ExternalLink className="h-5 w-5 text-cyan-400 transform group-hover:translate-x-0.5 transition-transform" />
                </a>
              )}

              {/* Primary Download (if no specific breakdown matches or as fallback) */}
              {links.primaryUrl &&
                !links.apkUrl &&
                !links.isoUrl &&
                !links.pcUrl &&
                !links.webUrl && (
                  <a
                    href={links.primaryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-2xl border border-purple-500/50 bg-gradient-to-r from-purple-900/60 to-pink-900/40 p-4 text-white hover:shadow-lg hover:shadow-purple-900/50 transition-all group sm:col-span-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/40 text-purple-200">
                        <Download className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">Descargar Recurso Principal</div>
                        <div className="text-[11px] text-purple-200">
                          {links.primaryType === 'drive' ? 'Google Drive Compartido' : 'Enlace Directo Verificado'}
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="h-5 w-5 text-pink-400" />
                  </a>
                )}
            </div>

            {/* Additional Files List */}
            {additionalFiles.length > 0 && (
              <div className="mt-4 pt-4 border-t border-purple-900/30">
                <h4 className="text-xs font-semibold text-gray-300 mb-2">Archivos Adicionales y Complementos:</h4>
                <div className="space-y-2">
                  {additionalFiles.map((f, i) => (
                    <div
                      key={f.id || i}
                      className="flex items-center justify-between rounded-xl bg-[#141527] p-3 border border-purple-900/30"
                    >
                      <div className="flex items-center gap-2">
                        <FileCode className="h-4 w-4 text-purple-400" />
                        <span className="text-xs font-medium text-white">{f.name}</span>
                      </div>
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg bg-purple-900/60 px-3 py-1 text-xs font-semibold text-purple-200 hover:bg-purple-800 hover:text-white"
                      >
                        <Download className="h-3 w-3" />
                        Descargar
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          {publication.instructions && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400 mb-2 flex items-center gap-2">
                <Info className="h-4 w-4 text-purple-400" />
                Instrucciones de Instalación y Uso
              </h3>
              <div className="rounded-2xl border border-purple-900/40 bg-[#121323] p-4 text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                {publication.instructions}
              </div>
            </div>
          )}

          {/* Report Button */}
          <div className="pt-4 border-t border-purple-900/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
            <span>¿Encontraste un problema con este enlace o archivo?</span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenReport(publication);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-600/40 bg-amber-950/30 px-3.5 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-950/60 hover:text-amber-200 transition-colors"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              <span>Reportar este recurso</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
