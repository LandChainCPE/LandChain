import React, { useEffect, useState } from "react";
import { Search, MapPin, Edit, Plus, Grid3X3, List, Camera, Trash2 } from "lucide-react";
import { Card, Button, Input, InputNumber, Modal, Form, message, Upload, Spin, Empty } from "antd";
import {
  getUserPostLandDataManage,
  updatePostManage,
  replaceAllPhotos,
  addMultiplePhotos
} from "../../service/https/jo/index";
import { useNavigate } from "react-router-dom";

const { TextArea } = Input;

// Types - ปรับให้สอดคล้องกับ sellpostmain.tsx
interface Province { id: number; name_th: string; }
interface District { id: number; name_th: string; }
interface Subdistrict { id: number; name_th: string; }
interface Landtitle {
  id: number;
  name: string;
  rai?: number;
  ngan?: number;
  square_wa?: number;
  title_deed_number?: string;
}
interface Users { id: number; username: string; }

// ✅ ปรับ Photoland interface ให้ตรงกับที่ใช้ใน sellpostmain
interface Photoland {
  id: number;
  path?: string;
  Path?: string;  // รองรับทั้ง path และ Path
  landsalepost_id?: number;
  LandsalepostID?: number;
}

interface TagEntity { id: number; tag: string; }

interface LandSalePost {
  ID?: number;
  id?: number;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  name?: string;
  price?: number | null;
  province_id?: number;
  province?: Province;
  district_id?: number;
  district?: District;
  subdistrict_id?: number;
  subdistrict?: Subdistrict;
  land_id?: number;
  landtitle?: Landtitle;
  user_id?: number;
  users?: Users;
  photoland?: Photoland[];
  Photoland?: Photoland[];
  tags?: TagEntity[];
}

