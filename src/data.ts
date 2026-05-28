import { Customer, Order, Staff, FinanceRecord, InventoryItem } from './types';

export const initialCustomers: Customer[] = [
  {
    id: 'CUST-101',
    name: 'Eleanor Sterling',
    email: 'eleanor.s@gmail.com',
    phone: '+1 (555) 234-5678',
    category: 'Keto',
    allergies: ['Peanuts'],
    targetKcal: 1650,
    currentWeight: 68.2,
    targetWeight: 62.0,
    status: 'Active Plan',
    joinedDate: '2026-03-12',
    weightTrend: [
      { date: 'May 01', weight: 71.0, kcalConsumed: 1600 },
      { date: 'May 07', weight: 70.2, kcalConsumed: 1680 },
      { date: 'May 14', weight: 69.5, kcalConsumed: 1590 },
      { date: 'May 21', weight: 68.8, kcalConsumed: 1650 },
      { date: 'May 26', weight: 68.2, kcalConsumed: 1620 },
    ],
    lifestyle: {
      foodRestrictions: 'Strictly No legume oil, organic whole food priority',
      activityLevel: 'Active',
      fastingWillingness: '16:8 Fasting',
    },
    physicalStatus: {
      heightCm: 168,
      timeFrameWeeks: 12,
    },
    healthProfile: {
      medicalCondition: 'Mild Peanut Anaphylaxis',
      otherCondition: 'Impaired glucose response history, pre-diabetic mitigation target',
      medicineTaking: 'None',
      specialRequests: 'Always tag thermal carton bags as ALLERGEN STACK: PEANUTS SAFE.',
    },
    subscriptionPackage: {
      packageName: 'Keto Burn Master Pro Active Plan',
      accountLevel: 'Premium VIP',
      durationMonths: 3,
      expiresDate: '2026-07-12',
    },
    inquiriesList: [
      {
        id: 'INQ-9011',
        source: 'Website',
        status: 'Converted',
        serviceInterest: 'Weekly custom macro consultation with Sarah',
        timestamp: '2026-03-11 14:20',
        messages: [
          { sender: 'customer', text: 'Hi, does your chef support customized fats percentages for Keto subscribers?', timestamp: 'May 25 14:20' },
          { sender: 'staff', text: 'Absolutely Eleanor! We can adjust the fat and carb counts in our Meal Customizer view anytime.', timestamp: 'May 25 15:05' }
        ]
      }
    ]
  },
  {
    id: 'CUST-102',
    name: 'Marcus Vance',
    email: 'marcus_v@outlook.com',
    phone: '+1 (555) 890-1234',
    category: 'High-Protein',
    allergies: ['Shellfish'],
    targetKcal: 2500,
    currentWeight: 84.5,
    targetWeight: 88.0,
    status: 'Active Plan',
    joinedDate: '2026-04-01',
    weightTrend: [
      { date: 'May 01', weight: 81.2, kcalConsumed: 2450 },
      { date: 'May 07', weight: 82.5, kcalConsumed: 2600 },
      { date: 'May 14', weight: 83.1, kcalConsumed: 2490 },
      { date: 'May 21', weight: 83.9, kcalConsumed: 2550 },
      { date: 'May 26', weight: 84.5, kcalConsumed: 2510 },
    ],
  },
  {
    id: 'CUST-103',
    name: 'Sienna Alva',
    email: 'sienna.alva@gmail.com',
    phone: '+1 (555) 456-7890',
    category: 'Vegan',
    allergies: ['Gluten'],
    targetKcal: 1800,
    currentWeight: 59.4,
    targetWeight: 57.5,
    status: 'Active Plan',
    joinedDate: '2026-04-18',
    weightTrend: [
      { date: 'May 01', weight: 61.5, kcalConsumed: 1750 },
      { date: 'May 07', weight: 60.9, kcalConsumed: 1820 },
      { date: 'May 14', weight: 60.1, kcalConsumed: 1800 },
      { date: 'May 21', weight: 59.8, kcalConsumed: 1790 },
      { date: 'May 26', weight: 59.4, kcalConsumed: 1810 },
    ],
  },
  {
    id: 'CUST-104',
    name: 'Julian Thorne',
    email: 'jthorne@fastmail.com',
    phone: '+1 (555) 345-6789',
    category: 'Low-Carb',
    allergies: [],
    targetKcal: 2100,
    currentWeight: 92.3,
    targetWeight: 85.0,
    status: 'Active Plan',
    joinedDate: '2026-05-02',
    weightTrend: [
      { date: 'May 07', weight: 94.0, kcalConsumed: 2150 },
      { date: 'May 14', weight: 93.2, kcalConsumed: 2050 },
      { date: 'May 21', weight: 92.8, kcalConsumed: 2080 },
      { date: 'May 26', weight: 92.3, kcalConsumed: 2110 },
    ],
  },
  {
    id: 'CUST-105',
    name: 'Clara Hayes',
    email: 'clara.diet@icloud.com',
    phone: '+1 (555) 678-9012',
    category: 'Paleo',
    allergies: ['Dairy'],
    targetKcal: 1900,
    currentWeight: 72.8,
    targetWeight: 68.0,
    status: 'Active Plan',
    joinedDate: '2026-04-20',
    weightTrend: [
      { date: 'May 01', weight: 75.0, kcalConsumed: 1900 },
      { date: 'May 07', weight: 74.4, kcalConsumed: 1850 },
      { date: 'May 14', weight: 73.9, kcalConsumed: 1880 },
      { date: 'May 21', weight: 73.1, kcalConsumed: 1920 },
      { date: 'May 26', weight: 72.8, kcalConsumed: 1900 },
    ],
  }
];

