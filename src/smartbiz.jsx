import { useState, useEffect, useRef } from "react";

// ─── MOCK DATA ────────────────────────────────────────────────
const CUSTOMERS = [
  { id: 1, name: "Ramesh Gupta", phone: "9876543210", balance: 4500, avatar: "RG", color: "#00F5A0" },
  { id: 2, name: "Sunita Devi", phone: "9123456789", balance: -1200, avatar: "SD", color: "#FF6B6B" },
  { id: 3, name: "Manoj Sharma", phone: "9988776655", balance: 8900, avatar: "MS", color: "#00B4D8" },
  { id: 4, name: "Priya Singh", phone: "9654321098", balance: -320, avatar: "PS", color: "#FFB347" },
  { id: 5, name: "Vikram Yadav", phone: "9871234560", balance: 2100, avatar: "VY", color: "#C77DFF" },
  { id: 6, name: "Kavita Joshi", phone: "9012345678", balance: 0, avatar: "KJ", color: "#48CAE4" },
];

const TRANSACTIONS = [
  { id: 1, customerId: 1, type: "credit", amount: 2000, note: "Kapde ka payment", date: "2025-03-27T10:30:00", time: "10:30 AM" },
  { id: 2, customerId: 1, type: "debit", amount: 500, note: "Wapas diya", date: "2025-03-26T15:00:00", time: "3:00 PM" },
  { id: 3, customerId: 1, type: "credit", amount: 3000, note: "March ka udhaar", date: "2025-03-25T11:00:00", time: "11:00 AM" },
  { id: 4, customerId: 1, type: "debit", amount: 1500, note: "Partial payment", date: "2025-03-24T09:00:00", time: "9:00 AM" },
  { id: 5, customerId: 1, type: "credit", amount: 1500, note: "Groceries", date: "2025-03-22T14:00:00", time: "2:00 PM" },
];

const OFFER_TEMPLATES = [
  { id: 1, emoji: "🔥", title: "Flash Sale", msg: "🔥 *AAAJ KA OFFER!*\n\nHamari dukaan mein aaj *20% DISCOUNT* hai!\n\n⏰ Sirf aaj ke liye\n📍 Jaldi aao, stock limited hai!\n\n- SmartBiz Dukaan" },
  { id: 2, emoji: "🎉", title: "Festival Special", msg: "🎉 *Tyohaar Special Offer!*\n\nIs baar tyohaar mein paayein *SPECIAL PRICE* pe best quality saman!\n\n✅ Trusted by 500+ customers\n💬 WhatsApp karein ya seedha aao!\n\n- SmartBiz Dukaan" },
  { id: 3, emoji: "💰", title: "Udhaar Reminder", msg: "🙏 *Namaskar!*\n\nAapka hamare yahaan ₹{amount} baaki hai.\n\nKripya jaldi settle karein.\n\nDhanyawaad 🙏\n- SmartBiz Dukaan" },
  { id: 4, emoji: "🆕", title: "New Stock", msg: "🆕 *Naya Maal Aa Gaya!*\n\nFresh stock available hai!\n\n🛍️ Pehle aao, pehle paao!\n📞 Call ya WhatsApp karein\n\n- SmartBiz Dukaan" },
];

// ─── ANIMATED COUNTER ─────────────────────────────────────────
function AnimatedNumber({ value, prefix = "₹", duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return (
    <span>
      {prefix}{display.toLocaleString("en-IN")}
    </span>
  );
}

// ─── RIPPLE BUTTON ────────────────────────────────────────────
function RippleBtn({ children, onClick, className = "", style = {} }) {
  const [ripples, setRipples] = useState([]);
  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples(r => [...r, { x, y, id }]);
    setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 600);
    onClick && onClick(e);
  };
  return (
    <button onClick={handleClick} className={className} style={{ position: "relative", overflow: "hidden", ...style }}>
      {children}
      {ripples.map(r => (
        <span key={r.id} style={{
          position: "absolute", left: r.x - 40, top: r.y - 40,
          width: 80, height: 80, borderRadius: "50%",
          background: "rgba(255,255,255,0.25)",
          animation: "ripple 0.6s ease-out forwards",
          pointerEvents: "none",
        }} />
      ))}
    </button>
  );
}

// ─── GLASS CARD ───────────────────────────────────────────────
function GlassCard({ children, className = "", style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 20,
      backdropFilter: "blur(20px)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      transition: "transform 0.18s ease, box-shadow 0.18s ease",
      cursor: onClick ? "pointer" : "default",
      ...style,
    }}
    className={className}
    onMouseEnter={e => { if (onClick) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.4)"; } }}
    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.3)"; }}
    >
      {children}
    </div>
  );
}

