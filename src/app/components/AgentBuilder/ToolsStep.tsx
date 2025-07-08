'use client';

import React, { useState } from 'react';
import { StepComponentProps } from './AgentBuilder';
import { ToolDefinition, JSONSchema } from '../../types/agentBuilder';
import { JSONSchemaEditor } from './JSONSchemaEditor';

const TOOL_TEMPLATES = [
  {
    id: 'lookup',
    name: 'Data Lookup',
    description: 'Look up information from a database or API',
    template: {
      name: 'lookupInformation',
      description: 'Look up information based on user query',
      parameters: {
        type: 'object' as const,
        properties: {
          query: {
            type: 'string' as const,
            description: 'The search query or identifier'
          }
        },
        required: ['query'],
        additionalProperties: false
      }
    }
  },
  {
    id: 'validation',
    name: 'User Validation',
    description: 'Validate user information or credentials',
    template: {
      name: 'validateUser',
      description: 'Validate user credentials or information',
      parameters: {
        type: 'object' as const,
        properties: {
          phoneNumber: {
            type: 'string' as const,
            description: 'User phone number for validation',
            pattern: '^\\+?[1-9]\\d{1,14}$'
          },
          verificationCode: {
            type: 'string' as const,
            description: 'Verification code provided by user'
          }
        },
        required: ['phoneNumber'],
        additionalProperties: false
      }
    }
  },
  {
    id: 'action',
    name: 'User Action',
    description: 'Perform an action on behalf of the user',
    template: {
      name: 'performAction',
      description: 'Perform a specific action for the user',
      parameters: {
        type: 'object' as const,
        properties: {
          actionType: {
            type: 'string' as const,
            description: 'The type of action to perform',
            enum: ['create', 'update', 'delete', 'submit']
          },
          data: {
            type: 'object' as const,
            description: 'Data required for the action'
          }
        },
        required: ['actionType'],
        additionalProperties: false
      }
    }
  }
];

