import React, { useState, useEffect } from 'react';
import { Tabs, Button, Input, Row, Col, Card, Badge, Table, Typography, message, Modal } from 'antd';
import { PlusOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import AddUser from './AddRequestLeave';
import UpdateRequestLeave from './UpdateRequestLeave';
import './styles.scss';
import { useDispatch, useSelector } from 'react-redux';
import { getRequestsByHospital, createRequest, updateRequest } from '../../../services/requestService';
import { clearMessage, setMessage } from '../../../redux/slices/messageSlice';

const DoctorRequestLeave = () => {
    const { Title, Text } = Typography;
    const user = useSelector((state) => state.user.user);
    console.log("user in RequestLeave:", JSON.stringify(user?.role?.id));
    const hospitalId = user?.hospitals?.[0]?.id;
    const doctorUserId = user?.id;
    const roleName = user?.role?.id === 1 ? 'Bác Sĩ' : user?.role?.id === 7 ? 'Y Tá' : 'Nhân Viên'
    const [dataSource, setDataSource] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [searchText, setSearchText] = useState('');
    const messageState = useSelector((state) => state.message);
    const [messageApi, contextHolder] = message.useMessage();
    const [flag, setFlag] = useState(false);
    const dispatch = useDispatch();

    const handleSuccess = () => {
        setFlag(flag => !flag);
        setShowAddModal(false);
        dispatch(setMessage({ type: "success", content: "Thêm đơn nghỉ phép thành công!" }));
    };

    const handleUpdateSuccess = () => {
        setFlag(flag => !flag);
        setShowUpdateModal(false);
        setEditingRecord(null);
        dispatch(setMessage({ type: "success", content: "Cập nhật đơn nghỉ phép thành công!" }));

    };

    useEffect(() => {
        if (messageState) {
            messageApi.open({
                type: messageState.type,
                content: messageState.content,
            });
            dispatch(clearMessage());
        }
    }, [dispatch, messageApi, messageState]);

    useEffect(() => {
        const fetchRequests = async () => {
            if (!hospitalId || !doctorUserId) return;
            try {
                const allRequests = await getRequestsByHospital(hospitalId, doctorUserId);

                const mappedData = allRequests.map((item) => ({
                    key: item.id.toString(),
                    fullName: item.requesterName,
                    position: 'Bác sĩ',
                    department: item.department || '',
                    startDate: item.startDate ? item.startDate.split('T')[0] : '',
                    endDate: item.endDate ? item.endDate.split('T')[0] : '',
                    status: item.status === 1 ? 'pending' : item.status === 2 ? 'approved' : item.status === 3 ? 'completed' : 'unknown',
                    rawData: item,
                }));
                setDataSource(mappedData);
            } catch (error) {
                console.error("Lỗi khi tải danh sách yêu cầu nghỉ của bác sĩ:", error);
                message.error('Lỗi khi tải danh sách yêu cầu nghỉ');
            }
        };
        fetchRequests();
    }, [hospitalId, doctorUserId, flag]);

    const filteredData = dataSource.filter((item) =>
        item.fullName.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleAddUser = () => {
        setShowAddModal(true);
    };

    const handleEdit = (record) => {
        setEditingRecord(record);
        setShowUpdateModal(true);
    };




    const mapReasonToRequestType = (reason) => {
        switch (reason) {
            case 'Nghỉ phép':
                return 1;
            case 'Nghỉ ốm':
                return 2;
            case 'Đi công tác':
                return 3;
            case 'Khác':
                return 4;
            default:
                return 4;
        }
    };

    const handleCancelRequest = async (record) => {
        Modal.confirm({
            title: 'Bạn có chắc chắn muốn hủy đơn này?',
            onOk: async () => {
                try {
                    const payload = {
                        requestId: record.rawData.id,
                        type: mapReasonToRequestType(record.rawData.reason),
                        startDate: record.rawData.startDate,
                        endDate: record.rawData.endDate,
                        reason: record.rawData.reason,
                        status: 4,
                    };
                    await updateRequest(payload);
                    dispatch(setMessage({ type: "success", content: "Hủy đơn thành công!" }));

                } catch (error) {
                    console.error("Lỗi khi hủy đơn:", error);
                    message.error('Hủy đơn thất bại');
                }
            },
        });
    };

    const columns = [
        {
            title: 'Họ và tên',
            dataIndex: 'fullName',
            key: 'fullName',
        },
        {
            title: 'Ngày bắt đầu',
            dataIndex: 'startDate',
            key: 'startDate',
        },
        {
            title: 'Ngày kết thúc',
            dataIndex: 'endDate',
            key: 'endDate',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = '';
                let text = '';

                switch (status) {
                    case 'pending':
                        color = 'gold';
                        text = 'Đang chờ';
                        break;
                    case 'approved':
                        color = 'green';
                        text = 'Đã chấp nhận';
                        break;
                    case 'completed':
                        color = 'gray';
                        text = 'Đã kết thúc';
                        break;
                    default:
                        color = 'default';
                        text = status;
                }

                return <Badge color={color} text={text} />;
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <>
                    <Button
                        type="link"
                        disabled={record.status !== 'pending'}
                        onClick={() => handleEdit(record)}
                    >
                        Sửa
                    </Button>
                    <Button
                        type="link"
                        danger
                        disabled={record.status !== 'pending'}
                        onClick={() => handleCancelRequest(record)}
                    >
                        Xoá
                    </Button>
                </>
            ),
        },
    ];

    return (
        <>
            {contextHolder}
            <div className="user-management-container">
                <Row gutter={24} style={{ marginBottom: 24, justifyContent: 'space-between' }}>
                    <Col xs={24}>
                        <Row justify="space-between" align="middle">
                            <Col>
                                <Title level={2}>
                                    <UserOutlined style={{ marginRight: 12 }} />
                                    Đơn Xin Nghỉ Phép của {roleName}
                                </Title>
                            </Col>
                            <Col>
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={handleAddUser}
                                    size="large"
                                >
                                    Tạo đơn xin nghỉ phép
                                </Button>
                            </Col>
                        </Row>
                    </Col>
                </Row>


                <Row gutter={[0, 24]}>

                    <Col span={24}>
                        <Table
                            columns={columns}
                            dataSource={filteredData}
                            pagination={{ pageSize: 5 }}
                            rowKey="key"
                            style={{ marginTop: 24 }}
                        />
                    </Col>
                </Row>

                {showAddModal && (
                    <AddUser
                        visible={showAddModal}
                        onCancel={() => setShowAddModal(false)}
                        onSuccess={handleSuccess}
                        userId={doctorUserId}
                        hospitalId={hospitalId}
                    />
                )}

                {showUpdateModal && editingRecord && (
                    <UpdateRequestLeave
                        visible={showUpdateModal}
                        onCancel={() => {
                            setShowUpdateModal(false);
                            setEditingRecord(null);
                        }}
                        onSuccess={handleUpdateSuccess}
                        initialValues={editingRecord.rawData}
                        hospitalId={hospitalId}
                        userId={doctorUserId}
                    />
                )}
            </div>
        </>

    );
};

export default DoctorRequestLeave;
