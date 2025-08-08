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
            description: 'User deleted successfully!',
            placement: 'topRight',
        });
    };

    const error = () => {
        notification.error({
            message: 'Error',
            description: 'Failed to delete user. Please try again.',
            placement: 'topRight',
        });
    };

    const handleDelete = async () => {
        setSpinning(true);
        try {
            const response = await deleteUser(record.id);
            setSpinning(false);

            if (response) {
                success();
                onSuccess();
            } else {
                error();
            }
        } catch (err) {
            setSpinning(false);
            error();
            console.error("Error deleting user:", err);
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
            onCancel={onCancel}
            footer={null}
            width={500}
            className="custom-modal"
        >
            <Spin spinning={spinning}>
                <div style={{ padding: '20px 0' }}>
                    <div className="delete-warning">
                        <ExclamationCircleOutlined className="delete-warning-icon" />
                        <div>
                            <Paragraph strong>
                                Are you sure you want to delete this user?
                            </Paragraph>
                            <Text>
                                User: <strong>{record?.firstName} {record?.lastName}</strong> ({record?.email})
                            </Text>
                        </div>
                    </div>

                    <Paragraph type="danger" style={{ marginTop: 16 }}>
                        This action cannot be undone. All data associated with this user account will be permanently removed.
                    </Paragraph>
                </div>

                <div style={{ marginTop: 24, textAlign: 'right' }}>
                    <Button onClick={onCancel} style={{ marginRight: 8 }}>
                        Cancel
                    </Button>
                    <Button danger type="primary" onClick={handleDelete} icon={<UserDeleteOutlined />}>
                        Delete User
                    </Button>
                </div>
            </Spin>
        </Modal>
    );
};

export default DeleteUser;