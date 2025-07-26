import { RealtimeAgent, tool } from '@openai/agents/realtime';

export const helpfulAssistantAgent = new RealtimeAgent({
  name: 'helpfulAssistant',
  voice: 'sage',
  handoffDescription: 'A knowledgeable assistant that can help answer any questions or provide information on various topics',
  
  instructions: `
# Personality and Tone
You are a friendly, knowledgeable, and helpful AI assistant. You aim to provide accurate, clear, and comprehensive answers to any questions users may have. You're enthusiastic about helping and learning together with users.

# Greeting (FIRST MESSAGE ONLY)
- Warmly greet the user and introduce yourself
- Example: "Hello! I'm your helpful assistant. I'm here to answer any questions you might have, whether it's about science, history, technology, daily life, or anything else. How can I help you today?"

# Task
Your primary goal is to:
- Answer questions accurately and thoroughly
- Provide helpful explanations and context
- Assist with various tasks like calculations, research, brainstorming, and problem-solving
- Engage in thoughtful conversation while being informative

# Guidelines
- Be conversational and friendly while maintaining professionalism
- If a question is unclear, ask for clarification
- Admit when you're not certain about something
- Provide sources or suggest where to find more information when appropriate
- Break down complex topics into understandable explanations
- Use examples to illustrate points when helpful
- Keep responses concise but comprehensive
- If performing calculations or lookups, explain what you're doing
`,

  tools: [
    tool({
      name: 'performCalculation',
      description: 'Performs mathematical calculations and returns the result',
      parameters: {
        type: 'object',
        properties: {
          expression: {
            type: 'string',
            description: 'The mathematical expression to evaluate (e.g., "2 + 2", "sqrt(16)", "15% of 200")',
          },
        },
        required: ['expression'],
        additionalProperties: false,
      },
      execute: async (input: any) => {
        const { expression } = input as { expression: string };
        
        try {
          // Simple calculation examples - in a real implementation, you'd use a proper math parser
          let result: number;
          
          // Handle percentage calculations
          if (expression.includes('% of')) {
            const match = expression.match(/(\d+(?:\.\d+)?)\s*%\s*of\s*(\d+(?:\.\d+)?)/);
            if (match) {
              const percentage = parseFloat(match[1]);
              const value = parseFloat(match[2]);
              result = (percentage / 100) * value;
              return { result, expression, explanation: `${percentage}% of ${value} = ${result}` };
            }
          }
          
          // Handle basic operations (simplified example)
          // In production, use a proper math expression parser
          const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
          result = Function('"use strict"; return (' + sanitized + ')')();
          
          return { result, expression };
        } catch (error) {
          return { error: 'Unable to calculate expression', expression };
        }
      },
    }),
    
    tool({
      name: 'getCurrentDateTime',
      description: 'Gets the current date and time in various timezones',
      parameters: {
        type: 'object',
        properties: {
          timezone: {
            type: 'string',
            description: 'The timezone to get the time for (e.g., "UTC", "America/New_York", "Asia/Tokyo")',
            default: 'UTC',
          },
        },
        required: [],
        additionalProperties: false,
      },
      execute: async (input: any) => {
        const { timezone = 'UTC' } = input as { timezone?: string };
        
        try {
          const date = new Date();
          const options: Intl.DateTimeFormatOptions = {
            timeZone: timezone,
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            weekday: 'long',
          };
          
          const formattedDate = date.toLocaleString('en-US', options);
          
          return {
            timezone,
            dateTime: formattedDate,
            timestamp: date.toISOString(),
          };
        } catch (error) {
          return { error: 'Invalid timezone', timezone };
        }
      },
    }),
    
    tool({
      name: 'generateList',
      description: 'Generates a list of items based on a category or topic',
      parameters: {
        type: 'object',
        properties: {
          topic: {
            type: 'string',
            description: 'The topic or category to generate a list for',
          },
          count: {
            type: 'number',
            description: 'Number of items to generate (default: 5)',
            default: 5,
          },
        },
        required: ['topic'],
        additionalProperties: false,
      },
      execute: async (input: any) => {
        const { topic, count = 5 } = input as { topic: string; count?: number };
        
        // Example lists based on common topics
        const lists: Record<string, string[]> = {
          'productivity tips': [
            'Use the Pomodoro Technique for focused work sessions',
            'Create a morning routine to start your day right',
            'Keep a todo list and prioritize tasks',
            'Minimize distractions by turning off notifications',
            'Take regular breaks to maintain energy',
            'Use time-blocking to schedule your day',
            'Learn to say no to non-essential tasks',
          ],
          'healthy habits': [
            'Drink at least 8 glasses of water daily',
            'Get 7-9 hours of quality sleep',
            'Exercise for at least 30 minutes a day',
            'Eat a balanced diet with plenty of vegetables',
            'Practice meditation or mindfulness',
            'Take regular breaks from screens',
            'Maintain social connections',
          ],
          'learning strategies': [
            'Use spaced repetition for better retention',
            'Teach others what you learn',
            'Take notes by hand for better memory',
            'Create mind maps to visualize concepts',
            'Practice active recall instead of passive reading',
            'Set specific learning goals',
            'Join study groups or learning communities',
          ],
        };
        
        // Find best matching list or generate a generic response
        const normalizedTopic = topic.toLowerCase();
        let items: string[] = [];
        
        for (const [key, value] of Object.entries(lists)) {
          if (normalizedTopic.includes(key) || key.includes(normalizedTopic)) {
            items = value;
            break;
          }
        }
        
        if (items.length === 0) {
          // Generic response for unknown topics
          items = Array.from({ length: count }, (_, i) => `Item ${i + 1} related to ${topic}`);
        }
        
        return {
          topic,
          items: items.slice(0, count),
          totalAvailable: items.length,
        };
      },
    }),
    
    tool({
      name: 'convertUnits',
      description: 'Converts between different units of measurement',
      parameters: {
        type: 'object',
        properties: {
          value: {
            type: 'number',
            description: 'The numeric value to convert',
          },
          fromUnit: {
            type: 'string',
            description: 'The unit to convert from (e.g., "miles", "kg", "celsius")',
          },
          toUnit: {
            type: 'string',
            description: 'The unit to convert to (e.g., "kilometers", "pounds", "fahrenheit")',
          },
        },
        required: ['value', 'fromUnit', 'toUnit'],
        additionalProperties: false,
      },
      execute: async (input: any) => {
        const { value, fromUnit, toUnit } = input as { value: number; fromUnit: string; toUnit: string };
        
        // Conversion factors (simplified - expand as needed)
        const conversions: Record<string, Record<string, number | string>> = {
          // Length
          'miles': { 'kilometers': 1.60934, 'meters': 1609.34, 'feet': 5280 },
          'kilometers': { 'miles': 0.621371, 'meters': 1000, 'feet': 3280.84 },
          'meters': { 'feet': 3.28084, 'inches': 39.3701, 'centimeters': 100 },
          'feet': { 'meters': 0.3048, 'inches': 12, 'yards': 0.333333 },
          
          // Weight
          'kg': { 'pounds': 2.20462, 'grams': 1000, 'ounces': 35.274 },
          'pounds': { 'kg': 0.453592, 'ounces': 16, 'grams': 453.592 },
          
          // Temperature (special handling needed)
          'celsius': { 'fahrenheit': 'special', 'kelvin': 'special' },
          'fahrenheit': { 'celsius': 'special', 'kelvin': 'special' },
        };
        
        const from = fromUnit.toLowerCase();
        const to = toUnit.toLowerCase();
        
        // Handle temperature conversions
        if (from === 'celsius' && to === 'fahrenheit') {
          const result = (value * 9/5) + 32;
          return { originalValue: value, fromUnit, toUnit, result, formula: '(°C × 9/5) + 32' };
        } else if (from === 'fahrenheit' && to === 'celsius') {
          const result = (value - 32) * 5/9;
          return { originalValue: value, fromUnit, toUnit, result, formula: '(°F - 32) × 5/9' };
        } else if (from === 'celsius' && to === 'kelvin') {
          const result = value + 273.15;
          return { originalValue: value, fromUnit, toUnit, result, formula: '°C + 273.15' };
        } else if (from === 'kelvin' && to === 'celsius') {
          const result = value - 273.15;
          return { originalValue: value, fromUnit, toUnit, result, formula: 'K - 273.15' };
        }
        
        // Handle other conversions
        if (conversions[from] && conversions[from][to] && typeof conversions[from][to] === 'number') {
          const factor = conversions[from][to] as number;
          const result = value * factor;
          return { originalValue: value, fromUnit, toUnit, result, conversionFactor: factor };
        }
        
        return { error: 'Conversion not supported', fromUnit, toUnit };
      },
    }),
  ],
  
  handoffs: [],
});

export const helpfulAssistantScenario = [helpfulAssistantAgent]; 