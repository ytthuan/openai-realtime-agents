'use client';

import { useState, useEffect } from 'react';
import { agentConfigManager, AgentConfigSet, AgentConfigData, SavedAgentConfig } from '../lib/agentConfigManager';

interface AgentConfigEditorProps {
  onConfigSaved?: (config: SavedAgentConfig) => void;
  onCancel?: () => void;
  existingConfig?: SavedAgentConfig;
}

const VOICE_OPTIONS = [
  'alloy',
  'echo', 
  'fable',
  'onyx',
  'nova',
  'shimmer',
  'sage'
];

export default function AgentConfigEditor({ onConfigSaved, onCancel, existingConfig }: AgentConfigEditorProps) {
  const [configSet, setConfigSet] = useState<AgentConfigSet>({
    name: '',
    description: '',
    agents: []
  });
  
  const [selectedAgentIndex, setSelectedAgentIndex] = useState<number | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (existingConfig) {
      setConfigSet(existingConfig.config);
    }
  }, [existingConfig]);

  const handleSave = () => {
    if (!configSet.name.trim()) {
      alert('Please enter a configuration name');
      return;
    }
    
    try {
      let savedConfig;
      if (existingConfig) {
        savedConfig = agentConfigManager.updateConfig(existingConfig.id, configSet);
      } else {
        savedConfig = agentConfigManager.saveConfig(configSet);
      }
      
      if (savedConfig) {
        onConfigSaved?.(savedConfig);
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert('Error saving configuration');
    }
  };

  const handleAddAgent = () => {
    const newAgent: AgentConfigData = {
      name: `Agent ${configSet.agents.length + 1}`,
      voice: 'sage',
      instructions: '',
      handoffDescription: '',
      handoffs: [],
      tools: []
    };
    
    setConfigSet(prev => ({
      ...prev,
      agents: [...prev.agents, newAgent]
    }));
    
    setSelectedAgentIndex(configSet.agents.length);
  };

  const handleRemoveAgent = (index: number) => {
    setConfigSet(prev => ({
      ...prev,
      agents: prev.agents.filter((_, i) => i !== index)
    }));
    
    if (selectedAgentIndex === index) {
      setSelectedAgentIndex(null);
    } else if (selectedAgentIndex !== null && selectedAgentIndex > index) {
      setSelectedAgentIndex(selectedAgentIndex - 1);
    }
  };

  const handleAgentChange = (index: number, field: keyof AgentConfigData, value: any) => {
    setConfigSet(prev => ({
      ...prev,
      agents: prev.agents.map((agent, i) => 
        i === index ? { ...agent, [field]: value } : agent
      )
    }));
  };

  const handleHandoffChange = (agentIndex: number, handoffIndex: number, value: string) => {
    setConfigSet(prev => ({
      ...prev,
      agents: prev.agents.map((agent, i) => 
        i === agentIndex ? {
          ...agent,
          handoffs: agent.handoffs.map((handoff, j) => 
            j === handoffIndex ? value : handoff
          )
        } : agent
      )
    }));
  };

  const handleAddHandoff = (agentIndex: number) => {
    setConfigSet(prev => ({
      ...prev,
      agents: prev.agents.map((agent, i) => 
        i === agentIndex ? {
          ...agent,
          handoffs: [...agent.handoffs, '']
        } : agent
      )
    }));
  };

  const handleRemoveHandoff = (agentIndex: number, handoffIndex: number) => {
    setConfigSet(prev => ({
      ...prev,
      agents: prev.agents.map((agent, i) => 
        i === agentIndex ? {
          ...agent,
          handoffs: agent.handoffs.filter((_, j) => j !== handoffIndex)
        } : agent
      )
    }));
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const imported = await agentConfigManager.importFromFile(file);
      if (imported) {
        setConfigSet(imported.config);
        alert('Configuration imported successfully!');
      } else {
        alert('Failed to import configuration. Please check the file format.');
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('Error importing configuration file');
    } finally {
      setIsImporting(false);
      event.target.value = '';
    }
  };

  const selectedAgent = selectedAgentIndex !== null ? configSet.agents[selectedAgentIndex] : null;
  const availableAgents = configSet.agents.map(agent => agent.name);

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {existingConfig ? 'Edit Agent Configuration' : 'Create Agent Configuration'}
        </h2>
        <div className="flex gap-2">
          <label className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer">
            {isImporting ? 'Importing...' : 'Import JSON'}
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
              disabled={isImporting}
            />
          </label>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save Configuration
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Settings */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold mb-4">Configuration Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Configuration Name
                </label>
                <input
                  type="text"
                  value={configSet.name}
                  onChange={(e) => setConfigSet(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter configuration name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={configSet.description}
                  onChange={(e) => setConfigSet(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter description"
                />
              </div>
            </div>
          </div>

          {/* Agents List */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Agents</h3>
              <button
                onClick={handleAddAgent}
                className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
              >
                Add Agent
              </button>
            </div>
            <div className="space-y-2">
              {configSet.agents.map((agent, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-md border cursor-pointer transition-colors ${
                    selectedAgentIndex === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedAgentIndex(index)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{agent.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveAgent(index);
                      }}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Agent Editor */}
        <div className="lg:col-span-2">
          {selectedAgent ? (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">
                Edit Agent: {selectedAgent.name}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent Name
                  </label>
                  <input
                    type="text"
                    value={selectedAgent.name}
                    onChange={(e) => handleAgentChange(selectedAgentIndex!, 'name', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Voice
                  </label>
                  <select
                    value={selectedAgent.voice}
                    onChange={(e) => handleAgentChange(selectedAgentIndex!, 'voice', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {VOICE_OPTIONS.map(voice => (
                      <option key={voice} value={voice}>{voice}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instructions
                  </label>
                  <textarea
                    value={selectedAgent.instructions}
                    onChange={(e) => handleAgentChange(selectedAgentIndex!, 'instructions', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={8}
                    placeholder="Enter agent instructions"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Handoff Description
                  </label>
                  <textarea
                    value={selectedAgent.handoffDescription}
                    onChange={(e) => handleAgentChange(selectedAgentIndex!, 'handoffDescription', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Enter handoff description"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Handoffs
                    </label>
                    <button
                      onClick={() => handleAddHandoff(selectedAgentIndex!)}
                      className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                    >
                      Add Handoff
                    </button>
                  </div>
                  <div className="space-y-2">
                    {selectedAgent.handoffs.map((handoff, handoffIndex) => (
                      <div key={handoffIndex} className="flex gap-2">
                        <select
                          value={handoff}
                          onChange={(e) => handleHandoffChange(selectedAgentIndex!, handoffIndex, e.target.value)}
                          className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select agent</option>
                          {availableAgents.map(agentName => (
                            <option key={agentName} value={agentName}>{agentName}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleRemoveHandoff(selectedAgentIndex!, handoffIndex)}
                          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <p className="text-gray-500">Select an agent to edit, or add a new agent to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}