export const initialOrders: Order[] = [
  {
    id: 'ORD-9421',
    customerName: 'Eleanor Sterling',
    category: 'Keto',
    mealName: 'Avocado Baked Salmon with Wilted Spinach',
    proteinGrams: 42,
    carbGrams: 8,
    fatGrams: 35,
    totalKcal: 515,
    price: 18.50,
    address: '422 Pine Ave, Apt 3B',
    status: 'Delivered',
    riderId: 'HR-302',
    assignedRiderName: 'Leo Vance',
    timestamp: '08:45 AM',
    deliveryDuration: 18,
    orderSheetType: 'Standard Prep'
  },
  {
    id: 'ORD-9424',
    customerName: 'Marcus Vance',
    category: 'High-Protein',
    mealName: 'Herb Grilled Chicken Breast & Double Sweet Potato Mash',
    proteinGrams: 64,
    carbGrams: 45,
    fatGrams: 12,
    totalKcal: 544,
    price: 16.90,
    address: '891 Oak Boulevard',
    status: 'Out for Delivery',
    riderId: 'HR-301',
    assignedRiderName: 'Dash Miller',
    timestamp: '11:15 AM',
    deliveryDuration: 22,
    orderSheetType: 'VIP Express Prep'
  },
  {
    id: 'ORD-9425',
    customerName: 'Sienna Alva',
    category: 'Vegan',
    mealName: 'Tofu Buddha Bowl with Quinoa & Ginger-Sesame Drizzle',
    proteinGrams: 28,
    carbGrams: 52,
    fatGrams: 16,
    totalKcal: 464,
    price: 15.50,
    address: '15 Ocean Court',
    status: 'In Kitchen',
    timestamp: '11:32 AM',
    deliveryDuration: 14,
    orderSheetType: 'Standard Prep'
  },
  {
    id: 'ORD-9426',
    customerName: 'Julian Thorne',
    category: 'Low-Carb',
    mealName: 'Grass-Fed Sirloin over Riced Cauliflower & Asparagus',
    proteinGrams: 48,
    carbGrams: 10,
    fatGrams: 24,
    totalKcal: 448,
    price: 22.00,
    address: '1004 Broadway, Penthouse A',
    status: 'Placed',
    timestamp: '11:45 AM',
    deliveryDuration: 28,
    orderSheetType: 'Allergen Guard'
  },
  {
    id: 'ORD-9427',
    customerName: 'Clara Hayes',
    category: 'Paleo',
    mealName: 'Custom Lemon Thyme Salmon',
    proteinGrams: 38,
    carbGrams: 5,
    fatGrams: 22,
    totalKcal: 370,
    price: 19.50,
    address: '67 Maple Road',
    status: 'In Kitchen',
    timestamp: '11:50 AM',
    deliveryDuration: 32,
    orderSheetType: 'Special Kitchen'
  }
];

