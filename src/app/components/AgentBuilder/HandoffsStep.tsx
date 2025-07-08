'use client';

import React from 'react';
import { StepComponentProps } from './AgentBuilder';

export function HandoffsStep({
  formData,
  updateFormData,
  existingAgents = [],
}: StepComponentProps) {
  const availableAgents = existingAgents.filter(agent => agent.name !== formData.basicInfo.name);

  const toggleHandoff = (agentName: string) => {
    const currentHandoffs = formData.handoffs || [];
    const newHandoffs = currentHandoffs.includes(agentName)
      ? currentHandoffs.filter(h => h !== agentName)
      : [...currentHandoffs, agentName];
    
    updateFormData({ handoffs: newHandoffs });
  };

  const addCustomHandoff = () => {
    const agentName = prompt('Enter the agent name to handoff to:');
    if (agentName && agentName.trim()) {
      const trimmedName = agentName.trim();
      if (!formData.handoffs.includes(trimmedName)) {
        updateFormData({
          handoffs: [...formData.handoffs, trimmedName]
        });
      }
    }
  };

  const removeHandoff = (agentName: string) => {
    updateFormData({
      handoffs: formData.handoffs.filter(h => h !== agentName)
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Agent Handoffs</h2>
        <p className="text-gray-600 mb-6">
          Configure which agents this agent can transfer conversations to. Handoffs enable
          specialized agents to handle different types of user requests effectively.
        </p>
      </div>

      {/* Current Handoffs */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Current Handoffs</h3>
        
        {formData.handoffs.length > 0 ? (
          <div className="space-y-2">
            {formData.handoffs.map((agentName) => {
              const existingAgent = existingAgents.find(a => a.name === agentName);
              return (
                <div
                  key={agentName}
                  className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-blue-900">{agentName}</div>
                    {existingAgent ? (
                      <div className="text-sm text-blue-700">
                        {existingAgent.handoffDescription}
                      </div>
                    ) : (
                      <div className="text-sm text-blue-600 italic">
                        Custom agent (not in current project)
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeHandoff(agentName)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500 border border-gray-200 rounded-lg">
            No handoffs configured. This agent will not be able to transfer conversations.
          </div>
        )}
      </div>

      {/* Available Agents */}
      {availableAgents.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Available Agents</h3>
          <div className="space-y-2">
            {availableAgents.map((agent) => (
              <div
                key={agent.name}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-gray-300"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{agent.name}</div>
                  <div className="text-sm text-gray-600">
                    {agent.handoffDescription}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Voice: {agent.voice} • Tools: {agent.tools?.length || 0}
                  </div>
                </div>
                <button
                  onClick={() => toggleHandoff(agent.name)}
                  className={`px-4 py-2 text-sm rounded-md transition-colors ${
                    formData.handoffs.includes(agent.name)
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {formData.handoffs.includes(agent.name) ? 'Remove' : 'Add Handoff'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Handoff */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Custom Handoffs</h3>
        <div className="border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-3">
            Add handoffs to agents that aren&apos;t in your current project or will be created later.
          </p>
          <button
            onClick={addCustomHandoff}
            className="px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Add Custom Handoff
          </button>
        </div>
      </div>

      {/* Handoff Pattern Explanation */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-purple-900 mb-2">How Handoffs Work</h3>
        <div className="text-sm text-purple-800 space-y-2">
          <p>
            <strong>Bidirectional:</strong> When you add an agent as a handoff target, it can also transfer back to this agent.
          </p>
          <p>
            <strong>Automatic Routing:</strong> The AI will automatically determine when to transfer based on user requests and agent capabilities.
          </p>
          <p>
            <strong>Context Preservation:</strong> Conversation context is maintained across handoffs for seamless user experience.
          </p>
        </div>
      </div>

      {/* Example Handoff Scenarios */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Example Handoff Scenarios</h3>
        <div className="text-sm text-gray-700 space-y-1">
          <p>• <strong>Authentication → Sales:</strong> After user verification, transfer to sales for product inquiries</p>
          <p>• <strong>Sales → Support:</strong> Transfer technical issues from sales to specialized support</p>
          <p>• <strong>Any Agent → Human:</strong> Escalate complex issues to human representatives</p>
          <p>• <strong>Support → Returns:</strong> Transfer return requests to specialized returns processing</p>
        </div>
      </div>
    </div>
  );
} 