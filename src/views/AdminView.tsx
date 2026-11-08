import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Publication, Report, ReportStatus, CommunityInfo, UserProfile } from '../types';
import { firestoreService } from '../services/firestoreService';
import { adminApi, communityApi } from '../services/api';
import {
  ShieldCheck,
  Users,
  Layers,
  AlertOctagon,
  Settings,
  Flame,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Save,
  MessageCircle,
  Sparkles,
} from 'lucide-react';

interface AdminViewProps {
  publications: Publication[];
  onSelectPublication: (pub: Publication) => void;
  onNavigate: (section: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  publications,
  onSelectPublication,
  onNavigate,
}) => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'pubs' | 'reports' | 'users' | 'community'>('pubs');

  // Users List
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Reports
  const [reports, setReports] = useState<Report[]>([]);
  const [reportNoteMap, setReportNoteMap] = useState<Record<string, string>>({});

  // Community settings
  const [communityConfig, setCommunityConfig] = useState<CommunityInfo>({
    name: 'Vagos Exitosos',
    description: '',
    creator: 'Carlos Eduardo Delgado Rodríguez',
    assistantName: 'Fumiko',
    assistantAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Fumiko&backgroundColor=7c3aed',
    whatsappGroup: '',
    rules: '',
    version: '1.0.0',
  });
  const [savingCommunity, setSavingCommunity] = useState(false);
  const [communityMessage, setCommunityMessage] = useState('');

  // Load registered users from backend
  useEffect(() => {
    async function loadUsers() {
      if (!isAdmin) return;
      setLoadingUsers(true);
      try {
        const list = await adminApi.getUsers();
        setUsersList(list);
      } catch (err) {
        console.warn('Could not load users list', err);
      } finally {
        setLoadingUsers(false);
      }
    }
    loadUsers();
  }, [isAdmin]);

  // Subscribe to all community reports for admin
  useEffect(() => {
    if (!isAdmin) return;
    const unsubscribe = firestoreService.subscribeReports(null, true, (reps) => {
      setReports(reps);
    });
    return () => unsubscribe();
  }, [isAdmin]);

  // Load community settings
  useEffect(() => {
    async function loadComm() {
      try {
        const info = await communityApi.getInfo();
        setCommunityConfig(info);
      } catch (err) {
        console.warn('Could not load community settings', err);
      }
    }
    loadComm();
  }, []);

  if (!isAdmin) {
    return (
      <div className="rounded-3xl border border-rose-900/50 bg-[#140e18] p-12 text-center max-w-md mx-auto space-y-4">
        <ShieldCheck className="mx-auto h-12 w-12 text-rose-500" />
        <h2 className="text-lg font-bold text-white">Acceso Restringido</h2>
        <p className="text-xs text-gray-400">
          Esta sección está reservada exclusivamente para el administrador fundador (Carlos Eduardo Delgado Rodríguez).
        </p>
        <button
          onClick={() => onNavigate('inicio')}
          className="rounded-xl bg-purple-700 px-6 py-2.5 text-xs font-bold text-white"
        >
          Regresar al Inicio
        </button>
      </div>
    );
  }

  // Toggle Featured status on Publication
  const handleToggleFeatured = async (pub: Publication) => {
    await firestoreService.updatePublication(pub.id, {
      featured: !pub.featured,
    });
  };

  // Toggle Hide / Active
  const handleToggleStatus = async (pub: Publication) => {
    const nextStatus = pub.status === 'active' ? 'hidden' : 'active';
    await firestoreService.updatePublication(pub.id, {
      status: nextStatus,
    });
  };

  // Delete Publication
  const handleDeletePub = async (pubId: string) => {
    if (confirm('¿Confirmas que deseas eliminar esta publicación permanentemente?')) {
      await firestoreService.deletePublication(pubId);
    }
  };

  // Update Report Status
  const handleUpdateReportStatus = async (reportId: string, status: ReportStatus) => {
    const note = reportNoteMap[reportId];
    await firestoreService.updateReportStatus(reportId, status, note);
  };

  // Save Community Settings
  const handleSaveCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCommunity(true);
    setCommunityMessage('');
    try {
      await communityApi.updateInfo(communityConfig);
      setCommunityMessage('¡Enlaces de WhatsApp y datos de la comunidad actualizados correctamente!');
    } catch (err: any) {
      setCommunityMessage('Error al actualizar: ' + err.message);
    } finally {
      setSavingCommunity(false);
    }
  };

  // Promote / Demote user
  const handleToggleRole = async (targetUid: string, currentRole: string) => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    if (confirm(`¿Cambiar rol del usuario a ${nextRole.toUpperCase()}?`)) {
      await adminApi.updateUserRole(targetUid, nextRole as 'user' | 'admin');
      const updated = await adminApi.getUsers();
      setUsersList(updated);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-pink-700/50 bg-gradient-to-r from-[#180f24] via-[#140e21] to-[#121324] p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white shadow-lg">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-full bg-pink-950 px-2 py-0.5 text-[10px] font-bold text-pink-300 border border-pink-500/40">
                Super Admin
              </span>
              <span className="text-xs text-gray-400">Carlos Eduardo Delgado Rodríguez</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Panel de Administración</h1>
            <p className="text-xs text-gray-300">Control maestro de publicaciones, usuarios, reportes y WhatsApp</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-purple-900/40 gap-1">
        {[
          { id: 'pubs', label: `Publicaciones (${publications.length})`, icon: Layers },
          { id: 'reports', label: `Reportes (${reports.length})`, icon: AlertOctagon },
          { id: 'users', label: `Usuarios (${usersList.length})`, icon: Users },
          { id: 'community', label: 'Ajustes WhatsApp & Comunidad', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
                isActive
                  ? 'border-pink-500 text-pink-300 bg-purple-950/20'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: GESTIÓN DE PUBLICACIONES */}
      {activeTab === 'pubs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Control de publicaciones compartidas por los miembros</span>
            <button
              onClick={() => onNavigate('publicar')}
              className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-500"
            >
              + Nueva Publicación
            </button>
          </div>

          <div className="space-y-3">
            {publications.map((pub) => (
              <div
                key={pub.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-purple-900/40 bg-[#121323] p-4 transition-all hover:border-purple-600/50"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={pub.coverImage}
                    alt={pub.title}
                    className="h-14 w-14 rounded-xl object-cover shrink-0 border border-purple-900/50"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-pink-400">{pub.type}</span>
                      {pub.platform && (
                        <span className="text-[10px] uppercase font-semibold text-purple-400">• {pub.platform}</span>
                      )}
                      {pub.featured && (
                        <span className="flex items-center gap-0.5 rounded-full bg-pink-950 px-2 py-0.2 text-[9px] font-bold text-pink-300 border border-pink-700/50">
                          <Flame className="h-2.5 w-2.5" /> En Banner
                        </span>
                      )}
                      {pub.status === 'hidden' && (
                        <span className="rounded-full bg-rose-950 px-2 py-0.2 text-[9px] font-bold text-rose-300 border border-rose-700/50">
                          Oculto
                        </span>
                      )}
                    </div>
                    <h3
                      onClick={() => onSelectPublication(pub)}
                      className="text-sm font-bold text-white hover:text-pink-300 cursor-pointer line-clamp-1 mt-0.5"
                    >
                      {pub.title}
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      Por <strong className="text-gray-300">{pub.authorName}</strong> • {new Date(pub.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Destacar en banner */}
                  <button
                    onClick={() => handleToggleFeatured(pub)}
                    title={pub.featured ? 'Quitar del banner de inicio' : 'Destacar en el banner de novedades'}
                    className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all ${
                      pub.featured
                        ? 'border-pink-500 bg-pink-950/60 text-pink-300'
                        : 'border-purple-900/40 bg-[#17182f] text-gray-400 hover:text-white'
                    }`}
                  >
                    <Flame className="h-3.5 w-3.5" />
                    <span>{pub.featured ? 'Destacado' : 'Destacar'}</span>
                  </button>

                  {/* Ocultar / Activar */}
                  <button
                    onClick={() => handleToggleStatus(pub)}
                    title={pub.status === 'active' ? 'Ocultar publicación' : 'Mostrar publicación'}
                    className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold border border-purple-900/40 bg-[#17182f] text-gray-300 hover:text-white"
                  >
                    {pub.status === 'active' ? (
                      <>
                        <EyeOff className="h-3.5 w-3.5 text-amber-400" />
                        <span>Ocultar</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Activar</span>
                      </>
                    )}
                  </button>

                  {/* Eliminar */}
                  <button
                    onClick={() => handleDeletePub(pub.id)}
                    title="Eliminar publicación permanentemente"
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-rose-900/40 bg-rose-950/40 text-rose-300 hover:bg-rose-600 hover:text-white transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: GESTIÓN DE REPORTES */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="text-xs text-gray-400">
            Revisión y resolución de enlaces caídos y problemas reportados por la comunidad
          </div>

          {reports.length > 0 ? (
            reports.map((rep) => {
              const formattedDate = new Date(rep.createdAt).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={rep.id}
                  className="rounded-2xl border border-purple-900/40 bg-[#121323] p-5 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-900/30 pb-3">
                    <div>
                      <span className="text-[10px] font-mono text-purple-400">ID: {rep.id} • {formattedDate}</span>
                      <h3 className="text-base font-bold text-white mt-0.5">{rep.publicationTitle}</h3>
                      <p className="text-xs text-gray-400">
                        Reportado por: <strong className="text-white">{rep.userDisplayName}</strong> ({rep.reportType})
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(['pendiente', 'en_revision', 'solucionado', 'rechazado'] as ReportStatus[]).map((st) => (
                        <button
                          key={st}
                          onClick={() => handleUpdateReportStatus(rep.id, st)}
                          className={`rounded-xl px-2.5 py-1 text-xs font-bold capitalize transition-all ${
                            rep.status === st
                              ? st === 'solucionado'
                                ? 'bg-emerald-600 text-white'
                                : st === 'en_revision'
                                ? 'bg-blue-600 text-white'
                                : st === 'rechazado'
                                ? 'bg-rose-600 text-white'
                                : 'bg-amber-600 text-white'
                              : 'bg-[#18192e] text-gray-400 hover:text-white'
                          }`}
                        >
                          {st.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-gray-300">
                    <p className="rounded-xl bg-[#0c0d18] p-3 text-xs leading-relaxed whitespace-pre-line border border-purple-950">
                      {rep.description}
                    </p>
                  </div>

                  {/* Admin notes input */}
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Nota de resolución para el usuario (Ej. Enlace reemplazado por Google Drive mirror)"
                      defaultValue={rep.adminNotes || ''}
                      onChange={(e) =>
                        setReportNoteMap({ ...reportNoteMap, [rep.id]: e.target.value })
                      }
                      className="flex-1 rounded-xl border border-purple-900/40 bg-[#0d0e19] px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none"
                    />
                    <button
                      onClick={() => handleUpdateReportStatus(rep.id, rep.status)}
                      className="rounded-xl bg-purple-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-600"
                    >
                      Guardar Nota
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-3xl border border-dashed border-purple-900/50 bg-[#111222] p-12 text-center text-gray-400">
              No hay reportes de miembros en este momento. ¡Todo funciona correctamente!
            </div>
          )}
        </div>
      )}

      {/* TAB 3: USUARIOS REGISTRADOS */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="text-xs text-gray-400">
            Lista de miembros registrados en la plataforma comunitaria Vagos Exitosos
          </div>

          <div className="overflow-x-auto rounded-2xl border border-purple-900/40 bg-[#121323]">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="border-b border-purple-900/40 bg-[#16172e] text-[11px] font-bold uppercase text-purple-300">
                <tr>
                  <th className="p-3.5">Usuario</th>
                  <th className="p-3.5">WhatsApp</th>
                  <th className="p-3.5">Rol</th>
                  <th className="p-3.5">Fecha Registro</th>
                  <th className="p-3.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/30">
                {usersList.map((u) => (
                  <tr key={u.uid} className="hover:bg-purple-950/20">
                    <td className="p-3.5 font-bold text-white flex items-center gap-2">
                      <img
                        src={u.profileImage || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(u.uid)}`}
                        alt=""
                        className="h-6 w-6 rounded-lg bg-purple-950"
                      />
                      <span>{u.displayName}</span>
                    </td>
                    <td className="p-3.5 font-mono text-purple-300">{u.phoneNumber || 'Protegido'}</td>
                    <td className="p-3.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          u.role === 'admin'
                            ? 'bg-pink-950 text-pink-300 border border-pink-700/50'
                            : 'bg-purple-950 text-purple-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 text-right">
                      {u.uid !== user?.uid && (
                        <button
                          onClick={() => handleToggleRole(u.uid, u.role)}
                          className="rounded-lg bg-[#191b35] px-2.5 py-1 text-[11px] font-semibold text-purple-300 hover:text-white"
                        >
                          {u.role === 'admin' ? 'Quitar Admin' : 'Hacer Admin'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: AJUSTES COMUNITARIOS Y WHATSAPP */}
      {activeTab === 'community' && (
        <form
          onSubmit={handleSaveCommunity}
          className="rounded-3xl border border-purple-900/50 bg-[#111222] p-6 sm:p-8 space-y-6 max-w-2xl"
        >
          <div className="flex items-center gap-2 mb-1">
            <Settings className="h-5 w-5 text-pink-400" />
            <h3 className="text-base font-bold text-white">Configuración de Comunidad, WhatsApp e IA</h3>
          </div>
          <p className="text-xs text-gray-400">
            Administra los enlaces oficiales de WhatsApp, la foto y nombre de la asistente virtual, y las normas de convivencia.
          </p>

          {communityMessage && (
            <div
              className={`rounded-xl border p-3.5 text-xs font-medium ${
                communityMessage.startsWith('Error')
                  ? 'border-rose-500/50 bg-rose-950/60 text-rose-200'
                  : 'border-emerald-600/50 bg-emerald-950/60 text-emerald-200'
              }`}
            >
              {communityMessage}
            </div>
          )}

          {/* FOTO DE LA ASISTENTE IA (URL) */}
          <div className="rounded-2xl border border-purple-800/40 bg-[#0d0e19] p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-pink-400" />
              <label className="text-xs font-bold text-white">
                Foto de Perfil de la Asistente IA ({communityConfig.assistantName || 'Fumiko'})
              </label>
            </div>
            <p className="text-[11px] text-gray-400">
              Pega cualquier enlace URL directo de la foto que deseas para la asistente virtual.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
              {/* Preview */}
              <div className="relative shrink-0">
                <img
                  src={
                    communityConfig.assistantAvatar ||
                    'https://api.dicebear.com/7.x/bottts/svg?seed=Fumiko&backgroundColor=7c3aed'
                  }
                  alt={communityConfig.assistantName || 'Fumiko'}
                  className="h-20 w-20 rounded-2xl border-2 border-pink-500/60 object-cover shadow-lg shadow-purple-900/60 bg-[#15162a]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://api.dicebear.com/7.x/bottts/svg?seed=Fumiko&backgroundColor=7c3aed';
                  }}
                />
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-pink-500 text-white text-[10px] shadow">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
              </div>

              {/* Input & Reset */}
              <div className="flex-1 w-full space-y-2">
                <input
                  type="url"
                  value={communityConfig.assistantAvatar || ''}
                  onChange={(e) =>
                    setCommunityConfig({ ...communityConfig, assistantAvatar: e.target.value })
                  }
                  placeholder="https://i.imgur.com/... o https://ejemplo.com/foto.jpg"
                  className="w-full rounded-xl border border-purple-800/40 bg-[#121323] px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none"
                />
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-400">Vista previa en tiempo real arriba</span>
                  <button
                    type="button"
                    onClick={() =>
                      setCommunityConfig({
                        ...communityConfig,
                        assistantAvatar:
                          'https://api.dicebear.com/7.x/bottts/svg?seed=Fumiko&backgroundColor=7c3aed',
                      })
                    }
                    className="text-pink-400 hover:text-pink-300 underline cursor-pointer"
                  >
                    Restablecer foto predeterminada
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Nombre de la Asistente */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Nombre de la Asistente Digital
            </label>
            <input
              type="text"
              value={communityConfig.assistantName}
              onChange={(e) =>
                setCommunityConfig({ ...communityConfig, assistantName: e.target.value })
              }
              placeholder="Fumiko"
              className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] px-4 py-2.5 text-xs text-white focus:border-pink-500 focus:outline-none"
            />
          </div>

          {/* Grupo de WhatsApp */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1.5">
              <MessageCircle className="h-4 w-4 text-emerald-400" />
              <span>Enlace de Invitación al Grupo Privado de WhatsApp</span>
            </label>
            <input
              type="url"
              required
              value={communityConfig.whatsappGroup}
              onChange={(e) =>
                setCommunityConfig({ ...communityConfig, whatsappGroup: e.target.value })
              }
              placeholder="https://chat.whatsapp.com/..."
              className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] px-4 py-2.5 text-xs text-white focus:border-pink-500 focus:outline-none"
            />
          </div>

          {/* Normas */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Normas y Convivencia de la Comunidad
            </label>
            <textarea
              rows={5}
              value={communityConfig.rules}
              onChange={(e) => setCommunityConfig({ ...communityConfig, rules: e.target.value })}
              className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] px-4 py-2.5 text-xs text-white focus:border-pink-500 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="submit"
              disabled={savingCommunity}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-purple-950/60 hover:opacity-95 transition-opacity cursor-pointer disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{savingCommunity ? 'Guardando cambios...' : 'Guardar Configuración'}</span>
            </button>

            <span className="text-[11px] text-gray-400">
              Versión del sistema: {communityConfig.version}
            </span>
          </div>
        </form>
      )}
    </div>
  );
};
