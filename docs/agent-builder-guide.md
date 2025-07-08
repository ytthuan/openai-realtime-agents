# Agent Builder Guide

## Overview

The Agent Builder is a systematic UI and UX tool for creating OpenAI Realtime Agent configurations based on the customerServiceRetail agent structure. It provides a step-by-step interface for building agents with tools, handoffs, and custom behaviors.

## Features

### 🎯 **Systematic Agent Creation**
- **Multi-step Form Interface**: Guided workflow through 6 distinct steps
- **Validation & Error Handling**: Real-time validation with clear error messages
- **Progress Tracking**: Visual progress indicator showing completion status

### 🛠️ **Tool Management**
- **Visual JSON Schema Editor**: Interactive editor for defining tool parameters
- **Tool Templates**: Pre-built templates for common tool patterns
- **Code Integration**: Support for custom execute functions

### 🔄 **Handoff Configuration**
- **Visual Handoff Management**: Easy selection and configuration of agent handoffs
- **Bidirectional Routing**: Automatic bidirectional handoff setup
- **Custom Agent Support**: Ability to reference external agents

### 📤 **Export Capabilities**
- **TypeScript Generation**: Complete RealtimeAgent class generation
- **JSON Export**: Portable configuration files
- **Instructions Export**: Human-readable instruction text
- **Complete Package**: All formats in one export

## Getting Started

### Access the Agent Builder

1. Navigate to the main application
2. Click the "Agent Builder" button in the header
3. Start creating your first agent

### Step-by-Step Process

#### 1. Basic Information
- **Agent Name**: Unique identifier (camelCase recommended)
- **Voice Selection**: Choose from available voice options (sage, fable, alloy, nova)
- **Handoff Description**: Describe when other agents should transfer to this agent

#### 2. Personality Configuration
Define your agent's communication style:
- **Identity**: Core personality and role description
- **Demeanor**: How the agent behaves in interactions
- **Tone**: Communication style and voice characteristics
- **Enthusiasm Level**: Energy and excitement in responses
- **Formality Level**: Professional vs. casual communication
- **Emotion Level**: Empathy and emotional responsiveness
- **Pacing**: Speed and rhythm of communication
- **Filler Words**: Natural conversation elements

#### 3. Instructions & Behavior
Configure detailed behavior through tabs:

**Task Tab**
- Define the primary purpose and responsibilities

**Context Tab**
- Business information (name, hours, locations)
- Products and services offered
- Pronunciation guides for specific terms

**Guidelines Tab**
- Behavioral rules and constraints
- Interaction principles
- Escalation procedures

**Conversation States Tab**
- Structured conversation flows
- State transitions and conditions
- Examples for each state

**Custom Instructions Tab**
- Additional instructions not covered elsewhere
- Specific requirements and edge cases

#### 4. Tools Configuration
Define agent capabilities:

**Tool Editor Features**
- **Name & Description**: Clear tool identification
- **Parameter Schema**: Visual JSON schema editor
- **Execute Function**: JavaScript implementation code
- **Mock Response**: Testing data

**Tool Templates**
- **Data Lookup**: Information retrieval tools
- **User Validation**: Authentication and verification
- **User Actions**: Task execution tools

#### 5. Handoffs Configuration
Set up agent routing:

**Available Agents**
- Select from existing agents in the project
- View agent capabilities and descriptions

**Custom Handoffs**
- Reference external agents
- Future agent planning

**Handoff Patterns**
- Authentication → Sales
- Sales → Support
- Any Agent → Human
- Support → Returns

#### 6. Preview & Export
Review and finalize:

**Summary View**
- Configuration overview
- Completeness percentage
- Key statistics

**Generated Instructions**
- Full instruction text preview
- Copy to clipboard functionality

**Generated Code**
- Complete TypeScript implementation
- Ready for integration

## Configuration Examples

### Customer Service Authentication Agent

```typescript
// Basic Information
name: "customerAuth"
voice: "sage"
handoffDescription: "Handles initial customer verification and routes to appropriate services"

// Personality
identity: "You are a calm, professional authentication specialist who helps verify customer identity before providing services."
tone: "Professional yet friendly, reassuring customers through the verification process"
formality: "Moderately professional - polite and courteous"

// Tools
authenticateUser: {
  parameters: {
    phoneNumber: { type: "string", pattern: "^\\+?[1-9]\\d{1,14}$" },
    dateOfBirth: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
    lastFourDigits: { type: "string", pattern: "^\\d{4}$" }
  }
}

// Handoffs
handoffs: ["salesAgent", "supportAgent", "returnsAgent"]
```

### Sales Agent

```typescript
// Basic Information
name: "salesAgent"
voice: "fable"
handoffDescription: "Helps customers with product inquiries, recommendations, and purchases"

// Personality
identity: "You are an enthusiastic sales assistant with deep product knowledge"
tone: "Engaging and helpful, with subtle enthusiasm for products"
enthusiasm: "Moderately enthusiastic - excited about products but not overwhelming"

// Tools
lookupProducts: {
  parameters: {
    category: { type: "string", enum: ["snowboards", "boots", "accessories"] },
    priceRange: { type: "object", properties: { min: "number", max: "number" } }
  }
}

addToCart: {
  parameters: {
    productId: { type: "string" },
    quantity: { type: "number", minimum: 1 }
  }
}
```