const ManagePost: React.FC = () => {
  const navigate = useNavigate();

  // States
  const [posts, setPosts] = useState<LandSalePost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Modals
  const [editPostModalVisible, setEditPostModalVisible] = useState(false);
  const [editPhotoModalVisible, setEditPhotoModalVisible] = useState(false);
  const [currentEditingPost, setCurrentEditingPost] = useState<LandSalePost | null>(null);

  // Forms
  const [postForm] = Form.useForm();
  const [photoForm] = Form.useForm();

  // Photo management states
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<string[]>([]);
  const [uploadLoading, setUploadLoading] = useState(false);

  // ✅ Helper function - ใช้เหมือน sellpostmain.tsx
  const getImageSrc = (path?: string): string => {
    if (!path || path.trim() === '') {
      return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='16' fill='%236b7280'%3Eไม่มีรูปภาพ%3C/text%3E%3C/svg%3E";
    }

    const cleanPath = path.trim();

    if (cleanPath.startsWith("data:image/")) {
      return cleanPath;
    }

    if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
      return cleanPath;
    }

    if (cleanPath.length > 50) {
      let mimeType = "image/jpeg";

      if (cleanPath.startsWith("iVBOR")) {
        mimeType = "image/png";
      } else if (cleanPath.startsWith("R0lGOD")) {
        mimeType = "image/gif";
      } else if (cleanPath.startsWith("/9j/") || cleanPath.startsWith("/9g/")) {
        mimeType = "image/jpeg";
      } else if (cleanPath.startsWith("UklGR")) {
        mimeType = "image/webp";
      }

      try {
        return `data:${mimeType};base64,${cleanPath}`;
      } catch (e) {
        console.error("Error creating data URL:", e);
      }
    }

    return cleanPath;
  };

  // ✅ Function สำหรับจัดการ property name ที่อาจต่างกัน - เหมือน sellpostmain.tsx
  const getPhotoArray = (post: LandSalePost): Photoland[] => {
    return post.photoland || post.Photoland || [];
  };

  const getPhotoPath = (photo: Photoland): string => {
    return photo.path || photo.Path || "";
  };

  const getPhotoId = (photo: Photoland): number => {
    return photo.id || 0;
  };

  const addressText = (post: LandSalePost) => {
    return [
      post.subdistrict?.name_th,
      post.district?.name_th,
      post.province?.name_th
    ].filter(Boolean).join(", ");
  };

  // Load posts using new API
  useEffect(() => {
    loadUserPosts();
  }, []);

  const loadUserPosts = async () => {
    const wallet = sessionStorage.getItem("wallet");
    if (!wallet) {
      setError("ไม่พบ wallet address ในระบบ กรุณาเชื่อมต่อกระเป๋าเงินก่อน");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // ✅ ใช้ API ใหม่
      const result = await getUserPostLandDataManage(wallet);
      console.log("=== API Response Debug ===");
      console.log("Full result:", JSON.stringify(result, null, 2));

      if (result && !result.error) {
        const postsData = Array.isArray(result) ? result as LandSalePost[] : [];
        console.log("=== Posts Data Debug ===");
        console.log("Number of posts:", postsData.length);

        // Debug: ตรวจสอบข้อมูลรูปภาพอย่างละเอียด
        postsData.forEach((post, index) => {
          console.log(`=== Post ${index} Debug ===`);
          console.log("Post ID:", post.id || post.ID);
          console.log("Post name:", post.name);

          const photoArray = getPhotoArray(post);
          console.log("Photo array:", photoArray);
          console.log("Photo array length:", photoArray?.length || 0);

          if (photoArray && photoArray.length > 0) {
            photoArray.forEach((photo, photoIndex) => {
              console.log(`  Photo ${photoIndex}:`, {
                id: getPhotoId(photo),
                path: getPhotoPath(photo),
                pathLength: getPhotoPath(photo)?.length || 0
              });
            });
          }
        });

        setPosts(postsData);
        setError(null);
      } else {
        console.error("API Error:", result);
        setError(result?.error || "เกิดข้อผิดพลาดในการโหลดข้อมูลโพสต์");
      }
    } catch (err: any) {
      console.error("LoadUserPosts error:", err);
      setError(err?.message || "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  // Filter posts
  const filteredPosts = posts.filter(post => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (post.name || "").toLowerCase().includes(term) ||
      (post.province?.name_th || "").toLowerCase().includes(term) ||
      (post.district?.name_th || "").toLowerCase().includes(term) ||
      (post.subdistrict?.name_th || "").toLowerCase().includes(term)
    );
  });

  // Post editing handlers
  const handleEditPost = (post: LandSalePost) => {
    const id = post.id ?? post.ID;
    const normalized = { ...post, id };

    if (!id) {
      message.error("ไม่พบ Post ID");
      return;
    }

    setCurrentEditingPost(normalized);
    postForm.setFieldsValue({
      first_name: normalized.first_name || "",
      last_name: normalized.last_name || "",
      phone_number: normalized.phone_number || "",
      name: normalized.name || "",
      price: normalized.price || 0,
    });
    setEditPostModalVisible(true);
  };

  const handleSavePost = async () => {
    if (!currentEditingPost) {
      message.error("ไม่พบข้อมูลโพสต์ที่ต้องการแก้ไข");
      return;
    }

    try {
      const values = await postForm.validateFields();
      const id = currentEditingPost.id ?? currentEditingPost.ID;

      if (!id) {
        message.error("ไม่พบ Post ID");
        return;
      }

      const updateData = {
        id,
        name: values.name,
        price: values.price,
        first_name: values.first_name,
        last_name: values.last_name,
        phone_number: values.phone_number,
        province_id: currentEditingPost.province_id,
        district_id: currentEditingPost.district_id,
        subdistrict_id: currentEditingPost.subdistrict_id,
        land_id: currentEditingPost.land_id,
        user_id: currentEditingPost.user_id,
      };

      // ✅ ใช้ API ใหม่
      const result = await updatePostManage(id, updateData);

      if (result && !result.error) {
        message.success("อัพเดทโพสต์สำเร็จ");
        setEditPostModalVisible(false);
        loadUserPosts(); // Reload data
      } else {
        message.error(result?.error || "เกิดข้อผิดพลาดในการอัพเดทโพสต์");
      }
    } catch (err: any) {
      console.error("handleSavePost error:", err);
      message.error("กรุณาตรวจสอบข้อมูลที่กรอก");
    }
  };

  // ✅ Photo editing handlers - ใหม่และปรับปรุง
  const handleEditPhoto = (post: LandSalePost) => {
    const id = post.id ?? post.ID;
    if (!id) {
      message.error("ไม่พบ Post ID");
      return;
    }

    setCurrentEditingPost(post);

    // ✅ ดึงรูปภาพปัจจุบันมาแสดง - ใช้วิธีเดียวกับ sellpostmain
    const photoArray = getPhotoArray(post);
    const currentPaths = photoArray.map(photo => getPhotoPath(photo)).filter(path => path);

    console.log("=== Edit Photo Debug ===");
    console.log("Post:", post);
    console.log("Photo array:", photoArray);
    console.log("Current paths:", currentPaths);

    setCurrentImages(currentPaths);
    setNewImages([]);
    setEditPhotoModalVisible(true);
  };

  // ✅ Handle file upload - แปลงเป็น base64
  const handleFileUpload = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      setUploadLoading(true);

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        message.error("ขนาดไฟล์ต้องไม่เกิน 5MB");
        setUploadLoading(false);
        reject(new Error("File too large"));
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        message.error("กรุณาเลือกไฟล์รูปภาพ");
        setUploadLoading(false);
        reject(new Error("Invalid file type"));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const base64String = reader.result as string;
          const base64Data = base64String.split(",")[1] ?? base64String;

          // ✅ เพิ่มรูปใหม่เข้าไปใน array
          setNewImages(prev => [...prev, base64Data]);

          message.success("อัพโหลดรูปภาพสำเร็จ");
          resolve(base64Data);
        } catch (error) {
          console.error("Error processing file:", error);
          message.error("เกิดข้อผิดพลาดในการประมวลผลไฟล์");
          reject(error);
        } finally {
          setUploadLoading(false);
        }
      };
      reader.onerror = (e) => {
        console.error("FileReader error:", e);
        message.error("เกิดข้อผิดพลาดในการอ่านไฟล์");
        setUploadLoading(false);
        reject(e);
      };
      reader.readAsDataURL(file);
    });
  };

  // ✅ Save photos - ใช้ API ใหม่
  const handleSavePhotos = async () => {
    if (!currentEditingPost) {
      message.error("ไม่พบข้อมูลโพสต์ที่ต้องการแก้ไข");
      return;
    }

    const postId = currentEditingPost.id ?? currentEditingPost.ID;
    if (!postId) {
      message.error("ไม่พบ Post ID");
      return;
    }

    try {
      // ✅ รวมรูปเก่าและรูปใหม่
      const allImages = [...currentImages, ...newImages].filter(img => img && img.trim() !== '');

      if (allImages.length === 0) {
        message.error("กรุณาเพิ่มรูปภาพอย่างน้อย 1 รูป");
        return;
      }

      console.log("=== Save Photos Debug ===");
      console.log("Post ID:", postId);
      console.log("All images count:", allImages.length);
      console.log("Current images:", currentImages.length);
      console.log("New images:", newImages.length);

      // ✅ ใช้ replaceAllPhotos เพื่อแทนที่รูปทั้งหมด
      const result = await replaceAllPhotos(postId, allImages);

      console.log("Replace photos result:", result);

      if (result && !result.error) {
        message.success("อัพเดทรูปภาพสำเร็จ");
        setEditPhotoModalVisible(false);
        setCurrentImages([]);
        setNewImages([]);
        loadUserPosts(); // Reload data
      } else {
        message.error(result?.error || "เกิดข้อผิดพลาดในการอัพเดทรูปภาพ");
      }
    } catch (err: any) {
      console.error("handleSavePhotos error:", err);
      message.error("เกิดข้อผิดพลาดในการบันทึกรูปภาพ");
    }
  };

  // ✅ Remove image from current images
  const removeCurrentImage = (index: number) => {
    setCurrentImages(prev => prev.filter((_, i) => i !== index));
  };

  // ✅ Remove image from new images
  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  // Clear states when modal closes
  const handlePhotoModalCancel = () => {
    setEditPhotoModalVisible(false);
    setCurrentImages([]);
    setNewImages([]);
    setCurrentEditingPost(null);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="appointment-status-container">
        <div className="floating-shapes">
          <div className="shape-1"></div>
          <div className="shape-2"></div>
          <div className="shape-3"></div>
          <div className="shape-4"></div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          gap: 16
        }}>
          <Spin size="large" />
          <span style={{ color: '#6F969B', fontSize: 16 }}>กำลังโหลดข้อมูล...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="appointment-status-container">
      <div className="floating-shapes">
        <div className="shape-1"></div>
        <div className="shape-2"></div>
        <div className="shape-3"></div>
        <div className="shape-4"></div>
      </div>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>
            <span className="gradient-text">จัดการโพสต์ขายที่ดิน</span>
          </h1>
          <p className="hero-subtitle">
            จัดการโพสต์ขายที่ดิน แก้ไข อัพเดท หรือลบโพสต์ต่าง ๆ ของคุณ
          </p>
          <button
            className="btn-modern"
            style={{ marginTop: 32 }}
            onClick={() => navigate("/user/sellpost")}
          >
            <span style={{ fontSize: 24, marginRight: 8 }}>+</span> สร้างโพสต์ใหม่
          </button>
        </div>
      </div>

      <div className="main-container" style={{ maxWidth: 1200, margin: "0 auto", paddingTop: 0 }}>
        {error ? (
          <div className="glass-card" style={{
            padding: 48,
            textAlign: "center",
            margin: "0 auto",
            maxWidth: 500
          }}>
            <div style={{
              width: 80,
              height: 80,
              margin: "0 auto 20px",
              background: "linear-gradient(135deg, #ef4444, #dc2626)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <span style={{ fontSize: 32 }}>⚠️</span>
            </div>
            <h3 style={{ fontSize: 24, fontWeight: 700, color: "#172E25", marginBottom: 12 }}>
              เกิดข้อผิดพลาด
            </h3>
            <p style={{ fontSize: 16, color: "#dc2626", marginBottom: 24 }}>
              {error}
            </p>
            <button className="btn-modern" onClick={loadUserPosts}>
              ลองใหม่
            </button>
          </div>
        ) : (
          <>
            {/* Search & Filter Bar */}
            <div className="glass-card" style={{
              margin: "0 auto",
              maxWidth: 900,
              padding: 32,
              marginBottom: 32
            }}>
              <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 16,
                alignItems: "center",
                justifyContent: "center"
              }}>
                <div style={{
                  position: "relative",
                  flex: 1,
                  minWidth: 260,
                  maxWidth: 400
                }}>
                  <Search style={{
                    position: "absolute",
                    left: 20,
                    top: 18,
                    width: 22,
                    height: 22,
                    color: "#6F969B",
                    zIndex: 2
                  }} />
                  <input
                    className="modern-select"
                    type="text"
                    placeholder="ค้นหาที่ดิน, จังหวัด, อำเภอ, ตำบล..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "14px 16px 14px 48px",
                      fontSize: 16,
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      color: "#172E25",
                      fontWeight: 500
                    }}
                  />
                </div>

                <div style={{
                  display: "flex",
                  background: "#F3F4F6",
                  borderRadius: 12,
                  padding: 4
                }}>
                  <button
                    className="btn-modern"
                    style={{
                      background: viewMode === "grid" ? "var(--gradient-primary)" : "transparent",
                      color: viewMode === "grid" ? "white" : "#6F969B",
                      minWidth: 0,
                      padding: 10,
                      borderRadius: 10,
                      fontSize: 18,
                      boxShadow: "none",
                      marginRight: 4
                    }}
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 style={{ width: 20, height: 20 }} />
                  </button>

                  <button
                    className="btn-modern"
                    style={{
                      background: viewMode === "list" ? "var(--gradient-primary)" : "transparent",
                      color: viewMode === "list" ? "white" : "#6F969B",
                      minWidth: 0,
                      padding: 10,
                      borderRadius: 10,
                      fontSize: 18,
                      boxShadow: "none"
                    }}
                    onClick={() => setViewMode("list")}
                  >
                    <List style={{ width: 20, height: 20 }} />
                  </button>
                </div>
              </div>
            </div>

            {/* Posts Content */}
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
              {filteredPosts.length === 0 ? (
                <div className="glass-card" style={{
                  textAlign: "center",
                  padding: 48,
                  margin: "0 auto",
                  maxWidth: 500
                }}>
                  <Empty
                    description={
                      <span style={{ color: "#6F969B", fontSize: 16 }}>
                        {searchTerm
                          ? `ไม่พบที่ดินที่ตรงกับ "${searchTerm}"`
                          : "ยังไม่มีประกาศขายที่ดินในระบบ"
                        }
                      </span>
                    }
                  />
                  {searchTerm && (
                    <button
                      className="btn-modern"
                      onClick={() => setSearchTerm("")}
                      style={{ marginTop: 16 }}
                    >
                      ดูทั้งหมด
                    </button>
                  )}
                </div>
              ) : viewMode === "grid" ? (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                  gap: 32
                }}>
                  {filteredPosts.map(post => {
                    const addr = addressText(post);
                    const key = post.id ?? post.ID ?? Math.random();

                    return (
                      <div key={key} className="glass-card" style={{
                        position: "relative",
                        overflow: "hidden",
                        transition: "all 0.3s ease"
                      }}>
                        {/* Image Container */}
                        <div style={{
                          position: "relative",
                          height: 200,
                          background: "var(--gradient-primary)",
                          borderRadius: 18,
                          overflow: "hidden",
                          marginBottom: 16
                        }}>
                          {(() => {
                            const photoArray = getPhotoArray(post);
                            const firstPhoto = photoArray && photoArray.length > 0 ? photoArray[0] : null;
                            const photoPath = firstPhoto ? getPhotoPath(firstPhoto) : null;

                            return photoPath ? (
                              <img
                                src={getImageSrc(photoPath)}
                                alt="land-photo"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  borderRadius: 18,
                                  transition: "transform 0.7s ease"
                                }}
                                onLoad={(e) => {
                                  console.log("Image loaded successfully");
                                }}
                                onError={(e) => {
                                  const imgElement = e.target as HTMLImageElement;
                                  console.error('Image failed to load');
                                  imgElement.src = getImageSrc("");
                                }}
                              />
                            ) : (
                              <img
                                src={getImageSrc("")}
                                alt="ไม่มีรูปภาพ"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  borderRadius: 18
                                }}
                              />
                            );
                          })()}

                          {/* Price Badge */}
                          {post.price != null && (
                            <div style={{
                              position: "absolute",
                              top: 16,
                              right: 16,
                              background: "linear-gradient(135deg, #10b981, #059669)",
                              color: "white",
                              padding: "8px 16px",
                              borderRadius: 20,
                              fontWeight: 700,
                              fontSize: 16,
                              boxShadow: "0 8px 32px rgba(23, 46, 37, 0.1)",
                              backdropFilter: "blur(4px)",
                              border: "1px solid rgba(255, 255, 255, 0.2)"
                            }}>
                              ฿{Number(post.price).toLocaleString()}
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div style={{
                            position: "absolute",
                            top: 16,
                            left: 16,
                            display: "flex",
                            gap: 8
                          }}>
                            <Button
                              type="primary"
                              shape="circle"
                              icon={<Edit size={16} />}
                              onClick={() => handleEditPost(post)}
                              style={{
                                background: "rgba(255,255,255,0.9)",
                                color: "#6F969B",
                                border: "none",
                                backdropFilter: "blur(10px)"
                              }}
                            />
                            <Button
                              type="primary"
                              shape="circle"
                              icon={<Camera size={16} />}
                              onClick={() => handleEditPhoto(post)}
                              style={{
                                background: "rgba(255,255,255,0.9)",
                                color: "#6F969B",
                                border: "none",
                                backdropFilter: "blur(10px)"
                              }}
                            />
                            
                          </div>
                        </div>

                        {/* Post Info */}
                        <div>
                          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                            {post.name || "ไม่ระบุชื่อโพสต์"}
                          </h3>
                          <p style={{ fontSize: 14, color: "#6F969B", marginBottom: 4 }}>
                            {addr || "ไม่ระบุที่อยู่"}
                          </p>
                          <p style={{ fontSize: 14, color: "#6F969B" }}>
                            ผู้โพสต์: {post.first_name} {post.last_name}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {filteredPosts.map(post => {
                    const addr = addressText(post);
                    const key = post.id ?? post.ID ?? Math.random();

                    const photoArray = getPhotoArray(post);
                    const firstPhoto = photoArray && photoArray.length > 0 ? photoArray[0] : null;
                    const photoPath = firstPhoto ? getPhotoPath(firstPhoto) : null;

                    return (
                      <div key={key} className="glass-card" style={{ display: "flex", gap: 16 }}>
                        <div style={{ width: 200, height: 140, overflow: "hidden", borderRadius: 12 }}>
                          <img
                            src={photoPath ? getImageSrc(photoPath) : getImageSrc("")}
                            alt="land-photo"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </div>

                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                            {post.name || "ไม่ระบุชื่อโพสต์"}
                          </h3>
                          <p style={{ fontSize: 14, color: "#6F969B", marginBottom: 4 }}>
                            {addr || "ไม่ระบุที่อยู่"}
                          </p>
                          <p style={{ fontSize: 14, color: "#6F969B" }}>
                            ผู้โพสต์: {post.first_name} {post.last_name}
                          </p>
                          {post.price != null && (
                            <p style={{ fontWeight: 600, marginTop: 8 }}>
                              ฿{Number(post.price).toLocaleString()}
                            </p>
                          )}
                        </div>

                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <Button
                            type="primary"
                            icon={<Edit size={16} />}
                            onClick={() => handleEditPost(post)}
                          >
                            แก้ไข
                          </Button>
                          <Button
                            type="primary"
                            icon={<Camera size={16} />}
                            onClick={() => handleEditPhoto(post)}
                          >
                            รูปภาพ
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ✅ Modal แก้ไขโพสต์ */}
      <Modal
        visible={editPostModalVisible}
        title="แก้ไขโพสต์ขายที่ดิน"
        onCancel={() => setEditPostModalVisible(false)}
        onOk={handleSavePost}
        okText="บันทึก"
        cancelText="ยกเลิก"
      >
        <Form form={postForm} layout="vertical">
          <Form.Item label="ชื่อโพสต์" name="name" rules={[{ required: true, message: "กรุณากรอกชื่อโพสต์" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="ชื่อจริง" name="first_name">
            <Input />
          </Form.Item>
          <Form.Item label="นามสกุล" name="last_name">
            <Input />
          </Form.Item>
          <Form.Item label="เบอร์โทร" name="phone_number">
            <Input />
          </Form.Item>
          <Form.Item label="ราคา (บาท)" name="price">
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
        </Form>
      </Modal>

      {/* ✅ Modal จัดการรูปภาพ */}
      <Modal
        visible={editPhotoModalVisible}
        title="จัดการรูปภาพโพสต์"
        onCancel={handlePhotoModalCancel}
        onOk={handleSavePhotos}
        okText="บันทึก"
        cancelText="ยกเลิก"
        width={800}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
          {currentImages.map((img, idx) => (
            <div key={idx} style={{ position: "relative" }}>
              <img
                src={getImageSrc(img)}
                alt={`current-${idx}`}
                style={{ width: 150, height: 150, objectFit: "cover", borderRadius: 12 }}
              />
              <Button
                type="primary"
                shape="circle"
                danger
                icon={<Trash2 size={16} />}
                style={{ position: "absolute", top: 8, right: 8 }}
                onClick={() => removeCurrentImage(idx)}
              />
            </div>
          ))}
          {newImages.map((img, idx) => (
            <div key={`new-${idx}`} style={{ position: "relative" }}>
              <img
                src={getImageSrc(img)}
                alt={`new-${idx}`}
                style={{ width: 150, height: 150, objectFit: "cover", borderRadius: 12 }}
              />
              <Button
                type="primary"
                shape="circle"
                danger
                icon={<Trash2 size={16} />}
                style={{ position: "absolute", top: 8, right: 8 }}
                onClick={() => removeNewImage(idx)}
              />
            </div>
          ))}
        </div>

        <Upload
          beforeUpload={(file) => {
            handleFileUpload(file);
            return false;
          }}
          multiple
          showUploadList={false}
        >
          <Button type="dashed" block loading={uploadLoading}>
            เพิ่มรูปภาพ
          </Button>
        </Upload>
      </Modal>
    </div>
  );
};

export default ManagePost;
