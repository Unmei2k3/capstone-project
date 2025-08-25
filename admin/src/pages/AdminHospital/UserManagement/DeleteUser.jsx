import React, { useState } from 'react';
import { Modal, Typography, Button, Spin, notification } from 'antd';
import { ExclamationCircleOutlined, UserDeleteOutlined } from '@ant-design/icons';
import { deleteUser } from '../../../services/userService';

const { Text, Paragraph } = Typography;

const DeleteUser = ({ visible, record, onCancel, onSuccess }) => {
    const [spinning, setSpinning] = useState(false);

    const success = () => {
        notification.success({
            message: 'Thành công',
            description: `Đã xóa người dùng "${record?.firstName} ${record?.lastName}" thành công!`,
            placement: 'topRight',
            duration: 3
        });
    };

    const error = (errorMessage) => {
        notification.error({
            message: 'Lỗi',
            description: errorMessage || 'Không thể xóa người dùng. Vui lòng thử lại.',
            placement: 'topRight',
            duration: 5
        });
    };

    // ✅ Helper function để hiển thị role
    const getRoleDisplay = (role) => {
        if (!role) return 'Không có vai trò';

        // ✅ Nếu role là object với structure {id, name, roleType}
        if (typeof role === 'object' && role.name) {
            return role.name;
        }

        // ✅ Nếu role là string
        if (typeof role === 'string') {
            return role;
        }

        return 'Không xác định';
    };

    const handleDelete = async () => {
        if (!record?.id) {
            error('Thông tin người dùng không hợp lệ');
            return;
        }

        setSpinning(true);

        try {
            console.log('🗑️ Đang xóa người dùng:', record.id, record.firstName, record.lastName);

            const response = await deleteUser(record.id);
            console.log('✅ Phản hồi xóa:', response);

            // ✅ Validate response
            if (response || response?.success !== false) {
                success();

                if (onSuccess && typeof onSuccess === 'function') {
                    setTimeout(() => {
                        onSuccess(response, { shouldReload: true });
                    }, 500);
                } else {
                    setTimeout(() => {
                        onCancel();
                    }, 1000);
                }
            } else {
                throw new Error('Thao tác xóa thất bại');
            }
        } catch (err) {
            console.error('❌ Lỗi khi xóa người dùng:', err);

            let errorMessage = 'Không thể xóa người dùng. Vui lòng thử lại.';

            if (err.response?.status === 404) {
                errorMessage = 'Không tìm thấy người dùng hoặc đã được xóa.';
            } else if (err.response?.status === 403) {
                errorMessage = 'Bạn không có quyền xóa người dùng này.';
            } else if (err.response?.status === 409) {
                errorMessage = 'Không thể xóa người dùng do có ràng buộc dữ liệu (lịch khám, hồ sơ y tế, v.v.).';
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }

            error(errorMessage);
        } finally {
            setSpinning(false);
        }
    };

    const handleCancel = () => {
        if (!spinning) {
            onCancel();
        }
    };

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <UserDeleteOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                    Xóa Người dùng
                </div>
            }
            open={visible} // ✅ Đổi từ "visible" thành "open" (Antd v5)
            onCancel={handleCancel}
            footer={null}
            width={500}
            className="custom-modal"
            destroyOnClose={true}
            centered
            maskClosable={!spinning}
            closable={!spinning}
        >
            <Spin spinning={spinning} tip="Đang xóa người dùng...">
                <div style={{ padding: '20px 0' }}>
                    <div className="delete-warning" style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        backgroundColor: '#fff2f0',
                        padding: '16px',
                        borderRadius: '6px',
                        border: '1px solid #ffccc7'
                    }}>
                        <ExclamationCircleOutlined
                            className="delete-warning-icon"
                            style={{
                                color: '#ff4d4f',
                                fontSize: '24px',
                                marginRight: '12px',
                                marginTop: '2px'
                            }}
                        />
                        <div style={{ flex: 1 }}>
                            <Paragraph strong style={{ marginBottom: '8px', color: '#cf1322' }}>
                                Bạn có chắc chắn muốn xóa người dùng này?
                            </Paragraph>
                            <Text style={{ display: 'block', marginBottom: '4px' }}>
                                Người dùng: <strong>{record?.firstName} {record?.lastName}</strong>
                            </Text>
                            <Text type="secondary" style={{ display: 'block', marginBottom: '4px' }}>
                                Email: {record?.email}
                            </Text>
                            <Text type="secondary" style={{ display: 'block' }}>
                                ID: {record?.id}
                            </Text>
                        </div>
                    </div>

                    <Paragraph type="danger" style={{
                        marginTop: 16,
                        padding: '12px',
                        backgroundColor: '#fff1f0',
                        borderLeft: '4px solid #ff4d4f',
                        borderRadius: '4px'
                    }}>
                        ⚠️ <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan đến tài khoản người dùng này sẽ bị xóa vĩnh viễn, bao gồm:
                        <ul style={{ marginTop: '8px', marginBottom: 0, paddingLeft: '20px' }}>
                            <li>🧑‍⚕️ Thông tin cá nhân</li>
                            <li>📅 Lịch hẹn khám bệnh</li>
                            <li>📋 Hồ sơ y tế</li>
                            <li>💰 Lịch sử giao dịch</li>
                            <li>🔐 Quyền truy cập hệ thống</li>
                        </ul>
                    </Paragraph>

                    {/* ✅ Fixed role display */}
                    {record?.role && (
                        <div style={{
                            marginTop: 12,
                            padding: '8px 12px',
                            backgroundColor: '#f0f7ff',
                            borderRadius: '4px',
                            border: '1px solid #d6e4ff'
                        }}>
                            <Text style={{ fontSize: '13px', color: '#1890ff' }}>
                                👤 <strong>Vai trò:</strong> {getRoleDisplay(record.role)}
                            </Text>
                            {/* ✅ Hiển thị thêm thông tin role nếu cần */}
                            {typeof record.role === 'object' && record.role.roleType && (
                                <Text style={{ fontSize: '12px', color: '#666', display: 'block', marginTop: '4px' }}>
                                    Loại: {record.role.roleType}
                                </Text>
                            )}
                        </div>
                    )}
                </div>

                <div style={{
                    marginTop: 24,
                    textAlign: 'right',
                    borderTop: '1px solid #f0f0f0',
                    paddingTop: '16px'
                }}>
                    <Button
                        onClick={handleCancel}
                        style={{ marginRight: 8 }}
                        disabled={spinning}
                    >
                        Hủy
                    </Button>
                    <Button
                        danger
                        type="primary"
                        onClick={handleDelete}
                        icon={<UserDeleteOutlined />}
                        loading={spinning}
                        disabled={spinning}
                    >
                        {spinning ? 'Đang xóa...' : 'Xóa Người dùng'}
                    </Button>
                </div>
            </Spin>
        </Modal>
    );
};

export default DeleteUser;