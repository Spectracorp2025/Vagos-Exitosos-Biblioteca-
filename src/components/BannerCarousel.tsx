import React, { useState, useEffect } from 'react';
import { Publication } from '../types';
import { ChevronLeft, ChevronRight, Eye, Sparkles, Flame } from 'lucide-react';

interface BannerCarouselProps {
  publications: Publication[];
  onSelectPublication: (pub: Publication) => void;
  onNavigate?: (section: string) => void;
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({
  publications,
  onSelectPublication,
  onNavigate,
}) => {
  const featured = publications.filter((p) => p.featured || p.status === 'active').slice(0, 5);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto rotate carousel every 6 seconds
  useEffect(() => {
    if (featured.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featured.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [featured.length]);

  if (featured.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-purple-800/40 bg-gradient-to-br from-[#121323] via-[#101124] to-[#1d1430] p-8 sm:p-12 text-center shadow-2xl shadow-purple-950/50">
        <div className="relative z-10 max-w-xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/40 bg-pink-950/60 px-3.5 py-1 text-xs font-bold text-pink-300">
            <Sparkles className="h-4 w-4 text-pink-400" />
            <span>Biblioteca Limpia y Lista</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            ¡Espacio Listo para tu Primera Publicación!
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            Se han retirado todas las publicaciones de prueba. Este banner destacará los mejores videojuegos, aplicaciones, roms y herramientas que compartas con la comunidad.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('publicar')}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-purple-900/60 hover:scale-102 transition-all cursor-pointer"
            >
              <Flame className="h-4 w-4" />
              <span>Publicar Primer Recurso</span>
            </button>
          </div>
        </div>
        {/* Glow ambient */}
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-pink-600/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />
      </div>
    );
  }

  const current = featured[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + featured.length) % featured.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % featured.length);
  };

  const categoryLabels: Record<string, string> = {
    videojuego: 'Videojuego',
    aplicacion: 'Aplicación',
    pagina_web: 'Página Web',
    herramienta: 'Herramienta',
    archivo: 'Archivo',
    script: 'Script / Comando',
    otro: 'Recurso Digital',
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-purple-900/50 bg-[#121323] shadow-2xl shadow-purple-950/60">
      {/* Background Cover Image with Gradient Mask */}
      <div className="relative h-72 sm:h-80 md:h-96 w-full overflow-hidden">
        <img
          src={current.coverImage}
          alt={current.title}
          className="h-full w-full object-cover object-center filter brightness-65 transition-all duration-700 ease-out transform scale-102 hover:scale-105"
        />

        {/* Gradient Overlays for tech & gaming aesthetic */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b12] via-[#0e0f1e]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0b12] via-purple-950/40 to-transparent" />

        {/* Content Box */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-10 flex flex-col justify-end max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 rounded-full border border-pink-500/50 bg-pink-950/80 px-3 py-1 text-xs font-bold text-pink-300 backdrop-blur-md">
              <Flame className="h-3.5 w-3.5 text-pink-400" />
              Novedad Destacada
            </span>
            <span className="rounded-full border border-purple-500/40 bg-purple-950/70 px-3 py-1 text-xs font-medium text-purple-300 backdrop-blur-md">
              {categoryLabels[current.type] || current.type}
            </span>
            {current.platform && (
              <span className="rounded-full border border-indigo-500/40 bg-indigo-950/70 px-3 py-1 text-xs font-medium text-indigo-300 uppercase">
                {current.platform}
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight line-clamp-2 drop-shadow-md">
            {current.title}
          </h2>

          <p className="mt-2 text-xs sm:text-sm text-gray-300 line-clamp-2 max-w-2xl leading-relaxed">
            {current.description}
          </p>

          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              onClick={() => onSelectPublication(current)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-purple-900/60 transition-all hover:scale-102 hover:shadow-purple-700/80 active:scale-98"
            >
              <Eye className="h-4 w-4" />
              <span>Ver publicación</span>
            </button>
            <span className="text-xs text-gray-400 hidden sm:inline-block">
              Compartido por <strong className="text-white">{current.authorName}</strong>
            </span>
          </div>
        </div>

        {/* Navigation Arrows */}
        {featured.length > 1 && (
          <div className="absolute bottom-6 right-6 hidden items-center gap-2 sm:flex z-10">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Anterior recurso"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-700/40 bg-[#121323]/80 text-white backdrop-blur-md transition-all hover:bg-purple-900/60 hover:border-purple-500"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Siguiente recurso"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-700/40 bg-[#121323]/80 text-white backdrop-blur-md transition-all hover:bg-purple-900/60 hover:border-purple-500"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Indicator Dots */}
        {featured.length > 1 && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 backdrop-blur-md border border-purple-900/40">
            {featured.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentIndex(i)}
                aria-label={`Ir al banner ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  currentIndex === i ? 'w-5 bg-pink-400' : 'w-1.5 bg-gray-600 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
