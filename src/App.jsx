import React, { useState, useEffect } from 'react';
import { 
  Home, MessageCircle, UserCog, Send, Calendar, CreditCard, 
  FileText, Phone, Video, Info, LogOut, ChevronLeft, X, 
  PhoneCall, ShoppingCart, Mail, QrCode 
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInAnonymously, onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, collection, addDoc, onSnapshot, updateDoc, doc, serverTimestamp, deleteDoc 
} from 'firebase/firestore';

// ------------------------------------------------------------------
// ⚠️ ส่วนที่ต้องแก้ไข: ใส่รหัส Firebase ของคุณตรงนี้
// (ก๊อปปี้จากหน้าเว็บ Firebase Console มาทับตรงนี้ได้เลย)
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
// (ใส่ try-catch กันจอขาว กรณีลืมใส่รหัส)
let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.error("Firebase Error: ยังไม่ได้ใส่รหัส Config หรือใส่ผิด", e);
}

const appId = 'prison-service-v1'; // ตั้งชื่อแอพ

// --- ข้อมูลปุ่มเมนู ---
const SERVICE_LINKS = [
  { 
    id: 1, 
    title: "ซื้อสินค้าออนไลน์", 
    icon: <ShoppingCart size={32} />, 
    color: "text-blue-600 bg-blue-100/50", 
    url: "https://line.me/R/ti/p/@497pfcsg" 
  },
  { 
    id: 2, 
    title: "เยี่ยมออนไลน์", 
    icon: <Video size={32} />, 
    color: "text-purple-600 bg-purple-100/50", 
    url: "https://line.me/R/ti/p/@414picns" 
  },
  { 
    id: 3, 
    title: "ทำบัตรฝากเงิน", 
    icon: <CreditCard size={32} />, 
    color: "text-emerald-600 bg-emerald-100/50", 
    url: "https://line.me/R/ti/p/@800sowjt" 
  },
  { 
    id: 4, 
    title: "จดหมายออนไลน์", 
    icon: <Mail size={32} />, 
    color: "text-orange-600 bg-orange-100/50", 
    url: "https://www.domimail.net/" 
  },
  { 
    id: 7, 
    title: "ฝากคำถาม", 
    icon: <MessageCircle size={32} />, 
    color: "text-pink-600 bg-pink-100/50", 
    action: 'qa' 
  },
  { 
    id: 6, 
    title: "ข้อมูลทั่วไป", 
    icon: <Info size={32} />, 
    color: "text-indigo-600 bg-indigo-100/50", 
    url: "#info" 
  },
];

// --- Components ---

