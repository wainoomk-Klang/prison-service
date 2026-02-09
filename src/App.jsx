import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, MessageCircle, UserCog, Send, Calendar, CreditCard, 
  FileText, Phone, Video, Info, LogOut, ChevronLeft, X, 
  PhoneCall, ShoppingCart, Mail, MapPin, Megaphone, Trash2, PlusCircle, ShieldCheck, Check, XCircle, UserPlus, Users, NotebookPen, BarChart3, RotateCcw, Activity, Wallet, Search, Image as ImageIcon, Snowflake
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInAnonymously, onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, collection, addDoc, onSnapshot, updateDoc, doc, serverTimestamp, deleteDoc, increment, setDoc, getDoc 
} from 'firebase/firestore';

// ------------------------------------------------------------------
// ⚠️ ส่วนที่ต้องแก้ไข: ใส่รหัส Firebase ของคุณตรงนี้
// ------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyCLcHl_DENEAGZucJem_9SLnp0tJBdsM94",
  authDomain: "prison-service.firebaseapp.com",
  projectId: "prison-service",
  storageBucket: "prison-service.firebasestorage.app",
  messagingSenderId: "1025264686977",
  appId: "1:1025264686977:web:229925afb5e7daa5d77a80"
};

// เริ่มต้นระบบ
let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.error("Firebase Error: ยังไม่ได้ใส่รหัส Config หรือใส่ผิด", e);
}

const appId = 'prison-service-v1'; // ตั้งชื่อแอพ

const ADMIN_USERS = {
  '1279': { name: 'Admin', role: 'super_admin', color: 'text-purple-600' }
};

