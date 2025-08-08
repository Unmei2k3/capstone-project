import React, { useState } from 'react';
import { Modal, Typography, Button, Spin, notification } from 'antd';
import { ExclamationCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { deleteDepartment } from '../../../services/departmentService';

const { Text, Paragraph } = Typography;

const DeleteDepartment = ({ visible, record, onCancel, onSuccess }) => {
    const [spinning, setSpinning] = useState(false);

    const success = () => {
        notification.success({
            message: 'Success',
            description: 'Department deleted successfully!',
            placement: 'topRight',
        });
    };

    const error = () => {
        notification.error({
            message: 'Error',
            description: 'Failed to delete department. Please try again.',
            placement: 'topRight',
        });
    };

    const handleDelete = async () => {
        setSpinning(true);
        try {
            console.log(record.id);
            const response = await deleteDepartment(record.id);

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
            console.error("Error deleting department:", err);
        }
    };

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <DeleteOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                    Delete Department
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
                                Are you sure you want to delete this department?
                            </Paragraph>
                            <Text>
                                Department: <strong>{record?.name}</strong> ({record?.code})
                            </Text>
                            <br />
                            <Text type="secondary">
                                Head: {record?.headOfDepartment}
                            </Text>
                        </div>
                    </div>

                    <Paragraph type="danger" style={{ marginTop: 16 }}>
                        This action cannot be undone. All data associated with this department will be permanently removed.
                        This includes staff assignments, bed allocations, and department history.
                    </Paragraph>
                </div>

                <div style={{ marginTop: 24, textAlign: 'right' }}>
                    <Button onClick={onCancel} style={{ marginRight: 8 }}>
                        Cancel
                    </Button>
                    <Button danger type="primary" onClick={handleDelete} icon={<DeleteOutlined />}>
                        Delete Department
                    </Button>
                </div>
            </Spin>
        </Modal>
    );
};

export default DeleteDepartment;