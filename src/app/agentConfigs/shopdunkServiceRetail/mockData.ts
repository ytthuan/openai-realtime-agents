import { Product, Customer, Order, Cart, StoreLocation, OrderStatus, CartItem } from './types';

// Mock Products - Apple Products
export const mockProducts: Product[] = [
  // iPhones
  {
    id: 'PRD-IP15-PRO-001',
    name: 'iPhone 15 Pro',
    nameVi: 'iPhone 15 Pro',
    category: 'smartphones',
    subcategory: 'iphone',
    brand: 'Apple',
    price: 28990000,
    originalPrice: 32990000,
    discount: 12,
    description: 'The most advanced iPhone with titanium design and A17 Pro chip',
    descriptionVi: 'iPhone tiên tiến nhất với thiết kế titan và chip A17 Pro',
    specifications: {
      screen: '6.1" Super Retina XDR',
      chip: 'A17 Pro',
      camera: '48MP Main | Ultra Wide | Telephoto',
      battery: 'Up to 23 hours video playback',
      connectivity: '5G, Wi-Fi 6E, Bluetooth 5.3',
    },
    stock: 45,
    variants: [
      {
        id: 'VAR-IP15P-128-NT',
        name: 'Natural Titanium 128GB',
        nameVi: 'Titan Tự Nhiên 128GB',
        stock: 15,
        attributes: { color: 'Natural Titanium', storage: '128GB' },
      },
      {
        id: 'VAR-IP15P-256-BT',
        name: 'Blue Titanium 256GB',
        nameVi: 'Titan Xanh 256GB',
        price: 31990000,
        stock: 12,
        attributes: { color: 'Blue Titanium', storage: '256GB' },
      },
      {
        id: 'VAR-IP15P-512-WT',
        name: 'White Titanium 512GB',
        nameVi: 'Titan Trắng 512GB',
        price: 37990000,
        stock: 8,
        attributes: { color: 'White Titanium', storage: '512GB' },
      },
      {
        id: 'VAR-IP15P-1TB-BT',
        name: 'Black Titanium 1TB',
        nameVi: 'Titan Đen 1TB',
        price: 43990000,
        stock: 10,
        attributes: { color: 'Black Titanium', storage: '1TB' },
      },
    ],
    images: ['iphone15pro-1.jpg', 'iphone15pro-2.jpg'],
    isNew: true,
    isBestSeller: true,
  },
  {
    id: 'PRD-IP15-002',
    name: 'iPhone 15',
    nameVi: 'iPhone 15',
    category: 'smartphones',
    subcategory: 'iphone',
    brand: 'Apple',
    price: 22990000,
    originalPrice: 24990000,
    discount: 8,
    description: 'Dynamic Island comes to iPhone 15',
    descriptionVi: 'Dynamic Island đã có mặt trên iPhone 15',
    specifications: {
      screen: '6.1" Super Retina XDR',
      chip: 'A16 Bionic',
      camera: '48MP Main | Ultra Wide',
      battery: 'Up to 20 hours video playback',
      connectivity: '5G, Wi-Fi 6, Bluetooth 5.3',
    },
    stock: 72,
    variants: [
      {
        id: 'VAR-IP15-128-PK',
        name: 'Pink 128GB',
        nameVi: 'Hồng 128GB',
        stock: 20,
        attributes: { color: 'Pink', storage: '128GB' },
      },
      {
        id: 'VAR-IP15-128-YL',
        name: 'Yellow 128GB',
        nameVi: 'Vàng 128GB',
        stock: 18,
        attributes: { color: 'Yellow', storage: '128GB' },
      },
      {
        id: 'VAR-IP15-256-BL',
        name: 'Blue 256GB',
        nameVi: 'Xanh Dương 256GB',
        price: 25990000,
        stock: 15,
        attributes: { color: 'Blue', storage: '256GB' },
      },
      {
        id: 'VAR-IP15-256-GR',
        name: 'Green 256GB',
        nameVi: 'Xanh Lá 256GB',
        price: 25990000,
        stock: 12,
        attributes: { color: 'Green', storage: '256GB' },
      },
      {
        id: 'VAR-IP15-256-BK',
        name: 'Black 256GB',
        nameVi: 'Đen 256GB',
        price: 25990000,
        stock: 7,
        attributes: { color: 'Black', storage: '256GB' },
      },
    ],
    images: ['iphone15-1.jpg', 'iphone15-2.jpg'],
    isNew: true,
    isBestSeller: true,
  },
  {
    id: 'PRD-IP14-003',
    name: 'iPhone 14',
    nameVi: 'iPhone 14',
    category: 'smartphones',
    subcategory: 'iphone',
    brand: 'Apple',
    price: 19990000,
    description: 'iPhone 14. Big and bigger.',
    descriptionVi: 'iPhone 14. Lớn và lớn hơn.',
    specifications: {
      screen: '6.1" Super Retina XDR',
      chip: 'A15 Bionic',
      camera: '12MP Dual camera system',
      battery: 'Up to 20 hours video playback',
      connectivity: '5G, Wi-Fi 6, Bluetooth 5.3',
    },
    stock: 35,
    images: ['iphone14-1.jpg'],
    isBestSeller: false,
  },

  // iPads
  {
    id: 'PRD-IPAD-PRO-004',
    name: 'iPad Pro M2 12.9"',
    nameVi: 'iPad Pro M2 12.9 inch',
    category: 'tablets',
    subcategory: 'ipad',
    brand: 'Apple',
    price: 31990000,
    originalPrice: 35990000,
    discount: 11,
    description: 'The ultimate iPad experience with M2 chip',
    descriptionVi: 'Trải nghiệm iPad tuyệt đỉnh với chip M2',
    specifications: {
      screen: '12.9" Liquid Retina XDR',
      chip: 'Apple M2',
      camera: '12MP Wide, 10MP Ultra Wide',
      battery: 'Up to 10 hours',
      connectivity: '5G, Wi-Fi 6E, Bluetooth 5.3',
    },
    stock: 25,
    variants: [
      {
        id: 'VAR-IPADPRO-128-SG',
        name: 'Space Gray Wi-Fi 128GB',
        nameVi: 'Xám Không Gian Wi-Fi 128GB',
        stock: 10,
        attributes: { color: 'Space Gray', storage: '128GB', connectivity: 'Wi-Fi' },
      },
      {
        id: 'VAR-IPADPRO-256-SV',
        name: 'Silver Wi-Fi + Cellular 256GB',
        nameVi: 'Bạc Wi-Fi + Cellular 256GB',
        price: 37990000,
        stock: 8,
        attributes: { color: 'Silver', storage: '256GB', connectivity: 'Wi-Fi + Cellular' },
      },
      {
        id: 'VAR-IPADPRO-512-SG',
        name: 'Space Gray Wi-Fi 512GB',
        nameVi: 'Xám Không Gian Wi-Fi 512GB',
        price: 41990000,
        stock: 7,
        attributes: { color: 'Space Gray', storage: '512GB', connectivity: 'Wi-Fi' },
      },
    ],
    images: ['ipadpro-1.jpg', 'ipadpro-2.jpg'],
    isNew: false,
  },

  // MacBooks
  {
    id: 'PRD-MBA-M2-005',
    name: 'MacBook Air M2 13"',
    nameVi: 'MacBook Air M2 13 inch',
    category: 'computers',
    subcategory: 'macbook',
    brand: 'Apple',
    price: 27990000,
    originalPrice: 32990000,
    discount: 15,
    description: 'Strikingly thin design with M2 performance',
    descriptionVi: 'Thiết kế siêu mỏng với hiệu năng M2',
    specifications: {
      screen: '13.6" Liquid Retina',
      chip: 'Apple M2',
      memory: '8GB unified memory',
      storage: '256GB SSD',
      battery: 'Up to 18 hours',
    },
    stock: 30,
    variants: [
      {
        id: 'VAR-MBA-256-MN',
        name: 'Midnight 256GB',
        nameVi: 'Nửa Đêm 256GB',
        stock: 12,
        attributes: { color: 'Midnight', storage: '256GB', memory: '8GB' },
      },
      {
        id: 'VAR-MBA-256-SG',
        name: 'Space Gray 256GB',
        nameVi: 'Xám Không Gian 256GB',
        stock: 10,
        attributes: { color: 'Space Gray', storage: '256GB', memory: '8GB' },
      },
      {
        id: 'VAR-MBA-512-SL',
        name: 'Silver 512GB',
        nameVi: 'Bạc 512GB',
        price: 33990000,
        stock: 8,
        attributes: { color: 'Silver', storage: '512GB', memory: '8GB' },
      },
    ],
    images: ['macbookair-1.jpg', 'macbookair-2.jpg'],
    isNew: false,
  },

  // AirPods
  {
    id: 'PRD-AIRPODS-PRO2-006',
    name: 'AirPods Pro 2nd Gen',
    nameVi: 'AirPods Pro thế hệ 2',
    category: 'accessories',
    subcategory: 'airpods',
    brand: 'Apple',
    price: 6490000,
    originalPrice: 7490000,
    discount: 13,
    description: 'Active Noise Cancellation for immersive sound',
    descriptionVi: 'Chống ồn chủ động cho âm thanh sống động',
    specifications: {
      chip: 'H2 chip',
      battery: 'Up to 6 hours listening time',
      features: 'Active Noise Cancellation, Transparency mode, Adaptive Audio',
      charging: 'MagSafe, Qi wireless, Lightning',
    },
    stock: 85,
    images: ['airpodspro2-1.jpg'],
    isNew: false,
    isBestSeller: true,
  },
  {
    id: 'PRD-AIRPODS3-007',
    name: 'AirPods 3rd Gen',
    nameVi: 'AirPods thế hệ 3',
    category: 'accessories',
    subcategory: 'airpods',
    brand: 'Apple',
    price: 4490000,
    description: 'All-new design with spatial audio',
    descriptionVi: 'Thiết kế hoàn toàn mới với âm thanh không gian',
    specifications: {
      chip: 'H1 chip',
      battery: 'Up to 6 hours listening time',
      features: 'Spatial audio, Adaptive EQ, Force sensor',
      charging: 'MagSafe, Qi wireless, Lightning',
    },
    stock: 120,
    images: ['airpods3-1.jpg'],
  },

  // Apple Watch
  {
    id: 'PRD-WATCH-S9-008',
    name: 'Apple Watch Series 9',
    nameVi: 'Apple Watch Series 9',
    category: 'accessories',
    subcategory: 'watch',
    brand: 'Apple',
    price: 10990000,
    originalPrice: 12990000,
    discount: 15,
    description: 'Our most powerful chip in Apple Watch',
    descriptionVi: 'Chip mạnh mẽ nhất trong Apple Watch',
    specifications: {
      screen: 'Always-On Retina display',
      chip: 'S9 SiP',
      features: 'Blood oxygen, ECG, Temperature sensing',
      battery: 'Up to 18 hours',
    },
    stock: 40,
    variants: [
      {
        id: 'VAR-AWS9-41-AL-MN',
        name: 'Midnight Aluminum 41mm',
        nameVi: 'Nhôm Nửa Đêm 41mm',
        stock: 15,
        attributes: { size: '41mm', case: 'Aluminum', color: 'Midnight' },
      },
      {
        id: 'VAR-AWS9-45-AL-ST',
        name: 'Starlight Aluminum 45mm',
        nameVi: 'Nhôm Ánh Sao 45mm',
        price: 11990000,
        stock: 12,
        attributes: { size: '45mm', case: 'Aluminum', color: 'Starlight' },
      },
      {
        id: 'VAR-AWS9-45-SS-SV',
        name: 'Silver Stainless Steel 45mm',
        nameVi: 'Thép Không Gỉ Bạc 45mm',
        price: 17990000,
        stock: 8,
        attributes: { size: '45mm', case: 'Stainless Steel', color: 'Silver' },
      },
    ],
    images: ['applewatch9-1.jpg'],
    isNew: true,
  },

  // Samsung Products
  {
    id: 'PRD-GALAXY-S23U-009',
    name: 'Samsung Galaxy S23 Ultra',
    nameVi: 'Samsung Galaxy S23 Ultra',
    category: 'smartphones',
    subcategory: 'samsung',
    brand: 'Samsung',
    price: 26990000,
    originalPrice: 31990000,
    discount: 16,
    description: 'The ultimate Galaxy experience with S Pen',
    descriptionVi: 'Trải nghiệm Galaxy tuyệt đỉnh với bút S Pen',
    specifications: {
      screen: '6.8" Dynamic AMOLED 2X',
      chip: 'Snapdragon 8 Gen 2',
      camera: '200MP Wide, 12MP Ultra Wide, dual 10MP Telephoto',
      battery: '5000mAh',
      features: 'S Pen included, IP68 water resistance',
    },
    stock: 35,
    variants: [
      {
        id: 'VAR-S23U-256-PB',
        name: 'Phantom Black 256GB',
        nameVi: 'Đen Phantom 256GB',
        stock: 15,
        attributes: { color: 'Phantom Black', storage: '256GB' },
      },
      {
        id: 'VAR-S23U-512-CR',
        name: 'Cream 512GB',
        nameVi: 'Kem 512GB',
        price: 29990000,
        stock: 10,
        attributes: { color: 'Cream', storage: '512GB' },
      },
      {
        id: 'VAR-S23U-512-GR',
        name: 'Green 512GB',
        nameVi: 'Xanh Lá 512GB',
        price: 29990000,
        stock: 10,
        attributes: { color: 'Green', storage: '512GB' },
      },
    ],
    images: ['galaxys23ultra-1.jpg'],
    isNew: true,
    isBestSeller: true,
  },
  {
    id: 'PRD-GALAXY-BUDS2PRO-010',
    name: 'Galaxy Buds2 Pro',
    nameVi: 'Galaxy Buds2 Pro',
    category: 'accessories',
    subcategory: 'earbuds',
    brand: 'Samsung',
    price: 3990000,
    originalPrice: 5490000,
    discount: 27,
    description: 'Intelligent Active Noise Cancellation',
    descriptionVi: 'Chống ồn chủ động thông minh',
    specifications: {
      features: 'ANC, 360 Audio, IPX7 water resistant',
      battery: 'Up to 5 hours with ANC on',
      connectivity: 'Bluetooth 5.3',
    },
    stock: 65,
    variants: [
      {
        id: 'VAR-GB2P-BOR',
        name: 'Bora Purple',
        nameVi: 'Tím Bora',
        stock: 25,
        attributes: { color: 'Bora Purple' },
      },
      {
        id: 'VAR-GB2P-GRA',
        name: 'Graphite',
        nameVi: 'Than Chì',
        stock: 20,
        attributes: { color: 'Graphite' },
      },
      {
        id: 'VAR-GB2P-WHT',
        name: 'White',
        nameVi: 'Trắng',
        stock: 20,
        attributes: { color: 'White' },
      },
    ],
    images: ['galaxybuds2pro-1.jpg'],
    isNew: false,
  },

  // Accessories
  {
    id: 'PRD-CASE-IP15P-011',
    name: 'iPhone 15 Pro Case - Silicone',
    nameVi: 'Ốp lưng iPhone 15 Pro - Silicone',
    category: 'accessories',
    subcategory: 'cases',
    brand: 'Apple',
    price: 1290000,
    description: 'Silicone case with MagSafe',
    descriptionVi: 'Ốp lưng silicone với MagSafe',
    specifications: {
      material: 'Soft-touch silicone',
      features: 'MagSafe compatible, Microfiber lining',
    },
    stock: 150,
    variants: [
      {
        id: 'VAR-CASE-BLK',
        name: 'Black',
        nameVi: 'Đen',
        stock: 40,
        attributes: { color: 'Black' },
      },
      {
        id: 'VAR-CASE-ORG',
        name: 'Orange Sorbet',
        nameVi: 'Cam Sorbet',
        stock: 35,
        attributes: { color: 'Orange Sorbet' },
      },
      {
        id: 'VAR-CASE-CYP',
        name: 'Cypress',
        nameVi: 'Xanh Cypress',
        stock: 35,
        attributes: { color: 'Cypress' },
      },
      {
        id: 'VAR-CASE-GUA',
        name: 'Guava',
        nameVi: 'Hồng Ổi',
        stock: 40,
        attributes: { color: 'Guava' },
      },
    ],
    images: ['case-silicone-1.jpg'],
  },
  {
    id: 'PRD-CHARGER-20W-012',
    name: '20W USB-C Power Adapter',
    nameVi: 'Adapter sạc USB-C 20W',
    category: 'accessories',
    subcategory: 'chargers',
    brand: 'Apple',
    price: 590000,
    description: 'Fast charging for iPhone and iPad',
    descriptionVi: 'Sạc nhanh cho iPhone và iPad',
    specifications: {
      power: '20W',
      ports: '1 x USB-C',
      compatibility: 'iPhone 8 or later, iPad',
    },
    stock: 200,
    images: ['charger-20w-1.jpg'],
  },
  {
    id: 'PRD-CABLE-USBC-013',
    name: 'USB-C to Lightning Cable 1m',
    nameVi: 'Cáp USB-C to Lightning 1m',
    category: 'accessories',
    subcategory: 'cables',
    brand: 'Apple',
    price: 590000,
    description: 'Fast charging and data sync cable',
    descriptionVi: 'Cáp sạc nhanh và đồng bộ dữ liệu',
    specifications: {
      length: '1 meter',
      compatibility: 'iPhone, iPad, AirPods',
    },
    stock: 180,
    images: ['cable-usbc-1.jpg'],
  },
];

