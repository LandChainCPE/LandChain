import React, { useEffect, useState } from "react";
import { Search, MapPin, Edit, Plus, Grid3X3, List, Camera, Trash2 } from "lucide-react";
import { Card, Button, Input, InputNumber, Modal, Form, message, Upload, Spin, Empty } from "antd";
import { GetUserPostLandData, updatePost, updatePhotoland } from "../../service/https/jo/index";
import { useNavigate } from "react-router-dom";

const { TextArea } = Input;

// Types
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
interface Photoland { 
  id: number; 
  path: string; 
  landsalepost_id: number; 
  ID?: number;
  Path?: string;
  LandsalepostID?: number;
}
interface TagEntity { id: number; tag: string; }

interface LandSalePost {
  photos(arg0: string, photos: any): unknown;
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
  const [currentEditingPhoto, setCurrentEditingPhoto] = useState<Photoland | null>(null);
  
  // Forms
  const [postForm] = Form.useForm();
  const [photoForm] = Form.useForm();

  // Preview state for new image
  const [previewImage, setPreviewImage] = useState<string>("");
  const [uploadLoading, setUploadLoading] = useState(false);

  // Helper functions
  const getImageSrc = (path?: string): string => {
    console.log("Processing image path:", path ? `Length: ${path.length}, Type: ${typeof path}` : "null/undefined");
    
    if (!path || path.trim() === '') {
      console.log("No path provided, returning placeholder");
      return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='16' fill='%236b7280'%3Eไม่มีรูปภาพ%3C/text%3E%3C/svg%3E";
    }

    const cleanPath = path.trim();
    console.log("Cleaned path length:", cleanPath.length);
    
    // ตรวจสอบว่าเป็น data URL แล้วหรือยัง
    if (cleanPath.startsWith("data:image/")) {
      console.log("Path is already a data URL");
      return cleanPath;
    }

    // ตรวจสอบว่าเป็น HTTP URL
    if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
      console.log("Path is HTTP URL");
      return cleanPath;
    }

    // ถ้าไม่ใช่ data URL แต่มีข้อมูลยาว ๆ อาจเป็น base64 ที่ไม่มี header
    if (cleanPath.length > 50) {
      console.log("Attempting to create data URL from base64");
      
      // ลองตรวจสอบชนิดไฟล์จาก magic bytes ใน base64
      let mimeType = "image/jpeg"; // default
      
      if (cleanPath.startsWith("iVBOR")) {
        mimeType = "image/png";
      } else if (cleanPath.startsWith("R0lGOD")) {
        mimeType = "image/gif";
      } else if (cleanPath.startsWith("/9j/") || cleanPath.startsWith("/9g/")) {
        mimeType = "image/jpeg";
      } else if (cleanPath.startsWith("UklGR")) {
        mimeType = "image/webp";
      }
      
      console.log("Detected MIME type:", mimeType);
      
      // ลองสร้าง data URL
      try {
        const dataUrl = `data:${mimeType};base64,${cleanPath}`;
        console.log("Generated data URL:", dataUrl.substring(0, 100) + "...");
        return dataUrl;
      } catch (e) {
        console.error("Error creating data URL:", e);
      }
    }

