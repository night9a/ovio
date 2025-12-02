import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Sparkles, Code2, Zap, Users, Database, Blocks, ArrowRight, Check, Menu, X, Play, Cpu, Globe2, GitBranch, Puzzle, MessageSquare, BarChart3, Lock, Rocket, Command } from 'lucide-react';
import LoginPage from './Login.jsx';
import RegisterPage from './Register.jsx';
import ProjectsPage from './Projects.jsx';

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [activeTab, setActiveTab] = useState('developer');
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/" element={<LandingPage mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} scrollY={scrollY} activeTab={activeTab} setActiveTab={setActiveTab} navigate={navigate} />} />
    </Routes>
  );
}

function LandingPage({ mobileMenuOpen, setMobileMenuOpen, scrollY, activeTab, setActiveTab, navigate }) {
  return (
    <div className="bg-white text-gray-900 overflow-x-hidden">
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        ::selection {
          background-color: #fef08a;
          color: #000;
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed w-full z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-light tracking-wider">OVIO</div>
            </div>
            
            <div className="hidden md:flex items-center gap-10">
              <a href="#features" className="text-sm tracking-wider hover:opacity-60 transition-opacity">Features</a>
              <a href="#platform" className="text-sm tracking-wider hover:opacity-60 transition-opacity">Platform</a>
              <a href="#pricing" className="text-sm tracking-wider hover:opacity-60 transition-opacity">Pricing</a>
              <a href="#docs" className="text-sm tracking-wider hover:opacity-60 transition-opacity">Docs</a>
              <Link to="/login" className="text-sm tracking-wider hover:opacity-60 transition-opacity">Log in</Link>
              <Link to="/register" className="px-6 py-2 bg-black text-white text-sm tracking-wider hover:bg-gray-800 transition-all active:scale-95">Register</Link>
            </div>

            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-white z-50 flex flex-col items-center justify-center gap-8">
            <button className="absolute top-6 right-6" onClick={() => setMobileMenuOpen(false)}>
              <X size={24} />
            </button>
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#platform" onClick={() => setMobileMenuOpen(false)}>Platform</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
            <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="px-8 py-3 bg-black text-white">Register</Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center px-6 relative pt-20">
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle at center, #000 1px, transparent 1px)',
            backgroundSize: '50px 50px',
            transform: `translateY(${scrollY * 0.5}px)`
          }}
        ></div>
        
        <div className="max-w-6xl text-center relative z-10">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 rounded-full" style={{ animation: 'slideUp 1s ease-out' }}>
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">AI-Powered App Builder</span>
            </div>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold mb-8 leading-tight">
            <div style={{ animation: 'slideUp 1s ease-out 0.2s backwards' }}>Build Apps</div>
            <div style={{ animation: 'slideUp 1s ease-out 0.4s backwards' }}>Without Writing</div>
            <div className="bg-gradient-to-r from-black via-gray-700 to-black bg-clip-text text-transparent" style={{ animation: 'slideUp 1s ease-out 0.6s backwards' }}>A Single Line of Code</div>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12" style={{ animation: 'slideUp 1s ease-out 0.8s backwards' }}>
            Ovio combines AI intelligence, visual development, and automated backend infrastructure. Build production-ready apps for Web, iOS, Android, and Desktop in minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8" style={{ animation: 'fadeIn 1s ease-out 1s backwards' }}>
            <Link to="/register" className="group px-10 py-4 bg-black text-white hover:shadow-2xl transition-all active:scale-95">
              <span className="flex items-center gap-2">
                <Command className="w-4 h-4" />
                Start Building Free
                <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
              </span>
            </Link>
            <button className="group px-10 py-4 border-2 border-black hover:bg-black hover:text-white transition-all active:scale-95" onClick={() => navigate('/demo')}>
              <span className="flex items-center gap-2">
                <Play size={16} />
                Watch Demo
              </span>
            </button>
          </div>

          <div className="text-sm text-gray-400" style={{ animation: 'fadeIn 1s ease-out 1.2s backwards' }}>
            No credit card required · 5 minute setup · Export code anytime
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6 bg-black text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "10x", label: "Faster Development" },
            { value: "100%", label: "Cross-Platform" },
            { value: "Zero", label: "Infrastructure Setup" },
            { value: "AI", label: "Powered Intelligence" }
          ].map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-4xl font-bold mb-2">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Platform Overview */}
      <section id="platform" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs tracking-widest text-gray-400 mb-4">THE PLATFORM</div>
            <h2 className="text-5xl lg:text-6xl font-bold mb-6">Everything You Need to Ship</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From idea to production in one platform. No juggling between tools.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-4 mb-16">
            <button 
              onClick={() => setActiveTab('developer')}
              className={`px-8 py-3 rounded-full transition-all ${activeTab === 'developer' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              <span className="flex items-center gap-2">
                <Code2 className="w-4 h-4" />
                For Developers
              </span>
            </button>
            <button 
              onClick={() => setActiveTab('business')}
              className={`px-8 py-3 rounded-full transition-all ${activeTab === 'business' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              <span className="flex items-center gap-2">
                <Rocket className="w-4 h-4" />
                For Business
              </span>
            </button>
          </div>

          {/* Developer Features */}
          {activeTab === 'developer' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: Code2, title: "Visual Code Editor", desc: "Drag-and-drop interface with instant code export. Switch between visual and code mode seamlessly." },
                { icon: Cpu, title: "AI Code Assistant", desc: "Natural language to functional code. Add user authentication becomes a working feature in seconds." },
                { icon: Database, title: "Smart Database", desc: "Auto-generated schemas, real-time sync, and visual relationship mapping. No SQL required." },
                { icon: GitBranch, title: "Built-in Version Control", desc: "Branch, merge, and rollback like Git. Experiment without breaking production." },
                { icon: Blocks, title: "Component Library", desc: "Pre-built, customizable components. From buttons to payment flows, all production-ready." },
                { icon: Zap, title: "Hot Reload Everything", desc: "See changes instantly. Frontend, backend, database—all update in real-time." }
              ].map((feature, idx) => (
                <div key={idx} className="p-8 bg-white border border-gray-200 rounded-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* Business Features */}
          {activeTab === 'business' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: Rocket, title: "Launch in Days, Not Months", desc: "Reduce development time by 10x. Ship MVPs and get market feedback faster." },
                { icon: Users, title: "Real-Time Collaboration", desc: "Your entire team works on the same project simultaneously. All in sync." },
                { icon: BarChart3, title: "Built-in Analytics", desc: "Track user behavior, performance metrics, and business KPIs without third-party tools." },
                { icon: Lock, title: "Enterprise Security", desc: "SOC 2 compliant, encrypted data, role-based access control. Enterprise-ready from day one." },
                { icon: Globe2, title: "Global Deployment", desc: "Deploy to 200+ regions with one click. CDN, auto-scaling, and 99.99% uptime included." },
                { icon: Puzzle, title: "Integration Marketplace", desc: "Connect to Stripe, Twilio, SendGrid, and 1000+ services. No backend code required." }
              ].map((feature, idx) => (
                <div key={idx} className="p-8 bg-white border border-gray-200 rounded-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Core Features */}
      <section id="features" className="py-32 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-32">
          {[
            { 
              title: "AI That Actually Understands", 
              subtitle: "Not just templates—real intelligence",
              description: "Describe what you want to build in plain English. Ovio's AI understands context, business logic, and user flows. It generates production-ready code, not boilerplate templates.",
              number: "01",
              features: ["Natural language to full features", "Contextual code generation", "Learns from your patterns", "Suggests optimizations"],
              icon: Sparkles
            },
            { 
              title: "Visual Backend Builder", 
              subtitle: "Complex logic, zero complexity",
              description: "Build APIs, database schemas, authentication flows, and business logic through intuitive visual interfaces. Everything from user permissions to payment webhooks—no backend expertise required.",
              number: "02",
              features: ["Visual API designer", "Database relationship mapper", "Workflow automation", "Real-time data sync"],
              icon: Database
            },
            { 
              title: "True Cross-Platform", 
              subtitle: "One codebase, every device",
              description: "Build once, deploy everywhere. Your app runs natively on Web, iOS, Android, and Desktop. Same features, same performance, same codebase.",
              number: "03",
              features: ["Web (PWA ready)", "iOS & Android native", "Windows, Mac, Linux", "Responsive by default"],
              icon: Globe2
            },
            { 
              title: "Developer Mode", 
              subtitle: "Export clean, production code",
              description: "Never get locked in. Export your entire project as clean React, Flutter, or Node.js code. Full ownership, zero vendor lock-in.",
              number: "04",
              features: ["Export React/Flutter code", "Full source code access", "Standard packages only", "Continue in any IDE"],
              icon: Code2
            }
          ].map((feature, idx) => (
            <div key={idx} className={`grid lg:grid-cols-2 gap-16 items-center ${idx % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
              <div className={idx % 2 === 1 ? 'lg:order-2' : ''}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-6xl font-light text-gray-300">{feature.number}</div>
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold mb-3 leading-tight">{feature.title}</h2>
                <div className="text-lg text-gray-500 mb-6 italic">{feature.subtitle}</div>
                <p className="text-lg text-gray-600 leading-relaxed mb-8">{feature.description}</p>
                <ul className="space-y-3">
                  {feature.features.map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={idx % 2 === 1 ? 'lg:order-1' : ''}>
                <div className="aspect-[4/3] bg-gradient-to-br from-gray-200 to-gray-100 rounded-xl relative overflow-hidden group cursor-pointer transition-all duration-500 hover:shadow-2xl border border-gray-200">
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity duration-700"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110 shadow-lg">
                      <Play size={24} className="text-gray-800 ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs tracking-widest text-gray-400 mb-4">COMPETITIVE ADVANTAGE</div>
            <h2 className="text-5xl font-bold mb-4">Why Developers Choose Ovio</h2>
            <p className="text-xl text-gray-600">We built what we wish existed</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 border-b border-gray-200 font-bold">
              <div>Feature</div>
              <div>Ovio</div>
              <div>Traditional Tools</div>
            </div>
            {[
              { feature: "AI Code Generation", ovio: "Deep logic understanding", others: "Template-only" },
              { feature: "Team Collaboration", ovio: "Live, real-time editing", others: "File-based, conflicts" },
              { feature: "Backend Setup", ovio: "Visual, automatic", others: "Manual configuration" },
              { feature: "Database", ovio: "Built-in, scalable", others: "External service required" },
              { feature: "Version Control", ovio: "Built-in branching", others: "Rarely available" },
              { feature: "Code Export", ovio: "Full source access", others: "Locked-in or limited" }
            ].map((item, idx) => (
              <div key={idx} className="grid grid-cols-3 gap-4 p-6 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="font-medium">{item.feature}</div>
                <div className="flex items-center gap-2 text-green-600 font-medium">
                  <Check className="w-4 h-4" />
                  {item.ovio}
                </div>
                <div className="text-gray-500">{item.others}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 px-6 bg-black text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="text-xs tracking-widest text-gray-400 mb-4">PRICING</div>
            <h2 className="text-5xl lg:text-6xl font-bold mb-6">Start Free, Scale as You Grow</h2>
            <p className="text-xl text-gray-400">No hidden fees. Cancel anytime.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                name: "Free", 
                price: "0", 
                description: "Perfect for side projects",
                features: ["Up to 3 projects", "Community hosting", "AI code generation (limited)", "Basic components", "Community support", "Export code"]
              },
              { 
                name: "Pro", 
                price: "29", 
                description: "For professional developers",
                features: ["Unlimited projects", "Full AI capabilities", "Advanced components", "Team collaboration (5 seats)", "Priority support", "Custom domain", "Advanced analytics", "Version control"],
                popular: true
              },
              { 
                name: "Team", 
                price: "99",
                description: "For growing teams",
                features: ["Everything in Pro", "Unlimited team members", "SSO & advanced security", "Dedicated support", "Custom AI training", "Private cloud option", "SLA guarantee", "Audit logs"]
              }
            ].map((plan, idx) => (
              <div key={idx} className={`bg-white text-black p-8 rounded-xl relative transition-all duration-300 hover:scale-105 ${plan.popular ? 'ring-4 ring-yellow-400 scale-105' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black px-6 py-1 text-xs font-bold tracking-widest rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <div className="mb-6">
                  <div className="text-sm tracking-widest text-gray-500 mb-2">{plan.name.toUpperCase()}</div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl font-bold">${plan.price}</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <p className="text-sm text-gray-600">{plan.description}</p>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/register" className={`w-full inline-block text-center py-4 rounded-lg font-bold tracking-wider transition-all active:scale-95 ${plan.popular ? 'bg-black text-white hover:bg-gray-800' : 'border-2 border-black hover:bg-black hover:text-white'}`}>
                  {plan.price === "0" ? "Start Free" : "Start 14-Day Trial"}
                </Link>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-16">
            <p className="text-gray-400 mb-4">Need custom enterprise solutions?</p>
            <button className="px-8 py-3 border border-white hover:bg-white hover:text-black transition-all">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="text-xs tracking-widest text-gray-400 mb-4">USE CASES</div>
            <h2 className="text-5xl font-bold mb-6">Built for Every Type of App</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "SaaS Products", desc: "Multi-tenant apps with subscriptions, user management, and analytics" },
              { title: "E-Commerce", desc: "Full-featured stores with payments, inventory, and order management" },
              { title: "Internal Tools", desc: "Admin panels, dashboards, and business process automation" },
              { title: "Mobile Apps", desc: "Native iOS & Android apps with offline support and push notifications" },
              { title: "Marketplaces", desc: "Two-sided platforms with payments, ratings, and messaging" },
              { title: "Content Platforms", desc: "Blogs, news sites, and content management systems" },
              { title: "Social Networks", desc: "Community platforms with feeds, profiles, and real-time chat" },
              { title: "IoT Dashboards", desc: "Real-time device monitoring and control interfaces" }
            ].map((useCase, idx) => (
              <div key={idx} className="p-6 bg-gray-50 rounded-lg hover:bg-white hover:shadow-lg transition-all border border-gray-100">
                <h3 className="font-bold mb-2">{useCase.title}</h3>
                <p className="text-sm text-gray-600">{useCase.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl lg:text-7xl font-bold mb-8 leading-tight">
            Stop Wrestling with Code.<br />Start Building Products.
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Join thousands of developers who are shipping faster with Ovio. Start building for free today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/register" className="px-12 py-5 bg-white text-black font-bold tracking-wider hover:bg-gray-100 transition-all active:scale-95 flex items-center gap-2 rounded text-center">
              Start Building Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="px-12 py-5 border-2 border-white hover:bg-white hover:text-black transition-all active:scale-95 flex items-center gap-2" onClick={() => navigate('/contact')}>
              <MessageSquare className="w-5 h-5" />
              Talk to Sales
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-8">No credit card required · 5 minute setup · Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-black text-white border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-black" />
                </div>
                <span className="text-xl font-bold">OVIO</span>
              </div>
              <p className="text-gray-400 text-sm">
                The AI-powered platform for building production-ready apps without code.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#docs" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Templates</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tutorials</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-400">
              © 2025 Ovio Labs — Build Smarter. Together.
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}