"use client";

import { useEffect, useState } from "react";
import { QrCode } from "lucide-react";
import { useSnackbar } from "../../context/SnackbarContext";

export default function BarcodePreview({ sku, apiBaseUrl }) {
  const [image, setImage] = useState(null);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    let isMounted = true;
    const fetchBarcode = async () => {
      if (!sku || !apiBaseUrl) {
        showSnackbar("SKU or API URL missing for preview.", "warning");
        return;
      }
      setImage(null);
      const token = localStorage.getItem("accessToken");
      if (!token) {
        if (isMounted) showSnackbar("Login required for preview.", "warning");
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
          showSnackbar("Unauthorized to generate preview.", "error");
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
        if (isMounted) showSnackbar(err.message || "Preview failed.", "error");
      }
    };

    fetchBarcode();

    return () => {
      isMounted = false;
      if (image) {
        URL.revokeObjectURL(image);
      }
    };
  }, [sku, apiBaseUrl, showSnackbar]);

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