const QrModal = ({ link, onClose }) => {
  if (!link) return null;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(link.url)}`;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl transform transition-all scale-100" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">QR Code</h3>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-500"><X size={20} /></button>
        </div>
        <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-200 mb-4 flex justify-center">
          <img src={qrImageUrl} alt="QR Code" className="w-48 h-48 object-contain" />
        </div>
        <h4 className="font-bold text-gray-800 text-lg mb-1">{link.title}</h4>
        <button onClick={onClose} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 mt-4">ปิดหน้าต่าง</button>
      </div>
    </div>
  );
};

const GlassButton = ({ link, onNavigate, onShowQr }) => {
  const handleClick = (e) => {
    if (link.action) { e.preventDefault(); onNavigate(link.action); }
  };
  const handleQrClick = (e) => { e.stopPropagation(); e.preventDefault(); onShowQr(link); };
  const hasQr = link.url && !link.url.startsWith('#') && !link.url.startsWith('tel:');
  const isTel = link.url && link.url.startsWith('tel:');

  return (
    <a 
      href={link.url || '#'} onClick={handleClick} target={link.url && !link.url.startsWith('#') && !isTel ? "_blank" : "_self"}
      className="group relative flex flex-col items-center justify-center p-3 h-44 w-full bg-white/20 backdrop-blur-md border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] rounded-2xl hover:bg-white/30 hover:scale-[1.02] active:scale-95 transition-all duration-300"
    >
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-2xl pointer-events-none"></div>
      {hasQr && (
        <button onClick={handleQrClick} className="absolute top-2 right-2 p-1.5 bg-white/40 hover:bg-white rounded-full text-gray-600 hover:text-black z-10 backdrop-blur-sm border border-white/50">
          <QrCode size={16} />
        </button>
      )}
      <div className={`p-3.5 rounded-full mb-2 shadow-sm backdrop-blur-sm ${link.color} group-hover:-translate-y-1 transition-transform`}>{link.icon}</div>
      <span className="text-gray-800 text-sm font-bold text-center leading-tight drop-shadow-sm">{link.title}</span>
    </a>
  );
};

const GlassCallButton = () => (
  <a href="tel:021932301" target="_self" className="relative flex items-center justify-center gap-4 w-full bg-gradient-to-r from-emerald-500/80 to-teal-600/80 backdrop-blur-md border border-white/30 text-white p-5 rounded-3xl shadow-lg hover:shadow-emerald-500/30 active:scale-95 transition-all duration-300 mb-8 overflow-hidden group">
    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    <div className="bg-white/20 p-3 rounded-full animate-pulse backdrop-blur-sm shadow-inner border border-white/20"><PhoneCall size={28} /></div>
    <div className="text-left z-10">
      <div className="text-sm font-medium text-emerald-50">โทรด่วนสอบถามเจ้าหน้าที่</div>
      <div className="text-2xl font-bold tracking-widest text-white drop-shadow-md">02-193-2301</div>
    </div>
  </a>
);

// --- Main App ---
export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home'); 
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [qrModalLink, setQrModalLink] = useState(null);
  const [adminPin, setAdminPin] = useState("");
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => { try { await signInAnonymously(auth); } catch (e) { console.error(e); } };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (!user || !db) return;
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'family_questions');
    return onSnapshot(q, (snapshot) => {
      const loadedQuestions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      loadedQuestions.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      setQuestions(loadedQuestions);
    });
  }, [user]);

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim() || !user || !db) return;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'family_questions'), {
      text: newQuestion, status: 'pending', reply: '', timestamp: serverTimestamp(), userId: user.uid
    });
    setNewQuestion("");
  };
  
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPin === "1234") { setIsAdminLoggedIn(true); setAdminPin(""); } else { alert("รหัสผิด"); }
  };
  
  const handleReply = async (id, reply) => {
    if (!db) return;
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'family_questions', id), { reply, status: 'answered', answeredAt: serverTimestamp() });
  };
  
  const handleDelete = async (id) => {
    if(!db) return;
    if(confirm("ลบไหม?")) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'family_questions', id));
  };

  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 fixed inset-0 overflow-y-auto">
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
      <div className="fixed top-[10%] right-[-10%] w-[50%] h-[50%] bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
      
      <header className="relative z-30 pt-8 pb-2 px-6 mb-4">
        <div className="max-w-md mx-auto bg-white/30 backdrop-blur-xl border border-white/40 shadow-lg rounded-2xl p-4 flex items-center justify-between">
           {activeTab === 'home' ? (
             <>
                <div>
                  <p className="text-gray-600 text-xs font-semibold mb-1 tracking-wide uppercase">ยินดีต้อนรับสู่</p>
                  <h1 className="text-xl font-black text-gray-800 leading-none">ทัณฑสถาน<br/><span className="text-blue-700">วัยหนุ่มกลาง</span></h1>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg"><Home size={24} className="text-white" /></div>
             </>
           ) : (
             <div className="flex items-center gap-3">
               <button onClick={() => setActiveTab('home')} className="bg-white/40 p-2 rounded-xl hover:bg-white/60 transition-colors border border-white/50 shadow-sm"><ChevronLeft size={24} className="text-gray-700" /></button>
               <h1 className="text-xl font-bold text-gray-800">{activeTab === 'qa' ? 'ฝากคำถาม' : 'เจ้าหน้าที่'}</h1>
             </div>
           )}
        </div>
      </header>

      <main className="relative z-10 max-w-md mx-auto px-5 pb-24">
        {activeTab === 'home' && (
          <div className="animate-fade-in space-y-6">
            <GlassCallButton />
            <div className="grid grid-cols-2 gap-4">
              {SERVICE_LINKS.map(link => <GlassButton key={link.id} link={link} onNavigate={setActiveTab} onShowQr={setQrModalLink} />)}
            </div>
            <div className="mt-8 text-center">
              <button onClick={() => setActiveTab('admin')} className="text-gray-500 text-sm py-2 px-6 rounded-full bg-white/20 border border-white/30 backdrop-blur-sm hover:bg-white/40 shadow-sm">เข้าสู่ระบบเจ้าหน้าที่</button>
            </div>
          </div>
        )}

        {activeTab === 'qa' && (
          <div className="animate-fade-in">
            <div className="bg-white/30 backdrop-blur-xl border border-white/40 rounded-3xl p-6 mb-8 shadow-lg">
              <h2 className="text-xl font-black text-gray-800 mb-2">พิมพ์ข้อความ</h2>
              <form onSubmit={handleSubmitQuestion} className="flex flex-col gap-4">
                <textarea value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} placeholder="พิมพ์คำถาม..." className="w-full bg-white/40 border border-white/50 rounded-2xl p-4 text-lg focus:outline-none focus:bg-white/60 min-h-[140px]" />
                <button type="submit" disabled={!newQuestion.trim()} className="bg-gradient-to-r from-blue-600/90 to-indigo-600/90 text-white rounded-2xl py-4 font-bold text-lg flex justify-center gap-3 shadow-lg active:scale-95 disabled:opacity-50"><Send size={24} /> ส่งข้อความ</button>
              </form>
            </div>
            <div className="space-y-4">
              {questions.map(q => (
                <div key={q.id} className="bg-white/40 backdrop-blur-md border border-white/50 rounded-2xl p-5 shadow-sm">
                  <div className="flex justify-between mb-3"><span className="text-xs font-bold text-gray-600 bg-white/40 px-3 py-1 rounded-lg">{q.timestamp?.toDate ? new Date(q.timestamp.toDate()).toLocaleString('th-TH') : 'เมื่อสักครู่'}</span> <span className={`text-xs px-3 py-1 rounded-full font-bold ${q.status === 'answered' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{q.status === 'answered' ? 'ตอบแล้ว' : 'รอตอบ'}</span></div>
                  <p className="text-gray-800 text-lg font-medium">{q.text}</p>
                  {q.reply && <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100/50 mt-2"><p className="text-gray-800 text-lg font-medium">จนท: {q.reply}</p></div>}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'admin' && (
           <div className="animate-fade-in">
             {!isAdminLoggedIn ? (
               <div className="bg-white/30 backdrop-blur-xl border border-white/40 p-8 rounded-[32px] text-center mt-6">
                 <h2 className="text-2xl font-black text-gray-800 mb-4">ยืนยันตัวตน</h2>
                 <form onSubmit={handleAdminLogin}>
                   <input type="password" value={adminPin} onChange={(e) => setAdminPin(e.target.value)} className="w-full text-center text-4xl border-b-2 border-white/50 bg-transparent py-4 mb-8 outline-none" placeholder="••••" maxLength={4} />
                   <button type="submit" className="w-full bg-gray-800/90 text-white py-4 rounded-2xl font-bold text-lg shadow-xl active:scale-95">เข้าสู่ระบบ</button>
                 </form>
                 <p className="mt-4 text-xs text-gray-500">รหัส: 1234</p>
               </div>
             ) : (
                <div className="space-y-4">
                   <div className="flex justify-between bg-white/30 p-4 rounded-2xl"><span className="font-bold">Admin Mode</span><button onClick={() => setIsAdminLoggedIn(false)} className="text-red-600 font-bold">ออก</button></div>
                   {questions.map(q => (
                     <div key={q.id} className="bg-white/40 p-5 rounded-2xl border border-white/50">
                        <div className="flex justify-between mb-2"><span className="text-xs bg-white/50 px-2 py-1 rounded">{new Date(q.timestamp?.toDate()).toLocaleTimeString('th-TH')}</span> <button onClick={() => handleDelete(q.id)}><X size={18} className="text-gray-400" /></button></div>
                        <p className="font-medium mb-3">{q.text}</p>
                        {q.status !== 'answered' ? (
                          <div className="flex gap-2"><input type="text" placeholder="ตอบ..." className="flex-1 p-2 rounded-lg bg-white/50" onKeyDown={(e) => { if(e.key === 'Enter') handleReply(q.id, e.target.value) }} /><button className="bg-blue-600 text-white px-4 rounded-lg" onClick={(e) => handleReply(q.id, e.target.previousSibling.value)}>ส่ง</button></div>
                        ) : <div className="bg-green-100 p-2 rounded text-green-800">ตอบแล้ว: {q.reply}</div>}
                     </div>
                   ))}
                </div>
             )}
           </div>
        )}
      </main>

      {qrModalLink && <QrModal link={qrModalLink} onClose={() => setQrModalLink(null)} />}
    </div>
  );
}