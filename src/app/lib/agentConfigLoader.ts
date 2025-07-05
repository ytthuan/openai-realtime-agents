import { RealtimeAgent } from '@openai/agents/realtime';

export interface JsonRealtimeAgent {
  name: string;
  voice?: string;
  instructions?: string;
  handoffs?: string[]; // names of other agents
  handoffDescription?: string;
}

export class AgentConfigValidationError extends Error {
  public errors: string[];
  constructor(errors: string[]) {
    super(errors.join("\n"));
    this.name = "AgentConfigValidationError";
    this.errors = errors;
  }
}

export function validateAgentsJson(json: any): string[] {
  const errors: string[] = [];

  const raw: unknown[] = Array.isArray(json)
    ? json
    : Array.isArray((json as any)?.agents)
    ? (json as any).agents
    : undefined;

  if (!raw) {
    errors.push("Top-level JSON must be an array or { agents: [...] } object.");
    return errors;
  }

  if (raw.length === 0) {
    errors.push("At least one agent definition is required.");
    return errors;
  }

  if (raw.length > 10) {
    errors.push("No more than 10 agents are supported in a single config.");
  }

  const nameRegex = /^[A-Za-z0-9-_]{1,32}$/;
  const seenNames = new Set<string>();

  const ALLOWED_VOICES = ["alloy", "echo", "nova", "shimmer", "sage"] as const;

  raw.forEach((item, idx) => {
    if (typeof item !== "object" || item === null) {
      errors.push(`Agent at index ${idx} is not an object.`);
      return;
    }
    const { name, voice, instructions, handoffs } = item as Record<string, any>;

    if (!name || typeof name !== "string") {
      errors.push(`Agent at index ${idx} is missing string 'name'.`);
    } else {
      if (!nameRegex.test(name)) {
        errors.push(`Agent name '${name}' contains invalid characters or is longer than 32.`);
      }
      if (seenNames.has(name)) {
        errors.push(`Duplicate agent name '${name}'.`);
      } else {
        seenNames.add(name);
      }
    }

    if (!instructions || typeof instructions !== "string" || !instructions.trim()) {
      errors.push(`Agent '${name || idx}' must include non-empty 'instructions'.`);
    } else if (instructions.length > 2000) {
      errors.push(`'instructions' for agent '${name}' exceeds 2,000 characters.`);
    }

    if (voice && !ALLOWED_VOICES.includes(voice)) {
      errors.push(
        `Invalid voice '${voice}' for agent '${name}'. Allowed: ${ALLOWED_VOICES.join(", ")}.`
      );
    }

    if (handoffs && !Array.isArray(handoffs)) {
      errors.push(`'handoffs' for agent '${name}' must be an array.`);
    }
  });

  // Validate handoff references point to known names
  raw.forEach((item, idx) => {
    if (typeof item !== "object" || item === null) return;
    const { name, handoffs } = item as Record<string, any>;
    if (Array.isArray(handoffs)) {
      handoffs.forEach((h: any) => {
        if (typeof h !== "string" || !seenNames.has(h)) {
          errors.push(`Agent '${name}' references unknown handoff target '${h}'.`);
        }
      });
    }
  });

  return errors;
}

/**
 * Given a JSON representation (array or object with `agents` property),
 * construct an array of RealtimeAgent instances. The JSON schema is kept
 * intentionally minimal – only properties that can be safely expressed in
 * JSON are supported. Tools and custom execute functions are NOT supported
 * in this dynamic loader for security reasons.
 */
export function parseAgentsFromJson(json: any): RealtimeAgent[] {
  const validationErrors = validateAgentsJson(json);
  if (validationErrors.length) {
    throw new AgentConfigValidationError(validationErrors);
  }

  // Cast after validation
  const agentConfigs: JsonRealtimeAgent[] = Array.isArray(json)
    ? (json as any)
    : (json as any).agents;

  // First pass – create empty agent instances so references can resolve.
  const agentMap: Record<string, RealtimeAgent> = {};
  for (const cfg of agentConfigs) {
    agentMap[cfg.name] = new RealtimeAgent({
      name: cfg.name,
      voice: cfg.voice ?? "alloy",
      instructions: cfg.instructions,
      handoffs: [],
      tools: [],
      handoffDescription: cfg.handoffDescription ?? "",
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