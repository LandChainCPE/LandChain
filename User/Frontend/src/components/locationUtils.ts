// พิกัดละเอียดของอำเภอและตำบลต่างๆ
export const detailedCoordinates: Record<string, Record<string, Record<string, [number, number]>>> = {
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
  },
  "อุบลราชธานี": {
    "อำเภอเมืองอุบลราชธานี": {
      "ตำบลในเมือง": [104.8472, 15.2286],
      "ตำบลแจระแม": [104.8567, 15.2289]
    },
    "อำเภอตระการพืชผล": {
      "ตำบลขุหลุ": [104.2817, 15.3206],
      "ตำบลตระการพืชผล": [104.2956, 15.3134]
    }
  },
  "ปราจีนบุรี": {
    "กบินทร์บุรี": {
      "กบินทร์": [101.721485252, 13.9922231707],
      "ตำบลแจระแม": [104.8567, 15.2289]
    }
  },
};

// พิกัดประมาณของจังหวัดต่างๆ ในประเทศไทย (สำหรับ fallback)
export const provinceCoordinates: Record<string, [number, number]> = {
  "กรุงเทพมหานคร": [100.5018, 13.7563],
  "กรุงเทพฯ": [100.5018, 13.7563],
  "นนทบุรี": [100.5144, 13.8621],
  "ปทุมธานี": [100.5249, 14.0208],
  "สมุทรปราการ": [100.5988, 13.5991],
  "สมุทรสาคร": [100.2737, 13.5472],
  "สมุทรสงคราม": [100.0024, 13.4106],
  "เชียงใหม่": [98.9853, 18.7061],
  "เชียงราย": [99.8325, 19.9105],
  "แม่ฮ่องสอน": [97.9659, 19.3014],
  "ลำปาง": [99.4871, 18.2741],
  "ลำพูน": [99.0016, 18.5745],
  "อุตรดิตถ์": [100.0992, 17.6302],
  "แพร่": [100.1405, 18.1447],
  "น่าน": [100.7734, 18.7838],
  "พะเยา": [99.8989, 19.1921],
  "ขอนแก่น": [102.8431, 16.4322],
  "อุดรธานี": [102.8156, 17.4065],
  "อุบลราชธานี": [104.8472, 15.2286],
  "เลย": [101.7223, 17.4860],
  "หนองคาย": [102.7417, 17.8782],
  "มหาสารคาม": [103.3020, 16.1851],
  "ร้อยเอ็ด": [103.6531, 16.0544],
  "กาฬสินธุ์": [103.5052, 16.4322],
  "สกลนคร": [104.1482, 17.1547],
  "นครพนม": [104.7718, 17.4065],
  "มุกดาหาร": [104.7223, 16.5429],
  "ยโสธร": [104.1447, 15.7921],
  "อำนาจเจริญ": [104.6259, 15.8650],
  "นครราชสีมา": [102.0977, 14.9799],
  "บุรีรัมย์": [103.1029, 14.9930],
  "สุรินทร์": [103.4938, 14.8825],
  "ศีขรภูมิ": [104.0556, 15.1851],
  "ชัยภูมิ": [102.0310, 15.8065],
  "นครสวรรค์": [100.1372, 15.6957],
  "อุทัยธานี": [100.0244, 15.3794],
  "กำแพงเพชร": [99.5226, 16.4827],
  "ตาก": [99.1265, 16.8697],
  "สุโขทัย": [99.7372, 17.0061],
  "พิษณุโลก": [100.2649, 16.8211],
  "พิจิตร": [100.3488, 16.4373],
  "เพชรบูรณ์": [101.1560, 16.4193],
  "ราชบุรี": [99.8135, 13.5282],
  "กาญจนบุรี": [99.5329, 14.0227],
  "สุพรรณบุรี": [100.1217, 14.4744],
  "นครปฐม": [100.0607, 13.8199],
  "สระบุรี": [100.9104, 14.5289],
  "ลพบุรี": [100.6534, 14.7995],
  "สิงห์บุรี": [100.3975, 14.8938],
  "อ่างทอง": [100.4549, 14.5896],
  "พระนครศรีอยุธยา": [100.5692, 14.3532],
  "อยุธยา": [100.5692, 14.3532],
  "ชลบุรี": [100.9847, 13.3611],
  "ระยอง": [101.2538, 12.6868],
  "จันทบุรี": [102.1038, 12.6103],
  "ตราด": [102.5150, 12.2436],
  "ฉะเชิงเทรา": [101.0777, 13.6904],
  "ปราจีนบุรี": [101.3687, 14.0508],
  "นครนายก": [101.2130, 14.2069],
  "สระแก้ว": [102.0645, 13.8241],
  "เพชรบุรี": [99.9397, 13.1110],
  "ประจวบคีรีขันธ์": [99.7971, 11.8104],
  "นครศรีธรรมราช": [99.9631, 8.4304],
  "กระบี่": [99.0731, 8.0863],
  "พังงา": [98.5350, 8.4504],
  "ภูเก็ต": [98.3923, 7.8804],
  "สุราษฎร์ธานี": [99.3210, 9.1382],
  "ระนอง": [98.6047, 9.9539],
  "ชุมพร": [99.1797, 10.4930],
  "สงขลา": [100.6087, 7.2056],
  "สตูล": [99.6114, 6.6238],
  "ตรัง": [99.6114, 7.5563],
  "พัทลุง": [100.0745, 7.6161],
  "ปัตตานี": [101.2463, 6.8693],
  "ยะลา": [101.2804, 6.5397],
  "นราธิวาส": [101.8253, 6.4254]
};

