import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from 'react-bootstrap';
import Logo from "../../assets/LogoLandchainBlack.png";
import { useNavigate } from 'react-router-dom';
import './CreateAccount.css';

const CreateAccount = () => {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [phonenumber, setPhonenumber] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    const storedFirstname = localStorage.getItem('firstname');
    const storedLastname = localStorage.getItem('lastname');
    const storedPhonenumber = localStorage.getItem('phonenumber');
    const storedEmail = localStorage.getItem('email');
    const storedUserID = localStorage.getItem('user_id');

    if (storedFirstname) setFirstname(storedFirstname);
    if (storedLastname) setLastname(storedLastname);
    if (storedPhonenumber) setPhonenumber(storedPhonenumber);
    if (storedEmail) setEmail(storedEmail);
    // if (storedUserID) localStorage.setItem('user_id', storedUserID);
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // localStorage.setItem('firstname', firstname);
    // localStorage.setItem('lastname', lastname);
    // localStorage.setItem('phonenumber', phonenumber);
    // localStorage.setItem('email', email);
    // localStorage.setItem('user_id', localStorage.getItem('user_id') || '');

    console.log('Account created!', { firstname, lastname, phonenumber, email });
    navigate('/connectmetamask');
  };

  return (
    <div className="create-account-container">
      <div className="floating-shapes">
        <div className="shape-1"></div>
        <div className="shape-2"></div>
        <div className="shape-3"></div>
        <div className="shape-4"></div>
      </div>

      <Container className="main-container">
        <div className="form-section">
          <div className="glass-card">
            <div className="card-glow"></div>
            <div className="form-card-body">
              <div className="form-header">
                <img src={Logo} alt="LandChain Logo" className="logo" />
                <h4>สร้างบัญชีผู้ใช้</h4>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
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
                  <div className="col-md-6 mb-3">
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
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
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
                  <div className="col-md-6 mb-3">
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
                </div>
                <button type="submit" className="btn btn-primary w-100">
                  <div className="btn-content">
                    <span>ยืนยัน</span>
                    <div className="btn-arrow">→</div>
                  </div>
                </button>
              </form>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default CreateAccount;
