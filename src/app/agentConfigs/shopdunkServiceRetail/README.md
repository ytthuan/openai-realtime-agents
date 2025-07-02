# ShopDunk Service Retail - Multi-Agent System

A Vietnamese multi-agent customer service system for ShopDunk online store, built using the OpenAI Realtime Agent framework.

## Overview

ShopDunk Service Retail is a sophisticated multi-agent system that provides comprehensive customer service in Vietnamese for the ShopDunk Apple and Samsung retail store. It features specialized agents for different aspects of customer service, seamlessly handing off between agents based on customer needs.

## Agent Architecture

The system consists of 4 specialized agents:

### 1. Authentication Agent (`authentication.ts`)
- **Role**: First point of contact
- **Responsibilities**:
  - Greets customers in Vietnamese
  - Collects basic information (name, phone)
  - Routes customers to appropriate departments
- **Key Features**:
  - Professional yet friendly Vietnamese greeting
  - Basic verification without full OTP
  - Smart routing based on customer intent

### 2. Sales Agent (`sales.ts`)
- **Role**: Product consultation and order processing
- **Responsibilities**:
  - Product search and recommendations
  - Price quotes with Vietnamese formatting
  - Cart management
  - Order placement with OTP verification
- **Tools**:
  - `search_products` - Find products by query
  - `get_product_details` - Detailed product info
  - `get_product_price` - Quick price checks
  - `add_to_cart` / `remove_from_cart` - Cart operations
  - `send_otp` / `verify_otp` - Order security
  - `place_order` - Complete purchases

### 3. Returns Agent (`returns.ts`)
- **Role**: Handle returns and exchanges
- **Name**: Linh (Returns Specialist)
- **Responsibilities**:
  - Order lookup and verification
  - Return policy explanation
  - Return eligibility checking
  - Return request processing
- **Tools**:
  - `lookupOrders` - Find customer orders
  - `retrieveReturnPolicy` - Get current policies
  - `checkReturnEligibility` - Verify return conditions
  - `initiateReturn` - Process return requests

### 4. Support Agent (`support.ts`)
- **Role**: Escalation and complex issue resolution
- **Name**: Minh (Support Manager)
- **Responsibilities**:
  - Handle escalated issues
  - Provide special offers
  - Create compensation packages
  - Access customer history
- **Tools**:
  - `create_special_offer` - Generate customer retention offers
  - `escalate_to_management` - Further escalation
  - `create_compensation` - Process refunds/replacements
  - `get_customer_history` - View customer profile

## File Structure

```
shopdunkServiceRetail/
├── authentication.ts  # Entry point agent
├── sales.ts          # Sales and order processing
├── returns.ts        # Returns and exchanges
├── support.ts        # Escalation handling
├── index.ts          # Agent connections and exports
├── types.ts          # TypeScript type definitions
├── mockData.ts       # Product and customer data
└── README.md         # This file
```

## Key Features

### Language Support
- **100% Vietnamese**: All interactions in natural Vietnamese
- **Proper number formatting**: Prices read as "hai mươi triệu đồng"
- **Cultural appropriateness**: Uses "anh/chị" honorifics
- **Clear pronunciation guidance**: Agent names like "Sốp-đăng" for ShopDunk

### Agent Handoff Flow
1. **Authentication** → Greets and routes to:
   - **Sales**: For product inquiries and purchases
   - **Returns**: For order issues and returns
   - **Support**: For complex problems

2. Each agent can transfer to others when needed:
   - Sales → Returns (when customer asks about old orders)
   - Returns → Support (when standard policy doesn't apply)
   - Any → Authentication (to restart or re-verify)

### Security Features
- Phone number verification at entry
- OTP verification for order placement
- Session-based cart management
- Phone number masking (only show last 4 digits)

## Usage Example

### Customer Journey Example

```
Customer: "Xin chào"
Auth Agent: "Chào mừng đến với ShopDunk. Em có thể giúp gì cho anh chị hôm nay ạ?"

Customer: "Tôi muốn mua iPhone"
Auth Agent: "Dạ cho em xin tên của anh/chị được không ạ?"

Customer: "Nguyễn Văn An"
Auth Agent: "Dạ anh/chị cho em xin số điện thoại để em hỗ trợ tốt hơn ạ."

Customer: "0912345678"
Auth Agent: "Dạ số điện thoại anh/chị nói là 0-9-1-2-3-4-5-6-7-8, đúng không ạ?"

Customer: "Đúng"
Auth Agent: "Dạ vâng, em sẽ chuyển anh/chị sang bộ phận bán hàng để được tư vấn chi tiết hơn ạ."

[Transfer to Sales Agent]

Sales Agent: "Xin chào anh Nguyễn Văn An, em là nhân viên bán hàng ShopDunk. Anh đang quan tâm iPhone nào ạ?"
```

## Configuration

To use this agent set in your application:

```typescript
import { shopdunkServiceRetailScenario } from '@/app/agentConfigs';

// The scenario is now available in the UI dropdown
// Select "shopdunkServiceRetail" from the agent scenarios
```

## Mock Data

The system includes comprehensive mock data:
- 13 products (iPhones, iPads, MacBooks, Samsung devices)
- Product variants (colors, storage options)
- Customer database
- Order history
- Store locations in Vietnam

## Testing

Test different scenarios:
1. **Sales Flow**: Ask about products, add to cart, place order
2. **Returns Flow**: Ask about returning a product
3. **Escalation**: Express dissatisfaction to trigger support
4. **Language**: Test Vietnamese number pronunciation

## Customization

### Adding New Products
Edit `mockData.ts` to add products with Vietnamese names:
```typescript
{
  id: 'NEW-PRODUCT',
  name: 'Product Name',
  nameVi: 'Tên Sản Phẩm',
  // ... other fields
}
```

### Modifying Agent Behavior
Each agent's personality and instructions can be customized in their respective files.

### Changing Handoff Logic
Update the handoff arrays in `index.ts` to modify agent routing.

## Best Practices

1. **Always maintain Vietnamese language** throughout interactions
2. **Use proper honorifics** (anh/chị) consistently
3. **Format prices** in spoken Vietnamese
4. **Confirm critical information** by repeating back
5. **Handle errors gracefully** with helpful Vietnamese messages

## Integration with Guardrails

The system integrates with the guardrails system using the company name 'ShopDunk' for content moderation and policy enforcement.