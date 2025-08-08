import React, { useState } from 'react';
import { Modal, Typography, Alert, Space, Divider, Descriptions, Tag, Spin } from 'antd';
import { 
    ExclamationCircleOutlined, 
    UserOutlined, 
    MedicineBoxOutlined, 
    HeartOutlined,
    WarningOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { setMessage } from '../../../redux/slices/messageSlice';
import { deleteDoctor } from '../../../services/doctorService';


const { Title, Text, Paragraph } = Typography;

const DeleteStaff = ({ 
    visible, 
    onCancel, 
    onSuccess, 
    staff 
}) => {
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const handleDelete = async () => {
        if (!staff) {
            console.error('❌ No staff data provided for deletion');
            return;
        }

        console.log(`🗑️ Starting delete process for ${staff.type}:`, staff);
        setLoading(true);

        try {
            if (staff.type === 'doctor') {
                console.log('📡 Calling deleteDoctor API for ID:', staff.id);
                
                const response = await deleteDoctor(staff.id);
                console.log('📥 Delete doctor response:', response);
            
                const isSuccess = (
                    response?.success === true ||
                    response?.success === undefined ||
                    (response?.status >= 200 && response?.status < 300) ||
                    response?.message === 'Deleted successfully' ||
                    !response?.error
                );
                
                console.log('🎯 Delete success status:', isSuccess);
                
                if (isSuccess) {
                    console.log('✅ Doctor deleted successfully');
                    
                    dispatch(setMessage({
                        type: 'success',
                        content: `🎉 Dr. ${staff.name} has been deleted successfully.`,
                        duration: 4
                    }));
                    
                    onSuccess();
                } else {
                    const errorMsg = response?.message || response?.error || 'Failed to delete doctor';
                    console.error('❌ Delete failed:', errorMsg);
                    throw new Error(errorMsg);
                }
                
            } else if (staff.type === 'nurse') {
                console.log('👩‍⚕️ Deleting nurse (mock):', staff.id);
                
                
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                console.log('✅ Nurse deleted successfully (mock)');
                
                dispatch(setMessage({
                    type: 'success',
                    content: `🎉 Nurse ${staff.name} has been deleted successfully.`,
                    duration: 4
                }));
                
                onSuccess();
                
            } else {
                throw new Error('Unknown staff type: ' + staff.type);
            }
            
        } catch (error) {
            console.error(`❌ Error deleting ${staff.type}:`, error);
            
           
            let errorMessage = `Failed to delete ${staff.type}. Please try again.`;
            
            if (error.response?.data) {
                console.log('🔍 API Error Details:', error.response.data);
                if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data.title) {
                    errorMessage = error.response.data.title;
                } else if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            console.log('📤 Displaying error message:', errorMessage);
            
            dispatch(setMessage({
                type: 'error',
                content: `❌ ${errorMessage}`,
                duration: 8
            }));
        } finally {
            setLoading(false);
        }
    };


    const getStaffTypeInfo = () => {
        if (staff?.type === 'doctor') {
            return {
                icon: <MedicineBoxOutlined />,
                color: '#1890ff',
                title: 'Doctor'
            };
        } else if (staff?.type === 'nurse') {
            return {
                icon: <HeartOutlined />,
                color: '#52c41a',
                title: 'Nurse'
            };
        }
        return {
            icon: <UserOutlined />,
            color: '#666',
            title: 'Staff'
        };
    };

    const staffTypeInfo = getStaffTypeInfo();

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', color: '#ff4d4f' }}>
                    <DeleteOutlined style={{ marginRight: 8, fontSize: '18px' }} />
                    <span>Delete {staffTypeInfo.title}</span>
                </div>
            }
            open={visible}
            onCancel={onCancel}
            onOk={handleDelete}
            okText="Yes, Delete"
            cancelText="Cancel"
            okType="danger"
            confirmLoading={loading}
            width={600}
            maskClosable={false}
            destroyOnClose
        >
            <Spin spinning={loading} tip="Deleting staff member...">
                <div style={{ padding: '8px 0' }}>
                   
                    <Alert
                        message="Permanent Deletion Warning"
                        description="This action cannot be undone. All related data will be permanently removed from the system."
                        type="error"
                        icon={<WarningOutlined />}
                        showIcon
                        style={{ marginBottom: 24 }}
                    />

                
                    {staff && (
                        <>
                            <Title level={4} style={{ marginBottom: 16, color: '#262626' }}>
                                <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                                Are you sure you want to delete this {staffTypeInfo.title.toLowerCase()}?
                            </Title>

                            <div style={{
                                background: '#fafafa',
                                padding: '16px',
                                borderRadius: '8px',
                                border: '1px solid #f0f0f0',
                                marginBottom: 16
                            }}>
                              
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    marginBottom: 16 
                                }}>
                                    <div style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: '50%',
                                        backgroundColor: staffTypeInfo.color,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '20px',
                                        marginRight: 12
                                    }}>
                                        {staffTypeInfo.icon}
                                    </div>
                                    <div>
                                        <Title level={5} style={{ margin: 0, color: staffTypeInfo.color }}>
                                            {staff.name || staff.fullname}
                                        </Title>
                                        <Text type="secondary">{staff.email}</Text>
                                    </div>
                                    <div style={{ marginLeft: 'auto' }}>
                                        <Tag 
                                            color={staffTypeInfo.color} 
                                            icon={staffTypeInfo.icon}
                                            style={{ fontSize: '12px' }}
                                        >
                                            {staffTypeInfo.title}
                                        </Tag>
                                    </div>
                                </div>

                                <Divider style={{ margin: '12px 0' }} />

                         
                                <Descriptions size="small" column={2}>
                                    <Descriptions.Item label="Staff ID">
                                        <Text code>{staff.id}</Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="License Number">
                                        <Text>{staff.licenseNumber || 'N/A'}</Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Phone">
                                        <Text>{staff.phone || staff.phoneNumber || 'N/A'}</Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Department">
                                        <Text>{staff.departmentName || 'N/A'}</Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Specialization">
                                        <Text>{staff.specialization || 'N/A'}</Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Status">
                                        <Tag color={staff.status === 'active' ? 'success' : 'error'}>
                                            {staff.status?.toUpperCase() || 'UNKNOWN'}
                                        </Tag>
                                    </Descriptions.Item>
                                </Descriptions>

                         
                                {staff.experience && (
                                    <div style={{ marginTop: 12 }}>
                                        <Text strong>Experience: </Text>
                                        <Text>{staff.experience}</Text>
                                    </div>
                                )}

                                {staff.description && (
                                    <div style={{ marginTop: 8 }}>
                                        <Text strong>Description: </Text>
                                        <Text>{staff.description}</Text>
                                    </div>
                                )}
                            </div>

                       
                            <Alert
                                message="Data Impact"
                                description={
                                    <div>
                                        <Paragraph style={{ margin: 0 }}>
                                            Deleting this {staffTypeInfo.title.toLowerCase()} will permanently remove:
                                        </Paragraph>
                                        <ul style={{ marginTop: 8, marginBottom: 0 }}>
                                            <li>Personal information and profile data</li>
                                            <li>Professional credentials and certifications</li>
                                            {staff.type === 'doctor' && (
                                                <>
                                                    <li>Medical specializations and qualifications</li>
                                                    <li>Patient consultation history</li>
                                                    <li>Appointment scheduling data</li>
                                                </>
                                            )}
                                            {staff.type === 'nurse' && (
                                                <>
                                                    <li>Shift schedules and assignments</li>
                                                    <li>Patient care records</li>
                                                    <li>Ward and department assignments</li>
                                                </>
                                            )}
                                            <li>System access and permissions</li>
                                        </ul>
                                    </div>
                                }
                                type="warning"
                                showIcon
                                style={{ marginBottom: 16 }}
                            />

                       
                            <div style={{ 
                                textAlign: 'center', 
                                padding: '16px',
                                background: '#fff2f0',
                                borderRadius: '6px',
                                border: '1px solid #ffccc7'
                            }}>
                                <Text strong style={{ color: '#cf1322' }}>
                                    Type the {staffTypeInfo.title.toLowerCase()}'s name to confirm deletion:
                                </Text>
                                <br />
                                <Text code style={{ fontSize: '16px', color: '#1890ff' }}>
                                    {staff.name || staff.fullname}
                                </Text>
                            </div>
                        </>
                    )}

                   
                    {!staff && (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <Text type="secondary">No staff data available for deletion.</Text>
                        </div>
                    )}
                </div>
            </Spin>
        </Modal>
    );
};

export default DeleteStaff;