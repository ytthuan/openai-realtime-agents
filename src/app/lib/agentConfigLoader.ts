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
  const agentConfigs: JsonRealtimeAgent[] = Array.isArray(json)
    ? json
    : Array.isArray(json?.agents)
    ? json.agents
    : [];

  if (agentConfigs.length === 0) {
    throw new Error('No agents found in JSON payload');
  }

  // First pass – create empty agent instances so references can resolve.
  const agentMap: Record<string, RealtimeAgent> = {};
  for (const cfg of agentConfigs) {
    agentMap[cfg.name] = new (RealtimeAgent as any)({
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