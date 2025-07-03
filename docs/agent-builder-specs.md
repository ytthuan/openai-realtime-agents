# Voice Agent Builder UI/UX Specifications

## 1. Introduction

This document outlines the user interface and user experience specifications for the Voice Agent Builder, a visual no-code platform for creating AI voice agents. The design prioritizes ease of use, intuitive workflows, and powerful functionality.

## 2. Design Principles

### 2.1 Core Principles

1. **Intuitive First**: Users should understand how to create a basic agent within 5 minutes
2. **Progressive Disclosure**: Advanced features revealed as users gain expertise
3. **Visual Feedback**: Every action provides immediate visual confirmation
4. **Error Prevention**: Guide users away from mistakes before they happen
5. **Accessibility**: WCAG 2.1 AA compliant for all interactions

### 2.2 Target Users

- **Primary**: Business users with no coding experience
- **Secondary**: Technical users who prefer visual tools
- **Tertiary**: Developers who need rapid prototyping

## 3. Information Architecture

### 3.1 Navigation Structure

```
Dashboard
├── My Agents
│   ├── Active Agents
│   ├── Draft Agents
│   └── Archived Agents
├── Agent Builder
│   ├── Flow Designer
│   ├── Tools & Functions
│   ├── Variables
│   ├── Settings
│   └── Test & Debug
├── Templates
│   ├── Industry Templates
│   ├── Use Case Templates
│   └── My Templates
├── Integrations
│   ├── Connected Services
│   ├── API Connections
│   └── Webhooks
├── Analytics
│   ├── Overview
│   ├── Agent Performance
│   ├── Conversation Logs
│   └── Cost Analysis
└── Settings
    ├── Account
    ├── Team
    ├── Billing
    └── API Keys
```

## 4. Agent Builder Interface

### 4.1 Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Header: Agent Name | Save | Test | Deploy | Settings        │
├─────────────┬───────────────────────────────┬───────────────┤
│             │                               │               │
│   Toolbox   │      Flow Canvas             │   Properties  │
│             │                               │     Panel     │
│  - Nodes    │   ┌─────┐     ┌─────┐       │               │
│  - Tools    │   │Start│────>│Node │       │  - Node       │
│  - Logic    │   └─────┘     └─────┘       │    Settings   │
│  - Actions  │                               │  - Variables  │
│             │                               │  - Help       │
├─────────────┴───────────────────────────────┴───────────────┤
│ Footer: Zoom Controls | Grid | Undo/Redo | Minimap         │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Component Specifications

#### Flow Canvas
```typescript
interface FlowCanvas {
  features: {
    dragAndDrop: true;
    gridSnapping: true;
    zoomRange: [0.25, 2.0];
    panGestures: true;
    multiSelect: true;
    copyPaste: true;
    undoRedo: true;
    autoSave: true;
  };
  
  interactions: {
    nodeConnection: 'drag from port';
    nodeSelection: 'click or box select';
    canvasNavigation: 'middle mouse or spacebar + drag';
    contextMenu: 'right click';
  };
  
  visualFeedback: {
    connectionPreview: 'dotted line';
    validDrop: 'green highlight';
    invalidDrop: 'red highlight';
    selectedNode: 'blue outline';
  };
}
```

#### Node Types
```typescript
interface NodeTypes {
  message: {
    icon: '💬';
    color: '#3B82F6'; // Blue
    ports: {
      input: 1;
      output: 1;
    };
    properties: ['text', 'voice', 'speed', 'emotion'];
  };
  
  input: {
    icon: '👂';
    color: '#10B981'; // Green
    ports: {
      input: 1;
      output: ['text', 'intent', 'timeout'];
    };
    properties: ['expectedType', 'validation', 'timeout'];
  };
  
  decision: {
    icon: '🔀';
    color: '#F59E0B'; // Yellow
    ports: {
      input: 1;
      output: 'dynamic'; // Based on conditions
    };
    properties: ['conditions', 'defaultPath'];
  };
  
  tool: {
    icon: '🔧';
    color: '#8B5CF6'; // Purple
    ports: {
      input: 1;
      output: ['success', 'error'];
    };
    properties: ['toolSelection', 'parameters', 'errorHandling'];
  };
  
  variable: {
    icon: '📦';
    color: '#EC4899'; // Pink
    ports: {
      input: 1;
      output: 1;
    };
    properties: ['operation', 'variableName', 'value'];
  };
}
```

