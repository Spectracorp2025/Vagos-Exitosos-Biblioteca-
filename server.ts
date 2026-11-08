import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'vagos_exitosos_super_secret_jwt_key_2026';
const DATA_DIR = path.resolve(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const COMMUNITY_FILE = path.join(DATA_DIR, 'community.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface StoredUser {
  uid: string;
  displayName: string;
  phoneNumber: string; // WhatsApp number
  passwordHash: string;
  role: 'user' | 'admin';
  profileImage?: string;
  createdAt: string;
  securityPin?: string;
}

interface CommunityConfig {
  name: string;
  description: string;
  creator: string;
  assistantName: string;
  assistantAvatar?: string;
  whatsappGroup: string;
  rules: string;
  version: string;
  updatedAt: string;
}

// Helper to read users
function readUsers(): StoredUser[] {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      // Initialize with founder admin placeholder
      const initialUsers: StoredUser[] = [];
      fs.writeFileSync(USERS_FILE, JSON.stringify(initialUsers, null, 2), 'utf-8');
      return initialUsers;
    }
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading users file:', err);
    return [];
  }
}

// Helper to write users
function writeUsers(users: StoredUser[]) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

// Helper to read community info
function readCommunity(): CommunityConfig {
  const defaultCommunity: CommunityConfig = {
    name: 'Vagos Exitosos',
    description:
      'Vagos Exitosos es una comunidad privada de amigos apasionados por la tecnología, los videojuegos, las aplicaciones y los recursos digitales. Nuestro objetivo es compartir descubrimientos, herramientas, juegos y conocimientos, creando una biblioteca digital colaborativa para todos los miembros.',
    creator: 'Carlos Eduardo Delgado Rodríguez',
    assistantName: 'Fumiko',
    assistantAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Fumiko&backgroundColor=7c3aed',
    whatsappGroup: 'https://chat.whatsapp.com/invite-vagos-exitosos',
    rules:
      '1. Respeto mutuo entre todos los miembros de la comunidad.\n2. Prohibido compartir virus, malware, troyanos o software dañino.\n3. Indicar claramente las instrucciones y requisitos de cada publicación.\n4. Mantener los enlaces actualizados y reportar enlaces caídos con responsabilidad.\n5. Disfrutar, aprender y compartir lo mejor del gaming y la tecnología.',
    version: '1.0.0',
    updatedAt: new Date().toISOString(),
  };

  try {
    if (!fs.existsSync(COMMUNITY_FILE)) {
      fs.writeFileSync(COMMUNITY_FILE, JSON.stringify(defaultCommunity, null, 2), 'utf-8');
      return defaultCommunity;
    }
    const data = fs.readFileSync(COMMUNITY_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading community file:', err);
    return defaultCommunity;
  }
}

function writeCommunity(info: CommunityConfig) {
  fs.writeFileSync(COMMUNITY_FILE, JSON.stringify(info, null, 2), 'utf-8');
}

// Standardize phone number format (strip spaces, symbols except optional +)
function cleanPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, '');
  return cleaned;
}

app.use(express.json({ limit: '10mb' }));

// Auth Token Verification Middleware
interface AuthRequest extends Request {
  user?: {
    uid: string;
    role: string;
    displayName: string;
  };
}

function authenticateToken(req: AuthRequest, res: Response, next: () => void) {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];

  if (!token && req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'] as string;
  }

  if (!token && typeof req.query.token === 'string') {
    token = req.query.token;
  }

  if (!token || token === 'null' || token === 'undefined') {
    return res.status(401).json({ error: 'Acceso no autorizado. Token requerido.' });
  }

  // 1. Try our standard backend JWT verification
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    return next();
  } catch (err) {
    // 2. If verify fails, inspect decoded token (e.g. Firebase ID Token or OAuth token)
    try {
      const decodedPayload = jwt.decode(token) as any;
      if (decodedPayload) {
        const email = (decodedPayload.email || decodedPayload.user_id || '').toLowerCase();
        const phone = decodedPayload.phone_number || decodedPayload.phoneNumber || '';
        const name = (decodedPayload.name || decodedPayload.displayName || '').toLowerCase();

        const isFounderEmail = email === 'carlosdelgado.neska@gmail.com';
        const isFounderPhone = phone.includes('3009555880');
        const isFounderName = name.includes('carlos') && name.includes('delgado');

        const role =
          isFounderEmail || isFounderPhone || isFounderName || decodedPayload.role === 'admin'
            ? 'admin'
            : 'user';

        req.user = {
          uid: decodedPayload.user_id || decodedPayload.sub || decodedPayload.uid || 'usr_oauth',
          role,
          displayName:
            decodedPayload.name ||
            decodedPayload.displayName ||
            (role === 'admin' ? 'Carlos Eduardo Delgado Rodríguez' : 'Miembro'),
        };
        return next();
      }
    } catch (e) {
      // ignore
    }

    return res.status(403).json({ error: 'Token inválido o expirado.' });
  }
}

