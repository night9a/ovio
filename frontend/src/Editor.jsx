import { useState } from 'react';
import { 
  Sparkles, Layout, Type, Image, Square, 
  Circle, Menu, X, Monitor, Smartphone, Tablet, Code2, Play, 
  Undo, Redo, Layers, Settings, Save, Download, Eye, Zap,
  Plus, Trash2, Copy, Move, AlignLeft, AlignCenter, AlignRight,
  ChevronDown, Grid, Columns, Rows, Box
} from 'lucide-react';

export default function OvioEditor() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewport, setViewport] = useState('desktop'); // desktop, tablet, mobile
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [canvasComponents, setCanvasComponents] = useState([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showCodeView, setShowCodeView] = useState(false);

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
      // Simulate AI generation
      alert(`AI is generating: ${aiPrompt}`);
      setAiPrompt('');
    }
  };

  const renderComponentPreview = (comp) => {
    const baseClasses = "absolute p-4 border-2 border-dashed border-gray-300 bg-white hover:border-blue-500 cursor-move transition-all";
    const style = { left: comp.x, top: comp.y };

    switch(comp.id.split('-')[0]) {
      case 'text':
        return <div key={comp.id} className={baseClasses} style={style}>Sample Text</div>;
      case 'heading':
        return <div key={comp.id} className={`${baseClasses} font-bold text-2xl`} style={style}>Heading</div>;
      case 'button':
        return <button key={comp.id} className={`${baseClasses} bg-black text-white px-6 py-2`} style={style}>Button</button>;
      case 'image':
        return <div key={comp.id} className={`${baseClasses} w-48 h-32 bg-gray-200`} style={style}>Image</div>;
      case 'card':
        return <div key={comp.id} className={`${baseClasses} w-64 h-48 shadow-lg`} style={style}>Card Component</div>;
      default:
        return <div key={comp.id} className={baseClasses} style={style}>{comp.name}</div>;
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-30">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-light tracking-wider">OVIO</span>
          </div>
          <div className="text-sm text-gray-500">/ Untitled Project</div>
        </div>

        {/* Viewport Switcher */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          {Object.entries(viewportSizes).map(([key, val]) => {
            const IconComponent = val.icon;
            return (
              <button
                key={key}
                onClick={() => setViewport(key)}
                className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${
                  viewport === key ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span className="text-sm hidden md:inline">{val.label}</span>
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-all" title="Undo">
            <Undo className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-all" title="Redo">
            <Redo className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-gray-300"></div>
          <button 
            onClick={() => setShowCodeView(!showCodeView)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all" 
            title="Code View"
          >
            <Code2 className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-all" title="Preview">
            <Eye className="w-5 h-5" />
          </button>
          <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Component Library */}
        <aside className={`bg-white border-r border-gray-200 transition-all duration-300 ${
          sidebarOpen ? 'w-80' : 'w-0'
        } overflow-hidden`}>
          <div className="p-6 space-y-6">
            {/* AI Prompt */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold tracking-wider text-gray-700">
                <Zap className="w-4 h-4" />
                AI ASSISTANT
              </div>
              <div className="relative">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe what you want to build... (e.g., 'Create a hero section with a heading, description, and two buttons')"
                  className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-black transition-all text-sm"
                  rows={4}
                />
                <button
                  onClick={handleAIGenerate}
                  className="absolute bottom-3 right-3 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all flex items-center gap-2 text-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2 text-sm font-bold tracking-wider text-gray-700 mb-4">
                <Layers className="w-4 h-4" />
                COMPONENTS
              </div>

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
                              className="p-4 border border-gray-200 rounded-lg hover:border-black hover:shadow-md transition-all cursor-move bg-white"
                            >
                              <IconComponent className="w-6 h-6 mb-2 text-gray-700" />
                              <div className="text-xs font-medium">{component.name}</div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Toggle Sidebar Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute left-80 top-24 z-20 bg-white border border-gray-200 rounded-r-lg p-2 hover:bg-gray-50 transition-all shadow-lg"
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

        {/* Right Sidebar - Properties Panel */}
        <aside className="w-80 bg-white border-l border-gray-200 p-6 overflow-auto">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm font-bold tracking-wider text-gray-700">
              <Settings className="w-4 h-4" />
              PROPERTIES
            </div>

            {selectedComponent ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">Component Type</label>
                  <input 
                    type="text" 
                    value={selectedComponent.name} 
                    disabled 
                    className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">Width</label>
                  <input 
                    type="text" 
                    placeholder="auto" 
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">Height</label>
                  <input 
                    type="text" 
                    placeholder="auto" 
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">Alignment</label>
                  <div className="flex gap-2">
                    <button className="flex-1 p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <AlignLeft className="w-4 h-4 mx-auto" />
                    </button>
                    <button className="flex-1 p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <AlignCenter className="w-4 h-4 mx-auto" />
                    </button>
                    <button className="flex-1 p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <AlignRight className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-400 text-center py-12">
                Select a component to edit its properties
              </div>
            )}

            <div className="border-t border-gray-200 pt-6">
              <div className="text-xs text-gray-500 mb-3">QUICK ACTIONS</div>
              <div className="space-y-2">
                <button className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 text-sm">
                  <Copy className="w-4 h-4" />
                  Duplicate
                </button>
                <button className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 text-sm">
                  <Move className="w-4 h-4" />
                  Reorder
                </button>
                <button className="w-full p-3 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-all flex items-center gap-2 text-sm">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Bottom Status Bar */}
      <div className="bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-6">
          <span>{canvasComponents.length} components</span>
          <span>Last saved: Just now</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Zoom: 100%</span>
          <button className="hover:text-black transition-colors">Keyboard Shortcuts</button>
        </div>
      </div>
    </div>
  );
}