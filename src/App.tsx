import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, MessageSquare, Clock, TrendingUp, AlertOctagon, X, CheckSquare } from 'lucide-react';
import { Customer, Order, Staff, FinanceRecord, InventoryItem, CustomerInquiry, CRMFeedback, CRMNotification, CRMApproval } from './types';
import { 
  initialCustomers, 
  initialOrders, 
  initialStaff, 
  initialFinance, 
  initialInventory 
} from './data';

import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import MealCustomizerView from './components/MealCustomizerView';
import OrdersView from './components/OrdersView';
import CRMView from './components/CRMView';
import HRMView from './components/HRMView';
import FinanceView from './components/FinanceView';
import InventoryView from './components/InventoryView';
import AnalyticsView from './components/AnalyticsView';
import ApprovalsView from './components/ApprovalsView';
import TrackingModal from './components/TrackingModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);

  // CRM Notifications Center State
  const [notifications, setNotifications] = useState<CRMNotification[]>(() => {
    const saved = localStorage.getItem('greenbite_notifications');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'NOTIF-1',
        type: 'pkg_expiry',
        message: '🚨 Low commitment subscriber Eleanor Sterling plan expires in 2 days.',
        is_read: false,
        user_id: 'Sarah Jenkins',
        reference_id: 'CUST-101',
        reference_type: 'customer',
        created_at: '2026-05-27 12:15'
      },
      {
        id: 'NOTIF-2',
        type: 'churn_risk',
        message: '⚠️ Warning: Marcus Vance churn score spiked to 85% after negative calorie compliance.',
        is_read: false,
        user_id: 'Sarah Jenkins',
        reference_id: 'CUST-102',
        reference_type: 'customer',
        created_at: '2026-05-27 10:45'
      },
      {
        id: 'NOTIF-3',
        type: 'feedback_pinpoint',
        message: '💬 Eleanor Sterling posted pinpoint feedback: "The Keto Salmon prep was absolutely outstanding". Recommend pinning!',
        is_read: true,
        user_id: 'Sarah Jenkins',
        reference_id: 'FEED-1',
        reference_type: 'feedback',
        created_at: '2026-05-26 14:05'
      }
    ];
  });

  // Manager Approvals State
  const [approvals, setApprovals] = useState<CRMApproval[]>(() => {
    const saved = localStorage.getItem('greenbite_approvals');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'APP-101',
        type: 'pkg_discount',
        customer_id: 'CUST-101',
        customer_name: 'Eleanor Sterling',
        requested_by: 'Sarah Jenkins',
        status: 'pending',
        created_at: '2026-05-27 11:15',
        payload: {
          original_price: 15000,
          final_price: 12750,
          discount_percentage: 15,
          reason: 'High retention booster for Eleanor custom Keto Salmon plan.'
        }
      },
      {
        id: 'APP-102',
        type: 'refund_request',
        customer_id: 'CUST-102',
        customer_name: 'Marcus Vance',
        requested_by: 'Sarah Jenkins',
        status: 'pending',
        created_at: '2026-05-27 09:30',
        payload: {
          refund_amount: 3200,
          reason: 'Lactose intolerance checkin discrepancy on day 4 macro mix.',
          details: 'Discharged raw chef dairy recipe in error.'
        }
      },
      {
        id: 'APP-103',
        type: 'cust_edit',
        customer_id: 'CUST-102',
        customer_name: 'Marcus Vance',
        requested_by: 'Nutritionist team',
        status: 'approved',
        created_at: '2026-05-26 15:45',
        payload: {
          original_state: { targetKcal: 2200, medicalCondition: 'None' },
          requested_state: { targetKcal: 1950, medicalCondition: 'Keto Low Carb restriction' }
        },
        action_note: 'Validated against doctor clearance sheets.'
      }
    ];
  });

  // Persist State loops
  useEffect(() => {
    localStorage.setItem('greenbite_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('greenbite_approvals', JSON.stringify(approvals));
  }, [approvals]);

  const handleAddNotification = (notif: Partial<CRMNotification>) => {
    const newNotif: CRMNotification = {
      id: `NOTIF-${Math.floor(1000 + Math.random() * 9000)}`,
      type: notif.type || 'health_milestone',
      message: notif.message || 'Custom Alert Triggered',
      is_read: false,
      user_id: notif.user_id || 'Sarah Jenkins',
      reference_id: notif.reference_id,
      reference_type: notif.reference_type,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Tracking Modal Status controls
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);

  const handleTrackOrder = (order: Order) => {
    setTrackedOrder(order);
    setIsTrackModalOpen(true);
  };

  // Filter states lifted from OrdersView to enable drilldown from AnalyticsView
  const [ordersFilterCategory, setOrdersFilterCategory] = useState<string>('All');
  const [ordersFilterStatus, setOrdersFilterStatus] = useState<string>('All');
  const [ordersFilterDuration, setOrdersFilterDuration] = useState<string>('All');

  // Core full-stack state representations
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('greenbite_customers');
    const list: Customer[] = saved ? JSON.parse(saved) : initialCustomers;
    const seen = new Set<string>();
    return list.map((item, idx) => {
      if (seen.has(item.id)) {
        return { ...item, id: `${item.id}-dup-${idx}` };
      }
      seen.add(item.id);
      return item;
    });
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('greenbite_orders');
    const list: Order[] = saved ? JSON.parse(saved) : initialOrders;
    const seen = new Set<string>();
    return list.map((item, idx) => {
      if (seen.has(item.id)) {
        return { ...item, id: `${item.id}-dup-${idx}` };
      }
      seen.add(item.id);
      return item;
    });
  });

  const [staff, setStaff] = useState<Staff[]>(() => {
    const saved = localStorage.getItem('greenbite_staff');
    const list: Staff[] = saved ? JSON.parse(saved) : initialStaff;
    const seen = new Set<string>();
    return list.map((item, idx) => {
      if (seen.has(item.id)) {
        return { ...item, id: `${item.id}-dup-${idx}` };
      }
      seen.add(item.id);
      return item;
    });
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('greenbite_inventory');
    const list: InventoryItem[] = saved ? JSON.parse(saved) : initialInventory;
    const seen = new Set<string>();
    return list.map((item, idx) => {
      if (seen.has(item.id)) {
        return { ...item, id: `${item.id}-dup-${idx}` };
      }
      seen.add(item.id);
      return item;
    });
  });

  const [finance, setFinance] = useState<FinanceRecord[]>(() => {
    const saved = localStorage.getItem('greenbite_finance');
    const list: FinanceRecord[] = saved ? JSON.parse(saved) : initialFinance;
    const seen = new Set<string>();
    return list.map((item, idx) => {
      if (seen.has(item.id)) {
        return { ...item, id: `${item.id}-dup-${idx}` };
      }
      seen.add(item.id);
      return item;
    });
  });

  const [currentUser, setCurrentUser] = useState({ id: 'HR-401', name: 'Sarah Jenkins', role: 'Ops Lead' });

  const [inquiries, setInquiries] = useState<CustomerInquiry[]>(() => {
    const saved = localStorage.getItem('greenbite_inquiries');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'INQ-2026-0001',
        prospect_name: 'David Beck',
        prospect_contact: '+1 (555) 777-8899',
        source: 'telegram',
        assigned_to: 'Sarah Jenkins',
        status: 'new',
        serviceInterest: 'Keto Custom Programs',
        timestamp: '2026-05-27 09:00',
        created_at: '2026-05-27',
        updated_at: '2026-05-27',
        statusChangeLog: [{ status: 'new', timestamp: '2026-05-27 09:00' }],
        messages: []
      },
      {
        id: 'INQ-2026-0002',
        prospect_name: 'Jessica Alba',
        prospect_contact: '+1 (555) 123-4567',
        source: 'messenger',
        assigned_to: 'Sarah Jenkins',
        status: 'contacted',
        serviceInterest: 'Vegan macro plans',
        timestamp: '2026-05-26 10:15',
        created_at: '2026-05-26',
        updated_at: '2026-05-26',
        statusChangeLog: [
          { status: 'new', timestamp: '2026-05-26 10:00' },
          { status: 'contacted', timestamp: '2026-05-26 10:15' }
        ],
        messages: [
          {
            sender: 'customer',
            text: 'Hi, I would love to check out your low-carb programs and see if I can get standard deliveries.',
            timestamp: 'May 26 10:15',
            sender_type: 'customer',
            message_text: 'Hi, I would love to check out your low-carb programs and see if I can get standard deliveries.',
            inquiry_id: 'INQ-2026-0002',
            platform_message_id: 'MSG-MOSS-8812'
          }
        ]
      },
      {
        id: 'INQ-2026-0003',
        prospect_name: 'Michael Jordan',
        prospect_contact: '+1 (555) 999-0000',
        source: 'website',
        assigned_to: 'Sarah Jenkins',
        status: 'interested',
        serviceInterest: 'High-Protein meals',
        timestamp: '2026-05-25 08:00',
        created_at: '2026-05-25',
        updated_at: '2026-05-25',
        statusChangeLog: [
          { status: 'new', timestamp: '2026-05-25 08:00' },
          { status: 'contacted', timestamp: '2026-05-25 12:00' },
          { status: 'interested', timestamp: '2026-05-25 15:30' }
        ],
        messages: []
      }
    ];
  });

  const [feedback, setFeedback] = useState<CRMFeedback[]>(() => {
    const saved = localStorage.getItem('greenbite_feedback');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'FEED-1',
        customer_id: 'CUST-101',
        customer_name: 'Eleanor Sterling',
        feedback_type: 'recommendation',
        feedback_text: 'The Keto Salmon prep was absolutely outstanding, please make it standard!',
        is_pinpoint: true,
        timestamp: '2026-05-26 14:00',
        staff_name: 'Sarah Jenkins'
      },
      {
        id: 'FEED-2',
        customer_id: 'CUST-102',
        customer_name: 'Marcus Vance',
        feedback_type: 'general',
        feedback_text: 'Delivery was a bit delayed, but food container was fresh and sealed.',
        is_pinpoint: false,
        timestamp: '2026-05-27 11:30',
        staff_name: 'Sarah Jenkins'
      }
    ];
  });

  // Persist State loops
  useEffect(() => {
    localStorage.setItem('greenbite_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('greenbite_inquiries', JSON.stringify(inquiries));
  }, [inquiries]);

  useEffect(() => {
    localStorage.setItem('greenbite_feedback', JSON.stringify(feedback));
  }, [feedback]);

  useEffect(() => {
    localStorage.setItem('greenbite_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('greenbite_staff', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem('greenbite_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('greenbite_finance', JSON.stringify(finance));
  }, [finance]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // 1. ORDER DISPATCH AND STOCK DEDUCT LOOP
  const handleAddCustomOrder = (newOrderPayload: Partial<Order>, ingredientsUsed: { [id: string]: number }) => {
    // Gather random custom order ID
    const randomId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowTime = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    
    // Pick an available Rider
    const readyRiders = staff.filter(s => s.role === 'Delivery Rider' && s.status === 'Ready');
    const assignedRider = readyRiders.length > 0 ? readyRiders[0] : staff.find(s => s.role === 'Delivery Rider');

    const finalOrder: Order = {
      id: randomId,
      customerName: newOrderPayload.customerName || 'A la Carte Client',
      category: newOrderPayload.category || 'Keto',
      mealName: newOrderPayload.mealName || 'BBD Custom Plate',
      proteinGrams: newOrderPayload.proteinGrams || 35,
      carbGrams: newOrderPayload.carbGrams || 15,
      fatGrams: newOrderPayload.fatGrams || 20,
      totalKcal: newOrderPayload.totalKcal || 450,
      price: newOrderPayload.price || 15.00,
      address: newOrderPayload.address || 'Standard Delivery Coordinates',
      status: 'Placed',
      riderId: assignedRider?.id,
      assignedRiderName: assignedRider?.name,
      timestamp: nowTime,
      deliveryDuration: Math.floor(10 + Math.random() * 25), // assign random trip speed (10-35 mins)
      orderSheetType: newOrderPayload.orderSheetType || 'Standard Prep'
    };

    // Update active order queue
    setOrders(prev => [finalOrder, ...prev]);

    // Update ingredients stock balances
    setInventory(prevStock => {
      return prevStock.map(item => {
        const consumed = ingredientsUsed[item.id] || 0;
        return {
          ...item,
          quantityGrams: Math.max(0, item.quantityGrams - consumed)
        };
      });
    });

    // Automatically append transaction log
    const randomFinId = `FIN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord: FinanceRecord = {
      id: randomFinId,
      date: new Date().toISOString().split('T')[0],
      type: 'Income',
      category: 'A la Carte Orders',
      amount: finalOrder.price,
      description: `Dispatched Custom Meal: ${finalOrder.id} for ${finalOrder.customerName}`
    };
    setFinance(prev => [newRecord, ...prev]);
  };

  // 2. WORKFLOW STEPPER STATUS ACTIONS
  const handleUpdateOrderStatus = (
    orderId: string, 
    status: Order['status'],
    payload?: {
      deliveredPhoto?: string;
      deliveredTimestamp?: string;
      deliveryNotes?: string;
      deliveryDuration?: number;
    }
  ) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        // If order finishes delivery, increment driver runs count and post final income transaction!
        if (status === 'Delivered' && o.status !== 'Delivered') {
          // Update Rider Deliveries Count (HRM)
          if (o.riderId) {
            setStaff(prevStaff => prevStaff.map(s => {
              if (s.id === o.riderId) {
                return {
                  ...s,
                  deliveriesCount: (s.deliveriesCount || 0) + 1,
                  status: 'Ready' // Set rider free
                };
              }
              return s;
            }));
          }
        }

        const nowStr = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

        return { 
          ...o, 
          status,
          ...(status === 'Out for Delivery' ? { startDeliveryTimestamp: nowStr } : {}),
          ...(status === 'Delivered' ? {
            deliveredPhoto: payload?.deliveredPhoto || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&auto=format&fit=crop&q=80',
            deliveredTimestamp: payload?.deliveredTimestamp || nowStr,
            deliveryNotes: payload?.deliveryNotes || 'Direct high-priority parcel hand-off. Successful delivery.',
            deliveryDuration: payload?.deliveryDuration !== undefined ? payload.deliveryDuration : (o.deliveryDuration || Math.floor(15 + Math.random() * 10))
          } : {})
        };
      }
      return o;
    }));
  };

  const handleUpdateOrderSheetType = (orderId: string, sheetType: Order['orderSheetType']) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { ...o, orderSheetType: sheetType };
      }
      return o;
    }));
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  const handleReorder = (oldOrder: Order) => {
    const randomId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowTime = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    
    // Pick an available Rider
    const readyRiders = staff.filter(s => s.role === 'Delivery Rider' && s.status === 'Ready');
    const assignedRider = readyRiders.length > 0 ? readyRiders[0] : staff.find(s => s.role === 'Delivery Rider');

    const clonedOrder: Order = {
      ...oldOrder,
      id: randomId,
      status: 'Placed',
      timestamp: nowTime,
      riderId: assignedRider?.id,
      assignedRiderName: assignedRider?.name,
      deliveryDuration: Math.floor(10 + Math.random() * 25)
    };

    setOrders(prev => [clonedOrder, ...prev]);

    // Send transaction log
    const randomFinId = `FIN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord: FinanceRecord = {
      id: randomFinId,
      date: new Date().toISOString().split('T')[0],
      type: 'Income',
      category: 'A la Carte Orders',
      amount: clonedOrder.price,
      description: `Re-dispatched Meal Package: ${clonedOrder.id} (${clonedOrder.mealName}) for ${clonedOrder.customerName}`
    };
    setFinance(prev => [newRecord, ...prev]);
  };

  // 3. HUMAN RESOURCES MANAGEMENT LOOPS
  const handleUpdateStaffStatus = (staffId: string, status: Staff['status']) => {
    setStaff(prev => prev.map(s => s.id === staffId ? { ...s, status } : s));
  };

  const handleDeleteStaff = (staffId: string) => {
    setStaff(prev => prev.filter(s => s.id !== staffId));
  };

  const handleAddStaff = (newStaffPayload: Partial<Staff>) => {
    const randomId = `HR-${Math.floor(400 + Math.random() * 600)}`;
    const finalStaff: Staff = {
      id: randomId,
      name: newStaffPayload.name || 'Anonymous Recruit',
      role: newStaffPayload.role || 'Delivery Rider',
      status: 'Ready',
      phone: newStaffPayload.phone || '+1 (555) 101-0000',
      rating: newStaffPayload.rating,
      deliveriesCount: newStaffPayload.deliveriesCount
    };
    setStaff(prev => [...prev, finalStaff]);
  };

  // 4. CUSTOMERS CRM LOGIC
  const handleAddCustomer = (newCustomerPayload: Partial<Customer>): Customer => {
    const randomId = `CUST-${Math.floor(200 + Math.random() * 800)}`;
    const finalCust: Customer = {
      id: randomId,
      name: newCustomerPayload.name || 'Generic Client',
      email: newCustomerPayload.email || 'info@client.com',
      phone: newCustomerPayload.phone || '+1 (555) 000-0000',
      category: newCustomerPayload.category || 'Keto',
      allergies: newCustomerPayload.allergies || [],
      targetKcal: newCustomerPayload.targetKcal || 2000,
      currentWeight: newCustomerPayload.currentWeight || 70,
      targetWeight: newCustomerPayload.targetWeight || 65,
      status: 'Active Plan',
      joinedDate: newCustomerPayload.joinedDate || new Date().toISOString().split('T')[0],
      weightTrend: newCustomerPayload.weightTrend || [],
      customer_code: newCustomerPayload.customer_code,
      facebook_name: newCustomerPayload.facebook_name,
      gender: newCustomerPayload.gender,
      address: newCustomerPayload.address,
      branch: newCustomerPayload.branch,
      inquiry_id: newCustomerPayload.inquiry_id,
      lifestyle: newCustomerPayload.lifestyle,
      physicalStatus: newCustomerPayload.physicalStatus,
      healthProfile: newCustomerPayload.healthProfile,
      subscriptionPackage: newCustomerPayload.subscriptionPackage,
    };
    setCustomers(prev => [...prev, finalCust]);
    return finalCust;
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  const handleUpdateCustomer = (updatedCust: Customer) => {
    setCustomers(prev => prev.map(c => c.id === updatedCust.id ? updatedCust : c));
  };

  // 4B. INQUIRIES & LEAD CAPTURE LOGIC
  const handleAddInquiry = (newInq: Partial<CustomerInquiry>): CustomerInquiry => {
    const randomId = `INQ-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const finalInq: CustomerInquiry = {
      id: randomId,
      prospect_name: newInq.prospect_name || 'Prospect Client',
      prospect_contact: newInq.prospect_contact || '',
      source: newInq.source || 'Website',
      status: 'new',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0],
      statusChangeLog: [{ status: 'new', timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16) }],
      messages: [],
      assigned_to: newInq.assigned_to || 'Sarah Jenkins'
    };
    setInquiries(prev => [finalInq, ...prev]);
    return finalInq;
  };

  const handleUpdateInquiry = (updatedInq: CustomerInquiry) => {
    setInquiries(prev => prev.map(inq => inq.id === updatedInq.id ? updatedInq : inq));
  };

  // 4C. FEEDBACK REGISTRY LOGIC
  const handleAddFeedback = (newFeedback: Partial<CRMFeedback>): CRMFeedback => {
    const randomId = `FEED-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalFeed: CRMFeedback = {
      id: randomId,
      customer_id: newFeedback.customer_id,
      customer_name: newFeedback.customer_name,
      inquiry_id: newFeedback.inquiry_id,
      feedback_type: newFeedback.feedback_type || 'general',
      feedback_text: newFeedback.feedback_text || '',
      is_pinpoint: !!newFeedback.is_pinpoint,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      staff_name: currentUser.name
    };
    setFeedback(prev => [finalFeed, ...prev]);
    return finalFeed;
  };

  const handleUpdateStaff = (updatedStaff: Staff) => {
    setStaff(prev => prev.map(s => s.id === updatedStaff.id ? updatedStaff : s));
  };

  const handleResolveApproval = (
    id: string, 
    status: 'approved' | 'rejected' | 'partially_approved', 
    note?: string, 
    partialAmount?: number
  ) => {
    // 1. Update the approvals list state
    setApprovals(prev => prev.map(app => {
      if (app.id !== id) return app;
      
      const updatedApp: CRMApproval = { 
        ...app, 
        status, 
        actioned_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
        action_note: note || (status === 'partially_approved' && partialAmount ? `Approved partial refund amount ฿${partialAmount}` : undefined)
      };

      // 2. Perform side effects based on type
      if (status === 'approved' || status === 'partially_approved') {
        if (app.type === 'pkg_discount') {
          // Grant discount state to customer!
          setCustomers(prevCustomers => prevCustomers.map(cust => {
            if (cust.id !== app.customer_id) return cust;
            return {
              ...cust,
              subscriptionPackage: cust.subscriptionPackage ? {
                ...cust.subscriptionPackage,
                final_price: app.payload?.final_price || cust.subscriptionPackage.final_price,
                packageName: `${cust.subscriptionPackage.packageName} (Discounted)`
              } : undefined
            };
          }));
          handleAddNotification({
            type: 'health_milestone',
            message: `✓ Manager approved ${app.payload?.discount_percentage}% discount for Eleanor Sterling.`,
            user_id: 'System Autoprompt',
            reference_id: app.customer_id,
            reference_type: 'customer'
          });
        } else if (app.type === 'refund_request') {
          // Add debit charge to finance logs!
          const refundVal = status === 'partially_approved' && partialAmount ? partialAmount : (app.payload?.refund_amount || 0);
          const refundRecord: FinanceRecord = {
            id: `FIN-${Math.floor(10000 + Math.random() * 90000)}`,
            type: 'Expense',
            category: 'Subscription Sales',
            amount: refundVal,
            date: new Date().toISOString().substring(0, 10),
            description: `Refund disbursed for Marcus Vance (Ref ${app.id}). Authorizer note: ${note || 'Partial payout adjustment approved.'}`
          };
          setFinance(prevFin => [refundRecord, ...prevFin]);
          handleAddNotification({
            type: 'health_milestone',
            message: `💸 Refund authorized of ฿${refundVal.toLocaleString()} for Marcus Vance. Ledger updated.`,
            user_id: 'System Autoprompt',
            reference_id: app.customer_id,
            reference_type: 'customer'
          });
        }
      } else if (status === 'rejected') {
        handleAddNotification({
          type: 'health_milestone',
          message: `✗ Manager rejected proposed approval APP-${id.replace('APP-', '')}: "${note}".`,
          user_id: 'System Autoprompt',
          reference_id: app.customer_id,
          reference_type: 'customer'
        });
      }

      return updatedApp;
    }));
  };

  // 5. FINANCE LEDGER WRITING
  const handleAddFinanceRecord = (newFinPayload: Partial<FinanceRecord>) => {
    const randomId = `FIN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalRec: FinanceRecord = {
      id: randomId,
      date: newFinPayload.date || new Date().toISOString().split('T')[0],
      type: newFinPayload.type || 'Income',
      category: newFinPayload.category || 'Subscription Sales',
      amount: newFinPayload.amount || 100,
      description: newFinPayload.description || 'Ledger statement record'
    };
    setFinance(prev => [finalRec, ...prev]);
  };

  // 6. INVENTORY RESTOCK INDEX
  const handleRestockItem = (itemId: string, grams: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          quantityGrams: item.quantityGrams + grams
        };
      }
      return item;
    }));

    // Post expense to finance ledger representing ingredient purchase
    const item = inventory.find(i => i.id === itemId);
    if (item) {
      const restockCost = Math.round((grams / 1000) * 12.50 * 100) / 100; // custom estimation rate
      const randomId = `FIN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const expRec: FinanceRecord = {
        id: randomId,
        date: new Date().toISOString().split('T')[0],
        type: 'Expense',
        category: 'Kitchen Stock',
        amount: -restockCost,
        description: `Purchased restock ingredient bulk grams: +${grams}g of ${item.name}`
      };
      setFinance(prev => [expRec, ...prev]);
    }
  };

  // Render view router based on tab state
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView 
            customers={customers} 
            orders={orders} 
            staff={staff} 
            finance={finance} 
            darkMode={darkMode} 
            toggleDarkMode={toggleDarkMode}
            setActiveTab={setActiveTab}
            handleTrackOrder={handleTrackOrder}
            inquiries={inquiries}
            feedback={feedback}
          />
        );
      case 'customizer':
        return (
          <MealCustomizerView 
            customers={customers} 
            inventory={inventory} 
            handleAddCustomOrder={handleAddCustomOrder}
            darkMode={darkMode}
          />
        );
      case 'orders':
        return (
          <OrdersView 
            orders={orders} 
            handleUpdateOrderStatus={handleUpdateOrderStatus} 
            handleDeleteOrder={handleDeleteOrder}
            handleReorder={handleReorder}
            darkMode={darkMode}
            filterCategory={ordersFilterCategory}
            setFilterCategory={setOrdersFilterCategory}
            filterStatus={ordersFilterStatus}
            setFilterStatus={setOrdersFilterStatus}
            filterDuration={ordersFilterDuration}
            setFilterDuration={setOrdersFilterDuration}
            handleTrackOrder={handleTrackOrder}
            handleUpdateOrderSheetType={handleUpdateOrderSheetType}
          />
        );
      case 'crm':
        return (
          <CRMView 
            customers={customers} 
            handleAddCustomer={handleAddCustomer}
            handleDeleteCustomer={handleDeleteCustomer}
            handleUpdateCustomer={handleUpdateCustomer}
            darkMode={darkMode}
            inquiries={inquiries}
            handleAddInquiry={handleAddInquiry}
            handleUpdateInquiry={handleUpdateInquiry}
            feedback={feedback}
            handleAddFeedback={handleAddFeedback}
            currentUser={currentUser}
            staffList={staff}
          />
        );
      case 'hrm':
        return (
          <HRMView 
            staffList={staff} 
            handleUpdateStaffStatus={handleUpdateStaffStatus} 
            handleAddStaff={handleAddStaff}
            handleDeleteStaff={handleDeleteStaff}
            handleUpdateStaff={handleUpdateStaff}
            darkMode={darkMode}
          />
        );
      case 'finance':
        return (
          <FinanceView 
            financeList={finance} 
            handleAddFinanceRecord={handleAddFinanceRecord}
            darkMode={darkMode}
          />
        );
      case 'inventory':
        return (
          <InventoryView 
            inventory={inventory} 
            handleRestockItem={handleRestockItem}
            darkMode={darkMode}
          />
        );
      case 'analytics':
        return (
          <AnalyticsView 
            customers={customers} 
            orders={orders} 
            staff={staff} 
            darkMode={darkMode}
            setActiveTab={setActiveTab}
            setFilterCategory={setOrdersFilterCategory}
            setFilterStatus={setOrdersFilterStatus}
            filterDuration={ordersFilterDuration}
            setFilterDuration={setOrdersFilterDuration}
            inquiries={inquiries}
            feedback={feedback}
            approvals={approvals}
            handleAddNotification={handleAddNotification}
          />
        );
      case 'approvals':
        return (
          <ApprovalsView 
            approvals={approvals}
            handleResolveApproval={handleResolveApproval}
            customers={customers}
            darkMode={darkMode}
          />
        );
      default:
        return (
          <div className="p-8 text-center text-zinc-500">
            N/A View Node
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-[#0A0D0B] text-zinc-100' : 'bg-[#F8FAF9] text-[#1A1A1A]'
    }`}>
      
      {/* Absolute left sidebar panel tracker */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        darkMode={darkMode} 
        userEmail="parcywilliam6@gmail.com" 
        pendingApprovalsCount={approvals.filter(a => a.status === 'pending').length}
      />

      {/* Primary scrollable container workspace */}
      <main id="main-content-layout" className="lg:ml-72 md:ml-24 ml-24 p-8 max-w-7xl transition-all duration-300">
        <div className="transition-all duration-300">
          {renderTabContent()}
        </div>
      </main>

      {/* Absolute floating Alarm & Retain Alerts Center */}
      <div className="fixed top-6 right-8 z-[100] flex items-center gap-3 font-sans">
        
        {/* Bell Button Icon */}
        <button 
          onClick={() => setIsNotifOpen(!isNotifOpen)}
          className={`p-3 rounded-2xl border shadow-lg transition-all duration-300 relative cursor-pointer hover:scale-105 active:scale-95 flex items-center justify-center ${
            darkMode 
              ? 'bg-[#151916] border-[#222A25] hover:bg-[#1D241F] text-[#1DB954]' 
              : 'bg-white border-zinc-200 hover:bg-zinc-50 text-[#1DB954]'
          }`}
          title="Open Alerts Console"
        >
          <Bell className="w-5 h-5" />
          {notifications.some(n => !n.read) && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white font-mono text-[10px] font-black flex items-center justify-center animate-pulse shadow-md">
              {notifications.filter(n => !n.read).length}
            </span>
          )}
        </button>

        {/* Floating Panel Drawer */}
        {isNotifOpen && (
          <>
            {/* Click-away backdrop */}
            <div 
              className="fixed inset-0 z-[-1] cursor-default bg-black/10 backdrop-blur-[2px]" 
              onClick={() => setIsNotifOpen(false)} 
            />

            <div className="absolute top-14 right-0 w-80 rounded-2xl shadow-2xl border flex flex-col p-4 overflow-hidden animate-slideDown bg-white border-slate-200 text-[#1D1D1D] shadow-zinc-350">
              
              {/* Header */}
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-150 mb-3 ml-0.5 mr-0.5">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Notifications</h4>
                  <p className="text-[10px] text-slate-400 font-medium">Unread: {notifications.filter(n => !n.read).length}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                    }}
                    className="text-xs font-bold text-[#10b981] hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                  <button 
                    onClick={() => setIsNotifOpen(false)}
                    className="p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-4 h-4 text-slate-450" />
                  </button>
                </div>
              </div>

              {/* Alerts Scrolling List */}
              <div className="max-h-72 overflow-y-auto space-y-2 pb-1.5 pr-0.5 text-xs font-semibold">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 italic text-[11px] font-medium font-sans">
                    No active notifications or alerts.
                  </div>
                ) : (
                  notifications.map(notif => {
                    const resolveIcon = () => {
                      switch (notif.type) {
                        case 'pkg_expiry': return <AlertOctagon className="w-4 h-4 text-rose-500" />;
                        case 'churn_warning': return <TrendingUp className="w-4 h-4 text-rose-455" />;
                        case 'feedback_unhappy': return <MessageSquare className="w-4 h-4 text-amber-500" />;
                        default: return <Clock className="w-4 h-4 text-emerald-500" />;
                      }
                    };

                    return (
                      <div 
                        key={notif.id}
                        onClick={() => {
                          // Flip read status on row click
                          setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
                          if (notif.reference_type === 'customer' && notif.reference_id) {
                            setActiveTab('crm');
                            setIsNotifOpen(false);
                          }
                        }}
                        className={`p-3 rounded-xl flex items-start gap-2.5 transition-all duration-150 cursor-pointer text-[11px]  ${
                          notif.read 
                            ? 'bg-zinc-50 border border-slate-200 text-slate-500 font-normal hover:bg-slate-100/60'
                            : 'bg-white border-y-slate-200 border-r-slate-200 border-l-4 border-l-[#10b981] border text-slate-850 font-bold shadow-sm hover:translate-x-0.5'
                        }`}
                      >
                        <span className="p-1 rounded bg-slate-100 flex items-center justify-center self-start">
                          {resolveIcon()}
                        </span>
                        <div className="flex-1 space-y-0.5 text-left">
                          <p className="leading-tight text-slate-700 font-semibold">{notif.message}</p>
                          <span className="text-[9px] text-slate-400 block font-mono mt-1 font-normal">{notif.timestamp}</span>
                        </div>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-[#10b981] self-center shrink-0 animate-pulse" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* High-fidelity full interactive GPS courier route tracking modal */}
      <TrackingModal 
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        order={trackedOrder}
        darkMode={darkMode}
      />

    </div>
  );
}
