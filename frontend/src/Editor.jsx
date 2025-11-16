import { useState } from 'react';
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
  const [canvasComponents, setCanvasComponents] = useState([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [activeTab, setActiveTab] = useState('components');
  const [showAICopilot, setShowAICopilot] = useState(false);
  const [copilotCommand, setCopilotCommand] = useState('');
  const [isCollaborating, setIsCollaborating] = useState(true);

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

    switch(comp.id.split('-')[0]) {
      case 'text':
        return <div key={comp.uniqueId} className={baseClasses} style={style}>Sample Text</div>;
      case 'heading':
        return <div key={comp.uniqueId} className={`${baseClasses} font-bold text-2xl`} style={style}>Heading</div>;
      case 'button':
        return <button key={comp.uniqueId} className={`${baseClasses} bg-black text-white px-6 py-2`} style={style}>Button</button>;
      case 'image':
        return <div key={comp.uniqueId} className={`${baseClasses} w-48 h-32 bg-gray-200`} style={style}>Image</div>;
      case 'card':
        return <div key={comp.uniqueId} className={`${baseClasses} w-64 h-48 shadow-lg`} style={style}>Card Component</div>;
      default:
        return <div key={comp.uniqueId} className={baseClasses} style={style}>{comp.name}</div>;
    }
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
                <button className="w-full p-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2 text-sm">
                  <Rocket className="w-4 h-4" />
                  Deploy to Web
                </button>
                <button className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-sm">
                  <Smartphone className="w-4 h-4" />
                  Build Mobile App
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