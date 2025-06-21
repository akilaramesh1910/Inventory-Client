"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, QrCode, Printer, BarChart3, Filter } from "lucide-react"
import { useRouter } from "next/navigation"
import Layout from "../components/Layout"

interface Product {
  _id: string
  name: string
  sku: string
  category: string
}

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

export default function BarcodesPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [selectedProductsForPrint, setSelectedProductsForPrint] = useState<string[]>([])
  const router = useRouter()
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts()
  }, [])

  const API_BASE = process.env.REACT_APP_API_BASE || 'https://inventory-server-4-nrpb.onrender.com'

  const fetchProducts = async () => {
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
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.status === 401 || res.status === 403) {
        setError("Unauthorized. Please log in again.");
        localStorage.removeItem("accessToken");
        router.push("/login");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const errorText = await res.text().catch(() => `HTTP error ${res.status}`);
        console.error(`Failed to fetch products: ${res.status} ${res.statusText}`, errorText);
        setError(`Failed to fetch products: ${res.statusText || errorText}`);
        setProducts([]); 
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        const errorMessage = "Fetched product data is not an array.";
        console.error(errorMessage, data);
        setError(errorMessage);
        setProducts([]);
      }
    } catch (err: any) {
      console.error("Error fetching products:", err);
      setError(err.message || "An unexpected error occurred while fetching products.");
      setProducts([]); 
    } finally {
      setLoading(false);
    }
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProductsForPrint((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    )
  }
  const safeProducts = products;

  const filteredProducts = safeProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "" || categoryFilter === "all" || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const categories = PREDEFINED_PRODUCT_CATEGORIES; 

  const printBarcodes = async () => {
    if (selectedProductsForPrint.length === 0) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      const msg = "Authorization token not found. Please log in before printing.";
      setError(msg);
      alert(msg); 
      router.push("/login");
      return;
    }

    const productsToPrint = safeProducts.filter(p => selectedProductsForPrint.includes(p._id));
    if (productsToPrint.length === 0) return;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const printDocument = iframe.contentWindow?.document;
    if (!printDocument) {
      alert("Could not create a print frame.");
      document.body.removeChild(iframe);
      return;
    }

    printDocument.write('<html><head><title>Print Barcodes</title>');
    printDocument.write('<style>');
    printDocument.write(`
      @media print {
        body { margin: 20px; font-family: sans-serif; }
        .barcode-item { 
          display: inline-block; 
          text-align: center; 
          margin: 10px; 
          padding: 10px; 
          border: 1px solid #ccc; 
          page-break-inside: avoid; 
          width: calc(33.33% - 22px);
          box-sizing: border-box;
        }
        .barcode-item img { display: block; margin: 0 auto 5px auto; height: 50px; width: auto; max-width: 100%; }
        .barcode-item .sku { font-family: monospace; font-size: 12px; }
        h1 { text-align: center; }
      }
    `);
    printDocument.write('</style></head><body>');
    printDocument.write('<h1>Selected Barcodes</h1>');

    const barcodePromises = productsToPrint.map(async (product) => {
      const res = await fetch(`${API_BASE}/barcodes/generate`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ text: product.sku })
      });
      if (res.status === 401 || res.status === 403) {
         console.error(`Auth error generating barcode for ${product.sku}`);
         return { html: `<div class="barcode-item">Auth error for ${product.sku}</div>`, objectUrl: null };
      }
      if (res.ok) {
        const blob = await res.blob();
        const imageUrl = URL.createObjectURL(blob);
        return { html: `<div class="barcode-item"><img src="${imageUrl}" alt="Barcode for ${product.sku}" /><div class="sku">${product.sku}</div></div>`, objectUrl: imageUrl };
      }
      return { html: `<div class="barcode-item">Error loading barcode for ${product.sku}</div>`, objectUrl: null };
    });

    Promise.all(barcodePromises)
      .then(barcodeData => {
        printDocument.write(barcodeData.map(d => d.html).join(''));
        printDocument.write('</body></html>');
        printDocument.close();

        const images = printDocument.getElementsByTagName('img');
        let loadedImages = 0;
        const totalImages = images.length;

        const attemptPrint = () => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();

          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
            barcodeData.forEach(data => {
              if (data.objectUrl) {
                URL.revokeObjectURL(data.objectUrl);
              }
            });
          }, 1000); 
        };

        if (totalImages === 0) {
          attemptPrint(); 
          return;
        }

        Array.from(images).forEach(img => {
          img.onload = () => {
            loadedImages++;
            if (loadedImages === totalImages) {
              attemptPrint();
            }
          };
          img.onerror = () => { 
            loadedImages++;
            console.error("Error loading an image for printing:", img.src);
            if (loadedImages === totalImages) {
              attemptPrint(); 
            }
          };
          if (img.complete && img.naturalHeight !== 0) {
            const event = new Event('load');
            img.dispatchEvent(event);
          }
        });
      })
      .catch(error => {
        console.error("Error preparing barcodes for printing:", error);
        alert("An error occurred while preparing barcodes for printing.");
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      });
  };

  const BarcodePreview = ({ sku }: { sku: string }) => {
    const [image, setImage] = useState<string | null>(null)
    const [previewError, setPreviewError] = useState<string | null>(null);

    useEffect(() => {
      const fetchBarcode = async () => {
        setPreviewError(null);
        const token = localStorage.getItem("accessToken");
        if (!token) { 
          setPreviewError("Login required for preview.");
          return;
        }

        try {
          const res = await fetch(`${API_BASE}/barcodes/generate`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ text: sku })
          })
          if (res.status === 401 || res.status === 403) {
            setPreviewError("Unauthorized for preview.");
            throw new Error("Unauthorized to generate barcode preview.");
          }
          if (!res.ok) throw new Error("Failed to load barcode preview.");
          const blob = await res.blob()
          setImage(URL.createObjectURL(blob))
        } catch (err: any) {
          console.error("Error loading barcode", err)
          if (!previewError) setPreviewError(err.message || "Preview failed.");
        }
      }
      fetchBarcode()
    }, [sku])

    return image ? (
      <div style={{
        background: "white",
        padding: "12px",
        border: "1px solid rgba(0,0,0,0.1)",
        borderRadius: "8px",
        textAlign: "center",
      }}>
        <img src={image} alt={`Barcode for ${sku}`} style={{ width: "auto", height: "40px", margin: "0 auto 8px auto", display: "block" }} />
        <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#333" }}>{sku}</div>
      </div>
    ) : (
      <div style={{
        padding: "20px",
        border: `2px dashed ${previewError ? "rgba(239, 68, 68, 0.5)" : "rgba(255,255,255,0.2)"}`,
        borderRadius: "8px",
        textAlign: "center",
        minHeight: "80px", 
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <QrCode style={{ width: "24px", height: "24px", margin: "0 auto 8px auto", color: previewError ? "rgba(239, 68, 68, 0.8)" : "rgba(255,255,255,0.4)" }} />
        <p style={{ fontSize: "12px", color: previewError ? "rgba(239, 68, 68, 0.8)" : "rgba(255,255,255,0.5)" }}>{previewError || "Generating..."}</p>
      </div>
    )
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
                top: "70px",
                left: "70px",
                width: "340px",
                height: "340px",
                background: "linear-gradient(45deg, rgba(255, 255, 255, 0.05), rgba(156, 163, 175, 0.1))",
                borderRadius: "50%",
                filter: "blur(50px)",
                animation: "float 11s ease-in-out infinite",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "60px",
                right: "60px",
                width: "290px",
                height: "290px",
                background: "linear-gradient(45deg, rgba(148, 163, 184, 0.1), rgba(107, 114, 128, 0.1))",
                borderRadius: "50%",
                filter: "blur(50px)",
                animation: "float 11s ease-in-out infinite",
                animationDelay: "3.5s",
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
                <h1 style={{ fontSize: "36px", fontWeight: "bold", color: "white", marginBottom: "4px" }}>Barcode Management</h1>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "18px" }}>Generate and manage product barcodes</p>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={printBarcodes}
                  disabled={selectedProductsForPrint.length === 0}
                  style={{
                    background: selectedProductsForPrint.length > 0 ? "linear-gradient(45deg, #3b82f6, #6366f1)" : "rgba(255,255,255,0.1)",
                    border: `1px solid rgba(255, 255, 255, ${selectedProductsForPrint.length > 0 ? '0.2' : '0.1'})`,
                    color: selectedProductsForPrint.length > 0 ? "white" : "rgba(255,255,255,0.5)",
                    borderRadius: "12px",
                    padding: "10px 20px",
                    cursor: selectedProductsForPrint.length > 0 ? "pointer" : "not-allowed",
                    transition: "all 0.3s",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    boxShadow: selectedProductsForPrint.length > 0 ? "0 6px 15px rgba(0,0,0,0.25)" : "none"
                  }}
                  onMouseEnter={(e) => selectedProductsForPrint.length > 0 && (e.currentTarget.style.background = "linear-gradient(45deg, #2563eb, #4f46e5)")}
                  onMouseLeave={(e) => selectedProductsForPrint.length > 0 && (e.currentTarget.style.background = "linear-gradient(45deg, #3b82f6, #6366f1)")}
                >
                  <Printer style={{ width: "16px", height: "16px" }} /> Print Selected ({selectedProductsForPrint.length})
                </button>
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
                padding: "20px",
                marginBottom: "32px",
                maxWidth: "300px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                <div style={{ padding: "10px", borderRadius: "12px", marginRight: "12px", background: "linear-gradient(45deg, #3b82f6, #6366f1)" }}>
                  <BarChart3 style={{ width: "20px", height: "20px", color: "white" }} />
                </div>
                <h3 style={{ fontSize: "14px", fontWeight: "500", color: "rgba(255,255,255,0.8)" }}>Total Products</h3>
              </div>
              <p style={{ fontSize: "28px", fontWeight: "bold", color: "white" }}>{safeProducts.length}</p>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginTop: "4px" }}>In inventory</p>
            </motion.div>

            {error && (
              <div style={{ background: "rgba(239, 68, 68, 0.2)", border: "1px solid #ef4444", color: "#ef4444", padding: "12px", borderRadius: "12px", marginBottom: "24px", textAlign: "center" }}>{error}</div>
            )}

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
                  placeholder="Search by name or SKU..."
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
                <Filter style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "18px", height: "18px", color: "rgba(255,255,255,0.6)" }} />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
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
                  <option value="all" style={{ background: "#1e293b" }}>All Categories</option>
                  {categories.map((category) => <option key={category} value={category} style={{ background: "#1e293b" }}>{category}</option>)}
                </select>
                <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "rgba(255,255,255,0.6)" }}>▼</div>
              </div>
            </motion.div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "20px",
              }}
            >
              <AnimatePresence>
                {!loading && filteredProducts.map((product, index) => (
                  
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 + 0.3 }}
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      backdropFilter: "blur(15px)",
                      border: `1px solid ${selectedProductsForPrint.includes(product._id) ? "rgba(59, 130, 246, 0.7)" : "rgba(255, 255, 255, 0.1)"}`,
                      borderRadius: "16px",
                      padding: "20px",
                      transition: "all 0.3s ease",
                      boxShadow: selectedProductsForPrint.includes(product._id) ? "0 0 15px rgba(59, 130, 246, 0.3)" : "none",
                    }}
                    onMouseEnter={(e) => !selectedProductsForPrint.includes(product._id) && (e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)")}
                    onMouseLeave={(e) => !selectedProductsForPrint.includes(product._id) && (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <div>
                        <h3 style={{ fontSize: "18px", fontWeight: "600", color: "white" }}>{product.name}</h3>
                        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginTop: "2px" }}>{product.sku}</p>
                      </div>
                      <span style={{
                        fontSize: "10px",
                        color: "rgba(255,255,255,0.7)",
                        background: "rgba(255,255,255,0.1)",
                        padding: "3px 8px",
                        borderRadius: "12px",
                        border: "1px solid rgba(255,255,255,0.15)"
                      }}>
                        {product.category}
                      </span>
                    </div>
                    <div style={{ marginBottom: "16px" }}>
                      <BarcodePreview sku={product.sku} />
                    </div>
                    <button
                      onClick={() => toggleProductSelection(product._id)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        background: selectedProductsForPrint.includes(product._id) ? "rgba(59, 130, 246, 0.3)" : "rgba(255,255,255,0.1)",
                        border: `1px solid ${selectedProductsForPrint.includes(product._id) ? "rgba(59, 130, 246, 0.7)" : "rgba(255,255,255,0.2)"}`,
                        color: "white",
                        borderRadius: "10px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        fontSize: "14px",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = selectedProductsForPrint.includes(product._id) ? "rgba(59, 130, 246, 0.4)" : "rgba(255,255,255,0.15)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = selectedProductsForPrint.includes(product._id) ? "rgba(59, 130, 246, 0.3)" : "rgba(255,255,255,0.1)"}
                    >
                      {selectedProductsForPrint.includes(product._id) ? "Selected for Print" : "Select for Print"}
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {!loading && filteredProducts.length === 0 && (
                <div style={{ textAlign: "center", padding: "48px", color: "rgba(255,255,255,0.6)"}}>
                  <Search style={{width: "48px", height: "48px", margin: "0 auto 16px auto", opacity: 0.5}}/>
                  No products found.
                </div>
            )}
             {loading && (
               <div style={{ textAlign: "center", padding: "48px", color: "rgba(255,255,255,0.6)"}}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    style={{ width: "32px", height: "32px", border: "3px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", margin: "0 auto 16px auto" }}
                  />
                  Loading products...</div>
            )}
          </div>
        </div>
      </>
    </Layout>
  )
}