// Mock Customers
export const mockCustomers: Customer[] = [
  {
    id: 'CUST-001',
    name: 'Nguyễn Văn An',
    phone: '0912345678',
    email: 'an.nguyen@example.com',
    address: {
      street: '123 Nguyễn Huệ',
      ward: 'Bến Nghé',
      district: 'Quận 1',
      city: 'Hồ Chí Minh',
      province: 'Hồ Chí Minh',
    },
    isVerified: true,
    orders: [],
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'CUST-002',
    name: 'Trần Thị Bích',
    phone: '0923456789',
    email: 'bich.tran@example.com',
    address: {
      street: '456 Lê Lợi',
      ward: 'Bến Thành',
      district: 'Quận 1',
      city: 'Hồ Chí Minh',
      province: 'Hồ Chí Minh',
    },
    isVerified: true,
    orders: [],
    createdAt: '2024-02-20T10:30:00Z',
  },
  {
    id: 'CUST-003',
    name: 'Phạm Minh Cường',
    phone: '0934567890',
    email: 'cuong.pham@example.com',
    address: {
      street: '789 Hai Bà Trưng',
      ward: 'Tân Định',
      district: 'Quận 1',
      city: 'Hồ Chí Minh',
      province: 'Hồ Chí Minh',
    },
    isVerified: true,
    orders: [],
    createdAt: '2024-03-10T14:15:00Z',
  },
  {
    id: 'CUST-004',
    name: 'Lê Thị Dung',
    phone: '0945678901',
    address: {
      street: '321 Võ Văn Tần',
      ward: '6',
      district: 'Quận 3',
      city: 'Hồ Chí Minh',
      province: 'Hồ Chí Minh',
    },
    isVerified: false,
    orders: [],
    createdAt: '2024-04-05T09:20:00Z',
  },
  {
    id: 'CUST-005',
    name: 'Hoàng Văn Em',
    phone: '0956789012',
    email: 'em.hoang@example.com',
    isVerified: true,
    orders: [],
    createdAt: '2024-04-18T11:45:00Z',
  },
];

