import { agentConfigManager } from './agentConfigManager';
import { allAgentSets } from '../agentConfigs';

export interface DynamicAgentLoader {
  loadFromJSON: (jsonPath: string) => Promise<any>;
  loadFromLocalStorage: (configId: string) => any;
  getAllAvailableConfigs: () => { [key: string]: any };
}

// Create a dynamic loader that can load configurations from various sources
export const dynamicAgentLoader: DynamicAgentLoader = {
  // Load configuration from JSON file
  async loadFromJSON(jsonPath: string) {
    try {
      const response = await fetch(jsonPath);
      if (!response.ok) {
        throw new Error(`Failed to load JSON: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Validate the structure
      if (!data.config || !data.config.agents) {
        throw new Error('Invalid configuration format');
      }
      
      // Convert to RealtimeAgent array
      const agents = agentConfigManager.convertToRealtimeAgents(data.config);
      return agents;
    } catch (error) {
      console.error('Error loading JSON configuration:', error);
      throw error;
    }
  },

  // Load configuration from local storage
  loadFromLocalStorage(configId: string) {
    try {
      const savedConfigs = agentConfigManager.loadConfigs();
      const config = savedConfigs.find(c => c.id === configId);
      
      if (!config) {
        throw new Error(`Configuration with ID ${configId} not found`);
      }
      
      // Convert to RealtimeAgent array
      const agents = agentConfigManager.convertToRealtimeAgents(config.config);
      return agents;
    } catch (error) {
      console.error('Error loading configuration from local storage:', error);
      throw error;
    }
  },

  // Get all available configurations including built-in and saved ones
  getAllAvailableConfigs() {
    const configs: { [key: string]: any } = { ...allAgentSets };
    
    // Add saved configurations from local storage
    const savedConfigs = agentConfigManager.loadConfigs();
    savedConfigs.forEach(config => {
      const agents = agentConfigManager.convertToRealtimeAgents(config.config);
      configs[`saved_${config.id}`] = agents;
    });
    
    return configs;
  }
};

// Utility function to check if a config key is from local storage
export function isLocalStorageConfig(configKey: string): boolean {
  return configKey.startsWith('saved_');
}

// Utility function to get the ID from a local storage config key
export function getLocalStorageConfigId(configKey: string): string {
  return configKey.replace('saved_', '');
}

// Utility function to get config metadata
export function getConfigMetadata(configKey: string) {
  if (isLocalStorageConfig(configKey)) {
    const configId = getLocalStorageConfigId(configKey);
    const savedConfigs = agentConfigManager.loadConfigs();
    const config = savedConfigs.find(c => c.id === configId);
    return config ? {
      name: config.name,
      description: config.description,
      isCustom: true,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt
    } : null;
  }
  
  // For built-in configurations, return basic metadata
  return {
    name: configKey,
    description: 'Built-in configuration',
    isCustom: false
  };
}