    console.log("Using path as-is");
    return cleanPath;
  };

  // ฟังก์ชันสำหรับจัดการ property name ที่อาจต่างกัน
  const getPhotoArray = (post: any): Photoland[] => {
    return post.photoland || post.Photoland || post.photos || post.Photos || [];
  };

  const getPhotoPath = (photo: any): string => {
    return photo.path || photo.Path || "";
  };

  const getPhotoId = (photo: any): number => {
    return photo.id || photo.ID || 0;
  };

  const getPhotoLandsalepostId = (photo: any): number => {
    return photo.landsalepost_id || photo.LandsalepostID || 0;
  };

  const addressText = (post: LandSalePost) => {
    return [
      post.subdistrict?.name_th,
      post.district?.name_th,
      post.province?.name_th
    ].filter(Boolean).join(", ");
  };

  // Load posts
  useEffect(() => {
    loadUserPosts();
  }, []);

  const loadUserPosts = async () => {
    const wallet = localStorage.getItem("wallet");
    if (!wallet) {
      setError("ไม่พบ wallet address ในระบบ กรุณาเชื่อมต่อกระเป๋าเงินก่อน");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { response, result } = await GetUserPostLandData(wallet);
      console.log("=== API Response Debug ===");
      console.log("Response status:", response?.status);
      console.log("Response ok:", response?.ok);
      console.log("Full result:", JSON.stringify(result, null, 2));
      
      if (response?.ok) {
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
                landsalepost_id: getPhotoLandsalepostId(photo),
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

      const result = await updatePost(updateData);
      
      if (result?.response?.ok) {
        message.success("อัพเดทโพสต์สำเร็จ");
        setEditPostModalVisible(false);
        loadUserPosts(); // Reload data
      } else {
        message.error(result?.result?.error || "เกิดข้อผิดพลาดในการอัพเดทโพสต์");
      }
    } catch (err: any) {
      console.error("handleSavePost error:", err);
      message.error("กรุณาตรวจสอบข้อมูลที่กรอก");
    }
  };

  // Photo editing handlers
  const handleEditPhoto = (photo: Photoland, post?: LandSalePost) => {
    console.log("=== Edit Photo Debug ===");
    console.log("Original photo object:", photo);
    console.log("Photo ID:", getPhotoId(photo));
    console.log("Photo path:", getPhotoPath(photo));
    console.log("Photo landsalepost_id:", getPhotoLandsalepostId(photo));

    // Normalize photo object
    const normalizedPhoto: Photoland = {
      id: getPhotoId(photo),
      path: getPhotoPath(photo),
      landsalepost_id: getPhotoLandsalepostId(photo)
    };

    // ถ้าไม่มี landsalepost_id ลองหาจาก post
    if (!normalizedPhoto.landsalepost_id && post) {
      normalizedPhoto.landsalepost_id = post.id || post.ID || 0;
    }

    console.log("Normalized photo:", normalizedPhoto);

    if (!normalizedPhoto.id) {
      message.error("ไม่พบ Photo ID");
      return;
    }

    setCurrentEditingPhoto(normalizedPhoto);
    photoForm.setFieldsValue({ 
      path: normalizedPhoto.path || ""
    });
    setPreviewImage(""); // Reset preview
    setEditPhotoModalVisible(true);
  };

  const handleSavePhoto = async () => {
    if (!currentEditingPhoto) {
      message.error("ไม่พบข้อมูลรูปภาพที่ต้องการแก้ไข");
      return;
    }

    try {
      const values = await photoForm.validateFields();
      
      if (!values.path || values.path.trim() === "") {
        message.error("กรุณาใส่ข้อมูลรูปภาพ");
        return;
      }

      const updateData = {
        path: values.path.trim(),
        landsalepost_id: currentEditingPhoto.landsalepost_id,
      };

      console.log("=== Save Photo Debug ===");
      console.log("Photo ID to update:", currentEditingPhoto.id);
      console.log("Update data:", updateData);

      const { response, result } = await updatePhotoland(currentEditingPhoto.id, updateData);
      
      console.log("Update photo response:", { response, result });
      
      if (response?.ok) {
        message.success("อัพเดทรูปภาพสำเร็จ");
        setEditPhotoModalVisible(false);
        setPreviewImage("");
        photoForm.resetFields();
        loadUserPosts(); // Reload data
      } else {
        message.error(result?.error || "เกิดข้อผิดพลาดในการอัพเดทรูปภาพ");
      }
    } catch (err: any) {
      console.error("handleSavePhoto error:", err);
      message.error("กรุณาตรวจสอบข้อมูลที่กรอก");
    }
  };

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
          
          // Update form field
          photoForm.setFieldsValue({ path: base64Data });
          
          // Set preview image
          setPreviewImage(base64String);
          
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

  // Clear preview when modal closes
  const handlePhotoModalCancel = () => {
    setEditPhotoModalVisible(false);
    setPreviewImage("");
    photoForm.resetFields();
    setCurrentEditingPhoto(null);
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
                                  
                                  // Fallback to placeholder
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
                            {(() => {
                              const photoArray = getPhotoArray(post);
                              return photoArray && photoArray.length > 0 && (
                                <Button
                                  type="primary"
                                  shape="circle"
                                  icon={<Camera size={16} />}
                                  onClick={() => handleEditPhoto(photoArray[0], post)}
                                  style={{ 
                                    background: "rgba(255,255,255,0.9)", 
                                    color: "#6F969B", 
                                    border: "none", 
                                    backdropFilter: "blur(10px)" 
                                  }}
                                  title="แก้ไขรูปภาพ"
                                />
                              );
                            })()}
                          </div>
                        </div>

                        {/* Content */}
                        <div style={{ 
                          display: "flex", 
                          flexDirection: "column", 
                          gap: 16, 
                          padding: 24 
                        }}>
                          <h3 style={{
                            fontWeight: 700,
                            fontSize: 20,
                            color: "#172E25",
                            marginBottom: 4,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }}>
                            {post.name || "ชื่อที่ดินไม่ระบุ"}
                          </h3>

                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            color: "#3F5658",
                            fontSize: 15
                          }}>
                            <MapPin style={{ 
                              width: 20, 
                              height: 20, 
                              color: "#6F969B", 
                              flexShrink: 0 
                            }} />
                            <span style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              fontSize: 14,
                              lineHeight: 1.625
                            }}>
                              {addr || "ไม่ระบุที่อยู่"}
                            </span>
                          </div>

                          {/* Land Size */}
                          {post.landtitle && (
                            <div style={{
                              background: "#eff6ff",
                              padding: 16,
                              borderRadius: 16,
                              border: "1px solid #dbeafe",
                              fontWeight: 600,
                              fontSize: 14,
                              color: "#2563eb"
                            }}>
                              📏 {[
                                post.landtitle.rai && `${post.landtitle.rai} ไร่`,
                                post.landtitle.ngan && `${post.landtitle.ngan} งาน`,
                                post.landtitle.square_wa && `${post.landtitle.square_wa} ตร.วา`,
                              ].filter(Boolean).join(" ") || "ไม่ระบุขนาด"}
                            </div>
                          )}

                          {/* Tags */}
                          {post.tags && post.tags.length > 0 && (
                            <div style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 8
                            }}>
                              {post.tags.slice(0, 3).map((tag, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    padding: "4px 12px",
                                    fontSize: 12,
                                    background: "rgba(111,150,155,0.08)",
                                    color: "#6F969B",
                                    borderRadius: 12,
                                    border: "1px solid #6F969B"
                                  }}
                                >
                                  {tag.tag}
                                </span>
                              ))}
                              {post.tags.length > 3 && (
                                <span style={{
                                  padding: "4px 12px",
                                  background: "#f3f4f6",
                                  color: "#4b5563",
                                  border: "1px solid #e5e7eb",
                                  fontSize: 12,
                                  borderRadius: 12
                                }}>
                                  +{post.tags.length - 3} เพิ่มเติม
                                </span>
                              )}
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div style={{ 
                            display: "flex", 
                            gap: 8, 
                            marginTop: 16 
                          }}>
                            <button 
                              className="btn-modern" 
                              style={{ flex: 1 }} 
                              onClick={() => navigate(`/user/landdetail/${post.id ?? post.ID}`)}
                            >
                              รายละเอียด
                            </button>
                            <button 
                              className="btn-modern outlined" 
                              onClick={() => handleEditPost(post)}
                            >
                              <Edit size={16} />
                            </button>
                            {(() => {
                              const photoArray = getPhotoArray(post);
                              return photoArray && photoArray.length > 0 && (
                                <button 
                                  className="btn-modern outlined" 
                                  onClick={() => handleEditPhoto(photoArray[0], post)}
                                  title="แก้ไขรูปภาพ"
                                >
                                  <Camera size={16} />
                                </button>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  {filteredPosts.map(post => {
                    const addr = addressText(post);
                    const key = post.id ?? post.ID ?? Math.random();
                    
                    return (
                      <div key={key} className="glass-card" style={{ 
                        display: "flex", 
                        gap: 24, 
                        alignItems: "center", 
                        minHeight: 180,
                        padding: 24
                      }}>
                        {/* Image */}
                        <div style={{ 
                          flexShrink: 0,
                          width: 180,
                          height: 120,
                          borderRadius: 16,
                          overflow: "hidden",
                          background: "var(--gradient-primary)"
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
                                  borderRadius: 16,
                                  boxShadow: "0 8px 32px rgba(23, 46, 37, 0.1)"
                                }}
                                onLoad={(e) => {
                                  console.log("List image loaded successfully");
                                }}
                                onError={(e) => {
                                  const imgElement = e.target as HTMLImageElement;
                                  console.error('List image failed to load');
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
                                  borderRadius: 16,
                                  boxShadow: "0 8px 32px rgba(23, 46, 37, 0.1)"
                                }}
                              />
                            );
                          })()}
                        </div>

                        {/* Content */}
                        <div style={{ 
                          flex: 1, 
                          minWidth: 0, 
                          display: "flex", 
                          flexDirection: "column", 
                          gap: 8 
                        }}>
                          <h3 style={{
                            fontWeight: 700,
                            fontSize: 20,
                            color: "#172E25"
                          }}>
                            {post.name || "ชื่อที่ดินไม่ระบุ"}
                          </h3>

                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            color: "#4b5563"
                          }}>
                            <MapPin style={{ 
                              width: 20, 
                              height: 20, 
                              flexShrink: 0, 
                              color: "#3b82f6" 
                            }} />
                            <span style={{ fontSize: 16 }}>
                              {addr || "ไม่ระบุที่อยู่"}
                            </span>
                          </div>

                          {/* Land Size */}
                          {post.landtitle && (
                            <div style={{
                              fontSize: 16,
                              color: "#374151",
                              marginBottom: 12
                            }}>
                              <span style={{
                                fontWeight: 600,
                                color: "#2563eb"
                              }}>📏 ขนาด: </span>
                              {[
                                post.landtitle.rai && `${post.landtitle.rai} ไร่`,
                                post.landtitle.ngan && `${post.landtitle.ngan} งาน`,
                                post.landtitle.square_wa && `${post.landtitle.square_wa} ตร.วา`,
                              ].filter(Boolean).join(" ") || "ไม่ระบุขนาด"}
                            </div>
                          )}

                          {/* Tags */}
                          {post.tags && post.tags.length > 0 && (
                            <div style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 12
                            }}>
                              {post.tags.slice(0, 5).map((tag, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    padding: "8px 16px",
                                    fontSize: 14,
                                    fontWeight: 600,
                                    background: "#f3e8ff",
                                    color: "#7c3aed",
                                    borderRadius: 12,
                                    border: "1px solid #e9d5ff"
                                  }}
                                >
                                  {tag.tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div style={{ 
                            display: "flex", 
                            gap: 12, 
                            marginTop: 12 
                          }}>
                            <button 
                              className="btn-modern" 
                              onClick={() => navigate(`/user/landdetail/${post.id ?? post.ID}`)}
                            >
                              รายละเอียด
                            </button>
                            <button 
                              className="btn-modern outlined" 
                              onClick={() => handleEditPost(post)}
                            >
                              แก้ไข
                            </button>
                            {(() => {
                              const photoArray = getPhotoArray(post);
                              return photoArray && photoArray.length > 0 && (
                                <button 
                                  className="btn-modern outlined" 
                                  onClick={() => handleEditPhoto(photoArray[0], post)}
                                >
                                  📷
                                </button>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Price */}
                        {post.price != null && (
                          <div style={{ textAlign: "right", minWidth: 120 }}>
                            <div style={{
                              fontSize: 22,
                              fontWeight: 700,
                              color: "#10b981"
                            }}>
                              ฿{Number(post.price).toLocaleString()}
                            </div>
                            <div style={{
                              fontSize: 13,
                              color: "#6F969B",
                              marginTop: 4
                            }}>
                              ราคาขาย
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Edit Post Modal */}
      <Modal
        title="แก้ไขโพสต์"
        open={editPostModalVisible}
        onCancel={() => setEditPostModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setEditPostModalVisible(false)}>
            ยกเลิก
          </Button>,
          <Button key="save" type="primary" onClick={handleSavePost} className="btn-modern">
            บันทึก
          </Button>
        ]}
        width={600}
      >
        <Form form={postForm} layout="vertical">
          <Form.Item 
            name="first_name" 
            label="ชื่อ" 
            rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}
          >
            <Input placeholder="กรอกชื่อ" />
          </Form.Item>

          <Form.Item 
            name="last_name" 
            label="นามสกุล" 
            rules={[{ required: true, message: "กรุณากรอกนามสกุล" }]}
          >
            <Input placeholder="กรอกนามสกุล" />
          </Form.Item>

          <Form.Item 
            name="phone_number" 
            label="เบอร์โทรศัพท์" 
            rules={[{ required: true, message: "กรุณากรอกเบอร์โทรศัพท์" }]}
          >
            <Input placeholder="กรอกเบอร์โทรศัพท์" />
          </Form.Item>

          <Form.Item 
            name="name" 
            label="ชื่อโพสต์" 
            rules={[{ required: true, message: "กรุณากรอกชื่อโพสต์" }]}
          >
            <Input placeholder="กรอกชื่อโพสต์" />
          </Form.Item>

          <Form.Item 
            name="price" 
            label="ราคา (บาท)" 
            rules={[{ required: true, message: "กรุณากรอกราคา" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="กรอกราคา"
              min={0}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
             // parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Photo Modal */}
      <Modal
        title="แก้ไขรูปภาพ"
        open={editPhotoModalVisible}
        onCancel={handlePhotoModalCancel}
        footer={[
          <Button key="cancel" onClick={handlePhotoModalCancel}>
            ยกเลิก
          </Button>,
          <Button 
            key="save" 
            type="primary" 
            onClick={handleSavePhoto} 
            className="btn-modern"
            loading={uploadLoading}
          >
            บันทึก
          </Button>
        ]}
        width={700}
        destroyOnClose={true}
      >
        <Form form={photoForm} layout="vertical">
          <Form.Item label="อัพโหลดไฟล์ใหม่">
            <Upload
              beforeUpload={(file: File) => {
                handleFileUpload(file).catch((e) => console.error("file read error", e));
                return false; // prevent auto upload
              }}
              accept="image/*"
              showUploadList={false}
              disabled={uploadLoading}
            >
              <Button 
                icon={<Plus />} 
                loading={uploadLoading}
                style={{ width: "100%" }}
              >
                {uploadLoading ? "กำลังประมวลผล..." : "เลือกรูปภาพใหม่"}
              </Button>
            </Upload>
            <div style={{ 
              fontSize: 12, 
              color: "#666", 
              marginTop: 8,
              textAlign: "center"
            }}>
              รองรับไฟล์: JPG, PNG, GIF (ขนาดไม่เกิน 5MB)
            </div>
          </Form.Item>

          <Form.Item 
            name="path" 
            label="หรือใส่ข้อมูลรูปภาพ (Base64)" 
            rules={[{ required: true, message: "กรุณาใส่ข้อมูลรูปภาพ" }]}
          >
            <TextArea 
              rows={4} 
              placeholder="กรอก Base64 string หรืออัพโหลดไฟล์ด้านบน" 
              disabled={uploadLoading}
            />
          </Form.Item>
        </Form>

        {/* Current Image Preview */}
        <div style={{ marginTop: 20 }}>
          <h4 style={{ marginBottom: 12, fontWeight: 600, color: "#374151" }}>
            รูปภาพปัจจุบัน:
          </h4>
          {currentEditingPhoto && currentEditingPhoto.path ? (
            <div style={{ 
              textAlign: "center", 
              marginBottom: 20,
              padding: 16,
              border: "2px dashed #d1d5db",
              borderRadius: 8,
              background: "#f9fafb"
            }}>
              <img
                src={getImageSrc(currentEditingPhoto.path)}
                alt="รูปภาพปัจจุบัน"
                style={{ 
                  maxWidth: "100%", 
                  maxHeight: 300, 
                  objectFit: "cover", 
                  borderRadius: 8,
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
                }}
                onError={(e) => { 
                  console.error("Current image failed to load"); 
                  const imgElement = e.target as HTMLImageElement;
                  imgElement.style.display = "none";
                  const container = imgElement.parentElement;
                  if (container) {
                    container.innerHTML = '<div style="color: #ef4444; padding: 20px;">ไม่สามารถแสดงรูปภาพปัจจุบันได้</div>';
                  }
                }}
              />
              <div style={{ 
                fontSize: 12, 
                color: "#6b7280", 
                marginTop: 8 
              }}>
                รูปภาพเดิม
              </div>
            </div>
          ) : (
            <div style={{ 
              textAlign: "center", 
              color: "#9ca3af", 
              fontStyle: "italic", 
              padding: 30, 
              border: "2px dashed #e5e7eb", 
              borderRadius: 8,
              background: "#f9fafb",
              marginBottom: 20
            }}>
              ไม่มีรูปภาพปัจจุบันหรือไม่สามารถแสดงได้
            </div>
          )}
        </div>

        {/* New Image Preview */}
        {previewImage && (
          <div style={{ marginTop: 20 }}>
            <h4 style={{ marginBottom: 12, fontWeight: 600, color: "#059669" }}>
              ตัวอย่างรูปภาพใหม่:
            </h4>
            <div style={{ 
              textAlign: "center",
              padding: 16,
              border: "2px solid #059669",
              borderRadius: 8,
              background: "#ecfdf5"
            }}>
              <img
                src={previewImage}
                alt="ตัวอย่างรูปภาพใหม่"
                style={{ 
                  maxWidth: "100%", 
                  maxHeight: 300, 
                  objectFit: "cover", 
                  borderRadius: 8,
                  boxShadow: "0 4px 12px rgba(5,150,105,0.3)"
                }}
                onError={(e) => { 
                  console.error("Preview image failed to load"); 
                  message.error("ไม่สามารถแสดงตัวอย่างรูปภาพได้");
                  setPreviewImage("");
                }}
              />
              <div style={{ 
                fontSize: 12, 
                color: "#047857", 
                marginTop: 8,
                fontWeight: 500
              }}>
                รูปภาพใหม่ที่จะอัพเดท
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManagePost;