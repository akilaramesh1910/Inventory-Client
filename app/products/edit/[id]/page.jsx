"use client"

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Layout from "../../../components/Layout"; 
import { ArrowLeft, Save } from "lucide-react";

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

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000/api";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id;

  const [productData, setProductData] = useState({
    name: "",
    sku: "",
    category: PREDEFINED_PRODUCT_CATEGORIES[0] || "",
    price: "",
    stock: "",
    description: "",
    image: "",
  });
  const [originalProductName, setOriginalProductName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!productId) {
      setError("Product ID not found in URL.");
      setLoading(false);
      return;
    }

    const fetchProductDetails = async () => {
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
        const res = await fetch(`${API_BASE}/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401 || res.status === 403) {
          setError("Unauthorized to fetch product details. Please log in again.");
          localStorage.removeItem("accessToken");
          router.push("/login");
          setLoading(false);
          return;
        }

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: "Failed to fetch product data" }));
          throw new Error(errorData.message || `Error fetching data: ${res.statusText}`);
        }

        const allProducts = await res.json();
        const productToEdit = Array.isArray(allProducts) ? allProducts.find(p => p._id === productId) : null;

        if (productToEdit) {
          setProductData({
            name: productToEdit.name || "",
            sku: productToEdit.sku || "",
            category: productToEdit.category || PREDEFINED_PRODUCT_CATEGORIES[0] || "",
            price: productToEdit.price !== undefined ? String(productToEdit.price) : "",
            stock: productToEdit.stock !== undefined ? String(productToEdit.stock) : "",
            description: productToEdit.description || "",
            image: productToEdit.image || "",
          });
          setOriginalProductName(productToEdit.name || "this product");
        } else {
          setError(`Product with ID ${productId} not found. It may have been deleted.`);
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError(err.message || "An unexpected error occurred while fetching product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setSuccessMessage("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage("");

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("Authorization token not found. Please log in.");
      setSaving(false);
      router.push("/login");
      return;
    }

    const payload = {
      ...productData,
      price: parseFloat(productData.price) || 0,
      stock: parseInt(productData.stock, 10) || 0,
    };

    try {
      const res = await fetch(`${API_BASE}/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401 || res.status === 403) {
        setError("Unauthorized to update product. Please log in again.");
        localStorage.removeItem("accessToken");
        router.push("/login");
        setSaving(false);
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Failed to update product" }));
        throw new Error(errorData.message || `Error updating product: ${res.statusText}`);
      }

      const updatedProduct = await res.json();
      setSuccessMessage("Product updated successfully!");
      setProductData({
        name: updatedProduct.name || "",
        sku: updatedProduct.sku || "",
        category: updatedProduct.category || PREDEFINED_PRODUCT_CATEGORIES[0] || "",
        price: updatedProduct.price !== undefined ? String(updatedProduct.price) : "",
        stock: updatedProduct.stock !== undefined ? String(updatedProduct.stock) : "",
        description: updatedProduct.description || "",
        image: updatedProduct.image || "",
      });
      setOriginalProductName(updatedProduct.name || "this product");
      setTimeout(() => {
        router.push("/products");
      }, 1000);
    } catch (err) {
      console.error("Failed to update product:", err);
      setError(err.message || "An unexpected error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = { width: "100%", padding: "12px 16px", background: "rgba(255, 255, 255, 0.1)", border: "1px solid rgba(255, 255, 255, 0.2)", color: "white", borderRadius: "12px", fontSize: "16px", outline: "none", transition: "all 0.3s", boxSizing: "border-box" };
  const labelStyle = { display: "block", color: "rgba(255, 255, 255, 0.8)", marginBottom: "8px", fontSize: "14px", fontWeight: "500" };
  const formGroupStyle = { marginBottom: "24px" };
  const buttonStyle = { background: "linear-gradient(45deg, #475569, #64748b)", border: "1px solid rgba(255, 255, 255, 0.2)", color: "white", borderRadius: "12px", padding: "12px 24px", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "16px", fontWeight: "500" };

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 200px)', color: 'white', flexDirection: 'column' }}>
          <div style={{ width: "48px", height: "48px", border: "4px solid rgba(255,255,255,0.2)", borderTopColor: "white", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <p style={{ marginTop: '20px', fontSize: '20px' }}>Loading product details...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "0 16px" }}>
        <button
          onClick={() => router.back()}
          style={{ ...buttonStyle, background: "transparent", border: "1px solid rgba(255, 255, 255, 0.3)", marginBottom: "24px", padding: "10px 16px" }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
        >
          <ArrowLeft size={18} /> Back
        </button>

        <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "white", marginBottom: "8px", textAlign: "center", marginTop: "-74px" }}>
          Edit Product
        </h1>
        <p style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "18px", marginBottom: "32px", textAlign: "center" }}>
          Update details for <span style={{ fontWeight: "bold", color: "white" }}>{originalProductName}</span>.
        </p>

        {error && (
          <div style={{ background: "rgba(239, 68, 68, 0.2)", border: "1px solid #ef4444", color: "#ef4444", padding: "12px", borderRadius: "12px", marginBottom: "24px", textAlign: "center" }}>{error}</div>
        )}
        {successMessage && (
          <div style={{ background: "rgba(34, 197, 94, 0.2)", border: "1px solid #22c55e", color: "#22c55e", padding: "12px", borderRadius: "12px", marginBottom: "24px", textAlign: "center" }}>{successMessage}</div>
        )}

        {(!productData.name && !loading && !error) && (
             <div style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "20px", borderRadius: "12px", marginBottom: "24px", textAlign: "center" }}>
                Product details could not be loaded. It might not exist or there was an issue fetching it.
             </div>
        )}

        {(productData.name || loading) && !error && (
          <form
            onSubmit={handleSubmit}
            style={{ background: "rgba(255, 255, 255, 0.05)", backdropFilter: "blur(10px)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "16px", padding: "32px", animation: "fadeIn 0.5s ease-out" }}
          >
            <div style={formGroupStyle}>
              <label htmlFor="name" style={labelStyle}>Product Name</label>
              <input type="text" id="name" name="name" style={inputStyle} value={productData.name} onChange={handleChange} placeholder="e.g. Wireless Mouse" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px" }}>
              <div style={formGroupStyle}>
                <label htmlFor="sku" style={labelStyle}>SKU</label>
                <input type="text" id="sku" name="sku" style={inputStyle} value={productData.sku} onChange={handleChange} placeholder="e.g. WM-LOGI-001" />
              </div>
              <div style={formGroupStyle}>
                <label htmlFor="category" style={labelStyle}>Category</label>
                <select id="category" name="category" style={inputStyle} value={productData.category} onChange={handleChange}>
                  {PREDEFINED_PRODUCT_CATEGORIES.map((cat) => ( <option key={cat} value={cat} style={{ background: "#1e293b" }}>{cat}</option> ))}
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px" }}>
              <div style={formGroupStyle}>
                <label htmlFor="price" style={labelStyle}>Price ($)</label>
                <input type="number" id="price" name="price" style={inputStyle} value={productData.price} onChange={handleChange} min="0" step="0.01" placeholder="e.g. 29.99" />
              </div>
              <div style={formGroupStyle}>
                <label htmlFor="stock" style={labelStyle}>Stock Quantity</label>
                <input type="number" id="stock" name="stock" style={inputStyle} value={productData.stock} onChange={handleChange} min="0" step="1" placeholder="e.g. 150" />
              </div>
            </div>

            <div style={formGroupStyle}>
              <label htmlFor="description" style={labelStyle}>Description (Optional)</label>
              <textarea id="description" name="description" style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }} value={productData.description} onChange={handleChange} placeholder="Detailed information..." />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "16px", marginTop: "32px" }}>
              <button type="button" onClick={() => router.push("/products")} style={{ ...buttonStyle, background: "transparent", border: "1px solid rgba(255, 255, 255, 0.3)" }} onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"} disabled={saving}>Cancel</button>
              <button type="submit" style={{ ...buttonStyle, background: saving ? "linear-gradient(45deg, #374151, #4b5563)" : "linear-gradient(45deg, #10b981, #059669)", opacity: saving ? 0.7 : 1 }} onMouseEnter={(e) => !saving && (e.currentTarget.style.background = "linear-gradient(45deg, #059669, #047857)")} onMouseLeave={(e) => !saving && (e.currentTarget.style.background = "linear-gradient(45deg, #10b981, #059669)")} disabled={saving}>
                {saving ? (<><div style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.5)", borderTopColor: "white", borderRadius: "50%", animation: "spin 1s linear infinite" }} /> Saving...</>) : (<><Save size={18} /> Save Changes</>)}
              </button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
}