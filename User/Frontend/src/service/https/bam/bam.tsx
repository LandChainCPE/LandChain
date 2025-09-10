import axios from "axios";

const apiUrl = "http://localhost:8080";

// สร้าง instance ของ axios
const api = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// เพิ่ม Authorization header ในทุกคำขอ
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const tokenType = localStorage.getItem("token_type") || "Bearer";

    if (!config.headers) config.headers = {};

    if (token) {
      config.headers.Authorization = `${tokenType} ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// เพิ่ม response interceptor เพื่อจัดการ error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token หมดอายุหรือไม่ถูกต้อง
      localStorage.removeItem("token");
      localStorage.removeItem("token_type");
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ฟังก์ชันดึงข้อมูลผู้ใช้จาก token
export async function GetInfoUserByToken() {
  try {
    const res = await api.get("/user/info"); // axios จะใช้ header ที่ตั้งไว้ใน interceptor อัตโนมัติ
    return res.data;
  } catch (e) {
    const err = e as any;
    if (err.response) return err.response.data;
    else return { error: "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์" };
  }
}

// ฟังก์ชันอื่น ๆ ก็ใช้ axios instance นี้ได้เช่นกัน
export async function GetInfoUserByWalletID() {
  try {
    const res = await api.get(`/user/info`);
    return res.data;
  } catch (e) {
    const err = e as any;
    if (err.response) return err.response.data;
    else return { error: "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์" };
  }
}

export async function GetLandInfoByTokenID(id: string) {
  try {
    const res = await api.get(`/user/landinfo/${id}`);
    return res.data;
  } catch (e) {
    const err = e as any;
    if (err.response) return err.response.data;
    else return { error: "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์" };
  }
}

export async function GetLandTitleInfoByWallet() {
  try {
    const res = await api.get(`/user/lands`);
    return res.data;
  } catch (e) {
    const err = e as any;
    if (err.response) return err.response.data;
    else return { error: "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์" };
  }
}

export async function GetLandMetadataByToken(tokenID: string) {
  try {
    const res = await api.post("/user/lands/metadata", { tokenID });
    return res.data;
  } catch (e) {
    const err = e as any;
    if (err.response) return err.response.data;
    else return { error: "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์" };
  }
}

export async function GetRequestBuybyLandID(id: number | string) {
  try {
    const res = await api.get(`/user/lands/requestbuy/${id}`); // ✅ แทนค่า id จริง
    return res.data;
  } catch (e) {
    const err = e as any;
    if (err.response) return err.response.data;
    else return { error: "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์" };
  }
}

export async function DeleteRequestBuy(userID: number, landID: string | number) {
  try {
    const res = await api.delete(`/user/lands/delete/requestbuy`, {
      params: { userID, landID },
    });
    return res.data;
  } catch (e: any) {
    if (e.response) return e.response.data;
    return { error: "เกิดข้อผิดพลาดในการลบคำขอซื้อ" };
  }
}


/**
 * แปลงเงินบาทเป็น ETH
 * @param thb ราคาบาท
 * @returns จำนวน ETH
 */

interface CoinGeckoResponse {
  ethereum: {
    thb: number;
  };
}

export async function convertTHBtoETH(thb: number): Promise<string> {
  try {
    const res = await axios.get<CoinGeckoResponse>(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=thb"
    );

    // TypeScript รู้แล้วว่า res.data เป็น CoinGeckoResponse
    const ethPriceTHB = res.data.ethereum.thb;
    const ethAmount = thb / ethPriceTHB;

    return ethAmount.toString();
  } catch (err) {
    console.error("Failed to convert THB to ETH:", err);
    throw new Error("ไม่สามารถแปลง THB เป็น ETH ได้");
  }
}

export async function SetSellInfoHandler(tokenId: number, priceTHB: number, buyer: string) {
  try {
    const res = await api.post(`/user/lands/requestsell/sign`, {
      tokenId,
      priceTHB,
      buyer,
    });
    return res.data;
  } catch (e: any) {
    if (e.response) return e.response.data;
    return { error: "เกิดข้อผิดพลาดดำเนินการ" };
  }
}








/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/// RequsetButSell
export async function GetAllRequestSellByUserID() {
  try {
    const res = await api.get(`/user/lands/requestsell`); // ✅ แทนค่า id จริง
    return res.data;
  } catch (e) {
    const err = e as any;
    if (err.response) return err.response.data;
    else return { error: "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์" };
  }
}

export async function GetMultipleLandMetadataHandler(tokenIDs: number[]) {
  try {
    const res = await api.post("/user/lands/requestsell/metadata", { tokenIDs }); // ใช้ POST ส่ง array ไป backend
    return res.data;
  } catch (e) {
    const err = e as any;
    if (err.response) return err.response.data;
    else return { error: "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์" };
  }
}

export async function DeleteRequestSell(buyerID: number, sellerID: number, landID: string | number) {
  try {
    const res = await api.delete(`/user/lands/delete/requestsell`, {
      params: { buyerID, sellerID, landID },
    });
    return res.data;
  } catch (e: any) {
    if (e.response) return e.response.data;
    return { error: "เกิดข้อผิดพลาดในการลบคำขอซื้อ" };
  }
}

export async function GetAllRequestSellByUserIDAndDelete() {
  try {
    const res = await api.get(`/user/lands/requestsellbydelete`); // ✅ แทนค่า id จริง
    return res.data;
  } catch (e) {
    const err = e as any;
    if (err.response) return err.response.data;
    else return { error: "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์" };
  }
}



//////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
export async function CreateTransation(sellerID: number, buyerID: number, amount: number, landID: string | number) {
  try {
    const res = await api.post(`/user/lands/transation?landID=${landID}&sellerID=${sellerID}&buyerID=${buyerID}&amount=${amount}`, {
    Amount: amount,
    BuyerAccepted: true,
    SellerAccepted: false,
    MoneyChecked: true,
    LandDepartmentApproved: false
  });
    return res.data;
  } catch (e: any) {
    if (e.response) return e.response.data;
    return { error: "เกิดข้อผิดพลาดในการลบคำขอซื้อ" };
  }
}

export async function GetTransationByUserID(userId: number | string) {
  try {
    const res = await api.get(`/user/lands/get/transation/${userId}`); // ✅ แทนค่า id จริง
    return res.data;
  } catch (e) {
    const err = e as any;
    if (err.response) return err.response.data;
    else return { error: "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์" };
  }
}

export async function UpdateTransactionBuyerAccept({ sellerID, buyerID, landID }: { sellerID: string | number, buyerID: string | number, landID: string | number }) {
  try {
    const res = await api.put(
      `/user/lands/put/transation/buyerupdate?sellerID=${sellerID}&buyerID=${buyerID}&landID=${landID}`
    );
    return res.data;
  } catch (e) {
    const err = e as any;
    if (err.response) return err.response.data;
    else return { error: "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์" };
  }
}