### 4.3 Toolbox Design

```tsx
// Toolbox Component Structure
<Toolbox>
  <SearchBar placeholder="Search nodes..." />
  
  <CategorySection title="Basic" defaultOpen>
    <NodeItem 
      type="message" 
      draggable
      tooltip="Send a message to the user"
    />
    <NodeItem 
      type="input" 
      draggable
      tooltip="Get input from the user"
    />
  </CategorySection>
  
  <CategorySection title="Logic">
    <NodeItem type="decision" />
    <NodeItem type="loop" />
    <NodeItem type="wait" />
  </CategorySection>
  
  <CategorySection title="Tools">
    <NodeItem type="tool" subtype="search" />
    <NodeItem type="tool" subtype="database" />
    <NodeItem type="tool" subtype="api" />
  </CategorySection>
  
  <CategorySection title="Variables">
    <NodeItem type="variable" subtype="set" />
    <NodeItem type="variable" subtype="get" />
  </CategorySection>
</Toolbox>
```

### 4.4 Properties Panel

```tsx
// Dynamic Properties Panel
interface PropertiesPanel {
  sections: {
    general: {
      title: 'General';
      fields: ['name', 'description', 'enabled'];
    };
    
    specific: {
      title: 'Node Settings';
      fields: 'dynamic based on node type';
    };
    
    advanced: {
      title: 'Advanced';
      collapsible: true;
      fields: ['timeout', 'retries', 'errorBehavior'];
    };
  };
  
  fieldTypes: {
    text: TextInput;
    multiline: TextArea;
    select: Dropdown;
    toggle: Switch;
    number: NumberInput;
    json: CodeEditor;
    expression: ExpressionBuilder;
  };
}
```

## 5. Node Configuration UIs

### 5.1 Message Node

```tsx
<MessageNodeConfig>
  <TabGroup>
    <Tab label="Content">
      <TextArea
        label="Message Text"
        placeholder="Type your message here..."
        rows={4}
        variables={true}
        markdown={true}
      />
      
      <VariableInserter
        onInsert={(variable) => insertAtCursor(variable)}
      />
    </Tab>
    
    <Tab label="Voice Settings">
      <Select
        label="Voice"
        options={['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']}
        default="alloy"
      />
      
      <Slider
        label="Speaking Speed"
        min={0.5}
        max={2.0}
        step={0.1}
        default={1.0}
      />
      
      <Select
        label="Emotion"
        options={['neutral', 'happy', 'empathetic', 'professional']}
      />
    </Tab>
    
    <Tab label="Timing">
      <NumberInput
        label="Delay Before (ms)"
        min={0}
        max={5000}
        default={0}
      />
      
      <Toggle
        label="Wait for completion"
        default={true}
      />
    </Tab>
  </TabGroup>
</MessageNodeConfig>
```

### 5.2 Decision Node

```tsx
<DecisionNodeConfig>
  <ConditionBuilder>
    <ConditionGroup operator="AND">
      <Condition
        field={<VariableSelector />}
        operator={<Select options={['equals', 'contains', 'greater', 'less']} />}
        value={<DynamicInput />}
      />
      <AddConditionButton />
    </ConditionGroup>
    
    <AddGroupButton label="Add OR group" />
  </ConditionBuilder>
  
  <OutputPorts>
    {conditions.map((condition, index) => (
      <PortConfig
        key={index}
        label={`If ${condition.summary}`}
        color={getColorForIndex(index)}
      />
    ))}
    <PortConfig
      label="Otherwise"
      color="#6B7280"
      isDefault={true}
    />
  </OutputPorts>
</DecisionNodeConfig>
```

