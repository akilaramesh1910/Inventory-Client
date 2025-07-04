"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, Plus, Minus, Search, TrendingUp, Package } from "lucide-react"
import { useRouter } from "next/navigation"
import Layout from "../components/Layout"


type Product = {
  _id: string
  name: string
  sku: string
  minStock: number
  maxStock: number
}

type StockItem = {
  productId: Product
  quantity: number
  lastUpdated: string
}

export default function StockPage() {
  const [stockData, setStockData] = useState<StockItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [adjustmentMode, setAdjustmentMode] = useState<string | null>(null)
  const [adjustmentValue, setAdjustmentValue] = useState("")
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter()

  useEffect(() => {
    fetchStock()
  }, [])

  const API_BASE =  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000/api"

  const fetchStock = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("Authorization token not found. Please log in.");
      setLoading(false);
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/stock/all`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (res.status === 401 || res.status === 403) {
        setError("Unauthorized. Please log in again.");
        localStorage.removeItem("accessToken");
        router.push("/login");
        return;
      }
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Failed to fetch stock data" }));
        throw new Error(errorData.message || `HTTP error ${res.status}`);
      }
      const data = await res.json()
      setStockData(data)
    } catch (err: any) {
      console.error("Error fetching stock:", err)
      setError(err.message || "An error occurred while fetching stock data.");
    } finally {
      setLoading(false);
    }
  }

  const handleStockAdjustment = async (productId: string, type: "add" | "subtract") => {
    const value = parseInt(adjustmentValue)
    if (!value || value <= 0) return
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("Authorization token not found. Please log in.");
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/stock/${type}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity: value }),
      })
      if (res.status === 401 || res.status === 403) {
        setError("Unauthorized. Please log in again.");
        localStorage.removeItem("accessToken");
        router.push("/login");
        return;
      }
      if (!res.ok) throw new Error(`Failed to adjust stock: ${type}`);
      fetchStock()
    } catch (err: any) {
      console.error("Error adjusting stock:", err);
      setError(err.message || "Failed to adjust stock.");
    }

    setAdjustmentMode(null)
    setAdjustmentValue("")
  }

  const handleSetStock = async (productId: string) => {
    const value = parseInt(adjustmentValue);
    if (isNaN(value) || value < 0) {
      setError("Please enter a valid non-negative quantity to set.");
      setAdjustmentValue("");
      return;
    }
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("Authorization token not found. Please log in.");
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/stock/set_quantity`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, newQuantity: value }),
      });
      if (res.status === 401 || res.status === 403) {
        setError("Unauthorized. Please log in again.");
        localStorage.removeItem("accessToken");
        router.push("/login");
        return;
      }
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Failed to set stock quantity" }));
        throw new Error(errorData.message || "Failed to set stock quantity");
      }
      fetchStock(); 
    } catch (err: any) {
      console.error("Error setting stock quantity:", err);
      setError(err.message || "Failed to set stock quantity.");
    }

    setAdjustmentMode(null);
    setAdjustmentValue("");
  };

  const handleStockRecount = async (productId: string) => {
    const value = parseInt(adjustmentValue)
    if (value < 0 || isNaN(value)) return
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("Authorization token not found. Please log in.");
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/stock/recount`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, countedQuantity: value }),
      })
      if (res.status === 401 || res.status === 403) {
        setError("Unauthorized. Please log in again.");
        localStorage.removeItem("accessToken");
        router.push("/login");
        return;
      }
      if (!res.ok) throw new Error("Failed to recount stock");
      fetchStock()
    } catch (err: any) {
      console.error("Error during recount:", err);
      setError(err.message || "Failed during stock recount.");
    }

    setAdjustmentMode(null)
    setAdjustmentValue("")
  }

  const safeStockData = Array.isArray(stockData) ? stockData : [];

  const filteredStock = safeStockData.filter(
    (item) =>
      item.productId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.productId.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = safeStockData.filter(
    (item) => item.quantity <= item.productId.minStock
  )

  const getStatIconBackground = (colorName: string) => {
    const colors: { [key: string]: string } = {
      slate: "linear-gradient(45deg, #475569, #374151)",
      red: "linear-gradient(45deg, #ef4444, #dc2626)",
      green: "linear-gradient(45deg, #22c55e, #16a34a)",
    };
    return colors[colorName] || colors.slate;
  };

  const totalValue = safeStockData.reduce((sum, item) => sum + item.quantity, 0)

  const stockHealthPercentage = safeStockData.length > 0
    ? Math.round(((safeStockData.length - lowStockItems.length) / safeStockData.length) * 100)
    : 0;

  const getStockStatus = (current: number, min: number, max: number) => {
    const validMin = typeof min === 'number' && !isNaN(min) ? min : 0; 
    const validMax = typeof max === 'number' && !isNaN(max) && max > 0 ? max : undefined;

    if (current <= validMin) {
      return { status: "low", color: "text-red-600", bgColor: "bg-red-100" };
    }
    if (validMax !== undefined && validMax > validMin && current >= validMax * 0.8) {
      return { status: "high", color: "text-green-600", bgColor: "bg-green-100" };
    }
    return { status: "normal", color: "text-blue-600", bgColor: "bg-blue-100" };
  };

  const getStockPercentage = (current: number, max: number) => {
    const validMax = typeof max === 'number' && !isNaN(max) && max > 0 ? max : 0;

    if (validMax === 0) {
      return current > 0 ? 100 : 0;
    }
    return Math.min((current / validMax) * 100, 100);
  };

  const getStockBadgeStyle = (status: string) => {
    if (status === "high") {
      return {
        background: "rgba(34, 197, 94, 0.2)", 
        color: "#22c55e",
        border: "1px solid rgba(34, 197, 94, 0.5)",
      };
    } else if (status === "normal") {
      return {
        background: "rgba(59, 130, 246, 0.2)",
        color: "#3b82f6",
        border: "1px solid rgba(59, 130, 246, 0.5)",
      };
    } 
    return {
      background: "rgba(239, 68, 68, 0.2)", 
      color: "#ef4444",
      border: "1px solid rgba(239, 68, 68, 0.5)",
    };
  };


  return (
    <Layout>
      <>
        <div
          style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
            position: "relative",
            overflowX: "hidden", 
            padding: "32px", 
          }}
        >
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
          </div>

          <div style={{position: "relative", zIndex: 1}}>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ 
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "32px",
              }}
            >
              <div>
                <h1 style={{ fontSize: "36px", fontWeight: "bold", color: "white", marginBottom: "4px" }}> 
                  Stock Management
                </h1>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "18px" }}> 
                  Monitor and manage your inventory levels
                </p>
              </div>
            </motion.div>

            {error && (
              <div style={{ background: "rgba(239, 68, 68, 0.2)", border: "1px solid #ef4444", color: "#ef4444", padding: "12px", borderRadius: "12px", marginBottom: "24px", textAlign: "center" }}>{error}</div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "24px",
                marginBottom: "32px",
                animation: "slideInUp 0.6s ease-out 0.1s both",
              }}
            >
              {[
                {
                  title: "Total Items in Stock",
                  value: totalValue.toString(),
                  description: "Across all products",
                  icon: Package,
                  iconColor: "slate",
                  valueColor: "white",
                },
                {
                  title: "Low Stock Alerts",
                  value: lowStockItems.length.toString(),
                  description: "Items need restocking",
                  icon: AlertTriangle,
                  iconColor: "red",
                  valueColor: "#ef4444",
                },
                {
                  title: "Stock Health",
                  value: `${stockHealthPercentage}%`,
                  description: "Items in good stock",
                  icon: TrendingUp,
                  iconColor: "green",
                  valueColor: "#22c55e",
                },
              ].map((stat, index) => (
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
                    animation: `slideInUp 0.6s ease-out ${index * 0.1 + 0.1}s both`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                    e.currentTarget.style.transform = "translateY(-5px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div style={{ padding: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <h3
                          style={{
                            color: "rgba(255, 255, 255, 0.8)",
                            fontSize: "14px",
                            fontWeight: "500",
                            marginBottom: "4px",
                          }}
                        >
                          {stat.title}
                        </h3>
                        <div
                          style={{
                            fontSize: "28px",
                            fontWeight: "bold",
                            color: stat.valueColor,
                            marginTop: "4px",
                          }}
                        >
                          {stat.value}
                        </div>
                        <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", marginTop: "4px" }}>
                          {stat.description}
                        </p>
                      </div>
                      <div
                        style={{
                          padding: "16px",
                          borderRadius: "16px",
                          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
                          background: getStatIconBackground(stat.iconColor),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <stat.icon style={{ width: "24px", height: "24px", color: "white" }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginBottom: "32px",
                animation: "slideInUp 0.6s ease-out 0.3s both",
              }}
            >
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "16px",
                  overflow: "hidden",
                }}
              >
                <div style={{ padding: "24px" }}>
                  <div style={{ position: "relative" }}>
                    <Search
                      style={{
                        position: "absolute",
                        left: "16px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "20px",
                        height: "20px",
                        color: "rgba(255, 255, 255, 0.6)",
                      }}
                    />
                    <input
                      placeholder="Search products by name or SKU..."
                      style={{
                        paddingLeft: "48px",
                        paddingRight: "16px",
                        paddingTop: "12px",
                        paddingBottom: "12px",
                        background: "rgba(255, 255, 255, 0.1)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        color: "white",
                        borderRadius: "16px",
                        transition: "all 0.3s",
                        width: "100%",
                        outline: "none",
                        fontSize: "14px",
                      }}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.4)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                      }}
                    />
                  </div>
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
    animation: "fadeIn 0.6s ease-out 0.4s both",
  }}
>
  <div style={{ padding: "24px 24px 12px 24px", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
    <h3 style={{ fontSize: "20px", fontWeight: "600", color: "white", marginBottom: "4px" }}>
      Stock Levels
    </h3>
    <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.7)" }}>
      Current inventory and status
    </p>
  </div>
  <div style={{ overflowX: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
      <thead>
        <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.2)" }}>
          {[
            { header: "Product", width: "15%" },
            { header: "SKU", width: "12%" },
            { header: "Current Stock", width: "12%" },
            { header: "Stock Level", width: "15%" },
            { header: "Status", width: "10%" },
            { header: "Last Updated", width: "12%" },
            { header: "Actions", width: "24%" }
          ].map(({ header, width }) => (
            <th
              key={header}
              style={{
                padding: "16px",
                textAlign: "left",
                fontWeight: "600",
                color: "rgba(255, 255, 255, 0.9)",
                background: "rgba(255, 255, 255, 0.05)",
                fontSize: "14px",
                whiteSpace: "nowrap",
                width: width,
              }}
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <AnimatePresence>
          {!loading && filteredStock.map((item, index) => {
            const statusInfo = getStockStatus(item.quantity, item.productId.minStock, item.productId.maxStock)
            console.log("statusInfo", statusInfo)
            const percent = getStockPercentage(item.quantity, item.productId.maxStock)

            return (
              <motion.tr
                key={item.productId._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                  transition: "background 0.3s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)" }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent" }}
              >
                <td style={{ padding: "16px", color: "rgba(255, 255, 255, 0.9)", fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {item.productId.name}
                </td>
                <td style={{ padding: "16px", color: "rgba(255, 255, 255, 0.8)", fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {item.productId.sku}
                </td>
                <td style={{ padding: "16px", color: "rgba(255, 255, 255, 0.8)", fontSize: "14px" }}>
                  {item.quantity} / {item.productId.maxStock}
                </td>
                <td style={{ padding: "16px" }}>
                  <div style={{ height: "8px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: `${percent}%`, height: "100%", backgroundColor: statusInfo.status === 'low' ? '#ef4444' : statusInfo.status === 'high' ? '#22c55e' : '#3b82f6', transition: 'width 0.3s ease' }} />
                  </div>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginTop: "4px" }}>{Math.round(percent)}%</div>
                </td>
                <td style={{ padding: "16px" }}>
                  <span
                    style={{
                      ...getStockBadgeStyle(statusInfo.status),
                      padding: "4px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "500",
                      display: "inline-block",
                      textTransform: "capitalize",
                    }}
                  >
                    {statusInfo.status}
                  </span>
                </td>
                <td style={{ padding: "16px", color: "rgba(255, 255, 255, 0.8)", fontSize: "14px", whiteSpace: "nowrap" }}>
                  {item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString() : "—"}
                </td>
                <td style={{ padding: "16px", textAlign: "right", width: "24%" }}>
                  <AnimatePresence>
                    {adjustmentMode === item.productId._id ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        style={{ 
                          display: "flex", 
                          gap: "4px", 
                          alignItems: "center", 
                          justifyContent: "flex-end",
                          flexWrap: "wrap",
                          maxWidth: "100%",
                        }}
                      >
                        <div style={{ display: "flex", gap: "4px", alignItems: "center", marginBottom: "4px" }}>
                          <input
                            type="number"
                            value={adjustmentValue}
                            onChange={(e) => setAdjustmentValue(e.target.value)}
                            placeholder="Qty"
                            style={{
                              width: "50px",
                              fontSize: "11px",
                              padding: "4px 6px",
                              background: "rgba(255,255,255,0.1)",
                              border: "1px solid rgba(255,255,255,0.2)",
                              color: "white",
                              borderRadius: "6px",
                              outline: "none",
                              height: "24px",
                            }}
                          />
                          <button
                            onClick={() => handleStockAdjustment(item.productId._id, "add")}
                            style={{
                              padding: "0",
                              background: "rgba(255,255,255,0.1)",
                              border: "1px solid rgba(255,255,255,0.2)",
                              color: "white",
                              borderRadius: "6px",
                              cursor: "pointer",
                              transition: "all 0.2s",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "12px",
                              width: "24px",
                              height: "24px",
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                          >
                            <Plus style={{ width: "10px", height: "10px" }} />
                          </button>
                          <button
                            onClick={() => handleStockAdjustment(item.productId._id, "subtract")}
                            style={{
                              padding: "0",
                              background: "rgba(255,255,255,0.1)",
                              border: "1px solid rgba(255,255,255,0.2)",
                              color: "white",
                              borderRadius: "6px",
                              cursor: "pointer",
                              transition: "all 0.2s",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "12px",
                              width: "24px",
                              height: "24px",
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                          >
                            <Minus style={{ width: "10px", height: "10px" }} />
                          </button>
                        </div>
                        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                          <button
                            onClick={() => handleSetStock(item.productId._id)}
                            style={{
                              padding: "0 8px",
                              background: "rgba(255,255,255,0.1)",
                              border: "1px solid rgba(255,255,255,0.2)",
                              color: "white",
                              borderRadius: "6px",
                              cursor: "pointer",
                              transition: "all 0.2s",
                              fontSize: "10px",
                              height: "24px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                          >
                            Set
                          </button>
                          <button
                            onClick={() => handleStockRecount(item.productId._id)}
                            style={{
                              padding: "0 6px",
                              background: "rgba(255,255,255,0.1)",
                              border: "1px solid rgba(255,255,255,0.2)",
                              color: "white",
                              borderRadius: "6px",
                              cursor: "pointer",
                              transition: "all 0.2s",
                              fontSize: "10px",
                              height: "24px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                          >
                            Recount
                          </button>
                          <button
                            onClick={() => { setAdjustmentMode(null); setAdjustmentValue("") }}
                            style={{
                              padding: "0",
                              background: "transparent",
                              border: "none",
                              color: "rgba(255,255,255,0.7)",
                              borderRadius: "6px",
                              cursor: "pointer",
                              transition: "all 0.2s",
                              fontSize: "14px",
                              lineHeight: "1",
                              width: "24px",
                              height: "24px",
                              display: "flex", 
                              alignItems: "center", 
                              justifyContent: "center"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                          >
                            ×
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div whileTap={{ scale: 0.95 }}>
                        <button
                          onClick={() => setAdjustmentMode(item.productId._id)}
                          style={{
                            padding: "0 12px",
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.15)",
                            color: "rgba(255,255,255,0.8)",
                            borderRadius: "8px",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            fontSize: "12px",
                            height: "28px",
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                        >
                          Adjust
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </td>
              </motion.tr>
            )
          })}
        </AnimatePresence>
      </tbody>
    </table>
    {!loading && filteredStock.length === 0 && (
      <div
        style={{
          textAlign: "center",
          padding: "48px 0",
          animation: "fadeIn 0.6s ease-out",
          color: "rgba(255, 255, 255, 0.7)",
        }}
      >
        <Search style={{ width: "48px", height: "48px", margin: "0 auto 16px auto", color: "rgba(255,255,255,0.4)" }} />
        <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "white", marginBottom: "8px" }}>
          No stock items found
        </h3>
        <p style={{ color: "rgba(255, 255, 255, 0.6)" }}>
          Try adjusting your search criteria.
        </p>
      </div>
    )}
    {loading && (
      <div style={{ textAlign: "center", padding: "48px 0", color: "rgba(255, 255, 255, 0.7)" }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{ width: "32px", height: "32px", border: "3px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", margin: "0 auto 16px auto" }}
        />
        Loading stock data...
      </div>
    )}
  </div>
</div>
          </div>
        </div>
      </>
    </Layout>
  )
}
