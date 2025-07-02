import { RealtimeAgent, tool } from '@openai/agents/realtime';

export const supportAgent = new RealtimeAgent({
  name: 'support',
  voice: 'shimmer',
  handoffDescription:
    'Customer support team - Handle complex issues, complaints, and special requests from customers.',
  //'instructions' in english
  instructions: `
# Identify and Personality
## Identify
You are Minh, the head of the customer support team at ShopDunk. With years of experience, you have the ability to handle any complex issues and ensure customer satisfaction.

## Tasks
Handle any complex issues, complaints, or special requests that other departments cannot handle. You have the right to make flexible decisions to keep customers.

## Style
Professional, confident, and experienced. Show deep concern for the customer's issues.

## Language
Standard Vietnamese, polite and friendly. Use professional language but easy to understand.

## Emotions
Understand, patient, and always find the best solution for the customer.

## Introduction
When transferred, always introduce: "Hello, I am Minh, the head of the customer support team at ShopDunk. I have been notified about the issue of Mr/Ms and will do my best to help."

# Special Permissions
- Can review any exceptions to the policy
- Provide flexible solutions to the customer if needed
- Provide special offers to loyal customers
- Handle complaints and ensure customer satisfaction

# Processing Procedure
1. Listen and understand the issue
2. Apologize for the inconvenience (if any)
3. Provide a specific and feasible solution
4. Follow up to ensure the issue is resolved
5. Thank the customer for their patience

# Notes
- Always stand on the customer's side within reasonable limits
- Find a win-win solution for both sides
- Turn dissatisfied customers into loyal customers
- Record feedback to improve service
`
,

  tools: [
    tool({
      name: 'create_special_offer',
      description: 'Create a special offer for the customer to resolve the issue',
      parameters: {
        type: 'object',
        properties: {
          customerPhone: {
            type: 'string',
            description: 'Customer phone number',
          },
          offerType: {
            type: 'string',
            enum: ['discount', 'voucher', 'freeService', 'extended_warranty'],
            description: 'Type of offer',
          },
          offerValue: {
            type: 'string',
            description: 'Value of offer (percentage discount, voucher amount, etc.)',
          },
          reason: {
            type: 'string',
            description: 'Reason for offering',
          },
        },
        required: ['customerPhone', 'offerType', 'offerValue', 'reason'],
        additionalProperties: false,
      },
      execute: async (input: any) => {
        const { customerPhone, offerType, offerValue, reason } = input;
        
        const offerCode = `SHOPDUNK-CARE-${Date.now().toString().slice(-6)}`;
        
        return {
          success: true,
          offerCode: offerCode,
          details: {
            type: offerType === 'discount' ? 'Discount' : 
                  offerType === 'voucher' ? 'Voucher' :
                  offerType === 'freeService' ? 'Free Service' : 'Extended Warranty',
            value: offerValue,
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN'),
          },
          message: 'The offer has been created successfully',
        };
      },
    }),
    
    tool({
      name: 'escalate_to_management',
      description: 'Escalate the issue to a higher level of management if necessary',
      parameters: {
        type: 'object',
        properties: {
          issueDescription: {
            type: 'string',
            description: 'Detailed description of the issue',
          },
          customerInfo: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Customer name',
              },
              phone: {
                type: 'string',
                description: 'Customer phone number',
              },
            },
            required: ['name', 'phone'],
          },
          urgencyLevel: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'critical'],
            description: 'Urgency level',
          },
        },
        required: ['issueDescription', 'customerInfo', 'urgencyLevel'],
        additionalProperties: false,
      },
      execute: async (input: any) => {
        const { issueDescription, customerInfo, urgencyLevel } = input;
        
        const ticketId = `ESC-${Date.now()}`;
        
        return {
          success: true,
          ticketId: ticketId,
          message: 'The issue has been escalated to management',
          expectedResponse: urgencyLevel === 'critical' ? '1 hour' :
                          urgencyLevel === 'high' ? '4 hours' :
                          urgencyLevel === 'medium' ? '24 hours' : '48 hours',
          nextSteps: 'Management will contact the customer directly',
        };
      },
    }),
    
    tool({
      name: 'create_compensation',
      description: 'Create a compensation proposal for the customer',
      parameters: {
        type: 'object',
        properties: {
          orderId: {
            type: 'string',
            description: 'Related order ID',
          },
          compensationType: {
            type: 'string',
            enum: ['partial_refund', 'full_refund', 'replacement', 'credit'],
            description: 'Type of compensation',
          },
          amount: {
            type: 'number',
            description: 'Compensation amount (if applicable)',
          },
          justification: {
            type: 'string',
            description: 'Reason for compensation',
          },
        },
        required: ['orderId', 'compensationType', 'justification'],
        additionalProperties: false,
      },
      execute: async (input: any) => {
        const { orderId, compensationType, amount, justification } = input;
        
        const compensationId = `COMP-${Date.now()}`;
        
        return {
          success: true,
          compensationId: compensationId,
          type: compensationType === 'partial_refund' ? 'Partial refund' :
                compensationType === 'full_refund' ? 'Full refund' :
                compensationType === 'replacement' ? 'Replacement' : 'Credit',
          amount: amount,
          status: 'Approved',
          processTime: '3-5 working days',
        };
      },
    }),
    
    tool({
      name: 'get_customer_history',
      description: 'View the customer\'s purchase history and interactions',
      parameters: {
        type: 'object',
        properties: {
          customerPhone: {
            type: 'string',
            description: 'Customer phone number',
            pattern: '^0[0-9]{9}$',
          },
        },
        required: ['customerPhone'],
        additionalProperties: false,
      },
      execute: async (input: any) => {
        const { customerPhone } = input;
        
        // Mock customer history
        return {
          customerSince: '2022',
          totalOrders: 5,
          totalSpent: '125.000.000 VND',
          loyaltyTier: 'Gold',
          lastOrder: '15/06/2024',
          previousIssues: [
            {
              date: '01/03/2024',
              issue: 'Late delivery',
              resolution: 'Apologized and gave a 500k voucher',
            },
          ],
          notes: 'Loyal customer, needs special care',
        };
      },
    }),
  ],

  handoffs: [], // populated later in index.ts
}); 