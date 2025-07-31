import React from "react";
import "./Loader.css";  // ไฟล์ CSS เดิมของคุณ

const Loader: React.FC = () => (
  <div className="loader-overlay">
    <div className="sk-folding-cube">
      <div className="sk-cube1 sk-cube"></div>
      <div className="sk-cube2 sk-cube"></div>
      <div className="sk-cube4 sk-cube"></div>
      <div className="sk-cube3 sk-cube"></div>
    </div>
  </div>
);

export default Loader;
