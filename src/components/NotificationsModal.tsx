import React from 'react';
import { X, Sparkles, MessageCircle, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NotificationsModalProps {
  onClose: () => void;
  onNavigate: (section: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ onClose, onNavigate }) => {
  const { user } = useAuth();

  const notifications = [
    {
      id: '1',
      title: '¡Bienvenido a Vagos Exitosos!',
      message: 'Explora nuestra biblioteca digital colaborativa, descarga juegos y comparte tus propios recursos.',
      time: 'Reciente',
      icon: Sparkles,
      color: 'text-purple-400 bg-purple-950/60 border-purple-800/40',
      action: () => onNavigate('biblioteca'),
      actionLabel: 'Ir a Biblioteca',
    },
    {
      id: '2',
      title: 'Plataforma lista para compartir recursos',
      message: 'Todos los miembros registrados pueden subir videojuegos, APKs, emuladores, scripts y herramientas digitales.',
      time: 'Reciente',
      icon: MessageCircle,
      color: 'text-pink-400 bg-pink-950/60 border-pink-800/40',
      action: () => onNavigate('publicar'),
      actionLabel: 'Publicar Recurso',
    },
    {
      id: '3',
      title: 'Grupo oficial de WhatsApp',
      message: 'Únete a nuestro grupo privado de WhatsApp para debatir sobre emuladores, pedir juegos y conversar con Carlos Eduardo y Fumiko.',
      time: 'Fijado',
      icon: CheckCircle,
      color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40',
      action: () => onNavigate('informacion'),
      actionLabel: 'Ver Grupo WhatsApp',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-purple-900/60 bg-[#111221] p-6 shadow-2xl shadow-purple-950/80">
        <div className="flex items-center justify-between border-b border-purple-900/40 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600/30 text-purple-300">
              <Sparkles className="h-4 w-4 text-purple-400" />
            </div>
            <h3 className="text-base font-bold text-white">Novedades y Avisos</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-purple-950 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {notifications.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="rounded-xl border border-purple-900/30 bg-[#16172b] p-3.5 transition-all hover:border-purple-600/40"
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 rounded-lg border p-1.5 ${item.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white">{item.title}</h4>
                      <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        {item.time}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-300 leading-relaxed">{item.message}</p>
                    {item.actionLabel && (
                      <button
                        onClick={item.action}
                        className="mt-2 text-[11px] font-semibold text-purple-400 hover:text-pink-400"
                      >
                        {item.actionLabel} →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 border-t border-purple-900/30 pt-3 text-center">
          <p className="text-[11px] text-gray-400">
            Comunidad Vagos Exitosos • Mantén tus notificaciones al día
          </p>
        </div>
      </div>
    </div>
  );
};
