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

export const shopdunkAgent = new RealtimeAgent({
  name: 'Sales agent',
  voice: 'sage',
  
  instructions: `
# Nhận Dạng
Bạn là trợ lý mua sắm bằng giọng nói cho cửa hàng trực tuyến ShopDunk. Bạn sẽ trả lời bằng tiếng Việt rõ ràng, đơn giản.

# Nhiệm Vụ
- Trả lời câu hỏi về sản phẩm Apple và Samsung
- Cung cấp giá cả hiện tại
- Thêm sản phẩm vào giỏ hàng
- Xem lại giỏ hàng
- Thu thập thông tin khách hàng
- Đặt hàng sau khi xác thực OTP

# Phong Cách
- Thân thiện, chuyên nghiệp
- Câu trả lời ngắn gọn (tối đa 50 từ)
- Không dùng ký tự đặc biệt hoặc emoji
- Đọc giá bằng tiếng Việt (ví dụ: "hai mươi triệu đồng")
- Trước khi thực hiện gọi tools, hãy inform khách hàng "anh chị chờ em chút nhé, em đang tìm kiếm; lấy báo giá; .."

# Quy Trình Làm Việc

## Chào Hỏi
"Chào mừng đến với ShopDunk. Em có thể giúp gì cho anh chị?"


## Tìm Kiếm Sản Phẩm
1. Dùng search_products với từ khóa của khách
2. Mô tả ngắn gọn sản phẩm tìm được
3. Hỏi có muốn biết giá không

## Báo Giá
1. Dùng get_product_price
2. Đọc giá rõ ràng bằng tiếng Việt
3. Luôn hỏi "Bạn có muốn thêm vào giỏ hàng không?"

## Thêm Vào Giỏ
1. Xác nhận sản phẩm và số lượng
2. Nếu có variant (màu, dung lượng), hỏi khách chọn
3. Dùng add_to_cart
4. Xác nhận đã thêm thành công

## Xem Giỏ Hàng
1. Dùng get_cart_contents
2. Liệt kê từng sản phẩm với số lượng
3. Báo tổng tiền

## Đặt Hàng
1. Kiểm tra giỏ hàng không rỗng
2. Nếu chưa có thông tin khách:
   - Hỏi số điện thoại: "Để đặt hàng, xin cho tôi số điện thoại của bạn?"
   - Hỏi tên: "Và tên đầy đủ của bạn nữa ạ?"
   - Gửi OTP: "Tôi đã gửi mã xác nhận đến điện thoại của bạn. Xin hãy đọc mã cho tôi."
3. Xác thực OTP
4. Đặt hàng và báo mã đơn hàng

## Xử Lý Lỗi
- Không tìm thấy: "Tôi không tìm thấy sản phẩm đó. Bạn có thể thử tên khác được không?"
- Hết hàng: "Sản phẩm đó hiện đang hết hàng. Bạn có muốn xem sản phẩm tương tự không?"
- OTP sai: "Mã đó không đúng. Vui lòng kiểm tra và thử lại."

# Lưu Ý Quan Trọng
- Luôn lặp lại số điện thoại và tên để xác nhận
- Không tiết lộ toàn bộ số điện thoại (chỉ 4 số cuối)
- Giữ thông tin khách hàng bảo mật
- Theo dõi ngữ cảnh cuộc hội thoại
- Nếu khách nói "lặp lại", đọc lại câu trả lời trước đó
`,

  tools: [
    // 1. Search products
    tool({
      name: 'search_products',
      description: 'Search for products by query, category, or brand',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query (product name, brand, etc.)',
          },
          category: {
            type: 'string',
            enum: ['smartphones', 'tablets', 'computers', 'accessories'],
            description: 'Product category to filter by',
          },
          max_results: {
            type: 'number',
            description: 'Maximum number of results to return',
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
            message: 'Không tìm thấy sản phẩm nào phù hợp' 
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
            description: 'The product ID',
          },
        },
        required: ['product_id'],
        additionalProperties: false,
      },
      execute: async (input: any) => {
        const { product_id } = input;
        const product = mockProducts.find(p => p.id === product_id);
        
        if (!product) {
          return { error: 'Không tìm thấy sản phẩm' };
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
      description: 'Get current price of a product',
      parameters: {
        type: 'object',
        properties: {
          product_id: {
            type: 'string',
            description: 'The product ID',
          },
        },
        required: ['product_id'],
        additionalProperties: false,
      },
      execute: async (input: any) => {
        const { product_id } = input;
        const product = mockProducts.find(p => p.id === product_id);
        
        if (!product) {
          return { error: 'Không tìm thấy sản phẩm' };
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
            description: 'The product ID',
          },
          quantity: {
            type: 'number',
            description: 'Quantity to add',
            minimum: 1,
          },
          variant: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'Variant ID if product has variants',
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
          return { error: 'Không tìm thấy sản phẩm' };
        }

        // Check stock
        const stockInfo = checkProductStock(product_id, variant?.id);
        if (!stockInfo.available || stockInfo.quantity < quantity) {
          return { error: 'Sản phẩm không đủ hàng' };
        }

        // Find variant if specified
        let selectedVariant = null;
        if (variant?.id && product.variants) {
          selectedVariant = product.variants.find(v => v.id === variant.id);
          if (!selectedVariant) {
            return { error: 'Không tìm thấy phiên bản sản phẩm này' };
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
      description: 'Remove an item from the shopping cart',
      parameters: {
        type: 'object',
        properties: {
          cart_item_id: {
            type: 'string',
            description: 'The cart item ID to remove',
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
          return { error: 'Không tìm thấy giỏ hàng' };
        }

        const cart = activeCarts.get(session.cartId);
        if (!cart) {
          return { error: 'Không tìm thấy giỏ hàng' };
        }

        const itemIndex = cart.items.findIndex(item => item.id === cart_item_id);
        if (itemIndex === -1) {
          return { error: 'Không tìm thấy sản phẩm trong giỏ hàng' };
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
      description: 'Get current cart contents',
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
            message: 'Giỏ hàng trống',
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

    // 7. Capture customer info
    tool({
      name: 'capture_customer_info',
      description: 'Capture customer phone and name',
      parameters: {
        type: 'object',
        properties: {
          phone: {
            type: 'string',
            description: 'Customer phone number',
            pattern: '^0[0-9]{9}$',
          },
          name: {
            type: 'string',
            description: 'Customer full name',
          },
        },
        required: ['phone', 'name'],
        additionalProperties: false,
      },
      execute: async (input: any, details) => {
        const { phone, name } = input;
        const sessionId = (details?.context as any)?.sessionId || 'default';
        
        // Update session
        const session = activeSessions.get(sessionId) || {
          conversationTurns: 0,
          customerVerified: false,
          lastActivityTime: new Date(),
        };
        
        session.customerInfo = { phone, name };
        activeSessions.set(sessionId, session);

        return {
          success: true,
          captured: {
            name: name,
            phoneLastFour: phone.slice(-4),
          },
          message: 'Đã lưu thông tin khách hàng',
        };
      },
    }),

    // 8. Send OTP
    tool({
      name: 'send_otp',
      description: 'Send OTP to customer phone',
      parameters: {
        type: 'object',
        properties: {
          phone: {
            type: 'string',
            description: 'Phone number to send OTP',
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
        console.log(`[Mock SMS] Mã OTP của bạn là: ${otp}`);

        return {
          success: true,
          message: 'Đã gửi mã xác nhận',
          phoneLastFour: phone.slice(-4),
          // For testing only - remove in production
          testOTP: otp,
        };
      },
    }),

    // 9. Verify OTP
    tool({
      name: 'verify_otp',
      description: 'Verify OTP code',
      parameters: {
        type: 'object',
        properties: {
          phone: {
            type: 'string',
            description: 'Phone number',
            pattern: '^0[0-9]{9}$',
          },
          code: {
            type: 'string',
            description: 'OTP code to verify',
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
            error: 'Không tìm thấy mã xác nhận. Vui lòng yêu cầu mã mới.',
          };
        }

        // Check expiry
        if (new Date() > otpSession.expiresAt) {
          activeOTPSessions.delete(phone);
          return {
            success: false,
            error: 'Mã xác nhận đã hết hạn. Vui lòng yêu cầu mã mới.',
          };
        }

        // Check attempts
        if (otpSession.attempts >= 3) {
          activeOTPSessions.delete(phone);
          return {
            success: false,
            error: 'Quá nhiều lần thử sai. Vui lòng yêu cầu mã mới.',
          };
        }

        // Verify code
        if (otpSession.code !== code) {
          otpSession.attempts++;
          return {
            success: false,
            error: 'Mã không đúng. Vui lòng thử lại.',
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
          message: 'Xác thực thành công',
        };
      },
    }),

    // 10. Place order
    tool({
      name: 'place_order',
      description: 'Place an order with cart contents',
      parameters: {
        type: 'object',
        properties: {
          cart_id: {
            type: 'string',
            description: 'Cart ID to place order from',
          },
          customer_info: {
            type: 'object',
            properties: {
              phone: {
                type: 'string',
                description: 'Customer phone',
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
            error: 'Vui lòng xác thực số điện thoại trước khi đặt hàng',
          };
        }

        const cart = activeCarts.get(cart_id);
        if (!cart || cart.items.length === 0) {
          return {
            success: false,
            error: 'Giỏ hàng trống',
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
          message: `Đặt hàng thành công. Mã đơn hàng của bạn là ${orderId}`,
        };
      },
    }),

    // 11. Cancel order
    tool({
      name: 'cancel_order',
      description: 'Cancel an order',
      parameters: {
        type: 'object',
        properties: {
          order_id: {
            type: 'string',
            description: 'Order ID to cancel',
          },
        },
        required: ['order_id'],
        additionalProperties: false,
      },
      execute: async (input: any) => {
        const { order_id } = input;
        
        const order = mockOrders.find(o => o.id === order_id);
        if (!order) {
          return {
            success: false,
            error: 'Không tìm thấy đơn hàng',
          };
        }

        if (order.status !== OrderStatus.PENDING_PAYMENT && order.status !== OrderStatus.PROCESSING) {
          return {
            success: false,
            error: 'Không thể hủy đơn hàng này',
          };
        }

        order.status = OrderStatus.CANCELLED;
        order.updatedAt = new Date().toISOString();

        return {
          success: true,
          orderId: order_id,
          message: 'Đã hủy đơn hàng thành công',
        };
      },
    }),

    // 12. Check stock
    tool({
      name: 'check_stock',
      description: 'Check product stock availability',
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
          return { error: 'Không tìm thấy sản phẩm' };
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
});

export const shopdunkScenario = [shopdunkAgent];
export const shopdunkCompanyName = 'ShopDunk';
export default shopdunkScenario;
