import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { 
  Sparkles, Layout, Type, Image, Square, 
  Circle, Menu, X, Monitor, Smartphone, Tablet, Code2, Play, 
  Undo, Redo, Layers, Settings, Save, Download, Eye, Zap,
  Plus, Trash2, Copy, Move, AlignLeft, AlignCenter, AlignRight,
  ChevronDown, Grid, Columns, Box, Database, Users, Globe2,
  GitBranch, Package, Rocket, Languages, Clock, Activity
} from 'lucide-react';

export default function OvioEditor() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [viewport, setViewport] = useState('desktop');
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [mode, setMode] = useState('edit'); // 'edit' or 'play'
  const [canvasComponents, setCanvasComponents] = useState([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [deploymentUrl, setDeploymentUrl] = useState(null);
  const [deploymentLoading, setDeploymentLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('components');
  const [showAICopilot, setShowAICopilot] = useState(false);
  const [copilotCommand, setCopilotCommand] = useState('');
  const [isCollaborating, setIsCollaborating] = useState(true);
  
  // project + realtime
  const { projectId } = useParams();
  const socketRef = useRef(null);
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

  // load project state and setup socket in useEffect
  useEffect(() => {
    if (!projectId) return;
    let mounted = true;
    const token = localStorage.getItem('token');

    // fetch initial state
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/projects/${projectId}/state`, {
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (mounted && data && data.canvas) setCanvasComponents(data.canvas);
        }
      } catch (err) {
        console.error('failed to load project state', err);
      }
    })();

    // connect socket
    try {
      const socket = io(API_BASE);
      socketRef.current = socket;
      socket.emit('join_project', { project_id: projectId });
      socket.on('state_update', (payload) => {
        if (!payload) return;
        if (String(payload.project_id) !== String(projectId)) return;
        if (payload.state && payload.state.canvas) {
          setCanvasComponents(payload.state.canvas);
        }
      });
    } catch (err) {
      console.error('socket init failed', err);
    }

    return () => {
      mounted = false;
      try {
        if (socketRef.current) {
          socketRef.current.emit('leave_project', { project_id: projectId });
          socketRef.current.disconnect();
        }
      } catch (e) {}
    };
  }, [projectId]);

  // autosave: debounce writes to server and emit socket update
  const saveTimeoutRef = useRef(null);
  const saveState = async (state) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_BASE}/projects/${projectId}/state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(state)
      });
    } catch (err) {
      console.error('failed to save state', err);
    }
  };

  // immediate save triggered by Save button
  const handleSaveNow = async () => {
    if (!projectId) return;
    // cancel any pending autosave
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    const state = { id: projectId, canvas: canvasComponents };
    await saveState(state);
    if (socketRef.current) socketRef.current.emit('state_update', { project_id: projectId, state });
  };

  useEffect(() => {
    if (!projectId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      const state = { id: projectId, canvas: canvasComponents };
      // save to server
      saveState(state);
      // emit realtime update
      if (socketRef.current) socketRef.current.emit('state_update', { project_id: projectId, state });
    }, 1200);
    return () => saveTimeoutRef.current && clearTimeout(saveTimeoutRef.current);
  }, [canvasComponents, projectId]);

  const componentLibrary = [
    { id: 'container', name: 'Container', icon: Square, category: 'Layout' },
    { id: 'grid', name: 'Grid', icon: Grid, category: 'Layout' },
    { id: 'columns', name: 'Columns', icon: Columns, category: 'Layout' },
    { id: 'text', name: 'Text', icon: Type, category: 'Content' },
    { id: 'heading', name: 'Heading', icon: Type, category: 'Content' },
    { id: 'button', name: 'Button', icon: Box, category: 'Content' },
    { id: 'image', name: 'Image', icon: Image, category: 'Content' },
    { id: 'card', name: 'Card', icon: Layout, category: 'Components' },
    { id: 'hero', name: 'Hero Section', icon: Layout, category: 'Components' },
  ];

  const relationModels = [
    { id: 'users', name: 'Users', fields: ['email', 'password', 'name'], icon: Users },
    { id: 'products', name: 'Products', fields: ['title', 'price', 'stock'], icon: Package },
    { id: 'orders', name: 'Orders', fields: ['userId', 'total', 'status'], icon: Activity },
  ];

  const plugins = [
    { id: 'stripe', name: 'Stripe Payments', icon: '💳', installed: true },
    { id: 'google-auth', name: 'Google Login', icon: '🔐', installed: true },
    { id: 'sendgrid', name: 'SendGrid Email', icon: '📧', installed: false },
    { id: 'twilio', name: 'Twilio SMS', icon: '📱', installed: false },
  ];

  const collaborators = [
    { name: 'John', color: 'bg-blue-500', active: true },
    { name: 'Sarah', color: 'bg-purple-500', active: true },
    { name: 'Mike', color: 'bg-green-500', active: false },
  ];

  const viewportSizes = {
    desktop: { width: '100%', icon: Monitor, label: 'Desktop' },
    tablet: { width: '768px', icon: Tablet, label: 'Tablet' },
    mobile: { width: '375px', icon: Smartphone, label: 'Mobile' }
  };

  const handleDragStart = (e, component) => {
    e.dataTransfer.setData('component', JSON.stringify(component));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const componentData = e.dataTransfer.getData('component');
    if (!componentData) return;
    
    const component = JSON.parse(componentData);
    const rect = e.currentTarget.getBoundingClientRect();
    const newComponent = {
      ...component,
      uniqueId: `${component.id}-${Date.now()}`,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    setCanvasComponents([...canvasComponents, newComponent]);
  };

  // drag-to-move for placed components (edit mode)
  const draggingRef = useRef({ id: null, offsetX: 0, offsetY: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!draggingRef.current.id) return;
      setCanvasComponents((prev) => prev.map((c) => {
        if (c.uniqueId !== draggingRef.current.id) return c;
        return {
          ...c,
          x: e.clientX - draggingRef.current.offsetX,
          y: e.clientY - draggingRef.current.offsetY,
        };
      }));
    };
    const handleMouseUp = () => {
      if (draggingRef.current.id) {
        draggingRef.current.id = null;
        // saving will be handled by autosave effect
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleAIGenerate = () => {
    if (aiPrompt.trim()) {
      alert(`AI is generating: ${aiPrompt}`);
      setAiPrompt('');
    }
  };

  const handleCopilotCommand = () => {
    if (copilotCommand.trim()) {
      alert(`Executing: ${copilotCommand}`);
      setCopilotCommand('');
      setShowAICopilot(false);
    }
  };

  const renderComponentPreview = (comp) => {
    const baseClasses = "absolute p-4 border-2 border-dashed border-gray-300 bg-white hover:border-blue-500 cursor-move transition-all";
    const style = { left: comp.x, top: comp.y };

    const type = comp.id.split('-')[0];
    const props = comp.props || {};

    const commonProps = {
      key: comp.uniqueId,
      className: baseClasses,
      style,
      onMouseDown: (e) => {
        if (mode !== 'edit') return;
        // start dragging
        draggingRef.current.id = comp.uniqueId;
        const rect = e.currentTarget.getBoundingClientRect();
        draggingRef.current.offsetX = e.clientX - rect.left;
        draggingRef.current.offsetY = e.clientY - rect.top;
        e.stopPropagation();
      },
      onClick: (e) => {
        if (mode === 'edit') {
          setSelectedComponent(comp.uniqueId);
          e.stopPropagation();
        }
      }
    };

    switch(type) {
      case 'text':
        return <div {...commonProps}>{props.text || 'Sample Text'}</div>;
      case 'heading':
        return <div {...commonProps} className={`${baseClasses} font-bold text-2xl`}>{props.text || 'Heading'}</div>;
      case 'button':
        // in play mode, allow click actions; in edit mode clicks select and start drag
        if (mode === 'play') {
          return (
            <button key={comp.uniqueId} className={`${baseClasses} bg-black text-white px-6 py-2`} style={style} onClick={() => alert(props.label || 'Button clicked')}>{props.label || 'Button'}</button>
          );
        }
        return <button {...commonProps} className={`${baseClasses} bg-black text-white px-6 py-2`}>{props.label || 'Button'}</button>;
      case 'image':
        return <div {...commonProps} className={`${baseClasses} w-48 h-32 bg-gray-200`}>Image</div>;
      case 'card':
        return <div {...commonProps} className={`${baseClasses} w-64 h-48 shadow-lg`}>Card Component</div>;
      default:
        return <div {...commonProps}>{comp.name}</div>;
    }
  };

  // update selected component properties
  const updateSelectedComponent = (updates) => {
    setCanvasComponents((prev) => prev.map((c) => c.uniqueId === selectedComponent ? { ...c, props: { ...(c.props||{}), ...updates } } : c));
  };

  // Deploy to web
  const handleDeploy = async () => {
    if (!projectId) return;
    setDeploymentLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDeploymentUrl(data.full_url || data.url);
        setShowDeployModal(true);
      } else {
        alert('Deployment failed');
      }
    } catch (err) {
      console.error('deployment error', err);
      alert('Deployment error');
    } finally {
      setDeploymentLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }).catch(err => console.error('copy failed', err));
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between z-30">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-light tracking-wider">OVIO</span>
          </div>
          <div className="text-sm text-gray-500">/ E-Commerce Dashboard</div>
        </div>

        {/* Viewport Switcher */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          {Object.entries(viewportSizes).map(([key, val]) => {
            const IconComponent = val.icon;
            return (
              <button
                key={key}
                onClick={() => setViewport(key)}
                className={`px-3 py-2 rounded-md flex items-center gap-2 transition-all ${
                  viewport === key ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span className="text-xs hidden md:inline">{val.label}</span>
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Collaborators */}
          {isCollaborating && (
            <div className="flex items-center gap-2 mr-4">
              <div className="flex -space-x-2">
                {collaborators.map((collab, idx) => (
                  <div
                    key={idx}
                    className={`w-8 h-8 ${collab.color} rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold ${
                      collab.active ? 'ring-2 ring-green-400' : ''
                    }`}
                    title={collab.name}
                  >
                    {collab.name[0]}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Live
              </div>
            </div>
          )}

          <button className="p-2 hover:bg-gray-100 rounded-lg transition-all" title="Undo">
            <Undo className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-all" title="Redo">
            <Redo className="w-4 h-4" />
          </button>
          {/* Save Now */}
          <button onClick={handleSaveNow} className="p-2 hover:bg-gray-100 rounded-lg transition-all" title="Save">
            <Save className="w-4 h-4" />
          </button>
          {/* Mode Toggle */}
          <div className="ml-2 flex items-center bg-gray-100 rounded-lg p-1">
            <button onClick={() => setMode('edit')} className={`px-3 py-1 rounded ${mode === 'edit' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}>Edit</button>
            <button onClick={() => setMode('play')} className={`px-3 py-1 rounded ${mode === 'play' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}>Play</button>
          </div>
          <div className="w-px h-6 bg-gray-300"></div>
          
          {/* AI Copilot Button */}
          <button 
            onClick={() => setShowAICopilot(!showAICopilot)}
            className="px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 text-sm"
          >
            <Zap className="w-4 h-4" />
            <span className="hidden md:inline">AI Copilot</span>
          </button>

          <button className="p-2 hover:bg-gray-100 rounded-lg transition-all" title="Preview">
            <Eye className="w-4 h-4" />
          </button>
          
          {/* Version Control */}
          <button className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 text-sm">
            <GitBranch className="w-4 h-4" />
            <span className="hidden md:inline">main</span>
          </button>

          {/* Deploy */}
          <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all flex items-center gap-2 text-sm">
            <Rocket className="w-4 h-4" />
            <span className="hidden md:inline">Deploy</span>
          </button>
        </div>
      </nav>

      {/* AI Copilot Modal */}
      {showAICopilot && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">AI Copilot</h2>
                  <p className="text-sm text-gray-600">Execute commands with natural language</p>
                </div>
              </div>
              <button onClick={() => setShowAICopilot(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="text-sm font-medium text-gray-700">Try these commands:</div>
              <div className="flex flex-wrap gap-2">
                {[
                  'Add Google Login',
                  'Create user dashboard',
                  'Add Stripe payment',
                  'Setup email notifications',
                  'Create product table',
                  'Add dark mode'
                ].map((cmd, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCopilotCommand(cmd)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-all"
                  >
                    {cmd}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                value={copilotCommand}
                onChange={(e) => setCopilotCommand(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCopilotCommand()}
                placeholder="Type your command..."
                className="w-full p-4 pr-24 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-all"
              />
              <button
                onClick={handleCopilotCommand}
                className="absolute right-2 top-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Execute
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deployment Modal */}
      {showDeployModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Deployment Successful</h2>
                  <p className="text-sm text-gray-600">Your app is now live on the web!</p>
                </div>
              </div>
              <button onClick={() => setShowDeployModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="text-sm font-medium text-gray-700">App URL</div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={deploymentUrl || ''}
                  readOnly
                  className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50"
                />
                <button
                  onClick={() => copyToClipboard(deploymentUrl)}
                  className="px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all"
                >
                  Copy
                </button>
              </div>
              <p className="text-xs text-gray-500">Share this link with others to let them view your app</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.open(deploymentUrl, '_blank')}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
              >
                Open Live App
              </button>
              <button
                onClick={() => setShowDeployModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar */}
        <aside className={`bg-white border-r border-gray-200 transition-all duration-300 ${
          sidebarOpen ? 'w-80' : 'w-0'
        } overflow-hidden flex flex-col`}>
          {/* Sidebar Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('components')}
              className={`flex-1 px-4 py-3 text-xs font-medium transition-all ${
                activeTab === 'components' ? 'bg-gray-50 border-b-2 border-black' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <Layers className="w-4 h-4" />
                <span>Components</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('relations')}
              className={`flex-1 px-4 py-3 text-xs font-medium transition-all ${
                activeTab === 'relations' ? 'bg-gray-50 border-b-2 border-black' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <Database className="w-4 h-4" />
                <span>Relations</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('plugins')}
              className={`flex-1 px-4 py-3 text-xs font-medium transition-all ${
                activeTab === 'plugins' ? 'bg-gray-50 border-b-2 border-black' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <Package className="w-4 h-4" />
                <span>Plugins</span>
              </div>
            </button>
          </div>

          <div className="flex-1 overflow-auto p-6 space-y-6">
            {/* Components Tab */}
            {activeTab === 'components' && (
              <>
                {/* AI Prompt */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-700">
                    <Zap className="w-4 h-4" />
                    AI BUILDER
                  </div>
                  <div className="relative">
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Describe what you want to build..."
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-black transition-all text-sm"
                      rows={3}
                    />
                    <button
                      onClick={handleAIGenerate}
                      className="absolute bottom-2 right-2 px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all flex items-center gap-2 text-xs"
                    >
                      <Sparkles className="w-3 h-3" />
                      Generate
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  {/* Component Categories */}
                  <div className="space-y-6">
                    {['Layout', 'Content', 'Components'].map(category => (
                      <div key={category}>
                        <div className="text-xs tracking-widest text-gray-400 mb-3">{category.toUpperCase()}</div>
                        <div className="grid grid-cols-2 gap-3">
                          {componentLibrary
                            .filter(c => c.category === category)
                            .map(component => {
                              const IconComponent = component.icon;
                              return (
                                <div
                                  key={component.id}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, component)}
                                  className="p-3 border border-gray-200 rounded-lg hover:border-black hover:shadow-md transition-all cursor-move bg-white"
                                >
                                  <IconComponent className="w-5 h-5 mb-2 text-gray-700" />
                                  <div className="text-xs font-medium">{component.name}</div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Relations Tab */}
            {activeTab === 'relations' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-bold tracking-wider text-gray-700">DATA MODELS</div>
                  <button className="p-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {relationModels.map(model => {
                  const IconComponent = model.icon;
                  return (
                    <div key={model.id} className="p-4 border border-gray-200 rounded-lg hover:border-black transition-all cursor-pointer">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-sm">{model.name}</div>
                          <div className="text-xs text-gray-500">{model.fields.length} fields</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {model.fields.map(field => (
                          <span key={field} className="px-2 py-1 bg-gray-100 rounded text-xs">
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}

                <div className="pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500 mb-3">FEATURES</div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Auto Schema Generation
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Real-time Sync
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      AI Data Mapping
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Plugins Tab */}
            {activeTab === 'plugins' && (
              <div className="space-y-4">
                <div className="text-xs font-bold tracking-wider text-gray-700 mb-4">MARKETPLACE</div>
                
                {plugins.map(plugin => (
                  <div key={plugin.id} className="p-4 border border-gray-200 rounded-lg hover:border-black transition-all">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{plugin.icon}</div>
                      <div className="flex-1">
                        <div className="font-bold text-sm">{plugin.name}</div>
                        <div className="text-xs text-gray-500">
                          {plugin.installed ? 'Installed' : 'Not installed'}
                        </div>
                      </div>
                      <button
                        className={`px-3 py-1 rounded-lg text-xs transition-all ${
                          plugin.installed
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-black text-white hover:bg-gray-800'
                        }`}
                      >
                        {plugin.installed ? 'Installed' : 'Install'}
                      </button>
                    </div>
                  </div>
                ))}

                <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-black transition-all text-sm text-gray-600 hover:text-black">
                  Browse More Plugins
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Toggle Sidebar Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute left-0 top-32 z-20 bg-white border border-gray-200 rounded-r-lg p-2 hover:bg-gray-50 transition-all shadow-lg"
          style={{ left: sidebarOpen ? '320px' : '0px' }}
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        {/* Main Canvas */}
        <main className="flex-1 overflow-auto bg-gray-100 p-8">
          <div className="flex justify-center">
            <div
              className="bg-white shadow-2xl transition-all duration-300 min-h-screen relative"
              style={{ width: viewportSizes[viewport].width }}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => setSelectedComponent(null)}
            >
              {canvasComponents.length === 0 ? (
                <div className="flex items-center justify-center h-96 text-gray-400">
                  <div className="text-center">
                    <Layout className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">Drag components here</p>
                    <p className="text-sm">or use AI to generate your design</p>
                  </div>
                </div>
              ) : (
                canvasComponents.map(comp => renderComponentPreview(comp))
              )}
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className={`bg-white border-l border-gray-200 transition-all duration-300 ${
          rightSidebarOpen ? 'w-80' : 'w-0'
        } overflow-hidden`}>
          <div className="p-6 space-y-6 h-full overflow-auto">
            {/* Selected Component Properties */}
            {selectedComponent && (() => {
              const sel = canvasComponents.find(c => c.uniqueId === selectedComponent);
              if (!sel) return null;
              const type = sel.id.split('-')[0];
              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-700">
                    <Settings className="w-4 h-4" />
                    SELECTED COMPONENT
                  </div>
                  <div className="text-sm font-medium">{sel.name} <span className="text-xs text-gray-400">({type})</span></div>
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500">Position</div>
                    <div className="flex gap-2 text-sm">
                      <input type="number" value={Math.round(sel.x)} readOnly className="w-1/2 p-2 border rounded" />
                      <input type="number" value={Math.round(sel.y)} readOnly className="w-1/2 p-2 border rounded" />
                    </div>
                  </div>
                  {type === 'button' && (
                    <div>
                      <div className="text-xs text-gray-500">Label</div>
                      <input className="w-full p-2 border rounded" value={sel.props?.label || ''} onChange={(e) => updateSelectedComponent({ label: e.target.value })} />
                    </div>
                  )}
                  {type === 'text' && (
                    <div>
                      <div className="text-xs text-gray-500">Text</div>
                      <input className="w-full p-2 border rounded" value={sel.props?.text || ''} onChange={(e) => updateSelectedComponent({ text: e.target.value })} />
                    </div>
                  )}
                  {type === 'heading' && (
                    <div>
                      <div className="text-xs text-gray-500">Heading</div>
                      <input className="w-full p-2 border rounded" value={sel.props?.text || ''} onChange={(e) => updateSelectedComponent({ text: e.target.value })} />
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <button className="flex-1 p-2 bg-red-500 text-white rounded" onClick={() => { setCanvasComponents(prev => prev.filter(c => c.uniqueId !== selectedComponent)); setSelectedComponent(null); }}>Delete</button>
                    <button className="flex-1 p-2 bg-gray-100 rounded" onClick={() => setSelectedComponent(null)}>Close</button>
                  </div>
                </div>
              );
            })()}
            {/* Export Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-700">
                <Download className="w-4 h-4" />
                EXPORT CODE
              </div>
              
              <div className="space-y-2">
                {[
                  { name: 'React', icon: '⚛️' },
                  { name: 'Flutter', icon: '📱' },
                  { name: 'Vue.js', icon: '💚' },
                  { name: 'Angular', icon: '🅰️' }
                ].map(framework => (
                  <button
                    key={framework.name}
                    className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-3 text-sm"
                  >
                    <span className="text-xl">{framework.icon}</span>
                    <span className="font-medium">{framework.name}</span>
                    <Download className="w-4 h-4 ml-auto" />
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-700 mb-4">
                <Globe2 className="w-4 h-4" />
                DEPLOYMENT
              </div>
              
              <div className="space-y-3">
                <button onClick={handleDeploy} disabled={deploymentLoading} className="w-full p-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm">
                  <Rocket className="w-4 h-4" />
                  {deploymentLoading ? 'Deploying...' : 'Deploy to Web'}
                </button>
                <button disabled className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center gap-2 text-sm cursor-not-allowed">
                  <Smartphone className="w-4 h-4" />
                  Build Mobile App
                  <span className="ml-auto text-xs">Under Dev</span>
                </button>
              </div>
            </div>

            {/* Additional Features */}
            <div className="border-t border-gray-200 pt-6">
              <div className="text-xs text-gray-500 mb-3">FEATURES</div>
              <div className="space-y-2">
                <button className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 text-sm">
                  <Languages className="w-4 h-4" />
                  AI Localization
                </button>
                <button className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 text-sm">
                  <GitBranch className="w-4 h-4" />
                  Version History
                </button>
                <button className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4" />
                  Snapshots
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Toggle Right Sidebar Button */}
        <button
          onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
          className="absolute right-0 top-32 z-20 bg-white border border-gray-200 rounded-l-lg p-2 hover:bg-gray-50 transition-all shadow-lg"
          style={{ right: rightSidebarOpen ? '320px' : '0px' }}
        >
          {rightSidebarOpen ? <X className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
        </button>
      </div>

      {/* Bottom Status Bar */}
      <div className="bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-6">
          <span>{canvasComponents.length} components</span>
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Auto-saved
          </span>
          <span>Last deployed: 2 hours ago</span>
        </div>
        <div className="flex items-center gap-6">
          <span>Database: Connected</span>
          <span>Zoom: 100%</span>
          <button className="hover:text-black transition-colors">Keyboard Shortcuts</button>
        </div>
      </div>
    </div>
  );
}