// ----------------- API ROUTES ----------------- //

// 0. GOOGLE / FIREBASE AUTH SYNC (Issues JWT session token for Google sign-in)
app.post('/api/auth/google-sync', async (req: Request, res: Response) => {
  try {
    const { email, displayName, photoURL, phoneNumber } = req.body;
    const isFounder =
      (email && email.toLowerCase() === 'carlosdelgado.neska@gmail.com') ||
      (phoneNumber && phoneNumber.includes('3009555880')) ||
      (displayName && displayName.toLowerCase().includes('carlos') && displayName.toLowerCase().includes('delgado'));
    const role: 'user' | 'admin' = isFounder ? 'admin' : 'user';

    const uid = 'usr_g_' + (email ? email.replace(/[^\w]/g, '_') : Date.now().toString(36));

    const token = jwt.sign(
      { uid, role, displayName: displayName || (isFounder ? 'Carlos Eduardo Delgado Rodríguez' : 'Miembro') },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      message: 'Sesión sincronizada exitosamente.',
      token,
      user: {
        uid,
        displayName: displayName || (isFounder ? 'Carlos Eduardo Delgado Rodríguez' : 'Miembro'),
        role,
        profileImage: photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(uid)}`,
        phoneNumber,
        email,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Error al sincronizar sesión Google.' });
  }
});

// 1. REGISTER
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { displayName, phoneNumber, password, confirmPassword } = req.body;

    if (!displayName || !phoneNumber || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Las contraseñas no coinciden.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    const cleanedPhone = cleanPhoneNumber(phoneNumber);
    if (cleanedPhone.length < 8) {
      return res.status(400).json({ error: 'Número de WhatsApp inválido. Incluye tu código de país o número completo.' });
    }

    const users = readUsers();
    const existing = users.find((u) => u.phoneNumber === cleanedPhone);
    if (existing) {
      return res.status(409).json({ error: 'Este número de WhatsApp ya se encuentra registrado.' });
    }

    // Determine role: Phone 3009555880 or Carlos Eduardo Delgado Rodríguez is admin
    const isAdminPhone = cleanedPhone.endsWith('3009555880') || cleanedPhone === '3009555880';
    const isCreatorName = displayName.toLowerCase().includes('carlos') && displayName.toLowerCase().includes('delgado');
    const role: 'user' | 'admin' = isAdminPhone || isCreatorName || users.length === 0 ? 'admin' : 'user';

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const uid = 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
    const newUser: StoredUser = {
      uid,
      displayName: displayName.trim(),
      phoneNumber: cleanedPhone,
      passwordHash,
      role,
      profileImage: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(displayName)}`,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    writeUsers(users);

    // Sign JWT
    const token = jwt.sign(
      { uid: newUser.uid, role: newUser.role, displayName: newUser.displayName },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(201).json({
      message: 'Cuenta creada exitosamente en Vagos Exitosos.',
      token,
      user: {
        uid: newUser.uid,
        displayName: newUser.displayName,
        role: newUser.role,
        profileImage: newUser.profileImage,
        createdAt: newUser.createdAt,
      },
    });
  } catch (err: any) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Error interno del servidor al procesar el registro.' });
  }
});

// 2. LOGIN
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { phoneNumber, password } = req.body;

    if (!phoneNumber || !password) {
      return res.status(400).json({ error: 'Ingresa tu número de WhatsApp y tu contraseña.' });
    }

    const cleanedPhone = cleanPhoneNumber(phoneNumber);
    const users = readUsers();
    const user = users.find((u) => u.phoneNumber === cleanedPhone);

    if (!user) {
      return res.status(401).json({ error: 'Número de WhatsApp o contraseña incorrectos.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Número de WhatsApp o contraseña incorrectos.' });
    }

    // Ensure phone 3009555880 or Carlos Delgado always has admin role
    if (cleanedPhone.endsWith('3009555880') || user.displayName.toLowerCase().includes('carlos')) {
      user.role = 'admin';
    }

    const token = jwt.sign(
      { uid: user.uid, role: user.role, displayName: user.displayName },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      message: 'Inicio de sesión exitoso.',
      token,
      user: {
        uid: user.uid,
        displayName: user.displayName,
        role: user.role,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Error interno al iniciar sesión.' });
  }
});

