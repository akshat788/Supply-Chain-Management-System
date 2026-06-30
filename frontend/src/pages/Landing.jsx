import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";
import logo from "../assets/logo.jpg";
import collabImg from "../assets/scm_collaboration.png";

const Landing = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getDashboardPath = () => {
    if (!user) return "/";
    switch (user.role) {
      case "admin":
        return "/admin/dashboard";
      case "supplier":
        return "/supplier/dashboard";
      case "warehouse_manager":
        return "/warehouse/dashboard";
      case "retailer":
        return "/retailer/dashboard";
      default:
        return "/";
    }
  };

  const handleAuthAction = () => {
    if (isAuthenticated) {
      dispatch(logout());
      navigate("/");
    } else {
      navigate("/login");
    }
  };

  const handleMainAction = () => {
    if (isAuthenticated) {
      navigate(getDashboardPath());
    } else {
      navigate("/register");
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const features = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
      title: "Smart Supply Chain Solutions",
      desc: "Connects your network, tracks purchase orders, and keeps suppliers in perfect alignment."
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
      title: "Optimized Storage & Logistics",
      desc: "Monitor live warehouse stock levels, auto-calculate value, and configure low-stock triggers."
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
      title: "Seamless Retailer Checkout",
      desc: "Empower retailer accounts with live catalogs, simple carts, and swift role-gated ordering."
    }
  ];

  const roles = [
    { title: "Admin", emoji: "👑", color: "#4f46e5", bg: "#e0e7ff", perms: ["Full platform oversight", "Team management & scoring", "Live interactive analytics", "Transaction logs"] },
    { title: "Supplier", emoji: "🏭", color: "#0891b2", bg: "#ecfeff", perms: ["Accept/Decline POs", "Dispatch notifications", "Manage vendor products", "Track performance KPIs"] },
    { title: "Warehouse", emoji: "🏗️", color: "#16a34a", bg: "#f0fdf4", perms: ["Log arrivals & PO matches", "Pack & fulfill orders", "Manage stock locations", "Audit trails"] },
    { title: "Retailer", emoji: "🛍️", color: "#ea580c", bg: "#fff7ed", perms: ["Browse global catalog", "Instant cart checkouts", "Real-time shipping updates", "Quick re-orders"] },
  ];

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif", backgroundColor: "#ffffff", color: "#1e293b", overflowX: "hidden" }}>



      {/* NAV */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 1000,
        padding: "0 5%",
        height: 72,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.9)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(15, 23, 42, 0.06)",
        transition: "all 0.3s ease",
        boxShadow: scrolled ? "0 4px 20px -2px rgba(15, 23, 42, 0.05)" : "none"
      }}>
        <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => scrollToSection("hero")}>
          <img src={logo} alt="SupplySync" style={{ height: 48, borderRadius: "6px" }} />
        </div>

        {/* Menu Links */}
        <div className="nav-links" style={{ display: "flex", gap: 28 }}>
          <span onClick={() => scrollToSection("hero")} className="nav-item">Home</span>
          <span onClick={() => scrollToSection("features")} className="nav-item">Why Us</span>
          <span onClick={() => scrollToSection("about")} className="nav-item">About</span>
          <span onClick={() => scrollToSection("roles")} className="nav-item">Roles</span>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {isAuthenticated ? (
            <>
              <button onClick={handleAuthAction} className="btn-secondary-sm">
                Sign Out
              </button>
              <button onClick={handleMainAction} className="btn-primary-sm">
                Dashboard
              </button>
            </>
          ) : (
            <>
              <button onClick={handleAuthAction} className="btn-secondary-sm">
                Sign In
              </button>
              <button onClick={handleMainAction} className="btn-primary-sm">
                Get Started
              </button>
            </>
          )}
        </div>
      </nav>

      {/* HERO SECTION */}
      <section id="hero" style={{
        padding: "80px 5% 100px",
        background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", inset: 0, opacity: 0.1,
          backgroundImage: "linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          pointerEvents: "none"
        }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 60, alignItems: "center", position: "relative", zIndex: 2 }}>
          {/* Left Text details */}
          <div style={{ textAlign: "left" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#fff7ed", border: "1px solid #ffedd5",
              borderRadius: 100, padding: "6px 14px", marginBottom: 24,
              fontSize: 13, color: "#ea580c", fontWeight: 600,
            }}>
              <span className="dot-pulse" style={{ width: 8, height: 8, borderRadius: "50%", background: "#f97316", display: "inline-block" }} />
              Connecting Suppliers, Warehouses & Retailers
            </div>

            <h1 style={{
              fontSize: "clamp(2.5rem, 5vw, 4.2rem)", fontWeight: 900,
              lineHeight: 1.1, margin: "0 0 24px", color: "#0f172a",
              letterSpacing: "-1.5px"
            }}>
              CONNECT YOUR BUSINESS TO A WORLD OF <span style={{ color: "#ea580c" }}>POSSIBILITIES</span>
            </h1>

            <p style={{ fontSize: "clamp(1rem, 1.8vw, 1.15rem)", color: "#475569", marginBottom: 40, lineHeight: 1.7, maxWidth: 540 }}>
              SupplySync bridges operations seamlessly. Coordinate logistics, automate order workflows, verify live stocks, and resolve discrepancies on one integrated, clean interface.
            </p>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {isAuthenticated ? (
                <>
                  <button onClick={handleMainAction} className="btn-primary-lg">
                    Go to Dashboard
                  </button>
                  <button onClick={handleAuthAction} className="btn-secondary-lg">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleMainAction} className="btn-primary-lg">
                    Start for Free
                  </button>
                  <button onClick={handleAuthAction} className="btn-secondary-lg">
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right Image illustration */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <img src={logo} alt="SupplySync Logo" className="hero-img-animation" style={{
              maxWidth: "80%",
              height: "auto",
              borderRadius: 20,
              boxShadow: "0 20px 40px -10px rgba(15, 23, 42, 0.1)",
              border: "1px solid rgba(226, 232, 240, 0.8)"
            }} />
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section id="features" style={{ padding: "100px 5%", backgroundColor: "#f8fafc", borderTop: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ fontSize: 13, letterSpacing: 2, color: "#ea580c", textTransform: "uppercase", fontWeight: 700, marginBottom: 12 }}>Platform Features</p>
            <h2 style={{ fontSize: "clamp(2rem, 3.5vw, 2.8rem)", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>Why traders choose us</h2>
            <p style={{ color: "#64748b", marginTop: 12, fontSize: 16, maxWidth: 540, margin: "12px auto 0" }}>Designed for simplicity, built for enterprise control. Take charge of each link in your logistics chain.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32 }}>
            {features.map((f, i) => (
              <div key={i} className="feature-card" style={{
                background: "#ffffff", border: "1px solid #e2e8f0",
                borderRadius: 16, padding: 36, transition: "all 0.3s ease",
                boxShadow: "0 4px 6px -1px rgba(15, 23, 42, 0.02)", cursor: "default"
              }}>
                <div style={{
                  width: 50, height: 50, borderRadius: 12, backgroundColor: "#fff7ed",
                  color: "#ea580c", display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 24, boxShadow: "0 4px 10px rgba(234, 88, 12, 0.1)"
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 19, marginBottom: 12, color: "#0f172a" }}>{f.title}</h3>
                <p style={{ color: "#475569", fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>{f.desc}</p>
                <span className="card-explore-btn" style={{ fontSize: 14, fontWeight: 700, color: "#ea580c", display: "inline-flex", alignItems: "center", gap: 4 }}>
                  Read more <span className="arrow-hover">→</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT US SECTION */}
      <section id="about" style={{ padding: "100px 5%", backgroundColor: "#ffffff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 64, alignItems: "center" }}>
          {/* Left image */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ position: "relative" }}>
              <img src={collabImg} alt="Logistics Collaboration Team" style={{
                maxWidth: "100%",
                height: "auto",
                borderRadius: 20,
                boxShadow: "0 20px 40px -10px rgba(15, 23, 42, 0.12)",
                border: "1px solid #f1f5f9"
              }} />
              <div style={{
                position: "absolute", bottom: -20, right: -20,
                background: "linear-gradient(135deg, #0f172a, #1e293b)",
                color: "#ffffff", padding: "20px 24px", borderRadius: 16,
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)", textAlign: "center"
              }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: "#ea580c" }}>5+</div>
                <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, letterSpacing: 0.5 }}>YEARS OF LOGISTICS TECH</div>
              </div>
            </div>
          </div>

          {/* Right Text details */}
          <div>
            <p style={{ fontSize: 13, letterSpacing: 2, color: "#ea580c", textTransform: "uppercase", fontWeight: 700, marginBottom: 12 }}>About us</p>
            <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.5rem)", fontWeight: 800, color: "#0f172a", marginBottom: 24, letterSpacing: "-0.5px" }}>
              We believe supply chain synchronization shouldn't be complex.
            </h2>
            <p style={{ color: "#475569", fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>
              SupplySync connects the physical logistics flows with dynamic software architecture. By building specialized workspace states for Administrators, Warehouse Managers, Suppliers, and Retail clients, we eliminate inventory gaps and invoice friction.
            </p>
            <p style={{ color: "#475569", fontSize: 15, lineHeight: 1.8, marginBottom: 36 }}>
              Whether checking current stock transactions, scheduling custom purchase approvals, or tracking vendor dispatch records, the details are delivered instantaneously.
            </p>
            <button onClick={() => scrollToSection("features")} className="btn-primary-lg">
              Explore Our Solutions
            </button>
          </div>
        </div>
      </section>

      {/* ROLES / TEAM ROLES SECTION */}
      <section id="roles" style={{ padding: "100px 5%", backgroundColor: "#f8fafc", position: "relative" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <p style={{ fontSize: 13, letterSpacing: 2, color: "#ea580c", textTransform: "uppercase", fontWeight: 700, marginBottom: 12 }}>Role-Based Access</p>
            <h2 style={{ fontSize: "clamp(2rem, 3.5vw, 2.8rem)", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>Built for every participant</h2>
            <p style={{ color: "#64748b", marginTop: 12, fontSize: 16, maxWidth: 540, margin: "12px auto 0" }}>Each role enjoys a customized interface showing exactly the metrics and actions they need.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
            {roles.map((r, i) => (
              <div key={i} className="role-card" style={{
                background: "#ffffff", border: "1px solid #e2e8f0",
                borderRadius: 16, padding: 32, transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: "50%",
                  backgroundColor: r.bg, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 26, marginBottom: 20
                }}>{r.emoji}</div>
                <h3 style={{ fontWeight: 800, fontSize: 20, color: "#0f172a", marginBottom: 16 }}>{r.title}</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {r.perms.map((p, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <span style={{ color: r.color, fontWeight: "bold", fontSize: 14 }}>✓</span>
                      <span style={{ color: "#475569", fontSize: 13, lineHeight: 1.4 }}>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* FOOTER */}
      <footer style={{
        padding: "64px 5% 32px", backgroundColor: "#0f172a", color: "#94a3b8",
        borderTop: "1px solid rgba(255,255,255,0.05)"
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40, marginBottom: 48 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#ffffff", marginBottom: 20 }}>
              <img src={logo} alt="SupplySync" style={{ height: 44, backgroundColor: "#ffffff", padding: "4px", borderRadius: "6px" }} />
              <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.5px" }}>SupplySync</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: "#64748b" }}>
              Unified synchronization platform powering global merchants, warehouse hubs, and verified suppliers.
            </p>
          </div>
          <div>
            <h4 style={{ color: "#ffffff", fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Solutions</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
              <span>Supplier Portals</span>
              <span>Inventory Control</span>
              <span>Order Fulfilment</span>
              <span>Real-time Tracking</span>
            </div>
          </div>
          <div>
            <h4 style={{ color: "#ffffff", fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Company</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
              <span>About Us</span>
              <span>Network Status</span>
              <span>Security Protocols</span>
              <span>Contact Team</span>
            </div>
          </div>

        </div>

        <div style={{ maxWidth: 1200, margin: "0 auto", paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <span style={{ fontSize: 13 }}>© 2026 SupplySync. All rights reserved.</span>
          <div style={{ display: "flex", gap: 24, fontSize: 13 }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Cookie Settings</span>
          </div>
        </div>
      </footer>

      {/* REACTIVE CUSTOM CSS STYLES */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.7; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes slideIn {
          from { transform: translateY(12px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .dot-pulse {
          animation: pulse 2s infinite ease-in-out;
        }

        .hero-img-animation {
          animation: float 6s ease-in-out infinite;
        }

        /* Navigation links */
        .nav-item {
          font-size: 14.5px;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          transition: color 0.2s ease;
          position: relative;
          padding: 4px 0;
        }
        .nav-item:hover {
          color: #ea580c;
        }
        .nav-item::after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: 0;
          left: 0;
          background-color: #ea580c;
          transition: width 0.2s ease;
        }
        .nav-item:hover::after {
          width: 100%;
        }

        /* Forms inputs focusing */
        .form-input:focus {
          border-color: #ea580c !important;
          box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.15);
        }

        /* BUTTONS STYLES */
        .btn-primary-sm {
          background-color: #ea580c;
          color: #ffffff;
          border: none;
          padding: 8px 18px;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
          box-shadow: 0 4px 12px rgba(234, 88, 12, 0.15);
        }
        .btn-primary-sm:hover {
          background-color: #d97706;
          transform: translateY(-1.5px);
          box-shadow: 0 6px 16px rgba(234, 88, 12, 0.25);
        }
        .btn-primary-sm:active {
          transform: translateY(0);
        }

        .btn-secondary-sm {
          background: transparent;
          border: 1px solid #cbd5e1;
          color: #475569;
          padding: 8px 18px;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
        }
        .btn-secondary-sm:hover {
          background-color: #f8fafc;
          border-color: #94a3b8;
          color: #0f172a;
          transform: translateY(-1px);
        }
        .btn-secondary-sm:active {
          transform: translateY(0);
        }

        .btn-primary-lg {
          background-color: #ea580c;
          color: #ffffff;
          border: none;
          padding: 14px 32px;
          border-radius: 10px;
          font-size: 15.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s ease-in-out;
          box-shadow: 0 6px 18px rgba(234, 88, 12, 0.2);
        }
        .btn-primary-lg:hover {
          background-color: #d97706;
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(234, 88, 12, 0.3);
        }
        .btn-primary-lg:active {
          transform: translateY(0);
        }

        .btn-secondary-lg {
          background-color: #ffffff;
          border: 1px solid #cbd5e1;
          color: #475569;
          padding: 14px 32px;
          border-radius: 10px;
          font-size: 15.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease-in-out;
        }
        .btn-secondary-lg:hover {
          background-color: #f8fafc;
          border-color: #94a3b8;
          color: #0f172a;
          transform: translateY(-1.5px);
        }
        .btn-secondary-lg:active {
          transform: translateY(0);
        }

        /* Why Trader Cards */
        .feature-card:hover {
          transform: translateY(-6px);
          border-color: #ffedd5;
          box-shadow: 0 12px 30px -4px rgba(234, 88, 12, 0.08);
        }
        .feature-card:hover .arrow-hover {
          transform: translateX(4px);
        }
        .arrow-hover {
          display: inline-block;
          transition: transform 0.2s ease;
        }

        /* Role Cards Access Grid */
        .role-card:hover {
          transform: translateY(-4px);
          border-color: rgba(234, 88, 12, 0.15);
          box-shadow: 0 12px 24px -8px rgba(15, 23, 42, 0.08);
        }
      `}</style>
    </div>
  );
};

export default Landing;
