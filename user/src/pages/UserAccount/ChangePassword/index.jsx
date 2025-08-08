import { Divider, Input, Form, Col, Row, Button, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { changePassword } from "../../../services/userService";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setMessage } from "../../../redux/slices/messageSlice";
dayjs.locale("vi");
function ChangePassword() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [messageApi, contextHolder] = message.useMessage();
  const messageState = useSelector((state) => state.message)
  const handleFinish = async (values) => {
    console.log("Form values:", values);
    const payload = {
      currentPassword: values.oldPassword,
      newPassword: values.newPassword,
      confirmNewPassword: values.confirm,
    };
    const messageText = await changePassword(payload);
    console.log("Message text:", messageText);
    if (messageText === "Đổi mật khẩu thành công!") {
      console.log("Password changed successfully");
      dispatch(setMessage({ type: 'success', content: messageText }));


    } else {
      dispatch(setMessage({ type: 'error', content: messageText }));
    }
    console.log("Received values: ", payload);
  };
  return (
    <>
      {contextHolder}
      <div style={{ textAlign: "center", backgroundColor: "#fff", padding: "20px", borderRadius: "8px" }}>
        <h1
          style={{
            fontSize: "45px",
            fontFamily: "sans-serif",
            fontStyle: "normal",
            fontWeight: 700,
            color: "#00b5f1",
          }}
        >
          Tài khoản của tôi
        </h1>
        <Divider size="large" />
      </div>
      <div
        style={{
          backgroundColor: "#E8F2F7",
          borderRadius: "8px",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: "40px",
        }}
      >

        <style>
          {`
          .centered-alert {
            width: 40%;
            min-width: 1000px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .centered-alert .ant-alert {
            width: 70%;
          }
          .centered-alert .required-text {
            margin-top: 20px;
          }
        `}
        </style>
        <div className="centered-alert">

          <Divider className="divider-text" style={{ fontSize: "30px" }} >Đổi mật khẩu</Divider>

          <Form style={{ width: "100vh" }} name="createUserProfile" onFinish={handleFinish} layout="vertical" >
            <Row gutter={16} justify="center">
              <Col span={12}>
                <Form.Item
                  name="oldPassword"
                  label="Mật khẩu cũ"
                  rules={[{ required: true, message: "Vui lòng nhập mật khẩu cũ!" }]}
                >
                  <Input.Password
                    prefix={<UserOutlined />}
                    placeholder="Nhập mật khẩu cũ"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16} justify="center">
              <Col span={12}>
                <Form.Item
                  name="newPassword"
                  label="Mật khẩu mới"
                  rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới!" }]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Nhập mật khẩu mới"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16} justify="center">
            <Col span={12}>
              <Form.Item
                name="confirm"
                label="Xác nhận mật khẩu"
                dependencies={['password']}
                hasFeedback
                rules={[
                  { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Nhập lại mật khẩu"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16} justify="center">
            <Col span={4}>
              <Form.Item>
                <Button type="primary" htmlType="submit" size="large">
                  Cập nhật
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>

      </div>
    </div >
    </>
  );
}

export default ChangePassword;