## Integration Guide

### Exported Files

**TypeScript File (`agentName.ts`)**
```typescript
import { RealtimeAgent, tool } from '@openai/agents/realtime';

export const customerAuthAgent = new RealtimeAgent({
  name: 'customerAuth',
  voice: 'sage',
  handoffDescription: 'Handles initial customer verification...',
  instructions: `# Personality and Tone...`,
  tools: [/* tool definitions */],
  handoffs: [salesAgent, supportAgent]
});
```

**JSON Configuration (`agentName-config.json`)**
```json
{
  "version": "1.0.0",
  "agentSet": {
    "id": "agent_set_123",
    "name": "Customer Auth Agent Set",
    "agents": [/* agent configurations */],
    "companyName": "Your Company"
  },
  "exportDate": "2024-01-01T00:00:00.000Z"
}
```

### Project Integration

1. **Add to Agent Configs**
   ```bash
   cp customerAuth.ts src/app/agentConfigs/yourProject/
   ```

2. **Update Index File**
   ```typescript
   import { customerAuthAgent } from './customerAuth';
   
   export const yourProjectScenario = [
     customerAuthAgent,
     // ... other agents
   ];
   ```

3. **Configure Handoffs**
   ```typescript
   (customerAuthAgent.handoffs as any).push(salesAgent, supportAgent);
   ```

4. **Register Agent Set**
   ```typescript
   export const allAgentSets: Record<string, RealtimeAgent[]> = {
     yourProject: yourProjectScenario,
     // ... other agent sets
   };
   ```

## Best Practices

### Agent Design

1. **Single Responsibility**: Each agent should have a clear, focused purpose
2. **Descriptive Names**: Use clear, descriptive names for agents and tools
3. **Comprehensive Instructions**: Provide detailed personality and behavior guidance
4. **Tool Validation**: Include proper parameter validation with JSON schemas

### Tool Development

1. **Clear Descriptions**: Write detailed tool descriptions for LLM understanding
2. **Robust Schemas**: Define comprehensive parameter schemas with validation
3. **Error Handling**: Include proper error handling in execute functions
4. **Mock Data**: Provide realistic mock responses for testing

### Handoff Strategy

1. **Logical Flow**: Design handoffs that follow natural conversation flows
2. **Bidirectional Setup**: Ensure agents can transfer back when appropriate
3. **Fallback Options**: Include human handoff options for complex cases
4. **Context Preservation**: Maintain conversation context across handoffs

### Testing & Iteration

1. **Start Simple**: Begin with basic functionality and add complexity gradually
2. **Test Thoroughly**: Validate agents in various scenarios
3. **User Feedback**: Gather feedback and iterate on agent behavior
4. **Monitor Performance**: Track agent effectiveness and user satisfaction

## Troubleshooting

### Common Issues

**Agent Won't Export**
- Check required fields (name, handoff description, task, personality identity)
- Validate tool schemas for correct JSON format
- Ensure no duplicate agent names

**Tools Not Working**
- Verify JSON schema syntax
- Check parameter type definitions
- Validate execute function syntax

**Handoffs Failing**
- Confirm target agents exist
- Check bidirectional handoff setup
- Verify agent name references

**Instructions Too Generic**
- Add more specific personality details
- Include context information
- Define clear behavioral guidelines

### Debug Tips

1. **Export JSON**: Use JSON export to inspect configuration structure
2. **Validate Schema**: Check generated TypeScript for syntax errors
3. **Test Incrementally**: Build and test agents step by step
4. **Use Templates**: Start with tool templates for common patterns

## Advanced Features

### Custom Tool Templates

Create reusable tool patterns for your organization:

```typescript
const customTemplate: ToolTemplate = {
  id: 'companyLookup',
  name: 'Company Data Lookup',
  category: 'data-lookup',
  definition: {
    name: 'lookupCompanyData',
    description: 'Look up internal company information',
    parameters: {
      type: 'object',
      properties: {
        dataType: { type: 'string', enum: ['customer', 'order', 'product'] },
        identifier: { type: 'string' }
      }
    }
  }
};
```

### Agent Set Management

Export complete agent sets for team collaboration:

```typescript
const agentSet: AgentSet = {
  id: 'customer_service_v1',
  name: 'Customer Service Agent Set',
  description: 'Complete customer service workflow agents',
  agents: [authAgent, salesAgent, supportAgent, returnsAgent],
  companyName: 'Your Company'
};
```

### Configuration Validation

The system includes comprehensive validation:

```typescript
const validation = AgentExporter.validateConfig(config);
if (!validation.isValid) {
  console.log('Errors:', validation.errors);
}
```

## Support & Resources

- **Documentation**: This guide and inline help text
- **Examples**: Pre-built agent configurations in the codebase
- **Templates**: Tool and agent templates for common patterns
- **Community**: GitHub discussions and issues

## Changelog

### Version 1.0.0
- Initial release with complete agent builder functionality
- Multi-step form interface
- Visual JSON schema editor
- Export capabilities
- Template system
- Handoff management

---

*Built with the OpenAI Realtime API and Agents SDK* 