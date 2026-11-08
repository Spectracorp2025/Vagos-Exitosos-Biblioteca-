import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Publication,
  PublicationType,
  GamePlatform,
  DownloadLinkItem,
} from '../types';
import { firestoreService } from '../services/firestoreService';
import { coversApi } from '../services/api';
import {
  Gamepad2,
  Smartphone,
  Monitor,
  Wrench,
  Code2,
  Globe,
  FileText,
  Sparkles,
  Upload,
  Link as LinkIcon,
  HardDrive,
  Info,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
  Plus,
  Trash2,
  Cpu,
  Layers,
  Terminal,
  Copy,
} from 'lucide-react';

interface PublishViewProps {
  onSuccess: (newPub: Publication) => void;
  onCancel: () => void;
  onNavigate: (section: string) => void;
}

export const PublishView: React.FC<PublishViewProps> = ({
  onSuccess,
  onCancel,
  onNavigate,
}) => {
  const { user } = useAuth();

  // Step 1: Category
  const [selectedType, setSelectedType] = useState<PublicationType>('videojuego');

  // Common Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [instructions, setInstructions] = useState('');

  // Cover Image
  const [imageMode, setImageMode] = useState<'auto' | 'manual'>('auto');
  const [coverImage, setCoverImage] = useState(
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'
  );
  const [coverUrlInput, setCoverUrlInput] = useState('');
  const [suggestedCovers, setSuggestedCovers] = useState<Array<{ url: string; title: string }>>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Videojuego Platform
  const [gamePlatform, setGamePlatform] = useState<GamePlatform>('android');

  // Videojuego - Android
  const [androidDownloadMethod, setAndroidDownloadMethod] = useState<'external' | 'drive'>('drive');
  const [androidMainUrl, setAndroidMainUrl] = useState('');
  const [androidApkUrl, setAndroidApkUrl] = useState('');
  const [androidDataUrl, setAndroidDataUrl] = useState('');
  const [androidObbUrl, setAndroidObbUrl] = useState('');

  // Videojuego - PC
  const [pcDownloadMethod, setPcDownloadMethod] = useState<'external' | 'drive'>('external');
  const [pcDownloadUrl, setPcDownloadUrl] = useState('');
  const [pcOs, setPcOs] = useState('Windows 10 / 11 (64-bit)');
  const [pcRam, setPcRam] = useState('8 GB RAM');
  const [pcCpu, setPcCpu] = useState('Intel Core i5 o AMD Ryzen 5');
  const [pcStorage, setPcStorage] = useState('10 GB libres');
  const [pcGpu, setPcGpu] = useState('NVIDIA GTX 1060 / AMD RX 580');

  // Port / Adaptación (Mobile port)
  const [portApkUrl, setPortApkUrl] = useState('');
  const [portIsoUrl, setPortIsoUrl] = useState('');
  const [portDownloadMethod, setPortDownloadMethod] = useState<'drive' | 'external'>('drive');
  const [portRequirements, setPortRequirements] = useState('Android 8.0+ / Emulador PPSSPP o AetherSX2');

  // Additional Files (For all types)
  const [additionalFiles, setAdditionalFiles] = useState<DownloadLinkItem[]>([]);
  const [newFileName, setNewFileName] = useState('');
  const [newFileUrl, setNewFileUrl] = useState('');

  // Aplicación
  const [appOs, setAppOs] = useState('Android');
  const [appDownloadUrl, setAppDownloadUrl] = useState('');
  const [appDownloadMethod, setAppDownloadMethod] = useState<'drive' | 'external'>('external');
  const [appRequirements, setAppRequirements] = useState('');

  // Página Web
  const [webUrl, setWebUrl] = useState('');
  const [webType, setWebType] = useState('Herramienta Online / Portal');
  const [webExtraInfo, setWebExtraInfo] = useState('');

  // Herramienta
  const [toolFunction, setToolFunction] = useState('');
  const [toolOs, setToolOs] = useState('Windows / Multiplataforma');
  const [toolDownloadUrl, setToolDownloadUrl] = useState('');

  // Archivo
  const [fileFormat, setFileFormat] = useState('ZIP / RAR');
  const [fileDownloadUrl, setFileDownloadUrl] = useState('');

  // Script / Comando
  const [scriptLanguage, setScriptLanguage] = useState('bash');
  const [scriptOs, setScriptOs] = useState('Linux / Android Termux');
  const [scriptCode, setScriptCode] = useState('');
  const [scriptOptionalUrl, setScriptOptionalUrl] = useState('');

  // Preview Modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-fetch suggested cover images when title changes
  useEffect(() => {
    if (imageMode === 'auto' && title.trim().length >= 3) {
      const handler = setTimeout(async () => {
        setLoadingSuggestions(true);
        try {
          const suggestions = await coversApi.getSuggestions(title, selectedType);
          setSuggestedCovers(suggestions);
          if (suggestions.length > 0 && !coverUrlInput) {
            setCoverImage(suggestions[0].url);
          }
        } catch (err) {
          console.warn('Could not load suggestions', err);
        } finally {
          setLoadingSuggestions(false);
        }
      }, 600);
      return () => clearTimeout(handler);
    }
  }, [title, selectedType, imageMode]);

  // Handle local file upload for cover
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('La imagen seleccionada supera los 2 MB. Elige una imagen más liviana.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCoverImage(reader.result);
          setImageMode('manual');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddAdditionalFile = () => {
    if (!newFileName.trim() || !newFileUrl.trim()) return;
    setAdditionalFiles([
      ...additionalFiles,
      {
        id: Date.now().toString(),
        name: newFileName.trim(),
        url: newFileUrl.trim(),
        type: newFileUrl.includes('drive.google.com') ? 'drive' : 'direct',
      },
    ]);
    setNewFileName('');
    setNewFileUrl('');
  };

  const handleRemoveAdditionalFile = (id: string) => {
    setAdditionalFiles(additionalFiles.filter((f) => f.id !== id));
  };

  // Compile full publication object for preview and submission
  const compilePublicationData = (): Omit<Publication, 'id' | 'createdAt' | 'updatedAt'> => {
    let platformLabel = '';
    let compiledRequirements: any = {};
    const downloadLinks: any = {
      additionalFiles: additionalFiles.length > 0 ? additionalFiles : undefined,
    };

    if (selectedType === 'videojuego') {
      platformLabel = gamePlatform;
      if (gamePlatform === 'android') {
        downloadLinks.primaryUrl = androidMainUrl || androidApkUrl;
        downloadLinks.primaryType = androidDownloadMethod;
        if (androidApkUrl) downloadLinks.apkUrl = androidApkUrl;
        if (androidDataUrl) downloadLinks.dataUrl = androidDataUrl;
        if (androidObbUrl) downloadLinks.obbUrl = androidObbUrl;
      } else if (gamePlatform === 'pc') {
        downloadLinks.primaryUrl = pcDownloadUrl;
        downloadLinks.primaryType = pcDownloadMethod;
        downloadLinks.pcUrl = pcDownloadUrl;
        compiledRequirements = {
          os: pcOs,
          ram: pcRam,
          cpu: pcCpu,
          storage: pcStorage,
          gpu: pcGpu,
        };
      } else if (gamePlatform === 'port') {
        platformLabel = 'port';
        downloadLinks.primaryUrl = portApkUrl;
        downloadLinks.primaryType = portDownloadMethod;
        downloadLinks.apkUrl = portApkUrl;
        downloadLinks.isoUrl = portIsoUrl;
        compiledRequirements = {
          os: portRequirements,
          additional:
            'Port / Adaptación: El APK corresponde a la aplicación instalable y el archivo ISO contiene los datos del juego.',
        };
      }
    } else if (selectedType === 'aplicacion') {
      platformLabel = appOs;
      downloadLinks.primaryUrl = appDownloadUrl;
      downloadLinks.primaryType = appDownloadMethod;
      if (appOs.toLowerCase().includes('android')) {
        downloadLinks.apkUrl = appDownloadUrl;
      } else if (appOs.toLowerCase().includes('windows')) {
        downloadLinks.pcUrl = appDownloadUrl;
      }
      compiledRequirements = appRequirements ? { additional: appRequirements } : undefined;
    } else if (selectedType === 'pagina_web') {
      platformLabel = 'web';
      downloadLinks.webUrl = webUrl;
      downloadLinks.primaryUrl = webUrl;
      compiledRequirements = webExtraInfo ? { additional: webExtraInfo } : undefined;
    } else if (selectedType === 'herramienta') {
      platformLabel = toolOs;
      downloadLinks.primaryUrl = toolDownloadUrl;
      compiledRequirements = {
        additional: `Función principal: ${toolFunction}`,
      };
    } else if (selectedType === 'archivo') {
      platformLabel = fileFormat;
      downloadLinks.primaryUrl = fileDownloadUrl;
    } else if (selectedType === 'script') {
      platformLabel = scriptOs;
      downloadLinks.primaryUrl = scriptOptionalUrl || undefined;
    }

    return {
      title: title.trim(),
      description: description.trim(),
      type: selectedType,
      platform: platformLabel || undefined,
      coverImage,
      imageMode,
      version: version.trim() || undefined,
      fileSize: fileSize.trim() || undefined,
      requirements: Object.keys(compiledRequirements || {}).length > 0 ? compiledRequirements : undefined,
      downloadLinks,
      instructions: instructions.trim() || undefined,
      scriptCode: selectedType === 'script' ? scriptCode : undefined,
      scriptLanguage: selectedType === 'script' ? scriptLanguage : undefined,
      authorId: user?.uid || 'anon_member',
      authorName: user?.displayName || 'Miembro de Vagos',
      featured: false,
      status: 'active',
    };
  };

  // Validation before opening preview
  const handleValidateAndPreview = () => {
    setErrorMessage('');
    if (!title.trim()) {
      setErrorMessage('Por favor ingresa el nombre del recurso.');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Por favor proporciona una descripción clara del recurso.');
      return;
    }
    if (selectedType === 'videojuego' && gamePlatform === 'port') {
      if (!portApkUrl.trim() || !portIsoUrl.trim()) {
        setErrorMessage('Para un Port / Adaptación es obligatorio proporcionar tanto el archivo APK como el archivo ISO.');
        return;
      }
    }
    if (selectedType === 'pagina_web' && !webUrl.trim()) {
      setErrorMessage('Por favor ingresa la dirección URL de la página web.');
      return;
    }
    if (selectedType === 'script' && !scriptCode.trim()) {
      setErrorMessage('Por favor introduce el código o comando del script.');
      return;
    }

    setShowPreviewModal(true);
  };

  // Submit to Firestore and Local Cache
  const handleConfirmPublish = async () => {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const pubData = compilePublicationData();
      const created = await firestoreService.createPublication(pubData);
      setShowPreviewModal(false);
      onSuccess(created);
    } catch (err: any) {
      console.error('Error al publicar recurso:', err);
      setErrorMessage('Error al guardar la publicación: ' + (err.message || 'Intenta de nuevo.'));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="flex h-2 w-2 rounded-full bg-pink-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-pink-400">
            Aporte Comunitario
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Publicar Nuevo Recurso
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-gray-300">
          Comparte videojuegos, APKs, roms, emuladores, scripts o herramientas con los miembros de Vagos Exitosos.
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-rose-600/50 bg-rose-950/60 p-4 text-xs sm:text-sm text-rose-200 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Form Container */}
      <div className="rounded-3xl border border-purple-900/50 bg-[#111222] p-6 sm:p-8 shadow-2xl shadow-purple-950/40 space-y-8">
        {/* 1. SELECCIÓN DE CATEGORÍA PRINCIPAL */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-purple-400 mb-3">
            1. Tipo de Publicación (Categoría Principal)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'videojuego', label: 'Videojuego', icon: Gamepad2, desc: 'Android, PC o Port' },
              { id: 'aplicacion', label: 'Aplicación', icon: Smartphone, desc: 'APK o Windows' },
              { id: 'herramienta', label: 'Herramienta', icon: Wrench, desc: 'Tweaks y optimizadores' },
              { id: 'script', label: 'Script / Comando', icon: Code2, desc: 'Termux, Bash, Python' },
              { id: 'pagina_web', label: 'Página Web', icon: Globe, desc: 'Sitio o portal útil' },
              { id: 'archivo', label: 'Archivo', icon: FileText, desc: 'ZIP, RAR, paquetes' },
              { id: 'otro', label: 'Otro Recurso', icon: Sparkles, desc: 'Digital vario' },
            ].map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedType === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedType(cat.id as PublicationType)}
                  className={`flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'border-pink-500 bg-gradient-to-br from-purple-900/60 to-pink-950/60 text-white shadow-lg shadow-purple-950'
                      : 'border-purple-900/40 bg-[#16172d] text-gray-400 hover:text-white hover:border-purple-600/40'
                  }`}
                >
                  <Icon className={`h-5 w-5 mb-2 ${isSelected ? 'text-pink-400' : 'text-purple-400'}`} />
                  <span className="text-xs font-bold text-white">{cat.label}</span>
                  <span className="text-[10px] text-gray-400 mt-0.5">{cat.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. INFORMACIÓN GENERAL */}
        <div className="space-y-4 pt-4 border-t border-purple-900/30">
          <label className="block text-xs font-bold uppercase tracking-wider text-purple-400">
            2. Información General del Recurso
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Nombre del recurso o título <span className="text-pink-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. GTA San Andreas HD Remastered, Termux Server Script, etc."
                className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Descripción detallada <span className="text-pink-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe de qué trata el recurso, qué mejoras incluye, notas importantes o cómo fue probado..."
                className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Versión (opcional)
              </label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="Ej. v2.11, v1.0, Build 2026"
                className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Tamaño aproximado (opcional)
              </label>
              <input
                type="text"
                value={fileSize}
                onChange={(e) => setFileSize(e.target.value)}
                placeholder="Ej. 1.2 GB, 45 MB, 250 KB"
                className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 3. IMAGEN DE PORTADA */}
        <div className="space-y-4 pt-4 border-t border-purple-900/30">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-purple-400">
              3. Imagen de Portada
            </label>
            <div className="flex items-center gap-1 rounded-lg bg-[#16172d] p-1 border border-purple-900/40 text-xs">
              <button
                type="button"
                onClick={() => setImageMode('auto')}
                className={`rounded-md px-2.5 py-1 font-semibold transition-all ${
                  imageMode === 'auto' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Automática (Buscador)
              </button>
              <button
                type="button"
                onClick={() => setImageMode('manual')}
                className={`rounded-md px-2.5 py-1 font-semibold transition-all ${
                  imageMode === 'manual' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Manual (URL o Archivo)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Live Preview Box */}
            <div className="relative h-44 rounded-2xl overflow-hidden border border-purple-800/50 bg-[#16172d] group">
              <img
                src={coverImage}
                alt="Vista previa de portada"
                className="h-full w-full object-cover"
                onError={() =>
                  setCoverImage(
                    'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'
                  )
                }
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                <span className="text-[10px] font-bold text-white bg-purple-950/80 px-2 py-0.5 rounded border border-purple-700/40">
                  Vista Previa
                </span>
              </div>
            </div>

            {/* Controls depending on mode */}
            <div className="md:col-span-2 space-y-3">
              {imageMode === 'auto' ? (
                <div>
                  <p className="text-xs text-gray-300 mb-2">
                    {loadingSuggestions
                      ? 'Buscando portadas relacionadas...'
                      : suggestedCovers.length > 0
                      ? 'Haz clic en una imagen sugerida para seleccionarla:'
                      : 'Escribe el nombre del juego arriba para ver sugerencias automáticas.'}
                  </p>
                  {suggestedCovers.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {suggestedCovers.map((sug, i) => (
                        <div
                          key={i}
                          onClick={() => setCoverImage(sug.url)}
                          className={`relative h-20 rounded-xl overflow-hidden border cursor-pointer transition-all ${
                            coverImage === sug.url
                              ? 'border-pink-500 ring-2 ring-pink-500/50 scale-102'
                              : 'border-purple-900/40 opacity-70 hover:opacity-100 hover:border-purple-500'
                          }`}
                        >
                          <img src={sug.url} alt={sug.title} className="h-full w-full object-cover" />
                          {coverImage === sug.url && (
                            <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-pink-500 text-white flex items-center justify-center">
                              <CheckCircle2 className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Pegar URL directa de la imagen
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={coverUrlInput}
                        onChange={(e) => setCoverUrlInput(e.target.value)}
                        placeholder="https://ejemplo.com/portada.jpg"
                        className="flex-1 rounded-xl border border-purple-800/40 bg-[#0d0e19] px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (coverUrlInput.trim()) {
                            setCoverImage(coverUrlInput.trim());
                          }
                        }}
                        className="rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-purple-500"
                      >
                        Aplicar
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      O subir archivo desde tu dispositivo
                    </label>
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-purple-700/50 bg-[#16172d] p-3 text-xs text-purple-300 hover:border-pink-500 hover:text-white transition-all">
                      <Upload className="h-4 w-4" />
                      <span>Seleccionar imagen (PNG, JPG, WebP)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4. FORMULARIO DINÁMICO POR CATEGORÍA */}
        <div className="pt-4 border-t border-purple-900/30">
          <label className="block text-xs font-bold uppercase tracking-wider text-pink-400 mb-4">
            4. Campos Específicos para: {selectedType.toUpperCase()}
          </label>

          {/* A. VIDEOJUEGO */}
          {selectedType === 'videojuego' && (
            <div className="space-y-5">
              {/* Plataforma Selector */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-2">
                  Plataforma del Videojuego <span className="text-pink-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'android', label: 'Juego para Android', icon: Smartphone },
                    { id: 'pc', label: 'Juego para PC', icon: Monitor },
                    { id: 'port', label: 'Port / Adaptación', icon: HardDrive },
                    { id: 'otro', label: 'Otra Plataforma', icon: Gamepad2 },
                  ].map((plat) => {
                    const Icon = plat.icon;
                    const isSelected = gamePlatform === plat.id;
                    return (
                      <button
                        key={plat.id}
                        type="button"
                        onClick={() => setGamePlatform(plat.id as GamePlatform)}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                          isSelected
                            ? 'border-pink-500 bg-pink-950/40 text-pink-300'
                            : 'border-purple-900/30 bg-[#16172d] text-gray-400 hover:text-white'
                        }`}
                      >
                        <Icon className="h-4 w-4 text-purple-400" />
                        <span>{plat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sub-Modalidad: ANDROID */}
              {gamePlatform === 'android' && (
                <div className="space-y-4 rounded-2xl border border-purple-900/40 bg-[#131427] p-5">
                  <h4 className="text-xs font-bold uppercase text-purple-300 flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-pink-400" />
                    Detalles para Android
                  </h4>

                  {/* Modalidad de descarga */}
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Modalidad de descarga
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                        <input
                          type="radio"
                          name="androidMethod"
                          checked={androidDownloadMethod === 'drive'}
                          onChange={() => setAndroidDownloadMethod('drive')}
                          className="accent-pink-500"
                        />
                        <span>Google Drive (Recomendado)</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                        <input
                          type="radio"
                          name="androidMethod"
                          checked={androidDownloadMethod === 'external'}
                          onChange={() => setAndroidDownloadMethod('external')}
                          className="accent-pink-500"
                        />
                        <span>Enlace Externo (MediaFire, MEGA, Web)</span>
                      </label>
                    </div>
                  </div>

                  {/* Drive Instructions banner */}
                  {androidDownloadMethod === 'drive' && (
                    <div className="rounded-xl border border-purple-800/40 bg-[#1a1b38] p-4 text-xs text-purple-200 space-y-1">
                      <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                        <Info className="h-4 w-4 text-pink-400" />
                        Instrucciones para compartir desde Google Drive:
                      </div>
                      <ol className="list-decimal list-inside space-y-0.5 text-gray-300 text-[11px]">
                        <li>Abre Google Drive.</li>
                        <li>Sube el archivo APK (o DATA/OBB).</li>
                        <li>Selecciona «Compartir».</li>
                        <li>Configura el acceso para que «Cualquier persona con el enlace» pueda acceder.</li>
                        <li>Copia el enlace y pégalo a continuación.</li>
                      </ol>
                    </div>
                  )}

                  {/* Android Download URLs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Enlace principal APK <span className="text-pink-500">*</span>
                      </label>
                      <input
                        type="url"
                        value={androidApkUrl}
                        onChange={(e) => setAndroidApkUrl(e.target.value)}
                        placeholder="https://drive.google.com/file/d/... o enlace directo al APK"
                        className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Enlace archivo DATA (opcional)
                      </label>
                      <input
                        type="url"
                        value={androidDataUrl}
                        onChange={(e) => setAndroidDataUrl(e.target.value)}
                        placeholder="Enlace a archivo de datos"
                        className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Enlace archivo OBB (opcional)
                      </label>
                      <input
                        type="url"
                        value={androidObbUrl}
                        onChange={(e) => setAndroidObbUrl(e.target.value)}
                        placeholder="Enlace a archivos OBB"
                        className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-Modalidad: PC */}
              {gamePlatform === 'pc' && (
                <div className="space-y-4 rounded-2xl border border-purple-900/40 bg-[#131427] p-5">
                  <h4 className="text-xs font-bold uppercase text-purple-300 flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-pink-400" />
                    Detalles y Requisitos para PC
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Enlace de descarga para PC (Drive o Enlace Externo) <span className="text-pink-500">*</span>
                      </label>
                      <input
                        type="url"
                        value={pcDownloadUrl}
                        onChange={(e) => setPcDownloadUrl(e.target.value)}
                        placeholder="https://... enlace de descarga instalador o portable"
                        className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Sistema Operativo
                      </label>
                      <input
                        type="text"
                        value={pcOs}
                        onChange={(e) => setPcOs(e.target.value)}
                        placeholder="Windows 10 / 11"
                        className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] px-3.5 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        RAM Necesaria
                      </label>
                      <input
                        type="text"
                        value={pcRam}
                        onChange={(e) => setPcRam(e.target.value)}
                        placeholder="Ej. 8 GB o 16 GB"
                        className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] px-3.5 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Procesador
                      </label>
                      <input
                        type="text"
                        value={pcCpu}
                        onChange={(e) => setPcCpu(e.target.value)}
                        placeholder="Ej. Intel Core i5 / AMD Ryzen"
                        className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] px-3.5 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Almacenamiento Requerido
                      </label>
                      <input
                        type="text"
                        value={pcStorage}
                        onChange={(e) => setPcStorage(e.target.value)}
                        placeholder="Ej. 15 GB libres"
                        className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] px-3.5 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Tarjeta Gráfica (GPU)
                      </label>
                      <input
                        type="text"
                        value={pcGpu}
                        onChange={(e) => setPcGpu(e.target.value)}
                        placeholder="Ej. NVIDIA GTX 1060 / Gráficos integrados Iris Xe"
                        className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] px-3.5 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-Modalidad: PORT / ADAPTACIÓN */}
              {gamePlatform === 'port' && (
                <div className="space-y-4 rounded-2xl border border-pink-700/50 bg-[#1d142b] p-5">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5 text-pink-400" />
                    <div>
                      <h4 className="text-xs font-bold uppercase text-white">
                        Port / Adaptación Móvil
                      </h4>
                      <p className="text-[11px] text-pink-200">
                        Esta modalidad es para juegos adaptados a dispositivos móviles. El APK corresponde a la aplicación y el ISO contiene los datos del juego.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-white mb-1">
                        Archivo APK (Aplicación / Emulador) <span className="text-pink-400">*</span>
                      </label>
                      <input
                        type="url"
                        required
                        value={portApkUrl}
                        onChange={(e) => setPortApkUrl(e.target.value)}
                        placeholder="Enlace al archivo APK"
                        className="w-full rounded-xl border border-pink-800/60 bg-[#0e0a16] px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-pink-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white mb-1">
                        Archivo ISO (Datos del Juego) <span className="text-pink-400">*</span>
                      </label>
                      <input
                        type="url"
                        required
                        value={portIsoUrl}
                        onChange={(e) => setPortIsoUrl(e.target.value)}
                        placeholder="Enlace al archivo ISO"
                        className="w-full rounded-xl border border-pink-800/60 bg-[#0e0a16] px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-pink-400 focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Requisitos de Emulación / Dispositivo
                      </label>
                      <input
                        type="text"
                        value={portRequirements}
                        onChange={(e) => setPortRequirements(e.target.value)}
                        placeholder="Ej. Android 9.0+, compatible con PPSSPP o Dolphin"
                        className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] px-3.5 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* B. APLICACIÓN */}
          {selectedType === 'aplicacion' && (
            <div className="space-y-4 rounded-2xl border border-purple-900/40 bg-[#131427] p-5">
              <h4 className="text-xs font-bold uppercase text-purple-300 flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-pink-400" />
                Detalles de la Aplicación
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Sistema Operativo Compatible
                  </label>
                  <select
                    value={appOs}
                    onChange={(e) => setAppOs(e.target.value)}
                    className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] px-3.5 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                  >
                    <option value="Android">Android (APK)</option>
                    <option value="Windows">Windows (EXE / MSI)</option>
                    <option value="Linux">Linux</option>
                    <option value="Multiplataforma">Multiplataforma</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Enlace de Descarga Directa o Drive <span className="text-pink-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={appDownloadUrl}
                    onChange={(e) => setAppDownloadUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] px-3.5 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Requisitos Adicionales (opcional)
                  </label>
                  <input
                    type="text"
                    value={appRequirements}
                    onChange={(e) => setAppRequirements(e.target.value)}
                    placeholder="Ej. Requiere Root, Permiso de orígenes desconocidos, etc."
                    className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] px-3.5 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* C. PÁGINA WEB */}
          {selectedType === 'pagina_web' && (
            <div className="space-y-4 rounded-2xl border border-purple-900/40 bg-[#131427] p-5">
              <h4 className="text-xs font-bold uppercase text-purple-300 flex items-center gap-2">
                <Globe className="h-4 w-4 text-cyan-400" />
                Detalles del Sitio o Portal Web
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Dirección URL de la página <span className="text-pink-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={webUrl}
                    onChange={(e) => setWebUrl(e.target.value)}
                    placeholder="https://ejemplo-utilidad.com"
                    className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] px-3.5 py-2.5 text-xs text-white focus:border-pink-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Tipo de Página o Servicio
                  </label>
                  <input
                    type="text"
                    value={webType}
                    onChange={(e) => setWebType(e.target.value)}
                    placeholder="Ej. Generador, Base de datos, Foro, Herramienta Online"
                    className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] px-3.5 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Información Adicional
                  </label>
                  <input
                    type="text"
                    value={webExtraInfo}
                    onChange={(e) => setWebExtraInfo(e.target.value)}
                    placeholder="Ej. No requiere registro, Gratuito, API Key opcional"
                    className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] px-3.5 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* D. HERRAMIENTA */}
          {selectedType === 'herramienta' && (
            <div className="space-y-4 rounded-2xl border border-purple-900/40 bg-[#131427] p-5">
              <h4 className="text-xs font-bold uppercase text-purple-300 flex items-center gap-2">
                <Wrench className="h-4 w-4 text-amber-400" />
                Detalles de la Herramienta
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Función Principal
                  </label>
                  <input
                    type="text"
                    value={toolFunction}
                    onChange={(e) => setToolFunction(e.target.value)}
                    placeholder="Ej. Reducir input lag, limpiar temporales, compresión de video"
                    className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] px-3.5 py-2.5 text-xs text-white focus:border-pink-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Sistema Compatible
                  </label>
                  <input
                    type="text"
                    value={toolOs}
                    onChange={(e) => setToolOs(e.target.value)}
                    placeholder="Ej. Windows 10/11, Android, Linux"
                    className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] px-3.5 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Enlace de Descarga o Acceso <span className="text-pink-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={toolDownloadUrl}
                    onChange={(e) => setToolDownloadUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] px-3.5 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* E. ARCHIVO */}
          {selectedType === 'archivo' && (
            <div className="space-y-4 rounded-2xl border border-purple-900/40 bg-[#131427] p-5">
              <h4 className="text-xs font-bold uppercase text-purple-300 flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-400" />
                Detalles del Archivo
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Formato del Archivo
                  </label>
                  <input
                    type="text"
                    value={fileFormat}
                    onChange={(e) => setFileFormat(e.target.value)}
                    placeholder="Ej. ZIP, RAR, 7Z, ISO, TAR.GZ"
                    className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] px-3.5 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Enlace de Descarga <span className="text-pink-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={fileDownloadUrl}
                    onChange={(e) => setFileDownloadUrl(e.target.value)}
                    placeholder="https://drive.google.com/... o enlace directo"
                    className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] px-3.5 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* F. SCRIPT / COMANDO */}
          {selectedType === 'script' && (
            <div className="space-y-4 rounded-2xl border border-purple-900/40 bg-[#131427] p-5">
              <h4 className="text-xs font-bold uppercase text-purple-300 flex items-center gap-2">
                <Code2 className="h-4 w-4 text-pink-400" />
                Editor de Código y Comando
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Lenguaje o Tipo de Script
                  </label>
                  <select
                    value={scriptLanguage}
                    onChange={(e) => setScriptLanguage(e.target.value)}
                    className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] px-3.5 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                  >
                    <option value="bash">Bash / Shell</option>
                    <option value="python">Python</option>
                    <option value="powershell">PowerShell</option>
                    <option value="batch">Batch (.bat / Windows)</option>
                    <option value="javascript">Node.js / JS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Sistema Compatible
                  </label>
                  <input
                    type="text"
                    value={scriptOs}
                    onChange={(e) => setScriptOs(e.target.value)}
                    placeholder="Ej. Termux (Android), Ubuntu, Windows CMD"
                    className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] px-3.5 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Code Box */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Código o comando para ejecutar <span className="text-pink-500">*</span>
                </label>
                <div className="rounded-2xl border border-purple-900/60 bg-[#090a12] p-3 font-mono text-xs">
                  <div className="text-[10px] text-gray-500 border-b border-purple-950 pb-1 mb-2 flex items-center justify-between">
                    <span>TERMINAL / EDITOR</span>
                    <span>{scriptLanguage.toUpperCase()}</span>
                  </div>
                  <textarea
                    rows={6}
                    value={scriptCode}
                    onChange={(e) => setScriptCode(e.target.value)}
                    placeholder="# Pega aquí el comando o script..."
                    className="w-full bg-transparent font-mono text-xs text-purple-200 placeholder-gray-600 focus:outline-none resize-y"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Archivo de descarga opcional (.sh, .py, .bat)
                </label>
                <input
                  type="url"
                  value={scriptOptionalUrl}
                  onChange={(e) => setScriptOptionalUrl(e.target.value)}
                  placeholder="https://... enlace al script sin comprimir"
                  className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] px-3.5 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* 5. ARCHIVOS ADICIONALES (OPCIONAL PARA CUALQUIER TIPO) */}
        <div className="space-y-4 pt-4 border-t border-purple-900/30">
          <label className="block text-xs font-bold uppercase tracking-wider text-purple-400">
            5. Archivos Adicionales (Parches, Texturas, Trucos, etc.)
          </label>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="Nombre del archivo (Ej. Texturas HD 4K)"
              className="flex-1 rounded-xl border border-purple-800/40 bg-[#0d0e19] px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none"
            />
            <input
              type="url"
              value={newFileUrl}
              onChange={(e) => setNewFileUrl(e.target.value)}
              placeholder="Enlace de descarga (Drive o directo)"
              className="flex-1 rounded-xl border border-purple-800/40 bg-[#0d0e19] px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddAdditionalFile}
              className="inline-flex items-center justify-center gap-1 rounded-xl bg-purple-700 px-4 py-2 text-xs font-bold text-white hover:bg-purple-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Agregar</span>
            </button>
          </div>

          {additionalFiles.length > 0 && (
            <div className="space-y-2 mt-2">
              {additionalFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between rounded-xl bg-[#141527] p-2.5 px-3 border border-purple-900/30 text-xs"
                >
                  <div className="flex items-center gap-2 truncate max-w-[80%]">
                    <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />
                    <span className="font-semibold text-white">{file.name}:</span>
                    <span className="text-gray-400 truncate">{file.url}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAdditionalFile(file.id)}
                    className="text-gray-400 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 6. INSTRUCCIONES DE USO */}
        <div className="space-y-3 pt-4 border-t border-purple-900/30">
          <label className="block text-xs font-bold uppercase tracking-wider text-purple-400">
            6. Instrucciones de Instalación o Utilización (Opcional)
          </label>
          <textarea
            rows={3}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="1. Descomprime el archivo en la ruta...&#10;2. Instala la aplicación...&#10;3. En caso de error, verifica..."
            className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none resize-none"
          />
        </div>

        {/* SUBMIT BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-purple-900/40">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto rounded-xl border border-purple-800/40 bg-[#16172d] px-6 py-3 text-xs font-semibold text-gray-300 hover:text-white hover:bg-purple-950/40 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleValidateAndPreview}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 px-8 py-3 text-xs font-bold text-white shadow-lg shadow-purple-900/50 hover:opacity-95 hover:scale-102 transition-all"
          >
            <Eye className="h-4 w-4" />
            <span>Previsualizar y Publicar</span>
          </button>
        </div>
      </div>

      {/* FULL PREVIEW MODAL BEFORE CONFIRMATION */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="relative my-8 w-full max-w-2xl rounded-3xl border border-purple-700/60 bg-[#111222] p-6 sm:p-8 shadow-2xl shadow-purple-950/80 space-y-6">
            <div className="flex items-center justify-between border-b border-purple-900/40 pb-4">
              <div>
                <h3 className="text-lg font-black text-white">Confirmar Publicación</h3>
                <p className="text-xs text-gray-400">Verifica que todos los enlaces y datos sean correctos.</p>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Preview Card */}
            <div className="space-y-4">
              <div className="relative h-48 w-full rounded-2xl overflow-hidden border border-purple-800/40">
                <img src={coverImage} alt={title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                  <div>
                    <span className="rounded-full bg-pink-950/90 border border-pink-500/50 px-2.5 py-0.5 text-[10px] font-bold text-pink-300 uppercase">
                      {selectedType}
                    </span>
                    <h4 className="text-lg font-black text-white mt-1">{title}</h4>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-[#16172d] p-4 text-xs text-gray-300 space-y-2">
                <p className="leading-relaxed">{description}</p>
                <div className="pt-2 border-t border-purple-900/30 flex flex-wrap gap-4 text-[11px] text-gray-400">
                  <span>Autor: <strong className="text-white">{user?.displayName || 'Miembro de Vagos'}</strong></span>
                  {version && <span>Versión: <strong className="text-white">{version}</strong></span>}
                  {fileSize && <span>Tamaño: <strong className="text-white">{fileSize}</strong></span>}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-purple-900/40">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowPreviewModal(false)}
                className="rounded-xl border border-purple-800/40 bg-[#16172d] px-5 py-2.5 text-xs font-semibold text-gray-300 hover:text-white"
              >
                Volver a Editar
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmPublish}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-900/50 hover:opacity-95"
              >
                {isSubmitting ? (
                  <span>Guardando en Firebase...</span>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Confirmar y Publicar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
