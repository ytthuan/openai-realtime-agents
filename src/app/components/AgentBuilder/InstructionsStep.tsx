'use client';

import React, { useState } from 'react';
import { StepComponentProps } from './AgentBuilder';
import { ConversationState, ContextInfo } from '../../types/agentBuilder';

export function InstructionsStep({
  formData,
  updateFormData,
  errors,
}: StepComponentProps) {
  const [activeTab, setActiveTab] = useState<'task' | 'context' | 'guidelines' | 'states' | 'custom'>('task');

  const handleTaskChange = (value: string) => {
    updateFormData({ task: value });
  };

  const handleContextChange = (field: keyof ContextInfo, value: any) => {
    updateFormData({
      context: {
        ...formData.context,
        [field]: value,
      },
    });
  };

  const handleGuidelinesChange = (guidelines: string[]) => {
    updateFormData({ guidelines });
  };

  const addGuideline = () => {
    updateFormData({
      guidelines: [...formData.guidelines, '']
    });
  };

  const updateGuideline = (index: number, value: string) => {
    const newGuidelines = [...formData.guidelines];
    newGuidelines[index] = value;
    updateFormData({ guidelines: newGuidelines });
  };

  const removeGuideline = (index: number) => {
    const newGuidelines = formData.guidelines.filter((_, i) => i !== index);
    updateFormData({ guidelines: newGuidelines });
  };

  const addConversationState = () => {
    const newState: ConversationState = {
      id: `state_${Date.now()}`,
      description: '',
      instructions: [''],
      examples: [''],
      transitions: []
    };
    updateFormData({
      conversationStates: [...formData.conversationStates, newState]
    });
  };

  const updateConversationState = (index: number, updates: Partial<ConversationState>) => {
    const newStates = [...formData.conversationStates];
    newStates[index] = { ...newStates[index], ...updates };
    updateFormData({ conversationStates: newStates });
  };

  const removeConversationState = (index: number) => {
    const newStates = formData.conversationStates.filter((_, i) => i !== index);
    updateFormData({ conversationStates: newStates });
  };

  const getFieldError = (fieldName: string) => {
    return errors.find(error => error.field === fieldName)?.message;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Instructions & Behavior</h2>
        <p className="text-gray-600 mb-6">
          Define your agent&apos;s primary task, behavioral guidelines, context information, and conversation flow states.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'task', label: 'Primary Task' },
            { key: 'context', label: 'Context Info' },
            { key: 'guidelines', label: 'Guidelines' },
            { key: 'states', label: 'Conversation States' },
            { key: 'custom', label: 'Custom Instructions' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Task Tab */}
      {activeTab === 'task' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Task *
            </label>
            <textarea
              value={formData.task}
              onChange={(e) => handleTaskChange(e.target.value)}
              rows={6}
              placeholder="Describe the main purpose and responsibilities of this agent. What should it help users accomplish?"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                getFieldError('task') ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {getFieldError('task') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError('task')}</p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Task Examples</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• <strong>Authentication:</strong> Verify customer identity and route them to appropriate services</p>
              <p>• <strong>Sales:</strong> Help customers find products, answer questions, and complete purchases</p>
              <p>• <strong>Support:</strong> Resolve technical issues and provide product assistance</p>
              <p>• <strong>Returns:</strong> Process return requests and check eligibility according to policies</p>
            </div>
          </div>
        </div>
      )}

      {/* Context Tab */}
      {activeTab === 'context' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name
              </label>
              <input
                type="text"
                value={formData.context.businessName || ''}
                onChange={(e) => handleContextChange('businessName', e.target.value)}
                placeholder="e.g., Snowy Peak Boards"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Hours
              </label>
              <input
                type="text"
                value={formData.context.hours || ''}
                onChange={(e) => handleContextChange('hours', e.target.value)}
                placeholder="e.g., Monday-Friday 9AM-6PM"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Locations (one per line)
            </label>
            <textarea
              value={formData.context.locations?.join('\n') || ''}
              onChange={(e) => handleContextChange('locations', e.target.value.split('\n').filter(l => l.trim()))}
              rows={3}
              placeholder="123 Main St, City, State&#10;456 Oak Ave, City, State"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Products & Services (one per line)
            </label>
            <textarea
              value={formData.context.productsServices?.join('\n') || ''}
              onChange={(e) => handleContextChange('productsServices', e.target.value.split('\n').filter(p => p.trim()))}
              rows={3}
              placeholder="Snowboards&#10;Boots and Bindings&#10;Accessories"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pronunciations (JSON format)
            </label>
            <textarea
              value={JSON.stringify(formData.context.pronunciations || {}, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  handleContextChange('pronunciations', parsed);
                } catch {
                  // Invalid JSON, don't update
                }
              }}
              rows={4}
              placeholder='{"Business Name": "BIZ-nis naym", "Schedule": "SHED-yool"}'
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Guidelines Tab */}
      {activeTab === 'guidelines' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Behavioral Guidelines</h3>
            <button
              onClick={addGuideline}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Guideline
            </button>
          </div>

          <div className="space-y-3">
            {formData.guidelines.map((guideline, index) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 mt-2">
                  {index + 1}
                </span>
                <textarea
                  value={guideline}
                  onChange={(e) => updateGuideline(index, e.target.value)}
                  rows={2}
                  placeholder="Enter a behavioral guideline..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => removeGuideline(index)}
                  className="flex-shrink-0 text-red-600 hover:text-red-800 text-sm mt-2"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {formData.guidelines.length === 0 && (
            <div className="text-center py-6 text-gray-500 border border-gray-200 rounded-lg">
              No guidelines defined. Click &quot;Add Guideline&quot; to get started.
            </div>
          )}

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-900 mb-2">Example Guidelines</h3>
            <div className="text-sm text-green-800 space-y-1">
              <p>• Always verify user identity before accessing account information</p>
              <p>• Use warm, conversational language while maintaining professionalism</p>
              <p>• Provide clear explanations and confirm understanding</p>
              <p>• Escalate to human agents when requests exceed capabilities</p>
            </div>
          </div>
        </div>
      )}

      {/* Conversation States Tab */}
      {activeTab === 'states' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Conversation States</h3>
              <p className="text-sm text-gray-600">Define structured conversation flows with specific states and transitions</p>
            </div>
            <button
              onClick={addConversationState}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add State
            </button>
          </div>

          <div className="space-y-4">
            {formData.conversationStates.map((state, index) => (
              <div key={state.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">State {index + 1}</h4>
                  <button
                    onClick={() => removeConversationState(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State ID</label>
                    <input
                      type="text"
                      value={state.id}
                      onChange={(e) => updateConversationState(index, { id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      value={state.description}
                      onChange={(e) => updateConversationState(index, { description: e.target.value })}
                      placeholder="Brief description of this state"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                  <textarea
                    value={state.instructions.join('\n')}
                    onChange={(e) => updateConversationState(index, {
                      instructions: e.target.value.split('\n').filter(i => i.trim())
                    })}
                    rows={3}
                    placeholder="Instructions for this state (one per line)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Examples</label>
                  <textarea
                    value={state.examples.join('\n')}
                    onChange={(e) => updateConversationState(index, {
                      examples: e.target.value.split('\n').filter(e => e.trim())
                    })}
                    rows={2}
                    placeholder="Example phrases or responses (one per line)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            ))}
          </div>

          {formData.conversationStates.length === 0 && (
            <div className="text-center py-6 text-gray-500 border border-gray-200 rounded-lg">
              No conversation states defined. This is optional for simpler agents.
            </div>
          )}
        </div>
      )}

      {/* Custom Instructions Tab */}
      {activeTab === 'custom' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Instructions
            </label>
            <textarea
              value={formData.customInstructions}
              onChange={(e) => updateFormData({ customInstructions: e.target.value })}
              rows={12}
              placeholder="Add any additional custom instructions that don't fit in the other categories..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
            <p className="mt-1 text-sm text-gray-500">
              These instructions will be appended to the generated prompt. Use for specific requirements not covered by other sections.
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 