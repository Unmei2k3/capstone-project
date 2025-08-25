import React, { useState } from 'react';
import { Modal, Button, Typography, Spin, notification } from 'antd';
import { DeleteOutlined, ExclamationCircleOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import { deleteHospital } from '../../../services/hospitalService';

const { Paragraph, Text } = Typography;

const DeleteHospital = ({ visible, record, onCancel, onSuccess }) => {
    const [spinning, setSpinning] = useState(false);

    const success = () => {
        notification.success({
            message: 'Thành công',
            description: `Đã xóa bệnh viện "${record?.name}" thành công!`,
            placement: 'topRight',
            duration: 3
        });
    };

    const error = (errorMessage) => {
        notification.error({
            message: 'Lỗi',
            description: errorMessage || 'Không thể xóa bệnh viện. Vui lòng thử lại.',
            placement: 'topRight',
            duration: 5
        });
    };

    // ✅ Enhanced handleDelete với error handling chi tiết
    const handleDelete = async () => {
        if (!record?.id) {
            error('Thông tin bệnh viện không hợp lệ');
            return;
        }

        setSpinning(true);
        
        try {
            console.log('🗑️ Đang xóa bệnh viện:', record.id, record.name);
            
            const response = await deleteHospital(record.id);
            console.log('✅ Phản hồi xóa bệnh viện:', response);

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
            console.error('❌ Lỗi khi xóa bệnh viện:', err);
            
            // ✅ Enhanced error handling với tiếng Việt
            let errorMessage = 'Không thể xóa bệnh viện. Vui lòng thử lại.';
            
            if (err.response?.status === 404) {
                errorMessage = 'Không tìm thấy bệnh viện hoặc đã được xóa.';
            } else if (err.response?.status === 403) {
                errorMessage = 'Bạn không có quyền xóa bệnh viện này.';
            } else if (err.response?.status === 409) {
                errorMessage = 'Không thể xóa bệnh viện do có ràng buộc dữ liệu (bệnh nhân, nhân viên, khoa, v.v.).';
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
                    <MedicineBoxOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                    Xóa Bệnh viện
                </div>
            }
            open={visible} // ✅ Antd v5 compatibility
            onCancel={handleCancel}
            footer={null}
            width={550}
            className="custom-modal"
            destroyOnClose={true}
            centered
            maskClosable={!spinning}
            closable={!spinning}
        >
            <Spin spinning={spinning} tip="Đang xóa bệnh viện...">
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
                                Bạn có chắc chắn muốn xóa bệnh viện này?
                            </Paragraph>
                            <Text style={{ display: 'block', marginBottom: '4px' }}>
                                Bệnh viện: <strong>{record?.name || 'Không có tên'}</strong>
                            </Text>
                            <Text type="secondary" style={{ display: 'block', marginBottom: '4px' }}>
                                Mã: {record?.code || 'N/A'}
                            </Text>
                            <Text type="secondary" style={{ display: 'block', marginBottom: '4px' }}>
                                ID: {record?.id}
                            </Text>
                            <Text type="secondary" style={{ display: 'block' }}>
                                Địa chỉ: {record?.address || 'Không có thông tin'}
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
                        ⚠️ <strong>Cảnh báo cực kỳ quan trọng:</strong> Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan đến bệnh viện này sẽ bị xóa vĩnh viễn, bao gồm:
                        <ul style={{ marginTop: '8px', marginBottom: 0, paddingLeft: '20px' }}>
                            <li>🏥 Thông tin bệnh viện và cơ sở vật chất</li>
                            <li>👨‍⚕️ Toàn bộ nhân viên y tế và quản lý</li>
                            <li>🏢 Tất cả khoa/phòng và phân bổ</li>
                            <li>🛏️ Hệ thống giường bệnh và thiết bị</li>
                            <li>👥 Hồ sơ bệnh nhân và lịch sử khám</li>
                            <li>📅 Lịch trình và ca trực</li>
                            <li>💰 Dữ liệu tài chính và doanh thu</li>
                            <li>📊 Báo cáo và thống kê hoạt động</li>
                            <li>🔐 Tài khoản và quyền truy cập</li>
                        </ul>
                    </Paragraph>

                    {/* ✅ Thêm thông tin liên hệ nếu có */}
                    {(record?.email || record?.phoneNumber) && (
                        <div style={{
                            marginTop: 12,
                            padding: '8px 12px',
                            backgroundColor: '#f0f7ff',
                            borderRadius: '4px',
                            border: '1px solid #d6e4ff'
                        }}>
                            <Text style={{ fontSize: '13px', color: '#1890ff', display: 'block' }}>
                                📞 <strong>Liên hệ:</strong>
                            </Text>
                            {record?.phoneNumber && (
                                <Text style={{ fontSize: '12px', color: '#666', display: 'block' }}>
                                    Điện thoại: {record.phoneNumber}
                                </Text>
                            )}
                            {record?.email && (
                                <Text style={{ fontSize: '12px', color: '#666', display: 'block' }}>
                                    Email: {record.email}
                                </Text>
                            )}
                        </div>
                    )}

                    {/* ✅ Thêm thông tin thời gian hoạt động nếu có */}
                    {(record?.openTime || record?.closeTime) && (
                        <div style={{
                            marginTop: 8,
                            padding: '8px 12px',
                            backgroundColor: '#f6ffed',
                            borderRadius: '4px',
                            border: '1px solid #b7eb8f'
                        }}>
                            <Text style={{ fontSize: '13px', color: '#52c41a', display: 'block' }}>
                                ⏰ <strong>Giờ hoạt động:</strong>
                            </Text>
                            <Text style={{ fontSize: '12px', color: '#666' }}>
                                {record?.openTime && new Date(record.openTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {record?.closeTime && new Date(record.closeTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
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
                        {spinning ? 'Đang xóa...' : 'Xóa Bệnh viện'}
                    </Button>
                </div>
            </Spin>
        </Modal>
    );
};

export default DeleteHospital;