import {
    message, Divider, Input, Typography, Form, Col, Row, Button, DatePicker,
    ConfigProvider, Select, Avatar
} from "antd";
import { UserOutlined, CalendarOutlined, PhoneOutlined, MailOutlined } from "@ant-design/icons";
import viVN from "antd/lib/locale/vi_VN";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { updateUser } from "../../../services/userService";
import { setUser, updateUserSlice } from "../../../redux/slices/userSlice";
import { clearMessage, setMessage } from "../../../redux/slices/messageSlice";
import { getProvinces } from "../../../services/provinceService";
import { updateDoctorByDoctor } from "../../../services/doctorService";

dayjs.locale("vi");
const { Text } = Typography;

function DoctorProfile() {
    const userDefault = useSelector((state) => state.user.user || null);
    console.log("user default is : " + JSON.stringify(userDefault));
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [messageApi, contextHolder] = message.useMessage();
    const messageState = useSelector((state) => state.message);
    const [provinces, setProvinces] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [form] = Form.useForm();
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

    useEffect(() => {
        if (messageState) {
            messageApi.open({
                type: messageState.type,
                content: messageState.content,
            });
            dispatch(clearMessage());
        }
    }, [messageState, dispatch]);

    const { Option } = Select;

    const getMappedData = (formValues, reduxUser) => {
        const mapped = {};
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

        Object.keys(fieldMap).forEach((formField) => {
            let value = formValues[formField] !== undefined
                ? formValues[formField]
                : reduxUser[formField];

            if (formField === 'dob' && value) {
                mapped[fieldMap[formField]] = value.format ? value.format('YYYY-MM-DD') : value;
            } else if (formField === 'gender' && value !== undefined) {
                mapped[fieldMap[formField]] = value === "true";
            } else if (
                ['district', 'province', 'ward'].includes(formField) &&
                value !== undefined && value !== null && value !== ""
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
        try {
            console.log("map data in update profile doctor " + JSON.stringify(mappedData));
            await updateDoctorByDoctor(mappedData);
            dispatch(updateUserSlice(mappedData));
            dispatch(setMessage({ type: 'success', content: 'Cập nhật thành công!' }));
        } catch (error) {
            dispatch(setMessage({ type: 'error', content: 'Cập nhật thất bại. Vui lòng kiểm tra thông tin và thử lại!' }));
            console.error(error);
        }
    };

    const isInitializing = useSelector((state) => state.user.isInitializing);
    if (isInitializing) return <div>Loading...</div>;

    return (
        <>
            {contextHolder}
            <div
                style={{
                    minHeight: "100vh",
                    background: "#f5f7fa",
                    paddingTop: 48,
                    paddingBottom: 80,
                }}
            >
                <div
                    style={{
                        maxWidth: 900,
                        margin: "0 auto",
                        padding: 32,
                        background: "#fff",
                        borderRadius: 12,
                        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                    }}
                >
                    <div style={{ textAlign: "center", marginBottom: 32 }}>
                        <Avatar
                            size={120}
                            src={userDefault?.avatarUrl}
                            icon={<UserOutlined />}
                        />
                        <div style={{ marginTop: 16, fontSize: 20, fontWeight: 600 }}>
                            {userDefault?.fullname || "Y tá"}
                        </div>
                        <Text type="secondary" style={{ fontSize: 14 }}>
                            Avatar chỉ xem, không thể chỉnh sửa
                        </Text>
                    </div>

                    <Divider orientation="center" style={{ fontSize: 22, color: "#1890ff" }}>
                        Hồ sơ cá nhân
                    </Divider>

                    <ConfigProvider locale={viVN}>
                        <Form
                            layout="vertical"
                            onFinish={handleFinish}
                            form={form}
                            initialValues={{
                                fullname: userDefault?.fullname?.trim() || "Nguyễn Văn A",
                                phoneNumber: userDefault?.phoneNumber || "0969808505",
                                email: userDefault?.email || "lapthd2k3@gmail.com",
                                gender: userDefault?.gender !== undefined ? userDefault.gender.toString() : "true",
                                dob: userDefault?.dob ? dayjs(userDefault.dob, "YYYY-MM-DD") : null,
                                province: userDefault?.province || null,
                                ward: userDefault?.ward || null,
                                streetAddress: userDefault?.streetAddress || "",
                                cccd: userDefault?.cccd || "",
                                function: "Thạc sĩ",
                                specialty: "Bác sĩ gia đình",
                                hospitalName: "Bệnh viện Hà Đông"
                            }}
                        >
                            <Row gutter={[24, 16]}>
                                <Col xs={24} md={12}>
                                    <Form.Item name="fullname" label="Họ và tên (có dấu)">
                                        <Input prefix={<UserOutlined />} size="large" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item name="dob" label="Ngày sinh">
                                        <DatePicker
                                            style={{ width: "100%" }}
                                            format="DD/MM/YYYY"
                                            size="large"
                                            placeholder="Chọn ngày sinh"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={[24, 16]}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="phoneNumber"
                                        label="Số điện thoại"
                                        rules={[
                                            {
                                                pattern: /^0[0-9]{9}$/,
                                                message: "Số điện thoại không hợp lệ!",
                                            },
                                        ]}
                                    >
                                        <Input prefix={<PhoneOutlined />} size="large" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="email"
                                        label="Email"
                                        rules={[
                                            { type: "email", message: "Email không hợp lệ!" },
                                        ]}
                                    >
                                        <Input prefix={<MailOutlined />} size="large" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={[24, 16]}>
                                <Col xs={24} md={12}>
                                    <Form.Item name="gender" label="Giới tính">
                                        <Select size="large">
                                            <Option value="true">Nam</Option>
                                            <Option value="false">Nữ</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="cccd"
                                        label="Mã định danh/CCCD"
                                        rules={[
                                            {
                                                pattern: /^\d{12}$/,
                                                message: "CCCD phải gồm đúng 12 chữ số",
                                            },
                                        ]}
                                    >
                                        <Input size="large" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={[24, 16]}>
                                <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                    <Form.Item
                                        label="Tỉnh/Thành phố"
                                        name="province"
                                        rules={[{ required: true, message: "Vui lòng chọn tỉnh/thành phố!" }]}
                                    >

                                        <Select
                                            size="large"
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

                                <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                                    <Form.Item
                                        label="Phường/Xã"
                                        name="ward"
                                        rules={[{ required: true, message: "Vui lòng chọn phường/xã!" }]}
                                    >
                                        <Select
                                            showSearch
                                            size="large"
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
                                        <Input
                                            size="large"
                                            placeholder="Nhập số nhà, tên đường" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={[24, 16]}>
                                <Col xs={24} md={12}>
                                    <Form.Item name="function" label="Hàm vị">
                                        <Input
                                            readOnly
                                            size="large"
                                            style={{
                                                background: "#f5f5f5",
                                                color: "#999",
                                            }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item name="specialty" label="Chuyên khoa">
                                        <Input
                                            readOnly
                                            size="large"
                                            style={{
                                                background: "#f5f5f5",
                                                color: "#999",
                                            }}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item name="hospitalName" label="Bệnh viện">
                                <Input
                                    readOnly
                                    size="large"
                                    style={{ background: "#f5f5f5", color: "#999" }}
                                />
                            </Form.Item>

                            <Form.Item style={{ textAlign: "center", marginTop: 32 }}>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    size="large"
                                    style={{ width: 200 }}
                                >
                                    Cập nhật thông tin
                                </Button>
                            </Form.Item>
                        </Form>
                    </ConfigProvider>
                </div>
            </div>
        </>
    );
}

export default DoctorProfile;