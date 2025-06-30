/**
 * ShopDunk Voice Agent Test Scenarios
 * 
 * This file contains comprehensive test scenarios for the ShopDunk voice agent.
 * Each scenario demonstrates different aspects of the e-commerce flow with mock data.
 */

import { 
  mockProducts, 
  mockCustomers, 
  mockCarts,
  mockOrders,
  mockStoreLocations,
  searchProductsByQuery,
  formatVietnamesePrice,
  generateOTP,
  generateOrderId,
  checkProductStock
} from './mockData';

// Test Scenario 1: Product Search
export const testProductSearch = () => {
  console.log('=== Test 1: Product Search ===');
  
  // Search for iPhones
  const iphones = searchProductsByQuery('iphone');
  console.log(`Found ${iphones.length} iPhones:`);
  iphones.forEach(phone => {
    console.log(`- ${phone.nameVi}: ${formatVietnamesePrice(phone.price)}`);
  });
  
  // Search for accessories
  const accessories = searchProductsByQuery('tai nghe', 'accessories');
  console.log(`\nFound ${accessories.length} accessories:`);
  accessories.forEach(acc => {
    console.log(`- ${acc.nameVi}: ${formatVietnamesePrice(acc.price)}`);
  });
  
  // Search with no results
  const noResults = searchProductsByQuery('laptop');
  console.log(`\nSearch for 'laptop': ${noResults.length} results`);
};

// Test Scenario 2: Product Details with Variants
export const testProductDetails = () => {
  console.log('\n=== Test 2: Product Details ===');
  
  // iPhone 15 Pro with variants
  const iphone15Pro = mockProducts[0];
  console.log(`Product: ${iphone15Pro.nameVi}`);
  console.log(`Price: ${formatVietnamesePrice(iphone15Pro.price)}`);
  console.log(`Stock: ${iphone15Pro.stock}`);
  console.log('Variants:');
  iphone15Pro.variants?.forEach(v => {
    console.log(`  - ${v.nameVi}: ${v.price ? formatVietnamesePrice(v.price) : 'Same price'}, Stock: ${v.stock}`);
  });
};

// Test Scenario 3: Cart Operations
export const testCartOperations = () => {
  console.log('\n=== Test 3: Cart Operations ===');
  
  // Mock cart with items
  const cart = mockCarts[0];
  console.log(`Cart ID: ${cart.id}`);
  console.log('Items:');
  cart.items.forEach(item => {
    const price = item.variant?.price || item.product.price;
    console.log(`  - ${item.product.nameVi} x${item.quantity}: ${formatVietnamesePrice(price * item.quantity)}`);
    if (item.variant) {
      console.log(`    Variant: ${item.variant.nameVi}`);
    }
  });
  console.log(`Total: ${formatVietnamesePrice(cart.total)}`);
};

// Test Scenario 4: Customer and OTP Flow
export const testCustomerOTPFlow = () => {
  console.log('\n=== Test 4: Customer & OTP Flow ===');
  
  const customer = mockCustomers[0];
  console.log(`Customer: ${customer.name}`);
  console.log(`Phone: ${customer.phone} (last 4: ${customer.phone.slice(-4)})`);
  
  // Generate OTP
  const otp = generateOTP();
  console.log(`Generated OTP: ${otp}`);
  console.log('OTP expires in 5 minutes');
};

// Test Scenario 5: Order Placement
export const testOrderPlacement = () => {
  console.log('\n=== Test 5: Order Placement ===');
  
  const orderId = generateOrderId();
  console.log(`New Order ID: ${orderId}`);
  
  // Show existing order
  const existingOrder = mockOrders[0];
  console.log(`\nExisting Order: ${existingOrder.id}`);
  console.log(`Customer: ${existingOrder.customer.name}`);
  console.log(`Status: ${existingOrder.status}`);
  console.log(`Total: ${formatVietnamesePrice(existingOrder.total)}`);
};

// Test Scenario 6: Stock Checking
export const testStockChecking = () => {
  console.log('\n=== Test 6: Stock Checking ===');
  
  // Check iPhone 15 Pro stock
  const productId = 'PRD-IP15-PRO-001';
  const variantId = 'VAR-IP15P-1TB-BT'; // Black Titanium 1TB
  
  const stockInfo = checkProductStock(productId, variantId);
  console.log(`Product stock available: ${stockInfo.available}`);
  console.log(`Quantity in stock: ${stockInfo.quantity}`);
  
  // Check out of stock scenario
  const outOfStock = checkProductStock('PRD-INVALID');
  console.log(`\nInvalid product stock: ${outOfStock.available}`);
};

// Test Scenario 7: Store Locations
export const testStoreLocations = () => {
  console.log('\n=== Test 7: Store Locations ===');
  
  console.log('ShopDunk Stores:');
  mockStoreLocations.forEach(store => {
    console.log(`\n${store.name}`);
    console.log(`Address: ${store.address}, ${store.city}`);
    console.log(`Phone: ${store.phone}`);
    console.log(`Hours: ${store.hours}`);
  });
};