export const initialStaff: Staff[] = [
  { 
    id: 'HR-201', 
    name: 'Chef Heston', 
    role: 'Chef', 
    status: 'Busy', 
    phone: '+1 (555) 101-1111',
    department: 'Main Hot Kitchen',
    kpisScorecard: [
      { id: 'KPI-1002', period: 'May 2026', targetScore: 92, actualScore: 94.5, reviewComment: 'Maintains elite hygiene and plating consistency.', reviewedBy: 'Ops Lead', createdAt: '2026-05-25' }
    ],
    payrollsList: [
      { id: 'PAY-8012', month: 'May 2026', basicSalary: 4200, allowances: 300, deductions: 50, bonus: 500, netSalary: 4950, status: 'Paid', paidAt: '2026-05-25' }
    ]
  },
  { 
    id: 'HR-202', 
    name: 'Chef Elena', 
    role: 'Chef', 
    status: 'Ready', 
    phone: '+1 (555) 101-2222',
    department: 'Garnishing & Hors d\'oeuvres',
    allocatedAssets: [
      { id: 'AST-5022', assetName: 'Pro Santoku Knife Kit', status: 'In Use', issuedDate: '2026-01-15' }
    ]
  },
  { 
    id: 'HR-203', 
    name: 'Dr. Sarah Pierce', 
    role: 'Nutritionist', 
    status: 'Ready', 
    phone: '+1 (555) 101-3333',
    department: 'SLA Dietary Consultation Department',
    kpisScorecard: [
      { id: 'KPI-1001', period: 'May 2026', targetScore: 90, actualScore: 92.0, reviewComment: 'Excellent counseling retention and custom recipe accuracy.', reviewedBy: 'Ops Lead', createdAt: '2026-05-24' }
    ]
  },
  { 
    id: 'HR-301', 
    name: 'Dash Miller', 
    role: 'Delivery Rider', 
    status: 'Busy', 
    rating: 4.9, 
    deliveriesCount: 312, 
    phone: '+1 (555) 101-4444',
    department: 'Last-mile Logistics',
    allocatedAssets: [
      { id: 'AST-2022', assetName: 'Electric Delivery Cargo Scooter X-1', status: 'In Use', issuedDate: '2026-02-10' },
      { id: 'AST-3011', assetName: 'BBD Smart GPS Logistics Armband', status: 'In Use', issuedDate: '2026-02-10' }
    ],
    payrollsList: [
      { id: 'PAY-8011', month: 'May 2026', basicSalary: 2800, allowances: 420, deductions: 20, bonus: 350, netSalary: 3550, status: 'Paid', paidAt: '2026-05-25' }
    ]
  },
  { 
    id: 'HR-302', 
    name: 'Leo Vance', 
    role: 'Delivery Rider', 
    status: 'Ready', 
    rating: 4.8, 
    deliveriesCount: 228, 
    phone: '+1 (555) 101-5555',
    department: 'Last-mile Logistics',
    leaveRequests: [
      { id: 'LV-4011', type: 'Sick', startDate: '2026-05-10', endDate: '2026-05-12', totalDays: 2, reason: 'Viral fever, recovered', status: 'Approved' }
    ]
  },
  { 
    id: 'HR-303', 
    name: 'Zoe Brooks', 
    role: 'Delivery Rider', 
    status: 'Off-Duty', 
    rating: 4.7, 
    deliveriesCount: 154, 
    phone: '+1 (555) 101-6666',
    department: 'Last-mile Logistics'
  }
];

