import React, { useEffect, useState, useRef } from "react";
import { MapPin, Edit, Plus, Grid3X3, List, Camera, Trash2, Tag } from "lucide-react";
import { Button, Input, InputNumber, Modal, Form, message, Spin, Empty, Select, Popconfirm } from "antd";
import { GetUserIDByWalletAddress } from "../../service/https/bam/bam";
import {
  updatePost,
  getUserPostLandData,
  deletePost,
  GetProvinces,
  getLocationsByLandSalePostId
} from "../../service/https/jo/index";
import { GetTags, GetDistrict, GetSubdistrict } from "../../service/https/jib/jib"; // เพิ่มบรรทัดนี้
import { useNavigate } from "react-router-dom";
import Navbar from "../../component/user/Navbar";
import "./ManagePost.css";

const { Option } = Select;



// Types
interface PhotoItem {
  id?: number;
  path: string;
  isNew: boolean;
  file?: File;
}

interface LocationItem {
  id?: number;
  sequence: number;
  latitude: number;
  longitude: number;
  landsalepost_id?: number;
}

interface Province {
  id: number;
  name_th: string;
}

interface District {
  id: number;
  name_th: string;
}

interface Subdistrict {
  id: number;
  name_th: string;
}

interface Landtitle {
  id: number;
  name: string;
  rai?: number;
  ngan?: number;
  square_wa?: number;
  title_deed_number?: string;
}

interface Users {
  id: number;
  username: string;
}

interface Photoland {
  id: number;
  path: string;
  landsalepost_id: number;
  ID?: number;
  Path?: string;
  LandsalepostID?: number;
}

interface TagEntity {
  [x: string]: string;
  name: any;

  tag: string;
}

interface LandSalePost {
  [x: string]: any;
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
  location?: LocationItem[];
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
  const [editTagsModalVisible, setEditTagsModalVisible] = useState(false);
  const [editLocationsModalVisible, setEditLocationsModalVisible] = useState(false);
  const [currentEditingPost, setCurrentEditingPost] = useState<LandSalePost | null>(null);
  const [availableTags, setAvailableTags] = useState<any[]>([]); // เพิ่มบรรทัดนี้

  const [districts, setDistricts] = useState<District[]>([]); // เพิ่ม
  const [subdistricts, setSubdistricts] = useState<Subdistrict[]>([]);

  // Forms
  const [postForm] = Form.useForm();