// Mock Active Carts
export const mockCarts: Cart[] = [
  {
    id: 'CART-001',
    customerId: 'CUST-001',
    items: [
      {
        id: 'ITEM-001',
        productId: 'PRD-IP15-PRO-001',
        product: mockProducts[0],
        quantity: 1,
        variant: mockProducts[0].variants?.[1], // Blue Titanium 256GB
        addedAt: '2024-06-26T10:30:00Z',
      },
      {
        id: 'ITEM-002',
        productId: 'PRD-AIRPODS-PRO2-006',
        product: mockProducts[5],
        quantity: 1,
        addedAt: '2024-06-26T10:32:00Z',
      },
    ],
    subtotal: 38480000,
    discount: 0,
    total: 38480000,
    createdAt: '2024-06-26T10:30:00Z',
    updatedAt: '2024-06-26T10:32:00Z',
  },
  {
    id: 'CART-002',
    items: [], // Empty guest cart
    subtotal: 0,
    discount: 0,
    total: 0,
    createdAt: '2024-06-26T14:00:00Z',
    updatedAt: '2024-06-26T14:00:00Z',
  },
];

// Mock Orders
export const mockOrders: Order[] = [
  {
    id: 'ORD-20240625-001',
    customerId: 'CUST-001',
    customer: mockCustomers[0],
    items: [
      {
        productId: 'PRD-IP15-002',
        product: mockProducts[1],
        quantity: 1,
        price: 22990000,
        variant: mockProducts[1].variants?.[2], // Blue 256GB
      },
    ],
    status: OrderStatus.DELIVERED,
    subtotal: 25990000,
    shipping: 0,
    discount: 1000000,
    total: 24990000,
    paymentMethod: 'COD',
    shippingAddress: mockCustomers[0].address,
    createdAt: '2024-06-20T09:00:00Z',
    updatedAt: '2024-06-22T15:30:00Z',
  },
  {
    id: 'ORD-20240626-002',
    customerId: 'CUST-002',
    customer: mockCustomers[1],
    items: [
      {
        productId: 'PRD-GALAXY-S23U-009',
        product: mockProducts[8],
        quantity: 1,
        price: 26990000,
        variant: mockProducts[8].variants?.[0], // Phantom Black 256GB
      },
      {
        productId: 'PRD-GALAXY-BUDS2PRO-010',
        product: mockProducts[9],
        quantity: 1,
        price: 3990000,
        variant: mockProducts[9].variants?.[0], // Bora Purple
      },
    ],
    status: OrderStatus.PROCESSING,
    subtotal: 30980000,
    shipping: 0,
    discount: 1500000,
    total: 29480000,
    paymentMethod: 'Bank Transfer',
    shippingAddress: mockCustomers[1].address,
    notes: 'Giao hàng trong giờ hành chính',
    createdAt: '2024-06-26T11:20:00Z',
    updatedAt: '2024-06-26T11:20:00Z',
  },
  {
    id: 'ORD-20240626-003',
    customerId: 'CUST-003',
    customer: mockCustomers[2],
    items: [
      {
        productId: 'PRD-MBA-M2-005',
        product: mockProducts[4],
        quantity: 1,
        price: 27990000,
        variant: mockProducts[4].variants?.[0], // Midnight 256GB
      },
    ],
    status: OrderStatus.PENDING_PAYMENT,
    subtotal: 27990000,
    shipping: 0,
    discount: 0,
    total: 27990000,
    paymentMethod: 'Credit Card',
    shippingAddress: mockCustomers[2].address,
    createdAt: '2024-06-26T14:45:00Z',
    updatedAt: '2024-06-26T14:45:00Z',
  },
];

