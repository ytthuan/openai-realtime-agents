import { RealtimeAgent } from '@openai/agents/realtime';
import { AgentConfig } from '../types';

export interface AgentConfigSet {
  name: string;
  description: string;
  agents: AgentConfigData[];
}

export interface AgentConfigData {
  name: string;
  voice: string;
  instructions: string;
  handoffDescription: string;
  handoffs: string[]; // Array of agent names to handoff to
  tools: any[]; // For now, keeping as any since tools can be complex
}

export interface SavedAgentConfig {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  config: AgentConfigSet;
}

class AgentConfigManager {
  private readonly storageKey = 'agentConfigs';
  private readonly defaultConfigsKey = 'defaultAgentConfigs';

  // Load configurations from localStorage
  loadConfigs(): SavedAgentConfig[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading agent configurations:', error);
      return [];
    }
  }

  // Save configurations to localStorage
  saveConfigs(configs: SavedAgentConfig[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(configs));
    } catch (error) {
      console.error('Error saving agent configurations:', error);
    }
  }

  // Save a single configuration
  saveConfig(config: AgentConfigSet): SavedAgentConfig {
    const configs = this.loadConfigs();
    const now = new Date().toISOString();
    
    const savedConfig: SavedAgentConfig = {
      id: crypto.randomUUID(),
      name: config.name,
      description: config.description,
      createdAt: now,
      updatedAt: now,
      config: config,
    };

    configs.push(savedConfig);
    this.saveConfigs(configs);
    
    return savedConfig;
  }

  // Update an existing configuration
  updateConfig(id: string, config: AgentConfigSet): SavedAgentConfig | null {
    const configs = this.loadConfigs();
    const index = configs.findIndex(c => c.id === id);
    
    if (index === -1) return null;
    
    const updatedConfig: SavedAgentConfig = {
      ...configs[index],
      name: config.name,
      description: config.description,
      updatedAt: new Date().toISOString(),
      config: config,
    };

    configs[index] = updatedConfig;
    this.saveConfigs(configs);
    
    return updatedConfig;
  }

  // Delete a configuration
  deleteConfig(id: string): boolean {
    const configs = this.loadConfigs();
    const filteredConfigs = configs.filter(c => c.id !== id);
    
    if (filteredConfigs.length === configs.length) return false;
    
    this.saveConfigs(filteredConfigs);
    return true;
  }

  // Convert AgentConfigSet to RealtimeAgent[]
  convertToRealtimeAgents(configSet: AgentConfigSet): RealtimeAgent[] {
    const agentMap = new Map<string, RealtimeAgent>();
    
    // First pass: create all agents
    configSet.agents.forEach(agentData => {
      const agent = new RealtimeAgent({
        name: agentData.name,
        voice: agentData.voice as any,
        instructions: agentData.instructions,
        handoffDescription: agentData.handoffDescription,
        handoffs: [], // Will be populated in second pass
        tools: agentData.tools || [],
      });
      
      agentMap.set(agentData.name, agent);
    });

    // Second pass: set up handoffs
    configSet.agents.forEach(agentData => {
      const agent = agentMap.get(agentData.name);
      if (agent && agentData.handoffs) {
        const handoffAgents = agentData.handoffs
          .map(handoffName => agentMap.get(handoffName))
          .filter(Boolean) as RealtimeAgent[];
        
        agent.handoffs = handoffAgents;
      }
    });

    return Array.from(agentMap.values());
  }

  // Convert RealtimeAgent[] to AgentConfigSet
  convertFromRealtimeAgents(agents: RealtimeAgent[], name: string, description: string): AgentConfigSet {
    const agentConfigs: AgentConfigData[] = agents.map(agent => ({
      name: agent.name,
      voice: agent.voice,
      instructions: agent.instructions,
      handoffDescription: agent.handoffDescription || '',
      handoffs: agent.handoffs?.map((h: any) => h.name) || [],
      tools: agent.tools || [],
    }));

    return {
      name,
      description,
      agents: agentConfigs,
    };
  }

  // Export configuration to JSON file
  exportToFile(config: SavedAgentConfig): void {
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${config.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_config.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  // Import configuration from JSON file
  async importFromFile(file: File): Promise<SavedAgentConfig | null> {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Validate the structure
      if (!data.config || !data.config.name || !data.config.agents) {
        throw new Error('Invalid configuration file format');
      }
      
      // Create a new configuration with a new ID
      const now = new Date().toISOString();
      const importedConfig: SavedAgentConfig = {
        id: crypto.randomUUID(),
        name: data.config.name,
        description: data.config.description || '',
        createdAt: now,
        updatedAt: now,
        config: data.config,
      };

      const configs = this.loadConfigs();
      configs.push(importedConfig);
      this.saveConfigs(configs);
      
      return importedConfig;
    } catch (error) {
      console.error('Error importing configuration:', error);
      return null;
    }
  }
}

export const agentConfigManager = new AgentConfigManager();