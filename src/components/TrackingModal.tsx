import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Phone, 
  MessageSquare, 
  X, 
  MapPin, 
  Navigation, 
  Send, 
  User, 
  Check, 
  Loader2, 
  Shield, 
  Truck, 
  AlertCircle
} from 'lucide-react';
import { Order } from '../types';

interface TrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: Order | null;
  darkMode: boolean;
}

export default function TrackingModal({ isOpen, onClose, order, darkMode }: TrackingModalProps) {
  // Setup fallback mock order if none passed
  const orderData = order || {
    id: 'ORD-505257',
    customerName: 'Parcy William',
    category: 'Keto',
    mealName: 'Busy Boss Lean Salmon Plate',
    price: 22.80,
    address: '23rd St N, Marconi Park Sub-Hub #4',
    status: 'Out for Delivery',
    assignedRiderName: 'Schleifer',
    timestamp: '10:15 AM'
  } as Order;

  // Active sub-states for call simulation and chat drawer
  const [showCallScreen, setShowCallScreen] = useState(false);
  const [callState, setCallState] = useState<'ringing' | 'connected' | 'ended'>('ringing');
  const [callDuration, setCallDuration] = useState(0);

  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'rider', text: 'Hi! I am putting together your nutrition box right now. Let me know if there are any gate codes or contactless drop-off directions!' },
  ]);

  // Live progress slider for the interactive route mapping (0% to 100%)
  const [simProgress, setSimProgress] = useState(48); // default fits the "In transit" past Marconi Park block in image
  const [simIsMoving, setSimIsMoving] = useState(true);

  // Shipment timeline statuses based on active order state
  const isDelivered = orderData.status === 'Delivered';
  const isInKitchen = orderData.status === 'In Kitchen';
  const isPlaced = orderData.status === 'Placed';
  const isOutForDelivery = orderData.status === 'Out for Delivery';

  // Shipment ID format formatted to match the screenshot "#505-257-bkl"
  const getShipmentId = () => {
    const rawId = orderData.id.replace(/\D/g, '');
    if (!rawId || rawId.length < 3) return '#505-257-bkl';
    const segment1 = rawId.substring(0, 3) || '505';
    const segment2 = rawId.substring(3, 6) || '257';
    return `#${segment1}-${segment2}-bkl`;
  };

  // Live timer for call simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showCallScreen && callState === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showCallScreen, callState]);

  // Handle auto-connection trigger for call simulator
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showCallScreen && callState === 'ringing') {
      timeout = setTimeout(() => {
        setCallState('connected');
      }, 2500);
    }
    return () => clearTimeout(timeout);
  }, [showCallScreen, callState]);

  // Handle active delivery slider simulation tick
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (simIsMoving && isOpen && !isDelivered && (isOutForDelivery || true)) {
      interval = setInterval(() => {
        setSimProgress(prev => {
          if (prev >= 100) return 0; // loop
          return prev + 1;
        });
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [simIsMoving, isOpen, isDelivered, isOutForDelivery]);

  const handleStartCall = () => {
    setCallDuration(0);
    setCallState('ringing');
    setShowCallScreen(true);
  };

  const handleEndCall = () => {
    setCallState('ended');
    setTimeout(() => {
      setShowCallScreen(false);
    }, 800);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setIsTyping(true);

    // Dynamic smart responses from courier Schleifer
    setTimeout(() => {
      let reply = "Got it! I'm moving as fast as possible. Be there shortly!";
      const lower = userMsg.toLowerCase();
      if (lower.includes('where') || lower.includes('status') || lower.includes('far')) {
        reply = `I just turned past Marconi Park right now. Should be arriving at your doorstep in approximately ${Math.ceil((100 - simProgress) / 8) + 1} minutes!`;
      } else if (lower.includes('gate') || lower.includes('code') || lower.includes('lobby') || lower.includes('ring')) {
        reply = "Understood. I will follow those instructions exactly and choose contactless placement. I'll take a confirmation proof photo!";
      } else if (lower.includes('thank') || lower.includes('awesome') || lower.includes('great')) {
        reply = "You're welcome! Happy to help you with your Busy Boss meal routine today! 😊";
      }

      setChatMessages(prev => [...prev, { sender: 'rider', text: reply }]);
      setIsTyping(false);
    }, 1500);
  };

  // Compute percentage positions along the bezier path for the animated courier bike
  // The path has: start at (40, 50), curves through (155, 115) and ends at (290, 85)
  // Let's approximate path mapping for rendering the animated courier marker beautifully!
  const getCourierCoordinates = (percentage: number) => {
    const t = percentage / 100;
    // Bezier control points for the route drawn in SVG:
    // P0 = (40, 48), P1 = (130, 110), P2 = (190, 100), P3 = (290, 85)
    // Cubic bezier formula: B(t) = (1-t)^3 * P0 + 3(1-t)^2 * t * P1 + 3(1-t) * t^2 * P2 + t^3 * P3
    const x = Math.pow(1 - t, 3) * 40 + 3 * Math.pow(1 - t, 2) * t * 140 + 3 * (1 - t) * Math.pow(t, 2) * 200 + Math.pow(t, 3) * 290;
    const y = Math.pow(1 - t, 3) * 48 + 3 * Math.pow(1 - t, 2) * t * 125 + 3 * (1 - t) * Math.pow(t, 2) * 85 + Math.pow(t, 3) * 85;
    return { x, y };
  };

  const riderPos = getCourierCoordinates(simProgress);

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          id="delivery-tracking-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/85 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-full max-w-[365px] rounded-[24px] bg-[#1a1c27] text-white p-5 overflow-hidden shadow-[0_20px_50px_-15px_rgba(0,0,0,0.85)] border border-[#2b2e3e]"
          >
            {/* Elegant Header */}
            <div className="flex justify-between items-start mb-3.5">
              <div>
                <h2 className="text-[17px] font-sans font-black tracking-tight text-white leading-tight flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#1db954] animate-pulse" />
                  Tracking Delivery
                </h2>
                <p className="text-[10px] text-zinc-400 font-medium tracking-wide mt-0.5">
                  Real-time GPS handover coordinate index
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full bg-zinc-900 hover:bg-[#222433] text-zinc-400 hover:text-white transition-all cursor-pointer border border-zinc-800"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* HIGH-CRAFT PREMIUM MAP CANVAS SVG */}
            <div className="relative rounded-[16px] overflow-hidden bg-[#E2E1D7] h-[145px] w-full border border-black/15 shadow-inner select-none mb-4">
              {/* Detailed custom styled background map with local vector street names */}
              <svg className="w-full h-full" viewBox="0 0 350 210" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Safe Map Background grids and grass zones */}
                <rect width="350" height="210" fill="#EAE8DC" />
                
                {/* Marconi Park Zone */}
                <path d="M 175, 45 L 255, 45 L 255, 85 L 175, 85 Z" fill="#C2DCB6" />
                <text x="215" y="67" fill="#5A7D51" fontSize="9" fontWeight="900" textAnchor="middle" letterSpacing="0.05em" opacity="0.85">Marconi Park</text>

                {/* Secondary Water/Park features */}
                <path d="M 0,0 C 70,5 90,15 120,4 M 120,4 L 120,0 Z" fill="#A8D5E2" opacity="0.4" />

                {/* Vector Roads drawn with solid tan-grey styling to look identical to standard lightmaps */}
                {/* 1st Ave N */}
                <line x1="20" y1="0" x2="20" y2="210" stroke="#FFFFFF" strokeWidth="20" opacity="0.8" />
                <line x1="20" y1="0" x2="20" y2="210" stroke="#9E9E9E" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" strokeLinecap="round" />
                
                {/* 5th Ave N */}
                <line x1="100" y1="0" x2="100" y2="210" stroke="#FFFFFF" strokeWidth="18" opacity="0.8" />
                
                {/* 7th Ave N */}
                <line x1="230" y1="0" x2="230" y2="210" stroke="#FFFFFF" strokeWidth="22" opacity="0.8" />

                {/* 23rd St N */}
                <line x1="0" y1="110" x2="350" y2="110" stroke="#FFFFFF" strokeWidth="24" opacity="0.8" />

                {/* 20th St N */}
                <line x1="0" y1="165" x2="350" y2="165" stroke="#FFFFFF" strokeWidth="14" opacity="0.7" />

                {/* Diagonal secondary alleyways */}
                <line x1="0" y1="20" x2="120" y2="80" stroke="#FFFFFF" strokeWidth="10" opacity="0.6" />
                <line x1="200" y1="110" x2="350" y2="190" stroke="#FFFFFF" strokeWidth="12" opacity="0.6" />

                {/* Labels of streets mirroring screenshot */}
                <text x="18" y="15" fill="#7C786E" fontSize="6.5" fontWeight="bold" transform="rotate(-90, 18, 15)">Con Birmi...</text>
                <text x="104" y="25" fill="#7C786E" fontSize="6.5" fontWeight="bold" transform="rotate(-90, 104, 25)">3rd Ave N</text>
                <text x="50" y="102" fill="#7C786E" fontSize="6.5" fontWeight="extrabold">23rd St N</text>
                <text x="14" y="176" fill="#7C786E" fontSize="6.5" fontWeight="semibold">20th St N</text>

                <text x="210" y="196" fill="#A86A3E" fontSize="7.5" fontWeight="bold">El Barrio</text>
                <circle cx="215" cy="186" r="3" fill="#D36F52" opacity="0.8" />

                <text x="315" y="104" fill="#5C7BB5" fontSize="7" fontWeight="bold">United States</text>
                <text x="315" y="112" fill="#5C7BB5" fontSize="6.5" fontWeight="bold">Postal Service</text>

                {/* THE ACTUAL DELIVERY PATH COURIER ROUTE IN SOLID BLACK (Width of 4px as in image) */}
                {/* The route connects Start Pin (40,48) through control points ending at End Pin (290, 85) */}
                <path 
                  id="map-route-path"
                  d="M 40 48 Q 140 125 200 85 T 290 85" 
                  stroke="#1A1A1A" 
                  strokeWidth="3.2" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none" 
                  className="drop-shadow-[0_2px_3px_rgba(0,0,0,0.15)]"
                />

                {/* Beautiful Arrowhead indicator exactly like the photo */}
                {/* Positioned around x=200, y=85 which is near 23rd St N */}
                <g transform="translate(198, 86) rotate(-18)">
                  <path d="M -8 -4.5 L 2 0 L -8 4.5" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </g>

                {/* Start Point Pin (RED PIN AT THE TOP LEFT AVENUE) */}
                {/* Anchor Coordinates: (40, 48) */}
                <g transform="translate(40, 48)">
                  {/* Pin Dot Drop Shadow */}
                  <ellipse cx="0" cy="1" rx="4" ry="1.5" fill="#1A201A" opacity="0.3" />
                  
                  {/* Pin Shape */}
                  <path 
                    d="M 0 0 C -5 -5 -8 -11 -8 -16 C -8 -22 -4 -26 0 -26 C 4 -26 8 -22 8 -16 C 8 -11 5 -5 0 0 Z" 
                    fill="#EF4444" 
                    stroke="#ffffff"
                    strokeWidth="1.2"
                  />
                  {/* Inner Pin light circle */}
                  <circle cx="0" cy="-16" r="3" fill="#1A1A1A" />
                </g>

                {/* Destination Point Pin (BLUE PIN AT the top right corner) */}
                {/* Anchor Coordinates: (290, 85) */}
                <g transform="translate(290, 85)">
                  {/* Pin Dot Drop Shadow */}
                  <ellipse cx="0" cy="1" rx="4" ry="1.5" fill="#1A201A" opacity="0.3" />
                  
                  {/* Pin Shape in Slate Blue matching image */}
                  <path 
                    d="M 0 0 C -5 -5 -8 -11 -8 -16 C -8 -22 -4 -26 0 -26 C 4 -26 8 -22 8 -16 C 8 -11 5 -5 0 0 Z" 
                    fill="#3B82F6" 
                    stroke="#ffffff"
                    strokeWidth="1.2"
                  />
                  {/* Inner Pin light circle */}
                  <circle cx="0" cy="-16" r="3" fill="#ffffff" />
                </g>

                {/* LIVE COURIER BIKE MARKER GLIDING ON ROUTE */}
                {simIsMoving && !isDelivered && (
                  <g transform={`translate(${riderPos.x}, ${riderPos.y})`}>
                    {/* Ring aura for live pulsing indicator */}
                    <circle cx="0" cy="0" r="8" fill="#1DB954" className="animate-ping opacity-25" />
                    <circle cx="0" cy="0" r="6" fill="#1DB954" stroke="#ffffff" strokeWidth="1.5" className="shadow-lg" />
                    
                    {/* Directional mini arrow */}
                    <polygon points="0,-2 2,2 -2,2" fill="#FFFFFF" transform="rotate(25)" />
                  </g>
                )}
              </svg>

              {/* Simulation Speed & Controls overlay panel */}
              <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/65 backdrop-blur-md px-2 py-0.5 rounded-full text-[8px] font-mono tracking-wider font-extrabold text-white">
                <span className="relative flex h-1 w-1">
                  <span className={`${simIsMoving ? 'animate-ping' : ''} absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75`}></span>
                  <span className="relative inline-flex rounded-full h-1 w-1 bg-emerald-400"></span>
                </span>
                <span>GPS Progress: {Math.round(simProgress)}%</span>
                <button
                  type="button"
                  onClick={() => setSimIsMoving(!simIsMoving)}
                  className="ml-1 bg-white/20 hover:bg-[#1db954] hover:text-black p-0.5 px-1 rounded-sm transition-all text-[7.5px]"
                >
                  {simIsMoving ? 'PAUSE' : 'PLAY'}
                </button>
              </div>

              {/* Destination Address badge inside top left map */}
              <div className="absolute top-2 left-2 bg-zinc-950/80 backdrop-blur-md p-1 px-2 rounded-lg text-[8px] font-mono max-w-[130px] truncate transition-all z-10 border border-white/5">
                <span className="text-[#1DB954] font-bold block text-[6.5px] uppercase tracking-wider">DESTINATION</span>
                <span className="text-zinc-300 font-semibold">{orderData.address}</span>
              </div>
            </div>

            {/* Shipment ID & Transit Status Row */}
            <div className="flex justify-between items-center mb-3.5">
              <div>
                <span className="text-[8px] uppercase font-mono tracking-widest text-zinc-400 block">
                  Shipment ID
                </span>
                <h3 className="text-[17px] font-mono font-black tracking-tight text-white mt-0.5">
                  {getShipmentId()}
                </h3>
              </div>
              
              {/* Dynamic Status badge matching standard */}
              <div>
                {isDelivered ? (
                  <span className="px-2.5 py-1 bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 rounded-lg text-[9px] font-black uppercase tracking-wider font-sans">
                    Delivered
                  </span>
                ) : isInKitchen || isPlaced ? (
                  <span className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-lg text-[9px] font-black uppercase tracking-wider font-sans animate-pulse">
                    Preparing
                  </span>
                ) : (
                  <span className="px-3 py-1.5 bg-[#1DB954] text-[#12131a] rounded-lg text-[9.5px] font-black tracking-wide uppercase shadow-md shadow-emerald-900/10">
                    In transit
                  </span>
                )}
              </div>
            </div>

            {/* TIMELINE STATUS HISTORY (Stark matching of the screenshot design) */}
            <div className="space-y-3.5 pl-3 relative mb-4 font-mono text-xs">
              {/* Vertical connecting line */}
              <div className="absolute left-[13px] top-2 bottom-2 w-[1px] overflow-hidden">
                {/* Blue timeline route segment */}
                <div className="h-1/2 w-full bg-cyan-400" />
                {/* Dynamic grey/dark segment if not yet delivered */}
                <div className={`h-1/2 w-full ${isDelivered ? 'bg-cyan-400' : 'bg-[#2b2e3e]'}`} />
              </div>

              {/* Milestone 1: Checking */}
              <div className="flex items-start justify-between relative pl-5 group">
                {/* Timeline Dot */}
                <div className="absolute left-[0px] top-1.5 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-[#1a1c27] z-10 transition-transform group-hover:scale-125" />
                
                <div className="space-y-0.5">
                  <span className="text-[9px] text-zinc-500 block font-normal leading-none">
                    11 Dec 2023
                  </span>
                  <h4 className="text-[11.5px] font-bold text-zinc-300 leading-tight">
                    Checking
                  </h4>
                </div>
                
                <span className="text-[10px] text-zinc-450 font-semibold font-mono">
                  {orderData.timestamp || '10:23 AM'}
                </span>
              </div>

              {/* Milestone 2: In transit */}
              <div className="flex items-start justify-between relative pl-5 group">
                {/* Glowing highlighted pin for active status */}
                <div className={`absolute left-[0px] top-1.5 w-2.5 h-2.5 rounded-full ring-2 ring-[#1a1c27] z-10 transition-transform group-hover:scale-125 ${
                  isDelivered ? 'bg-cyan-400' : isInKitchen || isPlaced ? 'bg-zinc-650' : 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]'
                }`} />
                
                <div className="space-y-0.5">
                  <span className={`text-[9px] block font-normal leading-none ${
                    isOutForDelivery || isDelivered ? 'text-zinc-500' : 'text-zinc-650'
                  }`}>
                    12 Dec 2023
                  </span>
                  <h4 className={`text-[11.5px] font-bold leading-tight ${
                    isOutForDelivery ? 'text-white' : isDelivered ? 'text-zinc-300' : 'text-zinc-600'
                  }`}>
                    In transit
                  </h4>
                </div>
                
                <span className={`text-[10px] font-semibold font-mono ${
                  isOutForDelivery || isDelivered ? 'text-zinc-450' : 'text-zinc-600'
                }`}>
                  {isOutForDelivery || isDelivered ? '10:23 AM' : '--:--'}
                </span>
              </div>

              {/* Milestone 3: Delivered */}
              <div className="flex items-start justify-between relative pl-5 group">
                {/* Timeline status dot */}
                <div className={`absolute left-[0px] top-1.5 w-2.5 h-2.5 rounded-full ring-2 ring-[#1a1c27] z-10 transition-transform group-hover:scale-125 ${
                  isDelivered 
                    ? 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]' 
                    : 'bg-zinc-700'
                }`} />
                
                <div className="space-y-0.5">
                  <span className={`text-[9px] block font-normal leading-none ${
                    isDelivered ? 'text-zinc-500' : 'text-zinc-650'
                  }`}>
                    12 Dec 2023
                  </span>
                  <h4 className={`text-[11.5px] font-bold leading-tight ${
                    isDelivered ? 'text-white' : 'text-zinc-600'
                  }`}>
                    Delivered
                  </h4>
                </div>
                
                <span className={`text-[10px] font-semibold font-mono ${
                  isDelivered ? 'text-zinc-450' : 'text-zinc-600'
                }`}>
                  {isDelivered ? (orderData.deliveredTimestamp || '11:45 AM') : '--:--'}
                </span>
              </div>
            </div>

            {/* LOWER COURIER SCHLEIFER PANEL BLOCK */}
            <div className="rounded-[16px] bg-[#222433] p-3 flex items-center justify-between border border-white/5 shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80" 
                    alt="Courier avatar Schleifer" 
                    className="w-9 h-9 rounded-full object-cover border border-white/10"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#1DB954] border-2 border-[#222433] rounded-full" />
                </div>
                
                <div className="text-left leading-none">
                  <span className="text-[8px] text-zinc-400 block tracking-wide uppercase font-mono mb-0.5">
                    Courier
                  </span>
                  <h4 className="text-[13px] font-sans font-black text-white tracking-tight leading-none">
                    {orderData.assignedRiderName || 'Schleifer'}
                  </h4>
                </div>
              </div>

              {/* Action buttons (Phone & Live Chat) with slick animations and badge notifications */}
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={handleStartCall}
                  className="w-8 h-8 rounded-full border border-zinc-700 hover:border-zinc-600 flex items-center justify-center text-zinc-300 hover:text-white transition-all cursor-pointer bg-zinc-900/40 hover:bg-[#2b2e3e] hover:scale-105 active:scale-95"
                  title="Call dispatcher rider"
                >
                  <Phone className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowChatDrawer(true)}
                  className="w-8 h-8 rounded-full border border-zinc-700 hover:border-zinc-600 flex items-center justify-center text-zinc-300 hover:text-white transition-all cursor-pointer bg-zinc-900/40 hover:bg-[#2b2e3e] hover:scale-105 active:scale-95 relative"
                  title="Chat with dispatcher Schleifer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="absolute -top-1 -right-0.5 w-3.5 h-3.5 bg-cyan-500 rounded-full flex items-center justify-center text-[7.5px] font-black text-black font-mono">
                    1
                  </span>
                </button>
              </div>
            </div>

            {/* EXTRA DYNAMIC INSTRUCTIONS PANEL */}
            <div className="mt-3 p-2.5 bg-zinc-900/20 rounded-xl border border-zinc-800/80 text-[9px] text-zinc-400 flex items-start gap-1.5 select-none leading-relaxed">
              <AlertCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5 animate-bounce" style={{ animationDuration: '3.3s' }} />
              <p>
                GPS coordinated delivery route with active kitchen updates. Instruct courier via Call/Chat keys.
              </p>
            </div>

            {/* ==================== OUTGOING PHONE CALL SIMULATOR WIDGET ==================== */}
            <AnimatePresence>
              {showCallScreen && (
                <motion.div
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 100 }}
                  className="absolute inset-0 bg-[#0d0F16] z-50 p-5 flex flex-col justify-between items-center text-center rounded-[24px]"
                >
                  <div className="space-y-1 mt-4">
                    <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-mono block">OUTGOING DISPATCH CALL</span>
                    <h3 className="text-lg font-black text-white">{orderData.assignedRiderName || 'Schleifer'}</h3>
                    <p className="text-[10px] text-zinc-400 font-mono">Courier Network • Route Marconi Park</p>
                  </div>

                  <div className="my-auto space-y-2 flex flex-col items-center">
                    <div className="relative w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                      {/* Pulse concentric rings */}
                      <span className="absolute inset-0 rounded-full border border-emerald-500/30 animate-ping opacity-25" />
                      
                      <Phone className="w-7 h-7 text-emerald-400 animate-bounce" style={{ animationDuration: '2.5s' }} />
                    </div>
                    
                    <span className="text-[10px] font-mono font-bold tracking-widest text-[#1DB954] mt-2 uppercase animate-pulse">
                      {callState === 'ringing' ? 'Ringing dispatch...' : `Connected • ${Math.floor(callDuration / 60)}:${(callDuration % 60).toString().padStart(2, '0')}`}
                    </span>

                    {callState === 'connected' && (
                      <p className="text-[10px] text-zinc-400 italic max-w-[240px] bg-zinc-950 p-2.5 rounded-xl border border-zinc-805 mt-1 lines-clamp-3">
                        "Hey! Schleifer here. I'm turning around Marconi Park now. Hot meal sealed. Standard drop?"
                      </p>
                    )}
                  </div>

                  <div className="w-full space-y-4 mb-2">
                    <div className="flex justify-around text-[10px] text-zinc-400 max-w-[220px] mx-auto">
                      <div className="flex flex-col items-center gap-1">
                        <span className="w-8 h-8 rounded-full bg-zinc-900/50 hover:bg-zinc-800 flex items-center justify-center text-white"><Shield className="w-3.5 h-3.5" /></span>
                        <span>Mute</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <span className="w-8 h-8 rounded-full bg-zinc-900/50 hover:bg-zinc-800 flex items-center justify-center text-white"><User className="w-3.5 h-3.5" /></span>
                        <span>Keypad</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <span className="w-8 h-8 rounded-full bg-zinc-900/50 hover:bg-zinc-800 flex items-center justify-center text-white"><Navigation className="w-3.5 h-3.5" /></span>
                        <span>Speaker</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleEndCall}
                      className="w-10 h-10 bg-rose-600 hover:bg-rose-700 rounded-full flex items-center justify-center text-white shadow-lg mx-auto transform hover:scale-105 active:scale-95 transition-all text-xs uppercase font-extrabold cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ==================== DISPATCH COURIER CHAT DRAWERS PANEL ==================== */}
            <AnimatePresence>
              {showChatDrawer && (
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 22, stiffness: 200 }}
                  className="absolute inset-y-0 right-0 left-10 bg-[#12131a] border-l border-zinc-800 z-40 flex flex-col shadow-2xl justify-between rounded-r-[24px]"
                >
                  {/* Chat header */}
                  <div className="p-3 border-b border-zinc-800 bg-[#161722] flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <img 
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&auto=format&fit=crop&q=80" 
                        alt="Rider miniature" 
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <div className="text-left leading-none">
                        <h4 className="text-[11px] font-bold text-white">Rider {orderData.assignedRiderName || 'Schleifer'}</h4>
                        <span className="text-[7.5px] text-[#1DB954] font-mono font-black tracking-widest block uppercase mt-0.5">Active Transmit</span>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setShowChatDrawer(false)}
                      className="p-1 px-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 text-[9px] font-bold border border-zinc-800"
                    >
                      Close
                    </button>
                  </div>

                  {/* Chat bubble logs */}
                  <div className="flex-1 p-3 overflow-y-auto space-y-2.5 scrollbar-thin text-[10.5px] leading-relaxed select-text font-sans">
                    {chatMessages.map((msg, mIdx) => (
                      <div 
                        key={mIdx}
                        className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                      >
                        <div className={`p-2.5 rounded-xl ${
                          msg.sender === 'user' 
                            ? 'bg-cyan-600 text-white rounded-tr-none' 
                            : 'bg-zinc-900 text-zinc-300 rounded-tl-none border border-zinc-800/80'
                        }`}>
                          <p>{msg.text}</p>
                        </div>
                        <span className="text-[7.5px] text-zinc-500 mt-0.5 uppercase font-mono px-1">
                          {msg.sender === 'user' ? 'Sent' : 'Schleifer'}
                        </span>
                      </div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                      <div className="flex items-center gap-1 text-zinc-500 font-mono text-[8px] pl-2">
                        <Loader2 className="w-2.5 h-2.5 animate-spin text-[#1DB954]" />
                        <span>Is typing...</span>
                      </div>
                    )}
                  </div>

                  {/* Message Input controls */}
                  <div className="p-2.5 bg-zinc-950/80 border-t border-zinc-900">
                    {/* Quick helper tag list */}
                    <div className="flex gap-1 overflow-x-auto pb-1.5 scrollbar-none">
                      <button
                        type="button"
                        onClick={() => setChatInput('Leave at the reception desk, please.')}
                        className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800 p-1 px-2 rounded-full text-[8px] whitespace-nowrap"
                      >
                        📬 Desk
                      </button>
                      <button
                        type="button"
                        onClick={() => setChatInput('Ring bell, leave outside door.')}
                        className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800 p-1 px-2 rounded-full text-[8px] whitespace-nowrap"
                      >
                        🔔 Ring
                      </button>
                      <button
                        type="button"
                        onClick={() => setChatInput('What is your current ETA?')}
                        className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800 p-1 px-2 rounded-full text-[8px] whitespace-nowrap"
                      >
                        ⏳ ETA
                      </button>
                    </div>

                    <form onSubmit={handleSendMessage} className="flex gap-1.5">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Message..."
                        className="flex-1 bg-zinc-900 border border-zinc-800 text-[11px] px-2.5 py-1.5 rounded-lg text-white outline-none focus:ring-1 focus:ring-[#1DB954] placeholder-zinc-650"
                      />
                      <button
                        type="submit"
                        className="p-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 transition-colors text-white shrink-0"
                      >
                        <Send className="w-3 h-3" />
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
