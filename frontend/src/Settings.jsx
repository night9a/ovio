import { useNavigate } from 'react-router-dom';
import { Sparkles, X, Menu, User, Settings, CreditCard, ShieldCheck, Globe, Bell } from 'lucide-react';

export default function SettingsPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen">
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        ::selection { background-color: #fef08a; color: #000; }
      `}</style>

      {/* Navigation */}
      <nav className="fixed w-full z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-60 transition-opacity" onClick={() => navigate('/')}>
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-light tracking-wider">OVIO</div>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <a href="#" className="text-sm tracking-wider hover:opacity-60 transition-opacity">Dashboard</a>
              <a href="#" className="text-sm tracking-wider hover:opacity-60 transition-opacity">Docs</a>
              <div className="flex items-center gap-3">
                <button onClick={() => navigate('/projects')} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all">
                  <Settings className="w-4 h-4" />
                </button>
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">U</div>
              </div>
            </div>

            <button className="md:hidden">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <div className="pt-24 px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold mb-2">Settings</h1>
            <p className="text-gray-600">Manage your account, workspace, and billing preferences</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <aside className="md:col-span-1 bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <div className="font-bold">Account</div>
                  <div className="text-sm text-gray-500">Profile & credentials</div>
                </div>
              </div>

              <nav className="space-y-2">
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-600" />
                  <span>Profile</span>
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-gray-600" />
                  <span>Security</span>
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-3">
                  <Bell className="w-4 h-4 text-gray-600" />
                  <span>Notifications</span>
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-gray-600" />
                  <span>Billing</span>
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-3">
                  <Globe className="w-4 h-4 text-gray-600" />
                  <span>Workspace</span>
                </button>
              </nav>
            </aside>

            <main className="md:col-span-2 space-y-6">
              <section className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold mb-1">Profile</h2>
                    <p className="text-sm text-gray-500">Update your name, email, and avatar</p>
                  </div>
                  <div className="text-sm text-gray-500">Last updated: Never</div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none" placeholder="Full name" />
                  <input className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none" placeholder="Email address" />
                </div>

                <div className="mt-6 flex gap-3">
                  <button className="px-6 py-3 bg-black text-white rounded-lg">Save</button>
                  <button className="px-6 py-3 border border-gray-200 rounded-lg">Cancel</button>
                </div>
              </section>

              <section className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold mb-1">Security</h2>
                    <p className="text-sm text-gray-500">Change password and enable two-factor authentication</p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="password" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none" placeholder="New password" />
                  <input type="password" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none" placeholder="Confirm password" />
                </div>

                <div className="mt-6 flex gap-3">
                  <button className="px-6 py-3 bg-black text-white rounded-lg">Update password</button>
                </div>
              </section>

              <section className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold mb-1">Billing</h2>
                    <p className="text-sm text-gray-500">Manage subscription and payment methods</p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="p-4 border border-gray-100 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold">No active subscription</div>
                        <div className="text-sm text-gray-500">You are currently on the Free plan</div>
                      </div>
                      <div>
                        <button className="px-4 py-2 bg-black text-white rounded-lg">Upgrade</button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
