import React, { useState, useEffect } from 'react';
import { CommunityInfo } from '../types';
import { communityApi } from '../services/api';
import {
  Info,
  Users,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Bot,
  Heart,
  Code,
  Terminal,
  FileText,
  Share2,
} from 'lucide-react';

export const InfoView: React.FC = () => {
  const [community, setCommunity] = useState<CommunityInfo>({
    name: 'Vagos Exitosos',
    description:
      'Vagos Exitosos es una comunidad privada de amigos apasionados por la tecnología, los videojuegos, las aplicaciones y los recursos digitales. Nuestro objetivo es compartir descubrimientos, herramientas, juegos y conocimientos, creando una biblioteca digital colaborativa para todos los miembros.',
    creator: 'Carlos Eduardo Delgado Rodríguez',
    assistantName: 'Fumiko',
    whatsappGroup: 'https://chat.whatsapp.com/invite-vagos-exitosos',
    rules:
      '1. Respeto mutuo y compañerismo en todas las interacciones.\n2. Prohibido compartir virus, malware, troyanos o software dañino.\n3. Indicar claramente los requisitos y pasos de instalación de cada aporte.\n4. Si un enlace se cae, reportarlo mediante el botón de reporte para pronta solución.\n5. Disfrutar, compartir conocimientos y pasarlo bien con los videojuegos.',
    version: '1.0.0',
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInfo() {
      try {
        const data = await communityApi.getInfo();
        setCommunity(data);
      } catch (err) {
        console.warn('Could not load community info, using default:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInfo();
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-16">
      {/* Top Banner Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-800/40 bg-gradient-to-br from-[#121323] via-[#101121] to-[#1d1430] p-6 sm:p-10 shadow-2xl shadow-purple-950/40">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-pink-500/40 bg-pink-950/60 px-3 py-1 text-xs font-bold text-pink-300">
              <Sparkles className="h-3.5 w-3.5 text-pink-400" />
              Acerca de la Comunidad
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {community.name}
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/90 max-w-xl leading-relaxed">
              {community.description}
            </p>
          </div>

          {/* Assistant Fumiko Mascot Badge */}
          <div className="flex flex-col items-center rounded-2xl border border-purple-600/40 bg-[#16172d]/80 p-5 text-center backdrop-blur-md shrink-0">
            <div className="relative mb-2">
              <img
                src={
                  community.assistantAvatar ||
                  'https://api.dicebear.com/7.x/bottts/svg?seed=Fumiko&backgroundColor=7c3aed'
                }
                alt={community.assistantName}
                className="h-16 w-16 rounded-2xl border-2 border-pink-500/60 object-cover shadow-lg shadow-purple-900/60 bg-[#141528]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://api.dicebear.com/7.x/bottts/svg?seed=Fumiko&backgroundColor=7c3aed';
                }}
              />
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-white text-[10px]">
                <Bot className="h-3 w-3" />
              </span>
            </div>
            <span className="text-sm font-bold text-white">{community.assistantName}</span>
            <span className="text-[11px] text-pink-300">Asistente Digital Oficial</span>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-pink-600/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />
      </div>

      {/* WHATSAPP OFFICIAL GROUP (CONFIGURABLE VIA ADMIN) */}
      <section className="space-y-4">
        <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-emerald-400" />
          <span>Comunidad Oficial en WhatsApp</span>
        </h2>

        {/* Grupo de WhatsApp */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 rounded-2xl border border-emerald-600/50 bg-gradient-to-br from-[#0c1814] via-[#101b1b] to-[#121323] p-6 shadow-xl">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600/30 text-emerald-300">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Grupo Privado de WhatsApp</h3>
                <span className="text-xs text-emerald-400 font-medium">Chat oficial de la comunidad de amigos</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed pt-1">
              Pide juegos específicos, debate sobre emuladores, comparte mods, solicita ayuda técnica y conversa directamente con todos los miembros y administradores de Vagos Exitosos.
            </p>
          </div>

          <a
            href={community.whatsappGroup}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-xs sm:text-sm font-bold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-950 transition-all shrink-0 cursor-pointer"
          >
            <Users className="h-4 w-4" />
            <span>Unirse al Grupo de WhatsApp</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* APARTADOS: OBJETIVO, CREADOR Y ASISTENTE */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Objetivo */}
        <div className="rounded-2xl border border-purple-900/40 bg-[#121323] p-5 space-y-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-950 text-purple-400 mb-2">
            <Heart className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-white">Objetivo del Proyecto</h3>
          <p className="text-xs text-gray-300 leading-relaxed">
            Preservar, compartir y facilitar el acceso a videojuegos de calidad, herramientas informáticas y recursos digitales entre un círculo de confianza.
          </p>
        </div>

        {/* Creador */}
        <div className="rounded-2xl border border-purple-900/40 bg-[#121323] p-5 space-y-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-950 text-pink-400 mb-2">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-white">Creador y Fundador</h3>
          <p className="text-xs font-semibold text-pink-300">{community.creator}</p>
          <p className="text-xs text-gray-400 leading-relaxed">
            Administrador principal y encargado del mantenimiento de la infraestructura técnica de Vagos Exitosos.
          </p>
        </div>

        {/* Asistente Virtual */}
        <div className="rounded-2xl border border-purple-900/40 bg-[#121323] p-5 space-y-2">
          <div className="flex items-center gap-3 mb-2">
            <img
              src={
                community.assistantAvatar ||
                'https://api.dicebear.com/7.x/bottts/svg?seed=Fumiko&backgroundColor=7c3aed'
              }
              alt={community.assistantName}
              className="h-9 w-9 rounded-xl border border-pink-500/50 object-cover bg-pink-950 shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://api.dicebear.com/7.x/bottts/svg?seed=Fumiko&backgroundColor=7c3aed';
              }}
            />
            <div>
              <h3 className="text-sm font-bold text-white">Identidad de {community.assistantName}</h3>
              <p className="text-[11px] font-semibold text-cyan-300">Asistente Virtual de la Comunidad</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Encargada de brindar consejos, sugerir portadas inteligentes y velar por la organización de los recursos digitales.
          </p>
        </div>
      </section>

      {/* NORMAS DE LA COMUNIDAD */}
      <section className="rounded-3xl border border-purple-900/40 bg-[#121323] p-6 sm:p-8 space-y-4">
        <h2 className="text-base font-black text-white tracking-tight flex items-center gap-2">
          <FileText className="h-5 w-5 text-pink-400" />
          <span>Normas y Convivencia de Vagos Exitosos</span>
        </h2>

        <div className="rounded-2xl bg-[#0c0d18] p-5 border border-purple-950 text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-line space-y-2">
          {community.rules}
        </div>
      </section>

      {/* VERSIÓN Y METADATOS TÉCNICOS */}
      <section className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-purple-900/30 bg-[#0c0d18] p-4 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-purple-400" />
          <span>Plataforma Vagos Exitosos • Versión {community.version}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-gray-300">Backend Node & Firebase Firestore en Producción</span>
        </div>
      </section>
    </div>
  );
};
