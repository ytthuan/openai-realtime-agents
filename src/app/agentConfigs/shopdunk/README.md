# ShopDunk Voice Agent

A Vietnamese e-commerce voice assistant for ShopDunk online store, built using the OpenAI Realtime Agent framework.

## Overview

The ShopDunk agent is a voice-enabled shopping assistant that speaks Vietnamese and helps customers:
- Search for Apple and Samsung products
- Get real-time pricing information
- Add products to cart
- Review cart contents
- Place orders with OTP verification
- Handle product variants (colors, storage sizes)

## Files Structure

```
shopdunk/
├── index.ts         # Main agent configuration with all tools
├── types.ts         # TypeScript type definitions
├── mockData.ts      # Comprehensive mock data for testing
├── testScenarios.ts # Test scenarios and examples
└── README.md        # This file
```

## Mock Data Categories

### 1. Products (13 items)
- **iPhones**: iPhone 15 Pro, iPhone 15, iPhone 14
- **iPads**: iPad Pro M2 12.9"
- **MacBooks**: MacBook Air M2 13"
- **AirPods**: AirPods Pro 2nd Gen, AirPods 3rd Gen
- **Apple Watch**: Series 9
- **Samsung**: Galaxy S23 Ultra, Galaxy Buds2 Pro
- **Accessories**: Cases, chargers, cables

### 2. Product Variants
Most products include variants for:
- **Colors**: Natural Titanium, Blue, Black, etc.
- **Storage**: 128GB, 256GB, 512GB, 1TB
- **Connectivity**: Wi-Fi, Cellular
- **Sizes**: 41mm, 45mm (for watches)

### 3. Customers (5 mock customers)
- Vietnamese names and phone numbers
- Addresses in Ho Chi Minh City and Hanoi
- Verified/unverified status
- Order history

### 4. Shopping Carts (2 carts)
- Active cart with items
- Empty guest cart
- Automatic total calculation

### 5. Orders (3 sample orders)
- Different order statuses
- Payment methods (COD, Bank Transfer, Credit Card)
- Shipping addresses
- Order items with pricing

### 6. Store Locations (6 stores)
- 4 stores in Ho Chi Minh City
- 2 stores in Hanoi
- Complete address and operating hours
- GPS coordinates

## Available Tools

1. **search_products** - Search by name, brand, or category
2. **get_product_details** - Get full product information
3. **get_product_price** - Quick price check
4. **add_to_cart** - Add items with variants
5. **remove_from_cart** - Remove specific items
6. **get_cart_contents** - View current cart
7. **capture_customer_info** - Save customer details
8. **send_otp** - Send verification code
9. **verify_otp** - Verify customer identity
10. **place_order** - Complete purchase
11. **cancel_order** - Cancel pending orders
12. **check_stock** - Check availability

## Voice Interaction Examples

### Basic Flow
```
User: "Xin chào"
Agent: "Chào mừng đến với ShopDunk. Em có thể giúp gì cho anh chị?"

User: "Giá iPhone 15 Pro bao nhiêu?"
Agent: "iPhone 15 Pro hiện có giá hai mươi tám triệu chín trăm chín mươi nghìn đồng. Bạn có muốn thêm vào giỏ hàng không?"

User: "Có, thêm một chiếc màu đen"
Agent: "Bạn muốn chọn dung lượng nào ạ? Chúng em có 128GB, 256GB, 512GB và 1TB."

User: "1TB"
Agent: "Đã thêm một chiếc iPhone 15 Pro Titan Đen 1TB vào giỏ hàng. Còn gì nữa không ạ?"
```

### Order Placement
```
User: "Tôi muốn đặt hàng"
Agent: "Để đặt hàng, xin cho tôi số điện thoại của bạn?"

User: "0912345678"
Agent: "Bạn nói số không chín một hai ba bốn năm sáu bảy tám, đúng không ạ?"

User: "Đúng"
Agent: "Và tên đầy đủ của bạn nữa ạ?"

User: "Nguyễn Văn An"
Agent: "Cảm ơn anh Nguyễn Văn An. Tôi đã gửi mã xác nhận đến điện thoại của bạn. Xin hãy đọc mã cho tôi."
```

## Testing

Run test scenarios:

```typescript
import testScenarios from './testScenarios';

// Run all tests
testScenarios.runAllTests();

// Or run individual tests
testScenarios.testProductSearch();
testScenarios.testCartOperations();
testScenarios.testOrderPlacement();
```

## Key Features

### Vietnamese Language Support
- Natural Vietnamese speech patterns
- Price reading in Vietnamese (e.g., "hai mươi triệu đồng")
- Vietnamese product names and descriptions
- Proper number spelling for phone verification

### Security
- OTP verification for orders
- Phone number masking (only show last 4 digits)
- Session management
- 3 attempts limit for OTP

### Session State Management
- Current product context
- Cart persistence
- Customer verification status
- Conversation history
- Automatic timeout after 10 minutes

### Error Handling
- Product not found
- Out of stock
- Invalid OTP
- Empty cart
- Unverified customer

## Price Formatting

Prices are automatically formatted for voice:
- 28,990,000 VND → "hai mươi tám triệu chín trăm chín mươi nghìn đồng"
- 6,490,000 VND → "sáu phẩy bốn chín triệu đồng"
- 590,000 VND → "năm trăm chín mươi nghìn đồng"

## Customization

To add new products:
1. Add to `mockProducts` array in `mockData.ts`
2. Include Vietnamese name in `nameVi` field
3. Add variants if applicable
4. Set appropriate stock levels

To modify conversation flow:
1. Update instructions in `index.ts`
2. Adjust response templates
3. Modify error messages

## Integration

To use in the main app:
1. Import from `'@/app/agentConfigs'`
2. Select 'shopdunk' scenario
3. Agent will be available with all tools configured 