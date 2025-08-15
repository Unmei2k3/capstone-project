import React, { useState } from 'react';
import { Modal, Typography, Button, Spin, notification } from 'antd';
import { ExclamationCircleOutlined, UserDeleteOutlined } from '@ant-design/icons';
import { deleteUser } from '../../../services/userService';

const { Text, Paragraph } = Typography;

const DeleteUser = ({ visible, record, onCancel, onSuccess }) => {
    const [spinning, setSpinning] = useState(false);

    const success = () => {
        notification.success({
            message: 'Success',
            description: `User "${record?.firstName} ${record?.lastName}" deleted successfully!`,
            placement: 'topRight',
            duration: 3
        });
    };

    const error = (errorMessage) => {
        notification.error({
            message: 'Error',
            description: errorMessage || 'Failed to delete user. Please try again.',
            placement: 'topRight',
            duration: 5
        });
    };

    // ✅ Enhanced handleDelete với auto reload và close modal
    const handleDelete = async () => {
        if (!record?.id) {
            error('Invalid user information');
            return;
        }

        setSpinning(true);
        
        try {
            console.log('🗑️ Deleting user:', record.id, record.firstName, record.lastName);
            
            const response = await deleteUser(record.id);
            console.log('✅ Delete response:', response);

            // ✅ Validate response
            if (response || response?.success !== false) {
                // ✅ Show success notification
                success();
                
                // ✅ Call onSuccess callback để reload data và đóng modal
                if (onSuccess && typeof onSuccess === 'function') {
                    // ✅ Delay nhỏ để user thấy success notification trước khi modal đóng
                    setTimeout(() => {
                        onSuccess(response, { shouldReload: true });
                    }, 500);
                } else {
                    // ✅ Fallback: đóng modal nếu không có callback
                    setTimeout(() => {
                        onCancel();
                    }, 1000);
                }
            } else {
                throw new Error('Delete operation failed');
            }
        } catch (err) {
            console.error('❌ Error deleting user:', err);
            
            // ✅ Enhanced error handling
            let errorMessage = 'Failed to delete user. Please try again.';
            
            if (err.response?.status === 404) {
                errorMessage = 'User not found or already deleted.';
            } else if (err.response?.status === 403) {
                errorMessage = 'You do not have permission to delete this user.';
            } else if (err.response?.status === 409) {
                errorMessage = 'Cannot delete user due to existing data constraints (appointments, medical records, etc.).';
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
                    <UserDeleteOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                    Delete User
                </div>
            }
            visible={visible}
            onCancel={handleCancel}
            footer={null}
            width={500}
            className="custom-modal"
            destroyOnClose={true}
            centered
            maskClosable={!spinning}
            closable={!spinning}
        >
            <Spin spinning={spinning} tip="Deleting user...">
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
                                Are you sure you want to delete this user?
                            </Paragraph>
                            <Text style={{ display: 'block', marginBottom: '4px' }}>
                                User: <strong>{record?.firstName} {record?.lastName}</strong>
                            </Text>
                            <Text type="secondary" style={{ display: 'block' }}>
                                Email: {record?.email}
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
                        ⚠️ <strong>Warning:</strong> This action cannot be undone. All data associated with this user account will be permanently removed, including:
                        <ul style={{ marginTop: '8px', marginBottom: 0, paddingLeft: '20px' }}>
                            <li>Personal information</li>
                            <li>Medical appointments</li>
                            <li>Medical records</li>
                            <li>Transaction history</li>
                        </ul>
                    </Paragraph>
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
                        Cancel
                    </Button>
                    <Button 
                        danger 
                        type="primary" 
                        onClick={handleDelete} 
                        icon={<UserDeleteOutlined />}
                        loading={spinning}
                        disabled={spinning}
                    >
                        {spinning ? 'Deleting...' : 'Delete User'}
                    </Button>
                </div>
            </Spin>
        </Modal>
    );
};

export default DeleteUser;