  // Data states
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  // Loading states
  const [mapCenter, setMapCenter] = useState<[number, number]>([100.5018, 13.7563]);
  const [mapZoom, setMapZoom] = useState<number>(12);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Mapbox states
  const [mapLoading, setMapLoading] = useState(false);
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapboxLoaded, setMapboxLoaded] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  const [mapProvinceId, setMapProvinceId] = useState<number | undefined>();
  const [mapDistrictId, setMapDistrictId] = useState<number | undefined>();
  const [mapSubdistrictId, setMapSubdistrictId] = useState<number | undefined>();


  // Helper functions
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
      if (cleanPath.startsWith("iVBOR")) mimeType = "image/png";
      else if (cleanPath.startsWith("R0lGOD")) mimeType = "image/gif";
      else if (cleanPath.startsWith("/9j/") || cleanPath.startsWith("/9g/")) mimeType = "image/jpeg";
      else if (cleanPath.startsWith("UklGR")) mimeType = "image/webp";

      try {
        return `data:${mimeType};base64,${cleanPath}`;
      } catch (e) {
        console.error("Error creating data URL:", e);
      }
    }
    return cleanPath;
  };

  const getPhotoArray = (post: any): Photoland[] => {
    return post.photoland || post.Photoland || post.photos || post.Photos || [];
  };

  const getPhotoPath = (photo: any): string => {
    return photo.path || photo.Path || "";
  };

  const addressText = (post: any) => {
    // ลอง log ดูว่าข้อมูลเป็นอย่างไร
    console.log("addressText input:", post);

    // ลองหาข้อมูลที่อยู่จากหลายแหล่ง
    const subdistrict =
      post.subdistrict?.name_th ||
      post.Subdistrict?.name_th ||
      post.subdistrict?.NameTH ||
      post.Subdistrict?.NameTH;

    const district =
      post.district?.name_th ||
      post.District?.name_th ||
      post.district?.NameTH ||
      post.District?.NameTH;

    const province =
      post.province?.name_th ||
      post.Province?.name_th ||
      post.province?.NameTH ||
      post.Province?.NameTH;

    console.log("Address parts found:", { subdistrict, district, province });

    const result = [subdistrict, district, province].filter(Boolean).join(", ");
    console.log("Final address:", result);

    return result || "ไม่มีข้อมูลที่อยู่";
  };
  const loadTags = async () => {
    try {
      console.log("Starting to load tags..."); // debug
      const response = await GetTags();
      console.log("Tags response:", response); // debug

      if (Array.isArray(response)) {
        setAvailableTags(response);
        console.log("Tags loaded successfully:", response.length); // debug
      } else {
        console.error("Invalid tags response:", response);
        setAvailableTags([]);
      }
    } catch (error) {
      console.error("Error loading tags:", error);
      setAvailableTags([]);
    }
  };

  // Load initial data
  useEffect(() => {
    loadUserPosts();
    loadProvinces();
    loadMapboxScript();
    loadTags();

  }, []);

  const getLocationCoordinates = (provinceName: string, districtName?: string, subdistrictName?: string): { center: [number, number], zoom: number } => {
    // พิกัดละเอียดของอำเภอและตำบลต่างๆ
    const detailedCoordinates: Record<string, Record<string, Record<string, [number, number]>>> = {
      "กรุงเทพมหานคร": {
        "เขตบางรัก": {
          "แขวงสี่พระยา": [100.5141, 13.7221],
          "แขวงมหาพฤฒาราม": [100.5089, 13.7185],
          "แขวงบางรัก": [100.5167, 13.7251]
        },
        "เขตสาทร": {
          "แขวงสีลม": [100.5330, 13.7278],
          "แขวงสุริยวงศ์": [100.5289, 13.7245]
        }
      },
      "เชียงใหม่": {
        "อำเภอเมืองเชียงใหม่": {
          "ตำบลศรีภูมิ": [98.9817, 18.7875],
          "ตำบลพระสิงห์": [98.9853, 18.7874],
          "ตำบลช่างคลาน": [98.9956, 18.7789]
        },
        "อำเภอแม่ริม": {
          "ตำบลแม่ริม": [98.9289, 18.8756],
          "ตำบลสันโป่ง": [98.9156, 18.8634]
        }
      },
      "ขอนแก่น": {
        "อำเภอเมืองขอนแก่น": {
          "ตำบลในเมือง": [102.8431, 16.4322],
          "ตำบลศิลา": [102.8567, 16.4289]
        }
      },
      "ชลบุรี": {
        "อำเภอเมืองชลบุรี": {
          "ตำบลเสม็ด": [100.9847, 13.3611],
          "ตำบลบ้านสวน": [100.9734, 13.3756]
        },
        "อำเภอพัทยา": {
          "ตำบลหนองปรือ": [100.8767, 12.9234]
        }
      },
      "ภูเก็ต": {
        "อำเภอเมืองภูเก็ต": {
          "ตำบลตลาดใหญ่": [98.3923, 7.8804],
          "ตำบลรัษฎา": [98.3756, 7.8934]
        }
      }
      // เพิ่มจังหวัดอื่นๆ ตามต้องการ
    };

    // พิกัดประมาณของจังหวัดต่างๆ ในประเทศไทย
    const provinceCoordinates: Record<string, [number, number]> = {
      "กรุงเทพมหานคร": [100.5018, 13.7563],
      "นครราชสีมา": [102.0977, 14.9799],
      "เชียงใหม่": [98.9853, 18.7061],
      "ภูเก็ต": [98.3923, 7.8804],
      "ขอนแก่น": [102.8431, 16.4322],
      "ชลบุรี": [100.9847, 13.3611],
      "อุบลราชธานี": [104.8472, 15.2286],
      "ปราจีนบุรี": [101.3687, 14.0508],
      "สุราษฎร์ธานี": [99.3210, 9.1382],
      "สงขลา": [100.6087, 7.2056],
      // เพิ่มจังหวัดอื่นๆ ตามต้องการ
    };

    console.log("getLocationCoordinates called with:", { provinceName, districtName, subdistrictName });

    // 1. ถ้ามีตำบลและอำเภอ ให้หาใน detailedCoordinates ก่อน - zoom 16
    if (subdistrictName && districtName) {
      const normalizedProvince = provinceName.toLowerCase();
      const normalizedDistrict = districtName.toLowerCase().replace(/อำเภอ/g, '').trim();
      const normalizedSubdistrict = subdistrictName.toLowerCase().replace(/ตำบล/g, '').trim();

      for (const [province, districts] of Object.entries(detailedCoordinates)) {
        if (province.toLowerCase().includes(normalizedProvince) || normalizedProvince.includes(province.toLowerCase())) {
          for (const [district, subdistricts] of Object.entries(districts)) {
            if (district.toLowerCase().includes(normalizedDistrict) || normalizedDistrict.includes(district.toLowerCase())) {
              for (const [subdistrict, coords] of Object.entries(subdistricts)) {
                if (subdistrict.toLowerCase().includes(normalizedSubdistrict) || normalizedSubdistrict.includes(subdistrict.toLowerCase())) {
                  console.log("Found subdistrict coordinates:", coords, "zoom: 16");
                  return { center: coords, zoom: 16 };
                }
              }
            }
          }
        }
      }
    }

    // 2. ถ้ามีอำเภอแต่ไม่เจอตำบล ให้หาอำเภอ - zoom 14
    if (districtName) {
      const normalizedProvince = provinceName.toLowerCase();
      const normalizedDistrict = districtName.toLowerCase().replace(/อำเภอ/g, '').trim();

      for (const [province, districts] of Object.entries(detailedCoordinates)) {
        if (province.toLowerCase().includes(normalizedProvince) || normalizedProvince.includes(province.toLowerCase())) {
          for (const [district, subdistricts] of Object.entries(districts)) {
            if (district.toLowerCase().includes(normalizedDistrict) || normalizedDistrict.includes(district.toLowerCase())) {
              const firstSubdistrictCoords = Object.values(subdistricts)[0];
              if (firstSubdistrictCoords) {
                console.log("Found district coordinates:", firstSubdistrictCoords, "zoom: 14");
                return { center: firstSubdistrictCoords, zoom: 14 };
              }
            }
          }
        }
      }
    }

    // 3. หาพิกัดจากชื่อจังหวัด - zoom 12
    for (const [province, coords] of Object.entries(provinceCoordinates)) {
      if (province.toLowerCase().includes(provinceName.toLowerCase()) ||
        provinceName.toLowerCase().includes(province.toLowerCase())) {
        console.log("Found province coordinates:", coords, "zoom: 12");
        return { center: coords, zoom: 12 };
      }
    }

    // ถ้าไม่เจออะไรเลย ใช้พิกัดกรุงเทพเป็นค่าเริ่มต้น
    console.log("No coordinates found, using Bangkok default");
    return { center: [100.5018, 13.7563], zoom: 12 };
  };

  const loadDistricts = async (provinceId: number) => {
    try {
      const response = await GetDistrict(provinceId);
      // รองรับ response ได้หลายรูปแบบ
      const arr = Array.isArray(response)
        ? response
        : Array.isArray(response.data)
          ? response.data
          : [];
      // map ให้เป็น { id, name_th }
      const districts = arr.map((d: any) => ({
        id: d.id ?? d.ID,
        name_th: d.name_th ?? d.District ?? d.NameTH ?? d.name
      })).filter((d: { id: any; name_th: any; }) => d.id && d.name_th);
      setDistricts(districts);
    } catch (error) {
      console.error("Error loading districts:", error);
      setDistricts([]);
    }
  };

  const loadSubdistricts = async (districtId: number) => {
    try {
      const response = await GetSubdistrict(districtId);
      // รองรับ response ได้หลายรูปแบบ
      const arr = Array.isArray(response)
        ? response
        : Array.isArray(response.data)
          ? response.data
          : [];
      // map ให้เป็น { id, name_th }
      const subdistricts = arr.map((s: any) => ({
        id: s.id ?? s.ID,
        name_th: s.name_th ?? s.Subdistrict ?? s.NameTH ?? s.name
      })).filter((s: { id: any; name_th: any; }) => s.id && s.name_th);
      setSubdistricts(subdistricts);
    } catch (error) {
      console.error("Error loading subdistricts:", error);
      setSubdistricts([]);
    }
  };

  // Removed duplicate loadMapboxScript function declaration

  const loadProvinces = async () => {
    try {
      const response = await GetProvinces();
      // รองรับ response ได้หลายรูปแบบ
      const arr = Array.isArray(response)
        ? response
        : Array.isArray(response.data)
          ? response.data
          : [];
      // map ให้เป็น { id, name_th }
      const provinces = arr.map((p: any) => ({
        id: p.id ?? p.ID,
        name_th: p.name_th ?? p.Province ?? p.NameTH ?? p.name
      })).filter((p: { id: any; name_th: any; }) => p.id && p.name_th);
      setProvinces(provinces);
    } catch (error) {
      console.error("Error loading provinces:", error);
      setProvinces([]);
    }
  };

  const loadUserPosts = async () => {
     // @ts-ignore
    const wallet = localStorage.getItem("wallet") || sessionStorage.getItem("wallet");

    setLoading(true);
    setError(null);

    try {
      // Get user_id from wallet
      const userResponse = await GetUserIDByWalletAddress();

      if (!userResponse?.user_id) {
        setError("ไม่พบ user_id ที่ตรงกับ wallet กรุณาเข้าสู่ระบบใหม่");
        setLoading(false);
        return;
      }

      console.log("User ID from wallet:", userResponse.user_id);

      // Get user posts using the new API
      const postsData = await getUserPostLandData(userResponse.user_id);

      console.log("Posts data:", postsData);

      if (Array.isArray(postsData)) {
        // เพิ่ม debug ที่นี่
        console.log("=== Debug Posts Structure ===");
        postsData.forEach((post, index) => {
          console.log(`Post ${index}:`, post);
          console.log(`Post ${index} keys:`, Object.keys(post));
          console.log(`Post ${index} Province:`, post.Province || post.province);
          console.log(`Post ${index} District:`, post.District || post.district);
          console.log(`Post ${index} Subdistrict:`, post.Subdistrict || post.subdistrict);
        });

        setPosts(postsData);

      } else {
        console.error("Invalid posts data format:", postsData);
        setPosts([]);
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
  const handleEditPost = async (post: LandSalePost) => {
    const id = post.id ?? post.ID;
    const normalized = { ...post, id };

    if (!id) {
      message.error("ไม่พบ Post ID");
      return;
    }

    setCurrentEditingPost(normalized);

    // โหลด districts และ subdistricts ถ้ามี province_id และ district_id
    if (normalized.province_id) {
      await loadDistricts(normalized.province_id);

      if (normalized.district_id) {
        await loadSubdistricts(normalized.district_id);
      }
    }

    postForm.setFieldsValue({
      first_name: normalized.first_name || "",
      last_name: normalized.last_name || "",
      phone_number: normalized.phone_number || "",
      name: normalized.name || "",
      price: normalized.price || 0,
      province_id: normalized.province_id || undefined,
      district_id: normalized.district_id || undefined,
      subdistrict_id: normalized.subdistrict_id || undefined,
      land_id: normalized.land_id || undefined,
    });

    setEditPostModalVisible(true);
  };

  const handleSavePost = async () => {
    if (!currentEditingPost) {
      message.error("ไม่พบข้อมูลโพสต์ที่ต้องการแก้ไข");
      return;
    }

    try {
      setUpdateLoading(true);
      const values = await postForm.validateFields();
      const id = currentEditingPost.id ?? currentEditingPost.ID;

      if (!id) {
        message.error("ไม่พบ Post ID");
        return;
      }

      // Prepare updateData for address update (province/district/subdistrict)
      const updateData: any = {
        id,
        name: values.name,
        price: values.price,
        first_name: values.first_name,
        last_name: values.last_name,
        phone_number: values.phone_number,
        province_id: values.province_id,
        district_id: values.district_id,
        subdistrict_id: values.subdistrict_id,
        land_id: values.land_id,
        user_id: currentEditingPost.user_id
      };

      // Do not send locations unless editing locations
      // if (currentEditingPost.location) {
      //   updateData.locations = currentEditingPost.location;
      // }

      const result = await updatePost(updateData);

      if (result?.response?.ok) {
        message.success("อัพเดทโพสต์สำเร็จ");
        setEditPostModalVisible(false);
        loadUserPosts();
      } else {
        message.error(result?.result?.error || "เกิดข้อผิดพลาดในการอัพเดทโพสต์");
      }
    } catch (err: any) {
      console.error("handleSavePost error:", err);
      message.error("กรุณาตรวจสอบข้อมูลที่กรอก");
    } finally {
      setUpdateLoading(false);
    }
  };
  // @ts-ignore
  const handleProvinceChange = async (provinceId: number) => {
    setDistricts([]);
    setSubdistricts([]);
    postForm.setFieldsValue({
      district_id: undefined,
      subdistrict_id: undefined
    });

    if (provinceId) {
      await loadDistricts(provinceId);

      // ย้ายแผนที่ไปยังจังหวัดที่เลือก
      const selectedProvince = provinces.find(p => p.id === provinceId);
      if (selectedProvince && mapRef.current) {
        const coordinates = getProvinceCoordinates(selectedProvince.name_th);
        mapRef.current.setCenter(coordinates);
        mapRef.current.setZoom(10);
      }
    }
  };
// @ts-ignore
  const handleDistrictChange = async (districtId: number) => {
    setSubdistricts([]);
    postForm.setFieldsValue({
      subdistrict_id: undefined
    });

    if (districtId) {
      await loadSubdistricts(districtId);

      // ย้ายแผนที่ไปยังอำเภอที่เลือก
      const selectedDistrict = districts.find(d => d.id === districtId);
      if (selectedDistrict && mapRef.current) {
        const coordinates = getDistrictCoordinates(selectedDistrict.name_th);
        mapRef.current.setCenter(coordinates);
        mapRef.current.setZoom(12);
      }
    }
  };
// @ts-ignore
  const handleSubdistrictChange = (subdistrictId: number) => {
    if (subdistrictId) {
      // ย้ายแผนที่ไปยังตำบลที่เลือก
      const selectedSubdistrict = subdistricts.find(s => s.id === subdistrictId);
      if (selectedSubdistrict && mapRef.current) {
        const coordinates = getSubdistrictCoordinates(selectedSubdistrict.name_th);
        mapRef.current.setCenter(coordinates);
        mapRef.current.setZoom(14);
      }
    }
  };
  const getProvinceCoordinates = (provinceName: string): [number, number] => {
    const provinceCoords: { [key: string]: [number, number] } = {
      'กรุงเทพมหานคร': [100.5018, 13.7563],
      'นครราชสีมา': [102.0977, 14.9799],
      'เชียงใหม่': [98.9953, 18.7906],
      'ภูเก็ต': [98.3923, 7.8804],
      'ขอนแก่น': [102.8236, 16.4322],
      // เพิ่มจังหวัดอื่นๆ ตามต้องการ
    };

    return provinceCoords[provinceName] || [100.5018, 13.7563]; // default กรุงเทพ
  };
// @ts-ignore
  const getDistrictCoordinates = (districtName: string): [number, number] => {
    // สามารถเพิ่มพิกัดอำเภอต่างๆ หรือใช้ API geocoding
    return [100.5018, 13.7563]; // ใช้พิกัดเริ่มต้นก่อน
  };
// @ts-ignore
  const getSubdistrictCoordinates = (subdistrictName: string): [number, number] => {
    // สามารถเพิ่มพิกัดตำบลต่างๆ หรือใช้ API geocoding
    return [100.5018, 13.7563]; // ใช้พิกัดเริ่มต้นก่อน
  };

  // Photo editing handlers
  const handleEditPhotos = (post: LandSalePost) => {
    const id = post.id ?? post.ID;
    if (!id) {
      message.error("ไม่พบ Post ID");
      return;
    }

    setCurrentEditingPost(post);
    const photoArray = getPhotoArray(post);
    const existingPhotos: PhotoItem[] = photoArray.map(photo => ({
      id: photo.id || photo.ID,
      path: getPhotoPath(photo),
      isNew: false
    }));

    setPhotos(existingPhotos);
    setEditPhotoModalVisible(true);
  };

  const handleAddPhoto = () => {
    const newPhoto: PhotoItem = {
      path: "",
      isNew: true
    };
    setPhotos([...photos, newPhoto]);
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
  };



  const handleSavePhotos = async () => {
    if (!currentEditingPost) {
      message.error("ไม่พบข้อมูลโพสต์");
      return;
    }

    try {
      setUpdateLoading(true);
      const postId = currentEditingPost.id ?? currentEditingPost.ID;

      if (!postId) {
        message.error("ไม่พบ Post ID");
        return;
      }

      // Extract only valid paths
      const imagePaths = photos
        .filter(photo => photo.path && photo.path.trim() !== "")
        .map(photo => photo.path.trim());

      // Use UpdatePost API with images only
      const updateData = {
        id: postId,
        images: imagePaths,
        user_id: currentEditingPost.user_id
      };

      const result = await updatePost(updateData);

      if (result?.response?.ok) {
        message.success("อัพเดทรูปภาพสำเร็จ");
        setEditPhotoModalVisible(false);
        loadUserPosts();
      } else {
        message.error(result?.result?.error || "เกิดข้อผิดพลาดในการอัพเดทรูปภาพ");
      }
    } catch (error: any) {
      console.error("Save photos error:", error);
      message.error("เกิดข้อผิดพลาดในการบันทึกรูปภาพ");
    } finally {
      setUpdateLoading(false);
    }
  };

  // Tags editing handlers
  const handleEditTags = (post: LandSalePost) => {
    const id = post.id ?? post.ID;
    if (!id) {
      message.error("ไม่พบ Post ID");
      return;
    }

    setCurrentEditingPost(post);

    console.log("=== Edit Tags Debug ===");
    console.log("Full post object:", post);
    console.log("Post tags:", post.tags);
    console.log("Post Tags (capital):", post.Tags);
    console.log("All post keys:", Object.keys(post));

    // ลองหา tags จากหลาย field
    const tagsArray = post.tags || post.Tags || post.tag || post.Tag || [];
    console.log("Found tags array:", tagsArray);

    if (tagsArray && Array.isArray(tagsArray) && tagsArray.length > 0) {
      const currentTagIds = tagsArray.map(tag => {
        const tagId = tag.ID || tag.id;
        console.log("Processing tag:", tag, "extracted ID:", tagId);
        return Number(tagId);
      }).filter(id => !isNaN(id));

      console.log("Final current tag IDs:", currentTagIds);
      setSelectedTags(currentTagIds);
    } else {
      console.log("No tags found in post, setting empty array");
      setSelectedTags([]);
    }

    setEditTagsModalVisible(true);
  };

  const handleSaveTags = async () => {
    if (!currentEditingPost) {
      message.error("ไม่พบข้อมูลโพสต์");
      return;
    }

    try {
      setUpdateLoading(true);
      const postId = currentEditingPost.id ?? currentEditingPost.ID;

      if (!postId) {
        message.error("ไม่พบ Post ID");
        return;
      }

      // Use UpdatePost API with tag_id only
      const updateData = {
        id: postId,
        tag_id: selectedTags,
        user_id: currentEditingPost.user_id
      };

      const result = await updatePost(updateData);

      if (result?.response?.ok) {
        message.success("อัพเดทแท็กสำเร็จ");
        setEditTagsModalVisible(false);
        loadUserPosts();
      } else {
        message.error(result?.result?.error || "เกิดข้อผิดพลาดในการอัพเดทแท็ก");
      }
    } catch (error: any) {
      console.error("Save tags error:", error);
      message.error("เกิดข้อผิดพลาดในการบันทึกแท็ก");
    } finally {
      setUpdateLoading(false);
    }
  };
  useEffect(() => {
    if (editLocationsModalVisible) {
      // Force clear ทุก state ที่เกี่ยวกับ map navigation
      setTimeout(() => {
        setMapProvinceId(undefined);
        setMapDistrictId(undefined);
        setMapSubdistrictId(undefined);
        setDistricts([]);
        setSubdistricts([]);
      }, 100);
    }
  }, [editLocationsModalVisible]);
  // Locations editing handlers
 const handleEditLocations = async (post: LandSalePost) => {
  const id = post.id ?? post.ID;
  if (!id) {
    message.error("ไม่พบ Post ID");
    return;
  }

  setCurrentEditingPost(post);
  setMapLoading(true);

  // รีเซ็ต map selection states
  setMapProvinceId(undefined);
  setMapDistrictId(undefined);
  setMapSubdistrictId(undefined);
  setDistricts([]);
  setSubdistricts([]);
  setLocations([]);
  setIsDrawingMode(false);

  try {
    // ดึงข้อมูล locations เดิมจาก API
    const existingLocations = await getLocationsByLandSalePostId(id);
    console.log("Existing locations:", existingLocations);

    if (Array.isArray(existingLocations) && existingLocations.length > 0) {
      const cleanedLocations = existingLocations
        .map((loc: any) => ({
          id: loc.ID || loc.id,
          sequence: parseInt(loc.Sequence) || parseInt(loc.sequence) || 0,
          latitude: parseFloat(loc.Latitude) || parseFloat(loc.latitude) || 0,
          longitude: parseFloat(loc.Longitude) || parseFloat(loc.longitude) || 0,
          landsalepost_id: id
        }))
        .filter(loc =>
          !isNaN(loc.latitude) &&
          !isNaN(loc.longitude) &&
          loc.latitude !== 0 &&
          loc.longitude !== 0 &&
          loc.latitude >= -90 && loc.latitude <= 90 &&
          loc.longitude >= -180 && loc.longitude <= 180
        )
        .sort((a, b) => a.sequence - b.sequence);

      console.log("Cleaned locations:", cleanedLocations);
      setLocations(cleanedLocations);
    } else {
      setLocations([]);
    }

    // *** เพิ่มส่วนนี้เพื่อดึงข้อมูลจังหวัด อำเภอ ตำบล เดิม ***
    if (post.province_id) {
      console.log("Setting existing province_id:", post.province_id);
      setMapProvinceId(post.province_id);
      
      // โหลด districts ของจังหวัดเดิม
      await loadDistricts(post.province_id);
      
      if (post.district_id) {
        console.log("Setting existing district_id:", post.district_id);
        setMapDistrictId(post.district_id);
        
        // โหลด subdistricts ของอำเภอเดิม
        await loadSubdistricts(post.district_id);
        
        if (post.subdistrict_id) {
          console.log("Setting existing subdistrict_id:", post.subdistrict_id);
          setMapSubdistrictId(post.subdistrict_id);
        }
      }

      // ย้ายแผนที่ไปยังตำแหน่งเดิม
      const selectedProvince = provinces.find(p => p.id === post.province_id);
      if (selectedProvince) {
        const locationData = getLocationCoordinates(
          selectedProvince.name_th,
          post.district?.name_th,
          post.subdistrict?.name_th
        );
        console.log("Moving map to existing location:", locationData);
        setMapCenter(locationData.center);
        setMapZoom(locationData.zoom);
      }
    }

    setIsDrawingMode(false);
    setEditLocationsModalVisible(true);
  } catch (error) {
    console.error("Error loading locations:", error);
    message.error("ไม่สามารถโหลดข้อมูลตำแหน่งได้");
    setLocations([]);
    setEditLocationsModalVisible(true);
  } finally {
    setMapLoading(false);
  }
};

  // Initialize map when modal opens
  // Initialize map when modal opens และ locations state เปลี่ยน
  useEffect(() => {
    if (editLocationsModalVisible && mapboxLoaded) {
      // Delay เล็กน้อยให้ DOM render เสร็จ
      const timer = setTimeout(() => {
        if (!mapRef.current && mapContainerRef.current) {
          initializeMap();
        } else if (mapRef.current && locations.length > 0) {
          // ถ้า map มีแล้วแต่ locations เปลี่ยน ให้อัพเดท
          updateMapWithLocations(mapRef.current, locations);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [editLocationsModalVisible, mapboxLoaded, locations]);

  const loadMapboxScript = () => {
    if (window.mapboxgl) {
      setMapboxLoaded(true);
      console.log("Mapbox GL already loaded");
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
    script.onload = () => {
      setMapboxLoaded(true);
      console.log("Mapbox GL script loaded");
    };
    script.onerror = () => {
      console.error("Mapbox GL script failed to load");
    };
    document.head.appendChild(script);

    const link = document.createElement('link');
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  };
  const initializeMap = () => {
    if (!window.mapboxgl || !mapContainerRef.current) {
      console.error("Mapbox GL or container not ready");
      return;
    }

    // ล้าง map เก่าถ้ามี
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // ล้าง container
    mapContainerRef.current.innerHTML = '';

    try {
      (window as any).mapboxgl.accessToken = 'pk.eyJ1Ijoiam9oYXJ0MjU0NiIsImEiOiJjbWVmZ3YzMGcwcTByMm1zOWRkdjJkNTd0In0.DBDjy1rBDmc8A4PN3haQ4A';

      const map = new (window as any).mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: mapCenter, // เปลี่ยนจาก [100.5018, 13.7563]
        zoom: mapZoom // เปลี่ยนจาก 10
      });

      map.on('load', () => {
        console.log("Map loaded successfully");

        // เพิ่ม sources และ layers
        map.addSource('land-area', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: { type: 'Polygon', coordinates: [[]] },
            properties: {}
          }
        });

        map.addLayer({
          id: 'land-area-fill',
          type: 'fill',
          source: 'land-area',
          paint: { 'fill-color': '#ff0000', 'fill-opacity': 0.3 }
        });

        map.addLayer({
          id: 'land-area-line',
          type: 'line',
          source: 'land-area',
          paint: { 'line-color': '#ff0000', 'line-width': 3 }
        });

        map.addSource('location-points', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        });

        map.addLayer({
          id: 'location-points',
          type: 'circle',
          source: 'location-points',
          paint: {
            'circle-radius': 10,
            'circle-color': '#ff0000',
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 3
          }
        });

        map.addLayer({
          id: 'location-labels',
          type: 'symbol',
          source: 'location-points',
          layout: {
            'text-field': ['get', 'sequence'],
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 14,
            'text-anchor': 'center'
          },
          paint: {
            'text-color': '#ffffff',
            'text-halo-color': '#000000',
            'text-halo-width': 1
          }
        });

        // อัพเดท map ด้วย locations ที่มีอยู่
        if (locations.length > 0) {
          updateMapWithLocations(map, locations);
        }

        mapRef.current = map;
      });

    } catch (error) {
      console.error("Error initializing map:", error);
      message.error("ไม่สามารถโหลดแผนที่ได้");
    }
  };
  const handleMapProvinceChange = async (provinceId: number | undefined) => {
    console.log("Map Province Change Called:", provinceId);

    // Clear states
    setDistricts([]);
    setSubdistricts([]);
    setMapDistrictId(undefined);
    setMapSubdistrictId(undefined);

    // Set new province
    setMapProvinceId(provinceId);

    if (provinceId && mapRef.current) {
      await loadDistricts(provinceId);

      // หาชื่อจังหวัดและย้ายแผนที่
      const selectedProvince = provinces.find(p => p.id === provinceId);
      if (selectedProvince) {
        const locationData = getLocationCoordinates(selectedProvince.name_th);
        console.log("Moving map to province:", selectedProvince.name_th, locationData);

        // Smooth zoom out then zoom in animation
        const currentZoom = mapRef.current.getZoom();
        const targetCenter = locationData.center;
        const targetZoom = locationData.zoom;

        // Zoom out first, then move and zoom in
        mapRef.current.easeTo({
          zoom: Math.min(currentZoom - 2, 8),
          duration: 300
        });

        setTimeout(() => {
          mapRef.current.easeTo({
            center: targetCenter,
            zoom: targetZoom,
            duration: 1000
          });
        }, 350);
      }
    }
  };
  const handleMapDistrictChange = async (districtId: number | undefined) => {
    console.log("Map District Change:", districtId);

    setSubdistricts([]);
    setMapDistrictId(districtId);
    setMapSubdistrictId(undefined);

    if (districtId && mapRef.current) {
      await loadSubdistricts(districtId);

      // หาชื่อจังหวัดและอำเภอ
      const selectedProvince = provinces.find(p => p.id === mapProvinceId);
      const selectedDistrict = districts.find(d => d.id === districtId);

      if (selectedProvince && selectedDistrict) {
        const locationData = getLocationCoordinates(
          selectedProvince.name_th,
          selectedDistrict.name_th
        );
        console.log("Moving map to district:", selectedDistrict.name_th, locationData);

        // Smooth animation
        const currentZoom = mapRef.current.getZoom();

        mapRef.current.easeTo({
          zoom: Math.max(currentZoom - 1, 10),
          duration: 200
        });

        setTimeout(() => {
          mapRef.current.easeTo({
            center: locationData.center,
            zoom: locationData.zoom,
            duration: 800
          });
        }, 250);
      }
    }
  };
  const handleMapSubdistrictChange = (subdistrictId: number | undefined) => {
    console.log("Map Subdistrict Change:", subdistrictId);

    setMapSubdistrictId(subdistrictId);

    if (subdistrictId && mapRef.current) {
      // หาชื่อจังหวัด อำเภอ และตำบล
      const selectedProvince = provinces.find(p => p.id === mapProvinceId);
      const selectedDistrict = districts.find(d => d.id === mapDistrictId);
      const selectedSubdistrict = subdistricts.find(s => s.id === subdistrictId);

      if (selectedProvince && selectedDistrict && selectedSubdistrict) {
        const locationData = getLocationCoordinates(
          selectedProvince.name_th,
          selectedDistrict.name_th,
          selectedSubdistrict.name_th
        );
        console.log("Moving map to subdistrict:", selectedSubdistrict.name_th, locationData);

        // Smooth animation
        mapRef.current.easeTo({
          center: locationData.center,
          zoom: locationData.zoom,
          duration: 1000
        });
      }
    }
  };
  // จัดการ map click event แยกต่างหาก
  useEffect(() => {
    if (mapRef.current) {
      // ลบ event listener เก่าทั้งหมด
      mapRef.current.off('click');

      // เพิ่ม event listener ใหม่
      const handleMapClick = (e: any) => {
        console.log("Map clicked, drawing mode:", isDrawingMode);

        if (isDrawingMode && e.lngLat) {
          const lat = e.lngLat.lat;
          const lng = e.lngLat.lng;

          console.log("Clicked coordinates:", lat, lng);

          if (!isNaN(lat) && !isNaN(lng) &&
            lat >= -90 && lat <= 90 &&
            lng >= -180 && lng <= 180) {

            const newLocation: LocationItem = {
              sequence: locations.length + 1,
              latitude: lat,
              longitude: lng
            };

            console.log("Adding new location:", newLocation);

            // อัพเดท locations state
            setLocations(prev => {
              const updated = [...prev, newLocation];
              console.log("Updated locations:", updated);
              return updated;
            });

            message.success(`เพิ่มจุดที่ ${locations.length + 1} สำเร็จ`);
          } else {
            console.error("Invalid coordinates:", lat, lng);
            message.error("พิกัดไม่ถูกต้อง");
          }
        }
      };

      mapRef.current.on('click', handleMapClick);

      // Cleanup
      return () => {
        if (mapRef.current) {
          mapRef.current.off('click', handleMapClick);
        }
      };
    }
  }, [mapRef.current, isDrawingMode, locations.length]); // เพิ่ม dependencies ที่จำเป็น

  const updateMapWithLocations = (map: any, locationData: LocationItem[]) => {
    if (!map || !locationData || locationData.length === 0) {
      console.log("No map or location data to update");
      return;
    }

    try {
      // ตรวจสอบและกรองข้อมูล coordinates
      const validLocations = locationData.filter(loc =>
        loc &&
        !isNaN(loc.latitude) &&
        !isNaN(loc.longitude) &&
        loc.latitude >= -90 && loc.latitude <= 90 &&
        loc.longitude >= -180 && loc.longitude <= 180 &&
        loc.latitude !== 0 && loc.longitude !== 0
      );

      if (validLocations.length === 0) {
        console.log("No valid locations to display");
        return;
      }

      console.log("Updating map with valid locations:", validLocations);

      // สร้าง features สำหรับ markers
      const features = validLocations.map(loc => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [loc.longitude, loc.latitude]
        },
        properties: {
          sequence: loc.sequence.toString()
        }
      }));

      // อัพเดท points
      const pointSource = map.getSource('location-points');
      if (pointSource) {
        pointSource.setData({
          type: 'FeatureCollection',
          features
        });
      }

      // สร้าง polygon ถ้ามีจุดมากกว่า 2 จุด
      if (validLocations.length >= 3) {
        const coordinates = [
          ...validLocations.map(loc => [loc.longitude, loc.latitude]),
          [validLocations[0].longitude, validLocations[0].latitude] // ปิด polygon
        ];

        const polygonSource = map.getSource('land-area');
        if (polygonSource) {
          polygonSource.setData({
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [coordinates]
            },
            properties: {}
          });
        }
      } else {
        // ล้าง polygon ถ้ามีจุดน้อยกว่า 3 จุด
        const polygonSource = map.getSource('land-area');
        if (polygonSource) {
          polygonSource.setData({
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [[]]
            },
            properties: {}
          });
        }
      }

      // ปรับ view ให้แสดงทุกจุด
      const bounds = new (window as any).mapboxgl.LngLatBounds();
      validLocations.forEach(loc => {
        bounds.extend([loc.longitude, loc.latitude]);
      });

      if (validLocations.length === 1) {
        map.setCenter([validLocations[0].longitude, validLocations[0].latitude]);
        map.setZoom(16);
      } else {
        map.fitBounds(bounds, {
          padding: 50,
          maxZoom: 16
        });
      }

    } catch (error) {
      console.error("Error updating map with locations:", error);
      message.error("ไม่สามารถอัพเดทแผนที่ได้");
    }
  };

  const handleToggleDrawingMode = () => {
    const newDrawingMode = !isDrawingMode;
    setIsDrawingMode(newDrawingMode);

    console.log("Drawing mode changed to:", newDrawingMode);

    if (newDrawingMode) {
      message.info("โหมดวาดรูป: คลิกบนแผนที่เพื่อเพิ่มจุดใหม่");

      // เปลี่ยน cursor ของ map
      if (mapRef.current) {
        mapRef.current.getCanvas().style.cursor = 'crosshair';
      }
    } else {
      message.info("ปิดโหมดวาดรูปแล้ว");

      // เปลี่ยน cursor กลับเป็นปกติ
      if (mapRef.current) {
        mapRef.current.getCanvas().style.cursor = '';
      }
    }
  };

  const handleClearLocations = () => {
    setLocations([]);
    setIsDrawingMode(false);

    if (mapRef.current) {
      // ล้างข้อมูลทั้งหมด
      const pointSource = mapRef.current.getSource('location-points');
      if (pointSource) {
        pointSource.setData({
          type: 'FeatureCollection',
          features: []
        });
      }

      const polygonSource = mapRef.current.getSource('land-area');
      if (polygonSource) {
        polygonSource.setData({
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: [[]] },
          properties: {}
        });
      }

      // เปลี่ยน cursor กลับเป็นปกติ
      mapRef.current.getCanvas().style.cursor = '';
    }

    message.success("ล้างจุดทั้งหมดแล้ว");
  };
  // เพิ่มใน useEffect ที่โหลด provinces
  useEffect(() => {
    console.log("🌍 Provinces loaded:", provinces.length);
    provinces.forEach((p, index) => {
      console.log(`Province ${index}: ID=${p.id}, Name=${p.name_th}`);
      if (!p.id || !p.name_th) {
        console.error("❌ Invalid province data:", p);
      }
    });
  }, [provinces]);
  // อัพเดท map เมื่อ locations เปลี่ยนแปลง
  useEffect(() => {
    if (mapRef.current && editLocationsModalVisible) {
      updateMapWithLocations(mapRef.current, locations);
    }
  }, [locations, editLocationsModalVisible]);
