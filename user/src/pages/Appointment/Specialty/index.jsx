import { current } from "@reduxjs/toolkit";
import { Button, ConfigProvider, Descriptions, Menu, Table } from "antd";
import dayjs from 'dayjs';
import viVN from 'antd/locale/vi_VN';
import { CalendarOutlined, CheckCircleFilled } from '@ant-design/icons';
import "./styles.scss";
import { useEffect, useState } from "react";
import Search from "antd/es/transfer/search";
import { useSearchParams } from "react-router-dom";
import { getSpecializationByHospitalId } from "../../../services/specializationService";
dayjs.locale('vi');


function AppointmentSpecialty({ onNext, defaultValue, infomationValue, onBack }) {
    const [searchText, setSearchText] = useState('');
    const [searchParams] = useSearchParams();
    const hospitalId = searchParams.get("hospitalId");
    console.log("hospital in spe : " + hospitalId);
    const [specialtiesData, setspecialtiesData] = useState();
    const filteredSpecialties = specialtiesData?.filter((item) =>
        item.name?.toLowerCase().includes(searchText.toLowerCase())
    );
    useEffect(() => {
        const fetchApi = async () => {
            const result = await getSpecializationByHospitalId(hospitalId);
            setspecialtiesData(result);
            //   setLoadingHospital(false);
        };
        fetchApi();
    }, [hospitalId]);

    const columns = [
        {
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div>
                    <strong style={{ textTransform: 'uppercase' }}>{text}</strong>
                    <div style={{ fontStyle: 'italic', color: '#3b4a5a', marginTop: 4, fontSize: 12 }}>
                        {record.description}
                    </div>
                </div>
            ),
        },
    ];

    const items = [
        {
            key: 'center',
            label: <span style={{ fontWeight: 600 }}>{infomationValue.hospitalName}</span>,

        },
        {
            key: 'date',
            label: <span style={{ color: '#00bfff', fontWeight: 600 }}>Chọn chuyên khoa</span>,
        },
    ];
    const [selectedSpecialty, setSelectedSpecialty] = useState(null);
    useEffect(() => {
        if (defaultValue?.specialty) {
            setSelectedSpecialty(defaultValue.specialty);
        }
    }, [defaultValue]);
    return <>

        <div style={{ display: "flex", flexDirection: "column" }}>
            <Menu
                mode="horizontal"
                selectedKeys={[current]}
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
                        gap: 32,
                        marginBottom: 50,
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
                                {infomationValue.hospitalName}
                            </div>
                            {/* <div style={{ color: '#777', marginBottom: 16 }}>
                                <EnvironmentOutlined style={{ color: '#00bfff', marginRight: 8 }} />
                                429 Tô Hiến Thành, Phường 14, Quận 10, Thành phố Hồ Chí Minh
                            </div> */}

                            <div style={{ marginBottom: 8 }}>
                                <CalendarOutlined style={{ color: '#00bfff', marginRight: 8 }} />
                                <span style={{ fontWeight: 500 }}>Dịch vụ:</span> {infomationValue.serviceName}
                            </div>
                            <div style={{ marginBottom: 8 }}>
                                <CalendarOutlined style={{ color: '#00bfff', marginRight: 8 }} />
                                <span style={{ fontWeight: 500 }}>Chuyên khoa:</span> {selectedSpecialty?.name}
                            </div>

                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", marginBottom: 50 }}>
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
                                Vui lòng chọn chuyên khoa
                            </div>
                            <div style={{ padding: '20px 16px 0px 16px' }}>
                                <Search
                                    placeholder="Tìm kiếm theo tên chuyên khoa"
                                    onChange={e => setSearchText(e.target.value)}
                                    allowClear
                                />
                            </div>
                            <Table
                                dataSource={filteredSpecialties}
                                pagination={false}
                                rowKey="key"
                                style={{ minWidth: 600, maxHeight: 300, overflowY: 'auto', marginTop: 16, borderRadius: 8, boxShadow: '0 2px 8px #e6f4ff' }}
                                columns={columns}
                                onRow={(record) => ({
                                    onClick: () => {
                                        setSelectedSpecialty(record);
                                    },
                                    style: { cursor: 'pointer' }
                                })}

                            />

                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "0 16px", marginTop: 24 }}>
                            <Button
                                onClick={() => window.history.back()}
                                style={{
                                    borderRadius: 6,
                                    border: "1px solid #ccc",
                                    backgroundColor: "#f9f9f9"
                                }}
                            >
                                ← Quay lại
                            </Button>

                            <Button
                                type="primary"
                                disabled={!selectedSpecialty}
                                style={{
                                    borderRadius: 6,
                                    backgroundColor: '#00cfff',
                                    borderColor: '#00cfff'
                                }}
                                onClick={() => onNext({ specialty: selectedSpecialty })}
                            >
                                Tiếp tục →
                            </Button>
                        </div>
                    </div>
                </div>


            </ConfigProvider >

        </div >

    </>
}

export default AppointmentSpecialty;