import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { 
  Sparkles, Layout, Type, Image, Square, 
  Circle, Menu, X, Monitor, Smartphone, Tablet, Code2, Play, 
  Undo, Redo, Layers, Settings, Save, Download, Eye, Zap,
  Plus, Trash2, Copy, Move, AlignLeft, AlignCenter, AlignRight,
  ChevronDown, Grid, Columns, Box, Database, Users, Globe2,
  GitBranch, Package, Rocket, Languages, Clock, Activity, Link2,
  Table, FileJson, Workflow, ArrowRight, Pencil
} from 'lucide-react';

export default function OvioEditor() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [viewport, setViewport] = useState('desktop');
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [mode, setMode] = useState('edit');
  const [canvasComponents, setCanvasComponents] = useState([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [deploymentUrl, setDeploymentUrl] = useState(null);
  const [deploymentLoading, setDeploymentLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('components');
  const [showAICopilot, setShowAICopilot] = useState(false);
  const [copilotCommand, setCopilotCommand] = useState('');
  const [isCollaborating, setIsCollaborating] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [initialStateLoaded, setInitialStateLoaded] = useState(false);
  
  // New states for backend connector and modules
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [modules, setModules] = useState([
    {
      id: 'users_module',
      name: 'Users',
      tables: [
        { 
          id: 'users_table', 
          name: 'users', 
          fields: [
            { name: 'id', type: 'integer', primary: true },
            { name: 'email', type: 'string' },
            { name: 'password', type: 'string' },
            { name: 'name', type: 'string' }
          ]
        }
      ]
    },
    {
      id: 'products_module',
      name: 'Products',
      tables: [
        { 
          id: 'products_table', 
          name: 'products', 
          fields: [
            { name: 'id', type: 'integer', primary: true },
            { name: 'title', type: 'string' },
            { name: 'price', type: 'decimal' },
            { name: 'stock', type: 'integer' }
          ]
        }
      ]
    }
  ]);
  const [showModuleEditor, setShowModuleEditor] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  
  const { projectId } = useParams();
  const socketRef = useRef(null);
  const initialStateLoadedRef = useRef(false);
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

  const getColorForUser = (username) => {
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-pink-500', 'bg-yellow-500'];
    if (!username) return colors[0];
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = (hash * 31 + username.charCodeAt(i)) >>> 0;
    }
    return colors[hash % colors.length];
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data);
        }
      } catch (err) {
        console.error('failed to load current user', err);
      }
    })();
  }, [API_BASE]);

  useEffect(() => {
    if (!projectId || !currentUser) return;
    let mounted = true;
    const token = localStorage.getItem('token');

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/editor/${projectId}/state`, {
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (mounted) {
            setCanvasComponents(data.canvas || []);
            setInitialStateLoaded(true);
            initialStateLoadedRef.current = true;
          }
        } else {
          if (mounted) {
            setInitialStateLoaded(true);
            initialStateLoadedRef.current = true;
          }
        }
      } catch (err) {
        console.error('failed to load project state', err);
        if (mounted) {
          setInitialStateLoaded(true);
          initialStateLoadedRef.current = true;
        }
      }
    })();

    try {
      const socket = io(API_BASE, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });
      socketRef.current = socket;
      
      socket.on('connect', () => {
        console.log('Socket connected, joining project', projectId);
        socket.emit('join_project', {
          project_id: projectId,
          user_id: currentUser.id,
          username: currentUser.username,
          name: currentUser.name
        });
      });
      
      socket.on('connect_error', (err) => {
        console.error('Socket connection error', err);
      });
      
      socket.on('state_update', (payload) => {
        if (!payload) return;
        if (String(payload.project_id) !== String(projectId)) return;
        if (payload.state && payload.state.canvas !== undefined) {
          console.log('Received state_update via socket', payload);
          if (initialStateLoadedRef.current) {
            setCanvasComponents(payload.state.canvas || []);
          } else {
            console.log('Ignoring state_update - initial state not loaded yet');
          }
        }
      });
      socket.on('presence_update', (payload) => {
        if (!payload || String(payload.project_id) !== String(projectId)) return;
        const users = payload.users || [];
        console.log('Received presence_update via socket', users);
        setCollaborators(users);
      });
      socket.on('collaborator_added', (payload) => {
        if (!payload || String(payload.project_id) !== String(projectId)) return;
        const newUser = payload.user;
        console.log('Received collaborator_added via socket', newUser);
        if (newUser) {
          setCollaborators((prev) => {
            if (prev.find((u) => u.id === newUser.id)) return prev;
            return [...prev, newUser];
          });
        }
      });
      
      if (socket.connected) {
        socket.emit('join_project', {
          project_id: projectId,
          user_id: currentUser.id,
          username: currentUser.username,
          name: currentUser.name
        });
      }
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
  }, [projectId, currentUser, API_BASE]);

  const saveTimeoutRef = useRef(null);
  const saveState = async (state) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_BASE}/editor/${projectId}/state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(state)
      });
    } catch (err) {
      console.error('failed to save state', err);
    }
  };

  const handleSaveNow = async () => {
    if (!projectId) return;
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    const state = { id: projectId, canvas: canvasComponents };
    await saveState(state);
    if (socketRef.current) socketRef.current.emit('state_update', { project_id: projectId, state });
  };

  const handleInviteCollaborator = async () => {
    if (!inviteEmail.trim() || !projectId) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}/collaborators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ email: inviteEmail.trim() })
      });
      if (!res.ok) {
        alert('Could not add collaborator (check email and permissions)');
        return;
      }
      const data = await res.json();
      setCollaborators((prev) => {
        if (prev.find((u) => u.id === data.id)) return prev;
        return [...prev, data];
      });
      setInviteEmail('');
    } catch (err) {
      console.error('failed to invite collaborator', err);
      alert('Failed to invite collaborator');
    }
  };

  useEffect(() => {
    if (!projectId || !initialStateLoaded) return;
    
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      const state = { id: projectId, canvas: canvasComponents };
      saveState(state);
      if (socketRef.current && socketRef.current.connected) {
        console.log('Emitting state_update via socket', { project_id: projectId, state });
        socketRef.current.emit('state_update', { project_id: projectId, state });
      }
    }, 1200);
    return () => saveTimeoutRef.current && clearTimeout(saveTimeoutRef.current);
  }, [canvasComponents, projectId, initialStateLoaded]);

  const componentLibrary = [
    { id: 'container', name: 'Container', icon: Square, category: 'Layout' },
    { id: 'grid', name: 'Grid', icon: Grid, category: 'Layout' },
    { id: 'columns', name: 'Columns', icon: Columns, category: 'Layout' },
    { id: 'text', name: 'Text', icon: Type, category: 'Content' },
    { id: 'heading', name: 'Heading', icon: Type, category: 'Content' },
    { id: 'button', name: 'Button', icon: Box, category: 'Content' },
    { id: 'image', name: 'Image', icon: Image, category: 'Content' },
    { id: 'input', name: 'Input', icon: Type, category: 'Content' },
    { id: 'card', name: 'Card', icon: Layout, category: 'Components' },
    { id: 'hero', name: 'Hero Section', icon: Layout, category: 'Components' },
  ];

  const plugins = [
    { id: 'stripe', name: 'Stripe Payments', icon: '💳', installed: true },
    { id: 'google-auth', name: 'Google Login', icon: '🔐', installed: true },
    { id: 'sendgrid', name: 'SendGrid Email', icon: '📧', installed: false },
    { id: 'twilio', name: 'Twilio SMS', icon: '📱', installed: false },
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
      y: e.clientY - rect.top,
      actions: [] // Initialize actions array
    };
    setCanvasComponents([...canvasComponents, newComponent]);
  };

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

  // Open action modal for selected component
  const handleConfigureActions = (comp) => {
    setSelectedComponent(comp.uniqueId);
    setSelectedAction(comp.actions?.[0] || null);
    setShowActionModal(true);
  };

  // Add action to component
  const handleAddAction = (actionType) => {
    const newAction = {
      id: `action-${Date.now()}`,
      type: actionType,
      config: {}
    };
    
    setCanvasComponents((prev) => prev.map((c) => {
      if (c.uniqueId === selectedComponent) {
        return {
          ...c,
          actions: [...(c.actions || []), newAction]
        };
      }
      return c;
    }));
    
    setSelectedAction(newAction);
  };

  // Update action configuration
  const updateActionConfig = (actionId, config) => {
    setCanvasComponents((prev) => prev.map((c) => {
      if (c.uniqueId === selectedComponent) {
        return {
          ...c,
          actions: (c.actions || []).map((a) => 
            a.id === actionId ? { ...a, config: { ...a.config, ...config } } : a
          )
        };
      }
      return c;
    }));
  };

  // Execute component actions (in play mode)
  const executeActions = (comp) => {
    if (!comp.actions || comp.actions.length === 0) return;
    
    comp.actions.forEach((action) => {
      switch(action.type) {
        case 'api_call':
          alert(`API Call: ${action.config.method} ${action.config.endpoint}`);
          break;
        case 'db_insert':
          alert(`Insert into ${action.config.table}: ${JSON.stringify(action.config.data)}`);
          break;
        case 'db_query':
          alert(`Query ${action.config.table}`);
          break;
        case 'navigate':
          alert(`Navigate to: ${action.config.url}`);
          break;
        case 'show_alert':
          alert(action.config.message || 'Alert!');
          break;
        default:
          break;
      }
    });
  };

  const renderComponentPreview = (comp) => {
    const baseClasses = "absolute p-4 border-2 border-dashed border-gray-300 bg-white hover:border-blue-500 cursor-move transition-all";
    const style = { left: comp.x, top: comp.y };

    const type = comp.id.split('-')[0];
    const props = comp.props || {};

    const hasActions = comp.actions && comp.actions.length > 0;

    const commonProps = {
      key: comp.uniqueId,
      className: baseClasses + (hasActions ? ' ring-2 ring-purple-300' : ''),
      style,
      onMouseDown: (e) => {
        if (mode !== 'edit') return;
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
      case 'input':
        return <input {...commonProps} placeholder={props.placeholder || 'Enter text...'} className={`${baseClasses} border border-gray-300`} />;
      case 'button':
        if (mode === 'play') {
          return (
            <button 
              key={comp.uniqueId} 
              className={`${baseClasses} bg-black text-white px-6 py-2`} 
              style={style} 
              onClick={() => executeActions(comp)}
            >
              {props.label || 'Button'}
            </button>
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

  const updateSelectedComponent = (updates) => {
    setCanvasComponents((prev) => prev.map((c) => c.uniqueId === selectedComponent ? { ...c, props: { ...(c.props||{}), ...updates } } : c));
  };

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

  // Module management functions
  const handleAddModule = () => {
    const newModule = {
      id: `module-${Date.now()}`,
      name: 'New Module',
      tables: []
    };
    setModules([...modules, newModule]);
    setEditingModule(newModule);
    setShowModuleEditor(true);
  };

  const handleAddTable = (moduleId) => {
    const newTable = {
      id: `table-${Date.now()}`,
      name: 'new_table',
      fields: [
        { name: 'id', type: 'integer', primary: true }
      ]
    };
    
    setModules(prev => prev.map(m => 
      m.id === moduleId ? { ...m, tables: [...m.tables, newTable] } : m
    ));
  };

  const handleAddField = (moduleId, tableId) => {
    const newField = {
      name: 'new_field',
      type: 'string',
      primary: false
    };
    
    setModules(prev => prev.map(m => 
      m.id === moduleId ? {
        ...m,
        tables: m.tables.map(t => 
          t.id === tableId ? { ...t, fields: [...t.fields, newField] } : t
        )
      } : m
    ));
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
          {isCollaborating && (
            <div className="flex items-center gap-2 mr-4">
              <div className="flex -space-x-2">
                {collaborators.map((collab, idx) => (
                  <div
                    key={idx}
                    className={`w-8 h-8 ${getColorForUser(collab.username || collab.name)} rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold ring-2 ring-green-400`}
                    title={collab.name || collab.username}
                  >
                    {(collab.name || collab.username || '?')[0]}
                  </div>
                ))}
                {!collaborators.length && currentUser && (
                  <div
                    className={`w-8 h-8 ${getColorForUser(currentUser.username)} rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold ring-2 ring-green-400`}
                    title={currentUser.name || currentUser.username}
                  >
                    {(currentUser.name || currentUser.username || '?')[0]}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Live
              </div>
              <div className="flex items-center gap-2 ml-3">
                <input
                  type="text"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Add by email"
                  className="px-2 py-1 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-black"
                />
                <button
                  onClick={handleInviteCollaborator}
                  className="px-2 py-1 bg-black text-white rounded-lg text-xs hover:bg-gray-800 transition-all"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          <button className="p-2 hover:bg-gray-100 rounded-lg transition-all" title="Undo">
            <Undo className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-all" title="Redo">
            <Redo className="w-4 h-4" />
          </button>
          <button onClick={handleSaveNow} className="p-2 hover:bg-gray-100 rounded-lg transition-all" title="Save">
            <Save className="w-4 h-4" />
          </button>
          <div className="ml-2 flex items-center bg-gray-100 rounded-lg p-1">
            <button onClick={() => setMode('edit')} className={`px-3 py-1 rounded ${mode === 'edit' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}>Edit</button>
            <button onClick={() => setMode('play')} className={`px-3 py-1 rounded ${mode === 'play' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}>Play</button>
          </div>
          <div className="w-px h-6 bg-gray-300"></div>
          
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
          
          <button className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 text-sm">
            <GitBranch className="w-4 h-4" />
            <span className="hidden md:inline">main</span>
          </button>

          <button onClick={handleDeploy} disabled={deploymentLoading} className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all flex items-center gap-2 text-sm">
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

      {/* Backend Action Configuration Modal */}
      {showActionModal && (() => {
        const comp = canvasComponents.find(c => c.uniqueId === selectedComponent);
        if (!comp) return null;
        
        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <Link2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Backend Connector</h2>
                      <p className="text-sm text-gray-600">Configure actions for {comp.name}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowActionModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-6">
                <div className="grid grid-cols-3 gap-6">
                  {/* Actions List */}
                  <div className="space-y-3">
                    <div className="text-sm font-bold text-gray-700 mb-4">ACTIONS</div>
                    
                    {(comp.actions || []).map((action, idx) => (
                      <div
                        key={action.id}
                        onClick={() => setSelectedAction(action)}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedAction?.id === action.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Workflow className="w-4 h-4" />
                          <span className="text-sm font-medium">Action {idx + 1}</span>
                        </div>
                        <div className="text-xs text-gray-500">{action.type.replace('_', ' ').toUpperCase()}</div>
                      </div>
                    ))}

                    <div className="pt-3">
                      <div className="text-xs text-gray-500 mb-2">Add New Action</div>
                      <div className="space-y-2">
                        <button onClick={() => handleAddAction('api_call')} className="w-full p-2 text-left text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
                          📡 API Call
                        </button>
                        <button onClick={() => handleAddAction('db_insert')} className="w-full p-2 text-left text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
                          💾 Database Insert
                        </button>
                        <button onClick={() => handleAddAction('db_query')} className="w-full p-2 text-left text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
                          🔍 Database Query
                        </button>
                        <button onClick={() => handleAddAction('navigate')} className="w-full p-2 text-left text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
                          🔗 Navigate
                        </button>
                        <button onClick={() => handleAddAction('show_alert')} className="w-full p-2 text-left text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
                          ⚠️ Show Alert
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Action Configuration */}
                  <div className="col-span-2 border-l border-gray-200 pl-6">
                    {selectedAction ? (
                      <div className="space-y-4">
                        <div className="text-sm font-bold text-gray-700 mb-4">CONFIGURE ACTION</div>
                        
                        {selectedAction.type === 'api_call' && (
                          <>
                            <div>
                              <label className="text-xs text-gray-600 mb-1 block">Method</label>
                              <select 
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                value={selectedAction.config.method || 'GET'}
                                onChange={(e) => updateActionConfig(selectedAction.id, { method: e.target.value })}
                              >
                                <option>GET</option>
                                <option>POST</option>
                                <option>PUT</option>
                                <option>DELETE</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-gray-600 mb-1 block">Endpoint URL</label>
                              <input 
                                type="text"
                                placeholder="https://api.example.com/endpoint"
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                value={selectedAction.config.endpoint || ''}
                                onChange={(e) => updateActionConfig(selectedAction.id, { endpoint: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600 mb-1 block">Headers (JSON)</label>
                              <textarea 
                                placeholder='{"Authorization": "Bearer token"}'
                                className="w-full p-2 border border-gray-300 rounded-lg font-mono text-sm"
                                rows={3}
                                value={selectedAction.config.headers || ''}
                                onChange={(e) => updateActionConfig(selectedAction.id, { headers: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600 mb-1 block">Body (JSON)</label>
                              <textarea 
                                placeholder='{"key": "value"}'
                                className="w-full p-2 border border-gray-300 rounded-lg font-mono text-sm"
                                rows={4}
                                value={selectedAction.config.body || ''}
                                onChange={(e) => updateActionConfig(selectedAction.id, { body: e.target.value })}
                              />
                            </div>
                          </>
                        )}

                        {selectedAction.type === 'db_insert' && (
                          <>
                            <div>
                              <label className="text-xs text-gray-600 mb-1 block">Table</label>
                              <select 
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                value={selectedAction.config.table || ''}
                                onChange={(e) => updateActionConfig(selectedAction.id, { table: e.target.value })}
                              >
                                <option value="">Select table...</option>
                                {modules.flatMap(m => m.tables).map(t => (
                                  <option key={t.id} value={t.name}>{t.name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-gray-600 mb-1 block">Data (JSON)</label>
                              <textarea 
                                placeholder='{"field1": "value1", "field2": "value2"}'
                                className="w-full p-2 border border-gray-300 rounded-lg font-mono text-sm"
                                rows={6}
                                value={selectedAction.config.data || ''}
                                onChange={(e) => updateActionConfig(selectedAction.id, { data: e.target.value })}
                              />
                            </div>
                          </>
                        )}

                        {selectedAction.type === 'db_query' && (
                          <>
                            <div>
                              <label className="text-xs text-gray-600 mb-1 block">Table</label>
                              <select 
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                value={selectedAction.config.table || ''}
                                onChange={(e) => updateActionConfig(selectedAction.id, { table: e.target.value })}
                              >
                                <option value="">Select table...</option>
                                {modules.flatMap(m => m.tables).map(t => (
                                  <option key={t.id} value={t.name}>{t.name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-gray-600 mb-1 block">Filter Conditions (JSON)</label>
                              <textarea 
                                placeholder='{"userId": 123, "status": "active"}'
                                className="w-full p-2 border border-gray-300 rounded-lg font-mono text-sm"
                                rows={4}
                                value={selectedAction.config.filter || ''}
                                onChange={(e) => updateActionConfig(selectedAction.id, { filter: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600 mb-1 block">Order By</label>
                              <input 
                                type="text"
                                placeholder="created_at DESC"
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                value={selectedAction.config.orderBy || ''}
                                onChange={(e) => updateActionConfig(selectedAction.id, { orderBy: e.target.value })}
                              />
                            </div>
                          </>
                        )}

                        {selectedAction.type === 'navigate' && (
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">URL or Route</label>
                            <input 
                              type="text"
                              placeholder="/dashboard or https://example.com"
                              className="w-full p-2 border border-gray-300 rounded-lg"
                              value={selectedAction.config.url || ''}
                              onChange={(e) => updateActionConfig(selectedAction.id, { url: e.target.value })}
                            />
                            <div className="mt-3">
                              <label className="flex items-center gap-2">
                                <input 
                                  type="checkbox"
                                  checked={selectedAction.config.newTab || false}
                                  onChange={(e) => updateActionConfig(selectedAction.id, { newTab: e.target.checked })}
                                />
                                <span className="text-sm">Open in new tab</span>
                              </label>
                            </div>
                          </div>
                        )}

                        {selectedAction.type === 'show_alert' && (
                          <>
                            <div>
                              <label className="text-xs text-gray-600 mb-1 block">Message</label>
                              <input 
                                type="text"
                                placeholder="Success! Your action was completed."
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                value={selectedAction.config.message || ''}
                                onChange={(e) => updateActionConfig(selectedAction.id, { message: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600 mb-1 block">Type</label>
                              <select 
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                value={selectedAction.config.alertType || 'info'}
                                onChange={(e) => updateActionConfig(selectedAction.id, { alertType: e.target.value })}
                              >
                                <option value="info">Info</option>
                                <option value="success">Success</option>
                                <option value="warning">Warning</option>
                                <option value="error">Error</option>
                              </select>
                            </div>
                          </>
                        )}

                        <div className="pt-4 border-t border-gray-200 mt-6">
                          <button 
                            onClick={() => {
                              setCanvasComponents(prev => prev.map(c => 
                                c.uniqueId === selectedComponent ? {
                                  ...c,
                                  actions: c.actions.filter(a => a.id !== selectedAction.id)
                                } : c
                              ));
                              setSelectedAction(null);
                            }}
                            className="w-full p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                          >
                            Delete Action
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <div className="text-center">
                          <Workflow className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p className="text-sm">Select or add an action to configure</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end gap-2">
                <button 
                  onClick={() => setShowActionModal(false)}
                  className="px-6 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Module Editor Modal */}
      {showModuleEditor && editingModule && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                    <Database className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <input 
                      type="text"
                      value={editingModule.name}
                      onChange={(e) => {
                        const newName = e.target.value;
                        setEditingModule({...editingModule, name: newName});
                        setModules(prev => prev.map(m => m.id === editingModule.id ? {...m, name: newName} : m));
                      }}
                      className="text-2xl font-bold border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none transition-all"
                    />
                    <p className="text-sm text-gray-600">Database Module Configuration</p>
                  </div>
                </div>
                <button onClick={() => setShowModuleEditor(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <div className="space-y-6">
                {editingModule.tables.map((table, tableIdx) => (
                  <div key={table.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Table className="w-5 h-5 text-gray-600" />
                        <input 
                          type="text"
                          value={table.name}
                          onChange={(e) => {
                            const newName = e.target.value;
                            setModules(prev => prev.map(m => 
                              m.id === editingModule.id ? {
                                ...m,
                                tables: m.tables.map(t => t.id === table.id ? {...t, name: newName} : t)
                              } : m
                            ));
                            setEditingModule(prev => ({
                              ...prev,
                              tables: prev.tables.map(t => t.id === table.id ? {...t, name: newName} : t)
                            }));
                          }}
                          className="font-bold text-lg border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <button 
                        onClick={() => {
                          setModules(prev => prev.map(m => 
                            m.id === editingModule.id ? {
                              ...m,
                              tables: m.tables.filter(t => t.id !== table.id)
                            } : m
                          ));
                          setEditingModule(prev => ({
                            ...prev,
                            tables: prev.tables.filter(t => t.id !== table.id)
                          }));
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {table.fields.map((field, fieldIdx) => (
                        <div key={fieldIdx} className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                          <input 
                            type="text"
                            value={field.name}
                            onChange={(e) => {
                              const newName = e.target.value;
                              setModules(prev => prev.map(m => 
                                m.id === editingModule.id ? {
                                  ...m,
                                  tables: m.tables.map(t => t.id === table.id ? {
                                    ...t,
                                    fields: t.fields.map((f, i) => i === fieldIdx ? {...f, name: newName} : f)
                                  } : t)
                                } : m
                              ));
                            }}
                            className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="field_name"
                          />
                          <select 
                            value={field.type}
                            onChange={(e) => {
                              const newType = e.target.value;
                              setModules(prev => prev.map(m => 
                                m.id === editingModule.id ? {
                                  ...m,
                                  tables: m.tables.map(t => t.id === table.id ? {
                                    ...t,
                                    fields: t.fields.map((f, i) => i === fieldIdx ? {...f, type: newType} : f)
                                  } : t)
                                } : m
                              ));
                            }}
                            className="p-2 border border-gray-300 rounded-lg text-sm w-32"
                          >
                            <option value="string">String</option>
                            <option value="integer">Integer</option>
                            <option value="decimal">Decimal</option>
                            <option value="boolean">Boolean</option>
                            <option value="date">Date</option>
                            <option value="text">Text</option>
                          </select>
                          <label className="flex items-center gap-1">
                            <input 
                              type="checkbox"
                              checked={field.primary || false}
                              onChange={(e) => {
                                const isPrimary = e.target.checked;
                                setModules(prev => prev.map(m => 
                                  m.id === editingModule.id ? {
                                    ...m,
                                    tables: m.tables.map(t => t.id === table.id ? {
                                      ...t,
                                      fields: t.fields.map((f, i) => i === fieldIdx ? {...f, primary: isPrimary} : f)
                                    } : t)
                                  } : m
                                ));
                              }}
                            />
                            <span className="text-xs text-gray-600">PK</span>
                          </label>
                          <button 
                            onClick={() => {
                              setModules(prev => prev.map(m => 
                                m.id === editingModule.id ? {
                                  ...m,
                                  tables: m.tables.map(t => t.id === table.id ? {
                                    ...t,
                                    fields: t.fields.filter((_, i) => i !== fieldIdx)
                                  } : t)
                                } : m
                              ));
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      
                      <button 
                        onClick={() => handleAddField(editingModule.id, table.id)}
                        className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-blue-600"
                      >
                        <Plus className="w-4 h-4" />
                        Add Field
                      </button>
                    </div>
                  </div>
                ))}

                <button 
                  onClick={() => handleAddTable(editingModule.id)}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all flex items-center justify-center gap-2 text-gray-600 hover:text-green-600"
                >
                  <Plus className="w-5 h-5" />
                  Add Table
                </button>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-between">
              <button 
                onClick={() => {
                  const schema = JSON.stringify(editingModule, null, 2);
                  const blob = new Blob([schema], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${editingModule.name.toLowerCase().replace(/\s/g, '_')}_schema.json`;
                  a.click();
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Schema
              </button>
              <button 
                onClick={() => setShowModuleEditor(false)}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all"
              >
                Done
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
                <Link2 className="w-4 h-4" />
                <span>Relations</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('modules')}
              className={`flex-1 px-4 py-3 text-xs font-medium transition-all ${
                activeTab === 'modules' ? 'bg-gray-50 border-b-2 border-black' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <Database className="w-4 h-4" />
                <span>Modules</span>
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

            {/* Relations Tab - Backend Connector */}
            {activeTab === 'relations' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-700 mb-4">
                  <Link2 className="w-4 h-4" />
                  BACKEND CONNECTOR
                </div>

                <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Workflow className="w-5 h-5 text-blue-600" />
                    <div className="font-bold text-sm">Connect Components</div>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">
                    Select any component on the canvas and configure its backend actions.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="text-xs text-gray-500 mb-2">AVAILABLE ACTIONS</div>
                  
                  <div className="space-y-2">
                    <div className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          📡
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">API Call</div>
                          <div className="text-xs text-gray-500">Make HTTP requests to external APIs</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          💾
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">Database Insert</div>
                          <div className="text-xs text-gray-500">Add new records to your tables</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          🔍
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">Database Query</div>
                          <div className="text-xs text-gray-500">Fetch data from your tables</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                          🔗
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">Navigate</div>
                          <div className="text-xs text-gray-500">Redirect to another page</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                          ⚠️
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">Show Alert</div>
                          <div className="text-xs text-gray-500">Display messages to users</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500 mb-3">SELECTED COMPONENTS</div>
                  {canvasComponents.filter(c => c.actions && c.actions.length > 0).length > 0 ? (
                    <div className="space-y-2">
                      {canvasComponents.filter(c => c.actions && c.actions.length > 0).map(comp => (
                        <div 
                          key={comp.uniqueId}
                          onClick={() => handleConfigureActions(comp)}
                          className="p-3 border border-purple-200 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm">{comp.name}</div>
                              <div className="text-xs text-gray-600">{comp.actions.length} action(s) configured</div>
                            </div>
                            <Pencil className="w-4 h-4 text-purple-600" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 text-center py-4">
                      No components with actions yet. Select a component and click "Configure Actions" in the properties panel.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Modules Tab */}
            {activeTab === 'modules' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-bold tracking-wider text-gray-700">DATABASE MODULES</div>
                  <button 
                    onClick={handleAddModule}
                    className="p-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {modules.map(module => (
                  <div 
                    key={module.id} 
                    onClick={() => {
                      setEditingModule(module);
                      setShowModuleEditor(true);
                    }}
                    className="p-4 border border-gray-200 rounded-lg hover:border-black transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-teal-500 rounded-lg flex items-center justify-center">
                        <Database className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-sm">{module.name}</div>
                        <div className="text-xs text-gray-500">{module.tables.length} table(s)</div>
                      </div>
                      <Pencil className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="space-y-1">
                      {module.tables.map(table => (
                        <div key={table.id} className="flex items-center gap-2 text-xs bg-gray-50 p-2 rounded">
                          <Table className="w-3 h-3 text-gray-500" />
                          <span className="font-medium">{table.name}</span>
                          <span className="text-gray-400">({table.fields.length} fields)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500 mb-3">FEATURES</div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Visual Schema Editor
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Auto Relations
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      JSON Export
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
                  {type === 'input' && (
                    <div>
                      <div className="text-xs text-gray-500">Placeholder</div>
                      <input className="w-full p-2 border rounded" value={sel.props?.placeholder || ''} onChange={(e) => updateSelectedComponent({ placeholder: e.target.value })} />
                    </div>
                  )}

                  {/* Backend Actions Section */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs text-gray-500">BACKEND ACTIONS</div>
                      <div className="text-xs font-bold text-purple-600">
                        {sel.actions?.length || 0} configured
                      </div>
                    </div>
                    <button 
                      onClick={() => handleConfigureActions(sel)}
                      className="w-full p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <Link2 className="w-4 h-4" />
                      Configure Actions
                    </button>
                  </div>

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
          <span>{modules.reduce((acc, m) => acc + m.tables.length, 0)} tables in {modules.length} modules</span>
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
