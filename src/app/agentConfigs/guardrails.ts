import { zodTextFormat } from 'openai/helpers/zod';
import { GuardrailOutputZod, GuardrailOutput } from '@/app/types';

// Validator that calls the /api/responses endpoint to
// validates the realtime output according to moderation policies. 
// This will prevent the realtime model from responding in undesired ways
// By sending it a corrective message and having it redirect the conversation.
export async function runGuardrailClassifier(
  message: string,
  companyName: string = 'newTelco',
): Promise<GuardrailOutput> {
  const messages = [
    {
      role: 'user',
      content: `You are an expert at classifying text according to moderation policies. Consider the provided message, analyze potential classes from output_classes, and output the best classification. Output json, following the provided schema. Keep your analysis and reasoning short and to the point, maximum 2 sentences.

      <info>
      - Company name: ${companyName}
      </info>

      <message>
      ${message}
      </message>

      <output_classes>
      - OFFENSIVE: Content that includes hate speech, discriminatory language, insults, slurs, or harassment.
      - OFF_BRAND: Content that discusses competitors in a disparaging way.
      - VIOLENCE: Content that includes explicit threats, incitement of harm, or graphic descriptions of physical injury or violence.
      - NONE: If no other classes are appropriate and the message is fine.
      </output_classes>
      `,
    },
  ];

  const response = await fetch('/api/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: messages,
      text: {
        format: zodTextFormat(GuardrailOutputZod, 'output_format'),
      },
    }),
  });

  if (!response.ok) {
    console.warn('Server returned an error:', response);
    return Promise.reject('Error with runGuardrailClassifier.');
  }

  const data = await response.json();
  console.log('Guardrail response data:', JSON.stringify(data, null, 2));

  try {
    // Handle Azure OpenAI chat completions response structure
    let contentToParse;
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      // Azure OpenAI chat completions format
      const rawContent = data.choices[0].message.content;
      console.log('Raw content from Azure OpenAI:', rawContent);
      try {
        contentToParse = JSON.parse(rawContent);
      } catch (jsonError) {
        console.error('Failed to parse JSON from Azure OpenAI response:', jsonError);
        console.error('Raw content was:', rawContent);
        throw new Error('Response content is not valid JSON');
      }
    } else if (data.output_parsed) {
      // Original format (if still used)
      contentToParse = data.output_parsed;
    } else {
      console.error('Unexpected response format:', data);
      throw new Error('Unable to find parseable content in response');
    }

    console.log('Content to parse:', contentToParse);
    const output = GuardrailOutputZod.parse(contentToParse);
    return {
      ...output,
      testText: message,
    };
  } catch (error) {
    console.error('Error parsing the message content as GuardrailOutput:', error);
    console.error('Raw data:', data);
    return Promise.reject('Failed to parse guardrail output.');
  }
}

export interface RealtimeOutputGuardrailResult {
  tripwireTriggered: boolean;
  outputInfo: any;
}

export interface RealtimeOutputGuardrailArgs {
  agentOutput: string;
  agent?: any;
  context?: any;
}

// Creates a guardrail bound to a specific company name for output moderation purposes. 
export function createModerationGuardrail(companyName: string) {
  return {
    name: 'moderation_guardrail',

    async execute({ agentOutput }: RealtimeOutputGuardrailArgs): Promise<RealtimeOutputGuardrailResult> {
      try {
        const res = await runGuardrailClassifier(agentOutput, companyName);
        const triggered = res.moderationCategory !== 'NONE';
        return {
          tripwireTriggered: triggered,
          outputInfo: res,
        };
      } catch {
        return {
          tripwireTriggered: false,
          outputInfo: { error: 'guardrail_failed' },
        };
      }
    },
  } as const;
}