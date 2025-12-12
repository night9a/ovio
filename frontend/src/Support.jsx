import { useNavigate } from 'react-router-dom';
import { Sparkles, Mail, MessageCircle, Menu } from 'lucide-react';

export default function SupportPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-white text-gray-900 min-h-screen">
      <nav className="fixed w-full z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-light tracking-wider">OVIO</div>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <a href="#" className="text-sm tracking-wider hover:opacity-60 transition-opacity">Docs</a>
              <a href="#" className="text-sm tracking-wider hover:opacity-60 transition-opacity">Contact</a>
            </div>

            <button className="md:hidden">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-24 px-6 pb-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Support</h1>
          <p className="text-gray-600 mb-6">Need help? Send us a message and we'll get back to you within 24 hours.</p>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Your email</label>
            <input className="w-full px-4 py-3 border border-gray-200 rounded-lg mb-4" placeholder="you@company.com" />

            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea className="w-full px-4 py-3 border border-gray-200 rounded-lg mb-4" rows="6" placeholder="Describe your issue or question..."></textarea>

            <div className="flex items-center gap-3">
              <button className="px-6 py-3 bg-black text-white rounded-lg">Send message</button>
              <button className="px-6 py-3 border border-gray-200 rounded-lg" onClick={() => navigate('/docs')}>View docs</button>
            </div>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            For urgent issues please email <a href="mailto:support@ovio.example" className="text-black">support@ovio.example</a>
          </div>
        </div>
      </div>
    </div>
  );
}
