import React, { useState } from 'react';
import { Modal, Button, Typography, Spin, message } from 'antd';
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { deleteHospital } from '../../../services/hospitalService';

const { Paragraph, Text } = Typography;

const DeleteHospital = ({ visible, record, onCancel, onSuccess }) => {
    const [spinning, setSpinning] = useState(false);

    const handleDelete = async () => {
        setSpinning(true);
        try {
            const response = await deleteHospital(record.id);
            
            setTimeout(() => {
                setSpinning(false);
                if (response) {
                    message.success('Hospital deleted successfully!');
                    onSuccess();
                } else {
                    message.error('Failed to delete hospital');
                }
            }, 1000);
        } catch (err) {
            setSpinning(false);
            message.error('Error deleting hospital');
            console.error("Error deleting hospital:", err);
        }
    };

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <DeleteOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                    Delete Hospital
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
                                Are you sure you want to delete this hospital?
                            </Paragraph>
                            <Text>
                                Hospital: <strong>{record?.name}</strong> ({record?.code})
                            </Text>
                            <br />
                            <Text type="secondary">
                                Administrator: {record?.adminName}
                            </Text>
                            <br />
                            <Text type="secondary">
                                Location: {record?.city}, {record?.state}
                            </Text>
                        </div>
                    </div>

                    <Paragraph type="danger" style={{ marginTop: 16 }}>
                        This action cannot be undone. All data associated with this hospital will be permanently removed.
                        This includes patient records, staff assignments, department data, and hospital history.
                    </Paragraph>
                </div>

                <div style={{ marginTop: 24, textAlign: 'right' }}>
                    <Button onClick={onCancel} style={{ marginRight: 8 }}>
                        Cancel
                    </Button>
                    <Button danger type="primary" onClick={handleDelete} icon={<DeleteOutlined />}>
                        Delete Hospital
                    </Button>
                </div>
            </Spin>
        </Modal>
    );
};

export default DeleteHospital;