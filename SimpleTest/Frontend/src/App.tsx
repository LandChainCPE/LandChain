import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Name {
  id: number;
  name: string;
}

function App() {
  const [names, setNames] = useState<Name[]>([]);
  const [newName, setNewName] = useState('');

  const API = 'http://localhost:3001';

  const fetchNames = async () => {
    const res = await axios.get(`${API}/names`);
    setNames(res.data);
  };

  const addName = async () => {
    if (newName.trim()) {
      await axios.post(`${API}/names`, { name: newName });
      setNewName('');
      fetchNames();
    }
  };

  const deleteName = async (id: number) => {
    await axios.delete(`${API}/names/${id}`);
    fetchNames();
  };

  useEffect(() => {
    fetchNames();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>ระบบเพิ่ม-ลบชื่อ</h2>
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