// Mock Store Locations
export const mockStoreLocations: StoreLocation[] = [
  {
    id: 'STORE-001',
    name: 'ShopDunk Nguyễn Huệ',
    address: '45 Nguyễn Huệ, Phường Bến Nghé, Quận 1',
    city: 'Hồ Chí Minh',
    phone: '028 3823 4567',
    hours: 'Thứ 2-6: 9h-21h, Thứ 7-CN: 9h-22h',
    coordinates: {
      lat: 10.774436,
      lng: 106.703687,
    },
  },
  {
    id: 'STORE-002',
    name: 'ShopDunk Vincom Đồng Khởi',
    address: '72 Lê Thánh Tôn, Phường Bến Nghé, Quận 1',
    city: 'Hồ Chí Minh',
    phone: '028 3824 5678',
    hours: 'Thứ 2-CN: 9h30-22h',
    coordinates: {
      lat: 10.778530,
      lng: 106.701760,
    },
  },
  {
    id: 'STORE-003',
    name: 'ShopDunk Aeon Mall Tân Phú',
    address: '30 Bờ Bao Tân Thắng, Phường Sơn Kỳ, Quận Tân Phú',
    city: 'Hồ Chí Minh',
    phone: '028 3825 6789',
    hours: 'Thứ 2-CN: 10h-22h',
    coordinates: {
      lat: 10.802340,
      lng: 106.616940,
    },
  },
  {
    id: 'STORE-004',
    name: 'ShopDunk Crescent Mall',
    address: '101 Tôn Dật Tiên, Phường Tân Phú, Quận 7',
    city: 'Hồ Chí Minh',
    phone: '028 3826 7890',
    hours: 'Thứ 2-CN: 9h30-22h',
    coordinates: {
      lat: 10.729360,
      lng: 106.718920,
    },
  },
  {
    id: 'STORE-005',
    name: 'ShopDunk Hà Nội - Tràng Tiền Plaza',
    address: '24 Hai Bà Trưng, Phường Tràng Tiền, Quận Hoàn Kiếm',
    city: 'Hà Nội',
    phone: '024 3938 1234',
    hours: 'Thứ 2-CN: 9h-21h30',
    coordinates: {
      lat: 21.024530,
      lng: 105.855420,
    },
  },
  {
    id: 'STORE-006',
    name: 'ShopDunk Royal City',
    address: '72A Nguyễn Trãi, Phường Thượng Đình, Quận Thanh Xuân',
    city: 'Hà Nội',
    phone: '024 3939 2345',
    hours: 'Thứ 2-CN: 9h30-22h',
    coordinates: {
      lat: 21.003450,
      lng: 105.815230,
    },
  },
];

