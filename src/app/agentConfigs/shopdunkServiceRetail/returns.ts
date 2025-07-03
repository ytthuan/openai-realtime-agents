import { RealtimeAgent, tool, RealtimeItem } from '@openai/agents/realtime';
import { mockOrders, mockCustomers, formatVietnamesePrice } from './mockData';
import { Order, OrderStatus } from './types';

export const returnsAgent = new RealtimeAgent({
  name: 'returns',
  voice: 'shimmer',
  handoffDescription:
    'Returns team - Handle order lookups, return policies, and product return requests.',

  instructions: `
# Identify and Personality
## Identify
You are Minh, the returns team at ShopDunk. You are knowledgeable about Apple and Samsung products. You are enthusiastic about advising customers and helping them choose the best product.

## Tasks
Handle professional return requests, check orders, explain policies, and ensure customers feel supported throughout the process.

## Phong Cách
Understand, patient, and professional. Listen to customer issues and provide appropriate solutions.

## Language
Clear, polite. Explain policies in a way that is easy to understand, avoiding complex terminology.

## Emotions
Understand, patient, and professional. Listen to customer issues and provide appropriate solutions.

## Pacing
Speak at a medium pace—steady and clear. Brief pauses can be used for emphasis, ensuring the customer has time to process your guidance.

## Other details
- You are Minh, the returns team at ShopDunk
- Always confirm order details before processing
- Explain each step clearly in the return process

# Processing Procedure
1. Start by understanding the customer's return reason
2. Lookup order information with phone number
3. Confirm the product to be returned
4. Check return eligibility against the policy
5. Guide the next steps

## Greeting
- Introduce: "Hello, I am Minh from the returns team at ShopDunk"
- Confirm understanding of previous step
- Show willingness to support

## Notify Before Calling Function
- Always notify the customer what you are doing
  - Example: "Let me check the order information for you..."
  - Example: "I'm looking up the return policy for this product..."
- If it takes time, update: "I need a little more time..."

# Determine Return Eligibility
- Lookup order with lookup_order()
- Confirm product and purchase date
- Ask for return reason before checking policy
- Always check the latest policy with retrieve_return_policy()
- Verify eligibility with check_return_eligibility()
- Don't promise anything before confirming officially
- If accepted, guide the next steps in detail

# General Information
- Today's date: ${new Date().toLocaleDateString('vi-VN')}
- ShopDunk has a flexible return policy for Apple and Samsung products
`,

  tools: [
    tool({
      name: 'lookup_order',
      description:
        "Lookup order information by customer phone number",
      parameters: {
        type: 'object',
        properties: {
          phoneNumber: {
            type: 'string',
            description: "Customer phone number",
            pattern: '^0[0-9]{9}$',
          },
        },
        required: ['phoneNumber'],
        additionalProperties: false,
      },
      execute: async (input: any) => {
        const { phoneNumber } = input as { phoneNumber: string };
        
        // Find orders by phone number
        const customerOrders = mockOrders.filter(order => 
          order.customer.phone === phoneNumber
        );
        
        if (customerOrders.length === 0) {
          return {
            found: false,
            message: 'No orders found with this phone number',
          };
        }
        
        return {
          found: true,
          orders: customerOrders.map(order => ({
            order_id: order.id,
            order_date: new Date(order.createdAt).toLocaleDateString('vi-VN'),
            status: order.status === OrderStatus.DELIVERED ? 'Delivered' : 
                   order.status === OrderStatus.PROCESSING ? 'Processing' : 
                   order.status === OrderStatus.PENDING_PAYMENT ? 'Pending Payment' : order.status,
            total: formatVietnamesePrice(order.total),
            items: order.items.map(item => ({
              item_id: item.productId,
              item_name: item.product.nameVi,
              quantity: item.quantity,
              price: formatVietnamesePrice(item.price),
              variant: item.variant ? item.variant.nameVi : null,
            })),
          })),
        };
      },
    }),
    
    tool({
      name: 'retrieve_return_policy',
      description:
        "Get the return policy for a specific product category",
      parameters: {
        type: 'object',
        properties: {
          productCategory: {
            type: 'string',
            description: 'Product category (e.g., iPhone, iPad, MacBook, Samsung)',
          },
        },
        required: ['productCategory'],
        additionalProperties: false,
      },
      execute: async (input: any) => {
        const { productCategory } = input;
        
        // Mock return policy for ShopDunk
        const policies: Record<string, string> = {
          general: `
SHOPDUNK RETURN POLICY

1. RETURN TIME
• Apple products: 14 days from purchase date
• Samsung products: 7 days from purchase date  
• Accessories: 7 days from purchase date

2. RETURN CONDITIONS
• Product is still sealed, in the original box, and has all accessories
• No signs of use
• Has a receipt
• Not activated (for iPhone, iPad)

3. FACTORY ERROR
• 100% refund within 30 days if hardware error
• Warranty according to Apple/Samsung policy if after 30 days
• Error must be confirmed by the warranty center

4. RETURN FEE
• Free if the error is due to the manufacturer
• 5% of the product value if the return is due to personal need

5. PROCESS
• Step 1: Contact hotline or visit the store
• Step 2: Check the product condition
• Step 3: Confirm return and refund within 3-5 working days
`,
          iphone: 'iPhone has a 14-day return time with the condition that the phone is not activated and has all accessories',
          samsung: 'Samsung products can be returned within 7 days with the condition that the product is still sealed and in the original box',
          accessories: 'Accessories can be returned within 7 days if they are still in good condition and have not been used',
        };
        
        return {
          policy: policies.general,
          specificPolicy: policies[productCategory.toLowerCase()] || policies.general,
        };
      },
    }),
    
    tool({
      name: 'check_return_eligibility',
      description: `Check the return eligibility for a specific order`,
      parameters: {
        type: 'object',
        properties: {
          orderId: {
            type: 'string',
            description: "Order ID to check",
          },
          returnReason: {
            type: 'string',
            description: "Customer return reason",
          },
          productCondition: {
            type: 'string',
            description: "Current product condition",
          },
        },
        required: ['orderId', 'returnReason'],
        additionalProperties: false,
      },
      execute: async (input: any, details) => {
        const { orderId, returnReason, productCondition } = input;
        
        // Find the order
        const order = mockOrders.find(o => o.id === orderId);
        if (!order) {
          return { error: 'Order not found' };
        }
        
        // Calculate days since purchase
        const orderDate = new Date(order.createdAt);
        const today = new Date('2024-06-27'); // Current date from instructions
        const daysSincePurchase = Math.floor((today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Determine eligibility
        let eligible = false;
        let reason = '';
        
        // Check time limit based on product type
        const hasAppleProduct = order.items.some(item => 
          item.product.brand.toLowerCase() === 'apple'
        );
        const hasSamsungProduct = order.items.some(item => 
          item.product.brand.toLowerCase() === 'samsung'
        );
        
        const timeLimit = hasAppleProduct ? 14 : 7;
        
        if (daysSincePurchase > timeLimit) {
          eligible = false;
          reason = `Exceeded return time (${timeLimit} days)`;
        } else if (returnReason.toLowerCase().includes('lỗi')) {
          eligible = true;
          reason = 'Eligible for return due to product error';
        } else if (productCondition && productCondition.toLowerCase().includes('đã sử dụng')) {
          eligible = false;
          reason = 'Used product is not eligible for return';
        } else {
          eligible = true;
          reason = 'Eligible for return according to policy';
        }
        
        return {
          eligible: eligible,
          reason: reason,
          orderId: orderId,
          daysSincePurchase: daysSincePurchase,
          timeLimit: timeLimit,
          nextSteps: eligible ? 
            'Customer can bring the product to the nearest shop or send it through the postal service' : 
            'Unfortunately, the order does not meet the return conditions',
        };
      },
    }),
    
    tool({
      name: 'initiate_return',
      description: 'Initiate a return request after confirming the eligibility',
      parameters: {
        type: 'object',
        properties: {
          orderId: {
            type: 'string',
            description: 'Order ID',
          },
          returnItems: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                productId: {
                  type: 'string',
                  description: 'Product ID to return',
                },
                quantity: {
                  type: 'number',
                  description: 'Quantity',
                },
              },
              required: ['productId', 'quantity'],
            },
            description: 'List of products to return',
          },
          returnReason: {
            type: 'string',
            description: 'Return reason',
          },
        },
        required: ['orderId', 'returnItems', 'returnReason'],
        additionalProperties: false,
      },
      execute: async (input: any) => {
        const { orderId, returnItems, returnReason } = input;
        
        // Generate return ID
        const returnId = `RET-${Date.now()}`;
        
        return {
          success: true,
          returnId: returnId,
          status: 'Accepted',
          message: 'Return request created successfully',
          nextSteps: [
            'Bring the product and receipt to the nearest ShopDunk store',
            'Or call hotline 1900 1234 to get support for shipping',
            'Processing time: 3-5 working days',
            'Refund through bank transfer',
          ],
        };
      },
    }),
  ],

  handoffs: [], // populated later in index.ts
}); 