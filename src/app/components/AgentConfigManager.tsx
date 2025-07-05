'use client';

import { useState, useEffect } from 'react';
import { agentConfigManager, SavedAgentConfig } from '../lib/agentConfigManager';
import AgentConfigEditor from './AgentConfigEditor';

export default function AgentConfigManager() {
  const [savedConfigs, setSavedConfigs] = useState<SavedAgentConfig[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingConfig, setEditingConfig] = useState<SavedAgentConfig | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = () => {
    const configs = agentConfigManager.loadConfigs();
    setSavedConfigs(configs);
  };

  const handleEdit = (config: SavedAgentConfig) => {
    setEditingConfig(config);
    setIsEditing(true);
  };

  const handleCreate = () => {
    setEditingConfig(undefined);
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this configuration?')) {
      agentConfigManager.deleteConfig(id);
      loadConfigs();
    }
  };

  const handleExport = (config: SavedAgentConfig) => {
    agentConfigManager.exportToFile(config);
  };

  const handleConfigSaved = (config: SavedAgentConfig) => {
    setIsEditing(false);
    setEditingConfig(undefined);
    loadConfigs();
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingConfig(undefined);
  };

  const filteredConfigs = savedConfigs.filter(config => 
    config.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isEditing) {
    return (
      <AgentConfigEditor
        existingConfig={editingConfig}
        onConfigSaved={handleConfigSaved}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Agent Configuration Manager</h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Create New Configuration
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search configurations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {filteredConfigs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">
            {savedConfigs.length === 0 ? 'No configurations found' : 'No configurations match your search'}
          </div>
          {savedConfigs.length === 0 && (
            <button
              onClick={handleCreate}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Create Your First Configuration
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConfigs.map((config) => (
            <div key={config.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{config.name}</h3>
                  {config.description && (
                    <p className="text-gray-600 text-sm mb-3">{config.description}</p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <span className="font-medium">Agents:</span>
                  <span className="ml-2">{config.config.agents.length}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <span className="font-medium">Created:</span>
                  <span className="ml-2">{new Date(config.createdAt).toLocaleDateString()}</span>
                </div>
                {config.updatedAt !== config.createdAt && (
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium">Updated:</span>
                    <span className="ml-2">{new Date(config.updatedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Agent Names:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {config.config.agents.map((agent, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                      >
                        {agent.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => handleEdit(config)}
                  className="flex-1 px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleExport(config)}
                  className="flex-1 px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                >
                  Export
                </button>
                <button
                  onClick={() => handleDelete(config.id)}
                  className="flex-1 px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {savedConfigs.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">How to use configurations:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Create and edit agent configurations with custom instructions and handoffs</li>
            <li>• Export configurations as JSON files for backup or sharing</li>
            <li>• Import configurations from JSON files using the editor</li>
            <li>• Configurations are automatically saved to your browser's local storage</li>
          </ul>
        </div>
      )}
    </div>
  );
}