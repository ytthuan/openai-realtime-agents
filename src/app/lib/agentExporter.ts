import { AgentBuilderConfig, ExportFormat } from '../types/agentBuilder';

export class AgentExporter {
  static generateTypeScriptCode(config: AgentBuilderConfig): string {
    const instructionsText = this.generateInstructionsText(config);
    
    const toolsCode = config.tools.map(tool => {
      return `    tool({
      name: '${tool.name}',
      description: '${tool.description}',
      parameters: ${JSON.stringify(tool.parameters, null, 8).replace(/^/gm, '      ')},
      execute: async (input: any) => {
${tool.executeCode ? tool.executeCode.replace(/^/gm, '        ') : '        // Tool implementation\n        return { success: true };'}
      }
    })`;
    }).join(',\n');

    const handoffsCode = config.handoffs.length > 0 
      ? `\n  handoffs: [${config.handoffs.map(h => `${h}Agent`).join(', ')}],`
      : '';

    return `import { RealtimeAgent, tool } from '@openai/agents/realtime';

export const ${config.name}Agent = new RealtimeAgent({
  name: '${config.name}',
  voice: '${config.voice}',
  handoffDescription: '${config.handoffDescription}',

  instructions: \`${instructionsText}\`,

  tools: [
${toolsCode}
  ],${handoffsCode}
});`;
  }

  static generateInstructionsText(config: AgentBuilderConfig): string {
    let instructions = '';

    // Personality Section
    instructions += '# Personality and Tone\n';
    instructions += `## Identity\n${config.instructions.personality.identity}\n\n`;
    
    if (config.instructions.personality.demeanor) {
      instructions += `## Demeanor\n${config.instructions.personality.demeanor}\n\n`;
    }
    if (config.instructions.personality.tone) {
      instructions += `## Tone\n${config.instructions.personality.tone}\n\n`;
    }
    if (config.instructions.personality.enthusiasmLevel) {
      instructions += `## Level of Enthusiasm\n${config.instructions.personality.enthusiasmLevel}\n\n`;
    }
    if (config.instructions.personality.formalityLevel) {
      instructions += `## Level of Formality\n${config.instructions.personality.formalityLevel}\n\n`;
    }
    if (config.instructions.personality.emotionLevel) {
      instructions += `## Level of Emotion\n${config.instructions.personality.emotionLevel}\n\n`;
    }
    if (config.instructions.personality.pacing) {
      instructions += `## Pacing\n${config.instructions.personality.pacing}\n\n`;
    }
    if (config.instructions.personality.fillerWords) {
      instructions += `## Filler Words\n${config.instructions.personality.fillerWords}\n\n`;
    }

    // Task Section
    instructions += '# Task\n';
    instructions += `${config.instructions.task}\n\n`;

    // Context Section
    const context = config.instructions.context;
    if (context && (context.businessName || context.hours || context.locations?.length || context.productsServices?.length)) {
      instructions += '# Context\n';
      if (context.businessName) {
        instructions += `- Business name: ${context.businessName}\n`;
      }
      if (context.hours) {
        instructions += `- Hours: ${context.hours}\n`;
      }
      if (context.locations?.length) {
        instructions += '- Locations:\n';
        context.locations.forEach(location => {
          instructions += `  - ${location}\n`;
        });
      }
      if (context.productsServices?.length) {
        instructions += '- Products & Services:\n';
        context.productsServices.forEach(item => {
          instructions += `  - ${item}\n`;
        });
      }
      instructions += '\n';
    }

    // Pronunciations
    if (context?.pronunciations && Object.keys(context.pronunciations).length > 0) {
      instructions += '# Reference Pronunciations\n';
      Object.entries(context.pronunciations).forEach(([word, pronunciation]) => {
        instructions += `- "${word}": ${pronunciation}\n`;
      });
      instructions += '\n';
    }

    // Guidelines
    if (config.instructions.guidelines?.length > 0) {
      instructions += '# Guidelines\n';
      config.instructions.guidelines.forEach(guideline => {
        if (guideline.trim()) {
          instructions += `- ${guideline}\n`;
        }
      });
      instructions += '\n';
    }

    // Conversation States
    if (config.instructions.conversationStates?.length && config.instructions.conversationStates.length > 0) {
      instructions += '# Conversation States\n[\n';
      config.instructions.conversationStates.forEach((state, index) => {
        instructions += '  {\n';
        instructions += `    "id": "${state.id}",\n`;
        instructions += `    "description": "${state.description}",\n`;
        instructions += '    "instructions": [\n';
        state.instructions.forEach(instruction => {
          instructions += `      "${instruction}",\n`;
        });
        instructions += '    ],\n';
        instructions += '    "examples": [\n';
        state.examples.forEach(example => {
          instructions += `      "${example}",\n`;
        });
        instructions += '    ]\n';
        instructions += `  }${index < (config.instructions.conversationStates?.length || 0) - 1 ? ',' : ''}\n`;
      });
      instructions += ']\n\n';
    }

    // Custom Instructions
    if (config.instructions.customInstructions?.trim()) {
      instructions += '# Additional Instructions\n';
      instructions += `${config.instructions.customInstructions}\n\n`;
    }

    return instructions;
  }

