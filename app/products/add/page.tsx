"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Save, Package, DollarSign, Hash,  } from "lucide-react"
import Layout from "../../components/Layout" 

const categories = ["Electronics", "Grocery", "Apparel", "Accessories", "Fitness", "Home & Garden", "Books", "Sports"]
const units = ["pcs", "kg", "lbs", "liters", "meters", "boxes", "packs"]

export default function AddProductPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const productId = searchParams.get("id")

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    category: "",
    price: "",
    cost: "",
    unit: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null); 

  const API_BASE = process.env.REACT_APP_API_BASE || 'https://inventory-server-4-nrpb.onrender.com';


  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("You are not authorized. Please log in."); 
      router.push("/login");
      return;
    }

    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null); 

      try {
        const res = await fetch(`${API_BASE}/products/${productId}`, {
          headers: {
            ...(token && { "Authorization": `Bearer ${token}` }),
          },
        })
        if (productId && (res.status === 401 || res.status === 403)) {
          setError("Unauthorized to fetch product. Please log in again.");
          localStorage.removeItem("accessToken");
          router.push("/login");
          setIsLoading(false);
          return;
        }
        if (!res.ok && productId) {
            const errorData = await res.json().catch(() => ({ message: "Failed to fetch product details" }));
            throw new Error(errorData.message || `HTTP error ${res.status}`);
        }
        const data = await res.json()
        setFormData({
          name: data.name || "",
          sku: data.sku || "",
          description: data.description || "",
          category: data.category || "",
          price: data.price?.toString() || "",
          cost: data.cost?.toString() || "", 
          unit: data.unit || "",
        })
      } catch (err: any) {
        console.error("Error fetching product:", err);
        setError(err.message || "Could not load product data.");
      } finally {
        setIsLoading(false); 
      }
    }

    if (productId) {
      fetchProduct();
    }
  }, [productId, API_BASE, router]) 

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null);

    const token = localStorage.getItem("accessToken")
    if (!token) {
      setError("Authorization token not found. Please log in to save the product.");
      setIsLoading(false);
      router.push("/login"); 
      return;
    }

    const method = productId ? "PUT" : "POST"
    const url = productId ? `${API_BASE}/products/${productId}` : `${API_BASE}/products`

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price) || 0, 
          cost: parseFloat(formData.cost) || 0,  
        }),
      })

      if (res.status === 401 || res.status === 403) {
        setError("Unauthorized to save product. Please log in again.");
        localStorage.removeItem("accessToken");
        router.push("/login"); 
        throw new Error("Unauthorized to save product.");
      }
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Failed to save product" }));
        throw new Error(errorData.message || "Failed to save product");
      }

      alert(productId ? "Product updated successfully!" : "Product added successfully!")
      router.push("/products")
    } catch (err: any) {
      console.error("Error saving product:", err)
      setError(err.message || "Error saving product. Please try again.");
      alert("Error saving product"); 
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Layout>
      <div
        style={{
          minHeight: "calc(100vh - 64px)", 
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
              position: "absolute", top: "40px", left: "40px", width: "370px", height: "370px",
              background: "linear-gradient(45deg, rgba(255, 255, 255, 0.05), rgba(156, 163, 175, 0.1))",
              borderRadius: "50%", filter: "blur(50px)", animation: "float 12s ease-in-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute", bottom: "50px", right: "50px", width: "320px", height: "320px",
              background: "linear-gradient(45deg, rgba(148, 163, 184, 0.1), rgba(107, 114, 128, 0.1))",
              borderRadius: "50%", filter: "blur(50px)", animation: "float 12s ease-in-out infinite", animationDelay: "4s",
            }}
          />
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: "768px", margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => router.back()}
                style={{
                  background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "50%", padding: "10px", color: "white", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}
              >
                <ArrowLeft style={{ width: "20px", height: "20px" }} />
              </motion.button>
              <div>
                <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "white" }}>
                  {productId ? "Edit Product" : "Add New Product"}
                </h1>
                <p style={{ color: "rgba(255,255,255,0.7)", marginTop: "4px" }}>
                  {productId ? "Update product details" : "Create a new product in your inventory"}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(15px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "16px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ padding: "24px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "600", color: "white", display: "flex", alignItems: "center", gap: "10px" }}>
                <Package style={{ width: "22px", height: "22px", color: "green" }} />
                Product Information
              </h2>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", marginTop: "4px" }}>
                Fill in the details below to {productId ? "update" : "add"} a product.
              </p>
            </div>

            <div style={{ padding: "24px" }}>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {error && (
                  <div style={{ background: "rgba(239, 68, 68, 0.2)", border: "1px solid #ef4444", color: "#ef4444", padding: "12px", borderRadius: "8px", textAlign: "center" }}>{error}</div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label htmlFor="name" style={{ fontSize: "14px", fontWeight: "500", color: "rgba(255,255,255,0.8)" }}>
                      Product Name *
                    </label>
                    <div style={{ position: "relative" }}>
                      <Package style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "rgba(41, 151, 46, 0.5)" }} />
                      <input
                        id="name"
                        placeholder="Enter product name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                        style={{ width: "100%", padding: "10px 12px 10px 40px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", color: "white", outline: "none", transition: "all 0.3s" }}
                        onFocus={(e) => e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.7)"}
                        onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label htmlFor="sku" style={{ fontSize: "14px", fontWeight: "500", color: "rgba(255,255,255,0.8)" }}>
                      SKU *
                    </label>
                    <div style={{ position: "relative" }}>
                      <Hash style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "rgba(41, 151, 46, 0.5)" }} />
                      <input
                        id="sku"
                        placeholder="Enter SKU"
                        value={formData.sku}
                        onChange={(e) => handleInputChange("sku", e.target.value)}
                        required
                        style={{ width: "100%", padding: "10px 12px 10px 40px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", color: "white", outline: "none", transition: "all 0.3s" }}
                        onFocus={(e) => e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.7)"}
                        onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label htmlFor="description" style={{ fontSize: "14px", fontWeight: "500", color: "rgba(255,255,255,0.8)" }}>
                    Description
                  </label>
                  <textarea
                    id="description"
                    placeholder="Enter product description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    style={{ width: "100%", minHeight: "100px", padding: "10px 12px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", color: "white", outline: "none", transition: "all 0.3s" }}
                    onFocus={(e) => e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.7)"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label htmlFor="category" style={{ fontSize: "14px", fontWeight: "500", color: "rgba(255,255,255,0.8)" }}>
                      Category *
                    </label>
                    <div style={{ position: "relative" }}>
                      <select
                        id="category"
                        value={formData.category}
                        onChange={(e) => handleInputChange("category", e.target.value)}
                        required
                        style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", color: "white", outline: "none", appearance: "none", cursor: "pointer", transition: "all 0.3s" }}
                        onFocus={(e) => e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.7)"}
                        onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"}
                      >
                        <option value="" style={{ background: "#1e293b" }}>Select category</option>
                        {categories.map((category) => (
                          <option key={category} value={category} style={{ background: "#1e293b" }}>{category}</option>
                        ))}
                      </select>
                      <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "rgba(255,255,255,0.6)" }}>▼</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label htmlFor="unit" style={{ fontSize: "14px", fontWeight: "500", color: "rgba(255,255,255,0.8)" }}>
                      Unit *
                    </label>
                    <div style={{ position: "relative" }}>
                      <select
                        id="unit"
                        value={formData.unit}
                        onChange={(e) => handleInputChange("unit", e.target.value)}
                        required
                        style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", color: "white", outline: "none", appearance: "none", cursor: "pointer", transition: "all 0.3s" }}
                        onFocus={(e) => e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.7)"}
                        onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"}
                      >
                        <option value="" style={{ background: "#1e293b" }}>Select unit</option>
                        {units.map((unit) => (
                          <option key={unit} value={unit} style={{ background: "#1e293b" }}>{unit}</option>
                        ))}
                      </select>
                      <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "rgba(255,255,255,0.6)" }}>▼</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label htmlFor="cost" style={{ fontSize: "14px", fontWeight: "500", color: "rgba(255,255,255,0.8)" }}>
                      Cost Price *
                    </label>
                    <div style={{ position: "relative" }}>
                      <DollarSign style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "rgba(255,255,255,0.5)" }} />
                      <input
                        id="cost" type="number" step="0.01" placeholder="0.00"
                        value={formData.cost}
                        onChange={(e) => handleInputChange("cost", e.target.value)}
                        required
                        style={{ width: "100%", padding: "10px 12px 10px 40px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", color: "white", outline: "none", transition: "all 0.3s" }}
                        onFocus={(e) => e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.7)"}
                        onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"}
                      />
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label htmlFor="price" style={{ fontSize: "14px", fontWeight: "500", color: "rgba(255,255,255,0.8)" }}>
                      Selling Price *
                    </label>
                    <div style={{ position: "relative" }}>
                      <DollarSign style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "rgba(255,255,255,0.5)" }} />
                      <input
                        id="price" type="number" step="0.01" placeholder="0.00"
                        value={formData.price}
                        onChange={(e) => handleInputChange("price", e.target.value)}
                        required
                        style={{ width: "100%", padding: "10px 12px 10px 40px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", color: "white", outline: "none", transition: "all 0.3s" }}
                        onFocus={(e) => e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.7)"}
                        onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "16px", paddingTop: "24px", marginTop: "16px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                  <button
                    type="button"
                    onClick={() => router.back()}
                    style={{
                      flex: 1, padding: "12px", background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)", borderRadius: "10px",
                      color: "white", cursor: "pointer", transition: "all 0.3s", fontWeight: "500"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      flex: 1, padding: "12px", background: "linear-gradient(45deg, #3b82f6, #6366f1)",
                      border: "1px solid rgba(59, 130, 246, 0.5)", borderRadius: "10px",
                      color: "white", cursor: isLoading ? "not-allowed" : "pointer", transition: "all 0.3s",
                      fontWeight: "500", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                      opacity: isLoading ? 0.7 : 1
                    }}
                    onMouseEnter={(e) => !isLoading && (e.currentTarget.style.background = "linear-gradient(45deg, #2563eb, #4f46e5)")}
                    onMouseLeave={(e) => !isLoading && (e.currentTarget.style.background = "linear-gradient(45deg, #3b82f6, #6366f1)")}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        style={{ width: "18px", height: "18px", border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%" }}
                      />
                    ) : (
                      <Save style={{ width: "16px", height: "16px" }} />
                    )}
                    {isLoading ? "Saving..." : "Save Product"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}
