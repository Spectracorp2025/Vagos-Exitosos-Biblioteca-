import React from 'react';
import { Publication } from '../types';
import { Download, Gamepad2, Wrench, Code2, Globe, FileText, Sparkles, Smartphone, Monitor } from 'lucide-react';

interface PublicationCardProps {
  publication: Publication;
  onClick: () => void;
}

export const PublicationCard: React.FC<PublicationCardProps> = ({ publication, onClick }) => {
  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'videojuego':
        return Gamepad2;
      case 'herramienta':
        return Wrench;
      case 'script':
        return Code2;
      case 'pagina_web':
        return Globe;
      default:
        return FileText;
    }
  };

  const CategoryIcon = getCategoryIcon(publication.type);

  const categoryLabels: Record<string, string> = {
    videojuego: 'Videojuego',
    aplicacion: 'Aplicación',
    pagina_web: 'Página Web',
    herramienta: 'Herramienta',
    archivo: 'Archivo',
    script: 'Script',
    otro: 'Digital',
  };

  const formattedDate = new Date(publication.createdAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-purple-900/40 bg-[#121323] transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/60 hover:shadow-xl hover:shadow-purple-950/60 cursor-pointer"
    >
      {/* Cover Image Container */}
      <div className="relative h-44 w-full overflow-hidden bg-[#18192d]">
        <img
          src={publication.coverImage}
          alt={publication.title}
          loading="lazy"
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-108"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121323] via-transparent to-transparent opacity-90" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/40 bg-[#0c0d18]/80 px-2.5 py-0.5 text-[11px] font-semibold text-purple-300 backdrop-blur-md">
            <CategoryIcon className="h-3 w-3 text-pink-400" />
            {categoryLabels[publication.type] || publication.type}
          </span>

          {publication.platform && (
            <span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-950/80 px-2.5 py-0.5 text-[10px] font-medium text-indigo-300 uppercase backdrop-blur-md">
              {publication.platform === 'android' ? (
                <Smartphone className="h-3 w-3" />
              ) : (
                <Monitor className="h-3 w-3" />
              )}
              {publication.platform}
            </span>
          )}
        </div>

        {/* Version or Size Pill */}
        {(publication.version || publication.fileSize) && (
          <div className="absolute bottom-2 right-3">
            <span className="rounded-md border border-purple-800/40 bg-purple-950/90 px-2 py-0.5 text-[10px] font-mono text-purple-200 backdrop-blur-md">
              {publication.version || publication.fileSize}
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1 group-hover:text-pink-300 transition-colors">
            {publication.title}
          </h3>
          <p className="mt-1.5 text-xs text-gray-400 line-clamp-2 leading-relaxed">
            {publication.description}
          </p>
        </div>

        {/* Card Footer: Author and Date */}
        <div className="mt-4 pt-3 border-t border-purple-900/30 flex items-center justify-between text-[11px] text-gray-400">
          <div className="flex items-center gap-1.5 truncate max-w-[65%]">
            <span className="h-2 w-2 rounded-full bg-purple-500" />
            <span className="truncate text-gray-300 font-medium">{publication.authorName}</span>
          </div>
          <span className="text-gray-400">{formattedDate}</span>
        </div>
      </div>
    </div>
  );
};
