import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Code2, Menu, X, ArrowRight, Globe2, Smartphone, ShoppingCart, Users, MessageSquare, BarChart3, Layout, Database, Zap, Clock, Star, Plus, Settings, Trash2, Eye, Copy, MoreVertical, FolderOpen, Search, Filter, LogOut } from 'lucide-react';

export default function ProjectsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [activeTab, setActiveTab] = useState('myprojects');
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const res = await fetch(`${API_BASE}/projects/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        throw new Error(`Failed to fetch projects: ${res.status}`);
      }

      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err) {
      console.error('Fetch projects error:', err);
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      setError('Project name is required');
      return;
    }

    setCreatingProject(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const res = await fetch(`${API_BASE}/projects/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newProjectName.trim()
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create project');
      }

      setProjects([...projects, data]);
      setNewProjectName('');
      setShowCreateInput(false);
      setShowCreateMenu(false);
    } catch (err) {
      console.error('Create project error:', err);
      setError(err.message || 'Failed to create project');
    } finally {
      setCreatingProject(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const res = await fetch(`${API_BASE}/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to delete project: ${res.status}`);
      }

      setProjects(projects.filter(p => p.id !== projectId));
    } catch (err) {
      console.error('Delete project error:', err);
      setError(err.message || 'Failed to delete project');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const templates = [
    {
      id: 1,
      title: "SaaS Starter Kit",
      description: "Complete SaaS platform with authentication, subscriptions, and team management",
      icon: Zap,
      color: "from-blue-500 to-cyan-500",
      features: ["User Auth", "Stripe Integration", "Team Workspace", "Admin Dashboard"],
      time: "5 min setup",
      rating: 4.9,
      users: "12.5k"
    },
    {
      id: 2,
      title: "E-Commerce Store",
      description: "Full-featured online store with cart, checkout, and inventory management",
      icon: ShoppingCart,
      color: "from-purple-500 to-pink-500",
      features: ["Product Catalog", "Payment Gateway", "Order Tracking", "Email Notifications"],
      time: "8 min setup",
      rating: 4.8,
      users: "9.2k"
    },
    {
      id: 3,
      title: "Social Network",
      description: "Community platform with profiles, feeds, messaging, and real-time updates",
      icon: MessageSquare,
      color: "from-orange-500 to-red-500",
      features: ["User Profiles", "News Feed", "Real-time Chat", "Notifications"],
      time: "10 min setup",
      rating: 4.7,
      users: "7.8k"
    },
    {
      id: 4,
      title: "Analytics Dashboard",
      description: "Real-time analytics with charts, metrics, and customizable widgets",
      icon: BarChart3,
      color: "from-green-500 to-emerald-500",
      features: ["Live Data", "Custom Charts", "Export Reports", "Team Sharing"],
      time: "4 min setup",
      rating: 4.9,
      users: "15.1k"
    },
    {
      id: 5,
      title: "Mobile Fitness App",
      description: "Cross-platform fitness tracker with workouts, progress, and social features",
      icon: Smartphone,
      color: "from-yellow-500 to-orange-500",
      features: ["Workout Plans", "Progress Tracking", "Social Challenges", "iOS & Android"],
      time: "12 min setup",
      rating: 4.6,
      users: "5.3k"
    },
    {
      id: 6,
      title: "CRM System",
      description: "Customer relationship management with pipeline, contacts, and automation",
      icon: Database,
      color: "from-cyan-500 to-blue-500",
      features: ["Contact Management", "Sales Pipeline", "Email Automation", "Reports"],
      time: "7 min setup",
      rating: 4.7,
      users: "8.9k"
    }
  ];

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen">
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
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
      <nav className="fixed w-full z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-light tracking-wider">OVIO</div>
            </div>
            
            <div className="hidden md:flex items-center gap-10">
              <a href="#" className="text-sm tracking-wider hover:opacity-60 transition-opacity">Dashboard</a>
              <a href="#" className="text-sm tracking-wider hover:opacity-60 transition-opacity">Templates</a>
              <a href="#" className="text-sm tracking-wider hover:opacity-60 transition-opacity">Docs</a>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate('/projects')}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-all text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  U
                </div>
              </div>
            </div>

            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">Your Projects</h1>
            <p className="text-xl text-gray-600">Create, manage, and deploy your applications</p>
          </div>

          {/* Tabs */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex gap-4">
              <button 
                onClick={() => setActiveTab('myprojects')}
                className={`px-6 py-3 rounded-lg transition-all font-medium ${
                  activeTab === 'myprojects' 
                    ? 'bg-black text-white' 
                    : 'bg-white hover:bg-gray-100 text-gray-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  My Projects ({projects.length})
                </span>
              </button>
              <button 
                onClick={() => setActiveTab('templates')}
                className={`px-6 py-3 rounded-lg transition-all font-medium ${
                  activeTab === 'templates' 
                    ? 'bg-black text-white' 
                    : 'bg-white hover:bg-gray-100 text-gray-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Layout className="w-4 h-4" />
                  Templates
                </span>
              </button>
            </div>

            {/* Create New Button */}
            <div className="relative">
              <button 
                onClick={() => setShowCreateMenu(!showCreateMenu)}
                className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all active:scale-95 font-medium"
              >
                <Plus className="w-5 h-5" />
                Create New
              </button>

              {/* Create Menu Dropdown */}
              {showCreateMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50" style={{ animation: 'slideUp 0.3s ease-out' }}>
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider">Start Building</h3>
                  </div>
                  <button 
                    onClick={() => setShowCreateInput(true)}
                    className="w-full p-4 hover:bg-gray-50 transition-all flex items-start gap-4 border-b border-gray-100"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Code2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-bold mb-1">Blank Project</div>
                      <div className="text-sm text-gray-600">Start from scratch with a blank canvas</div>
                    </div>
                  </button>
                  <button className="w-full p-4 hover:bg-gray-50 transition-all flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Layout className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-bold mb-1">Use Template</div>
                      <div className="text-sm text-gray-600">Choose from ready-made templates</div>
                    </div>
                  </button>
                  {showCreateInput && (
                    <div className="p-4 border-t border-gray-100 space-y-3">
                      <input
                        type="text"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        placeholder="Enter project name..."
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleCreateProject}
                          disabled={creatingProject || !newProjectName.trim()}
                          className="flex-1 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-60"
                        >
                          {creatingProject ? 'Creating...' : 'Create'}
                        </button>
                        <button
                          onClick={() => {
                            setShowCreateInput(false);
                            setNewProjectName('');
                          }}
                          className="flex-1 py-2 border border-gray-200 rounded-lg font-medium hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                      {error && <div className="text-sm text-red-600">{error}</div>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* My Projects View */}
          {activeTab === 'myprojects' && (
            <div>
              {/* Error Message */}
              {error && (
                <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}

              {/* Loading State */}
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading projects...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Search & Filter */}
                  <div className="flex gap-4 mb-8">
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                    <button className="px-6 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      Filter
                    </button>
                  </div>

                  {/* Projects Grid */}
                  {filteredProjects.length === 0 ? (
                    <div className="text-center py-16">
                      <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold mb-2 text-gray-600">No projects yet</h3>
                      <p className="text-gray-500 mb-8">Create your first project to get started</p>
                      <button
                        onClick={() => setShowCreateMenu(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all"
                      >
                        <Plus className="w-5 h-5" />
                        Create New Project
                      </button>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                      {filteredProjects.map((project, idx) => (
                        <div 
                          key={project.id}
                          className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                          style={{ animation: `slideUp 0.3s ease-out ${idx * 0.1}s backwards` }}
                        >
                          {/* Project Header */}
                          <div className="h-32 bg-gradient-to-br from-purple-500 to-pink-500 relative overflow-hidden">
                            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
                            <div className="absolute top-4 right-4 flex gap-2">
                              <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center hover:scale-110 transition-transform">
                                <Eye className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProject(project.id)}
                                className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center hover:scale-110 transition-transform hover:bg-red-100"
                              >
                                <Trash2 className="w-5 h-5 text-red-600" />
                              </button>
                            </div>
                            <div className="absolute bottom-4 left-4">
                              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg">
                                <FolderOpen className="w-6 h-6 text-purple-500" />
                              </div>
                            </div>
                          </div>

                          {/* Project Content */}
                          <div className="p-6">
                            <div>
                              <h3 className="text-xl font-bold mb-1">{project.name}</h3>
                              <p className="text-sm text-gray-600">Created on {new Date(project.created_at).toLocaleDateString()}</p>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Clock className="w-4 h-4" />
                                <span>ID: {project.id}</span>
                              </div>
                              <div className="flex gap-2">
                                <button className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                                  <Copy className="w-4 h-4 text-gray-600" />
                                </button>
                                <button className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                                  <Settings className="w-4 h-4 text-gray-600" />
                                </button>
                              </div>
                            </div>

                            {/* Open Button */}
                            <button className="w-full mt-4 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-all active:scale-95 flex items-center justify-center gap-2">
                              Open Project
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Create New Card */}
                      <div 
                        className="bg-white rounded-xl border-2 border-dashed border-gray-300 hover:border-black transition-all duration-300 cursor-pointer min-h-[400px] flex items-center justify-center group"
                        onClick={() => setShowCreateMenu(true)}
                      >
                        <div className="text-center p-8">
                          <div className="w-20 h-20 bg-gray-100 group-hover:bg-black rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all">
                            <Plus className="w-10 h-10 text-gray-400 group-hover:text-white transition-all" />
                          </div>
                          <h3 className="text-xl font-bold mb-2 group-hover:text-gray-600 transition-all">Create New Project</h3>
                          <p className="text-gray-600">Start from scratch or use a template</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

          {/* Templates View */}
          {activeTab === 'templates' && (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-2">Start with a Template</h2>
                <p className="text-gray-600">Production-ready templates to kickstart your project</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template, idx) => (
                  <div
                    key={template.id}
                    className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer"
                    style={{ animation: `slideUp 0.3s ease-out ${idx * 0.1}s backwards` }}
                  >
                    <div className={`relative h-40 bg-gradient-to-br ${template.color} overflow-hidden`}>
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                          <template.icon className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-lg font-bold mb-2 group-hover:text-gray-600 transition-colors">
                        {template.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                        {template.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {template.features.slice(0, 3).map((feature, fIdx) => (
                          <span key={fIdx} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                            {feature}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{template.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{template.rating}</span>
                        </div>
                      </div>

                      <button className="w-full py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-all active:scale-95 flex items-center justify-center gap-2">
                        Use Template
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}