/**
 * ฟังก์ชันสำหรับคำนวณพิกัดและ zoom level จากชื่อพื้นที่ (ประมาณการ)
 * @param provinceName ชื่อจังหวัด
 * @param districtName ชื่ออำเภอ (optional)
 * @param subdistrictName ชื่อตำบล (optional)
 * @returns พิกัดและ zoom level
 */
export function getLocationCoordinates(
  provinceName: string, 
  districtName?: string, 
  subdistrictName?: string
): { center: [number, number], zoom: number } {
  console.log("🔍 getLocationCoordinates called with:", { provinceName, districtName, subdistrictName });

  // ลำดับการค้นหา: ตำบล -> อำเภอ -> จังหวัด
  
  // 1. ถ้ามีตำบลและอำเภอ ให้หาใน detailedCoordinates ก่อน - zoom 16
  if (subdistrictName && districtName) {
    const normalizedProvince = provinceName.toLowerCase();
    const normalizedDistrict = districtName.toLowerCase().replace(/อำเภอ/g, '').trim();
    const normalizedSubdistrict = subdistrictName.toLowerCase().replace(/ตำบล/g, '').trim();
    
    console.log("🔍 Searching for subdistrict:", { normalizedProvince, normalizedDistrict, normalizedSubdistrict });
    
    for (const [province, districts] of Object.entries(detailedCoordinates)) {
      if (province.toLowerCase().includes(normalizedProvince) || normalizedProvince.includes(province.toLowerCase())) {
        for (const [district, subdistricts] of Object.entries(districts)) {
          if (district.toLowerCase().includes(normalizedDistrict) || normalizedDistrict.includes(district.toLowerCase())) {
            for (const [subdistrict, coords] of Object.entries(subdistricts)) {
              if (subdistrict.toLowerCase().includes(normalizedSubdistrict) || normalizedSubdistrict.includes(subdistrict.toLowerCase())) {
                console.log("✅ Found subdistrict coordinates:", coords, "zoom: 16");
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
    
    console.log("🔍 Searching for district:", { normalizedProvince, normalizedDistrict });
    
    for (const [province, districts] of Object.entries(detailedCoordinates)) {
      if (province.toLowerCase().includes(normalizedProvince) || normalizedProvince.includes(province.toLowerCase())) {
        for (const [district, subdistricts] of Object.entries(districts)) {
          if (district.toLowerCase().includes(normalizedDistrict) || normalizedDistrict.includes(district.toLowerCase())) {
            // ใช้พิกัดของตำบลแรกในอำเภอนั้น
            const firstSubdistrictCoords = Object.values(subdistricts)[0];
            if (firstSubdistrictCoords) {
              console.log("✅ Found district coordinates:", firstSubdistrictCoords, "zoom: 14");
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
      console.log("✅ Found province coordinates:", coords, "zoom: 12");
      return { center: coords, zoom: 12 };
    }
  }

  // ถ้าไม่เจออะไรเลย ใช้พิกัดกรุงเทพเป็นค่าเริ่มต้น
  console.log("⚠️ No coordinates found, using Bangkok default");
  return { center: [100.5018, 13.7563], zoom: 12 };
}