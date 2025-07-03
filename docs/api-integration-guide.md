# Voice Agent Platform API Integration Guide

## 1. Introduction

This guide provides comprehensive instructions for integrating your business systems with the Voice Agent Platform. It covers authentication, API endpoints, webhooks, and best practices for seamless integration.

## 2. Getting Started

### 2.1 Prerequisites

Before integrating with the Voice Agent Platform, ensure you have:

1. **Account Setup**: Active tenant account on the platform
2. **API Credentials**: API key from your dashboard
3. **Development Environment**: Node.js 18+ or your preferred language
4. **Network Access**: Whitelisted IPs (if applicable)

### 2.2 Base URLs

```yaml
production: https://api.voiceagent.com/v1
staging: https://api-staging.voiceagent.com/v1
sandbox: https://api-sandbox.voiceagent.com/v1
```

### 2.3 Quick Start Example

```typescript
// Install the SDK
npm install @voiceagent/sdk

// Initialize the client
import { VoiceAgentClient } from '@voiceagent/sdk';

const client = new VoiceAgentClient({
  apiKey: 'vap_live_your_api_key_here',
  environment: 'production'
});

// Create your first agent
const agent = await client.agents.create({
  name: 'Customer Service Bot',
  instructions: 'Help customers with their inquiries',
  tools: ['product_search', 'order_status']
});

// Deploy the agent
const deployment = await client.agents.deploy(agent.id, 'production');
console.log('Agent deployed at:', deployment.endpoint_url);
```

## 3. Authentication

### 3.1 API Key Authentication

All API requests must include your API key in the Authorization header:

```http
Authorization: Bearer vap_live_your_api_key_here
```

### 3.2 OAuth 2.0 (Coming Soon)

For enhanced security and user-specific actions:

```typescript
// OAuth flow example
const authUrl = client.oauth.getAuthorizationUrl({
  clientId: 'your_client_id',
  redirectUri: 'https://yourapp.com/callback',
  scopes: ['agents:read', 'agents:write', 'conversations:read']
});

// After user authorization
const tokens = await client.oauth.exchangeCode(authorizationCode);
```

### 3.3 Webhook Signatures

Verify webhook authenticity using HMAC-SHA256:

```typescript
import crypto from 'crypto';

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
    
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

## 4. Core API Endpoints

### 4.1 Agent Management

#### Create Agent
```typescript
POST /agents
Content-Type: application/json

{
  "name": "Sales Assistant",
  "description": "Helps with product inquiries and sales",
  "instructions": "You are a helpful sales assistant...",
  "tools": [
    {
      "name": "search_products",
      "description": "Search product catalog",
      "parameters": {
        "type": "object",
        "properties": {
          "query": { "type": "string" },
          "category": { "type": "string" }
        }
      }
    }
  ],
  "settings": {
    "model": "gpt-4o-realtime",
    "temperature": 0.7,
    "voice": "alloy"
  }
}

// Response
{
  "id": "agent_123",
  "name": "Sales Assistant",
  "status": "draft",
  "created_at": "2024-01-15T10:00:00Z"
}
```

#### Update Agent
```typescript
PUT /agents/{agent_id}
Content-Type: application/json

{
  "instructions": "Updated instructions...",
  "tools": [...],
  "settings": {...}
}
```

#### List Agents
```typescript
GET /agents?page=1&limit=20&status=active

// Response
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

### 4.2 Deployment Management

#### Deploy Agent
```typescript
POST /agents/{agent_id}/deploy
Content-Type: application/json

{
  "environment": "production",
  "config": {
    "maxConcurrentSessions": 100,
    "sessionTimeout": 3600
  }
}

// Response
{
  "id": "deploy_456",
  "agent_id": "agent_123",
  "environment": "production",
  "endpoint_url": "wss://agent-123.voiceagent.com",
  "status": "active"
}
```

### 4.3 Conversation Management

#### Start Conversation
```typescript
POST /conversations
Content-Type: application/json

{
  "deployment_id": "deploy_456",
  "metadata": {
    "user_id": "user_789",
    "channel": "web",
    "locale": "en-US"
  }
}

// Response
{
  "id": "conv_789",
  "session_id": "sess_abc123",
  "websocket_url": "wss://rt.voiceagent.com/session/sess_abc123",
  "expires_at": "2024-01-15T11:00:00Z"
}
```

