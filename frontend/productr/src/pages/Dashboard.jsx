import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
const PRODUCT_TYPES = ["Food", "Electronics", "Fashion", "Grocery", "Beauty", "Furniture"];
const labelStyle = { fontSize: 13, color: "#1a1a2e", fontWeight: 500, display: "block", marginBottom: 6 };
const inputStyle = { width: "100%", padding: "9px 12px", border: "1.5px solid #d1d5db", borderRadius: 6, fontSize: 13, color: "#333", outline: "none", background: "#fff", boxSizing: "border-box" };
const selectStyle = { width: "100%", padding: "9px 12px", border: "1.5px solid #d1d5db", borderRadius: 6, fontSize: 13, color: "#333", outline: "none", background: "#fff", boxSizing: "border-box", appearance: "none", cursor: "pointer" };
const chevronStyle = { position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: 14, color: "#666" };

function ProductModal({ onClose, onSuccess, editProduct }) {
  const [form, setForm] = useState({
    productName: editProduct?.productName || "",
    productType: editProduct?.productType || "",
    quantityStock: editProduct?.quantityStock || "",
    mrp: editProduct?.mrp || "",
    sellingPrice: editProduct?.sellingPrice || "",
    brandName: editProduct?.brandName || "",
    exchangeEligible: editProduct?.exchangeEligible ? "Yes" : "No",
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
    setImages((prev) => [...prev, ...previews].slice(0, 5));
  };

  const removeImage = (i) => setImages((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      formData.set("exchangeEligible", form.exchangeEligible === "Yes" ? "true" : "false");
      images.forEach((img) => formData.append("images", img.file));
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "multipart/form-data" };
      if (editProduct) {
        await axios.put(`${API}/products/${editProduct._id}`, formData, { headers });
      } else {
        await axios.post(`${API}/products`, formData, { headers });
      }
      onSuccess(editProduct ? null : "Product added Successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(100,110,140,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 12, width: 420, maxHeight: "90vh", overflowY: "auto", padding: "24px 28px 28px", boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e" }}>{editProduct ? "Edit Product" : "Add Product"}</span>
          <div onClick={onClose} style={{ cursor: "pointer", color: "#888", fontSize: 18 }}>✕</div>
        </div>
        {error && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>{error}</p>}

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Product Name</label>
          <input name="productName" value={form.productName} onChange={handleChange} placeholder="CakeZone Walnut Brownie" style={inputStyle} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Product Type</label>
          <div style={{ position: "relative" }}>
            <select name="productType" value={form.productType} onChange={handleChange} style={selectStyle}>
              <option value="">Select product type</option>
              {PRODUCT_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            <div style={chevronStyle}>▾</div>
          </div>
        </div>
        {[["quantityStock","Quantity Stock"],["mrp","MRP"],["sellingPrice","Selling Price"],["brandName","Brand Name"]].map(([name, label]) => (
          <div key={name} style={{ marginBottom: 14 }}>
            <label style={labelStyle}>{label}</label>
            <input name={name} value={form[name]} onChange={handleChange} placeholder="Enter value" style={inputStyle} />
          </div>
        ))}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <label style={labelStyle}>Upload Product Images</label>
            {images.length > 0 && (
              <span onClick={() => fileRef.current.click()} style={{ fontSize: 12, color: "#1e3a8a", fontWeight: 600, cursor: "pointer" }}>Add More Photos</span>
            )}
          </div>
          {images.length === 0 ? (
            <div onClick={() => fileRef.current.click()} style={{ border: "1.5px dashed #d1d5db", borderRadius: 6, padding: "18px", textAlign: "center", cursor: "pointer", background: "#fafafa" }}>
              <p style={{ margin: "0 0 4px", fontSize: 13, color: "#aaa" }}>Enter Description</p>
              <span style={{ fontSize: 13, color: "#1e3a8a", fontWeight: 600 }}>Browse</span>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {images.map((img, i) => (
                <div key={i} style={{ position: "relative" }}>
                  <img src={img.url} alt="" style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8, border: "1px solid #e5e7eb" }} />
                  <div onClick={() => removeImage(i)} style={{ position: "absolute", top: -6, right: -6, width: 16, height: 16, borderRadius: "50%", background: "#1e3a8a", color: "#fff", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>✕</div>
                </div>
              ))}
              {images.length < 5 && (
                <div onClick={() => fileRef.current.click()} style={{ width: 56, height: 56, borderRadius: 8, border: "1.5px dashed #d1d5db", background: "#fafafa", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 20, color: "#bbb" }}>+</div>
              )}
            </div>
          )}
          <input ref={fileRef} type="file" multiple accept="image/*" onChange={handleImages} style={{ display: "none" }} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Exchange or return eligibility</label>
          <div style={{ position: "relative" }}>
            <select name="exchangeEligible" value={form.exchangeEligible} onChange={handleChange} style={selectStyle}>
              <option>Yes</option>
              <option>No</option>
            </select>
            <div style={chevronStyle}>▾</div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={handleSubmit} disabled={loading} style={{ padding: "10px 28px", background: loading ? "#6b80b8" : "#1e3a8a", color: "#fff", border: "none", borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Saving..." : editProduct ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, onPublishToggle, onDelete, onEdit }) {
  const [imgIndex, setImgIndex] = useState(0);
  const imgs = product.images || [];

  return (
    <div style={{ border: "1.5px solid #e5e7eb", borderRadius: 10, background: "#fff", overflow: "hidden" }}>
      {/* Image */}
      <div style={{ position: "relative", height: 160, background: "#f5f5f5" }}>
        {imgs.length > 0 ? (
          <img src={imgs[imgIndex]?.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#ccc", fontSize: 13 }}>No Image</div>
        )}
        {imgs.length > 1 && (
          <div style={{ position: "absolute", bottom: 8, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 4 }}>
            {imgs.map((_, i) => (
              <div key={i} onClick={() => setImgIndex(i)} style={{ width: 6, height: 6, borderRadius: "50%", background: i === imgIndex ? "#e05020" : "#ccc", cursor: "pointer" }} />
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div style={{ padding: "14px 16px" }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e", margin: "0 0 10px" }}>{product.productName}</p>
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 12 }}>
          <tbody>
            {[
              ["Product type -", product.productType],
              ["Quantity Stock -", product.quantityStock],
              ["MRP-", `₹ ${product.mrp}`],
              ["Selling Price -", `₹ ${product.sellingPrice}`],
              ["Brand Name -", product.brandName],
              ["Total Number of Images -", product.images?.length || 0],
              ["Exchange Eligibility -", product.exchangeEligible ? "YES" : "NO"],
            ].map(([label, value]) => (
              <tr key={label}>
                <td style={{ fontSize: 12, color: "#888", padding: "2px 0", width: "55%" }}>{label}</td>
                <td style={{ fontSize: 12, color: "#1a1a2e", fontWeight: 500, textAlign: "right", padding: "2px 0" }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={() => onPublishToggle(product._id, product.isPublished)}
            style={{
              flex: 1, padding: "8px 0", fontSize: 13, fontWeight: 600,
              border: product.isPublished ? "none" : "none",
              borderRadius: 6, cursor: "pointer",
              background: product.isPublished ? "#22c55e" : "#1e3a8a",
              color: "#fff",
            }}>
            {product.isPublished ? "Unpublish" : "Publish"}
          </button>
          <button
            onClick={() => onEdit(product)}
            style={{ padding: "8px 16px", fontSize: 13, fontWeight: 600, border: "1.5px solid #d1d5db", borderRadius: 6, cursor: "pointer", background: "#fff", color: "#1a1a2e" }}>
            Edit
          </button>
          <button
            onClick={() => onDelete(product._id)}
            style={{ padding: "8px 10px", border: "1.5px solid #e5e7eb", borderRadius: 6, cursor: "pointer", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("published");
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === "published" ? "published" : "unpublished";
      const res = await axios.get(`${API}/products/${endpoint}`, getAuthHeader());
      setProducts(res.data.data.products);
    } catch (err) {
      if (err.response?.status === 401) { localStorage.clear(); navigate("/login"); }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [activeTab]);

  const handlePublishToggle = async (id, isPublished) => {
    try {
      const action = isPublished ? "unpublish" : "publish";
      await axios.patch(`${API}/products/${action}/${id}`, {}, getAuthHeader());
      showToast(isPublished ? "Product unpublished" : "Product published");
      fetchProducts();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`${API}/products/${id}`, getAuthHeader());
      showToast("Product deleted");
      fetchProducts();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (product) => { setEditProduct(product); setShowModal(true); };
  const handleLogout = () => { localStorage.clear(); navigate("/login"); };

  const filteredProducts = products.filter(p =>
    activeTab === "published" ? p.isPublished : !p.isPublished
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Segoe UI', Arial, sans-serif", background: "#fff" }}>

      {/* SIDEBAR — hidden on mobile, overlay when open */}
      {(!isMobile || sidebarOpen) && (
        <div style={{
          width: 170, minHeight: "100vh", background: "#1a1a2e",
          display: "flex", flexDirection: "column", flexShrink: 0,
          position: isMobile ? "fixed" : "relative",
          zIndex: isMobile ? 300 : "auto",
          top: 0, left: 0, bottom: 0,
        }}>
          <div style={{ padding: "18px 16px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>Productr</span>
              <span style={{ fontSize: 15 }}></span>
            </div>
            {isMobile && (
              <div onClick={() => setSidebarOpen(false)} style={{ color: "#fff", fontSize: 18, cursor: "pointer" }}>✕</div>
            )}
          </div>
          <div style={{ padding: "12px 12px 8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.08)", borderRadius: 6, padding: "7px 10px" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>Search</span>
            </div>
          </div>
          <div style={{ padding: "6px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 6, cursor: "pointer" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>Home</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 6, background: "rgba(255,255,255,0.1)", cursor: "pointer" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              <span style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>Products</span>
            </div>
          </div>
        </div>
      )}

      {/* Overlay for mobile sidebar */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200 }} />
      )}

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* HEADER */}
        <div style={{ height: 52, background: "linear-gradient(90deg, #ffd6e0 0%, #fff3b0 50%, #d4f0ff 100%)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {isMobile && (
              <div onClick={() => setSidebarOpen(true)} style={{ cursor: "pointer", display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ width: 18, height: 2, background: "#555", borderRadius: 2 }} />
                <div style={{ width: 18, height: 2, background: "#555", borderRadius: 2 }} />
                <div style={{ width: 18, height: 2, background: "#555", borderRadius: 2 }} />
              </div>
            )}
            <span style={{ fontSize: 13, color: "#555" }}>Products</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {!isMobile && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.6)", borderRadius: 6, padding: "5px 12px" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <span style={{ fontSize: 13, color: "#aaa" }}>Search Services, Products</span>
              </div>
            )}
            <div onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }} title="Logout">
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#c0c0d0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#888"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: "flex", borderBottom: "1.5px solid #e5e7eb", padding: "0 16px", background: "#fff", flexShrink: 0 }}>
          {["published", "unpublished"].map((tab) => (
            <div key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "14px 16px 12px", fontSize: 14,
              fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? "#1a1a2e" : "#888",
              borderBottom: activeTab === tab ? "2.5px solid #1e3a8a" : "2.5px solid transparent",
              cursor: "pointer", marginBottom: -1.5 }}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </div>
          ))}
        </div>

        {/* PAGE CONTENT */}
        <div style={{ flex: 1, padding: isMobile ? "16px" : "20px 24px", background: "#fff" }}>

          {/* Top Row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e" }}>Products</span>
            <button onClick={() => { setEditProduct(null); setShowModal(true); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#fff", border: "1.5px solid #d1d5db", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#1a1a2e" }}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add Products
            </button>
          </div>

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}>
              <p style={{ color: "#888", fontSize: 14 }}>Loading...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 80 }}>
              <svg width="52" height="52" viewBox="0 0 52 52" fill="none" style={{ marginBottom: 16 }}>
                <rect x="2" y="2" width="20" height="20" rx="3" stroke="#1e3a8a" strokeWidth="3"/>
                <rect x="30" y="2" width="20" height="20" rx="3" stroke="#1e3a8a" strokeWidth="3"/>
                <rect x="2" y="30" width="20" height="20" rx="3" stroke="#1e3a8a" strokeWidth="3"/>
                <line x1="40" y1="30" x2="40" y2="50" stroke="#1e3a8a" strokeWidth="3" strokeLinecap="round"/>
                <line x1="30" y1="40" x2="50" y2="40" stroke="#1e3a8a" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#1a1a2e", margin: "0 0 8px" }}>Feels a little empty over here...</p>
              <p style={{ fontSize: 13, color: "#aaa", textAlign: "center", margin: "0 0 20px", lineHeight: 1.6 }}>
                You can create products without connecting store<br />you can add products to store anytime
              </p>
              <button onClick={() => { setEditProduct(null); setShowModal(true); }} style={{ padding: "10px 24px", background: "#1e3a8a", color: "#fff", border: "none", borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                Add your Products
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(240px,1fr))", gap: 16 }}>
              {filteredProducts.map((p) => (
                <ProductCard key={p._id} product={p}
                  onPublishToggle={handlePublishToggle}
                  onDelete={handleDelete}
                  onEdit={handleEdit} />
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <ProductModal
          editProduct={editProduct}
          onClose={() => { setShowModal(false); setEditProduct(null); }}
          onSuccess={(msg) => { setShowModal(false); setEditProduct(null); if (msg) showToast(msg); fetchProducts(); }}
        />
      )}

      {/* TOAST */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "12px 20px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", zIndex: 200 }}>
          <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: "#1a1a2e" }}>{toast}</span>
          <span onClick={() => setToast("")} style={{ fontSize: 14, color: "#aaa", cursor: "pointer", marginLeft: 8 }}>✕</span>
        </div>
      )}
    </div>
  );
}