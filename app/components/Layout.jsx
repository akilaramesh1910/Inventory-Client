"use client"

import { useState, useEffect } from "react"
import {
  Package,
  BarChart3,
  TrendingUp,
  ShoppingCart,
  Users,
  Tag,
  LogOut,
} from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false) 
  // eslint-disable-next-line no-unused-vars
  const [userError, setUserError] = useState(null)
  const router = useRouter()
  const pathname = usePathname()
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000/api"

  const navItems = [
    { icon: BarChart3, label: "Dashboard", route: "/" },
    { icon: Package, label: "Products", route: "/products" },
    { icon: TrendingUp, label: "Stock", route: "/stock" },
    { icon: Users, label: "Orders", route: "/orders" },
    { icon: ShoppingCart, label: "POS", route: "/pos" },
    { icon: Tag, label: "Barcodes", route: "/barcodes" },
  ].map(item => ({ ...item, active: pathname === item.route, badge: null })); 

  const handleLogout = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      if (token) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error("Error calling backend logout:", error);
    } finally {
      localStorage.removeItem("accessToken");
      router.push("/login");
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div
          style={{
            position: "absolute",
            top: "80px",
            left: "80px",
            width: "384px",
            height: "384px",
            background: "linear-gradient(45deg, rgba(255, 255, 255, 0.05), rgba(156, 163, 175, 0.1))",
            borderRadius: "50%",
            filter: "blur(60px)",
            animation: "float 8s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "80px",
            right: "80px",
            width: "320px",
            height: "320px",
            background: "linear-gradient(45deg, rgba(148, 163, 184, 0.1), rgba(107, 114, 128, 0.1))",
            borderRadius: "50%",
            filter: "blur(60px)",
            animation: "float 8s ease-in-out infinite",
            animationDelay: "2s",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "256px",
            height: "256px",
            background: "linear-gradient(45deg, rgba(156, 163, 175, 0.1), rgba(148, 163, 184, 0.1))",
            borderRadius: "50%",
            filter: "blur(60px)",
            animation: "float 8s ease-in-out infinite",
            animationDelay: "4s",
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>

      <div
        style={{
          width: sidebarOpen ? "320px" : "80px",
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(255, 255, 255, 0.1)",
          transition: "width 0.5s ease-in-out",
          position: "relative",
          zIndex: 10,
          animation: "slideInLeft 0.6s ease-out",
        }}
        onMouseEnter={() => setSidebarOpen(true)} 
        onMouseLeave={() => setSidebarOpen(false)} 
      >
        <div
          style={{
            display: "flex",
            height: "80px",
            alignItems: "center",
            justifyContent: sidebarOpen ? "space-between" : "center",
            padding: sidebarOpen ? "0 24px" : "0",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              transition: "transform 0.2s",
              paddingLeft: sidebarOpen ? "0" : "114px", 
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div
              style={{
                position: "relative",
                padding: "12px",
                background: "linear-gradient(45deg, #475569, #64748b)",
                borderRadius: sidebarOpen ? "16px" : "50%",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                marginLeft: sidebarOpen ? "0" : "auto",
                marginRight: sidebarOpen ? "0" : "auto",
              }}
            >
              <Package style={{ width: "32px", height: "32px", color: "white" }} />
              <div
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  width: "16px",
                  height: "16px",
                  background: "#10b981",
                  borderRadius: "50%",
                  border: "2px solid white",
                  animation: "pulse 2s infinite",
                }}
              />
            </div>
            <div style={{
              opacity: sidebarOpen ? 1 : 0,
              transform: sidebarOpen ? 'translateX(0)' : 'translateX(-10px)',
              transition: "opacity 0.3s ease-out 0.1s, transform 0.3s ease-out 0.1s, visibility 0s linear " + (sidebarOpen ? "0s" : "0.4s"),
              pointerEvents: sidebarOpen ? 'auto' : 'none', 
              visibility: sidebarOpen ? 'visible' : 'hidden', 
              whiteSpace: 'nowrap',
            }}>
              <h1 style={{
                fontSize: "24px",
                fontWeight: "bold",
                background: "linear-gradient(45deg, #ffffff, #e5e7eb)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                marginLeft: sidebarOpen ? "13px" : "0px"
              }}>
                Inventory
              </h1>
            </div>
          </div>
        </div>
        <nav style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {navItems.map((item) => {
              const isActive = item.active;
              const isOpen = sidebarOpen;

              return (
              <div key={item.label} style={{ position: "relative" }}>
                  <button
                  onClick={() => router.push(item.route)}
                  style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: isOpen ? "flex-start" : "center",
                      padding: isOpen ? "16px" : "0",
                      width: isOpen ? "100%" : "48px",
                      height: "48px",
                      margin: isOpen ? "0" : "0 auto",
                      background: isActive
                      ? isOpen
                          ? "linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))"
                          : "rgba(255, 255, 255, 0.1)"
                      : "transparent",
                      border: isActive ? "1px solid rgba(255,255,255,0.2)" : "none",
                      borderRadius: isOpen ? "16px" : "50%",
                      color: isActive ? "white" : "rgba(255,255,255,0.7)",
                      cursor: "pointer",
                      transition: "all 0.3s",
                      fontSize: "16px",
                      fontWeight: "500",
                      textAlign: "left",
                      boxShadow: isActive ? "0 10px 25px rgba(0,0,0,0.3)" : "none",
                      position: "relative",
                  }}
                  onMouseEnter={(e) => {
                      if (!isActive) {
                      e.currentTarget.style.color = "white";
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                      e.currentTarget.style.transform = "scale(1.05)";
                      }
                  }}
                  onMouseLeave={(e) => {
                      if (!isActive) {
                      e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.transform = "scale(1)";
                      }
                  }}
                  >
                  <item.icon
                      style={{
                      width: "24px",
                      height: "24px",
                      marginRight: isOpen ? "12px" : "0",
                      flexShrink: 0,
                      }}
                  />
                  <div style={{
                    flex: 1, 
                    display: 'flex',
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    opacity: isOpen ? 1 : 0,
                    maxWidth: isOpen ? '100%' : '0px', 
                    overflow: 'hidden', 
                    whiteSpace: 'nowrap',
                    transition: `opacity 0.2s ease-out ${isOpen ? '0.15s' : '0s'}, max-width 0.3s ease-out ${isOpen ? '0.1s' : '0s'}, visibility 0s linear ${isOpen ? '0s' : '0.4s'}`,
                    visibility: isOpen ? 'visible' : 'hidden',
                  }}>
                    <span>{item.label}</span>
                    {item.badge && (
                      <span style={{
                        background: "rgba(255, 255, 255, 0.2)",
                        color: "white",
                        borderRadius: "12px",
                        fontSize: "12px",
                        padding: "4px 8px",
                      }}>{item.badge}</span>
                    )}
                  </div>
                  </button>

                  {isActive && isOpen && (
                  <div
                      style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      width: "4px",
                      height: "100%",
                      background: "linear-gradient(to bottom, #ffffff, #d1d5db)",
                      borderRadius: "0 4px 4px 0",
                      }}
                  />
                  )}
              </div>
              );
          })}
        </nav>
      </div>


      <div style={{ flex: 1, overflow: "auto", position: "relative", zIndex: 1 }}>
        <header
          style={{ background: "rgba(255, 255, 255, 0.05)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", height: "80px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", position: "sticky", top: 0, zIndex: 20, animation: "fadeIn 0.6s ease-out" }}
        >
          <h2
            style={{
              fontSize: "22px",
              fontWeight: "bold",
              color: "white",
              letterSpacing: "0.5px",
              textShadow: "0px 1px 3px rgba(0, 0, 0, 0.3)",
            }}
          >
            Simple Inventory Management System
          </h2>
          <button
            onClick={handleLogout}
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#ef4444", 
              borderRadius: "12px",
              padding: "8px 16px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              fontWeight: "500",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
              e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
              e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.3)";
            }}
          >
            <LogOut style={{ width: "16px", height: "16px" }} />
            Logout
          </button>
        </header>
        <main style={{ padding: "32px" }}>
          {children}
        </main>
      </div>
    </div>
  )
}