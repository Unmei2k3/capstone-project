import { Space } from "antd";
import { Outlet } from "react-router-dom";
import loginBg from "../../assets/images/login-bgr.png";
import loginDoctor from "../../assets/images/doctor-login.png";
const BlankLayout = () => {
  return (
     <div
            style={{
                minHeight: "100vh",
                width: "100vw",
                background: `#E8F4FD`,
                position: "relative",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#e0f7fa",
            }}
        >

                <Outlet /> 
        
        </div>
  
  );
};

export default BlankLayout;
