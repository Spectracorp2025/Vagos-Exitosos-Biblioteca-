import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import {
  Lock,
  Phone,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  KeyRound,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

interface AuthViewProps {
  onSuccess: () => void;
  initialMode?: 'login' | 'register' | 'recovery';
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess, initialMode = 'login' }) => {
  const { loginWithWhatsApp, registerWithWhatsApp, loginWithGoogleProvider } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'recovery'>(initialMode);

  // Form Fields
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Recovery State
  const [recoveryStep, setRecoveryStep] = useState<1 | 2>(1);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [recoveryHint, setRecoveryHint] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!phoneNumber.trim() || !password) {
      setErrorMessage('Por favor ingresa tu número de WhatsApp y contraseña.');
      return;
    }

    setIsSubmitting(true);
    try {
      await loginWithWhatsApp(phoneNumber.trim(), password);
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al iniciar sesión. Verifica tus datos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!displayName.trim() || !phoneNumber.trim() || !password || !confirmPassword) {
      setErrorMessage('Todos los campos son obligatorios.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('La contraseña debe tener un mínimo de 6 caracteres.');
      return;
    }

    setIsSubmitting(true);
    try {
      await registerWithWhatsApp(displayName.trim(), phoneNumber.trim(), password, confirmPassword);
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al registrar tu cuenta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      await loginWithGoogleProvider();
      onSuccess();
    } catch (err: any) {
      setErrorMessage('Error al autenticar con Google: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!phoneNumber.trim()) {
      setErrorMessage('Por favor ingresa tu número de WhatsApp.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authApi.requestPasswordReset(phoneNumber.trim());
      setSuccessMessage(res.message);
      if (res.recoveryCodeHint) {
        setRecoveryHint(res.recoveryCodeHint);
      }
      setRecoveryStep(2);
    } catch (err: any) {
      setErrorMessage(err.message || 'No se pudo generar la recuperación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!recoveryCode.trim() || !newPassword || !confirmNewPassword) {
      setErrorMessage('Completa el código y tu nueva contraseña.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authApi.confirmPasswordReset({
        phoneNumber: phoneNumber.trim(),
        code: recoveryCode.trim(),
        newPassword,
        confirmNewPassword,
      });
      setSuccessMessage(res.message);
      setTimeout(() => {
        setMode('login');
        setRecoveryStep(1);
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al restablecer contraseña.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto my-6 max-w-md px-4">
      <div className="relative overflow-hidden rounded-3xl border border-purple-800/50 bg-[#101120] p-6 sm:p-8 shadow-2xl shadow-purple-950/80">
        {/* Glow ambient background */}
        <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-pink-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-purple-600/25 blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-pink-600 p-0.5 shadow-xl shadow-purple-900/60 mb-3">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#0c0d17]">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-xl font-black text-transparent">
                VX
              </span>
            </div>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            VAGOS <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">EXITOSOS</span>
          </h2>
          <p className="mt-1 text-xs text-gray-400">
            Comunidad Privada • Acceso exclusivo para miembros
          </p>
        </div>

        {/* Mode Selector Tabs (Crear Cuenta / Iniciar Sesión) */}
        {mode !== 'recovery' && (
          <div className="grid grid-cols-2 gap-1 rounded-2xl bg-[#0c0d18] p-1.5 border border-purple-900/40 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`rounded-xl py-2 text-xs font-bold transition-all ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`rounded-xl py-2 text-xs font-bold transition-all ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Crear una Cuenta
            </button>
          </div>
        )}

        {/* Alerts */}
        {errorMessage && (
          <div className="mb-4 rounded-xl border border-rose-600/50 bg-rose-950/60 p-3 text-xs text-rose-200 flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-xl border border-emerald-600/50 bg-emerald-950/60 p-3 text-xs text-emerald-200 flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Número de WhatsApp
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Ej. +52 55 1234 5678"
                  className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-300">Contraseña</label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('recovery');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="text-[11px] font-medium text-pink-400 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] py-2.5 pl-10 pr-10 text-sm text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 py-3 text-xs font-bold text-white shadow-lg shadow-purple-900/50 hover:opacity-95 transition-all mt-2"
            >
              {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>
        )}

        {/* 2. REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                1. Nombre completo o apodo
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ej. Carlos Delgado, Alex Gamer..."
                  className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                2. Número de teléfono de WhatsApp
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+52 55 1234 5678"
                  className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none"
                />
              </div>
              <p className="mt-1 text-[10px] text-gray-400">
                Tu número nunca será público. Solo se usa para verificar tu acceso a la comunidad.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                3. Contraseña (mínimo 6 caracteres)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] py-2.5 pl-10 pr-10 text-sm text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                4. Confirmación de contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 py-3 text-xs font-bold text-white shadow-lg shadow-purple-900/50 hover:opacity-95 transition-all mt-2"
            >
              {isSubmitting ? 'Creando cuenta...' : 'Crear Cuenta y Entrar'}
            </button>
          </form>
        )}

        {/* 3. RECOVERY MODE */}
        {mode === 'recovery' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pink-400">
              <KeyRound className="h-4 w-4" />
              <span>Recuperación de Contraseña</span>
            </div>

            {recoveryStep === 1 ? (
              <form onSubmit={handleRequestRecovery} className="space-y-4">
                <p className="text-xs text-gray-300 leading-relaxed">
                  Ingresa tu número de WhatsApp registrado para generar tu código seguro de recuperación.
                </p>

                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Número de WhatsApp"
                    className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] py-2.5 pl-10 pr-4 text-sm text-white focus:border-pink-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="flex-1 rounded-xl border border-purple-900/40 bg-[#16172d] py-2.5 text-xs font-semibold text-gray-300 hover:text-white"
                  >
                    Volver
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 rounded-xl bg-purple-600 py-2.5 text-xs font-bold text-white hover:bg-purple-500"
                  >
                    {isSubmitting ? 'Generando...' : 'Obtener Código'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleConfirmRecovery} className="space-y-4">
                {recoveryHint && (
                  <div className="rounded-xl border border-pink-600/40 bg-pink-950/40 p-3 text-xs text-pink-200">
                    Tu código de verificación de WhatsApp es: <strong className="text-white text-sm tracking-widest">{recoveryHint}</strong>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Código de 6 dígitos
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value)}
                    placeholder="123456"
                    className="w-full rounded-xl border border-purple-800/40 bg-[#0d0e19] px-4 py-2.5 text-sm font-mono tracking-widest text-white text-center focus:border-pink-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Nueva Contraseña
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
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
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

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-3 text-xs font-bold text-white shadow-lg"
                >
                  {isSubmitting ? 'Restableciendo...' : 'Guardar Nueva Contraseña'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Separator and Google 1-Click Alternative */}
        {mode !== 'recovery' && (
          <div className="mt-6 pt-5 border-t border-purple-900/30">
            <div className="relative flex items-center justify-center mb-4">
              <span className="bg-[#101120] px-3 text-[11px] font-medium text-gray-500 uppercase">
                O también mediante
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-purple-800/40 bg-[#16172d] py-2.5 text-xs font-semibold text-gray-200 hover:border-purple-500 hover:text-white transition-all shadow-sm"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continuar con Cuenta de Google</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
