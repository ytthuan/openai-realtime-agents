import { zodTextFormat } from 'openai/helpers/zod';
import { GuardrailOutputZod, GuardrailOutput } from '@/app/types';
import { Input } from 'postcss';

// Validator that calls the /api/responses endpoint to
// validates the realtime output according to moderation policies. 
// This will prevent the realtime model from responding in undesired ways
// By sending it a corrective message and having it redirect the conversation.
export async function runGuardrailClassifier(
  message: string,
  companyName: string = 'newTelco',
): Promise<GuardrailOutput> {
  console.log('[guardrail] Starting classification for message:', message.substring(0, 100) + '...');
  
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

  try {
    console.log('[guardrail] Making API request to /api/responses...');
    const response = await fetch('/api/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        input: messages,
        text: {
          format: zodTextFormat(GuardrailOutputZod, 'output_format'),
        },
      }),
    });

    if (!response.ok) {
      console.error('[guardrail] Server returned an error:', response.status, response.statusText);
      return Promise.reject('Error with runGuardrailClassifier.');
    }

    const data = await response.json();
    console.log('[guardrail] API response received:', JSON.stringify(data, null, 2));

    try {
      // Handle Azure OpenAI chat completions response structure
      let contentToParse;
      if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
        // Azure OpenAI chat completions format
        const rawContent = data.choices[0].message.content;
        console.log('[guardrail] Raw content from Azure OpenAI:', rawContent);
        try {
          contentToParse = JSON.parse(rawContent);
        } catch (jsonError) {
          console.error('[guardrail] Failed to parse JSON from Azure OpenAI response:', jsonError);
          console.error('[guardrail] Raw content was:', rawContent);
          throw new Error('Response content is not valid JSON');
        }
      } else if (data.output_parsed) {
        // Original format (if still used)
        console.log('[guardrail] Using output_parsed format');
        contentToParse = data.output_parsed;
      } else if (typeof data.output_text === 'string') {
        // OpenAI Responses API top-level output_text field
        console.log('[guardrail] Using output_text format');
        try {
          contentToParse = JSON.parse(data.output_text);
        } catch (jsonError) {
          console.error('[guardrail] Failed to parse JSON from Responses API output_text:', jsonError);
          console.error('[guardrail] output_text was:', data.output_text);
          throw new Error('Response content is not valid JSON');
        }
      } else if (
        Array.isArray(data.output) &&
        data.output[0]?.content?.[0]?.text &&
        typeof data.output[0].content[0].text === 'string'
      ) {
        // OpenAI Responses API detailed output structure
        console.log('[guardrail] Using nested output structure');
        const rawText = data.output[0].content[0].text;
        try {
          contentToParse = JSON.parse(rawText);
        } catch (jsonError) {
          console.error('[guardrail] Failed to parse JSON from Responses API nested text:', jsonError);
          console.error('[guardrail] Nested text was:', rawText);
          throw new Error('Response content is not valid JSON');
        }
      } else {
        console.error('[guardrail] Unexpected response format:', data);
        throw new Error('Unable to find parseable content in response');
      }

      console.log('[guardrail] Content to parse:', contentToParse);
      const output = GuardrailOutputZod.parse(contentToParse);
      console.log('[guardrail] Successfully parsed guardrail output:', output);
      return {
        ...output,
        testText: message,
      };
    } catch (error) {
      console.error('[guardrail] Error parsing the message content as GuardrailOutput:', error);
      console.error('[guardrail] Raw data:', data);
      return Promise.reject('Failed to parse guardrail output.');
    }
  } catch (error) {
    console.error('[guardrail] Network or API error:', error);
    return Promise.reject('Network error with runGuardrailClassifier.');
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
      console.log('[guardrail] Executing guardrail for output:', agentOutput.substring(0, 100) + '...');
      console.log('[guardrail] Company name:', companyName);
      
      try {
        const res = await runGuardrailClassifier(agentOutput, companyName);
        const triggered = res.moderationCategory !== 'NONE';
        
        console.log('[guardrail] Guardrail execution completed. Category:', res.moderationCategory, 'Triggered:', triggered);
        
        return {
          tripwireTriggered: triggered,
          outputInfo: res,
        };
      } catch (error) {
        console.error('[guardrail] Guardrail execution failed:', error);
        return {
          tripwireTriggered: false,
          outputInfo: { error: 'guardrail_failed' },
        };
      }
    },
  } as const;
}