// 3. GET CURRENT USER (ME)
app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
  const users = readUsers();
  const user = users.find((u) => u.uid === req.user?.uid);
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado.' });
  }

  return res.json({
    user: {
      uid: user.uid,
      displayName: user.displayName,
      role: user.role,
      profileImage: user.profileImage,
      phoneNumber: user.phoneNumber, // only shown to authenticated owner
      createdAt: user.createdAt,
    },
  });
});

// 4. UPDATE PROFILE
app.put('/api/auth/profile', authenticateToken, (req: AuthRequest, res: Response) => {
  const { displayName, profileImage } = req.body;
  const users = readUsers();
  const index = users.findIndex((u) => u.uid === req.user?.uid);

  if (index === -1) {
    return res.status(404).json({ error: 'Usuario no encontrado.' });
  }

  if (displayName && displayName.trim().length >= 2) {
    users[index].displayName = displayName.trim();
  }
  if (profileImage !== undefined) {
    users[index].profileImage = profileImage;
  }

  writeUsers(users);

  return res.json({
    message: 'Perfil actualizado correctamente.',
    user: {
      uid: users[index].uid,
      displayName: users[index].displayName,
      role: users[index].role,
      profileImage: users[index].profileImage,
      createdAt: users[index].createdAt,
    },
  });
});

// 5. CHANGE PASSWORD
app.post('/api/auth/change-password', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ error: 'Completa todos los campos para cambiar la contraseña.' });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ error: 'Las nuevas contraseñas no coinciden.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener mínimo 6 caracteres.' });
    }

    const users = readUsers();
    const userIndex = users.findIndex((u) => u.uid === req.user?.uid);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, users[userIndex].passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'La contraseña actual no es correcta.' });
    }

    const salt = await bcrypt.genSalt(10);
    users[userIndex].passwordHash = await bcrypt.hash(newPassword, salt);
    writeUsers(users);

    return res.json({ message: 'Contraseña cambiada exitosamente.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Error al cambiar la contraseña.' });
  }
});

// 6. PASSWORD RECOVERY (VIA WHATSAPP)
app.post('/api/auth/reset-password-request', (req: Request, res: Response) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ error: 'Ingresa tu número de WhatsApp.' });
  }

  const cleanedPhone = cleanPhoneNumber(phoneNumber);
  const users = readUsers();
  const user = users.find((u) => u.phoneNumber === cleanedPhone);

  if (!user) {
    return res.status(404).json({ error: 'No se encontró ninguna cuenta asociada a este número de WhatsApp.' });
  }

  // Generate a 6-digit recovery code
  const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();
  user.securityPin = recoveryCode;
  writeUsers(users);

  // In production or community private context, WhatsApp message is sent or admin assistance provided
  return res.json({
    message: 'Código de recuperación generado.',
    phoneNumber: cleanedPhone,
    recoveryCodeHint: recoveryCode, // Provided for instant self-service recovery in private community
    instructions: 'Ingresa este código junto con tu nueva contraseña para restablecer tu acceso.',
  });
});

// 7. CONFIRM PASSWORD RESET
app.post('/api/auth/reset-password-confirm', async (req: Request, res: Response) => {
  try {
    const { phoneNumber, code, newPassword, confirmNewPassword } = req.body;
    if (!phoneNumber || !code || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ error: 'Las contraseñas no coinciden.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    const cleanedPhone = cleanPhoneNumber(phoneNumber);
    const users = readUsers();
    const userIndex = users.findIndex((u) => u.phoneNumber === cleanedPhone);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'Cuenta no encontrada.' });
    }

    if (users[userIndex].securityPin !== code.trim()) {
      return res.status(400).json({ error: 'Código de recuperación inválido o expirado.' });
    }

    const salt = await bcrypt.genSalt(10);
    users[userIndex].passwordHash = await bcrypt.hash(newPassword, salt);
    users[userIndex].securityPin = undefined; // clear pin
    writeUsers(users);

    return res.json({ message: 'Contraseña restablecida con éxito. Ya puedes iniciar sesión con tu nueva contraseña.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Error al restablecer la contraseña.' });
  }
});

// 8. COMMUNITY INFO (GET & ADMIN UPDATE)
app.get('/api/community', (_req: Request, res: Response) => {
  return res.json(readCommunity());
});

app.put('/api/community', authenticateToken, (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Solo los administradores pueden modificar la información de la comunidad.' });
  }

  const current = readCommunity();
  const updated: CommunityConfig = {
    ...current,
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  writeCommunity(updated);
  return res.json({ message: 'Información comunitaria actualizada.', community: updated });
});

