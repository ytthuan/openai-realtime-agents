// Example of how to integrate the dynamic configuration system with the existing app

import { dynamicAgentLoader, getConfigMetadata, isLocalStorageConfig } from '../lib/dynamicAgentLoader';

// Example 1: Load configuration from JSON file
export async function loadConfigFromJSON() {
  try {
    // Load the sample configuration from the public directory
    const agents = await dynamicAgentLoader.loadFromJSON('/sample-agent-config.json');
    console.log('Loaded agents from JSON:', agents);
    return agents;
  } catch (error) {
    console.error('Failed to load configuration from JSON:', error);
    return null;
  }
}

// Example 2: Load configuration from local storage
export function loadConfigFromLocalStorage(configId: string) {
  try {
    const agents = dynamicAgentLoader.loadFromLocalStorage(configId);
    console.log('Loaded agents from local storage:', agents);
    return agents;
  } catch (error) {
    console.error('Failed to load configuration from local storage:', error);
    return null;
  }
}

// Example 3: Get all available configurations
export function getAllConfigurations() {
  const allConfigs = dynamicAgentLoader.getAllAvailableConfigs();
  console.log('All available configurations:', Object.keys(allConfigs));
  
  // Display configuration metadata
  Object.keys(allConfigs).forEach(configKey => {
    const metadata = getConfigMetadata(configKey);
    console.log(`${configKey}:`, metadata);
  });
  
  return allConfigs;
}

// Example 4: Enhanced configuration dropdown with dynamic configs
export function getConfigurationOptions() {
  const allConfigs = dynamicAgentLoader.getAllAvailableConfigs();
  
  const options = Object.keys(allConfigs).map(configKey => {
    const metadata = getConfigMetadata(configKey);
    const isCustom = isLocalStorageConfig(configKey);
    
    return {
      key: configKey,
      name: metadata?.name || configKey,
      description: metadata?.description || '',
      isCustom: isCustom,
      agents: allConfigs[configKey],
      createdAt: metadata?.createdAt,
      updatedAt: metadata?.updatedAt
    };
  });
  
  // Sort: built-in first, then custom configurations
  options.sort((a, b) => {
    if (a.isCustom && !b.isCustom) return 1;
    if (!a.isCustom && b.isCustom) return -1;
    return a.name.localeCompare(b.name);
  });
  
  return options;
}

// Example 5: Dynamic configuration selector component helper
export function createConfigurationSelector(onConfigChange: (config: any) => void) {
  const options = getConfigurationOptions();
  
  return {
    options,
    handleChange: (selectedKey: string) => {
      const allConfigs = dynamicAgentLoader.getAllAvailableConfigs();
      const selectedConfig = allConfigs[selectedKey];
      
      if (selectedConfig) {
        onConfigChange(selectedConfig);
      }
    }
  };
}

// Example 6: Usage in a React component (pseudocode)
/*
// In your React component:
import { useEffect, useState } from 'react';
import { getAllConfigurations, createConfigurationSelector } from './examples/dynamic-config-example';

function MyComponent() {
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [configOptions, setConfigOptions] = useState([]);
  
  useEffect(() => {
    // Load all available configurations
    const allConfigs = getAllConfigurations();
    const selector = createConfigurationSelector(setSelectedConfig);
    setConfigOptions(selector.options);
  }, []);
  
  return (
    <div>
      <select onChange={(e) => {
        const selector = createConfigurationSelector(setSelectedConfig);
        selector.handleChange(e.target.value);
      }}>
        {configOptions.map(option => (
          <option key={option.key} value={option.key}>
            {option.name} {option.isCustom ? '(Custom)' : '(Built-in)'}
          </option>
        ))}
      </select>
      
      {selectedConfig && (
        <div>
          <h3>Selected Configuration</h3>
          <p>Agents: {selectedConfig.length}</p>
        </div>
      )}
    </div>
  );
}
*/

// Example 7: Integration with existing App.tsx
export function integrateWithExistingApp() {
  // This shows how to modify the existing App.tsx to use dynamic configurations
  
  // 1. Replace the hardcoded allAgentSets with dynamic loading
  const allAgentSets = dynamicAgentLoader.getAllAvailableConfigs();
  
  // 2. Update the configuration dropdown to show custom configurations
  const configurationOptions = getConfigurationOptions();
  
  // 3. Handle configuration selection
  const handleConfigurationChange = (selectedKey: string) => {
    const allConfigs = dynamicAgentLoader.getAllAvailableConfigs();
    const selectedAgents = allConfigs[selectedKey];
    
    if (selectedAgents) {
      // Update the application state with the selected configuration
      // This would replace the existing logic in App.tsx
      console.log('Selected configuration:', selectedKey);
      console.log('Agents:', selectedAgents);
    }
  };
  
  return {
    allAgentSets,
    configurationOptions,
    handleConfigurationChange
  };
}

// Example 8: Validation and error handling
export function validateConfiguration(configKey: string) {
  try {
    const allConfigs = dynamicAgentLoader.getAllAvailableConfigs();
    const config = allConfigs[configKey];
    
    if (!config) {
      throw new Error(`Configuration '${configKey}' not found`);
    }
    
    if (!Array.isArray(config) || config.length === 0) {
      throw new Error(`Configuration '${configKey}' has no agents`);
    }
    
    // Validate each agent has required properties
    config.forEach((agent, index) => {
      if (!agent.name) {
        throw new Error(`Agent ${index} is missing name`);
      }
      if (!agent.instructions) {
        throw new Error(`Agent '${agent.name}' is missing instructions`);
      }
    });
    
    return { isValid: true, config };
  } catch (error) {
    console.error('Configuration validation failed:', error);
    return { isValid: false, error: (error as Error).message };
  }
}

// Example 9: Configuration statistics
export function getConfigurationStatistics() {
  const allConfigs = dynamicAgentLoader.getAllAvailableConfigs();
  const stats = {
    totalConfigurations: Object.keys(allConfigs).length,
    builtInConfigurations: 0,
    customConfigurations: 0,
    totalAgents: 0,
    configurationDetails: [] as any[]
  };
  
  Object.keys(allConfigs).forEach(configKey => {
    const config = allConfigs[configKey];
    const isCustom = isLocalStorageConfig(configKey);
    const metadata = getConfigMetadata(configKey);
    
    if (isCustom) {
      stats.customConfigurations++;
    } else {
      stats.builtInConfigurations++;
    }
    
    stats.totalAgents += config.length;
    
    stats.configurationDetails.push({
      key: configKey,
      name: metadata?.name || configKey,
      isCustom,
      agentCount: config.length,
      createdAt: metadata?.createdAt,
      updatedAt: metadata?.updatedAt
    });
  });
  
  return stats;
}

// Export all examples for easy use
export const examples = {
  loadConfigFromJSON,
  loadConfigFromLocalStorage,
  getAllConfigurations,
  getConfigurationOptions,
  createConfigurationSelector,
  integrateWithExistingApp,
  validateConfiguration,
  getConfigurationStatistics
};