import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Menu } from 'lucide-react';

export default function DocsPage() {
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
              <Link to="/" className="text-sm tracking-wider hover:opacity-60 transition-opacity">Home</Link>
              <Link to="/docs" className="text-sm tracking-wider hover:opacity-60 transition-opacity">Docs</Link>
              <Link to="/support" className="text-sm tracking-wider hover:opacity-60 transition-opacity">Support</Link>
            </div>

            <button className="md:hidden">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-24 px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Documentation</h1>
          <p className="text-gray-600 mb-8">Guides, API reference, and tutorials to help you build with Ovio.</p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold mb-2">Getting Started</h3>
              <p className="text-sm text-gray-600">Quickstart guide to create your first project and use the editor.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold mb-2">API Reference</h3>
              <p className="text-sm text-gray-600">Endpoints for authentication, projects, and deployments.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold mb-2">Integrations</h3>
              <p className="text-sm text-gray-600">How to connect Stripe, SendGrid, Twilio, and other plugins.</p>
            </div>
          </div>

          <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6 space-y-6">
            <h2 className="text-lg font-bold mb-2">Guides</h2>

            <section>
              <h3 className="font-semibold mb-2">1) Build a Login (frontend + backend)</h3>
              <p className="text-sm text-gray-600 mb-2">A minimal login flow: the frontend collects email/password and POSTs to <code>/auth/login</code>. The backend validates and returns a JWT token.</p>
              <div className="bg-gray-50 p-3 rounded text-sm overflow-auto">
                <strong>Frontend (example)</strong>
                <pre className="text-xs mt-2">{`// signin.js (frontend)
async function signIn(email, password) {
  const res = await fetch(import.meta.env.VITE_API_BASE + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  localStorage.setItem('token', data.token);
}
`}</pre>

                <strong>Backend (Flask example)</strong>
                <pre className="text-xs mt-2">{`# app.py (Flask)
from flask import Flask, request, jsonify
import jwt, datetime

app = Flask(__name__)
SECRET = 'replace-with-secure-secret'

@app.route('/auth/login', methods=['POST'])
def login():
  body = request.json
  email = body.get('email')
  password = body.get('password')
  # validate user (lookup & verify password)
  if email == 'demo@ovio' and password == 'password':
    token = jwt.encode({'sub': email, 'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)}, SECRET, algorithm='HS256')
    return jsonify({ 'token': token })
  return jsonify({'error': 'Invalid credentials'}), 401
`}</pre>
              </div>
            </section>

            <section>
              <h3 className="font-semibold mb-2">2) Add Google Sign-In (OAuth)</h3>
              <p className="text-sm text-gray-600 mb-2">Two common approaches: (A) OAuth redirect flow handled by backend, (B) Use Google Identity Services on the frontend. Backend flow is recommended for server-side tokens.</p>
              <div className="bg-gray-50 p-3 rounded text-sm overflow-auto">
                <strong>Backend (redirect flow) - high level</strong>
                <pre className="text-xs mt-2">{`1. Create OAuth credentials in Google Cloud Console (Authorized redirect URI -> https://your-app.com/auth/google/callback)
2. Redirect user to Google consent screen with client_id & scopes
3. Google sends code to your /auth/google/callback
4. Exchange code for tokens server-side, verify ID token, create/find user, issue app JWT
`}</pre>

                <strong>Frontend (open OAuth)</strong>
                <pre className="text-xs mt-2">{`// open provider
window.location = import.meta.env.VITE_API_BASE + '/auth/google/login';
`}</pre>
              </div>
            </section>

            <section>
              <h3 className="font-semibold mb-2">3) Register and Password Reset</h3>
              <p className="text-sm text-gray-600 mb-2">Register: POST /auth/register with name/email/password. Password reset: POST /auth/forgot (send email), POST /auth/reset (token + new password).</p>
              <pre className="text-sm bg-gray-50 p-3 rounded">{`POST /auth/register { name, email, password }
POST /auth/forgot { email }
POST /auth/reset { token, password }`}</pre>
            </section>

            <section>
              <h3 className="font-semibold mb-2">4) Projects API (quick)</h3>
              <p className="text-sm text-gray-600 mb-2">Typical endpoints used by the frontend:</p>
              <pre className="text-sm bg-gray-50 p-3 rounded">{`GET /projects -> list projects (Authorization: Bearer TOKEN)
POST /projects -> create project
GET /projects/:id -> project metadata
POST /projects/:id/state -> save editor state
POST /projects/:id/deploy -> trigger deploy`}</pre>
            </section>

            <section>
              <h3 className="font-semibold mb-2">5) Realtime editor notes</h3>
              <p className="text-sm text-gray-600">The editor uses socket.io for collaborative state. Key events: <code>join_project</code>, <code>state_update</code>. Emit and listen to these from server and clients.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
