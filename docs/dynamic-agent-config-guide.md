# Dynamic Agent Configuration System

This guide explains how to use the dynamic agent configuration system to create, manage, and load agent configurations from JSON files.

## Overview

The dynamic agent configuration system allows you to:
- Create and edit agent configurations through a web UI
- Save configurations to local storage
- Export configurations as JSON files
- Import configurations from JSON files
- Load configurations dynamically at runtime

## Getting Started

### Accessing the Configuration Manager

Navigate to `/config` in your application to access the Agent Configuration Manager UI.

### Creating a New Configuration

1. Click "Create New Configuration" button
2. Enter a name and description for your configuration
3. Add agents by clicking "Add Agent"
4. Configure each agent's properties:
   - **Name**: Unique identifier for the agent
   - **Voice**: Voice type for the agent (alloy, echo, fable, onyx, nova, shimmer, sage)
   - **Instructions**: Detailed instructions for the agent's behavior
   - **Handoff Description**: Description of when this agent should be used
   - **Handoffs**: Other agents this agent can transfer to

### Managing Configurations

- **Edit**: Modify existing configurations
- **Export**: Download configuration as JSON file
- **Delete**: Remove configuration from storage
- **Import**: Load configuration from JSON file (use the "Import JSON" button in the editor)

## Configuration File Format

Agent configurations are stored in JSON format with the following structure:

```json
{
  "id": "unique-config-id",
  "name": "Configuration Name",
  "description": "Configuration description",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "config": {
    "name": "Configuration Name",
    "description": "Configuration description",
    "agents": [
      {
        "name": "agentName",
        "voice": "sage",
        "instructions": "Agent instructions...",
        "handoffDescription": "Description of agent's role",
        "handoffs": ["otherAgentName"],
        "tools": []
      }
    ]
  }
}
```

### Agent Properties

| Property | Type | Description |
|----------|------|-------------|
| `name` | string | Unique identifier for the agent |
| `voice` | string | Voice type (alloy, echo, fable, onyx, nova, shimmer, sage) |
| `instructions` | string | Detailed instructions for agent behavior |
| `handoffDescription` | string | Description of when this agent should be used |
| `handoffs` | string[] | Array of agent names this agent can transfer to |
| `tools` | array | Array of tools available to the agent |

## Loading Configurations Dynamically

### From JSON Files

You can load configurations from JSON files placed in the `public` directory:

```javascript
import { dynamicAgentLoader } from '@/app/lib/dynamicAgentLoader';

// Load from JSON file
const agents = await dynamicAgentLoader.loadFromJSON('/sample-agent-config.json');
```

### From Local Storage

Load configurations saved in the browser's local storage:

```javascript
import { dynamicAgentLoader } from '@/app/lib/dynamicAgentLoader';

// Load from local storage by config ID
const agents = dynamicAgentLoader.loadFromLocalStorage('config-id');
```

### Getting All Available Configurations

```javascript
import { dynamicAgentLoader } from '@/app/lib/dynamicAgentLoader';

// Get all configurations (built-in + saved)
const allConfigs = dynamicAgentLoader.getAllAvailableConfigs();
```

## Integration with Existing System

The dynamic configuration system integrates seamlessly with the existing agent configuration system. All configurations (built-in and dynamic) are available through the same interface.

### Configuration Keys

- Built-in configurations use their original keys (e.g., `chatSupervisor`, `customerServiceRetail`)
- Saved configurations use the format `saved_{configId}`

### Utility Functions

```javascript
import { 
  isLocalStorageConfig, 
  getLocalStorageConfigId, 
  getConfigMetadata 
} from '@/app/lib/dynamicAgentLoader';

// Check if a config is from local storage
const isCustom = isLocalStorageConfig('saved_12345');

// Get config ID from key
const configId = getLocalStorageConfigId('saved_12345');

// Get metadata about a configuration
const metadata = getConfigMetadata('saved_12345');
```

## Best Practices

### Configuration Design

1. **Clear Agent Roles**: Each agent should have a specific, well-defined role
2. **Logical Handoffs**: Design handoff patterns that create smooth user experiences
3. **Comprehensive Instructions**: Provide detailed instructions for consistent behavior
4. **Descriptive Names**: Use clear, descriptive names for agents and configurations

### File Management

1. **Backup Configurations**: Regularly export important configurations as JSON files
2. **Version Control**: Keep track of configuration changes through exports
3. **Naming Conventions**: Use consistent naming conventions for configurations and agents
4. **Documentation**: Document the purpose and use case for each configuration

### Testing

1. **Test Handoffs**: Verify that agent handoffs work as expected
2. **Validate Instructions**: Test agent responses against their instructions
3. **Error Handling**: Test edge cases and error conditions
4. **Performance**: Monitor configuration loading performance

## Troubleshooting

### Common Issues

1. **Configuration Not Loading**: Check JSON file format and location
2. **Agent Not Found**: Verify agent names match exactly in handoff configurations
3. **Local Storage Issues**: Check browser storage limitations and clear if necessary
4. **Import Errors**: Validate JSON format and structure

### Error Messages

- `"Invalid configuration format"`: The JSON structure doesn't match the expected format
- `"Configuration with ID {id} not found"`: The requested configuration doesn't exist in local storage
- `"Failed to load JSON"`: The JSON file couldn't be loaded (check file path and permissions)

### Debug Tips

1. Check browser console for error messages
2. Verify JSON file is accessible (check network tab)
3. Validate JSON format using online validators
4. Test with the provided sample configuration first

## Example Configurations

### Simple Handoff Configuration

```json
{
  "config": {
    "name": "Simple Handoff",
    "description": "Basic two-agent handoff",
    "agents": [
      {
        "name": "greeter",
        "voice": "sage",
        "instructions": "Greet users and ask if they need help. If yes, transfer to helper agent.",
        "handoffDescription": "Initial greeting agent",
        "handoffs": ["helper"],
        "tools": []
      },
      {
        "name": "helper",
        "voice": "alloy",
        "instructions": "Help users with their questions and provide assistance.",
        "handoffDescription": "Main assistance agent",
        "handoffs": [],
        "tools": []
      }
    ]
  }
}
```

### Customer Service Configuration

See the included `public/sample-agent-config.json` for a complete customer service configuration example.

## API Reference

### AgentConfigManager

The main class for managing agent configurations:

```javascript
import { agentConfigManager } from '@/app/lib/agentConfigManager';

// Load all saved configurations
const configs = agentConfigManager.loadConfigs();

// Save a new configuration
const savedConfig = agentConfigManager.saveConfig(configSet);

// Update existing configuration
const updatedConfig = agentConfigManager.updateConfig(id, configSet);

// Delete configuration
const success = agentConfigManager.deleteConfig(id);

// Export to file
agentConfigManager.exportToFile(config);

// Import from file
const importedConfig = await agentConfigManager.importFromFile(file);
```

### DynamicAgentLoader

For loading configurations from various sources:

```javascript
import { dynamicAgentLoader } from '@/app/lib/dynamicAgentLoader';

// Load from JSON
const agents = await dynamicAgentLoader.loadFromJSON('/path/to/config.json');

// Load from local storage
const agents = dynamicAgentLoader.loadFromLocalStorage('config-id');

// Get all available configs
const allConfigs = dynamicAgentLoader.getAllAvailableConfigs();
```

## Support

For issues or questions about the dynamic agent configuration system, please:

1. Check this documentation
2. Review the sample configurations
3. Check the browser console for error messages
4. Test with the provided sample configuration

The system is designed to be robust and user-friendly, with comprehensive error handling and validation.