// Test Scenario 8: Voice Conversation Samples
export const voiceConversationSamples = {
  greeting: {
    user: "Xin chào",
    agent: "Chào mừng đến với ShopDunk. Em có thể giúp gì cho anh chị?"
  },
  
  searchProduct: {
    user: "Tôi muốn tìm iPhone 15 Pro",
    agent: "Em tìm thấy iPhone 15 Pro với giá hai mươi tám triệu chín trăm chín mươi nghìn đồng. Anh chị có muốn biết thêm chi tiết không?"
  },
  
  askPrice: {
    user: "Giá iPhone 15 bao nhiêu?",
    agent: "iPhone 15 hiện có giá hai mươi hai triệu chín trăm chín mươi nghìn đồng. Bạn có muốn thêm vào giỏ hàng không?"
  },
  
  addToCart: {
    user: "Thêm một chiếc vào giỏ",
    agent: "Đã thêm một chiếc iPhone 15 vào giỏ hàng. Còn gì nữa không ạ?"
  },
  
  viewCart: {
    user: "Xem giỏ hàng",
    agent: "Giỏ hàng của bạn có một chiếc iPhone 15 với tổng giá hai mươi hai triệu chín trăm chín mươi nghìn đồng."
  },
  
  placeOrder: {
    user: "Tôi muốn đặt hàng",
    agent: "Để đặt hàng, xin cho tôi số điện thoại của bạn?"
  },
  
  providePhone: {
    user: "Số của tôi là 0912345678",
    agent: "Bạn nói số không chín một hai ba bốn năm sáu bảy tám, đúng không ạ?"
  },
  
  confirmPhone: {
    user: "Đúng rồi",
    agent: "Và tên đầy đủ của bạn nữa ạ?"
  },
  
  provideName: {
    user: "Tên tôi là Nguyễn Văn An",
    agent: "Cảm ơn anh Nguyễn Văn An. Tôi đã gửi mã xác nhận đến điện thoại của bạn. Xin hãy đọc mã cho tôi."
  },
  
  provideOTP: {
    user: "Mã là 123456",
    agent: "Xác thực thành công. Đặt hàng thành công. Mã đơn hàng của bạn là ORD-20240627-1234."
  },
  
  errorHandling: {
    productNotFound: {
      user: "Tôi muốn mua laptop",
      agent: "Tôi không tìm thấy sản phẩm đó. Bạn có thể thử tên khác được không?"
    },
    
    outOfStock: {
      user: "Thêm 100 chiếc vào giỏ",
      agent: "Sản phẩm không đủ hàng. Bạn có muốn chọn số lượng ít hơn không?"
    },
    
    wrongOTP: {
      user: "Mã là 111111",
      agent: "Mã đó không đúng. Vui lòng kiểm tra và thử lại."
    }
  }
};

// Test Scenario 9: Complex Product Selection with Variants
export const testComplexProductSelection = () => {
  console.log('\n=== Test 9: Complex Product Selection ===');
  
  // Customer wants specific iPhone variant
  console.log('Customer: "Tôi muốn iPhone 15 Pro màu Titan Đen dung lượng 1TB"');
  
  const iphone = mockProducts[0];
  const blackTitanium1TB = iphone.variants?.find(v => 
    v.attributes.color === 'Black Titanium' && 
    v.attributes.storage === '1TB'
  );
  
  if (blackTitanium1TB) {
    console.log(`Agent: "${iphone.nameVi} ${blackTitanium1TB.nameVi} có giá ${formatVietnamesePrice(blackTitanium1TB.price || iphone.price)}. Còn ${blackTitanium1TB.stock} chiếc trong kho."`);
  }
};

// Test Scenario 10: Price Comparison
export const testPriceComparison = () => {
  console.log('\n=== Test 10: Price Comparison ===');
  
  const productsWithDiscount = mockProducts.filter(p => p.discount && p.discount > 0);
  console.log('Products on sale:');
  
  productsWithDiscount.forEach(product => {
    const savings = product.originalPrice ? product.originalPrice - product.price : 0;
    console.log(`\n${product.nameVi}`);
    console.log(`  Original: ${product.originalPrice ? formatVietnamesePrice(product.originalPrice) : 'N/A'}`);
    console.log(`  Sale: ${formatVietnamesePrice(product.price)} (${product.discount}% off)`);
    console.log(`  Savings: ${formatVietnamesePrice(savings)}`);
  });
};

// Run all tests
export const runAllTests = () => {
  console.log('🚀 Running ShopDunk Voice Agent Tests\n');
  
  testProductSearch();
  testProductDetails();
  testCartOperations();
  testCustomerOTPFlow();
  testOrderPlacement();
  testStockChecking();
  testStoreLocations();
  testComplexProductSelection();
  testPriceComparison();
  
  console.log('\n✅ All tests completed!');
  console.log('\n📝 Voice Conversation Samples:');
  console.log(JSON.stringify(voiceConversationSamples, null, 2));
};

// Export for use in testing
const shopdunkTestScenarios = {
  testProductSearch,
  testProductDetails,
  testCartOperations,
  testCustomerOTPFlow,
  testOrderPlacement,
  testStockChecking,
  testStoreLocations,
  voiceConversationSamples,
  testComplexProductSelection,
  testPriceComparison,
  runAllTests
};

export default shopdunkTestScenarios; 