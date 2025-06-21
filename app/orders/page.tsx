"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Eye, Calendar, DollarSign, Package, TrendingUp, Plus, X, Trash2 } from "lucide-react"
import Snackbar from "../../components/ui/snackbar"
import { useRouter } from "next/navigation"
import Layout from "../components/Layout"


interface Product {
  _id: string;
  name: string;
  price: number;
}

interface OrderItem {
  productId?: string
  name: string
  quantity: number | ""
  price: number
}

interface Order {
  _id?: string
  orderItems: OrderItem[]
  total: number
  createdAt: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [newOrderItems, setNewOrderItems] = useState<OrderItem[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [availableProducts, setAvailableProducts] = useState<Product[]>([])
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")
  const [snackbarSeverity, setSnackbarSeverity] = useState<"error" | "success" | "info" | "warning">("error")

  const router = useRouter()

  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000/api"

  useEffect(() => {
    fetchOrders()
  }, [])

    useEffect(() => {
    async function fetchAvailableProducts() {
      if (showCreateModal && availableProducts.length === 0) {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        try {
          const res = await fetch(`${API_BASE}/products`, {
            headers: { "Authorization": `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setAvailableProducts(data)
          } else {
            console.error("Failed to fetch products for order creation");
            setSnackbarMessage("Could not load product list for new order.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
          }
        } catch (err: any) {
          console.error("Error fetching products:", err);
          setSnackbarMessage(err.message || "Error loading product list.");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
        }
      }
    }
    fetchAvailableProducts();
  }, [showCreateModal])

  async function fetchOrders() {
    setLoading(true)
    setError(null)
    const token = localStorage.getItem("accessToken")

    if (!token) {
      setSnackbarMessage("No authorization token found. Please log in.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setLoading(false)
      router.push("/login")
      return
    }

    try {
      const res = await fetch(`${API_BASE}/orders`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        method: "GET",
      })

      if (res.status === 401 || res.status === 403) {
        setSnackbarMessage("Unauthorized or Forbidden. Please log in again.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        localStorage.removeItem("accessToken") 
        router.push("/login")
        return
      }
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Failed to fetch orders" }))
        const errorMessage = errorData.message || `HTTP error ${res.status}`;
        setSnackbarMessage(errorMessage);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        throw new Error(errorMessage)
      }
      const data = await res.json()
      setOrders(data);
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function createOrder() {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      setSnackbarMessage("No authorization token found. Please log in.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      router.push("/login")
      return
    }

    for (const item of newOrderItems) {
      if (item.quantity === "" || item.quantity < 1) {
        setSnackbarMessage("Please enter a valid quantity for the order item's.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }
    }

    const total = newOrderItems.reduce((sum, item) => sum + (Number(item.quantity) * item.price), 0)
    const res = await fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ orderItems: newOrderItems, total }),
    })

    if (res.status === 401 || res.status === 403) {
      setSnackbarMessage("Unauthorized or Forbidden. Please log in again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      localStorage.removeItem("accessToken")
      router.push("/login")
      return
    }

    if (res.ok) {
      setSnackbarMessage("Order created successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setShowCreateModal(false)
      setNewOrderItems([])
      fetchOrders() 
    } else {
      const errorData = await res.json().catch(() => ({ message: "Failed to create order" }))
      const detailedError = errorData.error || errorData.message || `HTTP error ${res.status}`;
      setSnackbarMessage(detailedError);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setError(detailedError) 
    }
  }

  function addNewOrderItem() {
     setNewOrderItems([...newOrderItems, { productId: "", name: "", quantity: 1, price: 0 }])
  }

  function updateOrderItem(index: number, field: keyof OrderItem, value: string | number) {
    setNewOrderItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item }; 

          if (field === "name") {
            const productName = String(value);
            updatedItem.name = productName;
            const foundProduct = availableProducts.find(
              (p) => p.name.toLowerCase() === productName.toLowerCase()
            );
            if (foundProduct) {
              updatedItem.productId = foundProduct._id;
              updatedItem.price = foundProduct.price; 
            } else {
              updatedItem.productId = "";
              updatedItem.price = 0; 
            }
          } else if (field === "quantity") {
            const valStr = String(value);
            if (valStr === "") {
              updatedItem.quantity = "";
            } else {
              const numValue = parseInt(valStr, 10);
              if (!isNaN(numValue) && numValue >= 0) { 
                updatedItem.quantity = numValue;
              } 
            }
          } else if (field === "price") {
            const numPrice = parseFloat(String(value));
            if (!isNaN(numPrice) && numPrice >= 0) {
              updatedItem.price = numPrice;
            }
          }
          return updatedItem;
        }
        return item;
      })
    )
  }

  function removeOrderItem(index: number) {
    const updated = [...newOrderItems]
    updated.splice(index, 1)
    setNewOrderItems(updated)
  }

  const filteredOrders = orders.filter((order) => {
    const orderId = order._id || ""
    const matchesSearch = orderId.toLowerCase().includes(searchTerm.toLowerCase())
    const orderDate = new Date(order.createdAt).toISOString().split("T")[0]
    const matchesDate = dateFilter === "all" || orderDate === dateFilter
    return matchesSearch && matchesDate
  })

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const totalOrders = orders.length
  const averageOrderValue = totalOrders ? totalRevenue / totalOrders : 0

  const uniqueDates = [...new Set(orders.map((order) => new Date(order.createdAt).toISOString().split("T")[0]))]
    .sort()
    .reverse()

  return (
    <Layout>
      <>
        <Snackbar
          message={snackbarMessage}
          open={snackbarOpen}
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          autoHideDuration={6000}
        />
        <div
          style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
            position: "relative",
            overflowX: "hidden",
            padding: "32px",
            color: "white",
          }}
        >
          <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
            <div
              style={{
                position: "absolute",
                top: "60px",
                left: "60px",
                width: "360px",
                height: "360px",
                background: "linear-gradient(45deg, rgba(255, 255, 255, 0.05), rgba(156, 163, 175, 0.1))",
                borderRadius: "50%",
                filter: "blur(55px)",
                animation: "float 9s ease-in-out infinite",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "90px",
                right: "90px",
                width: "310px",
                height: "310px",
                background: "linear-gradient(45deg, rgba(148, 163, 184, 0.1), rgba(107, 114, 128, 0.1))",
                borderRadius: "50%",
                filter: "blur(55px)",
                animation: "float 9s ease-in-out infinite",
                animationDelay: "2.5s",
              }}
            />
          </div>

          <div style={{ position: "relative", zIndex: 1 }}>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}
            >
              <div>
                <h1 style={{ fontSize: "36px", fontWeight: "bold", color: "white", marginBottom: "4px" }}>Orders</h1>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "18px" }}>View and manage your orders</p>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => setShowCreateModal(true)}
                  style={{
                    background: "linear-gradient(45deg, #3b82f6, #6366f1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "white",
                    borderRadius: "12px",
                    padding: "10px 20px",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    boxShadow: "0 6px 15px rgba(0,0,0,0.25)"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "linear-gradient(45deg, #2563eb, #4f46e5)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "linear-gradient(45deg, #3b82f6, #6366f1)"}
                >
                  <Plus style={{ width: "16px", height: "16px" }} /> Create Order
                </button>
              </div>
            </motion.div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "24px",
                marginBottom: "32px",
              }}
            >
              {[
                { title: "Total Orders", value: totalOrders.toString(), icon: Package, color: "slate" },
                { title: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "emerald" },
                { title: "Average Order Value", value: `$${averageOrderValue.toFixed(2)}`, icon: TrendingUp, color: "indigo" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.1 }}
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(15px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "16px",
                    padding: "20px",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                    e.currentTarget.style.transform = "translateY(-5px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                    e.currentTarget.style.transform = "translateY(0px)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                    <div style={{
                      padding: "10px",
                      borderRadius: "12px",
                      marginRight: "12px",
                      background: stat.color === 'slate' ? "linear-gradient(45deg, #475569, #374151)" : stat.color === 'emerald' ? "linear-gradient(45deg, #10b981, #059669)" : "linear-gradient(45deg, #6366f1, #4f46e5)",
                    }}>
                      <stat.icon style={{ width: "20px", height: "20px", color: "white" }} />
                    </div>
                    <h3 style={{ fontSize: "14px", fontWeight: "500", color: "rgba(255,255,255,0.8)" }}>{stat.title}</h3>
                  </div>
                  <p style={{ fontSize: "28px", fontWeight: "bold", color: "white" }}>{stat.value}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                display: "flex",
                gap: "16px",
                marginBottom: "24px",
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(15px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "16px",
                padding: "20px",
              }}
            >
              <div style={{ position: "relative", flexGrow: 1 }}>
                <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "18px", height: "18px", color: "rgba(255,255,255,0.6)" }} />
                <input
                  type="text"
                  placeholder="Search by Order ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 40px",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "12px",
                    color: "white",
                    outline: "none",
                    transition: "all 0.3s",
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"}
                />
              </div>
              <div style={{ position: "relative", width: "200px" }}>
                <Calendar style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "18px", height: "18px", color: "rgba(255,255,255,0.6)" }} />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 40px",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "12px",
                    color: "white",
                    outline: "none",
                    cursor: "pointer",
                    appearance: "none", 
                  }}
                >
                  <option value="all" style={{ background: "#1e293b" }}>All Dates</option>
                  {uniqueDates.map((date) => <option key={date} value={date} style={{ background: "#1e293b" }}>{date}</option>)}
                </select>
                <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "rgba(255,255,255,0.6)" }}>▼</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(15px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "16px",
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "20px 20px 10px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <h3 style={{ fontSize: "20px", fontWeight: "600", color: "white" }}>Order History</h3>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
                      {["Order ID", "Date", "Items", "Total", "Actions"].map(header => (
                        <th key={header} style={{ padding: "16px", textAlign: "left", fontWeight: "600", color: "rgba(255,255,255,0.9)", background: "rgba(255,255,255,0.05)", fontSize: "14px", whiteSpace: "nowrap" }}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filteredOrders.map((order, index) => (
                        <motion.tr
                          key={order._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: index * 0.05 }}
                          style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", transition: "background 0.3s" }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                        >
                          <td style={{ padding: "16px", color: "rgba(255,255,255,0.8)", fontSize: "14px", whiteSpace: "nowrap" }}>
                            {(order.orderItems && order.orderItems.length > 0 && order.orderItems[0].name)
                              ? order.orderItems[0].name
                              : `Order #${index + 1}`
                            }
                          </td>
                          <td style={{ padding: "16px", color: "rgba(255,255,255,0.8)", fontSize: "14px", whiteSpace: "nowrap" }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td style={{ padding: "16px", color: "rgba(255,255,255,0.8)", fontSize: "14px" }}>
                            {order.orderItems.map((item, i) => (
                              <div key={i} style={{ whiteSpace: "nowrap" }}>{item.quantity} x {item.name}</div>
                            ))}
                          </td>
                          <td style={{ padding: "16px", color: "white", fontWeight: "500", fontSize: "14px" }}>${order.total.toFixed(2)}</td>
                          <td style={{ padding: "16px" }}>
                            <button
                              onClick={() => setSelectedOrder(order)}
                              style={{
                                padding: "6px 12px",
                                background: "rgba(255,255,255,0.1)",
                                border: "1px solid rgba(255,255,255,0.2)",
                                borderRadius: "8px",
                                color: "white",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                fontSize: "12px",
                                display: "flex", alignItems: "center", gap: "4px"
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
                              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                            >
                              <Eye style={{width: "14px", height: "14px"}}/> View
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
                {filteredOrders.length === 0 && !loading && (
                  <div style={{ textAlign: "center", padding: "48px", color: "rgba(255,255,255,0.6)"}}>
                    <Search style={{width: "48px", height: "48px", margin: "0 auto 16px auto", opacity: 0.5}}/>
                    No orders found.
                  </div>
                )}
                {loading && <div style={{ textAlign: "center", padding: "48px", color: "rgba(255,255,255,0.6)"}}>Loading orders...</div>}
                {error && <div style={{ textAlign: "center", padding: "48px", color: "#ef4444"}}>Error: {error}</div>}
              </div>
            </motion.div>
          </div>

          <AnimatePresence>
            {showCreateModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0,0,0,0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 50,
                  backdropFilter: "blur(5px)"
                }}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  style={{
                    background: "rgba(30, 41, 59, 0.9)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "16px",
                    padding: "24px",
                    width: "100%",
                    maxWidth: "600px", 
                    boxShadow: "0 15px 30px rgba(0,0,0,0.4)",
                    maxHeight: "90vh",
                    display: "flex",
                    flexDirection: "column"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h2 style={{ fontSize: "20px", fontWeight: "600", color: "white" }}>Create New Order</h2>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", padding: "8px", borderRadius: "50%"}}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <X style={{width: "20px", height: "20px"}}/>
                    </button>
                  </div>
                  <div style={{ flexGrow: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px", paddingRight: "8px", marginRight: "-8px" }}>
                    {newOrderItems.map((item, index) => (
                      <div key={index} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <input
                          placeholder="Product Name"
                          value={item.name}
                          onChange={(e) => updateOrderItem(index, "name", e.target.value)}
                          style={{ flexGrow: 1, padding: "10px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", color: "white", outline: "none" }}
                        />
                        <input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          min="1"
                          onChange={(e) => updateOrderItem(index, "quantity", e.target.value)}
                          onKeyDown={(e) => {
                            if (["-", "+", "e", "E"].includes(e.key)) {
                                e.preventDefault();
                            }
                          }}
                          style={{ width: "80px", padding: "10px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", color: "white", outline: "none" }}
                        />
                        <input
                          type="number"
                          placeholder="Price"
                          value={item.price}
                          onChange={(e) => updateOrderItem(index, "price", e.target.value)}
                          // disabled
                          style={{ width: "100px", padding: "10px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", color: "white", outline: "none" }}
                        />
                        <button
                          onClick={() => removeOrderItem(index)}
                          style={{ padding: "8px", background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: "8px", color: "#ef4444", cursor: "pointer"}}
                          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.3)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.2)"}
                        >
                          <Trash2 style={{width: "16px", height: "16px"}}/>
                        </button>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between", gap: "12px" }}>
                    <button
                      onClick={addNewOrderItem}
                      style={{ padding: "10px 16px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "10px", color: "white", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"}}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                    >
                      <Plus style={{width: "16px", height: "16px"}}/> Add Item
                    </button>
                    <button
                      onClick={createOrder}
                      style={{ padding: "10px 20px", background: "linear-gradient(45deg, #3b82f6, #6366f1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "10px", color: "white", cursor: "pointer", fontWeight: "500"}}
                      onMouseEnter={(e) => e.currentTarget.style.background = "linear-gradient(45deg, #2563eb, #4f46e5)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "linear-gradient(45deg, #3b82f6, #6366f1)"}
                    >
                      Submit Order
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {selectedOrder && (
              <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
                display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, backdropFilter: "blur(5px)"
              }}
              onClick={() => setSelectedOrder(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                style={{
                  background: "rgba(30, 41, 59, 0.9)", backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "16px",
                  padding: "24px", width: "100%", maxWidth: "500px",
                  boxShadow: "0 15px 30px rgba(0,0,0,0.4)", color: "white"
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px"}}>
                    <h2 style={{fontSize: "20px", fontWeight: "600"}}>Order Details</h2>
                    <button onClick={() => setSelectedOrder(null)} style={{background: "transparent", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", padding: "8px", borderRadius: "50%"}}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    ><X style={{width: "20px", height: "20px"}}/></button>
                </div>
                <p style={{marginBottom: "8px", color: "rgba(255,255,255,0.8)"}}><strong>Order ID:</strong> {selectedOrder.orderItems?.[0]?.name || "Order #"}</p>
                <p style={{marginBottom: "16px", color: "rgba(255,255,255,0.8)"}}><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                <h3 style={{fontSize: "16px", fontWeight: "500", marginBottom: "10px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "10px"}}>Items:</h3>
                <ul style={{listStyle: "none", padding: 0, marginBottom: "16px", maxHeight: "200px", overflowY: "auto"}}>
                {selectedOrder.orderItems.map((item, i) => (
                 <>
                    <li key={i} style={{display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)"}}>
                      <span>1 {item.name} </span>
                      <span>${item.price}</span>
                    </li>
                    <li key={i} style={{display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)"}}>
                      <span>{item.quantity} x {item.name}</span>
                      <span>${(item.price * (typeof item.quantity === "number" ? item.quantity : 0)).toFixed(2)}</span>
                    </li>
                  </>
                ))}
                </ul>
                <div style={{borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "16px", textAlign: "right", fontSize: "18px", fontWeight: "bold"}}>
                  Total: ${selectedOrder.total.toFixed(2)}
                </div>
              </motion.div>
            </motion.div>
            )}
          </AnimatePresence>
        </div>
      </>
    </Layout>
  )
}
