'use client';

import React, { useState, useCallback } from 'react';
import {
  AgentBuilderConfig,
  BuilderFormData,
  ValidationError,
  VoiceOption,
  PersonalityConfig,
  ContextInfo,
  ToolDefinition,
  ConversationState
} from '../../types/agentBuilder';
import { BasicInfoStep } from './BasicInfoStep';
import { PersonalityStep } from './PersonalityStep';
import { ToolsStep } from './ToolsStep';
import { HandoffsStep } from './HandoffsStep';
import { InstructionsStep } from './InstructionsStep';
import { PreviewStep } from './PreviewStep';

interface AgentBuilderProps {
  onSave?: (config: AgentBuilderConfig) => void;
  onExport?: (config: AgentBuilderConfig) => void;
  initialConfig?: Partial<AgentBuilderConfig>;
  existingAgents?: AgentBuilderConfig[];
}

export interface StepComponentProps {
  formData: BuilderFormData;
  updateFormData: (updates: Partial<BuilderFormData>) => void;
  errors: ValidationError[];
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  existingAgents?: AgentBuilderConfig[];
}

const STEPS = [
  { id: 'basic', title: 'Basic Info', component: BasicInfoStep },
  { id: 'personality', title: 'Personality', component: PersonalityStep },
  { id: 'instructions', title: 'Instructions', component: InstructionsStep },
  { id: 'tools', title: 'Tools', component: ToolsStep },
  { id: 'handoffs', title: 'Handoffs', component: HandoffsStep },
  { id: 'preview', title: 'Preview', component: PreviewStep },
];

export function AgentBuilder({ 
  onSave, 
  onExport, 
  initialConfig,
  existingAgents = []
}: AgentBuilderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  
  const [formData, setFormData] = useState<BuilderFormData>({
    basicInfo: {
      name: initialConfig?.name || '',
      voice: initialConfig?.voice || 'sage',
      handoffDescription: initialConfig?.handoffDescription || '',
    },
    personality: initialConfig?.instructions?.personality || {
      identity: '',
      demeanor: '',
      tone: '',
      enthusiasmLevel: '',
      formalityLevel: '',
      emotionLevel: '',
      pacing: '',
    },
    task: initialConfig?.instructions?.task || '',
    guidelines: initialConfig?.instructions?.guidelines || [],
    context: initialConfig?.instructions?.context || {
      businessName: '',
      hours: '',
      locations: [],
      productsServices: [],
      pronunciations: {},
    },
    tools: initialConfig?.tools || [],
    handoffs: initialConfig?.handoffs || [],
    conversationStates: initialConfig?.instructions?.conversationStates || [],
    customInstructions: initialConfig?.instructions?.customInstructions || '',
  });

  const updateFormData = useCallback((updates: Partial<BuilderFormData>) => {
    setFormData(prev => ({
      ...prev,
      ...updates,
    }));
    // Clear errors when user makes changes
    setErrors([]);
  }, []);

  const validateCurrentStep = useCallback(() => {
    const newErrors: ValidationError[] = [];
    
    switch (currentStep) {
      case 0: // Basic Info
        if (!formData.basicInfo.name.trim()) {
          newErrors.push({ field: 'name', message: 'Agent name is required' });
        }
        if (!formData.basicInfo.handoffDescription.trim()) {
          newErrors.push({ field: 'handoffDescription', message: 'Handoff description is required' });
        }
        // Check for duplicate names
        if (existingAgents.some(agent => agent.name === formData.basicInfo.name.trim())) {
          newErrors.push({ field: 'name', message: 'Agent name must be unique' });
        }
        break;
      
      case 1: // Personality
        if (!formData.personality.identity.trim()) {
          newErrors.push({ field: 'identity', message: 'Identity is required' });
        }
        if (!formData.personality.demeanor.trim()) {
          newErrors.push({ field: 'demeanor', message: 'Demeanor is required' });
        }
        if (!formData.personality.tone.trim()) {
          newErrors.push({ field: 'tone', message: 'Tone is required' });
        }
        break;
      
      case 2: // Instructions
        if (!formData.task.trim()) {
          newErrors.push({ field: 'task', message: 'Task description is required' });
        }
        break;
      
      case 3: // Tools
        // Validate tool definitions
        formData.tools.forEach((tool, index) => {
          if (!tool.name.trim()) {
            newErrors.push({ field: `tool_${index}_name`, message: `Tool ${index + 1} name is required` });
          }
          if (!tool.description.trim()) {
            newErrors.push({ field: `tool_${index}_description`, message: `Tool ${index + 1} description is required` });
          }
        });
        break;
      
      case 4: // Handoffs
        // No strict validation for handoffs
        break;
      
      case 5: // Preview
        // Final validation
        break;
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  }, [currentStep, formData, existingAgents]);

  const handleNext = useCallback(() => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }
  }, [validateCurrentStep]);

  const handlePrevious = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const handleStepClick = useCallback((stepIndex: number) => {
    setCurrentStep(stepIndex);
  }, []);

  const generateAgentConfig = useCallback((): AgentBuilderConfig => {
    return {
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
    };
  }, [formData]);

  const handleSave = useCallback(() => {
    if (validateCurrentStep()) {
      const config = generateAgentConfig();
      onSave?.(config);
    }
  }, [validateCurrentStep, generateAgentConfig, onSave]);

  const handleExport = useCallback(() => {
    const config = generateAgentConfig();
    onExport?.(config);
  }, [generateAgentConfig, onExport]);

  const CurrentStepComponent = STEPS[currentStep].component;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Agent Builder</h1>
        <p className="text-gray-600">Create and configure AI agents with tools, handoffs, and custom behaviors.</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => handleStepClick(index)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  index === currentStep
                    ? 'bg-blue-600 text-white'
                    : index < currentStep
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1}
              </button>
              <span className={`ml-2 text-sm font-medium ${
                index === currentStep ? 'text-blue-600' : 'text-gray-600'
              }`}>
                {step.title}
              </span>
              {index < STEPS.length - 1 && (
                <div className={`w-16 h-1 mx-4 ${
                  index < currentStep ? 'bg-green-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-medium mb-2">Please fix the following errors:</h3>
          <ul className="text-red-700 text-sm space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Current Step Component */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <CurrentStepComponent
          formData={formData}
          updateFormData={updateFormData}
          errors={errors}
          onNext={handleNext}
          onPrevious={handlePrevious}
          isFirstStep={currentStep === 0}
          isLastStep={currentStep === STEPS.length - 1}
          existingAgents={existingAgents}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        
        <div className="flex space-x-4">
          {currentStep === STEPS.length - 1 ? (
            <>
              <button
                onClick={handleExport}
                className="px-6 py-2 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Export Config
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                Save Agent
              </button>
            </>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 