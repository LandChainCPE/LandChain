import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Logo from "../../assets/LogoLandchainBlack.png";
import { useNavigate } from 'react-router-dom';




const CreateAccount = () => {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [phonenumber, setPhonenumber] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  // เมื่อโหลดหน้าแรกให้ดึงข้อมูลจาก localStorage (ถ้ามี)
  React.useEffect(() => {
    const storedFirstname = localStorage.getItem('firstname');
    const storedLastname = localStorage.getItem('lastname');
    const storedPhonenumber = localStorage.getItem('phonenumber');
    const storedEmail = localStorage.getItem('email');

    if (storedFirstname) setFirstname(storedFirstname);
    if (storedLastname) setLastname(storedLastname);
    if (storedPhonenumber) setPhonenumber(storedPhonenumber);
    if (storedEmail) setEmail(storedEmail);
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    // เก็บข้อมูลใน localStorage
    localStorage.setItem('firstname', firstname);
    localStorage.setItem('lastname', lastname);
    localStorage.setItem('phonenumber', phonenumber);
    localStorage.setItem('email', email);

    // แสดงข้อมูลใน console
    console.log('บัญชีผู้ใช้ถูกสร้าง!', {
      firstname,
      lastname,
      phonenumber,
      email,
    });
    navigate('/createaccount/connectmetamask');
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="bg-white p-4 shadow-sm rounded" style={{ maxWidth: '500px', width: '100%' }}>
        <img src={Logo} alt="LandChain Logo" style={{ width: "100%",height: "auto",maxWidth: "500px" }} />
        <h2 className="text-center mb-4">Create Account </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="firstname" className="form-label">ชื่อ</label>
            <input
              type="text"
              id="firstname"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              required
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="lastname" className="form-label">นามสกุล</label>
            <input
              type="text"
              id="lastname"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              required
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="phonenumber" className="form-label">เบอร์โทรศัพท์</label>
            <input
              type="text"
              id="phonenumber"
              value={phonenumber}
              onChange={(e) => setPhonenumber(e.target.value)}
              required
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">อีเมล</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-control"
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">ยืนยัน</button>
        </form>
      </div>
    </div>
  );
};

export default CreateAccount;
