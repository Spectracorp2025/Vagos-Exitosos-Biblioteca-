import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Publication } from './types';
import { firestoreService } from './services/firestoreService';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { HomeView } from './views/HomeView';
import { LibraryView } from './views/LibraryView';
import { PublishView } from './views/PublishView';
import { ReportsView } from './views/ReportsView';
import { InfoView } from './views/InfoView';
import { ProfileView } from './views/ProfileView';
import { AdminView } from './views/AdminView';
import { AuthView } from './views/AuthView';
import { PublicationDetailModal } from './components/PublicationDetailModal';
import { Heart, Sparkles, Shield, MessageCircle } from 'lucide-react';

function MainApp() {
  const { user, isAdmin } = useAuth();
  const [activeSection, setActiveSection] = useState<string>('inicio');
  const [publications, setPublications] = useState<Publication[]>([]);
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [reportTargetPublication, setReportTargetPublication] = useState<Publication | null>(null);

  // Subscribe to publications
  useEffect(() => {
    const unsubscribe = firestoreService.subscribePublications((list) => {
      setPublications(list);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenReportForPublication = (pub: Publication) => {
    setReportTargetPublication(pub);
    setActiveSection('reportes');
  };

  const handlePublishSuccess = (newPub: Publication) => {
    setActiveSection('biblioteca');
    setSelectedPublication(newPub);
  };

  return (
    <div className="min-h-screen bg-[#07080f] text-gray-100 flex flex-col font-sans selection:bg-pink-500 selection:text-white">
      {/* Top Header */}
      <Header
        activeSection={activeSection}
        onNavigate={(sec) => setActiveSection(sec)}
      />

      {/* Desktop & Mobile Navbar */}
      <Navbar
        activeSection={activeSection}
        onNavigate={(sec) => setActiveSection(sec)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-20 md:pb-12">
        {activeSection === 'inicio' && (
          <HomeView
            publications={publications}
            onSelectPublication={(pub) => setSelectedPublication(pub)}
            onNavigate={(sec) => setActiveSection(sec)}
          />
        )}

        {activeSection === 'biblioteca' && (
          <LibraryView
            publications={publications}
            onSelectPublication={(pub) => setSelectedPublication(pub)}
            onNavigate={(sec) => setActiveSection(sec)}
          />
        )}

        {activeSection === 'publicar' && (
          user ? (
            <PublishView
              onSuccess={handlePublishSuccess}
              onCancel={() => setActiveSection('inicio')}
              onNavigate={(sec) => setActiveSection(sec)}
            />
          ) : (
            <div className="py-8">
              <AuthView
                initialMode="login"
                onSuccess={() => setActiveSection('publicar')}
              />
            </div>
          )
        )}

        {activeSection === 'reportes' && (
          <ReportsView
            publications={publications}
            initialSelectedPublication={reportTargetPublication}
            onSelectPublication={(pub) => setSelectedPublication(pub)}
            onNavigate={(sec) => setActiveSection(sec)}
          />
        )}

        {activeSection === 'informacion' && <InfoView />}

        {activeSection === 'perfil' && (
          <ProfileView
            publications={publications}
            onSelectPublication={(pub) => setSelectedPublication(pub)}
            onNavigate={(sec) => setActiveSection(sec)}
          />
        )}

        {activeSection === 'admin' && (
          <AdminView
            publications={publications}
            onSelectPublication={(pub) => setSelectedPublication(pub)}
            onNavigate={(sec) => setActiveSection(sec)}
          />
        )}

        {activeSection === 'auth' && (
          <div className="py-8">
            <AuthView
              onSuccess={() => setActiveSection('inicio')}
            />
          </div>
        )}
      </main>

      {/* Publication Detail Modal */}
      {selectedPublication && (
        <PublicationDetailModal
          publication={selectedPublication}
          onClose={() => setSelectedPublication(null)}
          onOpenReport={handleOpenReportForPublication}
        />
      )}

      {/* Desktop Footer */}
      <footer className="hidden md:block border-t border-purple-900/30 bg-[#090a14] py-8 text-xs text-gray-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white">VAGOS EXITOSOS</span>
            <span>• Plataforma Digital & Comunidad de Amigos</span>
          </div>
          <div className="flex items-center gap-4 text-gray-500">
            <span>Creador: <strong className="text-gray-300">Carlos Eduardo Delgado Rodríguez</strong></span>
            <span>• Asistente: <strong className="text-pink-400">Fumiko</strong></span>
            <span>• v1.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
