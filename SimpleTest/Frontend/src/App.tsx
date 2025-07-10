import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Name {
  id: number;
  name: string;
}

function App() {
  const [names, setNames] = useState<Name[]>([]);
  const [newName, setNewName] = useState('');
  const [responseMessage, setResponseMessage] = useState('');  // สถานะข้อความตอบกลับจาก Backend

  const API = 'https://simple-backend-production-3e57.up.railway.app';  // ใช้ URL ของ Backend บน Railway

  // ดึงข้อมูลชื่อทั้งหมดจาก Backend
  const fetchNames = async () => {
    const res = await axios.get(`${API}/names`);
    setNames(res.data);
  };

  // เพิ่มชื่อใหม่
  const addName = async () => {
    if (newName.trim()) {
      try {
        const res = await axios.post(`${API}/names`, { name: newName });
        setResponseMessage('ดำเนินการสำเร็จ');  // ตั้งข้อความตอบกลับเป็นภาษาไทย
        setNewName('');
        fetchNames();
      } catch (err) {
        setResponseMessage('เกิดข้อผิดพลาดในการเพิ่มชื่อ');
        console.error(err);
      }
    }
  };

  // ลบชื่อ
  const deleteName = async (id: number) => {
    try {
      await axios.delete(`${API}/names/${id}`);
      setResponseMessage('ดำเนินการสำเร็จ');  // ตั้งข้อความตอบกลับเป็นภาษาไทย
      fetchNames();
    } catch (err) {
      setResponseMessage('เกิดข้อผิดพลาดในการลบชื่อ');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNames();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>ระบบเพิ่ม-ลบชื่อ</h2>

      {/* แสดงข้อความตอบกลับ */}
      {responseMessage && <p style={{ color: 'green' }}>{responseMessage}</p>}

      <input
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        placeholder="กรอกชื่อ"
        style={{ padding: '6px', marginRight: '10px' }}
      />
      <button onClick={addName} style={{ padding: '6px 12px' }}>เพิ่ม</button>

      <ul style={{ listStyle: 'none', paddingLeft: 0, marginTop: '20px' }}>
        {names.map((n) => (
          <li key={n.id} style={{ marginBottom: '10px' }}>
            {n.name}
            <button
              onClick={() => deleteName(n.id)}
              style={{ marginLeft: '10px', color: 'red' }}
            >
              ลบ
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