#### Get Conversation History
```typescript
GET /conversations/{conversation_id}

// Response
{
  "id": "conv_789",
  "started_at": "2024-01-15T10:00:00Z",
  "ended_at": "2024-01-15T10:30:00Z",
  "transcript": [
    {
      "role": "user",
      "content": "Hello, I need help",
      "timestamp": "2024-01-15T10:00:01Z"
    },
    {
      "role": "assistant",
      "content": "Hello! I'd be happy to help you.",
      "timestamp": "2024-01-15T10:00:03Z"
    }
  ],
  "metadata": {...}
}
```

## 5. WebSocket Integration

### 5.1 Establishing Connection

```typescript
import WebSocket from 'ws';

const ws = new WebSocket('wss://rt.voiceagent.com/session/sess_abc123', {
  headers: {
    'Authorization': 'Bearer vap_live_your_api_key_here'
  }
});

ws.on('open', () => {
  console.log('Connected to voice agent');
  
  // Send initial configuration
  ws.send(JSON.stringify({
    type: 'session.update',
    session: {
      modalities: ['text', 'audio'],
      instructions: 'Additional context for this session'
    }
  }));
});

ws.on('message', (data) => {
  const event = JSON.parse(data);
  handleRealtimeEvent(event);
});
```

### 5.2 Realtime Events

#### Sending Audio
```typescript
// Convert audio to base64
const audioBase64 = Buffer.from(audioData).toString('base64');

ws.send(JSON.stringify({
  type: 'input_audio_buffer.append',
  audio: audioBase64
}));

// Commit the audio buffer
ws.send(JSON.stringify({
  type: 'input_audio_buffer.commit'
}));
```

#### Handling Responses
```typescript
function handleRealtimeEvent(event: any) {
  switch (event.type) {
    case 'response.audio.delta':
      // Stream audio to user
      playAudioDelta(event.delta);
      break;
      
    case 'response.text.delta':
      // Update transcript
      updateTranscript(event.delta);
      break;
      
    case 'response.function_call':
      // Handle tool execution
      const result = await executeFunction(
        event.name,
        event.arguments
      );
      
      // Send result back
      ws.send(JSON.stringify({
        type: 'function_call_output',
        call_id: event.call_id,
        output: result
      }));
      break;
      
    case 'error':
      console.error('Error:', event.error);
      break;
  }
}
```

## 6. Tool Integration

The Voice Agent Platform supports multiple integration methods for maximum flexibility. You can connect tools using MCP (Model Context Protocol), external APIs, or custom code.

### 6.1 Integration Types Overview

```typescript
interface IntegrationTypes {
  mcp: {
    description: 'Model Context Protocol for AI tool standardization';
    useCases: ['File operations', 'Database queries', 'API integrations'];
    benefits: ['Standardized interface', 'Type safety', 'Hot reloading'];
  };
  
  api: {
    description: 'Direct REST/GraphQL API integrations';
    useCases: ['Third-party services', 'Legacy systems', 'Custom APIs'];
    benefits: ['Direct connection', 'Real-time data', 'Custom authentication'];
  };
  
  code: {
    description: 'Custom serverless functions';
    useCases: ['Complex logic', 'Data processing', 'Custom algorithms'];
    benefits: ['Full control', 'Performance optimization', 'Custom libraries'];
  };
}
```

### 6.2 MCP (Model Context Protocol) Integration