// ─── SCREENS ──────────────────────────────────────────────────

// 🏠 DASHBOARD
function Dashboard({ setScreen, setSelectedCustomer }) {
  const totalEarned = 47850;
  const pendingUdhaar = CUSTOMERS.filter(c => c.balance < 0).reduce((a, c) => a + Math.abs(c.balance), 0);
  const toReceive = CUSTOMERS.filter(c => c.balance > 0).reduce((a, c) => a + c.balance, 0);
  const todayEarnings = 3200;

  return (
    <div style={{ padding: "24px 16px 100px", maxWidth: 480, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginBottom: 2 }}>Namaste 🙏</p>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: "'Syne', sans-serif" }}>SmartBiz Dukaan</h1>
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          background: "linear-gradient(135deg, #00F5A0, #00D9F5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, fontWeight: 800, color: "#0F172A",
        }}>S</div>
      </div>

      {/* Today's earnings banner */}
      <GlassCard style={{
        background: "linear-gradient(135deg, rgba(0,245,160,0.15), rgba(0,217,245,0.1))",
        border: "1px solid rgba(0,245,160,0.25)",
        padding: "20px 24px", marginBottom: 16,
      }}>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginBottom: 6, letterSpacing: "0.08em", textTransform: "uppercase" }}>Aaj ki Kamai 💰</p>
        <p style={{ fontSize: 38, fontWeight: 900, color: "#00F5A0", fontFamily: "'Syne', sans-serif", letterSpacing: "-1px" }}>
          <AnimatedNumber value={todayEarnings} />
        </p>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 6 }}>27 March 2025 • 12 transactions</p>
      </GlassCard>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        <GlassCard style={{ padding: "16px 18px" }}>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Lena Baaki ✅</p>
          <p style={{ fontSize: 22, fontWeight: 800, color: "#00F5A0", fontFamily: "'Syne', sans-serif" }}>
            <AnimatedNumber value={toReceive} duration={900} />
          </p>
        </GlassCard>
        <GlassCard style={{ padding: "16px 18px" }}>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Dena Baaki ⚠️</p>
          <p style={{ fontSize: 22, fontWeight: 800, color: "#FF6B6B", fontFamily: "'Syne', sans-serif" }}>
            <AnimatedNumber value={pendingUdhaar} duration={900} />
          </p>
        </GlassCard>
      </div>

      {/* Quick actions */}
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Quick Actions</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
        {[
          { icon: "➕", label: "Entry Add Karo", color: "#00F5A0", action: () => setScreen("khata") },
          { icon: "📢", label: "Offer Bhejo", color: "#FFB347", action: () => setScreen("offer") },
          { icon: "👥", label: "Customers", color: "#00B4D8", action: () => setScreen("customers") },
          { icon: "📒", label: "Khata Dekho", color: "#C77DFF", action: () => setScreen("khata") },
        ].map(a => (
          <RippleBtn key={a.label} onClick={a.action} style={{
            background: `linear-gradient(135deg, ${a.color}18, ${a.color}08)`,
            border: `1px solid ${a.color}35`,
            borderRadius: 16, padding: "16px 12px",
            display: "flex", flexDirection: "column", alignItems: "flex-start",
            gap: 8, cursor: "pointer", textAlign: "left",
          }}>
            <span style={{ fontSize: 24 }}>{a.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "'Syne', sans-serif" }}>{a.label}</span>
          </RippleBtn>
        ))}
      </div>

      {/* Recent customers */}
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Recent Customers</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {CUSTOMERS.slice(0, 3).map(c => (
          <GlassCard key={c.id} onClick={() => { setSelectedCustomer(c); setScreen("khata"); }} style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: `${c.color}25`, border: `2px solid ${c.color}60`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: c.color, flexShrink: 0 }}>{c.avatar}</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>{c.name}</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{c.phone}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontWeight: 800, fontSize: 15, color: c.balance >= 0 ? "#00F5A0" : "#FF6B6B" }}>
                {c.balance >= 0 ? "+" : ""}₹{Math.abs(c.balance).toLocaleString("en-IN")}
              </p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{c.balance >= 0 ? "Lena hai" : "Dena hai"}</p>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

