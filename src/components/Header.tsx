import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, ShieldCheck, User as UserIcon, LogOut, Sparkles } from 'lucide-react';
import { NotificationsModal } from './NotificationsModal';

interface HeaderProps {
  onNavigate: (section: string) => void;
  activeSection: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, activeSection }) => {
  const { user, isAdmin, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-purple-900/30 bg-[#0a0b12]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo & Platform Name */}
          <div
            className="flex cursor-pointer items-center gap-3 transition-transform hover:scale-102"
            onClick={() => onNavigate('inicio')}
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-pink-500 p-0.5 shadow-lg shadow-purple-900/40">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0c0d17]">
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-lg font-black text-transparent">
                  VX
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-white">
                  VAGOS <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">EXITOSOS</span>
                </span>
                <span className="hidden rounded-full border border-purple-500/30 bg-purple-950/60 px-2 py-0.5 text-[10px] font-semibold text-purple-300 md:inline-block">
                  Comunidad Privada
                </span>
              </div>
              <p className="hidden text-[11px] text-gray-400 sm:block">Biblioteca Digital & Recursos Gamer</p>
            </div>
          </div>

          {/* User Welcome & Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <>
                {/* Greeting */}
                <div className="hidden text-right lg:block">
                  <div className="text-xs font-medium text-gray-400">Sesión activa</div>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-white">
                    <span>¡Hola, {user.displayName.split(' ')[0]}!</span>
                    {isAdmin && (
                      <span className="inline-flex items-center gap-0.5 rounded border border-pink-500/40 bg-pink-950/60 px-1.5 py-0.2 text-[10px] font-semibold text-pink-300">
                        <ShieldCheck className="h-3 w-3 text-pink-400" />
                        Admin
                      </span>
                    )}
                  </div>
                </div>

                {/* Notifications Button */}
                <button
                  type="button"
                  onClick={() => setShowNotifications(true)}
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-purple-900/40 bg-[#131422] text-gray-300 transition-colors hover:border-purple-600/50 hover:bg-purple-950/40 hover:text-white"
                  title="Novedades y Notificaciones"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-pink-500 ring-2 ring-[#0a0b12]" />
                </button>

                {/* User Profile Avatar / Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 rounded-xl border border-purple-900/40 bg-[#131422] p-1.5 pr-3 text-left transition-all hover:border-purple-500/50 hover:bg-purple-950/40"
                  >
                    <img
                      src={user.profileImage || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.uid)}`}
                      alt={user.displayName}
                      className="h-7 w-7 rounded-lg border border-purple-500/30 object-cover bg-purple-950"
                    />
                    <span className="hidden max-w-[100px] truncate text-xs font-semibold text-white sm:inline-block">
                      {user.displayName}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div
                      className="absolute right-0 mt-2 w-56 rounded-2xl border border-purple-900/60 bg-[#121324] p-2 shadow-2xl shadow-purple-950/80 z-50 animate-in fade-in slide-in-from-top-2"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <div className="border-b border-purple-900/30 px-3 py-2">
                        <p className="truncate text-sm font-bold text-white">{user.displayName}</p>
                        <p className="text-[11px] text-purple-400 capitalize">{user.role === 'admin' ? 'Administrador' : 'Miembro'}</p>
                      </div>

                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() => onNavigate('perfil')}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-gray-300 hover:bg-purple-900/30 hover:text-white"
                        >
                          <UserIcon className="h-4 w-4 text-purple-400" />
                          Mi Perfil y Estadísticas
                        </button>

                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => onNavigate('admin')}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-pink-300 hover:bg-pink-950/40 hover:text-pink-200"
                          >
                            <ShieldCheck className="h-4 w-4 text-pink-400" />
                            Panel de Administración
                          </button>
                        )}
                      </div>

                      <div className="border-t border-purple-900/30 pt-1">
                        <button
                          type="button"
                          onClick={logout}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/30 hover:text-rose-300"
                        >
                          <LogOut className="h-4 w-4" />
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate('auth')}
                  className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-purple-900/40 hover:opacity-95"
                >
                  Entrar a la Comunidad
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Notifications Modal */}
      {showNotifications && (
        <NotificationsModal
          onClose={() => setShowNotifications(false)}
          onNavigate={(sec) => {
            setShowNotifications(false);
            onNavigate(sec);
          }}
        />
      )}
    </>
  );
};
