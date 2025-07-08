'use client';

import React from 'react';
import { StepComponentProps } from './AgentBuilder';
import { VoiceOption } from '../../types/agentBuilder';

const VOICE_OPTIONS: { value: VoiceOption; label: string; description: string }[] = [
  { value: 'sage', label: 'Sage', description: 'Calm and wise tone' },
  { value: 'fable', label: 'Fable', description: 'Storytelling and engaging' },
  { value: 'alloy', label: 'Alloy', description: 'Professional and clear' },
  { value: 'nova', label: 'Nova', description: 'Bright and energetic' },
];

export function BasicInfoStep({
  formData,
  updateFormData,
  errors,
  onNext,
  isFirstStep,
  isLastStep
}: StepComponentProps) {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({
      basicInfo: {
        ...formData.basicInfo,
        name: e.target.value,
      },
    });
  };

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFormData({
      basicInfo: {
        ...formData.basicInfo,
        voice: e.target.value as VoiceOption,
      },
    });
  };

  const handleHandoffDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateFormData({
      basicInfo: {
        ...formData.basicInfo,
        handoffDescription: e.target.value,
      },
    });
  };

  const getFieldError = (fieldName: string) => {
    return errors.find(error => error.field === fieldName)?.message;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Basic Information</h2>
        <p className="text-gray-600 mb-6">
          Start by defining the basic properties of your agent. The name should be unique and descriptive,
          and the handoff description helps other agents know when to transfer conversations to this agent.
        </p>
      </div>

      {/* Agent Name */}
      <div>
        <label htmlFor="agent-name" className="block text-sm font-medium text-gray-700 mb-2">
          Agent Name *
        </label>
        <input
          id="agent-name"
          type="text"
          value={formData.basicInfo.name}
          onChange={handleNameChange}
          placeholder="e.g., customerSupport, salesAgent, authenticationAgent"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            getFieldError('name') ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {getFieldError('name') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('name')}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Choose a unique, descriptive name for your agent. Use camelCase or kebab-case.
        </p>
      </div>

      {/* Voice Selection */}
      <div>
        <label htmlFor="agent-voice" className="block text-sm font-medium text-gray-700 mb-2">
          Voice *
        </label>
        <select
          id="agent-voice"
          value={formData.basicInfo.voice}
          onChange={handleVoiceChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {VOICE_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label} - {option.description}
            </option>
          ))}
        </select>
        <p className="mt-1 text-sm text-gray-500">
          Select the voice personality that best fits your agents role and intended interaction style.
        </p>
      </div>

      {/* Handoff Description */}
      <div>
        <label htmlFor="handoff-description" className="block text-sm font-medium text-gray-700 mb-2">
          Handoff Description *
        </label>
        <textarea
          id="handoff-description"
          value={formData.basicInfo.handoffDescription}
          onChange={handleHandoffDescriptionChange}
          rows={3}
          placeholder="e.g., Handles customer authentication and routes users to appropriate services based on their needs"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            getFieldError('handoffDescription') ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {getFieldError('handoffDescription') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('handoffDescription')}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Describe when and why other agents should transfer conversations to this agent. 
          This helps with proper routing in multi-agent scenarios.
        </p>
      </div>

      {/* Example Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Example Configuration</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p><strong>Name:</strong> customerServiceAuth</p>
          <p><strong>Voice:</strong> Sage (Calm and wise tone)</p>
          <p><strong>Handoff Description:</strong> Initial authentication agent that verifies customer identity and routes them to specialized service agents based on their needs.</p>
        </div>
      </div>
    </div>
  );
} 