// --- Custom Components: Snowfall Effect ---
const Snowfall = () => {
  // สร้างหิมะ 30 เม็ด
  const snowflakes = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDuration: `${Math.random() * 5 + 5}s`, // 5-10 วินาที
    animationDelay: `${Math.random() * 5}s`,
    opacity: Math.random() * 0.5 + 0.1,
    size: Math.random() * 10 + 5,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute top-[-20px] rounded-full bg-white blur-[1px]"
          style={{
            left: flake.left,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            opacity: flake.opacity,
            animation: `fall ${flake.animationDuration} linear infinite`,
            animationDelay: flake.animationDelay,
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-20px) translateX(0); }
          50% { transform: translateY(50vh) translateX(20px); }
          100% { transform: translateY(105vh) translateX(-20px); }
        }
      `}</style>
    </div>
  );
};

// --- Custom Icons ---
const LineBookingIcon = () => (
  <div className="relative w-14 h-14 flex items-center justify-center">
    <div className="absolute inset-0 bg-white/20 rounded-full blur-md"></div>
    <div className="relative z-10">
       <NotebookPen className="text-white w-8 h-8 drop-shadow-md" strokeWidth={2} />
       <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
          <img src="https://img.icons8.com/fluency/48/line-me.png" alt="Line" className="w-4 h-4" />
       </div>
    </div>
  </div>
);

const CheckMoneyIcon = () => (
  <div className="relative w-12 h-12 flex items-center justify-center transition-transform group-hover:scale-110">
    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-md rotate-3"></div>
    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg -rotate-3 opacity-80"></div>
    <div className="relative z-10 flex items-center justify-center w-full h-full bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-xl shadow-inner border border-white/20">
       <div className="relative">
          <img src="https://img.icons8.com/fluency/96/wallet.png" alt="Wallet" className="w-7 h-7 drop-shadow-md" />
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-gray-100">
             <img src="https://img.icons8.com/fluency/48/search.png" alt="Search" className="w-4 h-4" />
          </div>
       </div>
    </div>
  </div>
);

// --- ข้อมูลบริการ (แบบ Dashboard) ---
const SERVICES = {
  hero: {
    id: 2,
    title: "จองเยี่ยมออนไลน์",
    subtitle: "จองคิวเยี่ยมญาติผ่านไลน์",
    icon: <LineBookingIcon />,
    color: "bg-gradient-to-r from-green-500 to-emerald-600 text-white",
    url: "https://line.me/R/ti/p/@414picns"
  },
  finance: [
    {
      id: 3,
      title: "ทำบัตรฝากเงินผู้ต้องขัง",
      icon: <img src="https://img.icons8.com/fluency/96/card-wallet.png" className="w-10 h-10 object-contain"/>,
      color: "bg-white/80",
      textColor: "text-gray-800",
      url: "https://line.me/R/ti/p/@800sowjt"
    },
    {
      id: 11,
      title: "ตรวจเงินฝากออนไลน์",
      icon: <CheckMoneyIcon />, 
      color: "bg-white/80",
      textColor: "text-gray-800",
      url: "https://cyci-deposit.web.app/"
    }
  ],
  shopping: [
    {
      id: 1,
      title: "ซื้อสินค้าออนไลน์",
      icon: <img src="https://img.icons8.com/fluency/96/shopping-bag.png" className="w-10 h-10 object-contain"/>,
      color: "bg-white/80",
      url: "https://line.me/R/ti/p/@497pfcsg"
    },
    {
      id: 12,
      title: "จดหมาย DomiMail",
      icon: <img src="https://img.icons8.com/fluency/96/mail.png" className="w-10 h-10 object-contain"/>,
      color: "bg-white/80",
      action: 'domimail',
      url: "https://domimail-load-2025.web.app/"
    }
  ],
  social: [
    {
      id: 9,
      title: "Facebook",
      icon: <img src="https://img.icons8.com/fluency/96/facebook-new.png" className="w-8 h-8 object-contain"/>,
      color: "bg-blue-50/80 border-blue-100",
      url: "https://www.facebook.com/profile.php?id=100085123968181"
    },
    {
      id: 8,
      title: "แผนที่",
      icon: <img src="https://upload.wikimedia.org/wikipedia/commons/a/aa/Google_Maps_icon_%282020%29.svg" className="w-8 h-8 object-contain"/>,
      color: "bg-red-50/80 border-red-100",
      url: "https://maps.app.goo.gl/zVNwXmuahTLjKKHo6" 
    }
  ]
};

const ALL_SERVICES_LIST = [
  SERVICES.hero,
  ...SERVICES.finance,
  ...SERVICES.shopping,
  ...SERVICES.social
];

// --- Components ---

const HeroButton = ({ item, onClick }) => (
  <button 
    onClick={() => onClick(item)}
    className={`w-full p-6 rounded-3xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-between font-prompt ${item.color} mb-6 relative overflow-hidden group backdrop-blur-md`}
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full translate-x-10 -translate-y-10 blur-xl group-hover:scale-150 transition-transform duration-700"></div>
    <div className="flex flex-col items-start z-10 text-left">
      <span className="text-2xl font-bold">{item.title}</span>
      <span className="text-sm opacity-90 font-light">{item.subtitle}</span>
    </div>
    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm z-10 shadow-inner">
      {item.icon}
    </div>
  </button>
);

const ServiceCard = ({ item, onClick }) => (
  <button 
    onClick={() => onClick(item)}
    className={`flex flex-col items-center justify-center p-4 h-32 rounded-3xl shadow-md border border-gray-100/50 hover:shadow-lg hover:-translate-y-1 active:scale-95 transition-all duration-300 font-prompt ${item.color} backdrop-blur-md`}
  >
    <div className="mb-2 transform transition-transform group-hover:scale-110">{item.icon}</div>
    <span className="text-sm font-bold text-gray-700 text-center leading-tight px-1">{item.title}</span>
  </button>
);

const MiniCard = ({ item, onClick }) => (
  <button 
    onClick={() => onClick(item)}
    className={`flex items-center gap-3 p-3 px-4 rounded-2xl border border-white/50 shadow-sm hover:shadow-md active:scale-95 transition-all duration-300 font-prompt w-full ${item.color} backdrop-blur-md`}
  >
    {item.icon}
    <span className="text-sm font-bold text-gray-700">{item.title}</span>
  </button>
);

const GlassCallButton = () => (
  <a href="tel:021932301" target="_self" className="relative flex items-center justify-between px-6 py-4 w-full bg-white/60 backdrop-blur-xl border border-white/60 shadow-lg rounded-full mb-6 active:scale-95 transition-all duration-300 group z-10">
    <div className="flex items-center gap-4">
      <div className="bg-emerald-100 p-2.5 rounded-full text-emerald-600 group-hover:animate-bounce"><PhoneCall size={24} /></div>
      <div className="text-left">
        <div className="text-[10px] text-gray-500 font-prompt">สอบถามเจ้าหน้าที่</div>
        <div className="text-lg font-bold text-emerald-600 font-prompt leading-none">02-193-2301</div>
      </div>
    </div>
    <ChevronLeft size={20} className="text-gray-400 rotate-180" />
  </a>
);

const AnnouncementBar = ({ announcements }) => {
  const [isVisible, setIsVisible] = useState(true);
  if (!announcements || announcements.length === 0 || !isVisible) return null;
  const latest = announcements[0]; 

  return (
    <div className="mx-4 mb-6 animate-slide-down-fade z-20 relative">
       <div className="bg-gradient-to-r from-orange-100/90 to-red-50/90 border border-orange-200 p-4 rounded-2xl flex flex-col gap-2 relative overflow-hidden shadow-sm backdrop-blur-md">
          <button 
            onClick={() => setIsVisible(false)}
            className="absolute top-2 right-2 text-orange-400 hover:text-orange-600 bg-white/50 hover:bg-white p-1 rounded-full transition-colors z-20"
          >
            <X size={18} />
          </button>

          <div className="flex gap-2 items-center pr-6">
            <div className="bg-orange-500 p-1.5 rounded-lg text-white shrink-0 animate-pulse">
               <Megaphone size={16} />
            </div>
            <h4 className="text-orange-800 font-bold text-sm font-prompt">ประกาศสำคัญ</h4>
          </div>
          
          <div className="z-10 pl-1">
             <p className="text-gray-700 text-sm font-prompt leading-relaxed whitespace-pre-wrap">{latest.text}</p>
             {latest.imageUrl && <img src={latest.imageUrl} className="mt-2 rounded-lg w-full h-auto max-h-48 object-cover border border-orange-200" alt="ประกาศ" />}
             <p className="text-[10px] text-gray-400 mt-2 font-prompt text-right">{latest.timestamp?.toDate ? new Date(latest.timestamp.toDate()).toLocaleDateString('th-TH') : ''}</p>
          </div>
       </div>
    </div>
  );
};

const MaintenanceModal = ({ onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
    <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl" onClick={e => e.stopPropagation()}>
      <div className="mx-auto w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mb-4 border-4 border-yellow-100">
         <img src="https://img.icons8.com/fluency/96/maintenance.png" alt="Maintenance" className="w-10 h-10" />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2 font-prompt">ปิดปรับปรุงชั่วคราว</h3>
      <button onClick={onClose} className="w-full py-3 bg-yellow-500 text-white rounded-xl font-bold mt-4 font-prompt">ตกลง</button>
    </div>
  </div>
);

// --- New Component: Announcement Poster Overlay ---
const AnnouncementOverlay = ({ announcement, onClose }) => {
  if (!announcement) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in" onClick={onClose}>
      <div className="relative w-full max-w-lg bg-transparent rounded-2xl overflow-hidden shadow-2xl cursor-pointer transform transition-all hover:scale-[1.01]" onClick={e => e.stopPropagation()}>
         <div onClick={onClose}>
            {announcement.imageUrl ? (
                <img src={announcement.imageUrl} alt="ประกาศ" className="w-full h-auto object-contain rounded-2xl max-h-[80vh]"/>
            ) : (
                <div className="bg-white p-8 text-center rounded-2xl" onClick={onClose}>
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <Megaphone size={32} className="text-red-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 font-prompt mb-4">ประกาศสำคัญ</h3>
                    <p className="text-lg text-gray-700 font-prompt leading-relaxed whitespace-pre-wrap">{announcement.text}</p>
                </div>
            )}
            {announcement.imageUrl && announcement.text && (
                <div className="bg-white p-4 -mt-1 rounded-b-2xl border-t border-gray-100">
                    <p className="text-gray-800 text-sm font-prompt text-center leading-relaxed">{announcement.text}</p>
                </div>
            )}
         </div>
      </div>
      <button onClick={onClose} className="mt-8 text-white font-prompt text-sm font-medium opacity-80 flex flex-col items-center gap-2 animate-pulse hover:opacity-100 transition-opacity">
         <span>แตะที่นี่เพื่อปิด</span>
         <XCircle size={32} />
      </button>
    </div>
  );
};

// --- Main App ---
export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home'); 
  const [announcements, setAnnouncements] = useState([]); 
  const [newAnnouncement, setNewAnnouncement] = useState(""); 
  const [newImage, setNewImage] = useState(null); 
  const [visitorCount, setVisitorCount] = useState(0); 
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [clickStats, setClickStats] = useState({}); 
  const [adminPin, setAdminPin] = useState("");
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [currentUserInfo, setCurrentUserInfo] = useState(null); 
  const [loginError, setLoginError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const fileInputRef = useRef(null);
  const [showAnnouncementPopup, setShowAnnouncementPopup] = useState(false); 
  
  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => { try { await signInAnonymously(auth); } catch (e) { console.error(e); } };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (!user || !db) return;
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'announcements');
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      items.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      setAnnouncements(items);
      if (items.length > 0) setShowAnnouncementPopup(true);
    });
  }, [user]);

  useEffect(() => {
    if (!db) return;
    const statsRef = doc(db, 'artifacts', appId, 'public', 'data', 'statistics', 'visitor_count');
    const trackVisit = async () => {
      const visited = sessionStorage.getItem('has_visited_cyi_2026');
      if (!visited) {
        try { await setDoc(statsRef, { count: increment(1) }, { merge: true }); sessionStorage.setItem('has_visited_cyi_2026', 'true'); } 
        catch (e) { console.error(e); }
      }
    };
    trackVisit();
    const unsubscribeVisit = onSnapshot(statsRef, (doc) => { if (doc.exists()) setVisitorCount(doc.data().count || 0); });
    const unsubscribeClicks = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'statistics'), (snapshot) => {
       const stats = {};
       snapshot.docs.forEach(doc => { if (doc.id !== 'visitor_count') stats[doc.id] = doc.data().count || 0; });
       setClickStats(stats);
    });
    return () => { unsubscribeVisit(); unsubscribeClicks(); };
  }, []);

  const trackButtonClick = async (buttonName) => {
    if (!db) return;
    try {
      const btnRef = doc(db, 'artifacts', appId, 'public', 'data', 'statistics', buttonName);
      await setDoc(btnRef, { count: increment(1), name: buttonName }, { merge: true });
    } catch (e) { console.error("Error", e); }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    const matchedUser = ADMIN_USERS[adminPin];
    if (matchedUser) { setIsAdminLoggedIn(true); setCurrentUserInfo(matchedUser); setAdminPin(""); setLoginError(""); } 
    else { setLoginError("รหัสผ่านไม่ถูกต้อง"); }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 800 * 1024) { alert("รูปใหญ่เกินไป (ต้องไม่เกิน 800KB)"); return; }
        const reader = new FileReader();
        reader.onloadend = () => setNewImage(reader.result);
        reader.readAsDataURL(file);
    }
  };

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    if ((!newAnnouncement.trim() && !newImage) || !user || !db) return;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'announcements'), {
      text: newAnnouncement, imageUrl: newImage, timestamp: serverTimestamp(), author: currentUserInfo?.name, userId: user.uid
    });
    setNewAnnouncement(""); setNewImage(null);
  };

  const confirmDeleteAnnouncement = async (id) => {
    if(!db) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'announcements', id));
    setDeletingId(null);
  };

  const handleServiceClick = (item) => {
    trackButtonClick(item.title);
    if (item.action === 'maintenance') { setShowMaintenanceModal(true); return; }
    if (item.action === 'domimail') {
       window.open('https://domimail-load-2025.web.app/', '_blank');
    } else if (item.url) {
       window.open(item.url, '_blank');
    }
  };

  const handleRefresh = () => window.location.reload();
  const totalClicks = Object.values(clickStats).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen font-sans bg-[#F5F7FA] fixed inset-0 overflow-y-auto">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');
        .font-prompt { font-family: 'Prompt', sans-serif; }
        .bg-pattern {
            background-color: #f5f7fa;
            background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
      `}</style>
      
      {/* Background with Pattern & Snow */}
      <div className="fixed inset-0 bg-pattern -z-20"></div>
      <Snowfall />

      {/* Top Gradient */}
      <div className="fixed top-0 left-0 right-0 h-[300px] bg-gradient-to-b from-blue-100/80 to-transparent -z-10 rounded-b-[50px]"></div>

      <header className="relative z-30 pt-12 pb-2 px-6 animate-slide-down-fade">
        <div className="max-w-md mx-auto text-center">
             <div className="mb-4 relative inline-block group cursor-pointer z-10" onClick={() => setActiveTab('admin')}>
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full blur-xl opacity-60"></div>
                {/* เพิ่มแอนิเมชั่นลอยตัวให้โลโก้ */}
                <img src="/logo.png" alt="Logo CYI" className="relative w-28 h-28 object-contain drop-shadow-xl animate-bounce duration-[3000ms]" />
             </div>
             <h1 className="text-2xl font-bold text-gray-800 font-prompt">ศูนย์รวมบริการดิจิทัล</h1>
             <p className="text-gray-500 text-sm font-prompt">ทัณฑสถานวัยหนุ่มกลาง</p>
        </div>
      </header>

      <main className="relative z-10 max-w-md mx-auto px-5 pb-24 font-prompt">
        {activeTab === 'home' && (
          <div className="space-y-4">
            <AnnouncementBar announcements={announcements} />
            <GlassCallButton />

            {/* โซน 1: บริการยอดนิยม (จองเยี่ยม) */}
            <div>
               <h3 className="text-gray-500 font-bold text-sm mb-3 ml-2 flex items-center gap-2"><Video size={16}/> บริการเยี่ยมญาติ</h3>
               <HeroButton item={SERVICES.hero} onClick={handleServiceClick} />
            </div>

            {/* โซน 2: การเงิน */}
            <div>
               <h3 className="text-gray-500 font-bold text-sm mb-3 ml-2 flex items-center gap-2"><CreditCard size={16}/> การเงิน</h3>
               <div className="grid grid-cols-2 gap-3">
                  {SERVICES.finance.map(item => <ServiceCard key={item.id} item={item} onClick={handleServiceClick} />)}
               </div>
            </div>

            {/* โซน 3: ร้านค้าและจดหมาย */}
            <div>
               <h3 className="text-gray-500 font-bold text-sm mb-3 ml-2 flex items-center gap-2"><ShoppingCart size={16}/> ร้านค้าและจดหมาย</h3>
               <div className="grid grid-cols-2 gap-3">
                  {SERVICES.shopping.map(item => <ServiceCard key={item.id} item={item} onClick={handleServiceClick} />)}
               </div>
            </div>

            {/* โซน 4: ข้อมูล (ปุ่มเล็กแนวนอน) */}
            <div className="bg-white/50 p-4 rounded-3xl border border-white/50 shadow-sm mt-4 backdrop-blur-sm">
               <h3 className="text-gray-500 font-bold text-xs mb-3 font-prompt ml-1">ข้อมูลและการเดินทาง</h3>
               <div className="grid grid-cols-2 gap-3">
                  {SERVICES.social.map(item => <MiniCard key={item.id} item={item} onClick={handleServiceClick} />)}
               </div>
            </div>

            {/* Footer + ทางเข้าลับ */}
            <div className="mt-8 text-center pb-8" onClick={() => setActiveTab('admin')}>
               <div className="flex justify-center opacity-20 mb-2"><BarChart3 size={16}/></div>
               <p className="text-[10px] text-gray-400 font-prompt">
                  ทัณฑสถานวัยหนุ่มกลาง<br/>22/4 หมู่3 ต.คลองหก อ.คลองหลวง จ.ปทุมธานี 12120
               </p>
            </div>
          </div>
        )}

        {/* Admin Login Section */}
        {activeTab === 'admin' && (
           <div className="pt-10 animate-fade-in">
             {!isAdminLoggedIn ? (
               <div className="bg-white/80 backdrop-blur-xl border border-white p-8 rounded-[32px] text-center shadow-lg mx-4">
                 <h2 className="text-xl font-bold text-gray-800 mb-4 font-prompt">เจ้าหน้าที่ Login</h2>
                 <form onSubmit={handleAdminLogin}>
                   <input type="password" value={adminPin} onChange={(e) => setAdminPin(e.target.value)} className="w-full bg-gray-50 border rounded-xl p-3 text-center text-2xl mb-4 outline-none focus:ring-2 focus:ring-purple-200" placeholder="PIN" maxLength={4} />
                   {loginError && <p className="text-red-500 text-sm mb-4">{loginError}</p>}
                   <button type="submit" className="w-full bg-purple-600 text-white p-3 rounded-xl font-bold shadow-lg active:scale-95 font-prompt">เข้าสู่ระบบ</button>
                 </form>
                 <button onClick={() => setActiveTab('home')} className="mt-4 text-gray-400 text-sm underline">กลับหน้าหลัก</button>
               </div>
             ) : (
                <div className="space-y-6 mx-4">
                   <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                      <div>
                        <span className="text-xs text-gray-400 uppercase">Login as</span>
                        <div className="font-bold text-purple-600">{currentUserInfo?.name}</div>
                      </div>
                      <button onClick={() => { setIsAdminLoggedIn(false); setActiveTab('home'); }} className="text-red-500 bg-red-50 px-4 py-2 rounded-lg text-sm font-bold">ออก</button>
                   </div>
                   
                   <div className="bg-white p-6 rounded-3xl shadow-sm font-prompt border border-gray-100">
                      <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Activity size={18}/> สถิติ</h3>
                      <div className="flex gap-4">
                          <div className="flex-1 bg-blue-50 p-4 rounded-xl text-center border border-blue-100">
                             <div className="text-2xl font-black text-blue-600">{visitorCount.toLocaleString()}</div>
                             <div className="text-xs text-gray-500">ผู้เข้าชมทั้งหมด</div>
                             <div className="text-[9px] text-gray-400 mt-1">เริ่ม 21 ม.ค. 69</div>
                          </div>
                          <div className="flex-1 bg-green-50 p-4 rounded-xl text-center border border-green-100">
                             <div className="text-2xl font-black text-green-600">{totalClicks.toLocaleString()}</div>
                             <div className="text-xs text-gray-500">ยอดกดปุ่ม</div>
                          </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-100">
                         {ALL_SERVICES_LIST.map(link => (
                            <div key={link.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                               <span className="text-sm text-gray-600">{link.title}</span>
                               <span className="text-sm font-bold bg-gray-100 px-2 rounded-md">{clickStats[link.title] || 0}</span>
                            </div>
                         ))}
                      </div>
                   </div>

                   <div className="bg-white p-6 rounded-3xl shadow-sm font-prompt border border-gray-100">
                      <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Megaphone size={18}/> ประกาศข่าว</h3>
                      <form onSubmit={handleAddAnnouncement} className="flex flex-col gap-3">
                         <textarea value={newAnnouncement} onChange={(e) => setNewAnnouncement(e.target.value)} className="bg-gray-50 p-3 rounded-xl text-sm min-h-[80px] outline-none border focus:border-purple-300" placeholder="ข้อความประกาศ..."/>
                         <div className="flex gap-2">
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                            <button type="button" onClick={() => fileInputRef.current.click()} className="bg-gray-100 p-3 rounded-xl hover:bg-gray-200"><ImageIcon size={20} className="text-gray-600"/></button>
                            {newImage && <span className="text-xs text-green-500 self-center bg-green-50 px-2 py-1 rounded">มีรูปภาพ ✅</span>}
                            <button type="submit" disabled={!newAnnouncement && !newImage} className="flex-1 bg-purple-600 text-white rounded-xl font-bold text-sm shadow-md active:scale-95">โพสต์</button>
                         </div>
                         {newImage && <div className="relative w-fit"><img src={newImage} className="h-20 w-auto object-cover rounded-lg border mt-2" /><button onClick={() => setNewImage(null)} type="button" className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"><X size={12}/></button></div>}
                      </form>
                      
                      <div className="mt-4 space-y-3">
                        {announcements.map(ann => (
                           <div key={ann.id} className="bg-gray-50 p-3 rounded-xl text-sm flex flex-col gap-2 relative border border-gray-100">
                              {ann.text && <div>{ann.text}</div>}
                              {ann.imageUrl && <img src={ann.imageUrl} className="h-24 w-auto object-cover rounded-lg border"/>}
                              <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-1">
                                 <span className="text-[10px] text-gray-400">{ann.timestamp?.toDate ? new Date(ann.timestamp.toDate()).toLocaleDateString('th-TH') : ''}</span>
                                 {deletingId === ann.id ? (
                                    <div className="flex gap-2">
                                       <button onClick={() => confirmDeleteAnnouncement(ann.id)} className="text-red-500 font-bold text-xs">ยืนยันลบ</button>
                                       <button onClick={() => setDeletingId(null)} className="text-gray-400 text-xs">ยกเลิก</button>
                                    </div>
                                 ) : (
                                    <button onClick={() => setDeletingId(ann.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={16}/></button>
                                 )}
                              </div>
                           </div>
                        ))}
                      </div>
                   </div>
                </div>
             )}
           </div>
        )}
      </main>

      {/* ✅ ย้าย AnnouncementOverlay มาไว้นอกสุด เพื่อให้ z-index ทำงานถูกต้อง */}
      {showAnnouncementPopup && announcements.length > 0 && activeTab === 'home' && (
          <AnnouncementOverlay 
              announcement={announcements[0]} 
              onClose={() => setShowAnnouncementPopup(false)} 
          />
      )}

      <button onClick={handleRefresh} className="fixed bottom-6 right-6 bg-white p-3 rounded-full shadow-lg border text-gray-600 hover:text-blue-600 active:scale-95 z-50">
        <RotateCcw size={24} />
      </button>

      {showMaintenanceModal && <MaintenanceModal onClose={() => setShowMaintenanceModal(false)} />}
    </div>
  );
}