### 5.3 Tool Node Configuration

The tool node supports multiple integration types: MCP, API, and custom code. Based on [Next.js API best practices](https://mydevpa.ge/blog/nextjs-14-api-route-tutorial), we use Next.js 15's enhanced routing for optimal performance.

```tsx
<ToolNodeConfig>
  <TabGroup>
    <Tab label="Tool Selection">
      <IntegrationTypeSelector>
        <RadioGroup
          value={integrationType}
          onChange={setIntegrationType}
        >
          <Radio 
            value="mcp" 
            label="MCP (Model Context Protocol)"
            description="Connect to standardized AI tools"
          />
          <Radio 
            value="api" 
            label="External API"
            description="Direct REST/GraphQL integration"
          />
          <Radio 
            value="code" 
            label="Custom Code"
            description="Deploy serverless functions"
          />
          <Radio 
            value="existing" 
            label="Existing Tool"
            description="Use pre-configured tools"
          />
        </RadioGroup>
      </IntegrationTypeSelector>
      
      {integrationType === 'existing' && (
        <ToolSelector>
          <SearchBar placeholder="Search existing tools..." />
          <FilterTabs>
            <Tab label="All" />
            <Tab label="E-commerce" />
            <Tab label="CRM" />
            <Tab label="Analytics" />
            <Tab label="Custom" />
          </FilterTabs>
          
          <ToolGrid>
            {availableTools.map(tool => (
              <ToolCard
                key={tool.id}
                icon={tool.icon}
                name={tool.name}
                description={tool.description}
                type={tool.integrationMeta.type}
                onClick={() => selectTool(tool)}
              />
            ))}
          </ToolGrid>
        </ToolSelector>
      )}
    </Tab>
    
    <Tab label="Configuration">
      {integrationType === 'mcp' && (
        <MCPConfiguration>
          <Input
            label="Server URL"
            placeholder="mcp://localhost:3001/server"
            value={mcpConfig.serverUrl}
            onChange={(value) => updateMCPConfig('serverUrl', value)}
          />
          
          <Input
            label="Tool Name"
            placeholder="query_database"
            value={mcpConfig.toolName}
            onChange={(value) => updateMCPConfig('toolName', value)}
          />
          
          <AuthenticationSection>
            <Select
              label="Authentication Type"
              options={[
                { value: 'none', label: 'None' },
                { value: 'bearer', label: 'Bearer Token' },
                { value: 'apiKey', label: 'API Key' }
              ]}
              value={mcpConfig.authType}
              onChange={(value) => updateMCPConfig('authType', value)}
            />
            
            {mcpConfig.authType === 'bearer' && (
              <SecretInput
                label="Bearer Token"
                placeholder="Enter bearer token"
                value={mcpConfig.token}
                onChange={(value) => updateMCPConfig('token', value)}
              />
            )}
          </AuthenticationSection>
        </MCPConfiguration>
      )}
      
      {integrationType === 'api' && (
        <APIConfiguration>
          <Input
            label="Endpoint URL"
            placeholder="https://api.example.com/endpoint"
            value={apiConfig.url}
            onChange={(value) => updateAPIConfig('url', value)}
          />
          
          <Select
            label="HTTP Method"
            options={[
              { value: 'GET', label: 'GET' },
              { value: 'POST', label: 'POST' },
              { value: 'PUT', label: 'PUT' },
              { value: 'DELETE', label: 'DELETE' }
            ]}
            value={apiConfig.method}
            onChange={(value) => updateAPIConfig('method', value)}
          />
          
          <HeadersEditor>
            <Label>Headers</Label>
            {apiConfig.headers.map((header, index) => (
              <HeaderRow key={index}>
                <Input
                  placeholder="Header name"
                  value={header.key}
                  onChange={(value) => updateHeader(index, 'key', value)}
                />
                <Input
                  placeholder="Header value"
                  value={header.value}
                  onChange={(value) => updateHeader(index, 'value', value)}
                />
                <Button
                  variant="ghost"
                  onClick={() => removeHeader(index)}
                >
                  Remove
                </Button>
              </HeaderRow>
            ))}
            <Button variant="outline" onClick={addHeader}>
              Add Header
            </Button>
          </HeadersEditor>
          
          <AuthenticationSection>
            <Select
              label="Authentication"
              options={[
                { value: 'none', label: 'None' },
                { value: 'apiKey', label: 'API Key' },
                { value: 'oauth2', label: 'OAuth 2.0' },
                { value: 'basic', label: 'Basic Auth' }
              ]}
              value={apiConfig.authType}
              onChange={(value) => updateAPIConfig('authType', value)}
            />
          </AuthenticationSection>
        </APIConfiguration>
      )}
      
      {integrationType === 'code' && (
        <CodeConfiguration>
          <Select
            label="Runtime"
            options={[
              { value: 'nodejs', label: 'Node.js 20' },
              { value: 'python', label: 'Python 3.11' },
              { value: 'edge', label: 'Edge Runtime' }
            ]}
            value={codeConfig.runtime}
            onChange={(value) => updateCodeConfig('runtime', value)}
          />
          
          <CodeEditor
            label="Function Code"
            language={codeConfig.runtime === 'python' ? 'python' : 'javascript'}
            value={codeConfig.code}
            onChange={(value) => updateCodeConfig('code', value)}
            placeholder={getCodeTemplate(codeConfig.runtime)}
          />
          
          <DependenciesEditor>
            <Label>Dependencies</Label>
            <TagInput
              placeholder="Add package name"
              value={codeConfig.dependencies}
              onChange={(deps) => updateCodeConfig('dependencies', deps)}
            />
          </DependenciesEditor>
          
          <AdvancedSettings>
            <NumberInput
              label="Timeout (seconds)"
              min={1}
              max={300}
              value={codeConfig.timeout}
              onChange={(value) => updateCodeConfig('timeout', value)}
            />
            
            <Select
              label="Memory"
              options={[
                { value: 128, label: '128 MB' },
                { value: 256, label: '256 MB' },
                { value: 512, label: '512 MB' },
                { value: 1024, label: '1 GB' }
              ]}
              value={codeConfig.memory}
              onChange={(value) => updateCodeConfig('memory', value)}
            />
          </AdvancedSettings>
        </CodeConfiguration>
      )}
    </Tab>
    
    <Tab label="Parameters">
      <ParameterBuilder>
        <Label>Tool Parameters</Label>
        <ParameterList>
          {parameters.map((param, index) => (
            <ParameterRow key={index}>
              <Input
                placeholder="Parameter name"
                value={param.name}
                onChange={(value) => updateParameter(index, 'name', value)}
              />
              
              <Select
                placeholder="Type"
                options={[
                  { value: 'string', label: 'String' },
                  { value: 'number', label: 'Number' },
                  { value: 'boolean', label: 'Boolean' },
                  { value: 'object', label: 'Object' },
                  { value: 'array', label: 'Array' }
                ]}
                value={param.type}
                onChange={(value) => updateParameter(index, 'type', value)}
              />
              
              <Toggle
                label="Required"
                checked={param.required}
                onChange={(checked) => updateParameter(index, 'required', checked)}
              />
              
              <Button
                variant="ghost"
                onClick={() => removeParameter(index)}
              >
                Remove
              </Button>
            </ParameterRow>
          ))}
        </ParameterList>
        
        <Button variant="outline" onClick={addParameter}>
          Add Parameter
        </Button>
      </ParameterBuilder>
    </Tab>
    
    <Tab label="Testing">
      <ToolTester>
        <Label>Test Your Tool</Label>
        <TestParameterForm>
          {parameters.map(param => (
            <DynamicField
              key={param.name}
              type={param.type}
              label={param.name}
              required={param.required}
              value={testValues[param.name]}
              onChange={(value) => setTestValue(param.name, value)}
            />
          ))}
        </TestParameterForm>
        
        <Button
          variant="primary"
          onClick={testTool}
          loading={testing}
        >
          Test Tool
        </Button>
        
        {testResult && (
          <TestResult>
            <Label>Result</Label>
            <CodeBlock language="json">
              {JSON.stringify(testResult, null, 2)}
            </CodeBlock>
          </TestResult>
        )}
      </ToolTester>
    </Tab>
  </TabGroup>
  
  <ErrorHandling>
    <Select
      label="On Error"
      options={[
        { value: 'retry', label: 'Retry (up to 3 times)' },
        { value: 'continue', label: 'Continue to error path' },
        { value: 'fail', label: 'End conversation' },
        { value: 'fallback', label: 'Use fallback tool' }
      ]}
      value={errorHandling}
      onChange={setErrorHandling}
    />
    
    {errorHandling === 'fallback' && (
      <Select
        label="Fallback Tool"
        options={availableTools.map(tool => ({
          value: tool.id,
          label: tool.name
        }))}
        value={fallbackTool}
        onChange={setFallbackTool}
      />
    )}
  </ErrorHandling>
</ToolNodeConfig>
```

## 6. Testing Interface

### 6.1 Test Panel Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Test Your Agent                                    [Close X] │
├─────────────────────────┬───────────────────────────────────┤
│                         │                                   │
│   Chat Interface        │         Debug Panel               │
│                         │                                   │
│  ┌───────────────────┐  │  Current Node: [Node Name]       │
│  │ Agent: Hello!     │  │  Variables:                       │
│  │                   │  │    userName: "John"               │
│  │ You: Hi there    │  │    orderCount: 2                  │
│  └───────────────────┘  │                                   │
│                         │  Execution Path:                  │
│  [Text input field]     │  Start → Message → Input → ...    │
│  [🎤] [Send]           │                                   │
│                         │  [View Full Trace]                │
└─────────────────────────┴───────────────────────────────────┘
```

### 6.2 Test Controls

```tsx
<TestControls>
  <TestMode>
    <RadioGroup>
      <Radio value="text" label="Text Only" />
      <Radio value="voice" label="Voice Enabled" />
      <Radio value="debug" label="Debug Mode" />
    </RadioGroup>
  </TestMode>
  
  <TestScenarios>
    <Select
      label="Test Scenario"
      options={[
        'Happy Path',
        'Error Handling',
        'Edge Cases',
        'Custom Scenario'
      ]}
    />
    
    <Button
      icon={<PlayIcon />}
      label="Run Scenario"
      onClick={runScenario}
    />
  </TestScenarios>
  
  <TestVariables>
    <Button
      icon={<SettingsIcon />}
      label="Set Test Variables"
      onClick={openVariableEditor}
    />
  </TestVariables>
</TestControls>
```

## 7. Template System UI

### 7.1 Template Gallery

```tsx
<TemplateGallery>
  <FilterBar>
    <SearchInput placeholder="Search templates..." />
    <CategoryFilter
      options={[
        'All',
        'Customer Service',
        'Sales',
        'Support',
        'Education',
        'Healthcare'
      ]}
    />
    <SortDropdown
      options={[
        'Most Popular',
        'Recently Added',
        'Alphabetical'
      ]}
    />
  </FilterBar>
  
  <TemplateGrid>
    {templates.map(template => (
      <TemplateCard
        key={template.id}
        thumbnail={template.thumbnail}
        title={template.name}
        description={template.description}
        category={template.category}
        rating={template.rating}
        uses={template.uses}
        onClick={() => previewTemplate(template)}
      />
    ))}
  </TemplateGrid>
</TemplateGallery>
```

### 7.2 Template Preview

```tsx
<TemplatePreview>
  <PreviewHeader>
    <BackButton onClick={closePreview} />
    <TemplateTitle>{template.name}</TemplateTitle>
    <ActionButtons>
      <Button variant="secondary" onClick={tryTemplate}>
        Try It
      </Button>
      <Button variant="primary" onClick={useTemplate}>
        Use This Template
      </Button>
    </ActionButtons>
  </PreviewHeader>
  
  <PreviewContent>
    <FlowPreview
      nodes={template.nodes}
      edges={template.edges}
      interactive={false}
      zoom={0.75}
    />
    
    <TemplateDetails>
      <Section title="Description">
        {template.fullDescription}
      </Section>
      
      <Section title="Includes">
        <List>
          <ListItem icon="✓">{template.nodeCount} conversation nodes</ListItem>
          <ListItem icon="✓">{template.toolCount} integrated tools</ListItem>
          <ListItem icon="✓">{template.variableCount} variables</ListItem>
        </List>
      </Section>
      
      <Section title="Required Integrations">
        {template.requiredIntegrations.map(integration => (
          <IntegrationBadge
            key={integration}
            name={integration}
            connected={checkIntegrationStatus(integration)}
          />
        ))}
      </Section>
    </TemplateDetails>
  </PreviewContent>
</TemplatePreview>
```

## 8. Responsive Design

### 8.1 Breakpoints

```scss
$breakpoints: (
  mobile: 640px,
  tablet: 768px,
  desktop: 1024px,
  wide: 1280px
);
```

### 8.2 Mobile Adaptations

```tsx
// Mobile Flow Editor
<MobileFlowEditor>
  <MobileHeader>
    <MenuButton onClick={toggleSidebar} />
    <AgentName />
    <SaveButton />
  </MobileHeader>
  
  <SwipeableViews>
    <View name="Canvas">
      <FlowCanvas
        touchGestures={true}
        pinchZoom={true}
        doubleTapZoom={true}
      />
    </View>
    
    <View name="Toolbox">
      <MobileToolbox
        fullScreen={true}
        searchable={true}
      />
    </View>
    
    <View name="Properties">
      <MobileProperties
        collapsible={true}
        swipeToClose={true}
      />
    </View>
  </SwipeableViews>
  
  <MobileTabBar>
    <Tab icon="canvas" label="Flow" />
    <Tab icon="toolbox" label="Nodes" />
    <Tab icon="settings" label="Properties" />
  </MobileTabBar>
</MobileFlowEditor>
```

## 9. Accessibility

### 9.1 Keyboard Navigation

```typescript
interface KeyboardShortcuts {
  global: {
    'Cmd/Ctrl + S': 'Save agent';
    'Cmd/Ctrl + Z': 'Undo';
    'Cmd/Ctrl + Shift + Z': 'Redo';
    'Cmd/Ctrl + C': 'Copy selected';
    'Cmd/Ctrl + V': 'Paste';
    'Delete': 'Delete selected';
  };
  
  canvas: {
    'Space + Drag': 'Pan canvas';
    'Cmd/Ctrl + Plus': 'Zoom in';
    'Cmd/Ctrl + Minus': 'Zoom out';
    'Cmd/Ctrl + 0': 'Reset zoom';
    'Tab': 'Select next node';
    'Shift + Tab': 'Select previous node';
    'Enter': 'Edit selected node';
  };
  
  nodeEditing: {
    'Escape': 'Close properties';
    'Tab': 'Next field';
    'Shift + Tab': 'Previous field';
    'Cmd/Ctrl + Enter': 'Save and close';
  };
}
```

### 9.2 Screen Reader Support

```tsx
<Node
  role="button"
  tabIndex={0}
  aria-label={`${node.type} node: ${node.label}`}
  aria-describedby={`node-help-${node.id}`}
  aria-selected={isSelected}
  onKeyDown={handleKeyboardInteraction}
>
  <ScreenReaderOnly id={`node-help-${node.id}`}>
    {getNodeDescription(node)}
    Press Enter to edit, Delete to remove
  </ScreenReaderOnly>
</Node>
```

## 10. Design System

### 10.1 Color Palette

```scss
$colors: (
  // Primary
  primary-50: #EFF6FF,
  primary-100: #DBEAFE,
  primary-500: #3B82F6,
  primary-600: #2563EB,
  primary-700: #1D4ED8,
  
  // Neutral
  gray-50: #F9FAFB,
  gray-100: #F3F4F6,
  gray-500: #6B7280,
  gray-700: #374151,
  gray-900: #111827,
  
  // Semantic
  success: #10B981,
  warning: #F59E0B,
  error: #EF4444,
  info: #3B82F6
);
```

### 10.2 Typography

```scss
$typography: (
  // Headings
  h1: (size: 2.25rem, weight: 700, line-height: 2.5rem),
  h2: (size: 1.875rem, weight: 600, line-height: 2.25rem),
  h3: (size: 1.5rem, weight: 600, line-height: 2rem),
  
  // Body
  body: (size: 1rem, weight: 400, line-height: 1.5rem),
  body-small: (size: 0.875rem, weight: 400, line-height: 1.25rem),
  
  // UI
  button: (size: 0.875rem, weight: 500, line-height: 1.25rem),
  caption: (size: 0.75rem, weight: 400, line-height: 1rem)
);
```

### 10.3 Component Library

```tsx
// Button variants
<Button variant="primary" size="medium" icon={<SaveIcon />}>
  Save Agent
</Button>

<Button variant="secondary" size="small" loading>
  Testing...
</Button>

<Button variant="ghost" size="large" disabled>
  Deploy
</Button>

// Form components
<Input
  label="Agent Name"
  placeholder="Enter a name"
  error="Name is required"
  help="This will be displayed to users"
/>

<Select
  label="Voice"
  options={voiceOptions}
  value={selectedVoice}
  onChange={setSelectedVoice}
/>

<Toggle
  label="Enable advanced features"
  checked={advancedMode}
  onChange={setAdvancedMode}
/>
```

## 11. Animation & Transitions

### 11.1 Micro-interactions

```scss
// Node hover effect
.node {
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

// Connection animation
.connection-line {
  stroke-dasharray: 5;
  animation: dash 0.5s linear infinite;
}

@keyframes dash {
  to {
    stroke-dashoffset: -10;
  }
}

// Loading states
.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}
```

### 11.2 Page Transitions

```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={currentView}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.2 }}
  >
    {renderCurrentView()}
  </motion.div>
