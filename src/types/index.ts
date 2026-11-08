export type UserRole = 'user' | 'admin';

export interface UserProfile {
  uid: string;
  displayName: string;
  role: UserRole;
  profileImage?: string;
  phoneNumber?: string;
  email?: string;
  createdAt: string;
}

export type PublicationType =
  | 'videojuego'
  | 'aplicacion'
  | 'pagina_web'
  | 'herramienta'
  | 'archivo'
  | 'script'
  | 'otro';

export type GamePlatform = 'android' | 'pc' | 'port' | 'otro';

export interface DownloadLinkItem {
  id: string;
  name: string;
  url: string;
  type: 'direct' | 'drive' | 'mirror';
}

export interface Publication {
  id: string;
  title: string;
  description: string;
  type: PublicationType;
  platform?: string;
  coverImage: string;
  imageMode: 'auto' | 'manual';
  version?: string;
  fileSize?: string;
  requirements?: {
    os?: string;
    ram?: string;
    cpu?: string;
    storage?: string;
    gpu?: string;
    additional?: string;
  } | string;
  downloadLinks: {
    primaryUrl?: string;
    primaryType?: 'direct' | 'drive' | 'mirror';
    apkUrl?: string;
    dataUrl?: string;
    obbUrl?: string;
    isoUrl?: string;
    pcUrl?: string;
    webUrl?: string;
    additionalFiles?: DownloadLinkItem[];
  };
  instructions?: string;
  scriptCode?: string;
  scriptLanguage?: string;
  authorId: string;
  authorName: string;
  featured: boolean;
  status: 'active' | 'hidden' | 'deleted';
  createdAt: string;
  updatedAt: string;
}

export type ReportType =
  | 'enlace_caido'
  | 'archivo_danado'
  | 'apk_no_funciona'
  | 'error_instalacion'
  | 'informacion_incorrecta'
  | 'pagina_caida'
  | 'posible_malicioso'
  | 'otro';

export type ReportStatus = 'pendiente' | 'en_revision' | 'solucionado' | 'rechazado';

export interface Report {
  id: string;
  publicationId: string;
  publicationTitle: string;
  userId: string;
  userDisplayName: string;
  reportType: ReportType;
  description: string;
  status: ReportStatus;
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CommunityInfo {
  name: string;
  description: string;
  creator: string;
  assistantName: string;
  assistantAvatar?: string;
  whatsappGroup: string;
  whatsappChannel?: string;
  rules: string;
  version: string;
  updatedAt?: string;
}
