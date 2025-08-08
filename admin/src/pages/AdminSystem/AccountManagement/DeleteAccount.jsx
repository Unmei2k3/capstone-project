import React, { useState } from 'react';
import { Modal, Button, Typography, Spin, notification } from 'antd';
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { deleteUser } from '../../../services/userService';

const { Paragraph, Text } = Typography;

const DeleteAccount = ({ visible, record, onCancel, onSuccess }) => {
    const [spinning, setSpinning] = useState(false);

    const handleDelete = async () => {
        setSpinning(true);
        try {
            const response = await deleteUser(record.id);
            setTimeout(() => {
                setSpinning(false);
                if (response) {
                    notification.success({
                        message: 'Success',
                        description: 'Account deleted successfully!',
                    });
                    onSuccess();
                } else {
                    notification.error({
                        message: 'Error',
                        description: 'Failed to delete account.',
                    });
                }
            }, 1000);
        } catch (err) {
            setSpinning(false);
            notification.error({
                message: 'Error',
                description: 'Failed to delete account.',
            });
        }
    };

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <DeleteOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                    Delete Account
                </div>
            }
            visible={visible}
            onCancel={onCancel}
            footer={null}
            width={500}
        >
            <Spin spinning={spinning}>
                <div style={{ padding: '20px 0' }}>
                    <div className="delete-warning">
                        <ExclamationCircleOutlined className="delete-warning-icon" />
                        <div>
                            <Paragraph strong>
                                Are you sure you want to delete this account?
                            </Paragraph>
                            <Text>
                                Account: <strong>{record?.fullname}</strong> ({record?.userName})
                            </Text>
                            <br />
                            <Text type="secondary">
                                Email: {record?.email}
                            </Text>
                        </div>
                    </div>

                    <Paragraph type="danger" style={{ marginTop: 16 }}>
                        This action cannot be undone. All data associated with this account will be permanently removed.
                    </Paragraph>
                </div>

                <div style={{ marginTop: 24, textAlign: 'right' }}>
                    <Button onClick={onCancel} style={{ marginRight: 8 }}>
                        Cancel
                    </Button>
                    <Button danger type="primary" onClick={handleDelete} icon={<DeleteOutlined />}>
                        Delete Account
                    </Button>
                </div>
            </Spin>
        </Modal>
    );
};

export default DeleteAccount;