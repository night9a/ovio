import { useState } from 'react';
import { Sparkles, Mail, Lock, ArrowRight, Github, Chrome, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = () => {
    console.log('Form submitted:', { email, password, isSignUp });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        ::selection {
          background-color: #fef08a;
          color: #000;
        }
      `}</style>

      {/* Header */}
      <nav className="w-full py-6 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-light tracking-wider">OVIO</div>
          </div>
          <button className="text-sm tracking-wider hover:opacity-60 transition-opacity">
            ← Back to Home
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md" style={{ animation: 'fadeIn 0.6s ease-out' }}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">AI-Powered App Builder</span>
            </div>
            <h1 className="text-4xl font-bold mb-3">
              {isSignUp ? 'Create Your Account' : 'Welcome Back'}
            </h1>
            <p className="text-gray-600">
              {isSignUp 
                ? 'Start building production-ready apps in minutes' 
                : 'Continue building amazing products'}
            </p>
          </div>

          {/* Social Login */}
          <div className="space-y-3 mb-6">
            <button className="w-full py-3 px-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-3 group">
              <Github className="w-5 h-5" />
              <span className="font-medium">Continue with GitHub</span>
            </button>
            <button className="w-full py-3 px-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-3 group">
              <Chrome className="w-5 h-5" />
              <span className="font-medium">Continue with Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isSignUp && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                  <span className="text-gray-600">Remember me</span>
                </label>
                <button className="text-black hover:opacity-60 transition-opacity font-medium">
                  Forgot password?
                </button>
              </div>
            )}

            {isSignUp && (
              <p className="text-xs text-gray-500">
                By creating an account, you agree to our{' '}
                <button className="text-black hover:opacity-60 transition-opacity">Terms of Service</button>
                {' '}and{' '}
                <button className="text-black hover:opacity-60 transition-opacity">Privacy Policy</button>
              </p>
            )}

            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all active:scale-95 font-medium flex items-center justify-center gap-2 group"
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Toggle Sign Up / Sign In */}
          <div className="mt-6 text-center text-sm text-gray-600">
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setIsSignUp(false)}
                  className="text-black font-medium hover:opacity-60 transition-opacity"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => setIsSignUp(true)}
                  className="text-black font-medium hover:opacity-60 transition-opacity"
                >
                  Sign up for free
                </button>
              </>
            )}
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500 mb-2">Trusted by thousands of developers</p>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
              <span>✓ SOC 2 Certified</span>
              <span>✓ GDPR Compliant</span>
              <span>✓ 256-bit SSL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <div>© 2025 Ovio Labs — Build Smarter. Together.</div>
          <div className="flex gap-6">
            <button className="hover:text-gray-900 transition-colors">Privacy</button>
            <button className="hover:text-gray-900 transition-colors">Terms</button>
            <button className="hover:text-gray-900 transition-colors">Help</button>
          </div>
        </div>
      </footer>
    </div>
  );
}