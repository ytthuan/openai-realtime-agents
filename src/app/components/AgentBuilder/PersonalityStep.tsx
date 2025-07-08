'use client';

import React from 'react';
import { StepComponentProps } from './AgentBuilder';

export function PersonalityStep({
  formData,
  updateFormData,
  errors,
}: StepComponentProps) {
  const handlePersonalityChange = (field: string, value: string) => {
    updateFormData({
      personality: {
        ...formData.personality,
        [field]: value,
      },
    });
  };

  const getFieldError = (fieldName: string) => {
    return errors.find(error => error.field === fieldName)?.message;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Personality Configuration</h2>
        <p className="text-gray-600 mb-6">
          Define your agent&apos;s personality traits to ensure consistent and appropriate interactions.
          These settings will shape how your agent communicates and behaves with users.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Identity */}
        <div>
          <label htmlFor="identity" className="block text-sm font-medium text-gray-700 mb-2">
            Identity *
          </label>
          <textarea
            id="identity"
            value={formData.personality.identity}
            onChange={(e) => handlePersonalityChange('identity', e.target.value)}
            rows={3}
            placeholder="e.g., You are a calm, approachable customer service assistant who specializes in helping customers with their inquiries..."
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              getFieldError('identity') ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {getFieldError('identity') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('identity')}</p>
          )}
        </div>

        {/* Demeanor */}
        <div>
          <label htmlFor="demeanor" className="block text-sm font-medium text-gray-700 mb-2">
            Demeanor *
          </label>
          <textarea
            id="demeanor"
            value={formData.personality.demeanor}
            onChange={(e) => handlePersonalityChange('demeanor', e.target.value)}
            rows={3}
            placeholder="e.g., Maintain a relaxed, friendly demeanor while staying attentive to customer needs..."
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              getFieldError('demeanor') ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {getFieldError('demeanor') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('demeanor')}</p>
          )}
        </div>

        {/* Tone */}
        <div>
          <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-2">
            Tone *
          </label>
          <textarea
            id="tone"
            value={formData.personality.tone}
            onChange={(e) => handlePersonalityChange('tone', e.target.value)}
            rows={3}
            placeholder="e.g., Your voice is warm and conversational, with a subtle undercurrent of professionalism..."
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              getFieldError('tone') ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {getFieldError('tone') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('tone')}</p>
          )}
        </div>

        {/* Enthusiasm Level */}
        <div>
          <label htmlFor="enthusiasm" className="block text-sm font-medium text-gray-700 mb-2">
            Enthusiasm Level
          </label>
          <textarea
            id="enthusiasm"
            value={formData.personality.enthusiasmLevel}
            onChange={(e) => handlePersonalityChange('enthusiasmLevel', e.target.value)}
            rows={3}
            placeholder="e.g., Subtly enthusiastic—eager to help but never overwhelming..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Formality Level */}
        <div>
          <label htmlFor="formality" className="block text-sm font-medium text-gray-700 mb-2">
            Formality Level
          </label>
          <textarea
            id="formality"
            value={formData.personality.formalityLevel}
            onChange={(e) => handlePersonalityChange('formalityLevel', e.target.value)}
            rows={3}
            placeholder="e.g., Moderately professional - polite and courteous but friendly and approachable..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Emotion Level */}
        <div>
          <label htmlFor="emotion" className="block text-sm font-medium text-gray-700 mb-2">
            Emotion Level
          </label>
          <textarea
            id="emotion"
            value={formData.personality.emotionLevel}
            onChange={(e) => handlePersonalityChange('emotionLevel', e.target.value)}
            rows={3}
            placeholder="e.g., Supportive, understanding, and empathetic when customers have concerns..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Pacing */}
        <div>
          <label htmlFor="pacing" className="block text-sm font-medium text-gray-700 mb-2">
            Pacing
          </label>
          <input
            id="pacing"
            type="text"
            value={formData.personality.pacing}
            onChange={(e) => handlePersonalityChange('pacing', e.target.value)}
            placeholder="e.g., Medium—steady and unhurried"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filler Words */}
        <div>
          <label htmlFor="fillerWords" className="block text-sm font-medium text-gray-700 mb-2">
            Filler Words
          </label>
          <input
            id="fillerWords"
            type="text"
            value={formData.personality.fillerWords || ''}
            onChange={(e) => handlePersonalityChange('fillerWords', e.target.value)}
            placeholder="e.g., um, hmm, you know"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1 text-sm text-gray-500">
            Optional filler words that make conversation feel more natural
          </p>
        </div>
      </div>

      {/* Other Details */}
      <div>
        <label htmlFor="otherDetails" className="block text-sm font-medium text-gray-700 mb-2">
          Other Details
        </label>
        <textarea
          id="otherDetails"
          value={formData.personality.otherDetails || ''}
          onChange={(e) => handlePersonalityChange('otherDetails', e.target.value)}
          rows={3}
          placeholder="Any additional personality traits or behavioral notes..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Example Card */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-green-900 mb-2">Personality Example</h3>
        <div className="text-sm text-green-800 space-y-2">
          <p><strong>Identity:</strong> You are a calm, approachable online store assistant who&apos;s also a dedicated snowboard enthusiast.</p>
          <p><strong>Tone:</strong> Your voice is warm and conversational, with a subtle undercurrent of excitement for snowboarding.</p>
          <p><strong>Formality:</strong> Moderately professional—polite language but friendly and approachable.</p>
        </div>
      </div>
    </div>
  );
} 