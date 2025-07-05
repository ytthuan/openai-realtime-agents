import { RealtimeAgent } from '@openai/agents/realtime';

export interface JsonRealtimeAgent {
  name: string;
  voice?: string;
  instructions?: string;
  handoffs?: string[]; // names of other agents
  handoffDescription?: string;
}

/**
 * Given a JSON representation (array or object with `agents` property),
 * construct an array of RealtimeAgent instances. The JSON schema is kept
 * intentionally minimal – only properties that can be safely expressed in
 * JSON are supported. Tools and custom execute functions are NOT supported
 * in this dynamic loader for security reasons.
 */
export function parseAgentsFromJson(json: any): RealtimeAgent[] {
  const agentConfigsRaw: unknown[] = Array.isArray(json)
    ? json
    : Array.isArray((json as any)?.agents)
    ? (json as any).agents
    : [];

  if (agentConfigsRaw.length === 0) {
    throw new Error("Invalid agent config JSON – expected an array of agents or an object with an 'agents' array.");
  }

  // Validate and cast
  const agentConfigs: JsonRealtimeAgent[] = agentConfigsRaw.map((item, idx) => {
    if (typeof item !== "object" || item === null) {
      throw new Error(`Agent at index ${idx} is not a valid object`);
    }
    const { name, voice, instructions, handoffs, handoffDescription } = item as Record<string, any>;

    if (!name || typeof name !== "string") {
      throw new Error(`Agent at index ${idx} is missing required 'name' string field.`);
    }
    if (handoffs && !Array.isArray(handoffs)) {
      throw new Error(`'handoffs' for agent '${name}' must be an array of agent names.`);
    }

    return {
      name,
      voice,
      instructions,
      handoffs,
      handoffDescription,
    } as JsonRealtimeAgent;
  });

  // Check for duplicate names
  const nameSet = new Set<string>();
  for (const cfg of agentConfigs) {
    if (nameSet.has(cfg.name)) {
      throw new Error(`Duplicate agent name detected: '${cfg.name}'. Names must be unique.`);
    }
    nameSet.add(cfg.name);
  }

  // First pass – create empty agent instances so references can resolve.
  const agentMap: Record<string, RealtimeAgent> = {};
  for (const cfg of agentConfigs) {
    agentMap[cfg.name] = new RealtimeAgent({
      name: cfg.name,
      voice: cfg.voice ?? 'alloy',
      instructions: cfg.instructions ?? '',
      handoffs: [], // populated in second pass
      tools: [], // dynamic configs do not support tools at the moment
      handoffDescription: cfg.handoffDescription ?? '',
    });
  }

  // Second pass – wire up handoffs.
  for (const cfg of agentConfigs) {
    const instance = agentMap[cfg.name];
    if (!instance) continue;
    const handoffNames = cfg.handoffs ?? [];
    for (const h of handoffNames) {
      const target = agentMap[h];
      if (target) {
        // push into the handoffs array that we created earlier
        (instance.handoffs as RealtimeAgent[]).push(target);
      }
    }
  }

  // Preserve original order
  return agentConfigs.map((cfg) => agentMap[cfg.name]);
}