// @ts-ignore
  const handleAddLocation = () => {
    const newLocation: LocationItem = {
      sequence: locations.length + 1,
      latitude: 0,
      longitude: 0
    };
    setLocations([...locations, newLocation]);
  };

  const handleRemoveLocation = (index: number) => {
    const newLocations = locations.filter((_, i) => i !== index);
    // Re-sequence
    const reSequenced = newLocations.map((loc, i) => ({
      ...loc,
      sequence: i + 1
    }));
    setLocations(reSequenced);
  };

  const handleLocationChange = (index: number, field: 'latitude' | 'longitude', value: number) => {
    if (isNaN(value) || value === null || value === undefined) {
      return;
    }

    const newLocations = [...locations];
    newLocations[index] = {
      ...newLocations[index],
      [field]: parseFloat(value.toString())
    };

    setLocations(newLocations);

    // อัพเดท map ถ้า coordinates ถูกต้อง
    if (mapRef.current &&
      !isNaN(newLocations[index].latitude) &&
      !isNaN(newLocations[index].longitude) &&
      newLocations[index].latitude !== 0 &&
      newLocations[index].longitude !== 0) {
      updateMapWithLocations(mapRef.current, newLocations);
    }
  };

  const handleSaveLocations = async () => {
    if (!currentEditingPost) {
      message.error("ไม่พบข้อมูลโพสต์");
      return;
    }

    try {
      setUpdateLoading(true);
      const postId = currentEditingPost.id ?? currentEditingPost.ID;

      if (!postId) {
        message.error("ไม่พบ Post ID");
        return;
      }

      // Validate locations
      const validLocations = locations.filter(loc =>
        loc.latitude !== 0 && loc.longitude !== 0 &&
        loc.latitude >= -90 && loc.latitude <= 90 &&
        loc.longitude >= -180 && loc.longitude <= 180
      );

      if (validLocations.length === 0) {
        message.error("กรุณาระบุตำแหน่งที่ถูกต้องอย่างน้อย 1 จุด");
        return;
      }

      // Remove id field from each location before sending
      const locationsForApi = validLocations.map(({ id, ...rest }) => rest);


      // Use the latest selected province/district/subdistrict from the map modal if set, otherwise fallback to currentEditingPost
      const updateData: any = {
        id: postId,
        locations: locationsForApi,
        user_id: currentEditingPost.user_id,
        province_id: mapProvinceId || currentEditingPost.province_id || currentEditingPost.province?.id,
        district_id: mapDistrictId || currentEditingPost.district_id || currentEditingPost.district?.id,
        subdistrict_id: mapSubdistrictId || currentEditingPost.subdistrict_id || currentEditingPost.subdistrict?.id,
      };

      const result = await updatePost(updateData);

      if (result?.response?.ok) {
        message.success("อัพเดทตำแหน่งสำเร็จ");
        setEditLocationsModalVisible(false);
        loadUserPosts();
      } else {
        message.error(result?.result?.error || "เกิดข้อผิดพลาดในการอัพเดทตำแหน่ง");
      }
    } catch (error: any) {
      console.error("Save locations error:", error);
      message.error("เกิดข้อผิดพลาดในการบันทึกตำแหน่ง");
    } finally {
      setUpdateLoading(false);
    }
  };

  // Delete post handler
  const handleDeletePost = async (post: LandSalePost) => {
    const postId = post.id ?? post.ID;

    if (!postId) {
      message.error("ไม่พบ Post ID");
      return;
    }

    try {
      const result = await deletePost(postId);

      if (result?.response?.ok) {
        message.success("ลบโพสต์สำเร็จ");
        loadUserPosts(); // Reload posts
      } else {
        message.error(result?.result?.error || "เกิดข้อผิดพลาดในการลบโพสต์");
      }
    } catch (error: any) {
      console.error("Delete post error:", error);
      message.error("เกิดข้อผิดพลาดในการลบโพสต์");
    }
  };



  // Render loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="regis-land-container">
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            flexDirection: 'column',
            gap: 16,
            marginTop: '72px'
          }}>
            <Spin size="large" />
            <span style={{ color: '#6F969B', fontSize: 16 }}>กำลังโหลดข้อมูล...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="regis-land-container">
        <div className="floating-shapes">
          <div className="shape-1"></div>
          <div className="shape-2"></div>
          <div className="shape-3"></div>
          <div className="shape-4"></div>
        </div>

        {/* Hero Section */}
        <div className="hero-section" style={{ marginTop: '72px' }}>
          <div className="hero-content">
            <h1 className="hero-title">
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
              <Plus size={20} style={{ marginRight: 8 }} />
              สร้างโพสต์ใหม่
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
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "#fff",
                    borderRadius: 20,
                    boxShadow: "0 2px 16px 0 rgba(0,0,0,0.07)",
                    padding: 10,
                    margin: "0 auto 24px auto",
                    width: "fit-content"
                  }}
                >
                  <button
                    className="btn-modern"
                    style={{
                      background: viewMode === "grid" ? "linear-gradient(90deg,#4fd1c5,#38b2ac)" : "#f7fafc",
                      color: viewMode === "grid" ? "#fff" : "#6F969B",
                      minWidth: 0,
                      padding: "12px 20px",
                      borderRadius: 14,
                      fontSize: 20,
                      boxShadow: viewMode === "grid" ? "0 2px 8px 0 rgba(79,209,197,0.15)" : "none",
                      marginRight: 8,
                      border: viewMode === "grid" ? "none" : "1.5px solid #e2e8f0",
                      transition: "all 0.2s"
                    }}
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 style={{ width: 24, height: 24 }} />
                  </button>
                  <button
                    className="btn-modern"
                    style={{
                      background: viewMode === "list" ? "linear-gradient(90deg,#4fd1c5,#38b2ac)" : "#f7fafc",
                      color: viewMode === "list" ? "#fff" : "#6F969B",
                      minWidth: 0,
                      padding: "12px 20px",
                      borderRadius: 14,
                      fontSize: 20,
                      boxShadow: viewMode === "list" ? "0 2px 8px 0 rgba(79,209,197,0.15)" : "none",
                      border: viewMode === "list" ? "none" : "1.5px solid #e2e8f0",
                      transition: "all 0.2s"
                    }}
                    onClick={() => setViewMode("list")}
                  >
                    <List style={{ width: 24, height: 24 }} />
                  </button>
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
                                  onError={(e) => {
                                    const imgElement = e.target as HTMLImageElement;
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
                              bottom: 16,
                              left: 16,
                              right: 16,
                              display: "flex",
                              gap: 8,
                              justifyContent: "center"
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
                                title="แก้ไขโพสต์"
                              />
                              <Button
                                type="primary"
                                shape="circle"
                                icon={<Camera size={16} />}
                                onClick={() => handleEditPhotos(post)}
                                style={{
                                  background: "rgba(255,255,255,0.9)",
                                  color: "#6F969B",
                                  border: "none",
                                  backdropFilter: "blur(10px)"
                                }}
                                title="จัดการรูปภาพ"
                              />
                              <Button
                                type="primary"
                                shape="circle"
                                icon={<Tag size={16} />}
                                onClick={() => handleEditTags(post)}
                                style={{
                                  background: "rgba(255,255,255,0.9)",
                                  color: "#6F969B",
                                  border: "none",
                                  backdropFilter: "blur(10px)"
                                }}
                                title="จัดการแท็ก"
                              />
                              <Button
                                type="primary"
                                shape="circle"
                                icon={<MapPin size={16} />}
                                onClick={() => handleEditLocations(post)}
                                style={{
                                  background: "rgba(255,255,255,0.9)",
                                  color: "#6F969B",
                                  border: "none",
                                  backdropFilter: "blur(10px)"
                                }}
                                title="จัดการตำแหน่ง"
                              />
                              <Popconfirm
                                title="ลบโพสต์"
                                description="คุณแน่ใจหรือไม่ที่จะลบโพสต์นี้?"
                                onConfirm={() => handleDeletePost(post)}
                                okText="ลบ"
                                cancelText="ยกเลิก"
                                okButtonProps={{ danger: true }}
                              >
                                <Button
                                  type="primary"
                                  shape="circle"
                                  icon={<Trash2 size={16} />}
                                  style={{
                                    background: "rgba(239,68,68,0.9)",
                                    color: "white",
                                    border: "none",
                                    backdropFilter: "blur(10px)"
                                  }}
                                  title="ลบโพสต์"
                                />
                              </Popconfirm>
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

                            {/* Contact Info */}
                            <div style={{
                              background: "#f8fafc",
                              padding: 12,
                              borderRadius: 12,
                              fontSize: 14,
                              color: "#475569"
                            }}>
                              <div><strong>ติดต่อ:</strong> {post.first_name} {post.last_name}</div>
                              {post.phone_number && <div><strong>เบอร์:</strong> {post.phone_number}</div>}
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
                                🏞️ {[
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
                                className="btn-modern"
                                style={{
                                  background: "transparent",
                                  color: "#6F969B",
                                  border: "2px solid #6F969B",
                                  minWidth: 0,
                                  padding: "12px 16px"
                                }}
                                onClick={() => handleEditPost(post)}
                              >
                                <Edit size={16} />
                              </button>
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
                                    borderRadius: 16
                                  }}
                                  onError={(e) => {
                                    const imgElement = e.target as HTMLImageElement;
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
                                    borderRadius: 16
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

                            {/* Contact Info */}
                            <div style={{ fontSize: 14, color: "#6b7280" }}>
                              ติดต่อ: {post.first_name} {post.last_name}
                              {post.phone_number && ` | ${post.phone_number}`}
                            </div>

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
                                className="btn-modern"
                                style={{
                                  background: "transparent",
                                  color: "#6F969B",
                                  border: "2px solid #6F969B",
                                  minWidth: "auto",
                                  padding: "12px 20px"
                                }}
                                onClick={() => handleEditPost(post)}
                              >
                                แก้ไข
                              </button>
                              <button
                                className="btn-modern"
                                style={{
                                  background: "transparent",
                                  color: "#6F969B",
                                  border: "2px solid #6F969B",
                                  minWidth: "auto",
                                  padding: "12px 16px"
                                }}
                                onClick={() => handleEditPhotos(post)}
                                title="จัดการรูปภาพ"
                              >
                                📷
                              </button>
                              <button
                                className="btn-modern"
                                style={{
                                  background: "transparent",
                                  color: "#6F969B",
                                  border: "2px solid #6F969B",
                                  minWidth: "auto",
                                  padding: "12px 16px"
                                }}
                                onClick={() => handleEditTags(post)}
                                title="จัดการแท็ก"
                              >
                                🏷️
                              </button>
                              <button
                                className="btn-modern"
                                style={{
                                  background: "transparent",
                                  color: "#6F969B",
                                  border: "2px solid #6F969B",
                                  minWidth: "auto",
                                  padding: "12px 16px"
                                }}
                                onClick={() => handleEditLocations(post)}
                                title="จัดการตำแหน่ง"
                              >
                                📍
                              </button>
                              <Popconfirm
                                title="ลบโพสต์"
                                description="คุณแน่ใจหรือไม่ที่จะลบโพสต์นี้?"
                                onConfirm={() => handleDeletePost(post)}
                                okText="ลบ"
                                cancelText="ยกเลิก"
                                okButtonProps={{ danger: true }}
                              >
                                <button
                                  className="btn-modern"
                                  style={{
                                    background: "transparent",
                                    color: "#dc2626",
                                    border: "2px solid #dc2626",
                                    minWidth: "auto",
                                    padding: "12px 16px"
                                  }}
                                  title="ลบโพสต์"
                                >
                                  🗑️
                                </button>
                              </Popconfirm>
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
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Edit size={20} style={{ color: "#6F969B" }} />
              <span style={{ color: "#172E25", fontWeight: 600 }}>แก้ไขโพสต์</span>
            </div>
          }

          open={editPostModalVisible}
          onCancel={() => setEditPostModalVisible(false)}
          footer={[
            <Button
              key="cancel"
              onClick={() => setEditPostModalVisible(false)}
              style={{
                borderRadius: 12,
                height: 40,
                fontWeight: 500
              }}
            >
              ยกเลิก
            </Button>,
            <Button
              key="save"
              type="primary"
              onClick={handleSavePost}
              loading={updateLoading}
              className="btn-modern"
              style={{
                borderRadius: 12,
                height: 40,
                background: "var(--gradient-primary)",
                border: "none"
              }}
            >
              บันทึก
            </Button>
          ]}
          width={600}
          style={{ borderRadius: 24 }}
        >
          <div style={{ padding: "16px 0" }}>
            <Form form={postForm} layout="vertical">
              <Form.Item
                name="first_name"
                label={<span style={{ fontWeight: 600, color: "#172E25" }}>ชื่อ</span>}
                rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}
              >
                <Input
                  placeholder="กรอกชื่อ"
                  style={{
                    borderRadius: 12,
                    height: 44,
                    border: "2px solid #e5e7eb",
                    fontSize: 16
                  }}
                />
              </Form.Item>

              <Form.Item
                name="last_name"
                label={<span style={{ fontWeight: 600, color: "#172E25" }}>นามสกุล</span>}
                rules={[{ required: true, message: "กรุณากรอกนามสกุล" }]}
              >
                <Input
                  placeholder="กรอกนามสกุล"
                  style={{
                    borderRadius: 12,
                    height: 44,
                    border: "2px solid #e5e7eb",
                    fontSize: 16
                  }}
                />
              </Form.Item>

              <Form.Item
                name="phone_number"
                label={<span style={{ fontWeight: 600, color: "#172E25" }}>เบอร์โทรศัพท์</span>}
                rules={[{ required: true, message: "กรุณากรอกเบอร์โทรศัพท์" }]}
              >
                <Input
                  placeholder="กรอกเบอร์โทรศัพท์"
                  style={{
                    borderRadius: 12,
                    height: 44,
                    border: "2px solid #e5e7eb",
                    fontSize: 16
                  }}
                />
              </Form.Item>

              <Form.Item
                name="name"
                label={<span style={{ fontWeight: 600, color: "#172E25" }}>ชื่อโพสต์</span>}
                rules={[{ required: true, message: "กรุณากรอกชื่อโพสต์" }]}
              >
                <Input
                  placeholder="กรอกชื่อโพสต์"
                  style={{
                    borderRadius: 12,
                    height: 44,
                    border: "2px solid #e5e7eb",
                    fontSize: 16
                  }}
                />
              </Form.Item>

              <Form.Item
                name="price"
                label={<span style={{ fontWeight: 600, color: "#172E25" }}>ราคา (บาท)</span>}
                rules={[{ required: true, message: "กรุณากรอกราคา" }]}
              >
                <InputNumber
                  style={{
                    width: "100%",
                    borderRadius: 12,
                    height: 44,
                    border: "2px solid #e5e7eb",
                    fontSize: 16
                  }}
                  placeholder="กรอกราคา"
                  min={0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                />
              </Form.Item>
            </Form>
          </div>
        </Modal>

        {/* Edit Photos Modal */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Camera size={20} style={{ color: "#6F969B" }} />
              <span style={{ color: "#172E25", fontWeight: 600 }}>จัดการรูปภาพ</span>
            </div>
          }
          open={editPhotoModalVisible}
          onCancel={() => setEditPhotoModalVisible(false)}
          footer={[
            <Button
              key="cancel"
              onClick={() => setEditPhotoModalVisible(false)}
              style={{
                borderRadius: 12,
                height: 40,
                fontWeight: 500
              }}
            >
              ยกเลิก
            </Button>,
            <Button
              key="save"
              type="primary"
              onClick={handleSavePhotos}
              loading={updateLoading}
              className="btn-modern"
              style={{
                borderRadius: 12,
                height: 40,
                background: "var(--gradient-primary)",
                border: "none"
              }}
            >
              บันทึก
            </Button>
          ]}
          width={800}
          style={{ borderRadius: 24 }}
        >
          <div style={{ padding: "16px 0" }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
              {photos.length === 0 && (
                <div style={{ color: '#aaa', fontStyle: 'italic' }}>ยังไม่มีรูปภาพ</div>
              )}
              {photos.map((photo, idx) => (
                <div key={idx} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  background: '#f9f9f9', borderRadius: 12, boxShadow: '0 1px 6px #0001', padding: 16, position: 'relative', minWidth: 180
                }}>
                  <img
                    src={getImageSrc(photo.path)}
                    alt={`รูปที่ ${idx + 1}`}
                    style={{ width: 140, height: 100, objectFit: 'cover', borderRadius: 8, marginBottom: 12, background: '#eee', border: '1px solid #e2e8f0' }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    style={{ marginBottom: 8 }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          const base64 = reader.result as string;
                          // อัปเดต path เป็น base64
                          const newPhotos = [...photos];
                          newPhotos[idx] = { ...newPhotos[idx], path: base64, file };
                          setPhotos(newPhotos);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <button
                    onClick={() => handleRemovePhoto(idx)}
                    style={{
                      position: 'absolute', top: 8, right: 8, background: '#fff', border: 'none', borderRadius: '50%', boxShadow: '0 1px 4px #0002', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s'
                    }}
                    title="ลบรูปนี้"
                  >
                    <span style={{ color: '#e53e3e', fontWeight: 'bold', fontSize: 18 }}>&times;</span>
                  </button>
                </div>
              ))}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <button
                  onClick={handleAddPhoto}
                  style={{
                    width: 140, height: 100, borderRadius: 8, border: '2px dashed #cbd5e1', background: '#f7fafc', color: '#6F969B', fontSize: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 12
                  }}
                  title="เพิ่มรูปภาพใหม่"
                >
                  +
                </button>
                <div style={{ color: '#6F969B', fontSize: 14 }}>เพิ่มรูป</div>
              </div>
            </div>
          </div>
        </Modal>

        {/* Edit Tags Modal */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Tag size={20} style={{ color: "#6F969B" }} />
              <span style={{ color: "#172E25", fontWeight: 600 }}>จัดการแท็ก</span>
            </div>
          }
          open={editTagsModalVisible}
          onCancel={() => setEditTagsModalVisible(false)}
          footer={[
            <Button
              key="cancel"
              onClick={() => setEditTagsModalVisible(false)}
              style={{
                borderRadius: 12,
                height: 40,
                fontWeight: 500
              }}
            >
              ยกเลิก
            </Button>,
            <Button
              key="save"
              type="primary"
              onClick={handleSaveTags}
              loading={updateLoading}
              className="btn-modern"
              style={{
                borderRadius: 12,
                height: 40,
                background: "var(--gradient-primary)",
                border: "none"
              }}
            >
              บันทึก
            </Button>
          ]}
          width={600}
          style={{ borderRadius: 24 }}
        >

          <div style={{ padding: "16px 0" }}>


            <div style={{
              background: "#f8fafc",
              padding: 16,
              borderRadius: 12,
              border: "1px solid #e5e7eb"
            }}>
              {/* แสดง tags ปัจจุบันของโพสต์ */}
              {currentEditingPost?.tags && currentEditingPost.tags.length > 0 && (
                <div style={{
                  marginBottom: 16,
                  padding: 12,
                  background: "#fff7ed",
                  borderRadius: 8,
                  border: "1px solid #fed7aa"
                }}>
                  <h5 style={{ marginBottom: 8, color: "#9a3412", fontWeight: 600 }}>
                    แท็กปัจจุบันของโพสต์:
                  </h5>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {currentEditingPost.tags.map((tag, idx) => {
                      const tagId = tag.ID || tag.id;
                      const tagName = tag.tag || tag.Tag || tag.name || tag.Name;

                      return (
                        <span
                          key={idx}
                          style={{
                            padding: "4px 8px",
                            background: "#fed7aa",
                            color: "#9a3412",
                            borderRadius: 12,
                            fontSize: 12,
                            fontWeight: 500
                          }}
                        >
                          ID: {tagId} - {tagName || "ไม่ระบุชื่อ"}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontWeight: 600, color: "#172E25", display: "block", marginBottom: 8 }}>
                  เลือกแท็กสำหรับโพสต์นี้:
                </label>
                <Select
                  mode="multiple"
                  placeholder="เลือกแท็ก"
                  value={selectedTags}
                  onChange={(values) => {
                    console.log("Select onChange:", values);
                    setSelectedTags(values);
                  }}
                  style={{
                    width: "100%",
                    minHeight: 44
                  }}
                  options={availableTags.map(tag => {
                    const tagId = Number(tag.id || tag.ID);
                    const tagName = tag.tag || tag.Tag || tag.name || tag.Name || `Tag `;

                    return {
                      label: `${tagName} `, // แสดง ID ด้วยเพื่อ debug
                      value: tagId
                    }
                  })}
                  loading={availableTags.length === 0}
                />
              </div>
              <h4 style={{ marginBottom: 12, color: "#374151", fontWeight: 600 }}>
                แท็กที่เลือกไว้:
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {selectedTags.length > 0 ? selectedTags.map(tagId => {
                  const selectedTag = availableTags.find(tag =>
                    (tag.id || tag.ID) === tagId
                  );
                  const tagLabel = selectedTag?.tag || selectedTag?.Tag || `Tag`;

                  return (
                    <span
                      key={tagId}
                      style={{
                        padding: "6px 12px",
                        background: "#e0f2fe",
                        color: "#0369a1",
                        borderRadius: 16,
                        fontSize: 14,
                        fontWeight: 500,
                        border: "1px solid #bae6fd"
                      }}
                    >
                      {tagLabel}
                    </span>
                  );
                }) : (
                  <span style={{ color: "#9ca3af", fontStyle: "italic" }}>

                  </span>
                )}


              </div>
            </div>
          </div>
        </Modal>

        {/* Edit Locations Modal */}

        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <MapPin size={20} style={{ color: "#6F969B" }} />
              <span style={{ color: "#172E25", fontWeight: 600 }}>จัดการตำแหน่ง</span>
            </div>
          }
          open={editLocationsModalVisible}
          onCancel={() => {
            console.log("🔄 Closing locations modal - clearing all states");
            setEditLocationsModalVisible(false);
            setIsDrawingMode(false);

            // Force clear ทุกอย่าง
            setMapProvinceId(undefined);
            setMapDistrictId(undefined);
            setMapSubdistrictId(undefined);
            setDistricts([]);
            setSubdistricts([]);
            setLocations([]);

            if (mapRef.current) {
              mapRef.current.remove();
              mapRef.current = null;
            }
          }}
          footer={[
            <Button
              key="cancel"
              onClick={() => {
                setEditLocationsModalVisible(false);
                setMapProvinceId(undefined);
                setMapDistrictId(undefined);
                setMapSubdistrictId(undefined);
                setDistricts([]);
                setSubdistricts([]);
                if (mapRef.current) {
                  mapRef.current.remove();
                  mapRef.current = null;
                }
              }}
              style={{
                borderRadius: 12,
                height: 40,
                fontWeight: 500
              }}
            >
              ยกเลิก
            </Button>,
            <Button
              key="save"
              type="primary"
              onClick={handleSaveLocations}
              loading={updateLoading}
              className="btn-modern"
              style={{
                borderRadius: 12,
                height: 40,
                background: "var(--gradient-primary)",
                border: "none"
              }}
            >
              บันทึก
            </Button>
          ]}
          width={1200}
          style={{ borderRadius: 24 }}
          destroyOnClose={true}
        >
          <div style={{ padding: "16px 0" }}>
            {/* Location Navigation Section */}
            <div style={{
              background: "#f0f9ff",
              padding: 20,
              borderRadius: 12,
              border: "1px solid #0ea5e9",
              marginBottom: 20
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 16
              }}>
                <MapPin style={{ color: "#0ea5e9" }} size={20} />
                <h4 style={{
                  margin: 0,
                  color: "#0c4a6e",
                  fontWeight: 600,
                  fontSize: 16
                }}>
                  🧭 ไปยังตำแหน่งที่ต้องการ
                </h4>
              </div>

              <p style={{
                margin: "0 0 16px 0",
                color: "#0c4a6e",
                fontSize: 14
              }}>
                เลือกจังหวัด อำเภอ ตำบล เพื่อให้แผนที่ไปยังพื้นที่นั้น แล้วคุณจะสามารถวาดขอบเขตที่ดินได้ง่ายขึ้น
              </p>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 16
              }}>
                {/* จังหวัด */}
                <div>
                  <label style={{
                    display: "block",
                    marginBottom: 8,
                    fontWeight: 600,
                    color: "#0c4a6e",
                    fontSize: 14
                  }}>
                    จังหวัด
                  </label>
                  {/* ใน Edit Locations Modal ไม่ใช้ Form.Item */}

                  <Select
                    placeholder="เลือกจังหวัด"
                    style={{ width: "100%", height: 40 }}
                    value={mapProvinceId}
                    onChange={handleMapProvinceChange}
                    allowClear
                    showSearch
                    key={`map-province-select-${editLocationsModalVisible}-${provinces.length}`}
                    filterOption={(input, option) => {
                      const children = option?.children as unknown as string;
                      return children?.toLowerCase().includes(input.toLowerCase()) || false;
                    }}
                  >
                    {provinces
                      .filter(p => p && p.id !== undefined && p.name_th)
                      .map(province => (
                        <Option key={`map-province-${province.id}`} value={province.id}>
                          {province.name_th}
                        </Option>
                      ))}
                  </Select>

                  {/* อำเภอ */}
                  <Select
                    placeholder="เลือกอำเภอ"
                    style={{ width: "100%", height: 40 }}
                    value={mapDistrictId}
                    onChange={handleMapDistrictChange}
                    disabled={districts.length === 0}
                    allowClear
                    showSearch
                    key={`map-district-select-${mapProvinceId || 'none'}-${districts.length}`}
                    filterOption={(input, option) => {
                      const children = option?.children as unknown as string;
                      return children?.toLowerCase().includes(input.toLowerCase()) || false;
                    }}
                  >
                    {districts
                      .filter(d => d && d.id !== undefined && d.id !== null && d.name_th)
                      .map(district => (
                        <Option key={`map-district-${String(district.id)}`} value={district.id}>
                          {district.name_th}
                        </Option>
                      ))}
                  </Select>

                  {/* ตำบล */}
                  <Select
                    placeholder="เลือกตำบล"
                    style={{ width: "100%", height: 40 }}
                    value={mapSubdistrictId}
                    onChange={handleMapSubdistrictChange}
                    disabled={subdistricts.length === 0}
                    allowClear
                    showSearch
                    key={`map-subdistrict-select-${mapDistrictId || 'none'}-${subdistricts.length}`}
                    filterOption={(input, option) => {
                      const children = option?.children as unknown as string;
                      return children?.toLowerCase().includes(input.toLowerCase()) || false;
                    }}
                  >
                    {subdistricts
                      .filter(s => s && s.id !== undefined && s.id !== null && s.name_th)
                      .map(subdistrict => (
                        <Option key={`map-subdistrict-${String(subdistrict.id)}`} value={subdistrict.id}>
                          {subdistrict.name_th}
                        </Option>
                      ))}
                  </Select>

                  {/* อำเภอ */}
                  {/* (Removed empty Select) */}

                  {/* ตำบล */}
                  {/* (Removed empty Select) */}
                </div>
              </div>

              {/* สถานะการโหลด */}
              <div style={{
                marginTop: 12,
                fontSize: 12,
                color: "#0c4a6e",
                display: "flex",
                gap: 16,
                flexWrap: "wrap"
              }}>
                {mapProvinceId && (
                  <span style={{ color: "#059669" }}>
                    ✓ เลือกจังหวัดแล้ว
                  </span>
                )}
                {districts.length > 0 && (
                  <span style={{ color: "#059669" }}>
                    ✓ โหลดอำเภอแล้ว {districts.length} อำเภอ
                  </span>
                )}
                {subdistricts.length > 0 && (
                  <span style={{ color: "#059669" }}>
                    ✓ โหลดตำบลแล้ว {subdistricts.length} ตำบล
                  </span>
                )}
              </div>
            </div>

            {/* Drawing Control Panel */}
            <div style={{
              marginBottom: 16,
              padding: 16,
              background: "#f8fafc",
              borderRadius: 12,
              border: "1px solid #e5e7eb"
            }}>
              <div style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                flexWrap: "wrap"
              }}>
                <Button
                  type={isDrawingMode ? "primary" : "default"}
                  onClick={handleToggleDrawingMode}
                  icon={<Plus />}
                  style={{
                    borderRadius: 8,
                    background: isDrawingMode ? "#10b981" : undefined
                  }}
                >
                  {isDrawingMode ? "กำลังวาด - คลิกเพื่อหยุด" : "เริ่มวาดขอบเขต"}
                </Button>

                <Button
                  type="default"
                  onClick={handleClearLocations}
                  icon={<Trash2 size={16} />}
                  danger
                  style={{ borderRadius: 8 }}
                >
                  ล้างจุดทั้งหมด
                </Button>

                <div style={{
                  fontSize: 14,
                  color: "#6b7280",
                  marginLeft: "auto"
                }}>
                  จุดทั้งหมด: {locations.length} จุด
                  {locations.length >= 3 && (
                    <span style={{ color: "#10b981", marginLeft: 8 }}>
                      ✓ สามารถสร้างขอบเขตได้
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Map Container */}
            <div style={{
              position: "relative",
              height: 450,
              borderRadius: 12,
              overflow: "hidden",
              border: "1px solid #e5e7eb",
              marginBottom: 16
            }}>
              {mapLoading ? (
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#f9fafb",
                  zIndex: 10
                }}>
                  <Spin size="large" />
                  <span style={{ marginLeft: 12, color: "#6b7280" }}>กำลังโหลดแผนที่...</span>
                </div>
              ) : null}

              <div
                ref={mapContainerRef}
                style={{
                  width: "100%",
                  height: "100%",
                  opacity: mapLoading ? 0.3 : 1
                }}
              />

              {isDrawingMode && (
                <div style={{
                  position: "absolute",
                  top: 16,
                  left: 16,
                  background: "rgba(16, 185, 129, 0.9)",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500
                }}>
                  🎯 คลิกบนแผนที่เพื่อเพิ่มจุดใหม่
                </div>
              )}
            </div>

            {/* Location List */}
            <div style={{
              background: "#f8fafc",
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              padding: 16
            }}>
              <h4 style={{
                marginBottom: 12,
                color: "#374151",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 8
              }}>
                📍 รายการจุดพิกัด
                {locations.length >= 3 && (
                  <span style={{
                    fontSize: 12,
                    background: "#ecfdf5",
                    color: "#047857",
                    padding: "2px 8px",
                    borderRadius: 12,
                    fontWeight: 500
                  }}>
                    พร้อมสร้างขอบเขต
                  </span>
                )}
              </h4>

              {locations.length > 0 ? (
                <div style={{
                  maxHeight: 200,
                  overflowY: "auto",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: 8
                }}>
                  {locations.map((location, index) => (
                    <div key={index} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: 12,
                      background: "white",
                      borderRadius: 8,
                      border: "1px solid #e5e7eb"
                    }}>
                      <div style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: "#ef4444",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 600,
                        flexShrink: 0
                      }}>
                        {location.sequence}
                      </div>

                      <div style={{ flex: 1, fontSize: 13 }}>
                        <InputNumber
                          value={location.latitude !== undefined && location.latitude !== null ? Number(location.latitude).toFixed(6) : ""}
                          min={"-90"}
                          max={"90"}
                          step={0.000001}
                          style={{ width: 120, marginRight: 8 }}
                          onChange={val => handleLocationChange(index, 'latitude', Number(val))}
                          placeholder="ละติจูด"
                        />
                        <InputNumber
                          value={location.longitude !== undefined && location.longitude !== null ? Number(location.longitude).toFixed(6) : ""}
                          min={"-180"}
                          max={"180"}
                          step={0.000001}
                          style={{ width: 120, marginRight: 8 }}
                          onChange={val => handleLocationChange(index, 'longitude', Number(val))}
                          placeholder="ลองจิจูด"
                        />
                      </div>

                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<Trash2 size={14} />}
                        onClick={() => handleRemoveLocation(index)}
                        style={{ flexShrink: 0 }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  textAlign: "center",
                  padding: 32,
                  color: "#9ca3af",
                  fontStyle: "italic"
                }}>
                  ยังไม่มีจุดพิกัด ใช้เครื่องมือนำทางข้างต้นเพื่อไปยังพื้นที่ แล้วกด "เริ่มวาดขอบเขต" เพื่อเริ่มมาร์คพื้นที่
                </div>
              )}
            </div>

            {/* Instructions */}
            <div style={{
              marginTop: 16,
              padding: 12,
              background: "#fffbeb",
              borderRadius: 12,
              border: "1px solid #fbbf24"
            }}>
              <div style={{ fontSize: 14, color: "#92400e", marginBottom: 8, fontWeight: 500 }}>
                💡 คำแนะนำในการใช้งาน:
              </div>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: "#92400e" }}>
                <li>เลือกจังหวัด อำเภอ ตำบล เพื่อให้แผนที่ไปยังพื้นที่นั้น</li>
                <li>กดปุ่ม "เริ่มวาดขอบเขต" เพื่อเข้าโหมดวาดขอบเขต</li>
                <li>คลิกบนแผนที่เพื่อเพิ่มจุดตามลำดับ</li>
                <li>ต้องมีอย่างน้อย 3 จุดเพื่อสร้างขอบเขตที่ดิน</li>
                <li>จุดจะถูกเชื่อมต่อกันตามลำดับที่คลิก</li>
                <li>สามารถลบจุดแต่ละจุดได้โดยกดปุ่มถังขยะ</li>
              </ul>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );

};

export default ManagePost;


