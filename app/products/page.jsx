"use client"

import { useEffect, useState, useMemo } from "react"
import {
  Plus, Search, Grid, List, Star, TrendingUp,
  Package, Zap, Edit, Eye, Trash2, Filter, QrCode,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Layout from "../components/Layout"
import ProductViewDialog from "../components/ProductViewDialog" 
import BarcodePreview from "../components/BarcodePreview"

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("") 
  const [viewMode, setViewMode] = useState("grid")
  const [sortBy, setSortBy] = useState("name")
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedProductForView, setSelectedProductForView] = useState(null);

  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000/api"

  const PREDEFINED_PRODUCT_CATEGORIES = [
    "Grocery",
    "Books",
    "Apparel",
    "Electronics",
    "Home & Kitchen",
    "Sports & Outdoors",
    "Beauty & Personal Care",
    "Toys & Games",
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("accessToken")
      if (!token) {
        setError("Authorization token not found. Please log in.");
        setLoading(false);
        router.push("/login");
        return;
      }

      const res = await fetch(`${API_BASE}/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      if (res.status === 401 || res.status === 403) {
        setError("Unauthorized to fetch products. Please log in again.");
        localStorage.removeItem("accessToken");
        router.push("/login");
        setLoading(false);
        return;
      }
      if (res.ok) {
        const data = await res.json()
        setProducts(Array.isArray(data) ? data : [])
      } else {
        const errorData = await res.json().catch(() => ({ message: "Failed to fetch products" }));
        console.error("Failed to fetch products", errorData.message || res.statusText);
        setError(errorData.message || `Failed to fetch products: ${res.statusText}`);
        setProducts([]) 
      }
      setLoading(false);
    }
    fetchProducts().catch(err => {
      console.error("Fetch products error:", err);
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    });
  }, [router, API_BASE]) 

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return
    const token = localStorage.getItem("accessToken")
    if (!token) {
      alert("Authorization token not found. Please log in.");
      router.push("/login");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (res.status === 401 || res.status === 403) {
        alert("Unauthorized to delete product. Please log in again.");
        localStorage.removeItem("accessToken");
        router.push("/login");
        return;
      }
      if (!res.ok) throw new Error("Delete failed")
      setProducts((prev) => prev.filter((p) => p._id !== id))
      alert("Deleted successfully")
    } catch (err) {
      alert("Error deleting product")
      console.error(err)
    }
  }

  const handleOpenViewDialog = (product) => {
    setSelectedProductForView(product);
    setIsViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setIsViewDialogOpen(false);
    setSelectedProductForView(null); 
  };

  const processedProducts = useMemo(() => {
    const currentProducts = Array.isArray(products) ? products : [];

    const filtered = currentProducts.filter((product) => {
      const productName = product.name || "";
      const productSku = product.sku || "";
      const productCategory = product.category || "";

      const matchesSearch =
        productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        productSku.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        categoryFilter === "" || 
        categoryFilter === "all" ||
        productCategory === categoryFilter;

      return matchesSearch && matchesCategory;
    });

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        case "price":
          return (a.price || 0) - (b.price || 0);
        case "stock":
          return (a.stock || 0) - (b.stock || 0);
        case "sales":
          return (a.sales || 0) - (b.sales || 0);
        default:
          return 0;
      }
    });

    return sorted;
  }, [products, searchTerm, categoryFilter, sortBy]);

  const totalProducts = useMemo(() => (Array.isArray(products) ? products : []).length, [products]);
  const totalValue = useMemo(() => {
    const currentProducts = Array.isArray(products) ? products : [];
    return currentProducts.reduce((sum, product) => sum + (product.price || 0) * (product.stock || 1), 0);
  }, [products]);
  const lowStockCount = useMemo(() => {
    const currentProducts = Array.isArray(products) ? products : [];
    return currentProducts.filter((product) => (product.stock || 0) < 50).length;
  }, [products]);

  const getStatIconColor = (color) => {
    const colors = {
      emerald: "linear-gradient(45deg, #10b981, #059669)",
      slate: "linear-gradient(45deg, #475569, #374151)",
      amber: "linear-gradient(45deg, #f59e0b, #d97706)",
      indigo: "linear-gradient(45deg, #6366f1, #4f46e5)",
    }
    return colors[color] || colors.slate
  }

  const getStockBadgeStyle = (stock) => {
    if (stock > 50) {
      return {
        background: "rgba(34, 197, 94, 0.2)",
        color: "#22c55e",
        border: "1px solid #22c55e",
      }
    } else if (stock > 20) {
      return {
        background: "rgba(251, 191, 36, 0.2)",
        color: "#fbbf24",
        border: "1px solid #fbbf24",
      }
    } else {
      return {
        background: "rgba(239, 68, 68, 0.2)",
        color: "#ef4444",
        border: "1px solid #ef4444",
      }
    }
  }

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
              Product{" "}
              <span
                style={{
                  background: "linear-gradient(45deg, #e5e7eb, #ffffff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Catalog
              </span>
            </h1>
            <p style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "18px" }}>
              Manage your product inventory with precision
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => router.push("/products/add")}
              style={{
                background: "linear-gradient(45deg, #475569, #64748b)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "white",
                borderRadius: "16px",
                padding: "12px 24px",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "linear-gradient(45deg, #374151, #4b5563)"
                e.currentTarget.style.transform = "scale(1.05)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "linear-gradient(45deg, #475569, #64748b)"
                e.currentTarget.style.transform = "scale(1)"
              }}
            >
              <Plus style={{ width: "16px", height: "16px" }} />
              Add Product
            </button>
          </div>
        </div>

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
              title: "Total Products",
              value: totalProducts.toString(),
              icon: Package,
              color: "slate",
            },
            {
              title: "Total Value",
              value: `$${totalValue.toLocaleString()}`,
              icon: TrendingUp,
              color: "emerald",
            },
            {
              title: "Low Stock",
              value: lowStockCount.toString(),
              icon: Zap,
              color: "amber",
            },
          ].map((stat) => (
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
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"
                e.currentTarget.style.transform = "translateY(-5px)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"
                e.currentTarget.style.transform = "translateY(0)"
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
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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
                    }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={(e) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)"
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.4)"
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)"
                    }}
                  />
                </div>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Filter style={{ width: "16px", height: "16px", color: "rgba(255, 255, 255, 0.6)" }} />
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      style={{
                        width: "192px",
                        background: "rgba(255, 255, 255, 0.1)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        color: "white",
                        borderRadius: "16px",
                        padding: "12px 16px",
                        outline: "none",
                        cursor: "pointer",
                      }}
                    >
                      <option value="all" style={{ background: "#1e293b" }}>
                        All Categories
                      </option>
                      {PREDEFINED_PRODUCT_CATEGORIES.map((category) => (
                        <option key={category} value={category} style={{ background: "#1e293b" }}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{
                      width: "160px",
                      background: "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      color: "white",
                      borderRadius: "16px",
                      padding: "12px 16px",
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    <option value="name" style={{ background: "#1e293b" }}>
                      Sort by Name
                    </option>
                    <option value="price" style={{ background: "#1e293b" }}>
                      Sort by Price
                    </option>
                    <option value="stock" style={{ background: "#1e293b" }}>
                      Sort by Stock
                    </option>
                    <option value="sales" style={{ background: "#1e293b" }}>
                      Sort by Sales
                    </option>
                  </select>
                  <div
                    style={{
                      display: "flex",
                      gap: "4px",
                      background: "rgba(255, 255, 255, 0.1)",
                      borderRadius: "16px",
                      padding: "4px",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <button
                      onClick={() => setViewMode("grid")}
                      style={{
                        background: viewMode === "grid" ? "rgba(255, 255, 255, 0.2)" : "transparent",
                        border: "none",
                        color: "white",
                        borderRadius: "12px",
                        padding: "8px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "40px",
                        height: "40px",
                      }}
                    >
                      <Grid style={{ width: "16px", height: "16px" }} />
                    </button>
                    <button
                      onClick={() => setViewMode("table")}
                      style={{
                        background: viewMode === "table" ? "rgba(255, 255, 255, 0.2)" : "transparent",
                        border: "none",
                        color: "white",
                        borderRadius: "12px",
                        padding: "8px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "40px",
                        height: "40px",
                      }}
                    >
                      <List style={{ width: "16px", height: "16px" }} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {viewMode === "grid" ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "24px",
              animation: "fadeIn 0.6s ease-out",
            }}
          >
            {!loading && processedProducts.map((product, index) => (
              <div
                key={product._id} 
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "16px",
                  overflow: "hidden",
                  transition: "all 0.5s",
                  cursor: "pointer",
                  animation: `slideInUp 0.6s ease-out ${index * 0.1}s both`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"
                  e.currentTarget.style.transform = "translateY(-10px) scale(1.05)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"
                  e.currentTarget.style.transform = "translateY(0) scale(1)"
                }}
              >
                <div style={{ padding: "20px", paddingBottom: "12px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: "12px",
                    }}
                  >
                    <div style={{ flexGrow: 1 }}>
                      <h3
                        style={{
                          color: "white",
                          fontSize: "18px",
                          fontWeight: "600",
                          marginBottom: "4px",
                        }}
                      >
                        {product.name}
                      </h3>
                      <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "14px", marginBottom: "8px" }}>
                        {product.sku}
                      </p>
                      <BarcodePreview sku={product.sku} apiBaseUrl={API_BASE} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Star style={{ width: "16px", height: "16px", color: "#fbbf24", fill: "#fbbf24" }} />
                      <span style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "14px" }}>{product.rating}</span>
                    </div>
                  </div>
                </div>
                <div style={{ padding: "0 20px 20px", marginTop: "12px"}}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "16px",
                    }}
                  >
                    <span
                      style={{
                        color: "rgba(255, 255, 255, 0.8)",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        borderRadius: "8px",
                        padding: "4px 8px",
                        fontSize: "12px",
                      }}
                    >
                      {product.category}
                    </span>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "12px" }}>Sales</p>
                      <p style={{ color: "white", fontWeight: "600" }}>{product.sales || 0}</p>
                    </div>
                  </div>
                  <div style={{ marginBottom: "16px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "8px",
                      }}
                    >
                      <span style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "14px" }}>Price:</span>
                      <span style={{ color: "white", fontWeight: "bold" }}>${product.price || 0}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "14px" }}>Stock:</span>
                      <span
                        style={{
                          ...getStockBadgeStyle(product.stock),
                          borderRadius: "8px",
                          padding: "2px 6px",
                          fontSize: "12px",
                        }}
                      >
                        {product.stock === undefined ? 'N/A' : product.stock}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", paddingTop: "8px" }}>
                    <button
                      style={{
                        flex: 1,
                        background: "rgba(255, 255, 255, 0.1)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        color: "white",
                        borderRadius: "12px",
                        padding: "8px 12px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "4px",
                        fontSize: "14px",
                      }}
                      onClick={() => router.push(`/products/edit/${product._id}`)} 
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)"
                        e.currentTarget.style.transform = "scale(1.05)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"
                        e.currentTarget.style.transform = "scale(1)"
                      }}
                    >
                      <Edit style={{ width: "12px", height: "12px" }} />
                      Edit
                    </button>
                    <button
                      style={{
                        background: "rgba(255, 255, 255, 0.1)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        color: "white",
                        borderRadius: "12px",
                        padding: "8px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "40px",
                        height: "32px",
                      }}
                      onClick={() => handleOpenViewDialog(product)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)"
                        e.currentTarget.style.transform = "scale(1.05)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"
                        e.currentTarget.style.transform = "scale(1)"
                      }}
                    >
                      <Eye style={{ width: "12px", height: "12px" }} />
                    </button>
                    <button
                      style={{
                        background: "rgba(255, 255, 255, 0.1)",
                        border: "1px solid rgba(239, 68, 68, 0.2)",
                        color: "#ef4444",
                        borderRadius: "12px",
                        padding: "8px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "40px",
                        height: "32px",
                      }}
                      onClick={() => handleDelete(product._id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)"
                        e.currentTarget.style.transform = "scale(1.05)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"
                        e.currentTarget.style.transform = "scale(1)"
                      }}
                    >
                      <Trash2 style={{ width: "12px", height: "12px" }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "16px",
              overflow: "hidden",
              animation: "fadeIn 0.6s ease-out",
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.2)" }}>
                    <th
                      style={{
                        padding: "16px",
                        textAlign: "left",
                        fontWeight: "600",
                        color: "rgba(255, 255, 255, 0.9)",
                        background: "rgba(255, 255, 255, 0.05)",
                      }}
                    >
                      Product
                    </th>
                    <th
                      style={{
                        padding: "16px",
                        textAlign: "left",
                        fontWeight: "600",
                        color: "rgba(255, 255, 255, 0.9)",
                        background: "rgba(255, 255, 255, 0.05)",
                      }}
                    >
                      SKU
                    </th>
                    <th
                      style={{
                        padding: "16px",
                        textAlign: "left",
                        fontWeight: "600",
                        color: "rgba(255, 255, 255, 0.9)",
                        background: "rgba(255, 255, 255, 0.05)",
                      }}
                    >
                      Barcode
                    </th>
                    <th
                      style={{
                        padding: "16px",
                        textAlign: "left",
                        fontWeight: "600",
                        color: "rgba(255, 255, 255, 0.9)",
                        background: "rgba(255, 255, 255, 0.05)",
                      }}
                    >
                      Category
                    </th>
                    <th
                      style={{
                        padding: "16px",
                        textAlign: "right",
                        fontWeight: "600",
                        color: "rgba(255, 255, 255, 0.9)",
                        background: "rgba(255, 255, 255, 0.05)",
                      }}
                    >
                      Price
                    </th>
                    <th
                      style={{
                        padding: "16px",
                        textAlign: "right",
                        fontWeight: "600",
                        color: "rgba(255, 255, 255, 0.9)",
                        background: "rgba(255, 255, 255, 0.05)",
                      }}
                    >
                      Stock
                    </th>
                    <th
                      style={{
                        padding: "16px",
                        textAlign: "right",
                        fontWeight: "600",
                        color: "rgba(255, 255, 255, 0.9)",
                        background: "rgba(255, 255, 255, 0.05)",
                      }}
                    >
                      Sales
                    </th>
                    <th
                      style={{
                        padding: "16px",
                        textAlign: "right",
                        fontWeight: "600",
                        color: "rgba(255, 255, 255, 0.9)",
                        background: "rgba(255, 255, 255, 0.05)",
                      }}
                    >
                      Rating
                    </th>
                    <th
                      style={{
                        padding: "16px",
                        textAlign: "right",
                        fontWeight: "600",
                        color: "rgba(255, 255, 255, 0.9)",
                        background: "rgba(255, 255, 255, 0.05)",
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && processedProducts.map((product, index) => (
                    <tr
                      key={product._id}
                      style={{
                        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                        transition: "background 0.3s",
                        animation: `slideInLeft 0.6s ease-out ${index * 0.05}s both`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent"
                      }}
                    >
                      <td style={{ padding: "16px", color: "rgba(255, 255, 255, 0.8)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                           <span style={{ fontSize: "24px" }}>
                            {product.image || <Package size={24} /> }
                          </span>
                          <div>
                            <p style={{ fontWeight: "500", color: "white", marginBottom: "2px" }}>{product.name}</p>
                            <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "14px" }}>{product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "16px", color: "rgba(255, 255, 255, 0.8)" }}>{product.sku}</td>
                      <td style={{ padding: "16px" }}>
                        <BarcodePreview sku={product.sku} apiBaseUrl={API_BASE} />
                      </td>
                      <td style={{ padding: "16px" }}>
                        <span
                          style={{
                            color: "rgba(255, 255, 255, 0.8)",
                            border: "1px solid rgba(255, 255, 255, 0.3)",
                            borderRadius: "8px",
                            padding: "4px 8px",
                            fontSize: "12px",
                          }}
                        >
                          {product.category}
                        </span>
                      </td>
                      <td style={{ padding: "16px", textAlign: "right", fontWeight: "600", color: "white" }}>
                        ${product.price || 0}
                      </td>
                      <td style={{ padding: "16px", textAlign: "right" }}>
                        <span
                          style={{
                            ...getStockBadgeStyle(product.stock),
                            borderRadius: "8px",
                            padding: "4px 8px",
                            fontSize: "12px",
                          }}
                        >
                          {product.stock === undefined ? 'N/A' : product.stock}
                        </span>
                      </td>
                      <td style={{ padding: "16px", textAlign: "right", color: "rgba(255, 255, 255, 0.8)" }}>
                        {product.sales || 0}
                      </td>
                      <td style={{ padding: "16px", textAlign: "right" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px" }}>
                          <Star style={{ width: "16px", height: "16px", color: (product.rating && product.rating > 0) ? "#fbbf24" : "rgba(255,255,255,0.3)", fill: (product.rating && product.rating > 0) ? "#fbbf24" : "none" }} />
                          <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>{product.rating}</span>
                        </div>
                      </td>
                      <td style={{ padding: "16px", textAlign: "right" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "4px" }}>
                          <button
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "rgba(255, 255, 255, 0.8)",
                              cursor: "pointer",
                              padding: "8px",
                              borderRadius: "12px",
                              transition: "all 0.2s",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            onClick={() => handleOpenViewDialog(product)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"
                              e.currentTarget.style.transform = "scale(1.1)"
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "transparent"
                              e.currentTarget.style.transform = "scale(1)"
                            }}
                          >
                            <Eye style={{ width: "16px", height: "16px" }} />
                          </button>
                          <button
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "rgba(255, 255, 255, 0.8)",
                              cursor: "pointer",
                              padding: "8px",
                              borderRadius: "12px",
                              transition: "all 0.2s",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            onClick={() => router.push(`/products/edit/${product._id}`)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"
                              e.currentTarget.style.transform = "scale(1.1)"
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "transparent"
                              e.currentTarget.style.transform = "scale(1)"
                            }}
                          >
                            <Edit style={{ width: "16px", height: "16px" }} />
                          </button>
                          <button
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#ef4444",
                              cursor: "pointer",
                              padding: "8px",
                              borderRadius: "12px",
                              transition: "all 0.2s",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            onClick={() => handleDelete(product._id)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)"
                              e.currentTarget.style.transform = "scale(1.1)"
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "transparent"
                              e.currentTarget.style.transform = "scale(1)"
                            }}
                          >
                            <Trash2 style={{ width: "16px", height: "16px" }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && processedProducts.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "64px 0",
              animation: "fadeIn 0.6s ease-out",
            }}
          >
            <div style={{ color: "rgba(255, 255, 255, 0.4)", marginBottom: "24px" }}>
              <Search style={{ width: "64px", height: "64px", margin: "0 auto" }} />
            </div>
            <h3 style={{ fontSize: "24px", fontWeight: "bold", color: "white", marginBottom: "8px" }}>
              No products found
            </h3>
            <p style={{ color: "rgba(255, 255, 255, 0.6)", marginBottom: "24px" }}>
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={() => router.push("/products/add")}
              style={{
                background: "linear-gradient(45deg, #475569, #64748b)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "white",
                borderRadius: "16px",
                padding: "12px 24px",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "linear-gradient(45deg, #374151, #4b5563)"
                e.currentTarget.style.transform = "scale(1.05)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "linear-gradient(45deg, #475569, #64748b)"
                e.currentTarget.style.transform = "scale(1)"
              }}
            >
              <Plus style={{ width: "16px", height: "16px" }} />
              Add Your First Product
            </button>
          </div>
        )}
        {loading && (
           <div style={{ textAlign: "center", padding: "64px 0", color: "rgba(255,255,255,0.7)"}}>
              <div style={{ color: "rgba(255, 255, 255, 0.4)", marginBottom: "24px" }}>
                <div style={{ width: "48px", height: "48px", border: "4px solid rgba(255,255,255,0.2)", borderTopColor: "white", borderRadius: "50%", margin: "0 auto", animation: "spin 1s linear infinite" }} />
              </div>
              <h3 style={{ fontSize: "24px", fontWeight: "bold", color: "white", marginBottom: "8px" }}>Loading Products...</h3>
              <p style={{ color: "rgba(255, 255, 255, 0.6)" }}>Please wait a moment.</p>
            </div>
        )}

        <ProductViewDialog
          isOpen={isViewDialogOpen}
          product={selectedProductForView}
          onClose={handleCloseViewDialog}
        />
      </>
    </Layout>
  )
}