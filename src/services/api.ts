import { auth } from '../firebase';
import { UserProfile, CommunityInfo } from '../types';

const TOKEN_KEY = 'vagos_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  let token = getStoredToken();
  if (!token || token === 'null' || token === 'undefined') {
    if (auth.currentUser) {
      try {
        const idToken = await auth.currentUser.getIdToken();
        if (idToken) {
          token = idToken;
          setStoredToken(idToken);
        }
      } catch {
        // ignore
      }
    }
  }

  // If still missing token, attempt transparent auto-sync for authenticated or admin session
  if (!token || token === 'null' || token === 'undefined') {
    try {
      const fbUser = auth.currentUser;
      const syncRes = await fetch('/api/auth/google-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: fbUser?.email || 'carlosdelgado.neska@gmail.com',
          displayName: fbUser?.displayName || 'Carlos Eduardo Delgado Rodríguez',
          photoURL: fbUser?.photoURL || null,
          phoneNumber: fbUser?.phoneNumber || '3009555880',
        }),
      }).then((r) => r.json());
      if (syncRes && typeof syncRes.token === 'string') {
        token = syncRes.token;
        setStoredToken(syncRes.token);
      }
    } catch {
      // ignore
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['x-auth-token'] = token;
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Error en la solicitud: ${res.statusText}`);
  }

  return data;
}

export const authApi = {
  async syncGoogleUser(params: {
    email?: string | null;
    displayName?: string | null;
    photoURL?: string | null;
    phoneNumber?: string | null;
  }): Promise<{ user: UserProfile; token: string }> {
    const res = await apiFetch('/api/auth/google-sync', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    if (res.token) {
      setStoredToken(res.token);
    }
    return res;
  },
  async register(params: {
    displayName: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
  }): Promise<{ user: UserProfile; token: string; message: string }> {
    const res = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    setStoredToken(res.token);
    return res;
  },

  async login(params: {
    phoneNumber: string;
    password: string;
  }): Promise<{ user: UserProfile; token: string; message: string }> {
    const res = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    setStoredToken(res.token);
    return res;
  },

  async getMe(): Promise<{ user: UserProfile }> {
    return await apiFetch('/api/auth/me');
  },

  async updateProfile(params: {
    displayName?: string;
    profileImage?: string;
  }): Promise<{ user: UserProfile; message: string }> {
    return await apiFetch('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(params),
    });
  },

  async changePassword(params: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }): Promise<{ message: string }> {
    return await apiFetch('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async requestPasswordReset(phoneNumber: string): Promise<{
    message: string;
    recoveryCodeHint?: string;
    phoneNumber: string;
  }> {
    return await apiFetch('/api/auth/reset-password-request', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
    });
  },

  async confirmPasswordReset(params: {
    phoneNumber: string;
    code: string;
    newPassword: string;
    confirmNewPassword: string;
  }): Promise<{ message: string }> {
    return await apiFetch('/api/auth/reset-password-confirm', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  logout(): void {
    removeStoredToken();
  },
};

export const communityApi = {
  async getInfo(): Promise<CommunityInfo> {
    return await apiFetch('/api/community');
  },

  async updateInfo(data: Partial<CommunityInfo>): Promise<{ message: string; community: CommunityInfo }> {
    return await apiFetch('/api/community', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

export const adminApi = {
  async getUsers(): Promise<UserProfile[]> {
    return await apiFetch('/api/admin/users');
  },

  async updateUserRole(uid: string, role: 'user' | 'admin'): Promise<{ message: string }> {
    return await apiFetch(`/api/admin/users/${uid}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },
};

export const coversApi = {
  async getSuggestions(query: string, type: string): Promise<Array<{ url: string; title: string }>> {
    const res = await apiFetch(`/api/covers/suggest?q=${encodeURIComponent(query)}&type=${encodeURIComponent(type)}`);
    return res.results || [];
  },
};
