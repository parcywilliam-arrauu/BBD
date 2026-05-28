export type DietCategory = 'Keto' | 'Vegan' | 'Paleo' | 'High-Protein' | 'Low-Carb';

export interface LifestyleData {
  foodRestrictions: string;
  activityLevel: 'Sedentary' | 'Moderate' | 'Active' | 'Highly Active' | string;
  fastingWillingness: 'None' | '16:8 Fasting' | '20:4 Fasting' | 'Alternate Day' | string;
  foot_condition?: string;
  activity_level?: string;
  feeling_willingness?: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

export interface PhysicalStatusData {
  heightCm: number;
  timeFrameWeeks: number;
  current_weight?: number;
  past_weight?: number;
  height?: number;
  time_frame?: number;
  bmi?: number;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

export interface HealthProfileData {
  medicalCondition: string;
  otherCondition: string;
  medicineTaking: string;
  specialRequests: string;
  duration?: number;
  medicine_taking?: string;
  medical_condition?: string;
  other_condition?: string;
  special_requests?: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

export interface CustomerPackageData {
  packageName: string;
  accountLevel: 'Basic' | 'Standard' | 'Premium VIP' | 'Elite Platinum' | string;
  durationMonths: number;
  expiresDate: string;
  package_level?: string;
  duration?: number;
  expired_at?: string;
  status?: 'active' | 'expired' | 'expiring_soon' | string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
  discount_percent?: number;
  approval_status?: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  original_price?: number;
  final_price?: number;
}

export interface CustomerInquiry {
  id: string;
  prospect_name?: string;
  prospect_contact?: string;
  source: 'Website' | 'Messenger' | 'Telegram' | 'Instagram' | 'website' | 'messenger' | 'telegram' | 'instagram';
  status: 'New' | 'In Progress' | 'Converted' | 'Closed' | 'new' | 'contacted' | 'interested' | 'converted' | 'closed';
  serviceInterest?: string;
  timestamp: string;
  assigned_to?: string;
  customer_id?: string;
  created_at?: string;
  updated_at?: string;
  statusChangeLog?: { status: string; timestamp: string }[];
  messages: {
    sender: 'customer' | 'staff';
    text: string;
    timestamp: string;
    sender_type?: 'customer' | 'staff';
    message_text?: string;
    inquiry_id?: string;
    platform_message_id?: string;
  }[];
  intent_tag?: 'price_inquiry' | 'menu_question' | 'delivery_question' | 'health_question' | 'complaint' | 'ready_to_order' | string;
  ai_classified_at?: string;
}

export interface CRMFeedback {
  id: string;
  inquiry_id?: string;
  customer_id?: string;
  customer_name?: string;
  feedback_type: 'general' | 'inquiry' | 'recommendation';
  feedback_text: string;
  is_pinpoint: boolean;
  timestamp: string;
  staff_name: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: DietCategory;
  allergies: string[];
  targetKcal: number;
  weightTrend: { date: string; weight: number; kcalConsumed: number }[];
  currentWeight: number;
  targetWeight: number;
  status: 'Active Plan' | 'Completed' | 'Pending Renewal' | 'active' | 'inactive' | 'at_risk' | string;
  joinedDate: string;
  // CRM system schema extensions
  customer_code?: string;
  facebook_name?: string;
  gender?: string;
  address?: string;
  branch?: string;
  inquiry_id?: string;
  lifestyle?: LifestyleData;
  physicalStatus?: PhysicalStatusData;
  healthProfile?: HealthProfileData;
  subscriptionPackage?: CustomerPackageData;
  inquiriesList?: CustomerInquiry[];
  churn_score?: number;
  churn_updated_at?: string;
  ai_meal_suggestion?: string;
}

export interface Order {
  id: string;
  customerName: string;
  category: DietCategory;
  mealName: string;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  totalKcal: number;
  price: number;
  address: string;
  status: 'Placed' | 'In Kitchen' | 'Out for Delivery' | 'Delivered';
  riderId?: string;
  assignedRiderName?: string;
  timestamp: string;
  deliveryDuration?: number;
  deliveredPhoto?: string;
  deliveredTimestamp?: string;
  startDeliveryTimestamp?: string;
  deliveryNotes?: string;
  orderSheetType?: 'Standard Prep' | 'Special Kitchen' | 'VIP Express Prep' | 'Allergen Guard';
}

export interface StaffKPI {
  id: string;
  period: string;
  targetScore: number;
  actualScore: number;
  reviewComment: string;
  reviewedBy: string;
  createdAt: string;
}

export interface StaffPayroll {
  id: string;
  month: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  bonus: number;
  netSalary: number;
  status: 'Paid' | 'Unpaid';
  paidAt?: string;
}

export interface StaffLeaveRequest {
  id: string;
  type: 'Vacation' | 'Sick' | 'Personal' | 'Maternity/Paternity';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface StaffAsset {
  id: string;
  assetName: string;
  status: 'In Use' | 'Returned';
  issuedDate: string;
}

export interface Staff {
  id: string;
  name: string;
  role: 'Chef' | 'Nutritionist' | 'Delivery Rider' | 'Ops Lead';
  status: 'Ready' | 'Busy' | 'Off-Duty';
  rating?: number;
  deliveriesCount?: number;
  phone: string;
  // HRM system schema extensions
  department?: string;
  kpisScorecard?: StaffKPI[];
  payrollsList?: StaffPayroll[];
  leaveRequests?: StaffLeaveRequest[];
  allocatedAssets?: StaffAsset[];
}

export interface FinanceRecord {
  id: string;
  date: string;
  type: 'Income' | 'Expense';
  category: 'Subscription Sales' | 'A la Carte Orders' | 'Kitchen Stock' | 'Rider Compensation' | 'Marketing' | 'Packaging';
  amount: number;
  description: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantityGrams: number;
  reorderPoint: number;
  expiryDate: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbPer100g: number;
  fatPer100g: number;
}

export interface CRMNotification {
  id: string;
  user_id: string; // the staff name or ID, eg 'Sarah Jenkins' or 'all' or 'manager'
  type: 'pkg_expiry' | 'new_inquiry' | 'churn_risk' | 'health_milestone' | 'feedback_pinpoint';
  message: string;
  reference_id?: string;
  reference_type?: string;
  is_read: boolean;
  created_at: string;
}

export interface CRMApproval {
  id: string;
  type: 'pkg_discount' | 'cust_edit' | 'cust_deactivate' | 'refund_request';
  requested_by: string;
  customer_id: string;
  customer_name: string;
  payload: any; // Contains custom payload like proposed edits, deactivation reason, refund_amount, or discount details
  status: 'pending' | 'approved' | 'rejected' | string;
  actioned_by?: string;
  action_note?: string;
  created_at: string;
  actioned_at?: string;
}

