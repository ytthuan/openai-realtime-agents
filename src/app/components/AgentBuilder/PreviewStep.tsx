'use client';

import React, { useState, useMemo } from 'react';
import { StepComponentProps } from './AgentBuilder';
import { AgentBuilderConfig } from '../../types/agentBuilder';

export function PreviewStep({
  formData,
}: StepComponentProps) {
  const [activePreview, setActivePreview] = useState<'summary' | 'instructions' | 'code'>('summary');

  const agentConfig: AgentBuilderConfig = useMemo(() => ({
    id: `agent_${Date.now()}`,
    name: formData.basicInfo.name,
    voice: formData.basicInfo.voice,
    handoffDescription: formData.basicInfo.handoffDescription,
    instructions: {
      personality: formData.personality,
      task: formData.task,
      guidelines: formData.guidelines,
      conversationStates: formData.conversationStates,
      context: formData.context,
      customInstructions: formData.customInstructions,
    },
    tools: formData.tools,
    handoffs: formData.handoffs,
  }), [formData]);

  const generateInstructionsText = () => {
    let instructions = '';

    // Personality Section
    instructions += '# Personality and Tone\n';
    instructions += `## Identity\n${formData.personality.identity}\n\n`;
    if (formData.personality.demeanor) {
      instructions += `## Demeanor\n${formData.personality.demeanor}\n\n`;
    }
    if (formData.personality.tone) {
      instructions += `## Tone\n${formData.personality.tone}\n\n`;
    }
    if (formData.personality.enthusiasmLevel) {
      instructions += `## Level of Enthusiasm\n${formData.personality.enthusiasmLevel}\n\n`;
    }
    if (formData.personality.formalityLevel) {
      instructions += `## Level of Formality\n${formData.personality.formalityLevel}\n\n`;
    }
    if (formData.personality.emotionLevel) {
      instructions += `## Level of Emotion\n${formData.personality.emotionLevel}\n\n`;
    }
    if (formData.personality.pacing) {
      instructions += `## Pacing\n${formData.personality.pacing}\n\n`;
    }
    if (formData.personality.fillerWords) {
      instructions += `## Filler Words\n${formData.personality.fillerWords}\n\n`;
    }

    // Task Section
    instructions += '# Task\n';
    instructions += `${formData.task}\n\n`;

    // Context Section
    if (formData.context.businessName || formData.context.hours || formData.context.locations?.length || formData.context.productsServices?.length) {
      instructions += '# Context\n';
      if (formData.context.businessName) {
        instructions += `- Business name: ${formData.context.businessName}\n`;
      }
      if (formData.context.hours) {
        instructions += `- Hours: ${formData.context.hours}\n`;
      }
      if (formData.context.locations?.length) {
        instructions += '- Locations:\n';
        formData.context.locations.forEach(location => {
          instructions += `  - ${location}\n`;
        });
      }
      if (formData.context.productsServices?.length) {
        instructions += '- Products & Services:\n';
        formData.context.productsServices.forEach(item => {
          instructions += `  - ${item}\n`;
        });
      }
      instructions += '\n';
    }

    // Pronunciations
    if (formData.context.pronunciations && Object.keys(formData.context.pronunciations).length > 0) {
      instructions += '# Reference Pronunciations\n';
      Object.entries(formData.context.pronunciations).forEach(([word, pronunciation]) => {
        instructions += `- "${word}": ${pronunciation}\n`;
      });
      instructions += '\n';
    }

    // Guidelines
    if (formData.guidelines.length > 0) {
      instructions += '# Guidelines\n';
      formData.guidelines.forEach(guideline => {
        if (guideline.trim()) {
          instructions += `- ${guideline}\n`;
        }
      });
      instructions += '\n';
    }

    // Conversation States
    if (formData.conversationStates.length > 0) {
      instructions += '# Conversation States\n[\n';
      formData.conversationStates.forEach((state, index) => {
        instructions += '  {\n';
        instructions += `    "id": "${state.id}",\n`;
        instructions += `    "description": "${state.description}",\n`;
        instructions += '    "instructions": [\n';
        state.instructions.forEach(instruction => {
          instructions += `      "${instruction}",\n`;
        });
        instructions += '    ],\n';
        instructions += '    "examples": [\n';
        state.examples.forEach(example => {
          instructions += `      "${example}",\n`;
        });
        instructions += '    ]\n';
        instructions += `  }${index < formData.conversationStates.length - 1 ? ',' : ''}\n`;
      });
      instructions += ']\n\n';
    }

    // Custom Instructions
    if (formData.customInstructions.trim()) {
      instructions += '# Additional Instructions\n';
      instructions += `${formData.customInstructions}\n\n`;
    }

    return instructions;
  };

  const generateCodePreview = () => {
    const toolsCode = formData.tools.map(tool => {
      return `    tool({
      name: '${tool.name}',
      description: '${tool.description}',
      parameters: ${JSON.stringify(tool.parameters, null, 8).replace(/^/gm, '      ')},
      execute: async (input) => {
${tool.executeCode ? tool.executeCode.replace(/^/gm, '        ') : '        // Tool implementation\n        return { success: true };'}
      }
    })`;
    }).join(',\n');

    const handoffsCode = formData.handoffs.length > 0 
      ? `\n  handoffs: [${formData.handoffs.map(h => `${h}Agent`).join(', ')}],`
      : '';

    return `import { RealtimeAgent, tool } from '@openai/agents/realtime';

export const ${formData.basicInfo.name}Agent = new RealtimeAgent({
  name: '${formData.basicInfo.name}',
  voice: '${formData.basicInfo.voice}',
  handoffDescription: '${formData.basicInfo.handoffDescription}',

  instructions: \`${generateInstructionsText()}\`,

  tools: [
${toolsCode}
  ],${handoffsCode}
});`;
  };

  const completionPercentage = useMemo(() => {
    let completed = 0;
    let total = 0;

    // Basic info (required)
    total += 3;
    if (formData.basicInfo.name.trim()) completed++;
    if (formData.basicInfo.voice) completed++;
    if (formData.basicInfo.handoffDescription.trim()) completed++;

    // Personality (partially required)
    total += 3;
    if (formData.personality.identity.trim()) completed++;
    if (formData.personality.demeanor.trim()) completed++;
    if (formData.personality.tone.trim()) completed++;

    // Task (required)
    total += 1;
    if (formData.task.trim()) completed++;

    // Tools (optional but valuable)
    total += 1;
    if (formData.tools.length > 0) completed++;

    // Guidelines (optional but valuable)
    total += 1;
    if (formData.guidelines.length > 0 && formData.guidelines.some(g => g.trim())) completed++;

    return Math.round((completed / total) * 100);
  }, [formData]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Preview & Export</h2>
        <p className="text-gray-600 mb-6">
          Review your agent configuration and export it as a TypeScript file ready for integration.
        </p>
      </div>

      {/* Completion Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Configuration Completeness</h3>
          <span className={`text-2xl font-bold ${completionPercentage >= 80 ? 'text-green-600' : completionPercentage >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
            {completionPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${completionPercentage >= 80 ? 'bg-green-600' : completionPercentage >= 60 ? 'bg-yellow-600' : 'bg-red-600'}`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {completionPercentage >= 80 ? 'Great! Your agent is well-configured and ready to deploy.' : 
           completionPercentage >= 60 ? 'Good progress! Consider adding more details for a complete agent.' :
           'Your agent needs more configuration to function properly.'}
        </p>
      </div>

      {/* Preview Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'summary', label: 'Summary' },
            { key: 'instructions', label: 'Generated Instructions' },
            { key: 'code', label: 'Generated Code' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActivePreview(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activePreview === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Summary Tab */}
      {activePreview === 'summary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Basic Information</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Name:</strong> {formData.basicInfo.name || 'Not set'}</p>
                <p><strong>Voice:</strong> {formData.basicInfo.voice}</p>
                <p><strong>Handoff Description:</strong> {formData.basicInfo.handoffDescription || 'Not set'}</p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Personality</h4>
              <div className="text-sm text-green-800 space-y-1">
                <p><strong>Identity:</strong> {formData.personality.identity || 'Not defined'}</p>
                <p><strong>Tone:</strong> {formData.personality.tone || 'Not defined'}</p>
                <p><strong>Formality:</strong> {formData.personality.formalityLevel || 'Not defined'}</p>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 mb-2">Context</h4>
              <div className="text-sm text-purple-800 space-y-1">
                <p><strong>Business:</strong> {formData.context.businessName || 'Not set'}</p>
                <p><strong>Hours:</strong> {formData.context.hours || 'Not set'}</p>
                <p><strong>Locations:</strong> {formData.context.locations?.length || 0} defined</p>
                <p><strong>Products/Services:</strong> {formData.context.productsServices?.length || 0} defined</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">Capabilities</h4>
              <div className="text-sm text-yellow-800 space-y-1">
                <p><strong>Tools:</strong> {formData.tools.length} defined</p>
                <p><strong>Handoffs:</strong> {formData.handoffs.length} agents</p>
                <p><strong>Guidelines:</strong> {formData.guidelines.filter(g => g.trim()).length} rules</p>
                <p><strong>Conversation States:</strong> {formData.conversationStates.length} states</p>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Task Summary</h4>
              <p className="text-sm text-gray-700">
                {formData.task || 'No task description provided'}
              </p>
            </div>

            {formData.tools.length > 0 && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h4 className="font-medium text-indigo-900 mb-2">Available Tools</h4>
                <div className="text-sm text-indigo-800 space-y-1">
                  {formData.tools.map(tool => (
                    <p key={tool.id}>• <strong>{tool.name}:</strong> {tool.description}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions Tab */}
      {activePreview === 'instructions' && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Generated Instructions</h3>
            <button
              onClick={() => navigator.clipboard.writeText(generateInstructionsText())}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Copy Instructions
            </button>
          </div>
          <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono bg-white p-4 rounded-md border overflow-x-auto max-h-96">
            {generateInstructionsText()}
          </pre>
        </div>
      )}

      {/* Code Tab */}
      {activePreview === 'code' && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Generated TypeScript Code</h3>
            <button
              onClick={() => navigator.clipboard.writeText(generateCodePreview())}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Copy Code
            </button>
          </div>
          <pre className="text-sm text-gray-800 font-mono bg-white p-4 rounded-md border overflow-x-auto max-h-96">
            {generateCodePreview()}
          </pre>
        </div>
      )}

      {/* Export Instructions */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-green-900 mb-4">Next Steps</h3>
        <div className="text-sm text-green-800 space-y-2">
          <p><strong>1. Export:</strong> Click &quot;Export Config&quot; or &quot;Save Agent&quot; to generate your agent files.</p>
          <p><strong>2. Integration:</strong> Add the generated code to your agent configuration directory.</p>
          <p><strong>3. Import:</strong> Import and register your new agent in the main agent index file.</p>
          <p><strong>4. Test:</strong> Test your agent in the application and iterate as needed.</p>
        </div>
      </div>
    </div>
  );
} 