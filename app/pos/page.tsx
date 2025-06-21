"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Minus, Plus, Search, ShoppingCart, Trash2, CreditCard } from "lucide-react"
import { useRouter } from "next/navigation"
import Layout from "../components/Layout"

interface Product {
  _id: string
  name: string
  sku: string
  price: number
  stock: number
  category: string
}

interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  totalPrice: number
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false) 
  const [productsLoading, setProductsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter()

  const API_BASE = process.env.REACT_APP_API_BASE || 'https://inventory-server-4-nrpb.onrender.com';


  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setProductsLoading(true);
    setError(null);
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("Authorization token not found. Please log in.");
      setProductsLoading(false);
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/products`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.status === 401 || res.status === 403) {
        setError("Unauthorized. Please log in again.");
        localStorage.removeItem("accessToken");
        router.push("/login");
        return;
      }
      if (!res.ok) throw new Error(`Network response was not ok: ${res.statusText}`);
      const data = await res.json()
      setProducts(data)
    } catch (err: any) {
      console.error("Failed to fetch products", err)
      setError(err.message || "Failed to fetch products.");
    } finally {
      setProductsLoading(false);
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.productId === product._id)
      if (exists) {
        const newQuantity = exists.quantity + 1;
        if (newQuantity > product.stock) return prev;

        return prev.map((item) =>
          item.productId === product._id
            ? {
                ...item,
                quantity: newQuantity,
                totalPrice: newQuantity * item.price,
              }
            : item
        )
      }
      if (product.stock < 1) return prev; 
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: 1,
          totalPrice: product.price,
        },
      ]
    })
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    const productInCatalog = products.find(p => p._id === productId);
    if (!productInCatalog) return;


    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const validatedQuantity = Math.max(1, Math.min(newQuantity, productInCatalog.stock));
            return { ...item, quantity: validatedQuantity, totalPrice: validatedQuantity * item.price };
          }
          return item;
        })
        .filter((item) => item.quantity > 0) 
    );
  };


  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId))
  }

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0)
  const taxRate = 0.08 
  const tax = subtotal * taxRate
  const total = subtotal + tax

  const handleCheckout = async () => {
    if (!cart.length) return
    setLoading(true)
    setError(null);
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("Authorization token not found. Please log in.");
      setLoading(false);
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          orderItems: cart.map(({ productId, name, quantity, price }) => ({
            productId, 
            name,
            quantity,
            price,
          })),
          total,
        }),
      })
      if (res.status === 401 || res.status === 403) {
        setError("Unauthorized. Please log in again during checkout.");
        localStorage.removeItem("accessToken");
        router.push("/login");
        return;
      }
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create order");
      }
      setCart([])
      alert("Order placed successfully!")
      fetchProducts(); 
    } catch (err: any) {
      console.error("Checkout failed", err)
      setError(`Checkout failed: ${err.message}`);
      alert(`Checkout failed: ${err.message}`); 
    } finally {
      setLoading(false)
    }
  }

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
            color: "white",
          }}
        >
          <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
            <div
              style={{
                position: "absolute",
                top: "50px",
                left: "50px",
                width: "350px",
                height: "350px",
                background: "linear-gradient(45deg, rgba(255, 255, 255, 0.05), rgba(156, 163, 175, 0.1))",
                borderRadius: "50%",
                filter: "blur(50px)",
                animation: "float 10s ease-in-out infinite",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "70px",
                right: "70px",
                width: "300px",
                height: "300px",
                background: "linear-gradient(45deg, rgba(148, 163, 184, 0.1), rgba(107, 114, 128, 0.1))",
                borderRadius: "50%",
                filter: "blur(50px)",
                animation: "float 10s ease-in-out infinite",
                animationDelay: "3s",
              }}
            />
          </div>

          <div style={{ position: "relative", zIndex: 1 }}>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}
            >
              <div>
                <h1 style={{ fontSize: "36px", fontWeight: "bold", color: "white", marginBottom: "4px" }}>
                  Point of Sale
                </h1>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "18px", marginBottom: "16px" }}>
                  Process sales quickly and efficiently
                </p>
              </div>
              {error && !loading && ( 
                  <div style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(239, 68, 68, 0.8)", border: "1px solid #ef4444", color: "white", padding: "10px 15px", borderRadius: "8px", zIndex: 100 }}>
                      Error: {error}
                  </div>
              )}
            </motion.div>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay: 0.1}}>
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
            </motion.div>

            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)", gap: "24px" }}>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                <h2 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "24px", color: "white" }}>Products</h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {!productsLoading && filteredProducts.map((product, index) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 + 0.1 }} 
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "12px",
                        padding: "16px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
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
                      <div>
                        <h3 style={{ fontSize: "16px", fontWeight: "600", color: "white", marginBottom: "4px", minHeight: "40px" }}>{product.name}</h3>
                        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}>{product.sku}</p>
                        <p style={{ fontSize: "14px", fontWeight: "500", color: "white", marginBottom: "4px" }}>${product.price.toFixed(2)}</p>
                        <p style={{ fontSize: "12px", color: product.stock > 0 ? 'rgba(255,255,255,0.6)' : '#ef4444' }}>
                          Stock: {product.stock > 0 ? product.stock : "Out of stock"}
                        </p>
                      </div>
                      <button
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                        style={{
                          marginTop: "12px",
                          width: "100%",
                          padding: "8px 12px",
                          background: product.stock > 0 ? "rgba(255, 255, 255, 0.1)" : "rgba(255,255,255,0.03)",
                          border: `1px solid rgba(255, 255, 255, ${product.stock > 0 ? '0.2' : '0.05'})`,
                          color: product.stock > 0 ? "white" : "rgba(255,255,255,0.4)",
                          borderRadius: "8px",
                          cursor: product.stock > 0 ? "pointer" : "not-allowed",
                          transition: "all 0.2s",
                          fontSize: "14px",
                        }}
                        onMouseEnter={(e) => product.stock > 0 && (e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)")}
                        onMouseLeave={(e) => product.stock > 0 && (e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)")}
                      >
                        Add to Cart
                      </button>
                    </motion.div>
                  ))}
                  {productsLoading && (
                     <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.7)"}}>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          style={{ width: "32px", height: "32px", border: "3px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", margin: "0 auto 16px auto" }}
                        />
                        Loading products...</div>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                style={{
                  background: "rgba(255, 255, 255, 0.03)", 
                  backdropFilter: "blur(15px)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "16px",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  maxHeight: "calc(100vh - 100px)", 
                  marginTop: "12px"
                }}
              >
                <h2 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "24px", color: "white", display: "flex", alignItems: "center" }}>
                  <ShoppingCart style={{ marginRight: "10px", width: "22px", height: "22px" }} />
                  Cart
                </h2>
                {cart.length === 0 ? (
                  <div style={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "12px",
                    padding: "32px",
                    textAlign: "center",
                    color: "rgba(255,255,255,0.5)"
                  }}>
                    <ShoppingCart style={{width: "48px", height: "48px", margin: "0 auto 16px auto", opacity: 0.5}}/>
                    Your cart is empty
                  </div>
                ) : (
                  <>
                    <div style={{ flexGrow: 1, overflowY: "auto", marginRight: "-12px", paddingRight: "12px", display: "flex", flexDirection: "column", gap: "16px" }}>
                      <AnimatePresence>
                        {cart.map((item, index) => (
                          <motion.div
                            key={item.productId}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ delay: index * 0.05 }}
                            style={{
                              background: "rgba(255, 255, 255, 0.05)",
                              backdropFilter: "blur(10px)",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                              borderRadius: "12px",
                              padding: "16px",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                              <div>
                                <p style={{ fontWeight: "600", color: "white", fontSize: "15px" }}>{item.name}</p>
                                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>
                                  ${item.price.toFixed(2)} x {item.quantity}
                                </p>
                              </div>
                              <button
                                onClick={() => removeFromCart(item.productId)}
                                style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", padding: "4px", borderRadius: "50%" }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)"}
                                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                              >
                                <Trash2 style={{ width: "16px", height: "16px" }} />
                              </button>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                style={{ padding: "6px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "6px", color: "white", cursor: "pointer", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center" }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
                                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                              >
                                <Minus style={{ width: "12px", height: "12px" }} />
                              </button>
                              <span style={{ fontSize: "14px", color: "white", minWidth: "20px", textAlign: "center" }}>{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                style={{ padding: "6px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "6px", color: "white", cursor: "pointer", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center" }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
                                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                              >
                                <Plus style={{ width: "12px", height: "12px" }} />
                              </button>
                              <span style={{ marginLeft: "auto", fontWeight: "600", color: "white", fontSize: "15px" }}>${item.totalPrice.toFixed(2)}</span>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "20px", marginTop: "10px", background: "rgba(255,255,255,0.05)", borderRadius: "12px", padding: "20px", color: "rgba(255,255,255,0.8)"}}>
                      <div style={{display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px"}}><span>Subtotal:</span> <span>${subtotal.toFixed(2)}</span></div>
                      <div style={{display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "14px"}}><span>Tax ({taxRate*100}%):</span> <span>${tax.toFixed(2)}</span></div>
                      <div style={{display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "18px", color: "white", marginBottom: "20px"}}><span>Total:</span> <span>${total.toFixed(2)}</span></div>
                      <button
                        onClick={handleCheckout}
                        disabled={loading}
                        style={{
                          width: "100%",
                          padding: "12px",
                          background: "linear-gradient(45deg, #3b82f6, #6366f1)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          color: "white",
                          borderRadius: "12px",
                          cursor: loading ? "not-allowed" : "pointer",
                          transition: "all 0.3s",
                          fontSize: "16px",
                          fontWeight: "600",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          boxShadow: "0 8px 20px rgba(0,0,0,0.3)"
                        }}
                        onMouseEnter={(e) => !loading && (e.currentTarget.style.background = "linear-gradient(45deg, #2563eb, #4f46e5)")}
                        onMouseLeave={(e) => !loading && (e.currentTarget.style.background = "linear-gradient(45deg, #3b82f6, #6366f1)")}
                      >
                        {loading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                            style={{width: "20px", height: "20px", border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%"}}
                          />
                        ) : (
                          <><CreditCard style={{ width: "18px", height: "18px" }} /> Checkout</>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </>
    </Layout>
  )
}
