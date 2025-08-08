import { Space } from "antd";
import { Outlet } from "react-router-dom";
import loginDoctor from "../../assets/images/imgLogin.jpg";
import logo from "../../assets/images/dabs-logo.png";
const BlankLayout = () => {
  return (
     <div
            style={{
                minHeight: "100vh",
                width: "100vw",
                background: `#E8F4FD`,
                position: "relative",
                display: "flex",
                justifyContent: "start",
                alignItems: "center",
                backgroundColor: "#e0f7fa",
                flexDirection:"column"
            }}
        >
            <div>
                <img alt="logoDABS" src={logo} style={{width:150}}></img>
            </div>
            <Space direction="horizontal" size={10}>
                <div
                    style={{
                        width: 400, 
                        height: 500,
                        overflow: "hidden",
                        borderRadius: 16,
                        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                        marginRight: 0,
                        zIndex: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                    }}
                >
                    <img
                        src={loginDoctor}
                        alt="doctor"
                        style={{
                            height: 500,
                            objectFit: 'contain',
                            marginLeft:-25
                        }}
                    />
                </div>
                <Outlet /> 
            </Space>
        </div>
  
  );
};

export default BlankLayout;
