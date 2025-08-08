
import { Button, ConfigProvider, Menu, Modal, Table } from "antd";
import dayjs from 'dayjs';
import viVN from 'antd/locale/vi_VN';
import { CalendarOutlined, CheckCircleFilled } from '@ant-design/icons';
import "./styles.scss";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { getHospitalDetail } from "../../../services/hospitalService";
dayjs.locale('vi');


function AppointmentService() {
    const [searchParams] = useSearchParams();
    const hospitalId = searchParams.get("hospitalId");
    const [hospital, setHospital] = useState();
    const [loadingHospital, setLoadingHospital] = useState(true);
    const [selectedServiceName, setSelectedServiceName] = useState('');
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedServiceDetail, setSelectedServiceDetail] = useState(null);
    useEffect(() => {
        const fetchApi = async () => {
            if (!hospitalId) return;
            const result = await getHospitalDetail(hospitalId);
            setHospital(result);
            setLoadingHospital(false);
        };
        fetchApi();
    }, [hospitalId]);

    const dataSource = hospital?.services?.map((s, index) => ({
        key: index + 1,
        id: s.id,
        name: s.name,
        schedule: 'Lịch khám: Thứ 2, 3, 4, 5, 6, 7, CN',
        price: s.price.toLocaleString('vi-VN') + ' đ',
    })) || [];
    const navigate = useNavigate();
    const columns = [
        {
            title: '#',
            dataIndex: 'key',
            key: 'key',
            width: 50,
            render: (text) => <span>{text}</span>,
        },
        {
            title: 'Tên dịch vụ',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div>
                    <strong>{text}</strong><br />
                    <span style={{ color: '#888', fontSize: 12 }}>{record.schedule}</span>
                </div>
            ),
        },
        {
            title: 'Giá tiền',
            dataIndex: 'price',
            key: 'price',
            width: 120,
        },
        {
            title: '',
            key: 'action',
            width: 200,
            render: (text, record) => (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                        type="default"
                        style={{ marginRight: 8, borderRadius: 6, backgroundColor: '#eaf6ff', color: '#00baff', border: 'none' }}
                        onClick={() => {
                            setSelectedServiceDetail(record);
                            setDetailModalOpen(true);
                        }}
                    >
                        Chi tiết
                    </Button>
                    <Button
                        type="primary"
                        style={{ borderRadius: 6, backgroundColor: '#00cfff', borderColor: '#00cfff' }}
                        onClick={() => navigate(`/appointment/booking?serviceId=${record.id}&serviceName=${encodeURIComponent(record.name)}&hospitalId=${hospitalId}&hospitalName=${encodeURIComponent(hospital?.name )}`)}
                    >
                        Đặt khám ngay
                    </Button>
                </div>
            ),
        },
    ];

    const items = [
        {
            key: 'center',
            label: <span style={{ fontWeight: 600 }}>{hospital?.name }</span>,

        },
        {
            key: 'date',
            label: <span style={{ color: '#00bfff', fontWeight: 600 }}>Chọn dịch vụ</span>,
        },
    ];

    return <>

        <div style={{ background: '#eaf8ff', display: "flex", flexDirection: "column" }}>
            <Menu
                mode="horizontal"
                selectedKeys={['date']}
                style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: 16,
                    boxShadow: 'none',
                    display: 'flex',
                    justifyContent: 'center',
                    marginTop: 50
                }}
                items={items}
                disabledOverflow
            />
            <ConfigProvider
                locale={viVN}
                theme={{
                    token: {
                        colorPrimary: '#00bfff',
                    },
                    components: {
                        Calendar: {
                            itemActiveBg: '#00bfff',
                            itemActiveColor: '#fff',
                        },
                    },
                }}
            >
                <div className="responsive-container"
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        marginBottom: 50,
                        gap: 32,
                        padding: 40,
                    }}>
                    <div style={{
                        background: '#fff',
                        borderRadius: 16,
                        boxShadow: '0 2px 8px #e6f4ff',
                        width: 340,
                        minWidth: 300,
                        paddingBottom: 24,
                    }}>
                        <div style={{
                            background: 'linear-gradient(90deg, #00bfff 60%, #00eaff 100%)',
                            color: '#fff',
                            borderTopLeftRadius: 16,
                            borderTopRightRadius: 16,
                            fontWeight: 600,
                            fontSize: 18,
                            padding: '16px 24px',
                        }}>
                            Thông tin cơ sở y tế
                        </div>
                        <div style={{ padding: '24px 24px 0 24px', fontSize: 15 }}>
                            <div style={{ fontWeight: 600, marginBottom: 8 }}>
                                <CheckCircleFilled style={{ color: '#00bfff', marginRight: 8 }} />
                                {hospital?.name }
                            </div>

                            <div style={{ marginBottom: 8 }}>
                                <CalendarOutlined style={{ color: '#00bfff', marginRight: 8 }} />
                                <span style={{ fontWeight: 500 }}>Dịch vụ:</span> {selectedServiceName || 'Chọn dịch vụ'}
                            </div>

                        </div>
                    </div>

                    <div style={{
                        background: '#fff',
                        borderRadius: 16,
                        boxShadow: '0 2px 8px #e6f4ff',
                        width: "auto",
                        maxWidth: 600,
                        paddingBottom: 24,
                    }}>
                        <div style={{
                            background: 'linear-gradient(90deg, #00bfff 60%, #00eaff 100%)',
                            color: '#fff',
                            borderTopLeftRadius: 16,
                            borderTopRightRadius: 16,
                            fontWeight: 600,
                            fontSize: 20,
                            padding: '16px 24px',
                            marginBottom: 0,
                        }}>
                            Vui lòng chọn dịch vụ
                        </div>

                        <Table
                            dataSource={dataSource}
                            columns={columns}
                            pagination={false}
                            rowKey="key"
                            style={{ maxHeight: 300, overflowY: 'auto', marginTop: 16, borderRadius: 8, boxShadow: '0 2px 8px #e6f4ff' }}
                            onRow={(record) => ({
                                onClick: () => {
                                    setSelectedServiceName(record.name);
                                },
                            })}
                        />

                    </div>
                </div>


            </ConfigProvider>
            <Modal
                title={<div style={{ fontWeight: 600, fontSize: 18, color: "black" }}>Chi tiết dịch vụ</div>}
                open={detailModalOpen}
                onCancel={() => setDetailModalOpen(false)}
                footer={null}
            >
                {selectedServiceDetail && (
                    <div>
                        <p><strong>Tên dịch vụ:</strong> {selectedServiceDetail.name}</p>
                        <p><strong>Lịch khám:</strong> {selectedServiceDetail.schedule}</p>
                        <p><strong>Giá:</strong> {selectedServiceDetail.price}</p>
                    </div>
                )}
            </Modal>
        </div>
    </>
}

export default AppointmentService;