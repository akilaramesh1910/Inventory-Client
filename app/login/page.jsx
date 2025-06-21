"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, Mail, Package, Shield, Sparkles, Zap } from "lucide-react"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const router = useRouter()

  const API_BASE =  process.env.REACT_APP_API_BASE || "http://localhost:8000/api"

  console.log("API_BASE", API_BASE)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (data.token) {
        localStorage.setItem("accessToken", data.token); 
      }
      router.push("/")
    } catch (error) {
      console.error(error)
    }
    setIsLoading(false)
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        padding: "16px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            top: "80px",
            left: "80px",
            width: "384px",
            height: "384px",
            background: "linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(156, 163, 175, 0.2))",
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
            background: "linear-gradient(45deg, rgba(148, 163, 184, 0.2), rgba(107, 114, 128, 0.2))",
            borderRadius: "50%",
            filter: "blur(60px)",
            animation: "float 8s ease-in-out infinite",
            animationDelay: "2s",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "33.333333%",
            width: "256px",
            height: "256px",
            background: "linear-gradient(45deg, rgba(156, 163, 175, 0.2), rgba(148, 163, 184, 0.2))",
            borderRadius: "50%",
            filter: "blur(60px)",
            animation: "float 8s ease-in-out infinite",
            animationDelay: "4s",
          }}
        />
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: "8px",
              height: "8px",
              background: "rgba(255, 255, 255, 0.2)",
              borderRadius: "50%",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `particle ${3 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>
      <div
        style={{
          width: "100%",
          maxWidth: "448px",
          position: "relative",
          zIndex: 10,
          animation: "slideInUp 0.8s ease-out",
        }}
      >
        <div
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(40px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5)",
            borderRadius: "24px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              textAlign: "center",
              paddingBottom: "32px",
              position: "relative",
              padding: "32px 32px 0",
            }}
          >
            <div
              style={{
                margin: "0 auto 24px",
                position: "relative",
                animation: "scaleIn 0.6s ease-out 0.2s both",
              }}
            >
              <div
                style={{
                  padding: "16px",
                  background: "linear-gradient(45deg, #475569, #64748b)",
                  borderRadius: "24px",
                  boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  display: "inline-block",
                }}
              >
                <Package style={{ width: "48px", height: "48px", color: "white" }} />
              </div>
              <div
                style={{
                  position: "absolute",
                  top: "-8px",
                  right: "-8px",
                  width: "24px",
                  height: "24px",
                  background: "linear-gradient(45deg, #10b981, #059669)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation: "spin 3s linear infinite",
                }}
              >
                <Sparkles style={{ width: "12px", height: "12px", color: "white" }} />
              </div>
            </div>

            <div style={{ animation: "fadeIn 0.6s ease-out 0.4s both" }}>
              <h1
                style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  background: "linear-gradient(45deg, #ffffff, #e5e7eb, #d1d5db)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  marginBottom: "8px",
                }}
              >
                Inventory
              </h1>
              <p style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "18px" }}>
                Welcome back to professional inventory management
              </p>
            </div>
            <div
              style={{
                position: "absolute",
                top: "16px",
                left: "16px",
                padding: "8px",
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                animation: "float 4s ease-in-out infinite",
              }}
            >
              <Shield style={{ width: "16px", height: "16px", color: "#10b981" }} />
            </div>
            <div
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                padding: "8px",
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                animation: "float 4s ease-in-out infinite reverse",
                animationDelay: "2s",
              }}
            >
              <Zap style={{ width: "16px", height: "16px", color: "#f59e0b" }} />
            </div>
          </div>

          <div style={{ padding: "0 32px 32px" }}>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ animation: "slideInLeft 0.6s ease-out 0.5s both" }}>
                <label
                  htmlFor="email"
                  style={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontWeight: "500",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  Email Address
                </label>
                <div style={{ position: "relative" }}>
                  <Mail
                    style={{
                      position: "absolute",
                      left: "16px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "20px",
                      height: "20px",
                      color: "black",
                      transition: "color 0.3s",
                    }}
                  />
                  <input
                    id="email"
                    type="email"
                    placeholder="admin@inventory.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    style={{
                      paddingLeft: "48px",
                      paddingRight: "16px",
                      paddingTop: "16px",
                      paddingBottom: "16px",
                      background: "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      color: "white",
                      borderRadius: "16px",
                      fontSize: "14px",
                      transition: "all 0.3s",
                      width: "100%",
                      height: "56px",
                      outline: "none",
                    }}
                    required
                  />
                </div>
              </div>

              <div style={{ animation: "slideInLeft 0.6s ease-out 0.6s both" }}>
                <label
                  htmlFor="password"
                  style={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontWeight: "500",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <Lock
                    style={{
                      position: "absolute",
                      left: "16px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "20px",
                      height: "20px",
                      color: "black",
                      transition: "color 0.3s",
                    }}
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    style={{
                      paddingLeft: "48px",
                      paddingRight: "56px",
                      paddingTop: "16px",
                      paddingBottom: "16px",
                      background: "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      color: "white",
                      borderRadius: "16px",
                      fontSize: "14px",
                      transition: "all 0.3s",
                      width: "100%",
                      height: "56px",
                      outline: "none",
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "16px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "transparent",
                      border: "none",
                      color: "rgba(255, 255, 255, 0.6)",
                      cursor: "pointer",
                      transition: "color 0.3s",
                    }}
                  >
                    {showPassword ? (
                      <EyeOff style={{ width: "20px", height: "20px", color: "black" }} />
                    ) : (
                      <Eye style={{ width: "20px", height: "20px", color: "black" }} />
                    )}
                  </button>
                </div>
              </div>

              <div style={{ animation: "slideInUp 0.6s ease-out 0.7s both" }}>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: "100%",
                    background: "linear-gradient(45deg, #475569, #64748b)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "white",
                    fontWeight: "600",
                    padding: "16px",
                    borderRadius: "16px",
                    height: "56px",
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  {isLoading ? (
                    <>
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          border: "2px solid white",
                          borderTop: "2px solid transparent",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite",
                        }}
                      />
                      Signing In...
                    </>
                  ) : (
                    "Sign In to Dashboard"
                  )}
                </button>
              </div>
            </form>

            <div
              style={{
                textAlign: "center",
                marginTop: "24px",
                animation: "fadeIn 0.6s ease-out 0.8s both",
              }}
            >
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "16px",
                  padding: "16px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <p style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "14px", marginBottom: "8px" }}>
                  Demo Credentials
                </p>
                <div style={{ fontSize: "12px" }}>
                  <p style={{ color: "rgba(255, 255, 255, 0.6)", marginBottom: "4px" }}>
                    Email: admin@inventory.com
                  </p>
                  <p style={{ color: "rgba(255, 255, 255, 0.6)" }}>Password: admin123</p>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "16px",
                paddingTop: "16px",
                animation: "slideInUp 0.6s ease-out 0.9s both",
              }}
            >
              {[
                { icon: Shield, label: "Secure" },
                { icon: Zap, label: "Fast" },
                { icon: Sparkles, label: "Modern" },
              ].map((feature, index) => (
                <div key={feature.label} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      padding: "12px",
                      background: "rgba(255, 255, 255, 0.1)",
                      borderRadius: "12px",
                      marginBottom: "8px",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      display: "inline-block",
                    }}
                  >
                    <feature.icon style={{ width: "16px", height: "16px", color: "rgba(255, 255, 255, 0.8)" }} />
                  </div>
                  <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "12px" }}>{feature.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: "32px",
            textAlign: "center",
            fontSize: "14px",
            color: "rgba(255, 255, 255, 0.5)",
            animation: "fadeIn 0.6s ease-out 1s both",
          }}
        >
          <p>© 2025 Inventory. Crafted with precision for modern businesses.</p>
        </div>
      </div>
    </div>
  )
}