// Mock Session Storage (for demonstration)
export const mockSessions = new Map();

// Helper function to generate OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper function to find products by query
export function searchProductsByQuery(query: string, category?: string): Product[] {
  const normalizedQuery = query.toLowerCase();
  
  return mockProducts.filter(product => {
    const matchesQuery = 
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.nameVi.toLowerCase().includes(normalizedQuery) ||
      product.description.toLowerCase().includes(normalizedQuery) ||
      product.descriptionVi.toLowerCase().includes(normalizedQuery) ||
      product.brand.toLowerCase().includes(normalizedQuery);
    
    const matchesCategory = !category || product.category === category;
    
    return matchesQuery && matchesCategory;
  });
}

// Helper function to calculate cart totals
export function calculateCartTotals(items: CartItem[]): { subtotal: number; discount: number; total: number } {
  const subtotal = items.reduce((sum, item) => {
    const price = item.variant?.price || item.product.price;
    return sum + (price * item.quantity);
  }, 0);
  
  const discount = 0; // Can implement discount logic here
  const total = subtotal - discount;
  
  return { subtotal, discount, total };
}

// Helper function to format price in Vietnamese
export function formatVietnamesePrice(price: number): string {
  // Convert to millions for easier speaking
  if (price >= 1000000) {
    const millions = price / 1000000;
    if (millions % 1 === 0) {
      return `${millions} triệu đồng`;
    } else {
      return `${millions.toFixed(1).replace('.', ' phẩy ')} triệu đồng`;
    }
  }
  
  // For thousands
  if (price >= 1000) {
    const thousands = price / 1000;
    return `${thousands} nghìn đồng`;
  }
  
  return `${price} đồng`;
}

// Generate more realistic order IDs
export function generateOrderId(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${dateStr}-${random}`;
}

// Mock inventory check
export function checkProductStock(productId: string, variantId?: string): { available: boolean; quantity: number } {
  const product = mockProducts.find(p => p.id === productId);
  if (!product) return { available: false, quantity: 0 };
  
  if (variantId && product.variants) {
    const variant = product.variants.find(v => v.id === variantId);
    return {
      available: variant ? variant.stock > 0 : false,
      quantity: variant ? variant.stock : 0,
    };
  }
  
  return {
    available: product.stock > 0,
    quantity: product.stock,
  };
} 