export function ToolsStep({
  formData,
  updateFormData,
  errors,
}: StepComponentProps) {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  const addTool = (template?: ToolDefinition) => {
    const newTool: ToolDefinition = template || {
      id: `tool_${Date.now()}`,
      name: '',
      description: '',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
        additionalProperties: false
      },
      executeCode: '// Tool execution code\nasync function execute(input) {\n  // Your tool logic here\n  return { success: true };\n}',
      mockResponse: { success: true }
    };

    updateFormData({
      tools: [...formData.tools, newTool]
    });
    setSelectedTool(newTool.id);
  };

  const updateTool = (toolId: string, updates: Partial<ToolDefinition>) => {
    const updatedTools = formData.tools.map(tool =>
      tool.id === toolId ? { ...tool, ...updates } : tool
    );
    updateFormData({ tools: updatedTools });
  };

  const deleteTool = (toolId: string) => {
    const updatedTools = formData.tools.filter(tool => tool.id !== toolId);
    updateFormData({ tools: updatedTools });
    if (selectedTool === toolId) {
      setSelectedTool(null);
    }
  };

  const selectedToolData = formData.tools.find(tool => tool.id === selectedTool);

  const getFieldError = (fieldName: string) => {
    return errors.find(error => error.field === fieldName)?.message;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Tools Configuration</h2>
        <p className="text-gray-600 mb-6">
          Define tools that your agent can use to perform actions, look up information, or interact with external systems.
          Each tool needs a name, description, and parameter schema.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tools List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Tools</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Templates
              </button>
              <button
                onClick={() => addTool()}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Tool
              </button>
            </div>
          </div>

          {/* Tool Templates */}
          {showTemplates && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-medium text-gray-900">Quick Templates</h4>
              {TOOL_TEMPLATES.map(template => (
                <button
                  key={template.id}
                  onClick={() => {
                    const toolData = {
                      id: `tool_${Date.now()}`,
                      ...template.template,
                      executeCode: '// Tool execution code\nasync function execute(input) {\n  // Your tool logic here\n  return { success: true };\n}',
                      mockResponse: { success: true }
                    };
                    
                    // Filter out undefined properties to fix TypeScript error
                    const filteredToolData = Object.fromEntries(
                      Object.entries(toolData).filter(([_, value]) => value !== undefined)
                    );
                    
                    addTool(filteredToolData as ToolDefinition);
                    setShowTemplates(false);
                  }}
                  className="w-full text-left p-2 rounded-md hover:bg-gray-100 border border-gray-200"
                >
                  <div className="text-sm font-medium text-gray-900">{template.name}</div>
                  <div className="text-xs text-gray-600">{template.description}</div>
                </button>
              ))}
            </div>
          )}

          {/* Tools List */}
          <div className="space-y-2">
            {formData.tools.map((tool, index) => (
              <div
                key={tool.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedTool === tool.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTool(tool.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">
                      {tool.name || `Tool ${index + 1}`}
                    </div>
                    <div className="text-sm text-gray-600 truncate">
                      {tool.description || 'No description'}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTool(tool.id);
                    }}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
                {getFieldError(`tool_${index}_name`) && (
                  <p className="mt-1 text-xs text-red-600">{getFieldError(`tool_${index}_name`)}</p>
                )}
              </div>
            ))}

            {formData.tools.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No tools defined. Click &quot;Add Tool&quot; to get started.
              </div>
            )}
          </div>
        </div>

        {/* Tool Editor */}
        <div className="lg:col-span-2">
          {selectedToolData ? (
            <div className="space-y-6 bg-white border border-gray-200 rounded-lg p-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Tool</h3>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tool Name *
                  </label>
                  <input
                    type="text"
                    value={selectedToolData.name}
                    onChange={(e) => updateTool(selectedToolData.id, { name: e.target.value })}
                    placeholder="e.g., lookupUserInfo, authenticateUser"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Function Name
                  </label>
                  <input
                    type="text"
                    value={selectedToolData.name}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Function name matches tool name
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={selectedToolData.description}
                  onChange={(e) => updateTool(selectedToolData.id, { description: e.target.value })}
                  rows={3}
                  placeholder="Describe what this tool does and when to use it..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Parameters Schema */}
              <div>
                <JSONSchemaEditor
                  schema={selectedToolData.parameters}
                  onChange={(schema) => updateTool(selectedToolData.id, { parameters: schema })}
                />
              </div>

              {/* Execute Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Execute Function (Optional)
                </label>
                <textarea
                  value={selectedToolData.executeCode || ''}
                  onChange={(e) => updateTool(selectedToolData.id, { executeCode: e.target.value })}
                  rows={8}
                  placeholder="async function execute(input, context) {&#10;  // Your tool implementation here&#10;  // Return the result of the tool execution&#10;  return { success: true, data: {...} };&#10;}"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  JavaScript function that will be called when the tool is executed
                </p>
              </div>

              {/* Mock Response */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mock Response (Optional)
                </label>
                <textarea
                  value={JSON.stringify(selectedToolData.mockResponse || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      updateTool(selectedToolData.id, { mockResponse: parsed });
                    } catch {
                      // Invalid JSON, don't update
                    }
                  }}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Sample response data for testing purposes
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
              Select a tool from the list to edit its configuration
            </div>
          )}
        </div>
      </div>

      {/* Tool Usage Example */}
      {formData.tools.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-900 mb-2">Tool Usage in Code</h3>
          <pre className="text-sm text-yellow-800 bg-yellow-100 p-3 rounded-md overflow-x-auto">
{`// Example tool usage in agent configuration:
tools: [
  tool({
    name: '${formData.tools[0]?.name || 'yourToolName'}',
    description: '${formData.tools[0]?.description || 'Tool description'}',
    parameters: ${JSON.stringify(formData.tools[0]?.parameters || {}, null, 6).replace(/^/gm, '    ')},
    execute: async (input) => {
      // Tool implementation
      return { success: true };
    }
  })
]`}
          </pre>
        </div>
      )}
    </div>
  );
} 