</AnimatePresence>
```

## 12. Error States & Validation

### 12.1 Inline Validation

```tsx
<FormField>
  <Input
    value={agentName}
    onChange={setAgentName}
    onBlur={validateAgentName}
    error={errors.agentName}
    success={agentName && !errors.agentName}
  />
  {errors.agentName && (
    <ErrorMessage>
      <ErrorIcon /> {errors.agentName}
    </ErrorMessage>
  )}
</FormField>
```

### 12.2 Error Boundaries

```tsx
<ErrorBoundary
  fallback={
    <ErrorState>
      <ErrorIcon size={48} />
      <Heading>Something went wrong</Heading>
      <Text>We couldn't load the agent builder</Text>
      <Button onClick={retry}>Try Again</Button>
    </ErrorState>
  }
>
  <AgentBuilder />
</ErrorBoundary>
```

## 13. Performance Optimizations

### 13.1 Lazy Loading

```tsx
const FlowDesigner = lazy(() => import('./FlowDesigner'));
const TemplateGallery = lazy(() => import('./TemplateGallery'));
const Analytics = lazy(() => import('./Analytics'));

<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/builder" element={<FlowDesigner />} />
    <Route path="/templates" element={<TemplateGallery />} />
    <Route path="/analytics" element={<Analytics />} />
  </Routes>
</Suspense>
```

### 13.2 Virtualization

```tsx
<VirtualizedNodeList
  items={availableNodes}
  itemHeight={60}
  renderItem={(node) => (
    <NodeListItem
      key={node.id}
      node={node}
      onDragStart={handleDragStart}
    />
  )}
/>
```

## 14. Conclusion

This UI/UX specification provides a comprehensive guide for building an intuitive, powerful, and accessible voice agent builder. The design balances simplicity for beginners with advanced features for power users, ensuring broad market appeal and high user satisfaction. 