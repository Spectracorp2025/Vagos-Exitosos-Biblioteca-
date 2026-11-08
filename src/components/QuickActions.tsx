import React from 'react';
import { Compass, PlusCircle, AlertOctagon, Info, ArrowRight } from 'lucide-react';

interface QuickActionsProps {
  onNavigate: (section: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onNavigate }) => {
  const actions = [
    {
      id: 'biblioteca',
      title: 'Biblioteca',
      desc: 'Catálogo completo de videojuegos, apps y herramientas',
      icon: Compass,
      gradient: 'from-purple-600/30 via-indigo-600/20 to-purple-900/30',
      border: 'border-purple-600/30 hover:border-purple-500',
      iconColor: 'text-purple-400 bg-purple-950/60',
      badge: 'Explorar',
    },
    {
      id: 'publicar',
      title: 'Publicar',
      desc: 'Comparte un nuevo recurso digital con la comunidad',
      icon: PlusCircle,
      gradient: 'from-pink-600/30 via-fuchsia-600/20 to-purple-900/30',
      border: 'border-pink-600/30 hover:border-pink-500',
      iconColor: 'text-pink-400 bg-pink-950/60',
      badge: 'Crear',
    },
    {
      id: 'reportes',
      title: 'Reportar',
      desc: 'Notifica enlaces caídos, APK dañados o problemas',
      icon: AlertOctagon,
      gradient: 'from-amber-600/25 via-rose-600/20 to-purple-900/30',
      border: 'border-amber-600/30 hover:border-amber-500',
      iconColor: 'text-amber-400 bg-amber-950/60',
      badge: 'Soporte',
    },
    {
      id: 'informacion',
      title: 'Información',
      desc: 'Grupo de WhatsApp, normas, creador y Fumiko',
      icon: Info,
      gradient: 'from-cyan-600/25 via-blue-600/20 to-purple-900/30',
      border: 'border-cyan-600/30 hover:border-cyan-500',
      iconColor: 'text-cyan-400 bg-cyan-950/60',
      badge: 'Comunidad',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <div
            key={act.id}
            onClick={() => onNavigate(act.id)}
            className={`group relative cursor-pointer overflow-hidden rounded-2xl border ${act.border} bg-[#111221] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-950/50`}
          >
            {/* Background gradient hint */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${act.gradient} opacity-20 transition-opacity group-hover:opacity-40`}
            />

            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl border border-purple-800/30 ${act.iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full border border-purple-500/20 bg-purple-950/40 px-2.5 py-0.5 text-[10px] font-semibold text-gray-300">
                    {act.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-pink-300 transition-colors">
                  {act.title}
                </h3>
                <p className="mt-1 text-xs text-gray-400 leading-relaxed">
                  {act.desc}
                </p>
              </div>

              <div className="mt-4 flex items-center text-xs font-semibold text-purple-400 group-hover:text-pink-400 transition-colors">
                <span>Acceder</span>
                <ArrowRight className="ml-1.5 h-3.5 w-3.5 transform transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
