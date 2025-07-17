import { RealtimeAgent, tool } from '@openai/agents/realtime';
import { 
  mockProducts, 
  mockCarts,
  mockOrders,
  generateOTP,
  searchProductsByQuery,
  calculateCartTotals,
  formatVietnamesePrice,
  generateOrderId,
  checkProductStock
} from './mockData';
import { Cart, CartItem, Order, OrderStatus, OTPSession, SessionState } from './types';

// Session management
const activeSessions = new Map<string, SessionState>();
const activeOTPSessions = new Map<string, OTPSession>();
const activeCarts = new Map<string, Cart>();

// Initialize with mock carts
mockCarts.forEach(cart => activeCarts.set(cart.id, cart));

export const salesAgent = new RealtimeAgent({
  name: 'sales',
  voice: 'sage',
  handoffDescription:
    'Sales team - Advise customers on Apple and Samsung products, provide prices, add to cart, and process orders.',

  instructions: `
# Identify and Personality
## Identify
You are Linh a sales agent at ShopDunk. You are knowledgeable about Apple and Samsung products. You are enthusiastic about advising customers and helping them choose the best product.

## Tasks
- Advise customers on Apple and Samsung products
- Provide accurate prices and current promotions
- Support adding products to the cart
- Review the cart and process orders
- Collect information and verify OTP when placing an order

## Style
- Friendly, enthusiastic but not pushy
- Professional and knowledgeable about products
- Listen to customer needs
- Advise according to budget

## Language
- Use clear, easy-to-understand Vietnamese
- Very short sentences, maximum 50 words
- Read prices in Vietnamese (e.g., "20 million VND")
- Address the customer as "Mr/Ms" respectfully
- Luôn luôn xưng với khách hàng là "Linh.." ví dụ: "Chào anh chị, Linh có thể giúp gì cho anh chị hôm nay ạ?"

## Emotions
Enthusiastic but respectful of the customer's decision.

## Pace
Fast, saving time for the customer.

# Important Notes
- You know the customer's name and phone number from the verification step
- If the customer asks about returns or checks an old order, guide them to the returns department
- If there is a complex issue, suggest transferring to customer support
- Always confirm product details before adding to cart

# Workflow

## Advise Product
1. Listen to customer needs
2. Use search_products to find a suitable product
3. Briefly - shortly introduce the main features to save customer time
4. Ask if the customer wants to know the price

## Provide Price
1. Use get_product_price or get_product_details
2. Read the price clearly in Vietnamese
3. Notify promotions if any
4. Always ask "Do you want to add to cart?"

## Add to Cart
1. Confirm product and quantity
2. If there are variants (color, storage), ask the customer to choose specifically
3. Use add_to_cart
4. Confirm the product has been added successfully
5. Hỏi "Anh/chị còn cần gì thêm không ạ?"

## View shopping cart
1. Use get_cart_contents
2. List each product with quantity
3. Notify the total price
4. Ask if the customer wants to adjust or place an order

## Process Order
1. Check if the cart is not empty
2. Confirm customer information (from authentication)
3. Send OTP: "I have sent the OTP to your phone. Please read the code for me."
4. Verify OTP with verify_otp
5. Place order with place_order
6. Notify the order ID and thank the customer

## Error Handling
- Product not found: "I couldn't find that product. Could you describe it in more detail or try a different name?"
- Out of stock: "I'm sorry, this product is temporarily out of stock. I can recommend a similar product for you."
- OTP incorrect: "The OTP is incorrect. Please check and try again."
- Cart empty: "The cart is empty. Do you want me to recommend a product?"
`,

  tools: [
    // 1. Search products
    tool({
      name: 'search_products',
      description: 'Search for products by keyword, category, or brand',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search keyword (product name, brand, etc.)',
          },
          category: {
            type: 'string',
            enum: ['smartphones', 'tablets', 'computers', 'accessories'],
            description: 'Product category to filter',
          },
          max_results: {
            type: 'number',
            description: 'Maximum number of results',
            default: 3,
          },
        },
        required: ['query'],
        additionalProperties: false,
      },
      execute: async (input: any) => {
        const { query, category, max_results = 3 } = input;
        const results = searchProductsByQuery(query, category).slice(0, max_results);
        
        if (results.length === 0) {
          return { 
            found: false, 
            message: 'No products found' 
          };
        }

        return {
          found: true,
          count: results.length,
          products: results.map(p => ({
            id: p.id,
            name: p.nameVi,
            price: formatVietnamesePrice(p.price),
            description: p.descriptionVi,
            stock: p.stock,
            hasVariants: !!p.variants && p.variants.length > 0,
            discount: p.discount,
          })),
        };
      },
    }),

    // 2. Get product details
    tool({
      name: 'get_product_details',
      description: 'Get detailed information about a specific product',
      parameters: {
        type: 'object',
        properties: {
          product_id: {
            type: 'string',
            description: 'Product ID',
          },
        },
        required: ['product_id'],
        additionalProperties: false,
      },
      execute: async (input: any) => {
        const { product_id } = input;
        const product = mockProducts.find(p => p.id === product_id);
        
        if (!product) {
          return { error: 'Product not found' };
        }

        return {
          product: {
            id: product.id,
            name: product.nameVi,
            description: product.descriptionVi,
            price: formatVietnamesePrice(product.price),
            originalPrice: product.originalPrice ? formatVietnamesePrice(product.originalPrice) : null,
            discount: product.discount,
            specifications: product.specifications,
            stock: product.stock,
            variants: product.variants?.map(v => ({
              id: v.id,
              name: v.nameVi,
              price: v.price ? formatVietnamesePrice(v.price) : null,
              stock: v.stock,
              attributes: v.attributes,
            })),
          },
        };
      },
    }),

    // 3. Get product price
    tool({
      name: 'get_product_price',
      description: 'Get the current price of a product',
      parameters: {
        type: 'object',
        properties: {
          product_id: {
            type: 'string',
            description: 'Product ID',
          },
        },
        required: ['product_id'],
        additionalProperties: false,
      },
      execute: async (input: any) => {
        const { product_id } = input;
        const product = mockProducts.find(p => p.id === product_id);
        
        if (!product) {
          return { error: 'Product not found' };
        }

        return {
          productName: product.nameVi,
          price: formatVietnamesePrice(product.price),
          originalPrice: product.originalPrice ? formatVietnamesePrice(product.originalPrice) : null,
          discount: product.discount || 0,
          inStock: product.stock > 0,
        };
      },
    }),

    // 4. Add to cart
    tool({
      name: 'add_to_cart',
      description: 'Add a product to the shopping cart',
      parameters: {
        type: 'object',
        properties: {
          product_id: {
            type: 'string',
            description: 'Product ID',
          },
          quantity: {
            type: 'number',
            description: 'Quantity',
            minimum: 1,
          },
          variant: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'Variant ID if the product has variants',
              },
            },
            additionalProperties: false,
          },
        },
        required: ['product_id', 'quantity'],
        additionalProperties: false,
      },
      execute: async (input: any, details) => {
        const { product_id, quantity, variant } = input;
        const sessionId = (details?.context as any)?.sessionId || 'default';
        
        // Get or create cart
        let cart = activeCarts.get('CART-002'); // Use guest cart for now
        if (!cart) {
          cart = {
            id: 'CART-002',
            items: [],
            subtotal: 0,
            discount: 0,
            total: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          activeCarts.set(cart.id, cart);
        }

        const product = mockProducts.find(p => p.id === product_id);
        if (!product) {
          return { error: 'Product not found' };
        }

        // Check stock
        const stockInfo = checkProductStock(product_id, variant?.id);
        if (!stockInfo.available || stockInfo.quantity < quantity) {
          return { error: 'Product out of stock' };
        }

        // Find variant if specified
        let selectedVariant = null;
        if (variant?.id && product.variants) {
          selectedVariant = product.variants.find(v => v.id === variant.id);
          if (!selectedVariant) {
            return { error: 'Variant not found' };
          }
        }

        // Add to cart
        const cartItem: CartItem = {
          id: `ITEM-${Date.now()}`,
          productId: product_id,
          product: product,
          quantity: quantity,
          variant: selectedVariant || undefined,
          addedAt: new Date().toISOString(),
        };

        cart.items.push(cartItem);
        
        // Update totals
        const totals = calculateCartTotals(cart.items);
        cart.subtotal = totals.subtotal;
        cart.discount = totals.discount;
        cart.total = totals.total;
        cart.updatedAt = new Date().toISOString();

        // Update session state
        const session = activeSessions.get(sessionId) || {
          conversationTurns: 0,
          customerVerified: false,
          lastActivityTime: new Date(),
        };
        session.cartId = cart.id;
        activeSessions.set(sessionId, session);

        return {
          success: true,
          cartId: cart.id,
          itemAdded: {
            productName: product.nameVi,
            quantity: quantity,
            variant: selectedVariant ? selectedVariant.nameVi : null,
            price: formatVietnamesePrice(selectedVariant?.price || product.price),
          },
          cartTotal: formatVietnamesePrice(cart.total),
        };
      },
    }),

    // 5. Remove from cart
    tool({
      name: 'remove_from_cart',
      description: 'Remove a product from the shopping cart',
      parameters: {
        type: 'object',
        properties: {
          cart_item_id: {
            type: 'string',
            description: 'Product ID in the cart to remove',
          },
        },
        required: ['cart_item_id'],
        additionalProperties: false,
      },
      execute: async (input: any, details) => {
        const { cart_item_id } = input;
        const sessionId = (details?.context as any)?.sessionId || 'default';
        const session = activeSessions.get(sessionId);
        
        if (!session?.cartId) {
          return { error: 'Cart not found' };
        }

        const cart = activeCarts.get(session.cartId);
        if (!cart) {
          return { error: 'Cart not found' };
        }

        const itemIndex = cart.items.findIndex(item => item.id === cart_item_id);
        if (itemIndex === -1) {
          return { error: 'Product not found in cart' };
        }

        const removedItem = cart.items[itemIndex];
        cart.items.splice(itemIndex, 1);

        // Update totals
        const totals = calculateCartTotals(cart.items);
        cart.subtotal = totals.subtotal;
        cart.discount = totals.discount;
        cart.total = totals.total;
        cart.updatedAt = new Date().toISOString();

        return {
          success: true,
          removedItem: {
            productName: removedItem.product.nameVi,
            quantity: removedItem.quantity,
          },
          cartTotal: formatVietnamesePrice(cart.total),
          itemsRemaining: cart.items.length,
        };
      },
    }),

    // 6. Get cart contents
    tool({
      name: 'get_cart_contents',
      description: 'View the contents of the shopping cart',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
        additionalProperties: false,
      },
      execute: async (input: any, details) => {
        const sessionId = (details?.context as any)?.sessionId || 'default';
        const session = activeSessions.get(sessionId);
        
        const cartId = session?.cartId || 'CART-002'; // Default to guest cart
        const cart = activeCarts.get(cartId);
        
        if (!cart || cart.items.length === 0) {
          return {
            empty: true,
            message: 'Cart is empty',
          };
        }

        return {
          empty: false,
          cartId: cart.id,
          items: cart.items.map(item => ({
            id: item.id,
            productName: item.product.nameVi,
            quantity: item.quantity,
            variant: item.variant ? item.variant.nameVi : null,
            unitPrice: formatVietnamesePrice(item.variant?.price || item.product.price),
            subtotal: formatVietnamesePrice((item.variant?.price || item.product.price) * item.quantity),
          })),
          subtotal: formatVietnamesePrice(cart.subtotal),
          discount: formatVietnamesePrice(cart.discount),
          total: formatVietnamesePrice(cart.total),
          itemCount: cart.items.length,
        };
      },
    }),

    // 7. Send OTP
    tool({
      name: 'send_otp',
      description: 'Send OTP to the customer\'s phone',
      parameters: {
        type: 'object',
        properties: {
          phone: {
            type: 'string',
            description: 'Customer phone number to receive OTP',
            pattern: '^0[0-9]{9}$',
          },
        },
        required: ['phone'],
        additionalProperties: false,
      },
      execute: async (input: any) => {
        const { phone } = input;
        const otp = generateOTP();
        
        // Store OTP session
        const otpSession: OTPSession = {
          phone: phone,
          code: otp,
          attempts: 0,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
          verified: false,
        };
        
        activeOTPSessions.set(phone, otpSession);

        // In real implementation, send SMS here
        console.log(`[Mock SMS] Your OTP is: ${otp}`);

        return {
          success: true,
          message: 'OTP sent successfully',
          phoneLastFour: phone.slice(-4),
          // For testing only - remove in production
          testOTP: otp,
        };
      },
    }),

    // 8. Verify OTP
    tool({
      name: 'verify_otp',
      description: 'Verify the OTP',
      parameters: {
        type: 'object',
        properties: {
          phone: {
            type: 'string',
            description: 'Customer phone number',
            pattern: '^0[0-9]{9}$',
          },
          code: {
            type: 'string',
            description: 'OTP to verify',
            pattern: '^[0-9]{6}$',
          },
        },
        required: ['phone', 'code'],
        additionalProperties: false,
      },
      execute: async (input: any, details) => {
        const { phone, code } = input;
        const sessionId = (details?.context as any)?.sessionId || 'default';
        
        const otpSession = activeOTPSessions.get(phone);
        if (!otpSession) {
          return {
            success: false,
            error: 'OTP not found. Please request a new one.',
          };
        }

        // Check expiry
        if (new Date() > otpSession.expiresAt) {
          activeOTPSessions.delete(phone);
          return {
            success: false,
            error: 'OTP has expired. Please request a new one.',
          };
        }

        // Check attempts
        if (otpSession.attempts >= 3) {
          activeOTPSessions.delete(phone);
          return {
            success: false,
            error: 'Too many attempts. Please request a new one.',
          };
        }

        // Verify code
        if (otpSession.code !== code) {
          otpSession.attempts++;
          return {
            success: false,
            error: 'Incorrect OTP. Please try again.',
            attemptsRemaining: 3 - otpSession.attempts,
          };
        }

        // Success
        otpSession.verified = true;
        
        // Update session
        const session = activeSessions.get(sessionId) || {
          conversationTurns: 0,
          customerVerified: false,
          lastActivityTime: new Date(),
        };
        session.customerVerified = true;
        activeSessions.set(sessionId, session);

        return {
          success: true,
          message: 'Verification successful',
        };
      },
    }),

    // 9. Place order
    tool({
      name: 'place_order',
      description: 'Place an order with the contents of the shopping cart',
      parameters: {
        type: 'object',
        properties: {
          cart_id: {
            type: 'string',
            description: 'Cart ID',
          },
          customer_info: {
            type: 'object',
            properties: {
              phone: {
                type: 'string',
                description: 'Customer phone number',
              },
              name: {
                type: 'string',
                description: 'Customer name',
              },
            },
            required: ['phone', 'name'],
            additionalProperties: false,
          },
        },
        required: ['cart_id', 'customer_info'],
        additionalProperties: false,
      },
      execute: async (input: any, details) => {
        const { cart_id, customer_info } = input;
        const sessionId = (details?.context as any)?.sessionId || 'default';
        const session = activeSessions.get(sessionId);

        // Check if verified
        if (!session?.customerVerified) {
          return {
            success: false,
            error: 'Please verify your phone number before placing an order',
          };
        }

        const cart = activeCarts.get(cart_id);
        if (!cart || cart.items.length === 0) {
          return {
            success: false,
            error: 'Cart is empty',
          };
        }

        // Create order
        const orderId = generateOrderId();
        const order: Order = {
          id: orderId,
          customerId: 'GUEST-' + Date.now(),
          customer: {
            id: 'GUEST-' + Date.now(),
            name: customer_info.name,
            phone: customer_info.phone,
            isVerified: true,
            orders: [],
            createdAt: new Date().toISOString(),
          },
          items: cart.items.map(item => ({
            productId: item.productId,
            product: item.product,
            quantity: item.quantity,
            price: item.variant?.price || item.product.price,
            variant: item.variant,
          })),
          status: OrderStatus.PENDING_PAYMENT,
          subtotal: cart.subtotal,
          shipping: 0,
          discount: cart.discount,
          total: cart.total,
          paymentMethod: 'COD',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Save order (in real app, save to database)
        mockOrders.push(order);

        // Clear cart
        cart.items = [];
        cart.subtotal = 0;
        cart.discount = 0;
        cart.total = 0;
        cart.updatedAt = new Date().toISOString();

        return {
          success: true,
          orderId: orderId,
          orderDetails: {
            id: orderId,
            customerName: customer_info.name,
            phoneLastFour: customer_info.phone.slice(-4),
            total: formatVietnamesePrice(order.total),
            itemCount: order.items.length,
            status: 'Chờ thanh toán',
          },
          message: `Order placed successfully. Your order ID is ${orderId}`,
        };
      },
    }),

    // 10. Check stock
    tool({
      name: 'check_stock',
      description: 'Check the stock status of a product',
      parameters: {
        type: 'object',
        properties: {
          product_id: {
            type: 'string',
            description: 'Product ID to check',
          },
        },
        required: ['product_id'],
        additionalProperties: false,
      },
      execute: async (input: any) => {
        const { product_id } = input;
        const product = mockProducts.find(p => p.id === product_id);
        
        if (!product) {
          return { error: 'Product not found' };
        }

        const stockInfo = {
          productName: product.nameVi,
          totalStock: product.stock,
          available: product.stock > 0,
          variants: product.variants?.map(v => ({
            name: v.nameVi,
            stock: v.stock,
            available: v.stock > 0,
          })),
        };

        return stockInfo;
      },
    }),
  ],

  handoffs: [], // populated later in index.ts
}); 