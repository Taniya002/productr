import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Login() {
  const navigate = useNavigate();
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const otpRefs = useRef([]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleEmailSubmit = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API}/auth/send-otp`, { email });
      if (res.data.data.otp) {
        alert(`Your OTP is: ${res.data.data.otp}`);
      }
      setStep("otp");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError(false);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      otpRefs.current[index - 1]?.focus();
  };

  const handleOtpSubmit = async () => {
    if (otp.join("").length < 6) { setOtpError(true); return; }
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API}/auth/verify-otp`, {
        email,
        otp: otp.join(""),
      });
      localStorage.setItem("token", res.data.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.data.user));
      navigate("/dashboard");
    } catch (err) {
      setOtpError(true);
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setOtp(["", "", "", "", "", ""]);
    setOtpError(false);
    setError("");
    try {
      const res = await axios.post(`${API}/auth/send-otp`, { email });
      if (res.data.data.otp) alert(`Your OTP is: ${res.data.data.otp}`);
      otpRefs.current[0]?.focus();
    } catch (err) {
      setError("Failed to resend OTP");
    }
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      minHeight: "100vh",
      fontFamily: "'Segoe UI', Arial, sans-serif",
      background: "#f8f9fb",
    }}>
      {/* LEFT PANEL — hidden on mobile */}
      {!isMobile && (
        <div style={{
          width: "50%", minHeight: "100vh",
          background: "#f8f9fb",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "24px", boxSizing: "border-box",
        }}>
          <img
            src="/image.png"
            alt="Productr"
            style={{
              width: "100%",
              height: "calc(100vh - 48px)",
              maxHeight: 700,
              objectFit: "cover",
              borderRadius: 28,
              boxShadow: "0 24px 64px rgba(0,0,0,0.15)",
            }}
          />
        </div>
      )}

      {/* RIGHT PANEL */}
      <div style={{
        width: isMobile ? "100%" : "50%",
        minHeight: "100vh",
        background: "#f8f9fb",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
      }}>
        {/* Mobile logo */}
        {isMobile && (
          <div style={{ padding: "24px 24px 0", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 18, color: "#1a1a2e" }}>Productr</span>
            <span style={{ fontSize: 18 }}></span>
          </div>
        )}

        <div style={{
          paddingTop: isMobile ? "8vw" : "12vh",
          paddingLeft: isMobile ? 24 : 60,
          paddingRight: isMobile ? 24 : 60,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
        }}>
          <div style={{ width: "100%", maxWidth: 380, margin: isMobile ? "0 auto" : "0" }}>
            <h2 style={{
              fontSize: isMobile ? 20 : 22,
              fontWeight: 700, color: "#1a1a2e",
              margin: "0 0 28px 0", textAlign: "center",
            }}>
              Login to your Productr Account
            </h2>

            {error && (
              <p style={{ color: "#ef4444", fontSize: 13, textAlign: "center", marginBottom: 12 }}>{error}</p>
            )}

            {step === "email" && (
              <>
                <label style={{ fontSize: 13, color: "#555", fontWeight: 500, display: "block", marginBottom: 6 }}>
                  Email or Phone number
                </label>
                <input type="text" placeholder="Acme@gmail.com" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
                  style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #d1d5db",
                    borderRadius: 6, fontSize: 14, color: "#222", outline: "none",
                    background: "#fff", boxSizing: "border-box", marginBottom: 14 }} />
                <button onClick={handleEmailSubmit} disabled={loading}
                  style={{ width: "100%", padding: "11px", background: loading ? "#6b80b8" : "#1e3a8a",
                    color: "#fff", border: "none", borderRadius: 6,
                    fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
                  {loading ? "Sending OTP..." : "Login"}
                </button>
              </>
            )}

            {step === "otp" && (
              <>
                <label style={{ fontSize: 13, color: "#555", fontWeight: 500, display: "block", marginBottom: 10 }}>
                  Enter OTP
                </label>
                <div style={{ display: "flex", gap: isMobile ? 6 : 10, marginBottom: 6 }}>
                  {otp.map((digit, i) => (
                    <input key={i} ref={(el) => (otpRefs.current[i] = el)}
                      type="text" maxLength={1} value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      style={{
                        width: isMobile ? 40 : 44,
                        height: isMobile ? 40 : 44,
                        textAlign: "center",
                        border: otpError ? "1.5px solid #ef4444" : "1.5px solid #d1d5db",
                        borderRadius: 6, fontSize: 16, fontWeight: 600,
                        color: "#1a1a2e", outline: "none", background: "#fff",
                        flex: 1,
                      }} />
                  ))}
                </div>
                {otpError && (
                  <p style={{ color: "#ef4444", fontSize: 12, margin: "2px 0 10px", fontWeight: 500 }}>
                    Please enter a valid OTP
                  </p>
                )}
                <button onClick={handleOtpSubmit} disabled={loading}
                  style={{ width: "100%", padding: "11px",
                    background: loading ? "#6b80b8" : "#1e3a8a", color: "#fff",
                    border: "none", borderRadius: 6, fontSize: 14, fontWeight: 600,
                    cursor: loading ? "not-allowed" : "pointer", marginTop: otpError ? 2 : 14 }}>
                  {loading ? "Verifying..." : "Enter your OTP"}
                </button>
                <p style={{ textAlign: "center", fontSize: 13, color: "#888", marginTop: 14 }}>
                  Didnt recive OTP?{" "}
                  <span onClick={handleResend} style={{ color: "#1e3a8a", fontWeight: 700, cursor: "pointer" }}>
                    Resend
                  </span>
                </p>
              </>
            )}
          </div>
        </div>

        {step === "email" && (
          <div style={{ padding: isMobile ? "0 24px 32px" : "0 60px 40px" }}>
            <div style={{ border: "1.5px solid #e5e7eb", borderRadius: 8,
              padding: "14px 20px", textAlign: "center", background: "#fff",
              maxWidth: 380, margin: "0 auto" }}>
              <p style={{ margin: "0 0 4px", fontSize: 13, color: "#888" }}>
                Don't have a Productr Account
              </p>
              <span style={{ fontSize: 13, color: "#1e3a8a", fontWeight: 700, cursor: "pointer" }}>
                SignUp Here
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}