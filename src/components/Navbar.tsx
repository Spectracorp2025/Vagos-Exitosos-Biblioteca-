import React from 'react';
import { Home, Compass, PlusCircle, AlertOctagon, Info, Shield, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeSection, onNavigate }) => {
  const { user, isAdmin } = useAuth();

  const navItems = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'biblioteca', label: 'Biblioteca', icon: Compass },
    { id: 'publicar', label: 'Publicar', icon: PlusCircle, highlight: true },
    { id: 'reportes', label: 'Reportes', icon: AlertOctagon },
    { id: 'informacion', label: 'Información', icon: Info },
  ];

  return (
    <>
      {/* DESKTOP NAVIGATION BAR (Under Header) */}
      <nav className="hidden border-b border-purple-900/20 bg-[#0d0e1a]/80 backdrop-blur-md md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1 py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/20 text-white border border-purple-500/40 shadow-sm shadow-purple-950'
                      : item.highlight
                      ? 'text-pink-400 hover:text-pink-300 hover:bg-pink-950/20'
                      : 'text-gray-400 hover:bg-purple-950/30 hover:text-gray-200'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-pink-400' : ''}`} />
                  <span>{item.label}</span>
                  {item.highlight && !isActive && (
                    <span className="flex h-1.5 w-1.5 rounded-full bg-pink-500 animate-pulse" />
                  )}
                </button>
              );
            })}

            {isAdmin && (
              <button
                type="button"
                onClick={() => onNavigate('admin')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  activeSection === 'admin'
                    ? 'bg-gradient-to-r from-pink-600/40 to-purple-600/30 text-white border border-pink-500/50 shadow-sm'
                    : 'text-pink-400 hover:bg-pink-950/30 hover:text-pink-300'
                }`}
              >
                <Shield className="h-4 w-4 text-pink-400" />
                <span>Panel Admin</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 py-2 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[11px] font-medium text-emerald-400">Servidores Activos</span>
            </span>
          </div>
        </div>
      </nav>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-purple-900/40 bg-[#0c0d18]/95 px-2 py-1.5 backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center justify-center rounded-xl px-2.5 py-1 transition-all ${
                  isActive ? 'text-pink-400 scale-105' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
                    item.highlight && !isActive
                      ? 'bg-purple-950/60 text-purple-400 border border-purple-800/40'
                      : isActive
                      ? 'bg-gradient-to-tr from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-900/50'
                      : ''
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className="mt-0.5 text-[10px] font-semibold">{item.label}</span>
              </button>
            );
          })}

          {/* Quick Profile / Auth for mobile */}
          <button
            type="button"
            onClick={() => onNavigate(user ? 'perfil' : 'auth')}
            className={`flex flex-col items-center justify-center rounded-xl px-2.5 py-1 transition-all ${
              activeSection === 'perfil' || activeSection === 'auth'
                ? 'text-pink-400 scale-105'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                activeSection === 'perfil'
                  ? 'bg-gradient-to-tr from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-900/50'
                  : ''
              }`}
            >
              <User className="h-4 w-4" />
            </div>
            <span className="mt-0.5 text-[10px] font-semibold">{user ? 'Perfil' : 'Ingresar'}</span>
          </button>
        </div>
      </nav>
    </>
  );
};
