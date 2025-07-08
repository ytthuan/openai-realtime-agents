// Agent Builder Types - Based on OpenAI Realtime Agent structure

export interface AgentBuilderConfig {
  id: string;
  name: string;
  voice: VoiceOption;
  handoffDescription: string;
  instructions: AgentInstructions;
  tools: ToolDefinition[];
  handoffs: string[]; // Array of agent IDs that this agent can handoff to
  companyName?: string;
}

export type VoiceOption = 'sage' | 'fable' | 'alloy' | 'nova';

export interface AgentInstructions {
  personality: PersonalityConfig;
  task: string;
  guidelines: string[];
  conversationStates?: ConversationState[];
  context?: ContextInfo;
  customInstructions?: string;
}

export interface PersonalityConfig {
  identity: string;
  demeanor: string;
  tone: string;
  enthusiasmLevel: string;
  formalityLevel: string;
  emotionLevel: string;
  fillerWords?: string;
  pacing: string;
  otherDetails?: string;
}

export interface ConversationState {
  id: string;
  description: string;
  instructions: string[];
  examples: string[];
  transitions: StateTransition[];
}

export interface StateTransition {
  nextStep: string;
  condition: string;
}

export interface ContextInfo {
  businessName?: string;
  hours?: string;
  locations?: string[];
  productsServices?: string[];
  pronunciations?: Record<string, string>;
}

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  parameters: JSONSchema;
  executeCode?: string; // JavaScript code as string for the execute function
  mockResponse?: any; // Mock response for testing
}

export interface JSONSchema {
  type: 'object' | 'string' | 'number' | 'boolean' | 'array';
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
  additionalProperties?: boolean;
  items?: JSONSchemaProperty;
  enum?: any[];
  pattern?: string;
  description?: string;
}

export interface JSONSchemaProperty {
  type: 'object' | 'string' | 'number' | 'boolean' | 'array';
  description?: string;
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
  additionalProperties?: boolean;
  items?: JSONSchemaProperty;
  enum?: any[];
  pattern?: string;
  minItems?: number;
  maxItems?: number;
}

export interface AgentSet {
  id: string;
  name: string;
  description: string;
  agents: AgentBuilderConfig[];
  companyName: string;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface BuilderFormData {
  basicInfo: {
    name: string;
    voice: VoiceOption;
    handoffDescription: string;
  };
  personality: PersonalityConfig;
  task: string;
  guidelines: string[];
  context: ContextInfo;
  tools: ToolDefinition[];
  handoffs: string[];
  conversationStates: ConversationState[];
  customInstructions: string;
}

// Export/Import types
export interface ExportFormat {
  version: string;
  agentSet: AgentSet;
  exportDate: string;
}

// Template types for common agent patterns
export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  category: 'customer-service' | 'sales' | 'support' | 'authentication' | 'custom';
  config: Partial<AgentBuilderConfig>;
}

export interface ToolTemplate {
  id: string;
  name: string;
  description: string;
  category: 'data-lookup' | 'user-action' | 'external-api' | 'validation' | 'custom';
  definition: ToolDefinition;
} 