  static generateIndexFile(configs: AgentBuilderConfig[], companyName: string): string {
    const imports = configs.map(config => 
      `import { ${config.name}Agent } from './${config.name}';`
    ).join('\n');

    const handoffSetup = configs.map(config => {
      if (config.handoffs.length === 0) return '';
      return `(${config.name}Agent.handoffs as any).push(${config.handoffs.map(h => `${h}Agent`).join(', ')});`;
    }).filter(line => line).join('\n');

    const scenarioArray = configs.map(config => `${config.name}Agent`).join(',\n  ');

    return `${imports}

// Cast to \`any\` to satisfy TypeScript until the core types make RealtimeAgent
// assignable to \`Agent<unknown>\` (current library versions are invariant on
// the context type).
${handoffSetup}

export const customAgentScenario = [
  ${scenarioArray},
];

// Name of the company represented by this agent set. Used by guardrails
export const customAgentCompanyName = '${companyName}';`;
  }

  static generateJSONExport(config: AgentBuilderConfig): ExportFormat {
    return {
      version: '1.0.0',
      agentSet: {
        id: `agent_set_${Date.now()}`,
        name: `${config.name} Agent Set`,
        description: `Generated agent set containing ${config.name}`,
        agents: [config],
        companyName: config.companyName || 'Your Company'
      },
      exportDate: new Date().toISOString()
    };
  }

  static downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static exportAsTypeScript(config: AgentBuilderConfig): void {
    const code = this.generateTypeScriptCode(config);
    this.downloadFile(code, `${config.name}.ts`, 'text/typescript');
  }

  static exportAsJSON(config: AgentBuilderConfig): void {
    const jsonExport = this.generateJSONExport(config);
    const content = JSON.stringify(jsonExport, null, 2);
    this.downloadFile(content, `${config.name}-config.json`, 'application/json');
  }

  static exportInstructionsAsText(config: AgentBuilderConfig): void {
    const instructions = this.generateInstructionsText(config);
    this.downloadFile(instructions, `${config.name}-instructions.txt`, 'text/plain');
  }

  static exportAll(config: AgentBuilderConfig): void {
    // Export TypeScript file
    this.exportAsTypeScript(config);
    
    // Export JSON configuration
    setTimeout(() => this.exportAsJSON(config), 100);
    
    // Export instructions as text
    setTimeout(() => this.exportInstructionsAsText(config), 200);
  }

  static validateConfig(config: AgentBuilderConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.name?.trim()) {
      errors.push('Agent name is required');
    }

    if (!config.handoffDescription?.trim()) {
      errors.push('Handoff description is required');
    }

    if (!config.instructions?.task?.trim()) {
      errors.push('Task description is required');
    }

    if (!config.instructions?.personality?.identity?.trim()) {
      errors.push('Personality identity is required');
    }

    // Validate tools
    config.tools?.forEach((tool, index) => {
      if (!tool.name?.trim()) {
        errors.push(`Tool ${index + 1} name is required`);
      }
      if (!tool.description?.trim()) {
        errors.push(`Tool ${index + 1} description is required`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
} 