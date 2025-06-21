"use client"

import { useState, useEffect } from "react"
import React from "react" 
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  AlertTriangle,
  Package2,
  Activity,
} from "lucide-react"
import Layout from "./components/Layout"
import { useRouter } from "next/navigation"

export default function Dashboard() {
  const [statsData, setStatsData] = useState([])
  const [recentActivities, setRecentActivities] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter() 

  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000/api"

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem("accessToken")

      if (!token) {
        setError("No authorization token found. Please log in.")
        setLoading(false)
        router.push("/login") 
        return
      }

      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      }

      try {
        const [statsRes, activitiesRes, topProductsRes] = await Promise.all([
          fetch(`${API_BASE}/dashboard/stats`, { headers }),
          fetch(`${API_BASE}/dashboard/activities`, { headers }),
          fetch(`${API_BASE}/dashboard/topproducts`, { headers }),
        ])

        for (const res of [statsRes, activitiesRes, topProductsRes]) {
          if (res.status === 401 || res.status === 403) {
            setError("Unauthorized or Forbidden. Please log in again.")
            localStorage.removeItem("accessToken") 
            router.push("/login")
            return
          }
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({ message: `HTTP error ${res.status} on ${res.url.split('/').pop()}` }))
            throw new Error(errorData.message || `Failed to fetch data for ${res.url.split('/').pop()}`)
          }
        }

        const stats = await statsRes.json()
        const activities = await activitiesRes.json()
        const products = await topProductsRes.json()


        setStatsData(Array.isArray(stats) ? stats : [])
        setRecentActivities(Array.isArray(activities) ? activities : [])
        setTopProducts(Array.isArray(products) ? products : [])

      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError(err.message)
        setStatsData([])
        setRecentActivities([])
        setTopProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [API_BASE, router]) 

  const getStatIconColor = (color) => {
    const colors = {
      emerald: "linear-gradient(45deg, #10b981, #059669)",
      slate: "linear-gradient(45deg, #475569, #374151)",
      amber: "linear-gradient(45deg, #f59e0b, #d97706)",
      indigo: "linear-gradient(45deg, #6366f1, #4f46e5)",
    }
    return colors[color] || colors.slate
  }

  const getStatBadgeColor = (color) => {
    const colors = {
      emerald: "linear-gradient(45deg, #10b981, #059669)",
      slate: "linear-gradient(45deg, #475569, #374151)",
      amber: "linear-gradient(45deg, #f59e0b, #d97706)",
      indigo: "linear-gradient(45deg, #6366f1, #4f46e5)",
    }
    return colors[color] || colors.slate
  }

  const RupeeIcon = ({ style }) => (
    <span style={{
      fontSize: style?.width || "24px", 
      lineHeight: style?.height || "24px", 
      color: style?.color || "white",
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      ₹
    </span>
  );

  const getIconComponent = (iconName) => {
    switch (iconName) {
      case "DollarSign": return RupeeIcon; 
      case "Package2": return Package2;
      case "AlertTriangle": return AlertTriangle;
      case "ShoppingCart": return ShoppingCart;
      case "TrendingUp": return TrendingUp;
      case "Package": return Package;
      case "Activity": return Activity;
      case "Users": return Users; 
      default:
        console.warn(`Unknown icon name: ${iconName}, defaulting to Package icon.`);
        return Package; 
    }
  };
  return (
    <Layout>
      <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "32px",
              animation: "slideInUp 0.6s ease-out",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "36px",
                  fontWeight: "bold",
                  color: "white",
                  marginBottom: "8px",
                }}
              >
                Hello,{" "}
                <span
                  style={{
                    background: "linear-gradient(45deg, #e5e7eb, #ffffff)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Admin
                </span>
              </h1>
              <p style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "18px" }}>
                Here's what's happening with your business today.
              </p>
            </div>
          </div>

          {loading && (
            <div style={{ textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.7)" }}>
              Loading dashboard data...
            </div>
          )}
          {error && (
            <div style={{ textAlign: "center", padding: "40px", color: "#ef4444" }}>
              Error loading data: {error}. Please ensure the backend is running and API endpoints are correct.
              (Expected: /dashboard/stats, /dashboard/activities, /dashboard/topproducts)
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
              gap: "24px",
              marginBottom: "32px",
            }}
          >
            {!loading && !error && statsData.map((stat, index) => (
              <div
                key={stat.title}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "16px",
                  transition: "all 0.5s",
                  cursor: "pointer",
                  animation: `slideInUp 0.6s ease-out ${index * 0.1}s both`,
                }}
              >
                <div style={{ padding: "20px", paddingBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <h3
                        style={{
                          color: "rgba(255, 255, 255, 0.8)",
                          fontSize: "14px",
                          fontWeight: "500",
                          marginBottom: "8px",
                        }}
                      >
                        {stat.title}
                      </h3>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                        <span style={{ fontSize: "28px", fontWeight: "bold", color: "white" }}>{stat.value}</span>
                        <span
                          style={{
                            fontSize: "12px",
                            padding: "4px 8px",
                            borderRadius: "12px",
                            color: "white",
                            border: "none",
                            background: getStatBadgeColor(stat.color),
                          }}
                        >
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <div
                      style={{
                        padding: "16px",
                        borderRadius: "16px",
                        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
                        background: getStatIconColor(stat.color),
                      }}
                    >
                      {stat.icon && typeof stat.icon === 'string' ?
                        React.createElement(getIconComponent(stat.icon), { style: { width: "24px", height: "24px", color: "white" } })
                        : <Package style={{ width: "24px", height: "24px", color: "white" }} /> 
                      }
                    </div>
                  </div>
                </div>
                <div style={{ padding: "0 20px 20px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "14px",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>Progress</span>
                    <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>{stat.progress}%</span>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "8px",
                      background: "rgba(255, 255, 255, 0.1)",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        background: "linear-gradient(45deg, #10b981, #059669)",
                        borderRadius: "4px",
                        transition: "width 0.5s ease",
                        width: `${stat.progress}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "32px", marginBottom: "32px" }}>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "16px",
                overflow: "hidden",
                animation: "slideInLeft 0.6s ease-out",
              }}
            >
              <div style={{ padding: "24px", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <h2
                      style={{
                        color: "white",
                        fontSize: "20px",
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        margin: 0,
                      }}
                    >
                      <TrendingUp style={{ width: "24px", height: "24px", color: "#10b981" }} />
                      Top Performing Products
                    </h2>
                    <p style={{ color: "rgba(255, 255, 255, 0.6)", marginTop: "4px", fontSize: "14px" }}>
                      Best sellers this month
                    </p>
                  </div>
                </div>
              </div>
              <div style={{ padding: "24px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {!loading && !error && topProducts.map((product, index) => (
                    <div
                      key={product.name}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "16px",
                        borderRadius: "16px",
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                        transition: "all 0.3s",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"
                        e.currentTarget.style.transform = "translateX(10px) scale(1.02)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"
                        e.currentTarget.style.transform = "translateX(0) scale(1)"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ fontSize: "28px" }}>{product.image}</div>
                        <div>
                          <h4 style={{ color: "white", fontWeight: "600", marginBottom: "4px" }}>{product.name}</h4>
                          <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "14px" }}>{product.sales} sales</p>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ color: "white", fontWeight: "bold", marginBottom: "4px" }}>
                          ${product.revenue.toLocaleString()}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "14px",
                            color: product.trend > 0 ? "#10b981" : "#ef4444",
                          }}
                        >
                          <TrendingUp style={{ width: "16px", height: "16px" }} />
                          <span>
                            {product.trend > 0 ? "+" : ""}
                            {product.trend}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "16px",
                overflow: "hidden",
                animation: "slideInRight 0.6s ease-out",
              }}
            >
              <div style={{ padding: "24px", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
                <div>
                  <h2
                    style={{
                      color: "white",
                      fontSize: "20px",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      margin: 0,
                    }}
                  >
                    <Activity style={{ width: "24px", height: "24px", color: "#6366f1" }} />
                    Recent Activity
                  </h2>
                  <p style={{ color: "rgba(255, 255, 255, 0.6)", marginTop: "4px", fontSize: "14px" }}>
                    Latest system events
                  </p>
                </div>
              </div>
              <div style={{ padding: "24px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {!loading && !error && recentActivities.map((activity, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                        padding: "12px",
                        borderRadius: "12px",
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                        transition: "background 0.3s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent"
                      }}
                    >
                      <div
                        style={{
                          padding: "8px",
                          background: "linear-gradient(45deg, rgba(71, 85, 105, 0.5), rgba(100, 116, 139, 0.5))",
                          borderRadius: "12px",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          flexShrink: 0,
                        }}
                      >
                        {activity.icon && typeof activity.icon === 'string' ?
                          React.createElement(getIconComponent(activity.icon), { style: { width: "16px", height: "16px", color: "white" } })
                          : <Activity style={{ width: "16px", height: "16px", color: "white" }} /> 
                        }
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: "white", fontSize: "14px", marginBottom: "4px" }}>{activity.message}</p>
                        <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "12px" }}>{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
      </>
    </Layout>
  )
}
