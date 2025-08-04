import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Logo from "../../assets/LogoLandchainBlack.png";

interface Props {
  show: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

const CreateAccountModal: React.FC<Props> = ({ show, onClose, onSubmitSuccess }) => {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [phonenumber, setPhonenumber] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (show) {
      const storedFirstname = localStorage.getItem('firstname');
      const storedLastname = localStorage.getItem('lastname');
      const storedPhonenumber = localStorage.getItem('phonenumber');
      const storedEmail = localStorage.getItem('email');

      if (storedFirstname) setFirstname(storedFirstname);
      if (storedLastname) setLastname(storedLastname);
      if (storedPhonenumber) setPhonenumber(storedPhonenumber);
      if (storedEmail) setEmail(storedEmail);
    }
  }, [show]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    localStorage.setItem('firstname', firstname);
    localStorage.setItem('lastname', lastname);
    localStorage.setItem('phonenumber', phonenumber);
    localStorage.setItem('email', email);

    console.log('บัญชีผู้ใช้ถูกสร้าง!', {
      firstname,
      lastname,
      phonenumber,
      email,
    });

    onSubmitSuccess();  // หรือ redirect ไป connect metamask
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal d-block" tabIndex={-1} role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content p-4">
          <button type="button" className="btn-close ms-auto" onClick={onClose}></button>
          <div className="d-flex justify-content-center">
            <img src={Logo} alt="LandChain Logo" style={{ width: "100%", height: "auto", maxWidth: "350px" }} />
          </div>
          <h2 className="text-center mb-4">Create Account</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">ชื่อ</label>
              <input type="text" value={firstname} onChange={(e) => setFirstname(e.target.value)} required className="form-control" />
            </div>
            <div className="mb-3">
              <label className="form-label">นามสกุล</label>
              <input type="text" value={lastname} onChange={(e) => setLastname(e.target.value)} required className="form-control" />
            </div>
            <div className="mb-3">
              <label className="form-label">เบอร์โทรศัพท์</label>
              <input type="text" value={phonenumber} onChange={(e) => setPhonenumber(e.target.value)} required className="form-control" />
            </div>
            <div className="mb-3">
              <label className="form-label">อีเมล</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="form-control" />
            </div>
            <div className="d-flex justify-content-center">
              <button type="submit" className="btn btn-primary w-50">ยืนยัน</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAccountModal;
