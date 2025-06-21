"use client";

import { useEffect, useState } from "react";
import { QrCode } from "lucide-react";

export default function BarcodePreview({ sku, apiBaseUrl }) {
  const [image, setImage] = useState(null);
  const [previewError, setPreviewError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchBarcode = async () => {
      if (!sku || !apiBaseUrl) {
        setPreviewError("SKU or API URL missing.");
        return;
      }
      setPreviewError(null);
      setImage(null);
      const token = localStorage.getItem("accessToken");
      if (!token) {
        if (isMounted) setPreviewError("Login required.");
        return;
      }

      try {
        const res = await fetch(`${apiBaseUrl}/barcodes/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: sku }),
        });
        if (!isMounted) return;
        if (res.status === 401 || res.status === 403) {
          setPreviewError("Unauthorized.");
          throw new Error("Unauthorized to generate barcode preview.");
        }
        if (!res.ok) throw new Error("Failed to load barcode preview.");
        const blob = await res.blob();
        if (isMounted) {
          const objectURL = URL.createObjectURL(blob);
          setImage(objectURL);
        }
      } catch (err) {
        console.error("Error loading barcode for SKU:", sku, err);
        if (isMounted && !previewError) setPreviewError(err.message || "Preview failed.");
      }
    };

    fetchBarcode();

    return () => {
      isMounted = false;
      if (image) {
        URL.revokeObjectURL(image);
      }
    };
  }, [sku, apiBaseUrl]);

  if (previewError) {
    return (
      <div style={{ padding: "10px", border: "1px dashed rgba(239, 68, 68, 0.5)", borderRadius: "4px", textAlign: "center", minHeight: "50px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",  margin: "0 auto" }}>
        <QrCode style={{ width: "18px", height: "18px", margin: "0 auto 4px auto", color: "rgba(239, 68, 68, 0.8)" }} />
        <p style={{ fontSize: "10px", color: "rgba(239, 68, 68, 0.8)" }}>{previewError}</p>
      </div>
    );
  }

  if (image) {
    return (
      <div style={{ background: "white", padding: "8px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "4px", textAlign: "center",  margin: "0 auto" }}>
        <img src={image} alt={`Barcode for ${sku}`} style={{ width: "auto", height: "30px", margin: "0 auto 4px auto", display: "block" }} />
        <div style={{ fontFamily: "monospace", fontSize: "9px", color: "#333" }}>{sku}</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "10px", border: "1px dashed rgba(255,255,255,0.2)", borderRadius: "4px", textAlign: "center", minHeight: "50px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
      <QrCode style={{ width: "18px", height: "18px", margin: "0 auto 4px auto", color: "rgba(255,255,255,0.4)" }} />
      <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>Generating...</p>
    </div>
  );
}