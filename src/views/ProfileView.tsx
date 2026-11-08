import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Publication, Report } from '../types';
import { authApi } from '../services/api';
import { firestoreService } from '../services/firestoreService';
import { PublicationCard } from '../components/PublicationCard';
import {
  User as UserIcon,
  Phone,
  Calendar,
  Lock,
  Edit3,
  LogOut,
  UploadCloud,
  AlertOctagon,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Trash2,
} from 'lucide-react';

interface ProfileViewProps {
  publications: Publication[];
  onSelectPublication: (pub: Publication) => void;
  onNavigate: (section: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  publications,
  onSelectPublication,
  onNavigate,
}) => {
  const { user, isAdmin, logout, updateUserProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'pubs' | 'security' | 'edit'>('pubs');

  // Edit Name & Avatar State
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!user) {
    return (
      <div className="rounded-3xl border border-purple-900/50 bg-[#111222] p-12 text-center max-w-md mx-auto space-y-4">
        <UserIcon className="mx-auto h-12 w-12 text-purple-400" />
        <h2 className="text-lg font-bold text-white">No has iniciado sesión</h2>
        <p className="text-xs text-gray-400">Inicia sesión con tu número de WhatsApp para acceder a tu perfil y estadísticas.</p>
        <button
          onClick={() => onNavigate('auth')}
          className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg"
        >
          Iniciar Sesión
        </button>
      </div>
    );
  }

  // Filter user's own publications
  const myPublications = publications.filter((p) => p.authorId === user.uid || p.authorName === user.displayName);

  // Formatted date
  const registrationDate = new Date(user.createdAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setStatusMessage(null);
    try {
      await updateUserProfile(displayName, profileImage);
      setStatusMessage({ type: 'success', text: '¡Perfil actualizado correctamente!' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error al actualizar perfil.' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPass(true);
    setStatusMessage(null);
    try {
      await authApi.changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      setStatusMessage({ type: 'success', text: '¡Contraseña cambiada exitosamente!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error al cambiar contraseña.' });
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleDeleteMyPub = async (pubId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de que deseas eliminar este aporte?')) {
      await firestoreService.deletePublication(pubId);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-16">
      {/* User Hero Profile Card */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-800/40 bg-gradient-to-r from-[#141527] via-[#111223] to-[#1a1630] p-6 sm:p-8 shadow-2xl shadow-purple-950/40">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <img
              src={user.profileImage || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.uid)}`}
              alt={user.displayName}
              className="h-24 w-24 rounded-3xl border-2 border-purple-500/60 object-cover bg-purple-950 shadow-xl"
            />
            {isAdmin && (
              <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-xl bg-pink-600 text-white shadow-md">
                <ShieldCheck className="h-4 w-4" />
              </span>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">{user.displayName}</h1>
              <span className="rounded-full border border-purple-500/30 bg-purple-950/60 px-2.5 py-0.5 text-[10px] font-bold text-purple-300 capitalize">
                {user.role === 'admin' ? 'Administrador' : 'Miembro Oficial'}
              </span>
            </div>

            <p className="text-xs text-gray-400 flex items-center justify-center sm:justify-start gap-1.5 pt-1">
              <Calendar className="h-3.5 w-3.5 text-pink-400" />
              <span>Miembro desde: {registrationDate}</span>
            </p>

            {user.phoneNumber && (
              <p className="text-xs text-purple-300/80 flex items-center justify-center sm:justify-start gap-1.5">
                <Phone className="h-3.5 w-3.5 text-purple-400" />
                <span>WhatsApp: {user.phoneNumber} (Solo visible para ti)</span>
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-800/40 bg-rose-950/30 px-4 py-2.5 text-xs font-bold text-rose-300 hover:bg-rose-900/40 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-6 pt-6 border-t border-purple-900/30 grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
          <div className="rounded-xl bg-[#0c0d18] p-3 border border-purple-950">
            <div className="text-lg font-black text-white">{myPublications.length}</div>
            <div className="text-[11px] text-gray-400">Aportes Publicados</div>
          </div>
          <div className="rounded-xl bg-[#0c0d18] p-3 border border-purple-950">
            <div className="text-lg font-black text-pink-400">100%</div>
            <div className="text-[11px] text-gray-400">Reputación en Grupo</div>
          </div>
          <div className="rounded-xl bg-[#0c0d18] p-3 border border-purple-950 col-span-2 sm:col-span-1">
            <div className="text-lg font-black text-emerald-400">Activo</div>
            <div className="text-[11px] text-gray-400">Estado de Membresía</div>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`rounded-2xl border p-4 text-xs sm:text-sm flex items-center gap-3 ${
            statusMessage.type === 'success'
              ? 'border-emerald-600/50 bg-emerald-950/60 text-emerald-200'
              : 'border-rose-600/50 bg-rose-950/60 text-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-purple-900/40">
        <button
          type="button"
          onClick={() => setActiveTab('pubs')}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'pubs'
              ? 'border-pink-500 text-pink-300 bg-purple-950/20'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <UploadCloud className="h-4 w-4" />
          <span>Mis Publicaciones ({myPublications.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('edit')}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'edit'
              ? 'border-pink-500 text-pink-300 bg-purple-950/20'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Edit3 className="h-4 w-4" />
          <span>Modificar Información</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'security'
              ? 'border-pink-500 text-pink-300 bg-purple-950/20'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <KeyRound className="h-4 w-4" />
          <span>Seguridad y Contraseña</span>
        </button>
      </div>

      {/* TAB 1: MIS PUBLICACIONES */}
      {activeTab === 'pubs' && (
        <div className="space-y-4">
          {myPublications.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {myPublications.map((pub) => (
                <div key={pub.id} className="relative group">
                  <PublicationCard
                    publication={pub}
                    onClick={() => onSelectPublication(pub)}
                  />
                  <button
                    onClick={(e) => handleDeleteMyPub(pub.id, e)}
                    className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-xl bg-rose-950/90 text-rose-300 border border-rose-700/50 hover:bg-rose-600 hover:text-white shadow-md transition-all opacity-0 group-hover:opacity-100"
                    title="Eliminar publicación"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-purple-900/50 bg-[#111222] p-12 text-center">
              <UploadCloud className="mx-auto h-12 w-12 text-purple-400 mb-3" />
              <h3 className="text-base font-bold text-white">No has compartido recursos aún</h3>
              <p className="mt-1 text-xs text-gray-400">
                Comparte tus videojuegos favoritos, scripts o herramientas con el grupo.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('publicar')}
                className="mt-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg"
              >
                Hacer mi primera publicación
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MODIFICAR INFORMACIÓN */}
      {activeTab === 'edit' && (
        <form
          onSubmit={handleSaveProfile}
          className="rounded-3xl border border-purple-900/50 bg-[#111222] p-6 sm:p-8 space-y-4 max-w-lg"
        >
          <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400 mb-2">
            Modificar Nombre y Avatar
          </h3>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Nombre completo o apodo
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] px-4 py-2.5 text-sm text-white focus:border-pink-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              URL del Avatar o Foto de Perfil
            </label>
            <input
              type="url"
              value={profileImage}
              onChange={(e) => setProfileImage(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] px-4 py-2.5 text-sm text-white focus:border-pink-500 focus:outline-none"
            />
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="rounded-xl bg-purple-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-purple-500 transition-colors"
            >
              {isUpdatingProfile ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: CAMBIAR CONTRASEÑA */}
      {activeTab === 'security' && (
        <form
          onSubmit={handleChangePassword}
          className="rounded-3xl border border-purple-900/50 bg-[#111222] p-6 sm:p-8 space-y-4 max-w-lg"
        >
          <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400 mb-2">
            Cambiar Contraseña
          </h3>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Contraseña Actual
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] px-4 py-2.5 text-sm text-white focus:border-pink-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Nueva Contraseña (mínimo 6 caracteres)
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] px-4 py-2.5 text-sm text-white focus:border-pink-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Confirmar Nueva Contraseña
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] px-4 py-2.5 text-sm text-white focus:border-pink-500 focus:outline-none"
            />
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={isChangingPass}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg"
            >
              {isChangingPass ? 'Actualizando...' : 'Actualizar Contraseña'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
