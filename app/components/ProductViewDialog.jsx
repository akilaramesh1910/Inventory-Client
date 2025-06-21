"use client"

import { X, Edit } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProductViewDialog({ product, isOpen, onClose }) {
  const router = useRouter();

  if (!isOpen || !product) {
    return null;
  }

  const fieldStyle = { width: "100%", padding: "10px 14px", background: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(255, 255, 255, 0.15)", color: "rgba(255, 255, 255, 0.9)", borderRadius: "10px", fontSize: "15px", boxSizing: "border-box", minHeight: "44px", display: "flex", alignItems: "center", wordBreak: "break-word" };
  const labelStyle = { display: "block", color: "rgba(255, 255, 255, 0.7)", marginBottom: "6px", fontSize: "13px", fontWeight: "500" };
  const formGroupStyle = { marginBottom: "20px" };
  const buttonStyle = { background: "linear-gradient(45deg, #475569, #64748b)", border: "1px solid rgba(255, 255, 255, 0.2)", color: "white", borderRadius: "12px", padding: "10px 20px", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "15px", fontWeight: "500" };

  const handleEdit = () => {
    onClose(); 
    router.push(`/products/edit/${product._id}`);
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000, 
      backdropFilter: "blur(5px)",
      animation: "fadeIn 0.3s ease-out"
    }}
    onClick={onClose} 
    >
      <div
        style={{
          background: "rgba(30, 41, 59, 0.9)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: "16px",
          padding: "28px",
          width: "90%",
          maxWidth: "650px",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
          animation: "slideInUpModal 0.4s ease-out"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "rgba(255,255,255,0.1)",
            border: "none",
            borderRadius: "50%",
            color: "white",
            cursor: "pointer",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
        >
          <X size={20} />
        </button>

        <h2 style={{ fontSize: "26px", fontWeight: "bold", color: "white", marginBottom: "24px", textAlign: "center" }}>
          Product Details
        </h2>


        <div style={formGroupStyle}>
          <label style={labelStyle}>Name</label>
          <div style={fieldStyle}>{product.name || "N/A"}</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div style={formGroupStyle}>
            <label style={labelStyle}>SKU</label>
            <div style={fieldStyle}>{product.sku || "N/A"}</div>
          </div>
          <div style={formGroupStyle}>
            <label style={labelStyle}>Category</label>
            <div style={fieldStyle}>{product.category || "N/A"}</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div style={formGroupStyle}>
            <label style={labelStyle}>Price</label>
            <div style={fieldStyle}>{product.price !== undefined ? `$${parseFloat(product.price).toFixed(2)}` : "N/A"}</div>
          </div>
          <div style={formGroupStyle}>
            <label style={labelStyle}>Stock</label>
            <div style={fieldStyle}>{product.stock !== undefined ? product.stock : "N/A"}</div>
          </div>
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Description</label>
          <div style={{...fieldStyle, minHeight: "80px", alignItems: "flex-start", whiteSpace: "pre-wrap" }}>
            {product.description || "No description provided."}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "28px" }}>
          <button type="button" onClick={onClose} style={{ ...buttonStyle, background: "rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.25)" }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
          >Close</button>
          <button type="button" onClick={handleEdit} style={{ ...buttonStyle, background: "linear-gradient(45deg, #3b82f6, #2563eb)" }}
            onMouseEnter={(e) => e.currentTarget.style.background = "linear-gradient(45deg, #2563eb, #1d4ed8)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "linear-gradient(45deg, #3b82f6, #2563eb)"}
          ><Edit size={16} /> Edit Product</button>
        </div>
      </div>
    </div>
  );
}