// 👥 CUSTOMERS
function Customers({ setScreen, setSelectedCustomer }) {
  const [search, setSearch] = useState("");
  const filtered = CUSTOMERS.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));

  return (
    <div style={{ padding: "24px 16px 100px", maxWidth: 480, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: "'Syne', sans-serif", marginBottom: 20 }}>Customers 👥</h2>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 20 }}>
        <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 18, opacity: 0.4 }}>🔍</span>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Naam ya number dhundo..."
          style={{
            width: "100%", padding: "14px 16px 14px 48px", background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, color: "#fff",
            fontSize: 15, outline: "none", boxSizing: "border-box",
            fontFamily: "inherit",
          }}
        />
      </div>

      {/* Summary pills */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {[
          { label: `${CUSTOMERS.filter(c => c.balance > 0).length} Lena`, color: "#00F5A0" },
          { label: `${CUSTOMERS.filter(c => c.balance < 0).length} Dena`, color: "#FF6B6B" },
          { label: `${CUSTOMERS.filter(c => c.balance === 0).length} Clear`, color: "rgba(255,255,255,0.4)" },
        ].map(p => (
          <span key={p.label} style={{ padding: "6px 14px", borderRadius: 20, background: `${p.color}18`, border: `1px solid ${p.color}35`, fontSize: 12, fontWeight: 700, color: p.color }}>{p.label}</span>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(c => (
          <GlassCard key={c.id} onClick={() => { setSelectedCustomer(c); setScreen("khata"); }} style={{ padding: "16px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: `${c.color}20`, border: `2px solid ${c.color}50`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 15, color: c.color, flexShrink: 0 }}>{c.avatar}</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 16, color: "#fff", marginBottom: 3 }}>{c.name}</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>📱 {c.phone}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontWeight: 900, fontSize: 18, color: c.balance > 0 ? "#00F5A0" : c.balance < 0 ? "#FF6B6B" : "rgba(255,255,255,0.4)" }}>
                {c.balance === 0 ? "Clear ✅" : `${c.balance > 0 ? "+" : ""}₹${Math.abs(c.balance).toLocaleString("en-IN")}`}
              </p>
              {c.balance !== 0 && <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{c.balance > 0 ? "Aapka lena" : "Aapka dena"}</p>}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

// 📒 KHATA
function Khata({ customer, setScreen }) {
  const [showModal, setShowModal] = useState(false);
  const [txType, setTxType] = useState("credit");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [txList, setTxList] = useState(TRANSACTIONS.filter(t => t.customerId === (customer?.id || 1)));
  const cust = customer || CUSTOMERS[0];
  const balance = txList.reduce((a, t) => t.type === "credit" ? a + t.amount : a - t.amount, 0);

  const addTx = () => {
    if (!amount) return;
    const newTx = { id: Date.now(), customerId: cust.id, type: txType, amount: Number(amount), note: note || (txType === "credit" ? "Credit entry" : "Debit entry"), date: new Date().toISOString(), time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) };
    setTxList([newTx, ...txList]);
    setAmount(""); setNote(""); setShowModal(false);
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      {/* Customer header */}
      <div style={{ padding: "24px 16px 0", background: "linear-gradient(180deg, rgba(0,245,160,0.06) 0%, transparent 100%)" }}>
        <button onClick={() => setScreen("customers")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 14, cursor: "pointer", marginBottom: 16, padding: 0, fontFamily: "inherit" }}>← Back</button>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: `${cust.color}20`, border: `2px solid ${cust.color}60`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 17, color: cust.color }}>{cust.avatar}</div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fff", fontFamily: "'Syne', sans-serif" }}>{cust.name}</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>📱 {cust.phone}</p>
          </div>
        </div>
        <GlassCard style={{ padding: "16px 20px", marginBottom: 20, background: balance >= 0 ? "rgba(0,245,160,0.08)" : "rgba(255,107,107,0.08)", border: `1px solid ${balance >= 0 ? "rgba(0,245,160,0.2)" : "rgba(255,107,107,0.2)"}` }}>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>{balance >= 0 ? "Aapka lena baaki hai" : "Aapka dena baaki hai"}</p>
          <p style={{ fontSize: 32, fontWeight: 900, color: balance >= 0 ? "#00F5A0" : "#FF6B6B", fontFamily: "'Syne', sans-serif" }}>
            ₹{Math.abs(balance).toLocaleString("en-IN")}
          </p>
        </GlassCard>
        {/* Action buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
          <RippleBtn onClick={() => { setTxType("credit"); setShowModal(true); }} style={{ background: "rgba(0,245,160,0.12)", border: "1px solid rgba(0,245,160,0.3)", borderRadius: 14, padding: "14px", color: "#00F5A0", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "'Syne', sans-serif" }}>
            + Liya (Credit)
          </RippleBtn>
          <RippleBtn onClick={() => { setTxType("debit"); setShowModal(true); }} style={{ background: "rgba(255,107,107,0.12)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 14, padding: "14px", color: "#FF6B6B", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "'Syne', sans-serif" }}>
            − Diya (Debit)
          </RippleBtn>
        </div>
      </div>

      {/* Timeline */}
      <div style={{ padding: "0 16px 100px" }}>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Transaction History</p>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: 20, top: 0, bottom: 0, width: 2, background: "rgba(255,255,255,0.06)", borderRadius: 2 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {txList.map((tx, i) => (
              <div key={tx.id} style={{ display: "flex", gap: 16, paddingBottom: 16, alignItems: "flex-start" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: tx.type === "credit" ? "rgba(0,245,160,0.15)" : "rgba(255,107,107,0.15)", border: `2px solid ${tx.type === "credit" ? "rgba(0,245,160,0.4)" : "rgba(255,107,107,0.4)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, zIndex: 1 }}>
                  {tx.type === "credit" ? "⬆️" : "⬇️"}
                </div>
                <GlassCard style={{ flex: 1, padding: "12px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 3 }}>{tx.note}</p>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{tx.time} • {new Date(tx.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                    </div>
                    <p style={{ fontWeight: 900, fontSize: 16, color: tx.type === "credit" ? "#00F5A0" : "#FF6B6B", fontFamily: "'Syne', sans-serif" }}>
                      {tx.type === "credit" ? "+" : "−"}₹{tx.amount.toLocaleString("en-IN")}
                    </p>
                  </div>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "flex-end", zIndex: 100 }} onClick={() => setShowModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 480, margin: "0 auto", background: "#1E293B", borderRadius: "24px 24px 0 0", padding: "28px 20px 40px", border: "1px solid rgba(255,255,255,0.1)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: "'Syne', sans-serif", marginBottom: 6 }}>{txType === "credit" ? "💚 Credit Entry" : "🔴 Debit Entry"}</h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>{cust.name} ke liye</p>
            <input type="number" placeholder="Amount ₹" value={amount} onChange={e => setAmount(e.target.value)} style={{ width: "100%", padding: "16px", background: "rgba(255,255,255,0.06)", border: `1px solid ${txType === "credit" ? "rgba(0,245,160,0.3)" : "rgba(255,107,107,0.3)"}`, borderRadius: 14, color: "#fff", fontSize: 22, fontWeight: 800, outline: "none", marginBottom: 12, boxSizing: "border-box", fontFamily: "'Syne', sans-serif" }} />
            <input type="text" placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)} style={{ width: "100%", padding: "14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, color: "#fff", fontSize: 15, outline: "none", marginBottom: 20, boxSizing: "border-box", fontFamily: "inherit" }} />
            <RippleBtn onClick={addTx} style={{ width: "100%", padding: "16px", background: txType === "credit" ? "linear-gradient(135deg, #00F5A0, #00D9F5)" : "linear-gradient(135deg, #FF6B6B, #FF8E53)", border: "none", borderRadius: 16, color: txType === "credit" ? "#0F172A" : "#fff", fontSize: 17, fontWeight: 900, cursor: "pointer", fontFamily: "'Syne', sans-serif" }}>
              Save Karo ✅
            </RippleBtn>
          </div>
        </div>
      )}
    </div>
  );
}

// 📢 SEND OFFER
function SendOffer() {
  const [selected, setSelected] = useState(OFFER_TEMPLATES[0]);
  const [selectedCustomers, setSelectedCustomers] = useState([1, 3]);
  const [preview, setPreview] = useState(false);

  const toggleCustomer = (id) => setSelectedCustomers(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const sendWhatsApp = (customer) => {
    const msg = selected.msg.replace("{amount}", Math.abs(customer.balance));
    const url = `https://wa.me/91${customer.phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  return (
    <div style={{ padding: "24px 16px 100px", maxWidth: 480, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: "'Syne', sans-serif", marginBottom: 6 }}>Offer Bhejo 📢</h2>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>WhatsApp se seedha message karo</p>

      {/* Templates */}
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Template Chuno</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
        {OFFER_TEMPLATES.map(t => (
          <GlassCard key={t.id} onClick={() => setSelected(t)} style={{
            padding: "14px", cursor: "pointer",
            border: selected.id === t.id ? "1px solid rgba(255,179,71,0.5)" : "1px solid rgba(255,255,255,0.08)",
            background: selected.id === t.id ? "rgba(255,179,71,0.1)" : "rgba(255,255,255,0.04)",
          }}>
            <span style={{ fontSize: 24, display: "block", marginBottom: 6 }}>{t.emoji}</span>
            <p style={{ fontWeight: 700, fontSize: 13, color: "#fff" }}>{t.title}</p>
          </GlassCard>
        ))}
      </div>

      {/* Preview */}
      <GlassCard style={{ padding: "16px 18px", marginBottom: 24, background: "rgba(37,211,102,0.06)", border: "1px solid rgba(37,211,102,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 18 }}>💬</span>
          <p style={{ fontWeight: 700, fontSize: 14, color: "#25D366" }}>WhatsApp Preview</p>
        </div>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, whiteSpace: "pre-line" }}>
          {selected.msg.split("\n").slice(0, 4).join("\n")}...
        </p>
      </GlassCard>

      {/* Select customers */}
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
        Customers Chuno ({selectedCustomers.length} selected)
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
        {CUSTOMERS.map(c => (
          <div key={c.id} onClick={() => toggleCustomer(c.id)} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
            background: selectedCustomers.includes(c.id) ? "rgba(255,179,71,0.08)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${selectedCustomers.includes(c.id) ? "rgba(255,179,71,0.3)" : "rgba(255,255,255,0.07)"}`,
            borderRadius: 14, cursor: "pointer", transition: "all 0.2s",
          }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${c.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: c.color }}>{c.avatar}</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>{c.name}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{c.phone}</p>
            </div>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: selectedCustomers.includes(c.id) ? "#FFB347" : "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, transition: "all 0.2s" }}>
              {selectedCustomers.includes(c.id) ? "✓" : ""}
            </div>
          </div>
        ))}
      </div>

      {/* Send buttons */}
      {selectedCustomers.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {CUSTOMERS.filter(c => selectedCustomers.includes(c.id)).map(c => (
            <RippleBtn key={c.id} onClick={() => sendWhatsApp(c)} style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              padding: "16px", background: "linear-gradient(135deg, #25D366, #128C7E)",
              border: "none", borderRadius: 16, cursor: "pointer", width: "100%",
            }}>
              <span style={{ fontSize: 22 }}>💬</span>
              <span style={{ fontWeight: 800, fontSize: 15, color: "#fff", fontFamily: "'Syne', sans-serif" }}>
                {c.name} ko WhatsApp Bhejo
              </span>
            </RippleBtn>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── NAV ─────────────────────────────────────────────────────
function BottomNav({ screen, setScreen }) {
  const tabs = [
    { id: "dashboard", icon: "🏠", label: "Home" },
    { id: "customers", icon: "👥", label: "Customers" },
    { id: "khata", icon: "📒", label: "Khata" },
    { id: "offer", icon: "📢", label: "Offer" },
  ];
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
      background: "rgba(15,23,42,0.95)", backdropFilter: "blur(24px)",
      borderTop: "1px solid rgba(255,255,255,0.08)",
      display: "flex", justifyContent: "space-around", padding: "10px 0 20px",
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => setScreen(t.id)} style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          background: "none", border: "none", cursor: "pointer", padding: "4px 16px",
          borderRadius: 12,
        }}>
          <span style={{ fontSize: 22, filter: screen === t.id ? "none" : "grayscale(0.6) opacity(0.5)" }}>{t.icon}</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: screen === t.id ? "#00F5A0" : "rgba(255,255,255,0.35)", letterSpacing: "0.04em", fontFamily: "'Syne', sans-serif" }}>{t.label}</span>
          {screen === t.id && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#00F5A0", boxShadow: "0 0 8px #00F5A0" }} />}
        </button>
      ))}
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────
export default function SmartBiz() {
  const [screen, setScreen] = useState("dashboard");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0F172A; color: #fff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        input::placeholder { color: rgba(255,255,255,0.25); }
        input { color: #fff !important; }
        @keyframes ripple { from { transform: scale(0); opacity: 1; } to { transform: scale(4); opacity: 0; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Background grid pattern */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: "radial-gradient(circle at 20% 20%, rgba(0,245,160,0.04) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(0,180,216,0.04) 0%, transparent 50%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)`,
        backgroundSize: "40px 40px", pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", overflowX: "hidden", animation: "fadeUp 0.4s ease" }}>
        {screen === "dashboard" && <Dashboard setScreen={setScreen} setSelectedCustomer={setSelectedCustomer} />}
        {screen === "customers" && <Customers setScreen={setScreen} setSelectedCustomer={setSelectedCustomer} />}
        {screen === "khata" && <Khata customer={selectedCustomer} setScreen={setScreen} />}
        {screen === "offer" && <SendOffer />}
      </div>

      <BottomNav screen={screen} setScreen={setScreen} />
    </>
  );
}