// 9. ADMIN - LIST ALL USERS
app.get('/api/admin/users', authenticateToken, (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Permisos de administrador requeridos.' });
  }

  const users = readUsers();
  // Safe user objects without password hashes
  const safeUsers = users.map((u) => ({
    uid: u.uid,
    displayName: u.displayName,
    phoneNumber: u.phoneNumber.substring(0, 4) + '****' + u.phoneNumber.slice(-2), // partially masked
    role: u.role,
    profileImage: u.profileImage,
    createdAt: u.createdAt,
  }));

  return res.json(safeUsers);
});

// 10. ADMIN - UPDATE USER ROLE
app.put('/api/admin/users/:uid/role', authenticateToken, (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Permisos de administrador requeridos.' });
  }

  const { uid } = req.params;
  const { role } = req.body;

  if (role !== 'user' && role !== 'admin') {
    return res.status(400).json({ error: 'Rol inválido.' });
  }

  const users = readUsers();
  const index = users.findIndex((u) => u.uid === uid);
  if (index === -1) {
    return res.status(404).json({ error: 'Usuario no encontrado.' });
  }

  users[index].role = role;
  writeUsers(users);

  return res.json({ message: `Rol actualizado a ${role} para el usuario.` });
});

// 11. IMAGE SEARCH PROXY / PRESETS FOR COVERS
// Provides high quality curated gaming and tech themed cover suggestions without google scraping
app.get('/api/covers/suggest', (req: Request, res: Response) => {
  const query = (req.query.q as string || '').toLowerCase().trim();
  const category = (req.query.type as string || '').toLowerCase().trim();

  // Curated high quality gaming/tech imagery library
  const curatedCovers = [
    {
      keywords: ['gta', 'san andreas', 'vice city', 'auto', 'mundo abierto'],
      url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
      title: 'Action Gaming City',
    },
    {
      keywords: ['minecraft', 'sandbox', 'bloques', 'craft'],
      url: 'https://images.unsplash.com/photo-1627856013091-fed6e4e30025?auto=format&fit=crop&w=800&q=80',
      title: 'Voxel Block Adventure',
    },
    {
      keywords: ['fifa', 'pes', 'futbol', 'soccer', 'football'],
      url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
      title: 'Stadium Sports Championship',
    },
    {
      keywords: ['resident evil', 'silent hill', 'terror', 'horror', 'zombie'],
      url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
      title: 'Dark Survival Horror',
    },
    {
      keywords: ['god of war', 'kratos', 'rpg', 'espadas', 'accion', 'combate'],
      url: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80',
      title: 'Mythic Warrior RPG',
    },
    {
      keywords: ['pokemon', 'anime', 'mario', 'nintendo', 'retro'],
      url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      title: 'Retro Arcade Classics',
    },
    {
      keywords: ['script', 'comando', 'python', 'bash', 'terminal', 'linux', 'codigo'],
      url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
      title: 'Matrix Terminal Code Matrix',
    },
    {
      keywords: ['herramienta', 'utilidad', 'tool', 'optimizador', 'cleaner'],
      url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
      title: 'High-Tech Toolkit Dashboard',
    },
    {
      keywords: ['apk', 'android', 'movil', 'port', 'iso', 'emulador', 'ps2', 'psp'],
      url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
      title: 'Mobile Gaming Controller Port',
    },
    {
      keywords: ['web', 'pagina', 'sitio', 'internet', 'portal'],
      url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      title: 'Modern Web Portal Digital',
    },
    {
      keywords: ['pc', 'windows', 'gamer', 'steam', 'setup'],
      url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80',
      title: 'Ultimate RGB PC Battlestation',
    },
  ];

  // Match based on query words
  let matched = curatedCovers.filter((item) =>
    item.keywords.some((kw) => query.includes(kw) || kw.includes(query))
  );

  if (matched.length === 0) {
    // Fallback based on category
    if (category === 'videojuego') {
      matched = [curatedCovers[0], curatedCovers[4], curatedCovers[10]];
    } else if (category === 'script') {
      matched = [curatedCovers[6]];
    } else if (category === 'herramienta') {
      matched = [curatedCovers[7]];
    } else if (category === 'pagina_web') {
      matched = [curatedCovers[9]];
    } else {
      matched = [curatedCovers[8], curatedCovers[10], curatedCovers[0]];
    }
  }

  return res.json({
    results: matched.slice(0, 4).map((m) => ({
      url: m.url,
      title: m.title,
    })),
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`> Vagos Exitosos server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
