// @ts-ignore
import { Link, useNavigate } from "react-router-dom";
// @ts-ignore
import Loader from "../../component/third-patry/Loader";
import Navbar from "../../component/user/Navbar";
import MapBox from "../../component/map/Mapbox";
import 'bootstrap/dist/css/bootstrap.min.css';
import './map.css';

function Map() {
  return (
    <div>
      <div className="navbar"><Navbar /></div>
      <MapBox />
      <select className="select-provinces"  multiple aria-label="multiple select example">
        <option selected>กรุณาเลือกจังหวัด</option>
        <option value="กรุงเทพ">กรุงเทพ</option>
        <option value="กรุงเทพ">กรุงเทพ</option>
        <option value="กรุงเทพ">กรุงเทพ</option>
        <option value="กรุงเทพ">กรุงเทพ</option>
      </select>
      <option selected>Open this select menu</option>
    </div>
  );
}
export default Map;