MCP provides a standardized way to connect AI models with external tools and data sources. As referenced in the [Next.js API tutorial](https://mydevpa.ge/blog/nextjs-14-api-route-tutorial), we leverage Next.js 15's enhanced API routes for optimal performance.

```typescript
// MCP Tool Definition
interface MCPTool {
  type: 'mcp';
  name: string;
  description: string;
  serverUrl: string;
  toolName: string;
  parameters: MCPParameters;
  authentication?: MCPAuth;
}

const mcpDatabaseTool: MCPTool = {
  type: 'mcp',
  name: 'query_customer_database',
  description: 'Query customer information from CRM database',
  serverUrl: 'mcp://localhost:3001/crm-server',
  toolName: 'query_customers',
  parameters: {
    type: 'object',
    properties: {
      customerId: { type: 'string' },
      fields: { 
        type: 'array',
        items: { type: 'string' },
        default: ['name', 'email', 'status']
      }
    },
    required: ['customerId']
  },
  authentication: {
    type: 'bearer',
    token: process.env.CRM_MCP_TOKEN
  }
};

// MCP Client Implementation
export class MCPClient {
  async callTool(tool: MCPTool, params: any) {
    const response = await fetch(`${tool.serverUrl}/tools/${tool.toolName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tool.authentication?.token}`
      },
      body: JSON.stringify({
        params,
        session_id: generateSessionId()
      })
    });
    
    return response.json();
  }
}
```

### 6.3 External API Integration

Connect directly to REST or GraphQL APIs with built-in authentication and error handling.

```typescript
interface APITool {
  type: 'api';
  name: string;
  description: string;
  endpoint: {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
  };
  authentication: {
    type: 'none' | 'apiKey' | 'oauth2' | 'basic';
    config: Record<string, any>;
  };
  parameters: APIParameters;
  responseMapping?: ResponseMapping;
}

const shopifyAPITool: APITool = {
  type: 'api',
  name: 'get_shopify_products',
  description: 'Fetch products from Shopify store',
  endpoint: {
    url: 'https://{shop}.myshopify.com/admin/api/2024-01/products.json',
    method: 'GET',
    headers: {
      'X-Shopify-Access-Token': '{access_token}'
    }
  },
  authentication: {
    type: 'apiKey',
    config: {
      keyLocation: 'header',
      keyName: 'X-Shopify-Access-Token',
      keyValue: process.env.SHOPIFY_ACCESS_TOKEN
    }
  },
  parameters: {
    type: 'object',
    properties: {
      limit: { type: 'number', default: 10, maximum: 250 },
      collection_id: { type: 'string' },
      product_type: { type: 'string' }
    }
  },
  responseMapping: {
    products: '$.products[*]',
    id: '$.id',
    title: '$.title',
    price: '$.variants[0].price'
  }
};
```

### 6.4 Custom Code Integration

For complex logic or when you need full control, deploy custom serverless functions using Next.js 15's enhanced API routes.

```typescript
interface CodeTool {
  type: 'code';
  name: string;
  description: string;
  runtime: 'nodejs' | 'python' | 'edge';
  code: string;
  dependencies?: string[];
  timeout?: number;
  memory?: number;
}

const customAnalyticsTool: CodeTool = {
  type: 'code',
  name: 'analyze_customer_sentiment',
  description: 'Analyze customer sentiment from conversation history',
  runtime: 'nodejs',
  dependencies: ['sentiment', 'natural'],
  timeout: 30000, // 30 seconds
  code: `
    const Sentiment = require('sentiment');
    const natural = require('natural');
    
    export default async function handler(req, res) {
      try {
        const { conversationHistory } = req.body;
        const sentiment = new Sentiment();
        
        // Analyze sentiment
        const results = conversationHistory.map(message => {
          const analysis = sentiment.analyze(message.text);
          return {
            messageId: message.id,
            score: analysis.score,
            comparative: analysis.comparative,
            tokens: analysis.tokens
          };
        });
        
        // Calculate overall sentiment
        const overallScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
        
        res.status(200).json({
          overallSentiment: overallScore > 0 ? 'positive' : overallScore < 0 ? 'negative' : 'neutral',
          overallScore,
          messageAnalysis: results
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
  `
};

// Deploy custom code as Next.js API route
export async function deployCustomTool(tool: CodeTool) {
  const apiPath = `/api/tools/${tool.name}`;
  
  // Create API route file dynamically
  const routeContent = `
    ${tool.code}
  `;
  
  // Write to filesystem (in development) or deploy to serverless (in production)
  await writeAPIRoute(apiPath, routeContent);
  
  return {
    endpoint: apiPath,
    deployed: true,
    runtime: tool.runtime
  };
}
```

### 6.5 Universal Tool Definition

All tool types are unified under a common interface for seamless agent integration.

```typescript
interface UniversalTool {
  id: string;
  name: string;
  description: string;
  category: string;
  integrationMeta: MCPTool | APITool | CodeTool;
  parameters: ToolParameters;
  examples?: ToolExample[];
  tags?: string[];
  version: string;
  createdAt: string;
  updatedAt: string;
}

const productSearchTool: UniversalTool = {
  id: 'tool_001',
  name: 'search_products',
  description: 'Search the product catalog using multiple data sources',
  category: 'e-commerce',
  integrationMeta: mcpDatabaseTool, // or apiTool or codeTool
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query'
      },
      filters: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          minPrice: { type: 'number' },
          maxPrice: { type: 'number' }
        }
      }
    },
    required: ['query']
  },
  examples: [
    {
      input: { query: 'iPhone 15', filters: { category: 'electronics' } },
      output: { products: [{ id: '123', name: 'iPhone 15 Pro', price: 999 }] }
    }
  ],
  tags: ['search', 'products', 'e-commerce'],
  version: '1.0.0',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z'
};
```

### 6.2 Webhook-Based Tools

Configure tools that call your endpoints:

```typescript
const webhookTool = {
  name: 'check_inventory',
  description: 'Check product inventory',
  webhook: {
    url: 'https://api.yourcompany.com/inventory',
    method: 'POST',
    headers: {
      'X-API-Key': '${env.YOUR_API_KEY}'
    },
    timeout: 5000,
    retry: {
      attempts: 3,
      backoff: 'exponential'
    }
  }
};
```

### 6.3 Tool Execution Flow

```mermaid
sequenceDiagram
    participant User
    participant Agent
    participant Platform
    participant YourAPI
    
    User->>Agent: "Check inventory for iPhone 15"
    Agent->>Platform: function_call: check_inventory
    Platform->>YourAPI: POST /inventory
    YourAPI-->>Platform: { "available": true, "quantity": 50 }
    Platform-->>Agent: function_result
    Agent->>User: "iPhone 15 is in stock with 50 units"
```

## 7. Integration Patterns

### 7.1 CRM Integration

```typescript
class CRMIntegration {
  constructor(private crmClient: any, private voiceAgent: any) {}
  
  async syncCustomerContext(customerId: string, sessionId: string) {
    // Fetch customer data from CRM
    const customer = await this.crmClient.getCustomer(customerId);
    
    // Update agent session with context
    await this.voiceAgent.sessions.update(sessionId, {
      context: {
        customerName: customer.name,
        customerTier: customer.tier,
        recentOrders: customer.recentOrders,
        preferences: customer.preferences
      }
    });
  }
  
  async logConversation(conversation: any) {
    // Save conversation to CRM
    await this.crmClient.createActivity({
      type: 'voice_conversation',
      customerId: conversation.metadata.customerId,
      summary: conversation.summary,
      transcript: conversation.transcript,
      sentiment: conversation.sentiment
    });
  }
}
```

### 7.2 E-commerce Integration

```typescript
class EcommerceIntegration {
  async setupProductTools() {
    return [
      {
        name: 'search_products',
        handler: async (params) => {
          const products = await this.shopify.products.list({
            query: params.query,
            limit: 5
          });
          return products.map(p => ({
            id: p.id,
            name: p.title,
            price: p.price,
            availability: p.inventory_quantity > 0
          }));
        }
      },
      {
        name: 'add_to_cart',
        handler: async (params) => {
          const cart = await this.shopify.cart.add({
            productId: params.productId,
            quantity: params.quantity
          });
          return {
            success: true,
            cartTotal: cart.total,
            itemCount: cart.item_count
          };
        }
      },
      {
        name: 'checkout',
        handler: async (params) => {
          const checkout = await this.shopify.checkout.create({
            cartId: params.cartId,
            customer: params.customer
          });
          return {
            checkoutUrl: checkout.url,
            orderId: checkout.order_id
          };
        }
      }
    ];
  }
}
```

### 7.3 Support Ticket Integration

```typescript
class SupportIntegration {
  async handleEscalation(conversation: any) {
    // Create support ticket
    const ticket = await this.zendesk.tickets.create({
      subject: `Voice Agent Escalation - ${conversation.id}`,
      description: this.formatTranscript(conversation.transcript),
      priority: this.determinePriority(conversation),
      custom_fields: {
        conversation_id: conversation.id,
        sentiment: conversation.sentiment,
        escalation_reason: conversation.escalation_reason
      }
    });
    
    // Notify agent about ticket
    await this.voiceAgent.sessions.sendMessage(conversation.session_id, {
      type: 'escalation_complete',
      message: `I've created ticket #${ticket.id} for you. A human agent will contact you soon.`,
      ticket_id: ticket.id
    });
  }
}
```

## 8. Webhooks

### 8.1 Webhook Configuration

```typescript
POST /webhooks
Content-Type: application/json

{
  "url": "https://api.yourcompany.com/webhooks/voice-agent",
  "events": [
    "conversation.started",
    "conversation.ended",
    "tool.executed",
    "escalation.triggered"
  ],
  "secret": "your_webhook_secret",
  "headers": {
    "X-Custom-Header": "value"
  }
}
```

### 8.2 Webhook Events

#### Conversation Started
```json
{
  "id": "evt_123",
  "type": "conversation.started",
  "created_at": "2024-01-15T10:00:00Z",
  "data": {
    "conversation_id": "conv_789",
    "deployment_id": "deploy_456",
    "session_id": "sess_abc123",
    "metadata": {
      "user_id": "user_789",
      "channel": "web"
    }
  }
}
```

#### Tool Executed
```json
{
  "id": "evt_124",
  "type": "tool.executed",
  "created_at": "2024-01-15T10:05:00Z",
  "data": {
    "conversation_id": "conv_789",
    "tool_name": "search_products",
    "parameters": {
      "query": "iPhone 15"
    },
    "result": {
      "products": [...]
    },
    "duration_ms": 245
  }
}
```

### 8.3 Webhook Handler Example

```typescript
import express from 'express';

const app = express();

app.post('/webhooks/voice-agent', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-voiceagent-signature'];
  const payload = req.body.toString();
  
  // Verify signature
  if (!verifyWebhookSignature(payload, signature, WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }
  
  const event = JSON.parse(payload);
  
  // Process event asynchronously
  processWebhookEvent(event).catch(console.error);
  
  // Respond immediately
  res.status(200).send('OK');
});

async function processWebhookEvent(event: any) {
  switch (event.type) {
    case 'conversation.started':
      await onConversationStarted(event.data);
      break;
      
    case 'conversation.ended':
      await onConversationEnded(event.data);
      break;
      
    case 'tool.executed':
      await onToolExecuted(event.data);
      break;
      
    case 'escalation.triggered':
      await onEscalation(event.data);
      break;
  }
}
```

## 9. Best Practices

### 9.1 Error Handling

```typescript
class VoiceAgentErrorHandler {
  async handleAPICall<T>(
    operation: () => Promise<T>,
    retries = 3
  ): Promise<T> {
    let lastError: any;
    
    for (let i = 0; i < retries; i++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        
        // Don't retry on client errors
        if (error.status >= 400 && error.status < 500) {
          throw error;
        }
        
        // Exponential backoff
        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }
  
  mapErrorToUserMessage(error: any): string {
    switch (error.code) {
      case 'PRODUCT_NOT_FOUND':
        return "I couldn't find that product. Could you try describing it differently?";
      case 'SERVICE_UNAVAILABLE':
        return "I'm having trouble accessing that information right now. Please try again in a moment.";
      case 'RATE_LIMITED':
        return "I'm processing too many requests. Please wait a moment.";
      default:
        return "I encountered an issue. Let me try a different approach.";
    }
  }
}
```

### 9.2 Performance Optimization

```typescript
class PerformanceOptimizer {
  private cache = new Map<string, CacheEntry>();
  
  async cachedToolExecution(
    toolName: string,
    params: any,
    ttl: number = 300000 // 5 minutes
  ) {
    const cacheKey = `${toolName}:${JSON.stringify(params)}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }
    
    const result = await this.executeTool(toolName, params);
    
    this.cache.set(cacheKey, {
      data: result,
      expires: Date.now() + ttl
    });
    
    return result;
  }
  
  batchRequests<T>(
    items: any[],
    batchSize: number,
    processor: (batch: any[]) => Promise<T[]>
  ): Promise<T[]> {
    const batches = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    
    return Promise.all(
      batches.map(batch => processor(batch))
    ).then(results => results.flat());
  }
}
```

### 9.3 Security Best Practices

```typescript
class SecurityManager {
  // Sanitize user inputs before using in tools
  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML
      .replace(/[\r\n]/g, ' ') // Remove line breaks
      .trim()
      .slice(0, 1000); // Limit length
  }
  
  // Validate tool parameters
  validateToolParams(tool: string, params: any): boolean {
    const schema = this.toolSchemas[tool];
    if (!schema) return false;
    
    return ajv.validate(schema, params);
  }
  
  // Rate limit per user
  async checkRateLimit(userId: string, action: string): Promise<boolean> {
    const key = `rate:${userId}:${action}`;
    const count = await redis.incr(key);
    
    if (count === 1) {
      await redis.expire(key, 60); // 1 minute window
    }
    
    return count <= this.rateLimits[action];
  }
}
```

## 10. Testing & Debugging

### 10.1 Test Environment

```typescript
// Use sandbox environment for testing
const testClient = new VoiceAgentClient({
  apiKey: 'vap_test_your_test_key',
  environment: 'sandbox'
});

// Create test agent
const testAgent = await testClient.agents.create({
  name: 'Test Agent',
  instructions: 'This is a test agent',
  settings: {
    testMode: true,
    mockResponses: true
  }
});
```

### 10.2 Debugging Tools

```typescript
// Enable debug logging
const client = new VoiceAgentClient({
  apiKey: 'your_api_key',
  debug: true,
  logger: {
    request: (config) => console.log('Request:', config),
    response: (response) => console.log('Response:', response),
    error: (error) => console.error('Error:', error)
  }
});

// Conversation replay for debugging
const replay = await client.conversations.replay('conv_789', {
  speed: 2.0, // 2x speed
  breakpoints: ['tool_execution', 'error']
});
```

### 10.3 Integration Testing

```typescript
describe('Voice Agent Integration', () => {
  let client: VoiceAgentClient;
  let testAgent: Agent;
  
  beforeAll(async () => {
    client = new VoiceAgentClient({
      apiKey: process.env.TEST_API_KEY,
      environment: 'sandbox'
    });
    
    testAgent = await client.agents.create({
      name: 'Integration Test Agent',
      tools: [mockProductSearchTool]
    });
  });
  
  test('should handle product search', async () => {
    const session = await client.sessions.create(testAgent.id);
    
    await session.sendMessage('Find me an iPhone 15');
    
    const response = await session.waitForResponse();
    expect(response).toContain('iPhone 15');
    expect(mockProductSearchTool).toHaveBeenCalledWith({
      query: 'iPhone 15'
    });
  });
  
  afterAll(async () => {
    await client.agents.delete(testAgent.id);
  });
});
```

## 11. Migration Guide

### 11.1 Migrating from Other Platforms

```typescript
class MigrationHelper {
  async migrateFromDialogflow(projectId: string) {
    const intents = await this.exportDialogflowIntents(projectId);
    
    const agentConfig = {
      name: `Migrated from Dialogflow ${projectId}`,
      instructions: this.convertIntentsToInstructions(intents),
      tools: this.convertIntentsToTools(intents)
    };
    
    return await this.voiceAgent.agents.create(agentConfig);
  }
  
  convertIntentsToInstructions(intents: any[]): string {
    return intents.map(intent => 
      `When user asks about ${intent.displayName}, ${intent.action}`
    ).join('\n');
  }
  
  convertIntentsToTools(intents: any[]): Tool[] {
    return intents
      .filter(intent => intent.webhookState === 'WEBHOOK_STATE_ENABLED')
      .map(intent => ({
        name: intent.action,
        description: intent.displayName,
        parameters: this.extractParameters(intent)
      }));
  }
}
```

## 12. Support & Resources

### 12.1 SDK Libraries

- **JavaScript/TypeScript**: `npm install @voiceagent/sdk`
- **Python**: `pip install voiceagent`
- **Java**: `com.voiceagent:sdk:1.0.0`
- **Go**: `go get github.com/voiceagent/go-sdk`

### 12.2 Additional Resources

- **API Reference**: https://docs.voiceagent.com/api
- **SDK Documentation**: https://docs.voiceagent.com/sdks
- **Example Projects**: https://github.com/voiceagent/examples
- **Community Forum**: https://community.voiceagent.com
- **Support**: support@voiceagent.com

### 12.3 Rate Limits & Quotas

| Plan | API Calls/Month | Concurrent Sessions | Storage |
|------|-----------------|-------------------|---------|
| Starter | 100,000 | 10 | 10 GB |
| Professional | 1,000,000 | 100 | 100 GB |
| Enterprise | Unlimited | Custom | Custom |

## 13. Appendix

### 13.1 Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| 400 | Bad Request | Check request parameters |
| 401 | Unauthorized | Verify API key |
| 403 | Forbidden | Check permissions |
| 404 | Not Found | Verify resource ID |
| 429 | Rate Limited | Implement backoff |
| 500 | Internal Error | Retry with backoff |
| 503 | Service Unavailable | Check status page |

### 13.2 Supported Languages

- English (en-US, en-GB, en-AU)
- Spanish (es-ES, es-MX)
- French (fr-FR, fr-CA)
- German (de-DE)
- Italian (it-IT)
- Portuguese (pt-BR, pt-PT)
- Japanese (ja-JP)
- Korean (ko-KR)
- Chinese (zh-CN, zh-TW)

### 13.3 Compliance

The Voice Agent Platform is compliant with:
- GDPR (General Data Protection Regulation)
- CCPA (California Consumer Privacy Act)
- SOC 2 Type II
- ISO 27001
- HIPAA (Business Associate Agreement required) 