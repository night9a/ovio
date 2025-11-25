import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, ArrowRight, Github, Chrome, Eye, EyeOff, User, Briefcase, Check } from 'lucide-react';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    role: '',
    agreeTerms: false,
    agreeMarketing: false
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step === 1) setStep(2);
  };

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      // Derive a simple username from full name or email
      const username = (formData.fullName || formData.email).replace(/\s+/g, '').toLowerCase();
      const payload = {
        email: formData.email,
        username,
        password: formData.password,
        name: formData.fullName,
      };

      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      const token = data.token;
      if (token) {
        localStorage.setItem('token', token);
        navigate('/projects');
      } else {
        throw new Error('No token returned');
      }
    } catch (err) {
      setError(err.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    'Full-stack Developer',
    'Frontend Developer',
    'Backend Developer',
    'Mobile Developer',
    'Product Manager',
    'Designer',
    'Founder/CEO',
    'Other'
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
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
        <div className="w-full max-w-2xl" style={{ animation: 'fadeIn 0.6s ease-out' }}>
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= 1 ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'}`}>
                1
              </div>
              <div className={`h-1 w-20 transition-all ${step >= 2 ? 'bg-black' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= 2 ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'}`}>
                2
              </div>
            </div>
            <div className="text-center text-sm text-gray-500">
              Step {step} of 2 · {step === 1 ? 'Account Details' : 'About You'}
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Start Your Free Trial</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-3">
              {step === 1 ? 'Create Your Account' : 'Tell Us About Yourself'}
            </h1>
            <p className="text-gray-600 text-lg">
              {step === 1 
                ? 'Join thousands of developers building production-ready apps' 
                : 'Help us personalize your experience'}
            </p>
          </div>

          {/* Social Login (Step 1 only) */}
          {step === 1 && (
            <>
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
                  <span className="px-4 bg-white text-gray-500">Or register with email</span>
                </div>
              </div>
            </>
          )}

          {/* Step 1: Account Details */}
          {step === 1 && (
            <div className="space-y-4" style={{ animation: 'slideIn 0.5s ease-out' }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="you@company.com"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-11 py-3 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2 font-medium">Password must contain:</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <Check className={`w-3 h-3 ${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-300'}`} />
                    <span>At least 8 characters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className={`w-3 h-3 ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-300'}`} />
                    <span>One uppercase letter</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className={`w-3 h-3 ${/[0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-300'}`} />
                    <span>One number</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className={`w-3 h-3 ${/[!@#$%^&*]/.test(formData.password) ? 'text-green-600' : 'text-gray-300'}`} />
                    <span>One special character</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all active:scale-95 font-medium flex items-center justify-center gap-2 group"
              >
                Continue
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

          {/* Step 2: About You */}
          {step === 2 && (
            <div className="space-y-4" style={{ animation: 'slideIn 0.5s ease-out' }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name <span className="text-gray-400">(Optional)</span>
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="Acme Inc."
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Your Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {roles.map((role) => (
                    <button
                      key={role}
                      onClick={() => handleInputChange('role', role)}
                      className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                        formData.role === role
                          ? 'border-black bg-black text-white'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={(e) => handleInputChange('agreeTerms', e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 mt-0.5"
                  />
                  <span className="text-sm text-gray-600 flex-1">
                    I agree to Ovio's{' '}
                    <button className="text-black hover:opacity-60 transition-opacity font-medium">
                      Terms of Service
                    </button>
                    {' '}and{' '}
                    <button className="text-black hover:opacity-60 transition-opacity font-medium">
                      Privacy Policy
                    </button>
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.agreeMarketing}
                    onChange={(e) => handleInputChange('agreeMarketing', e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 mt-0.5"
                  />
                  <span className="text-sm text-gray-600 flex-1">
                    Send me product updates, tips, and special offers
                  </span>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all active:scale-95 font-medium flex items-center justify-center gap-2 group"
                >
                  Create Account
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {/* Sign In Link */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button className="text-black font-medium hover:opacity-60 transition-opacity">
              Sign in
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="text-center mb-4">
              <p className="text-xs text-gray-500 mb-3">Trusted by thousands of developers</p>
              <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
                <span>✓ SOC 2 Certified</span>
                <span>✓ GDPR Compliant</span>
                <span>✓ 256-bit SSL</span>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-xs text-gray-600">
                🎉 <span className="font-medium">Free for 14 days</span> • No credit card required • Cancel anytime
              </p>
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