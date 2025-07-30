import { Link } from "react-router-dom";
import { useState } from "react";
import { Dropdown } from "react-bootstrap";
import { FaUser } from "react-icons/fa";

const Navbar = () => {
  const [isLoggedIn] = useState(localStorage.getItem("isLogin") === "true");

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <div className="navbar-brand">LANDCHAIN</div>

      <div className="collapse navbar-collapse">
        <ul className="navbar-nav mr-auto">
          <li className="nav-item mx-2">
            <Link to="/" className="nav-link">หน้าแรก</Link>
          </li>
          <li className="nav-item mx-2">
            <Link to="/appointment" className="nav-link">นัดหมายกรมที่ดิน</Link>
          </li>
          <li className="nav-item mx-2">
            <Link to="/news" className="nav-link">ข่าวสาร</Link>
          </li>
        </ul>

        {isLoggedIn && (
          <Dropdown align="end">
            <Dropdown.Toggle variant="secondary" id="dropdown-basic">
              <FaUser />
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item as={Link} to="/user/manage">จัดการข้อมูล</Dropdown.Item>
              <Dropdown.Item as={Link} to="/user/regisland">ลงทะเบียนโฉนดที่ดิน</Dropdown.Item>
              <Dropdown.Item as={Link} to="/user/history">ประวัติ/สถานะ ธุรกรรม</Dropdown.Item>
              <Dropdown.Item as={Link} to="/logout">ออกจากระบบ</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
