'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { AgentBuilder } from '../components/AgentBuilder/AgentBuilder';
import { AgentBuilderConfig } from '../types/agentBuilder';
import { AgentExporter } from '../lib/agentExporter';

export default function AgentBuilderPage() {
  const [savedAgents, setSavedAgents] = useState<AgentBuilderConfig[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSaveAgent = useCallback((config: AgentBuilderConfig) => {
    // Validate the configuration
    const validation = AgentExporter.validateConfig(config);
    if (!validation.isValid) {
      alert(`Please fix the following errors:\n${validation.errors.join('\n')}`);
      return;
    }

    // Add to saved agents
    const updatedAgents = [...savedAgents];
    const existingIndex = updatedAgents.findIndex(agent => agent.name === config.name);
    
    if (existingIndex >= 0) {
      updatedAgents[existingIndex] = config;
      setSuccessMessage(`Agent "${config.name}" updated successfully!`);
    } else {
      updatedAgents.push(config);
      setSuccessMessage(`Agent "${config.name}" created successfully!`);
    }

    setSavedAgents(updatedAgents);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);

    // Save to localStorage for persistence
    localStorage.setItem('savedAgents', JSON.stringify(updatedAgents));
  }, [savedAgents]);

  const handleExportAgent = useCallback((config: AgentBuilderConfig) => {
    // Validate the configuration
    const validation = AgentExporter.validateConfig(config);
    if (!validation.isValid) {
      alert(`Please fix the following errors before exporting:\n${validation.errors.join('\n')}`);
      return;
    }

    // Show export options
    const exportChoice = window.confirm(
      'Choose export format:\n\nOK - Export TypeScript file\nCancel - Export all formats (TS, JSON, Instructions)'
    );

    if (exportChoice) {
      AgentExporter.exportAsTypeScript(config);
      setSuccessMessage(`TypeScript file for "${config.name}" downloaded!`);
    } else {
      AgentExporter.exportAll(config);
      setSuccessMessage(`All files for "${config.name}" downloaded!`);
    }

    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  }, []);

  // Load saved agents from localStorage on component mount
  React.useEffect(() => {
    const saved = localStorage.getItem('savedAgents');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedAgents(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        console.error('Failed to load saved agents:', error);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                OpenAI Realtime Agent Builder
              </h1>
              <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                Beta
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {savedAgents.length} agent{savedAgents.length !== 1 ? 's' : ''} created
              </span>
                             <Link
                 href="/"
                 className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:border-blue-400 transition-colors"
               >
                 Back to Demo
               </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  {successMessage}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="py-8">
        <AgentBuilder
          onSave={handleSaveAgent}
          onExport={handleExportAgent}
          existingAgents={savedAgents}
        />
      </div>

      {/* Saved Agents Section */}
      {savedAgents.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 pb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Created Agents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedAgents.map((agent) => (
                <div key={agent.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{agent.name}</h3>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {agent.voice}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {agent.handoffDescription}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>{agent.tools?.length || 0} tools</span>
                    <span>{agent.handoffs?.length || 0} handoffs</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => AgentExporter.exportAsTypeScript(agent)}
                      className="flex-1 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Export TS
                    </button>
                    <button
                      onClick={() => AgentExporter.exportAsJSON(agent)}
                      className="flex-1 px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                    >
                      Export JSON
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Clear All Button */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all saved agents? This action cannot be undone.')) {
                    setSavedAgents([]);
                    localStorage.removeItem('savedAgents');
                    setSuccessMessage('All agents cleared successfully!');
                    setShowSuccessMessage(true);
                    setTimeout(() => setShowSuccessMessage(false), 3000);
                  }
                }}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded-md hover:border-red-400 transition-colors"
              >
                Clear All Agents
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Built with the OpenAI Realtime API and Agents SDK
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-700">Documentation</a>
              <a href="#" className="hover:text-gray-700">Examples</a>
              <a href="#" className="hover:text-gray-700">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 