export const initialInventory: InventoryItem[] = [
  { id: 'STK-001', name: 'Atlantic Salmon fillet', quantityGrams: 8500, reorderPoint: 4000, expiryDate: '2026-05-29', caloriesPer100g: 208, proteinPer100g: 22, carbPer100g: 0, fatPer100g: 13 },
  { id: 'STK-002', name: 'Premium Chicken Breast', quantityGrams: 15000, reorderPoint: 5000, expiryDate: '2026-05-30', caloriesPer100g: 165, proteinPer100g: 31, carbPer100g: 0, fatPer100g: 3.6 },
  { id: 'STK-003', name: 'Grass-Fed Angus Beef', quantityGrams: 12000, reorderPoint: 4000, expiryDate: '2026-05-28', caloriesPer100g: 250, proteinPer100g: 26, carbPer100g: 0, fatPer100g: 15 },
  { id: 'STK-004', name: 'Organic Tofu Blocks', quantityGrams: 9000, reorderPoint: 3000, expiryDate: '2026-06-05', caloriesPer100g: 76, proteinPer100g: 8, carbPer100g: 1.9, fatPer100g: 4.8 },
  { id: 'STK-005', name: 'Sweet Potatoes', quantityGrams: 28000, reorderPoint: 10000, expiryDate: '2026-06-15', caloriesPer100g: 86, proteinPer100g: 1.6, carbPer100g: 20, fatPer100g: 0.1 },
  { id: 'STK-006', name: 'Organic Quinoa Grain', quantityGrams: 14000, reorderPoint: 5000, expiryDate: '2026-09-20', caloriesPer100g: 120, proteinPer100g: 4.4, carbPer100g: 21.3, fatPer100g: 1.9 },
  { id: 'STK-007', name: 'Hass Avocados', quantityGrams: 4500, reorderPoint: 2000, expiryDate: '2026-05-31', caloriesPer100g: 160, proteinPer100g: 2, carbPer100g: 8.5, fatPer100g: 14.7 },
  { id: 'STK-008', name: 'Broccoli Florets', quantityGrams: 11000, reorderPoint: 4000, expiryDate: '2026-05-31', caloriesPer100g: 34, proteinPer100g: 2.8, carbPer100g: 7, fatPer100g: 0.4 },
  { id: 'STK-009', name: 'Fresh Baby Spinach', quantityGrams: 3000, reorderPoint: 1500, expiryDate: '2026-05-29', caloriesPer100g: 23, proteinPer100g: 2.9, carbPer100g: 3.6, fatPer100g: 0.4 }
];

export const initialFinance: FinanceRecord[] = [
  { id: 'FIN-1001', date: '2026-05-20', type: 'Income', category: 'Subscription Sales', amount: 3200.00, description: '14-Day Keto Plan - Client batch subscription' },
  { id: 'FIN-1002', date: '2026-05-21', type: 'Expense', category: 'Kitchen Stock', amount: -650.00, description: 'Fresh salmon fillets & avocados restock' },
  { id: 'FIN-1003', date: '2026-05-22', type: 'Income', category: 'A la Carte Orders', amount: 485.50, description: 'Single delivery lunch orders collection' },
  { id: 'FIN-1004', date: '2026-05-23', type: 'Expense', category: 'Rider Compensation', amount: -380.00, description: 'Riders weekly trip completions bonus' },
  { id: 'FIN-1005', date: '2026-05-24', type: 'Income', category: 'Subscription Sales', amount: 1850.00, description: '30-Day Vegan Diet renewal - 3 customers' },
  { id: 'FIN-1006', date: '2026-05-25', type: 'Expense', category: 'Packaging', amount: -210.00, description: 'Biodegradable eco-insulated delivery boxes batch' }
];
