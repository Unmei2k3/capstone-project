import React, { useState } from 'react';
import { Modal, Typography, Button, Spin, notification } from 'antd';
import { ExclamationCircleOutlined, DeleteOutlined, BankOutlined } from '@ant-design/icons';
import { deleteDepartment } from '../../../services/departmentService';

const { Text, Paragraph } = Typography;

const DeleteDepartment = ({ visible, record, onCancel, onSuccess }) => {
    const [spinning, setSpinning] = useState(false);

    const success = () => {
        notification.success({
            message: 'Thành công',
            description: `Đã xóa khoa "${record?.name}" thành công!`,
            placement: 'topRight',
            duration: 3
        });
    };

    const error = (errorMessage) => {
        notification.error({
            message: 'Lỗi',
            description: errorMessage || 'Không thể xóa khoa. Vui lòng thử lại.',
            placement: 'topRight',
            duration: 5
        });
    };

    // ✅ Enhanced handleDelete với error handling chi tiết
    const handleDelete = async () => {
        if (!record?.id) {
            error('Thông tin khoa không hợp lệ');
            return;
        }

        setSpinning(true);
        
        try {
            console.log('🗑️ Đang xóa khoa:', record.id, record.name);
            
            const response = await deleteDepartment(record.id);
            console.log('✅ Phản hồi xóa khoa:', response);

            // ✅ Validate response
            if (response || response?.success !== false) {
                success();
                
                // ✅ Call onSuccess callback để reload data và đóng modal
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
            console.error('❌ Lỗi khi xóa khoa:', err);
            
            // ✅ Enhanced error handling với tiếng Việt
            let errorMessage = 'Không thể xóa khoa. Vui lòng thử lại.';
            
            if (err.response?.status === 404) {
                errorMessage = 'Không tìm thấy khoa hoặc đã được xóa.';
            } else if (err.response?.status === 403) {
                errorMessage = 'Bạn không có quyền xóa khoa này.';
            } else if (err.response?.status === 409) {
                errorMessage = 'Không thể xóa khoa do có ràng buộc dữ liệu (bác sĩ, giường bệnh, lịch khám, v.v.).';
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

    // ✅ Enhanced cancel handler
    const handleCancel = () => {
        if (!spinning) {
            onCancel();
        }
    };

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <BankOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                    Xóa Khoa/Phòng
                </div>
            }
            open={visible} // ✅ Antd v5 compatibility
            onCancel={handleCancel}
            footer={null}
            width={520}
            className="custom-modal"
            destroyOnClose={true}
            centered
            maskClosable={!spinning}
            closable={!spinning}
        >
            <Spin spinning={spinning} tip="Đang xóa khoa...">
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
                                Bạn có chắc chắn muốn xóa khoa/phòng này?
                            </Paragraph>
                            <Text style={{ display: 'block', marginBottom: '4px' }}>
                                Tên khoa: <strong>{record?.name || 'Không có tên'}</strong>
                            </Text>
                            <Text type="secondary" style={{ display: 'block', marginBottom: '4px' }}>
                                ID: {record?.id}
                            </Text>
                            <Text type="secondary" style={{ display: 'block' }}>
                                Hospital ID: {record?.hospitalId || 'N/A'}
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
                        ⚠️ <strong>Cảnh báo quan trọng:</strong> Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan đến khoa/phòng này sẽ bị xóa vĩnh viễn, bao gồm:
                        <ul style={{ marginTop: '8px', marginBottom: 0, paddingLeft: '20px' }}>
                            <li>👨‍⚕️ Danh sách bác sĩ và nhân viên</li>
                            <li>🛏️ Phân bổ giường bệnh</li>
                            <li>📅 Lịch khám và ca trực</li>
                            <li>💰 Dữ liệu doanh thu của khoa</li>
                            <li>📊 Lịch sử hoạt động và báo cáo</li>
                        </ul>
                    </Paragraph>

                    {/* ✅ Thêm thông tin mô tả nếu có */}
                    {record?.description && (
                        <div style={{
                            marginTop: 12,
                            padding: '8px 12px',
                            backgroundColor: '#f0f7ff',
                            borderRadius: '4px',
                            border: '1px solid #d6e4ff'
                        }}>
                            <Text style={{ fontSize: '13px', color: '#1890ff' }}>
                                📝 <strong>Mô tả:</strong> {record.description}
                            </Text>
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
                        icon={<DeleteOutlined />}
                        loading={spinning}
                        disabled={spinning}
                    >
                        {spinning ? 'Đang xóa...' : 'Xóa Khoa'}
                    </Button>
                </div>
            </Spin>
        </Modal>
    );
};

export default DeleteDepartment;