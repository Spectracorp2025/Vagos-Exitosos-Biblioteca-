import React, { useState, useMemo } from 'react';
import { Publication, PublicationType } from '../types';
import { PublicationCard } from '../components/PublicationCard';
import {
  Search,
  Filter,
  Gamepad2,
  Wrench,
  Code2,
  Globe,
  FileText,
  Smartphone,
  Monitor,
  HardDrive,
  Sparkles,
  X,
  PlusCircle,
} from 'lucide-react';

interface LibraryViewProps {
  publications: Publication[];
  onSelectPublication: (pub: Publication) => void;
  onNavigate: (section: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  publications,
  onSelectPublication,
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('todos');

  const categories = [
    { id: 'todos', label: 'Todos', icon: Sparkles },
    { id: 'videojuego', label: 'Videojuegos', icon: Gamepad2 },
    { id: 'aplicacion', label: 'Aplicaciones', icon: Smartphone },
    { id: 'herramienta', label: 'Herramientas', icon: Wrench },
    { id: 'script', label: 'Scripts / Comandos', icon: Code2 },
    { id: 'pagina_web', label: 'Páginas Web', icon: Globe },
    { id: 'archivo', label: 'Archivos', icon: FileText },
  ];

  const platforms = [
    { id: 'todos', label: 'Todas las plataformas' },
    { id: 'android', label: 'Android' },
    { id: 'pc', label: 'PC / Windows' },
    { id: 'port', label: 'Port / ISO Móvil' },
    { id: 'web', label: 'Online / Web' },
  ];

  // Dynamic search and filter
  const filteredPublications = useMemo(() => {
    return publications.filter((pub) => {
      // Must be active
      if (pub.status === 'hidden' || pub.status === 'deleted') return false;

      // Category filter
      if (selectedCategory !== 'todos' && pub.type !== selectedCategory) {
        return false;
      }

      // Platform filter
      if (selectedPlatform !== 'todos') {
        const pubPlat = (pub.platform || '').toLowerCase();
        if (!pubPlat.includes(selectedPlatform)) {
          return false;
        }
      }

      // Realtime search query (matches title, description, author, script language)
      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase();
        const matchesTitle = pub.title.toLowerCase().includes(q);
        const matchesDesc = pub.description.toLowerCase().includes(q);
        const matchesAuthor = pub.authorName.toLowerCase().includes(q);
        const matchesPlat = (pub.platform || '').toLowerCase().includes(q);
        return matchesTitle || matchesDesc || matchesAuthor || matchesPlat;
      }

      return true;
    });
  }, [publications, selectedCategory, selectedPlatform, searchTerm]);

  return (
    <div className="space-y-6 pb-16">
      {/* Header and Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex h-2 w-2 rounded-full bg-purple-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
              Catálogo General
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Biblioteca Digital Vagos Exitosos
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-300">
            Explora todos los aportes de la comunidad: roms, APKs, emuladores, scripts y utilidades.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('publicar')}
          className="inline-flex items-center gap-2 self-start rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-900/40 hover:opacity-95 transition-all"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Compartir Recurso</span>
        </button>
      </div>

      {/* Dynamic Search Bar & Quick Filters */}
      <div className="rounded-2xl border border-purple-900/40 bg-[#121323] p-4 shadow-xl shadow-purple-950/40 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por juego, aplicación, herramienta, comando o autor..."
            className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] py-3.5 pl-12 pr-10 text-sm text-white placeholder-gray-400 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-950'
                    : 'bg-[#18192f] text-gray-300 hover:text-white hover:bg-purple-950/50 border border-purple-900/30'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-white' : 'text-purple-400'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Platform Sub-Filters */}
        <div className="flex items-center gap-2 pt-2 border-t border-purple-900/30 overflow-x-auto">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <Filter className="h-3 w-3 text-purple-400" />
            Plataforma:
          </span>
          {platforms.map((plat) => (
            <button
              key={plat.id}
              type="button"
              onClick={() => setSelectedPlatform(plat.id)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all whitespace-nowrap ${
                selectedPlatform === plat.id
                  ? 'bg-purple-950 border border-pink-500/60 text-pink-300'
                  : 'bg-[#15162a] text-gray-400 hover:text-gray-200 border border-transparent'
              }`}
            >
              {plat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count & Current Active Filter Summary */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>
          Mostrando <strong className="text-white">{filteredPublications.length}</strong> recursos
          {searchTerm && ` para "${searchTerm}"`}
        </span>
        {(searchTerm || selectedCategory !== 'todos' || selectedPlatform !== 'todos') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('todos');
              setSelectedPlatform('todos');
            }}
            className="text-pink-400 hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Grid of Publications */}
      {filteredPublications.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPublications.map((pub) => (
            <PublicationCard
              key={pub.id}
              publication={pub}
              onClick={() => onSelectPublication(pub)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-purple-900/60 bg-[#111221] p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-950/60 text-purple-400 mb-4 border border-purple-800/40">
            <Search className="h-7 w-7 text-pink-400" />
          </div>
          <h3 className="text-base font-bold text-white">
            {publications.length === 0 ? 'Biblioteca vacía y lista para publicar' : 'No se encontraron recursos'}
          </h3>
          <p className="mt-1 text-xs text-gray-400 max-w-md mx-auto">
            {publications.length === 0
              ? 'Se han retirado todas las publicaciones de prueba. Comparte el primer videojuego, aplicación, herramienta o script para inaugurar el catálogo.'
              : 'No hay publicaciones que coincidan con tus criterios de búsqueda o filtros seleccionados.'}
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            {publications.length > 0 && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('todos');
                  setSelectedPlatform('todos');
                }}
                className="rounded-xl border border-purple-700/50 bg-[#16172d] px-4 py-2 text-xs font-semibold text-gray-200 hover:text-white"
              >
                Restablecer filtros
              </button>
            )}
            <button
              onClick={() => onNavigate('publicar')}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-purple-900/40 hover:opacity-95 cursor-pointer"
            >
              Publicar Recurso Ahora
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
