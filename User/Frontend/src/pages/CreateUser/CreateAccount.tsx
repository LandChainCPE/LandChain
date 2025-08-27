import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
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
    if (storedUserID) localStorage.setItem('user_id', storedUserID);
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    localStorage.setItem('firstname', firstname);
    localStorage.setItem('lastname', lastname);
    localStorage.setItem('phonenumber', phonenumber);
    localStorage.setItem('email', email);
    localStorage.setItem('user_id', localStorage.getItem('user_id') || '');

    console.log('Account created!', { firstname, lastname, phonenumber, email });
    navigate('/connectmetamask');
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card-container">
        <img src={Logo} alt="LandChain Logo" className="logo" />
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="firstname" className="form-label">First Name</label>
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
              <label htmlFor="lastname" className="form-label">Last Name</label>
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
              <label htmlFor="phonenumber" className="form-label">Phone Number</label>
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
              <label htmlFor="email" className="form-label">Email</label>
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
          <button type="submit" className="btn btn-primary w-100">Confirm</button>
        </form>
      </div>
    </div>
  );
};

export default CreateAccount;
