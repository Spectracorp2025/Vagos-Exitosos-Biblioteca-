import React, { useState } from 'react';
import { Publication } from '../types';
import { useAuth } from '../context/AuthContext';
import { BannerCarousel } from '../components/BannerCarousel';
import { QuickActions } from '../components/QuickActions';
import { PublicationCard } from '../components/PublicationCard';
import { Compass, Sparkles, Flame, ShieldAlert, ArrowRight, Zap, Users, DownloadCloud } from 'lucide-react';

interface HomeViewProps {
  publications: Publication[];
  onSelectPublication: (pub: Publication) => void;
  onNavigate: (section: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  publications,
  onSelectPublication,
  onNavigate,
}) => {
  const { user } = useAuth();
  const [filterType, setFilterType] = useState<string>('todos');

  const recentPublications = publications
    .filter((p) => p.status === 'active')
    .filter((p) => (filterType === 'todos' ? true : p.type === filterType))
    .slice(0, 6);

  return (
    <div className="space-y-8 sm:space-y-10 pb-16">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-800/40 bg-gradient-to-r from-[#141527] via-[#101121] to-[#19152b] p-6 sm:p-8 shadow-xl shadow-purple-950/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-2 w-2 rounded-full bg-pink-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-pink-400">
                Plataforma Digital Vagos Exitosos
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {user ? `¡Hola, ${user.displayName}! Bienvenido al Nexo.` : '¡Bienvenido a Vagos Exitosos!'}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
              Tu comunidad privada para descubrir, descargar y compartir videojuegos optimizados, APKs, emuladores, scripts, herramientas y páginas web.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('publicar')}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-purple-900/50 hover:opacity-95 hover:scale-102 transition-all"
            >
              <Zap className="h-4 w-4" />
              <span>Publicar Recurso</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('biblioteca')}
              className="inline-flex items-center gap-2 rounded-2xl border border-purple-700/50 bg-[#16172d] px-5 py-3 text-xs sm:text-sm font-semibold text-gray-200 hover:border-purple-400 hover:text-white transition-all"
            >
              <Compass className="h-4 w-4 text-purple-400" />
              <span>Explorar Todo</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-pink-600/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />
      </div>

      {/* 1. Featured Banner Carousel */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-pink-400" />
            <h2 className="text-lg font-black text-white tracking-tight">Novedades y Destacados</h2>
          </div>
          <span className="text-xs text-purple-400">Actualizado recientemente</span>
        </div>
        <BannerCarousel
          publications={publications}
          onSelectPublication={onSelectPublication}
          onNavigate={onNavigate}
        />
      </section>

      {/* 2. Direct Shortcuts (Accesos Directos) */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-purple-400" />
          <h2 className="text-lg font-black text-white tracking-tight">Accesos Directos</h2>
        </div>
        <QuickActions onNavigate={onNavigate} />
      </section>

      {/* 3. Recent Publications Section */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-pink-400" />
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">Publicaciones Recientes</h2>
              <p className="text-xs text-gray-400">Aportes compartidos por los miembros del grupo</p>
            </div>
          </div>

          {/* Quick Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['todos', 'videojuego', 'aplicacion', 'herramienta', 'script'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterType(cat)}
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                  filterType === cat
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-950'
                    : 'bg-[#141527] text-gray-400 hover:text-white hover:bg-purple-950/40 border border-purple-900/30'
                }`}
              >
                {cat === 'todos' ? 'Todos' : cat}
              </button>
            ))}
          </div>
        </div>

        {recentPublications.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentPublications.map((pub) => (
              <PublicationCard
                key={pub.id}
                publication={pub}
                onClick={() => onSelectPublication(pub)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-purple-900/50 bg-[#111221] p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-950/60 text-purple-400 mb-3 border border-purple-800/40">
              <Compass className="h-7 w-7 text-pink-400" />
            </div>
            <h3 className="text-base font-bold text-white">Biblioteca vacía y lista</h3>
            <p className="mt-1 text-xs text-gray-400 max-w-md mx-auto">
              Se han quitado todas las publicaciones de prueba. La plataforma está 100% limpia para que tú y los miembros de Vagos Exitosos comiencen a compartir sus propios aportes reales.
            </p>
            <button
              onClick={() => onNavigate('publicar')}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-900/50 hover:opacity-95 cursor-pointer"
            >
              <Zap className="h-4 w-4" />
              <span>Publicar el primer recurso</span>
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => onNavigate('biblioteca')}
            className="inline-flex items-center gap-2 rounded-xl border border-purple-800/40 bg-[#131427] px-6 py-2.5 text-xs font-bold text-gray-200 hover:border-pink-500 hover:text-white transition-all shadow-md"
          >
            <span>Ver toda la Biblioteca Digital ({publications.length} recursos)</span>
            <ArrowRight className="h-4 w-4 text-pink-400" />
          </button>
        </div>
      </section>

      {/* Community Stats Footer Strip */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-purple-900/30">
        <div className="rounded-2xl border border-purple-900/30 bg-[#111220] p-4 text-center">
          <DownloadCloud className="mx-auto h-5 w-5 text-purple-400 mb-1" />
          <div className="text-xl font-black text-white">{publications.length}</div>
          <div className="text-[11px] text-gray-400">Recursos Disponibles</div>
        </div>
        <div className="rounded-2xl border border-purple-900/30 bg-[#111220] p-4 text-center">
          <Zap className="mx-auto h-5 w-5 text-pink-400 mb-1" />
          <div className="text-xl font-black text-white">7+</div>
          <div className="text-[11px] text-gray-400">Categorías Digitales</div>
        </div>
        <div className="rounded-2xl border border-purple-900/30 bg-[#111220] p-4 text-center">
          <Users className="mx-auto h-5 w-5 text-cyan-400 mb-1" />
          <div className="text-xl font-black text-white">100%</div>
          <div className="text-[11px] text-gray-400">Comunidad Privada</div>
        </div>
        <div className="rounded-2xl border border-purple-900/30 bg-[#111220] p-4 text-center">
          <Flame className="mx-auto h-5 w-5 text-amber-400 mb-1" />
          <div className="text-xl font-black text-white">24/7</div>
          <div className="text-[11px] text-gray-400">Acceso Ininterrumpido</div>
        </div>
      </section>
    </div>
  );
};
