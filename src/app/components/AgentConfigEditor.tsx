'use client';

import { useState, useEffect } from 'react';
import { agentConfigManager, AgentConfigSet, AgentConfigData, SavedAgentConfig } from '../lib/agentConfigManager';

interface AgentConfigEditorProps {
  onConfigSaved?: (config: SavedAgentConfig) => void;
  onCancel?: () => void;
  existingConfig?: SavedAgentConfig;
}

const VOICE_OPTIONS = [
  { value: 'alloy', label: 'Alloy - Balanced and clear' },
  { value: 'echo', label: 'Echo - Expressive and dynamic' },
  { value: 'fable', label: 'Fable - Warm and engaging' },
  { value: 'onyx', label: 'Onyx - Deep and authoritative' },
  { value: 'nova', label: 'Nova - Bright and energetic' },
  { value: 'shimmer', label: 'Shimmer - Soft and gentle' },
  { value: 'sage', label: 'Sage - Wise and measured' }
];

type Step = 'setup' | 'agents' | 'review';

export default function AgentConfigEditor({ onConfigSaved, onCancel, existingConfig }: AgentConfigEditorProps) {
  const [currentStep, setCurrentStep] = useState<Step>('setup');
  const [configSet, setConfigSet] = useState<AgentConfigSet>({
    name: '',
    description: '',
    agents: []
  });
  
  const [selectedAgentIndex, setSelectedAgentIndex] = useState<number | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [isFirstTime, setIsFirstTime] = useState(true);

  useEffect(() => {
    if (existingConfig) {
      setConfigSet(existingConfig.config);
      setCurrentStep('agents');
      setIsFirstTime(false);
    }
  }, [existingConfig]);

  const validateStep = (step: Step): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 'setup':
        if (!configSet.name.trim()) {
          newErrors.name = 'Configuration name is required';
        }
        if (!configSet.description.trim()) {
          newErrors.description = 'Description is required';
        }
        break;
      case 'agents':
        if (configSet.agents.length === 0) {
          newErrors.agents = 'At least one agent is required';
        }
        configSet.agents.forEach((agent: AgentConfigData, index: number) => {
          if (!agent.name.trim()) {
            newErrors[`agent-${index}-name`] = 'Agent name is required';
          }
          if (!agent.instructions.trim()) {
            newErrors[`agent-${index}-instructions`] = 'Agent instructions are required';
          }
        });
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 'setup') {
        setCurrentStep('agents');
        if (configSet.agents.length === 0) {
          handleAddAgent();
        }
      } else if (currentStep === 'agents') {
        setCurrentStep('review');
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep === 'agents') {
      setCurrentStep('setup');
    } else if (currentStep === 'review') {
      setCurrentStep('agents');
    }
  };

  const handleSave = () => {
    if (!validateStep('agents')) return;
    
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
      setErrors({ save: 'Failed to save configuration. Please try again.' });
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
    if (window.confirm('Are you sure you want to remove this agent?')) {
      setConfigSet((prev: AgentConfigSet) => ({
        ...prev,
        agents: prev.agents.filter((_: AgentConfigData, i: number) => i !== index)
      }));
      
      if (selectedAgentIndex === index) {
        setSelectedAgentIndex(null);
      } else if (selectedAgentIndex !== null && selectedAgentIndex > index) {
        setSelectedAgentIndex(selectedAgentIndex - 1);
      }
    }
  };

  const handleAgentChange = (index: number, field: keyof AgentConfigData, value: any) => {
    setConfigSet(prev => ({
      ...prev,
      agents: prev.agents.map((agent, i) => 
        i === index ? { ...agent, [field]: value } : agent
      )
    }));
    
    // Clear errors for this field
    const errorKey = `agent-${index}-${field}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
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
        setCurrentStep('review');
        setErrors({});
      } else {
        setErrors({ import: 'Failed to import configuration. Please check the file format.' });
      }
    } catch (error) {
      console.error('Import error:', error);
      setErrors({ import: 'Error importing configuration file. Please ensure it\'s a valid JSON file.' });
    } finally {
      setIsImporting(false);
      event.target.value = '';
    }
  };

  const selectedAgent = selectedAgentIndex !== null ? configSet.agents[selectedAgentIndex] : null;
  const availableAgents = configSet.agents.map(agent => agent.name);

  const steps = [
    { key: 'setup', label: 'Configuration Setup', description: 'Basic information about your configuration' },
    { key: 'agents', label: 'Agent Configuration', description: 'Create and configure your agents' },
    { key: 'review', label: 'Review & Save', description: 'Review and save your configuration' }
  ];

  const currentStepIndex = steps.findIndex(step => step.key === currentStep);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {existingConfig ? 'Edit Agent Configuration' : 'Create Agent Configuration'}
              </h1>
              <p className="text-gray-600 mt-2">
                {existingConfig 
                  ? 'Update your agent configuration with new settings' 
                  : 'Build a custom agent configuration for your specific needs'
                }
              </p>
            </div>
            <div className="flex gap-3">
              <label className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 cursor-pointer transition-colors">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  {isImporting ? 'Importing...' : 'Import JSON'}
                </span>
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
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                      index < currentStepIndex
                        ? 'bg-green-500 text-white'
                        : index === currentStepIndex
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index < currentStepIndex ? '✓' : index + 1}
                  </div>
                  <div className="ml-3">
                    <div className={`font-medium ${index <= currentStepIndex ? 'text-gray-800' : 'text-gray-500'}`}>
                      {step.label}
                    </div>
                    <div className="text-sm text-gray-500">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Error Display */}
          {errors.import && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-700">{errors.import}</span>
              </div>
            </div>
          )}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {currentStep === 'setup' && (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Configuration Setup</h2>
                <p className="text-gray-600">Let's start by giving your configuration a name and description</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Configuration Name *
                  </label>
                  <input
                    type="text"
                    value={configSet.name}
                    onChange={(e) => {
                      setConfigSet(prev => ({ ...prev, name: e.target.value }));
                      if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                    }}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Customer Service Bot, Technical Support, Sales Assistant"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Choose a descriptive name that explains what this configuration does
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={configSet.description}
                    onChange={(e) => {
                      setConfigSet(prev => ({ ...prev, description: e.target.value }));
                      if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
                    }}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.description ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    rows={4}
                    placeholder="Describe what this configuration is designed to do, what scenarios it handles, and any special features..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Provide a detailed description to help you and others understand the purpose of this configuration
                  </p>
                </div>

                {isFirstTime && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 mb-2">💡 Quick Tips</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Use specific names like "E-commerce Support" instead of "Bot Config"</li>
                      <li>• Include the main use case and key features in the description</li>
                      <li>• Think about who will use this configuration and what they need to know</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 'agents' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Agent List */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Your Agents</h3>
                    <button
                      onClick={handleAddAgent}
                      className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                    >
                      + Add Agent
                    </button>
                  </div>
                  
                  {configSet.agents.length === 0 ? (
                    <div className="text-center py-8">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      <p className="text-gray-500 mb-4">No agents created yet</p>
                      <button
                        onClick={handleAddAgent}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Create Your First Agent
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {configSet.agents.map((agent, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedAgentIndex === index
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                          onClick={() => setSelectedAgentIndex(index)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800">{agent.name}</h4>
                              <p className="text-sm text-gray-500 mt-1">
                                Voice: {VOICE_OPTIONS.find(v => v.value === agent.voice)?.label.split(' - ')[0] || agent.voice}
                              </p>
                              {agent.handoffs.length > 0 && (
                                <p className="text-xs text-blue-600 mt-1">
                                  Handoffs: {agent.handoffs.join(', ')}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveAgent(index);
                              }}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {errors.agents && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{errors.agents}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Agent Editor */}
              <div className="lg:col-span-2">
                {selectedAgent ? (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-6">
                      Configure: {selectedAgent.name}
                    </h3>
                    
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Agent Name *
                          </label>
                          <input
                            type="text"
                            value={selectedAgent.name}
                            onChange={(e) => handleAgentChange(selectedAgentIndex!, 'name', e.target.value)}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors[`agent-${selectedAgentIndex}-name`] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                            placeholder="e.g., Customer Service Agent"
                          />
                          {errors[`agent-${selectedAgentIndex}-name`] && (
                            <p className="mt-1 text-sm text-red-600">{errors[`agent-${selectedAgentIndex}-name`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Voice Style
                          </label>
                          <select
                            value={selectedAgent.voice}
                            onChange={(e) => handleAgentChange(selectedAgentIndex!, 'voice', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {VOICE_OPTIONS.map(voice => (
                              <option key={voice.value} value={voice.value}>
                                {voice.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Agent Instructions *
                        </label>
                        <textarea
                          value={selectedAgent.instructions}
                          onChange={(e) => handleAgentChange(selectedAgentIndex!, 'instructions', e.target.value)}
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors[`agent-${selectedAgentIndex}-instructions`] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          rows={6}
                          placeholder="Write detailed instructions for this agent. Include:
• What is the agent's role and purpose?
• How should it interact with users?
• What topics can it handle?
• When should it transfer to other agents?
• What tone and style should it use?"
                        />
                        {errors[`agent-${selectedAgentIndex}-instructions`] && (
                          <p className="mt-1 text-sm text-red-600">{errors[`agent-${selectedAgentIndex}-instructions`]}</p>
                        )}
                        <p className="mt-1 text-sm text-gray-500">
                          Be specific about the agent's capabilities and limitations
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Handoff Description
                        </label>
                        <textarea
                          value={selectedAgent.handoffDescription}
                          onChange={(e) => handleAgentChange(selectedAgentIndex!, 'handoffDescription', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={3}
                          placeholder="Describe when and why other agents should transfer users to this agent..."
                        />
                        <p className="mt-1 text-sm text-gray-500">
                          This helps other agents know when to hand off to this agent
                        </p>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <label className="block text-sm font-medium text-gray-700">
                            Agent Handoffs
                          </label>
                          <button
                            onClick={() => handleAddHandoff(selectedAgentIndex!)}
                            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                          >
                            + Add Handoff
                          </button>
                        </div>
                        
                        {selectedAgent.handoffs.length === 0 ? (
                          <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                            <p className="text-gray-500 mb-2">No handoffs configured</p>
                            <p className="text-sm text-gray-400">Add handoffs to allow this agent to transfer users to other agents</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {selectedAgent.handoffs.map((handoff, handoffIndex) => (
                              <div key={handoffIndex} className="flex gap-3 items-center p-3 bg-white rounded-lg border">
                                <select
                                  value={handoff}
                                  onChange={(e) => handleHandoffChange(selectedAgentIndex!, handoffIndex, e.target.value)}
                                  className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                  <option value="">Select agent to handoff to...</option>
                                  {availableAgents.filter(name => name !== selectedAgent.name).map(agentName => (
                                    <option key={agentName} value={agentName}>{agentName}</option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => handleRemoveHandoff(selectedAgentIndex!, handoffIndex)}
                                  className="px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <p className="mt-2 text-sm text-gray-500">
                          Handoffs allow this agent to transfer users to other agents when needed
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-12 text-center">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Select an Agent to Configure</h3>
                    <p className="text-gray-500 mb-4">
                      Choose an agent from the list on the left to configure its settings, or create a new agent to get started.
                    </p>
                    <button
                      onClick={handleAddAgent}
                      className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Create New Agent
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 'review' && (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Review Your Configuration</h2>
                <p className="text-gray-600">Review all settings before saving your configuration</p>
              </div>

              <div className="space-y-6">
                {/* Configuration Summary */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4">Configuration Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{configSet.agents.length}</div>
                      <div className="text-sm text-blue-700">Agents</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {configSet.agents.reduce((sum, agent) => sum + agent.handoffs.length, 0)}
                      </div>
                      <div className="text-sm text-blue-700">Total Handoffs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {new Set(configSet.agents.map(agent => agent.voice)).size}
                      </div>
                      <div className="text-sm text-blue-700">Voice Types</div>
                    </div>
                  </div>
                </div>

                {/* Configuration Details */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Configuration Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <p className="text-gray-900">{configSet.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <p className="text-gray-900">{configSet.description}</p>
                    </div>
                  </div>
                </div>

                {/* Agent Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Agent Details</h3>
                  {configSet.agents.map((agent, index) => (
                    <div key={index} className="bg-white border rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-medium">{agent.name}</h4>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                          {VOICE_OPTIONS.find(v => v.value === agent.voice)?.label.split(' - ')[0] || agent.voice}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                          <p className="text-sm text-gray-600 max-h-24 overflow-y-auto">
                            {agent.instructions || 'No instructions provided'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Handoffs</label>
                          {agent.handoffs.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {agent.handoffs.map((handoff, i) => (
                                <span key={i} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                  {handoff}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No handoffs configured</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {errors.save && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700">{errors.save}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 'setup'}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                currentStep === 'setup'
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-500 text-white hover:bg-gray-600'
              }`}
            >
              Previous
            </button>

            <div className="flex items-center space-x-2">
              {steps.map((step, index) => (
                <div
                  key={step.key}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStepIndex ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {currentStep === 'review' ? (
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition-colors"
              >
                Save Configuration
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}