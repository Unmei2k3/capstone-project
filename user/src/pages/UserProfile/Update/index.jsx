import { message, Alert, Divider, Input, Typography, Form, Col, Row, Button, DatePicker, ConfigProvider, Select } from "antd";
import { UserOutlined, CalendarOutlined, PhoneOutlined, MailOutlined } from "@ant-design/icons";
import viVN from "antd/lib/locale/vi_VN";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getProvinces } from "../../../services/provinceService";
import { useNavigate } from 'react-router-dom';
import { updateUser } from "../../../services/userService";
import { updateUserSlice } from "../../../redux/slices/userSlice";
import { clearMessage, setMessage } from "../../../redux/slices/messageSlice";

dayjs.locale("vi");
const { Text } = Typography;

function UpadteProfile() {
  const userDefault = useSelector((state) => {
    const user = state.user.user;
    return user && typeof user === 'object' ? user : null;
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [messageApi, contextHolder] = message.useMessage();
  const messageState = useSelector((state) => state.message);
  const [form] = Form.useForm();
  useEffect(() => {
    if (messageState) {
      messageApi.open({
        type: messageState.type,
        content: messageState.content,

      });
      dispatch(clearMessage());
    }
  }, [messageState, dispatch]);

  console.log("userDefault in createProfile", userDefault);
  const { Option } = Select;


  const fieldMap = {
    userName: 'userName',
    fullname: 'fullname',
    phoneNumber: 'phoneNumber',
    email: 'email',
    avatarUrl: 'avatarUrl',
    dob: 'dob',
    gender: 'gender',
    job: 'job',
    cccd: 'cccd',
    province: 'province',
    district: 'district',
    ward: 'ward',
    streetAddress: 'streetAddress'
  };

  const getMappedData = (formValues, reduxUser) => {
    const mapped = {};
    Object.keys(fieldMap).forEach((formField) => {
      let value = formValues[formField] !== undefined
        ? formValues[formField]
        : reduxUser[formField];

      if (formField === 'dob' && value) {
        mapped[fieldMap[formField]] = value.format
          ? value.format('YYYY-MM-DD')
          : value;
      } else if (formField === 'gender' && value !== undefined) {
        mapped[fieldMap[formField]] = value === "true";
      } else if (
        ['district', 'province', 'ward'].includes(formField) &&
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        mapped[fieldMap[formField]] = String(value);
      } else if (value !== undefined && value !== null && value !== "") {
        mapped[fieldMap[formField]] = value;
      }
    });

    if (reduxUser.id !== undefined) {
      mapped.id = parseInt(reduxUser.id, 10);
    }

    return mapped;
  };




  const handleFinish = async (values) => {
    if (!userDefault) {
      dispatch(setMessage({ type: 'error', content: 'Bạn phải đăng nhập để thực hiện thao tác này!' }));
      navigate('/');
      return;
    }
    const mappedData = getMappedData(values, userDefault);
    console.log("Mapped Data:", mappedData);
    try {
      const res = await updateUser(mappedData);
      console.log("Update response:", res);

      console.log("Update successful, dispatching updateUserSlice with:" + mappedData);
      dispatch(updateUserSlice(mappedData));
      dispatch(setMessage({ type: 'success', content: 'Cập nhật thành công!' }));
    } catch (error) {
      dispatch(setMessage({ type: 'error', content: 'Cập nhật thất bại. Vui lòng kiểm tra thông tin và thử lại!' }));
      console.error(error);
    }
  };

  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);

  useEffect(() => {
    getProvinces()
      .then(data => {
        console.log("Dữ liệu từ API getProvinces:", data.data);
        setProvinces(data.data);
      })
      .catch(err => {
        console.error("Error fetching provinces:", err);
      });
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      const provinceObj = provinces.find(p => p.province === selectedProvince);
      if (provinceObj && provinceObj.wards) {
        setWards(provinceObj.wards);
      } else {
        setWards([]);
      }
    } else {
      setWards([]);
    }
  }, [selectedProvince, provinces]);

  const isInitializing = useSelector((state) => state.user.isInitializing);

  if (isInitializing) {
    return <div>Loading...</div>;
  }
  return (
    <>
      {contextHolder}
      <div>
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
            Cập nhật hồ sơ
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
             max-width: 90vx;
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
            <Alert
              message="Vui lòng cung cấp thông tin chính xác để được phục vụ tốt nhất."
              type="info"
              style={{ fontSize: "15px", width: "100%", textAlign: "center" }}
            />
            <Text className="required-text" style={{ fontSize: "15px" }} type="danger">
              (*) Thông tin bắt buộc nhập
            </Text>
            <Divider orientation="left" className="divider-text" style={{ fontSize: "30px" }} >Thông tin chung</Divider>
            <ConfigProvider locale={viVN}>
              <Form style={{ width: "100%", maxWidth: 800, margin: "0 auto" }}
                form={form}
                name="createUserProfile" 
                onFinish={handleFinish} 
                layout="vertical"
                initialValues={{
                  fullname: userDefault?.fullname?.trim() || "",
                  dob: userDefault?.dob ? dayjs(userDefault.dob, "YYYY-MM-DD") : null,
                  phoneNumber: userDefault?.phoneNumber || "",
                  email: userDefault?.email || "",
                  gender: userDefault?.gender !== undefined ? userDefault.gender.toString() : "",
                  job: userDefault?.job || "",
                  province: userDefault?.province || null,
                  ward: userDefault?.ward || null,
                  streetAddress: userDefault?.streetAddress || "",
                  cccd: userDefault?.cccd || "",
                }}>
                <Row gutter={16}>
                  <Col xs={24} sm={24} md={24} lg={24} xl={12} xxl={12}>
                    <Form.Item
                      name="fullname"
                      label={<span style={{ fontSize: "17px", fontWeight: "bold" }}>Họ và tên (có dấu)</span>}
                      rules={[
                        { required: true, message: "Vui lòng nhập họ và tên!" },

                      ]}
                    >
                      <Input
                        prefix={<UserOutlined />}
                        placeholder="Ví dụ: Nguyễn Văn A"

                        size="large"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={24} xl={12} xxl={12}>
                    <Form.Item
                      name="dob"
                      label={<span style={{ fontSize: "17px", fontWeight: "bold" }}>Ngày tháng năm sinh</span>}
                      rules={[
                        { required: true, message: "Vui lòng chọn ngày tháng năm sinh!" },
                      ]}
                    >
                      <DatePicker
                        prefix={<CalendarOutlined />}
                        style={{ width: "100%" }}
                        format="DD/MM/YYYY"
                        size="large"
                        placeholder="Chọn ngày sinh"
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col xs={24} sm={24} md={24} lg={24} xl={12} xxl={12}>
                    <Form.Item
                      name="phoneNumber"
                      label={<span style={{ fontSize: "17px", fontWeight: "bold" }}>Số điện thoại</span>}
                      rules={[
                        { required: true, message: "Vui lòng nhập số điện thoại!" },
                        { pattern: /^0[0-9]{9}$/, message: "Số điện thoại không hợp lệ!" },
                      ]}
                    >
                      <Input
                        prefix={<PhoneOutlined />}
                        placeholder="Nhập số điện thoại"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={24} xl={12} xxl={12}>
                    <Form.Item
                      name="email"
                      label={<span style={{ fontSize: "17px", fontWeight: "bold" }}>Địa chỉ Email</span>}
                      rules={[
                        { message: "Vui lòng nhập email!" },
                        { type: "email", message: "Email không hợp lệ!" },
                      ]}
                    >
                      <Input
                        prefix={<MailOutlined />} placeholder="Nhập email" size="large" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col xs={24} sm={24} md={24} lg={24} xl={12} xxl={12}>
                    <Form.Item
                      name="gender"
                      label={<span style={{ fontSize: "17px", fontWeight: "bold" }}>Giới tính</span>}
                      rules={[
                        { required: true, message: "Chọn giới tính ..." },

                      ]}
                    >
                      <Select
                        placeholder="Chọn giới tính ..."
                        size="large"
                      >
                        <Option value="true">Male</Option>
                        <Option value="false">Female</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={24} xl={12} xxl={12}>
                    <Form.Item
                      name="job"
                      label={<span style={{ fontSize: "17px", fontWeight: "bold" }}>Nghề nghiệp </span>}
                    >
                      <Input
                        defaultValue={userDefault?.job || ""}
                        placeholder="Nghề nghiệp của bạn" size="large" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                    <Form.Item
                      name="cccd"
                      label={<span style={{ fontSize: "17px", fontWeight: "bold" }}>Mã định danh/CCCD</span>}
                      rules={[
                        { required: true, message: "Vui lòng nhập Mã định danh/CCCD" },
                        { pattern: /^\d{12}$/, message: "CCCD phải gồm đúng 12 chữ số" }
                      ]}
                    >
                      <Input
                        defaultValue={userDefault?.cccd || ""}
                        placeholder="Vui lòng nhập Mã định danh/CCCD" size="large" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col xs={24} sm={24} md={24} lg={8} xl={8} xxl={8}>
                    <Form.Item
                      label="Tỉnh/Thành phố"
                      name="province"
                      rules={[{ required: true, message: "Vui lòng chọn tỉnh/thành phố!" }]}
                    >
                      <Select
                        showSearch
                        placeholder="Chọn tỉnh/thành phố"
                        filterOption={(input, option) =>
                          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={provinces.map(p => ({ label: p.province, value: p.province }))}
                        onChange={(value) => {
                          setSelectedProvince(value);
                          form.setFieldsValue({ ward: undefined });
                        }}
                        allowClear
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={24} md={24} lg={8} xl={8} xxl={8}>
                    <Form.Item
                      label="Phường/Xã"
                      name="ward"
                      rules={[{ required: true, message: "Vui lòng chọn phường/xã!" }]}
                    >
                      <Select
                        showSearch
                        placeholder="Chọn phường/xã"
                        disabled={!selectedProvince}
                        options={wards.map(w => ({ label: w.name, value: w.name }))}
                        filterOption={(input, option) =>
                          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        allowClear
                      />
                    </Form.Item>
                  </Col>

                </Row>

                <Row>
                  <Col span={24}>
                    <Form.Item label="Số nhà, đường" name="streetAddress" rules={[{ required: true, message: "Vui lòng nhập số nhà và tên đường!" }]}>
                      <Input placeholder="Nhập số nhà, tên đường" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item>
                      <Button style={{ width: "100px", height: "40px", fontSize: "18px" }} type="primary" htmlType="submit" size="large">
                        Cập nhật
                      </Button>
                    </Form.Item>
                  </Col>
                </Row>

              </Form>
            </ConfigProvider>
          </div>
        </div>
      </div>
    </>

  );
}

export default UpadteProfile;