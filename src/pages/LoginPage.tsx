import { Button } from "@/design-system/components/inputs";
import { Spinner } from "@/design-system/components/feedback";
// TODO: Create Alert component in design-system or use an alternative
import { useAuth } from "@core/contexts/AuthContext";
import { useState } from "react";

export function LoginPage() {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isSignUp) {
        if (!fullName.trim()) {
          setError("Por favor ingresa tu nombre completo");
          setIsLoading(false);
          return;
        }
        await signUp(email, password, fullName);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setError(
        err.message || "Ocurrió un error. Por favor intenta nuevamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 bg-white border-r border-gray-200">
        <div className="max-w-md space-y-8">
          {/* Logo and Brand */}
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-900 rounded-lg mx-auto mb-4"></div>
            <h1 className="text-3xl text-gray-900 mb-2">Nivexa</h1>
            <p className="text-gray-600">
              Sistema Empresarial de Gestión de Proyectos
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-gray-900 font-medium">
                Sistema de Triple Caja
              </h3>
              <p className="text-sm text-gray-600">
                Gestiona las finanzas de tu estudio con cajas maestras,
                administrativas y por proyecto.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-gray-900 font-medium">
                Financiamiento Flexible
              </h3>
              <p className="text-sm text-gray-600">
                Configura planes de pago hasta 120 cuotas con seguimiento
                automático.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-gray-900 font-medium">
                Trazabilidad Completa
              </h3>
              <p className="text-sm text-gray-600">
                Cada movimiento queda registrado con total transparencia y
                control.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Desarrollado especialmente para arquitectos y estudios de
              arquitectura que buscan orden y control en sus finanzas.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-12 h-12 bg-gray-900 rounded-lg mx-auto mb-4"></div>
            <h1 className="text-2xl text-gray-900 mb-2">Nivexa</h1>
            <p className="text-gray-600 text-sm">
              Sistema Empresarial de Gestión
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <div className="border-b border-gray-100 pb-6 mb-8">
              <h2 className="text-xl text-gray-900 mb-2">
                {isSignUp ? "Crear Cuenta Nueva" : "Acceso al Sistema"}
              </h2>
              <p className="text-sm text-gray-600">
                {isSignUp
                  ? "Complete los datos para crear su cuenta empresarial"
                  : "Ingrese sus credenciales para acceder al sistema"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {isSignUp && (
                <div className="space-y-2">
                  <label className="text-sm text-gray-700">
                    Nombre Completo <span className="text-gray-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-gray-300 focus:border-gray-300 bg-white transition-colors duration-300"
                    placeholder="Ingrese su nombre completo"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm text-gray-700">
                  Correo Electrónico <span className="text-gray-600">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-gray-300 focus:border-gray-300 bg-white transition-colors duration-300"
                  placeholder="correo@empresa.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-700">
                  Contraseña <span className="text-gray-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-gray-300 focus:border-gray-300 bg-white transition-colors duration-300"
                    placeholder="••••••••"
                    required
                    autoComplete={
                      isSignUp ? "new-password" : "current-password"
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors duration-300"
                  >
                    {showPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
                {isSignUp && (
                  <p className="text-xs text-gray-500">Mínimo 6 caracteres</p>
                )}
              </div>

              {!isSignUp && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-200 text-gray-900 focus:ring-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Recordar sesión
                    </span>
                  </label>
                  <button
                    type="button"
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-300"
                  >
                    ¿Olvidó su contraseña?
                  </button>
                </div>
              )}

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Spinner size="sm" color="white" />
                    <span className="ml-2">Procesando...</span>
                  </span>
                ) : isSignUp ? (
                  "Crear Cuenta"
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">
                    {isSignUp ? "¿Ya tiene cuenta?" : "¿Necesita una cuenta?"}
                  </span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError("");
                    setFullName("");
                    setEmail("");
                    setPassword("");
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-300"
                >
                  {isSignUp
                    ? "Iniciar sesión con cuenta existente"
                    : "Crear cuenta nueva"}
                </button>
              </div>
            </div>
          </div>

          {/* Demo Account Info */}
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="text-sm">
              <div className="text-gray-900 mb-1 font-medium">
                Cuenta de Demostración
              </div>
              <div className="text-gray-700">
                Email:{" "}
                <span className="font-mono text-gray-900">demo@nivexa.com</span>{" "}
                - Contraseña:{" "}
                <span className="font-mono text-gray-900">demo123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
