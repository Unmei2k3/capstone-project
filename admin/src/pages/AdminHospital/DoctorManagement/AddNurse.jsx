import React, { useState, useEffect } from 'react';
import {
    Modal,
    Form,
    Input,
    Select,
    Row,
    Col,
    Button,
    Spin,
    DatePicker,
    Upload,
    Alert,
    Steps,
    message
} from 'antd';
import {
    UserAddOutlined,
    SaveOutlined,
    UserOutlined,
    MedicineBoxOutlined,
    CheckCircleOutlined,
    UploadOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { clearMessage, setMessage } from '../../../redux/slices/messageSlice';
import { createUser } from '../../../services/userService'; // ✅ Use createUser service
import { getDepartmentsByHospitalId } from '../../../services/departmentService';
import { getProvinces } from '../../../services/provinceService';

const { Option } = Select;
const { Step } = Steps;

const AddNurse = ({ visible, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({});
    const [departments, setDepartments] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [loadingDepartments, setLoadingDepartments] = useState(false);
    const [loadingProvinces, setLoadingProvinces] = useState(false);

    const dispatch = useDispatch();
    const user = useSelector((state) => state.user.user);
    const messageState = useSelector((state) => state.message);
    const [messageApi, contextHolder] = message.useMessage();

    // ✅ Get hospital ID from user state
    const hospitalId = user?.hospitals?.[0]?.id;

    // Watch for message state changes
    useEffect(() => {
        if (messageState && messageState.content) {
            if (messageState.type === 'success') {
                messageApi.success({
                    content: messageState.content,
                    duration: messageState.duration || 4,
                });
            } else if (messageState.type === 'error') {
                messageApi.error({
                    content: messageState.content,
                    duration: messageState.duration || 8,
                });
            }

            setTimeout(() => {
                dispatch(clearMessage());
            }, 100);
        }
    }, [messageState, messageApi, dispatch]);

    // Fetch data when modal opens
    useEffect(() => {
        if (visible && hospitalId) {
            fetchInitialData();
        }
    }, [visible, hospitalId]);

    // Update wards when province changes
    useEffect(() => {
        if (selectedProvince && provinces.length > 0) {
            const provinceObj = provinces.find((p) => p.province === selectedProvince);
            const wardsList = provinceObj?.wards || [];
            setWards(wardsList);
        } else {
            setWards([]);
        }
    }, [selectedProvince, provinces]);

    const fetchInitialData = async () => {
        try {
            setLoadingDepartments(true);
            setLoadingProvinces(true);

            console.log('🔄 Fetching initial data for hospital ID:', hospitalId);

            // Fetch departments and provinces in parallel
            const [departmentsData, provincesData] = await Promise.all([
                getDepartmentsByHospitalId(hospitalId),
                getProvinces()
            ]);

            console.log('🏢 Departments loaded:', departmentsData);
            console.log('🌏 Provinces loaded:', provincesData);

            setDepartments(departmentsData || []);
            setProvinces(provincesData.data || []);

            // ✅ Set default values for nurse
            form.setFieldsValue({
                job: 'Nurse', // ✅ Default job title for nurse
                // ✅ roleType is hardcoded to 7 (nurse role)
            });

        } catch (error) {
            console.error('❌ Error fetching initial data:', error);
            dispatch(setMessage({
                type: 'error',
                content: 'Failed to load initial data. Please try again.'
            }));
        } finally {
            setLoadingDepartments(false);
            setLoadingProvinces(false);
        }
    };

    const handleFormValuesChange = (changedValues) => {
        if ("province" in changedValues) {
            const newProvince = changedValues.province || null;
            setSelectedProvince(newProvince);
            form.setFieldsValue({ ward: undefined });
        }
    };

    const handleSubmit = async () => {
        setLoading(true);

        try {
            console.log('🔄 Starting nurse creation...');

            const currentStepValues = form.getFieldsValue();
            const allValues = { ...formData, ...currentStepValues };

            console.log('📝 Form values:', allValues);

            // ✅ Validate required fields
            const requiredFields = [
                'fullname', 'phoneNumber', 'email', 'password', 
                'dob', 'gender', 'job', 'cccd', 
                'province', 'ward', 'streetAddress', 'departmentId'
            ];

            const missingFields = requiredFields.filter(field => !allValues[field]);

            if (missingFields.length > 0) {
                const errorMsg = `Missing required fields: ${missingFields.join(', ')}`;
                messageApi.error({
                    content: errorMsg,
                    duration: 6,
                });
                throw new Error(errorMsg);
            }

            // ✅ Prepare nurse payload using createUser format
            const nursePayload = {
                hospitalId: parseInt(hospitalId), // ✅ From user state
                departmentId: parseInt(allValues.departmentId), // ✅ From form selection
                roleType: 7, // ✅ Hardcoded for nurse role
                fullname: allValues.fullname?.trim() || "",
                phoneNumber: allValues.phoneNumber?.trim() || "",
                email: allValues.email?.trim() || "",
                password: allValues.password?.trim() || "",
                avatarUrl: allValues.avatarUrl?.trim() || "",
                dob: allValues.dob ? (typeof allValues.dob === 'string' ? allValues.dob : allValues.dob.format('YYYY-MM-DD')) : null,
                gender: allValues.gender === 'male', // ✅ Convert to boolean
                job: allValues.job?.trim() || "Nurse",
                cccd: allValues.cccd?.trim() || "",
                province: allValues.province?.trim() || "",
                ward: allValues.ward?.trim() || "",
                streetAddress: allValues.streetAddress?.trim() || ""
            };

            console.log('🏥 Final nurse payload:', JSON.stringify(nursePayload, null, 2));

            // ✅ Show loading message
            messageApi.loading({
                content: 'Creating nurse account...',
                duration: 0,
                key: 'creating'
            });

            // ✅ Call createUser API
            const response = await createUser(nursePayload);
            console.log('📥 createUser response:', response);

            // ✅ Dismiss loading message
            messageApi.destroy('creating');

            // ✅ Check success
            const isSuccess = (
                response === true ||
                response?.success === true ||
                response?.success !== false ||
                (response?.status >= 200 && response?.status < 300) ||
                response?.message?.toLowerCase().includes('success') ||
                response?.result ||
                (!response?.error && response !== false && response !== null)
            );

            if (isSuccess) {
                console.log('✅ Nurse created successfully');

                messageApi.success({
                    content: '🎉 Nurse created successfully!',
                    duration: 4,
                });

                dispatch(setMessage({
                    type: 'success',
                    content: '🎉 Nurse account has been created successfully!',
                    duration: 4
                }));

                // Reset form
                form.resetFields();
                setCurrentStep(0);
                setFormData({});
                setSelectedProvince(null);
                setWards([]);

                setTimeout(() => {
                    onSuccess();
                }, 1500);

            } else {
                const errorMessage = response?.message || response?.error || 'Failed to create nurse';
                console.error('❌ Create failed:', errorMessage);

                messageApi.error({
                    content: `❌ ${errorMessage}`,
                    duration: 8,
                });

                throw new Error(errorMessage);
            }

        } catch (error) {
            console.error('❌ Error creating nurse:', error);

            let errorMessage = 'Failed to create nurse. Please try again.';

            if (error.response?.data) {
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data.errors) {
                    const validationErrors = Object.values(error.response.data.errors).flat();
                    errorMessage = validationErrors.join(', ');
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            messageApi.error({
                content: `❌ ${errorMessage}`,
                duration: 8,
            });

        } finally {
            setLoading(false);
        }
    };

    const nextStep = async () => {
        try {
            let fieldsToValidate = [];

            switch (currentStep) {
                case 0:
                    fieldsToValidate = [
                        'fullname', 'phoneNumber', 'email', 'password', 'confirmPassword',
                        'gender', 'dob', 'cccd', 'province', 'ward', 'streetAddress'
                    ];
                    break;
                case 1:
                    fieldsToValidate = ['job', 'departmentId', 'shift', 'experience'];
                    break;
                default:
                    break;
            }

            if (fieldsToValidate.length > 0) {
                const values = await form.validateFields(fieldsToValidate);
                setFormData(prev => ({ ...prev, ...values }));
            }

            setCurrentStep(currentStep + 1);
        } catch (error) {
            const errorFields = error.errorFields || [];
            if (errorFields.length > 0) {
                const missingFields = errorFields.map(field => field.name[0]).join(', ');
                messageApi.error({
                    content: `Please complete: ${missingFields}`,
                    duration: 6,
                });
            }
        }
    };

    const prevStep = () => {
        const currentValues = form.getFieldsValue();
        setFormData(prev => ({ ...prev, ...currentValues }));
        setCurrentStep(currentStep - 1);
    };

    const steps = [
        {
            title: 'Basic Info',
            description: 'Personal information',
            icon: <UserOutlined />
        },
        {
            title: 'Professional',
            description: 'Work details',
            icon: <MedicineBoxOutlined />
        },
        {
            title: 'Review',
            description: 'Confirm details',
            icon: <CheckCircleOutlined />
        }
    ];

    const renderBasicInfoStep = () => {
        return (
            <div style={{
                marginBottom: 32,
                padding: '20px',
                background: '#f0f7ff',
                borderRadius: '8px',
                border: '1px solid #d6e4ff'
            }}>
                <h3 style={{
                    color: '#52c41a',
                    marginBottom: 20,
                    fontSize: '16px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <UserOutlined style={{ marginRight: 8 }} />
                    Basic Information
                </h3>

                <Alert
                    message={`Hospital: ${user?.hospitals?.[0]?.name || 'Loading...'}`}
                    description={`Creating nurse account for hospital ID: ${hospitalId}.`}
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                />

                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            name="fullname"
                            label="Full Name"
                            rules={[
                                { required: true, message: 'Please enter full name' },
                                { min: 2, message: 'Name must be at least 2 characters' }
                            ]}
                        >
                            <Input placeholder="Nurse Jane Smith" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            name="phoneNumber"
                            label="Phone Number"
                            rules={[
                                { required: true, message: 'Please enter phone number' },
                                { pattern: /^[0-9]{10,11}$/, message: 'Phone number must be 10-11 digits' }
                            ]}
                        >
                            <Input placeholder="0123456789" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                { required: true, message: 'Please enter email' },
                                { type: 'email', message: 'Please enter valid email' }
                            ]}
                        >
                            <Input placeholder="nurse@hospital.com" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            name="password"
                            label="Password"
                            rules={[
                                { required: true, message: 'Please enter password' },
                                { min: 6, message: 'Password must be at least 6 characters' }
                            ]}
                        >
                            <Input.Password placeholder="Enter password" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            name="confirmPassword"
                            label="Confirm Password"
                            dependencies={['password']}
                            rules={[
                                { required: true, message: 'Please confirm password' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Passwords do not match!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password placeholder="Confirm password" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            name="avatarUrl"
                            label="Profile Image URL"
                        >
                            <Input placeholder="https://example.com/photo.jpg" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24} md={8}>
                        <Form.Item
                            name="gender"
                            label="Gender"
                            rules={[{ required: true, message: 'Please select gender' }]}
                        >
                            <Select placeholder="Select gender">
                                <Option value="male">👨 Male</Option>
                                <Option value="female">👩 Female</Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item
                            name="dob"
                            label="Date of Birth"
                            rules={[{ required: true, message: 'Please select date of birth' }]}
                        >
                            <DatePicker
                                style={{ width: '100%' }}
                                placeholder="Select date"
                                format="YYYY-MM-DD"
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item
                            name="cccd"
                            label="CCCD/ID Card Number"
                            rules={[
                                { required: true, message: 'Please enter ID number' },
                                { pattern: /^[0-9]{9,12}$/, message: 'ID must be 9-12 digits' }
                            ]}
                        >
                            <Input placeholder="Enter ID number" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24} md={8}>
                        <Form.Item
                            name="province"
                            label="Province/City"
                            rules={[{ required: true, message: 'Please select province' }]}
                        >
                            <Select
                                placeholder="Select province"
                                showSearch
                                loading={loadingProvinces}
                                filterOption={(input, option) =>
                                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                                }
                                options={provinces.map((p) => ({
                                    label: p.province,
                                    value: p.province,
                                }))}
                                allowClear
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item
                            name="ward"
                            label="Ward/District"
                            rules={[{ required: true, message: 'Please select ward' }]}
                        >
                            <Select
                                placeholder={selectedProvince ? "Select ward" : "Select province first"}
                                showSearch
                                disabled={!selectedProvince}
                                options={wards.map((w) => ({
                                    label: w.name,
                                    value: w.name
                                }))}
                                filterOption={(input, option) =>
                                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                                }
                                allowClear
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item
                            name="streetAddress"
                            label="Street Address"
                            rules={[{ required: true, message: 'Please enter street address' }]}
                        >
                            <Input placeholder="123 Main Street" />
                        </Form.Item>
                    </Col>
                </Row>
            </div>
        );
    };

    const renderProfessionalStep = () => {
        return (
            <div style={{
                marginBottom: 32,
                padding: '20px',
                background: '#f6ffed',
                borderRadius: '8px',
                border: '1px solid #b7eb8f'
            }}>
                <h3 style={{
                    color: '#52c41a',
                    marginBottom: 20,
                    fontSize: '16px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <MedicineBoxOutlined style={{ marginRight: 8 }} />
                    Professional Information
                </h3>

                <Alert
                    message="Nurse Role Assignment"
                    description={` Hospital ID: ${hospitalId}. Available departments: ${departments.length}`}
                    type="success"
                    showIcon
                    style={{ marginBottom: 16 }}
                />

                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            name="job"
                            label="Job Title"
                            initialValue="Nurse"
                            rules={[{ required: true, message: 'Please enter job title' }]}
                        >
                            <Select placeholder="Select job title" disabled>
                                <Option value="Nurse">👩‍⚕️ Nurse</Option>
                                <Option value="Senior Nurse">👩‍⚕️ Senior Nurse</Option>
                                <Option value="Head Nurse">👩‍⚕️ Head Nurse</Option>
                                <Option value="Charge Nurse">👩‍⚕️ Charge Nurse</Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            name="departmentId"
                            label="Department"
                            rules={[{ required: true, message: 'Please select department' }]}
                        >
                            <Select 
                                placeholder="Select department" 
                                showSearch
                                loading={loadingDepartments}
                            >
                                {departments.map(dept => (
                                    <Option key={dept.id} value={dept.id}>
                                        🏥 {dept.name} (ID: {dept.id})
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            name="shift"
                            label="Shift Schedule"
                        >
                            <Select placeholder="Select shift">
                                <Option value="Day Shift (7AM-7PM)">🌅 Day Shift (7AM-7PM)</Option>
                                <Option value="Night Shift (7PM-7AM)">🌙 Night Shift (7PM-7AM)</Option>
                                <Option value="Rotating">🔄 Rotating</Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            name="experience"
                            label="Years of Experience"
                        >
                            <Select placeholder="Select experience">
                                <Option value="0-1 years">🌱 0-1 years</Option>
                                <Option value="2-5 years">🌿 2-5 years</Option>
                                <Option value="5-10 years">🌳 5-10 years</Option>
                                <Option value="10+ years">🌲 10+ years</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <div style={{ marginTop: 16, padding: 12, background: '#f0f0f0', borderRadius: 6, fontSize: '12px' }}>
                    <strong>Debug Info:</strong><br />
                    Hospital ID: {hospitalId}<br />
                    Role Type: 7 (Nurse) - hardcoded<br />
                    Available Departments: {departments.length}<br />
                    Service: createUser (not createDoctor)
                </div>
            </div>
        );
    };

    const renderReviewStep = () => {
        const currentValues = form.getFieldsValue();
        const allData = { ...formData, ...currentValues };

        const selectedDepartment = departments.find(d => d.id === allData.departmentId);

        return (
            <div style={{
                marginBottom: 32,
                padding: '20px',
                background: '#fff7e6',
                borderRadius: '8px',
                border: '1px solid #ffd591'
            }}>
                <h3 style={{
                    color: '#faad14',
                    marginBottom: 20,
                    fontSize: '16px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <CheckCircleOutlined style={{ marginRight: 8 }} />
                    Review Nurse Information
                </h3>

                <Alert
                    message="Please review all information before creating the nurse account"
                    description="Make sure all details are correct as some information cannot be changed later."
                    type="warning"
                    showIcon
                    style={{ marginBottom: 20 }}
                />

                <div style={{ background: 'white', padding: '16px', borderRadius: '6px' }}>
                    <Row gutter={32}>
                        <Col span={12}>
                            <h4 style={{ color: '#52c41a', marginBottom: 12 }}>👤 Personal Information</h4>
                            <p><strong>Name:</strong> {allData.fullname || 'Not provided'}</p>
                            <p><strong>Phone:</strong> {allData.phoneNumber || 'Not provided'}</p>
                            <p><strong>Email:</strong> {allData.email || 'Not provided'}</p>
                            <p><strong>Gender:</strong> {allData.gender === 'male' ? '👨 Male' : '👩 Female'}</p>
                            <p><strong>DOB:</strong> {allData.dob ? (typeof allData.dob === 'string' ? allData.dob : allData.dob.format('YYYY-MM-DD')) : 'Not provided'}</p>
                            <p><strong>CCCD:</strong> {allData.cccd || 'Not provided'}</p>
                            <p><strong>Address:</strong> {[allData.streetAddress, allData.ward, allData.province].filter(Boolean).join(', ') || 'Not provided'}</p>
                        </Col>
                        <Col span={12}>
                            <h4 style={{ color: '#52c41a', marginBottom: 12 }}>🏥 Professional Information</h4>
                            <p><strong>Hospital:</strong> {user?.hospitals?.[0]?.name || 'Loading...'} (ID: {hospitalId})</p>
                            <p><strong>Role Type:</strong> 7 (Nurse) - Hardcoded</p>
                            <p><strong>Job Title:</strong> {allData.job || 'Nurse'}</p>
                            <p><strong>Department:</strong> {selectedDepartment?.name || 'Not selected'} (ID: {allData.departmentId})</p>
                            <p><strong>Shift:</strong> {allData.shift || 'Not specified'}</p>
                            <p><strong>Experience:</strong> {allData.experience || 'Not specified'}</p>

                            <div style={{ marginTop: 16, padding: 8, background: '#e6fffb', borderRadius: 4, fontSize: '12px' }}>
                                <strong>API Payload Preview:</strong><br />
                                hospitalId: {hospitalId}<br />
                                departmentId: {allData.departmentId}<br />
                                roleType: 7 (hardcoded)<br />
                                Service: createUser
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>
        );
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return renderBasicInfoStep();
            case 1:
                return renderProfessionalStep();
            case 2:
                return renderReviewStep();
            default:
                return null;
        }
    };

    return (
        <>
            {contextHolder}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <UserAddOutlined style={{
                            color: '#52c41a',
                            marginRight: 8,
                            fontSize: '20px'
                        }} />
                        <span style={{ fontSize: '18px', fontWeight: 600 }}>
                            Add New Nurse
                        </span>
                    </div>
                }
                open={visible}
                onCancel={() => {
                    form.resetFields();
                    setCurrentStep(0);
                    setFormData({});
                    setSelectedProvince(null);
                    setWards([]);
                    onCancel();
                }}
                footer={null}
                width={1100}
                destroyOnClose
                style={{ top: 20 }}
            >
                <Spin spinning={loading}>
                    <div style={{ maxHeight: '75vh', overflowY: 'auto', padding: '0 4px' }}>
                        <div style={{ marginBottom: 32 }}>
                            <Steps current={currentStep} size="small">
                                {steps.map((step, index) => (
                                    <Step
                                        key={index}
                                        title={step.title}
                                        description={step.description}
                                        icon={step.icon}
                                    />
                                ))}
                            </Steps>
                        </div>

                        <Form
                            form={form}
                            layout="vertical"
                            preserve={true}
                            onValuesChange={handleFormValuesChange}
                        >
                            {renderStepContent()}

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: 12,
                                paddingTop: 16,
                                borderTop: '1px solid #f0f0f0'
                            }}>
                                <div>
                                    {currentStep > 0 && (
                                        <Button onClick={prevStep} size="large">
                                            Previous
                                        </Button>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: 12 }}>
                                    <Button onClick={() => {
                                        form.resetFields();
                                        setCurrentStep(0);
                                        setFormData({});
                                        setSelectedProvince(null);
                                        setWards([]);
                                        onCancel();
                                    }} size="large">
                                        Cancel
                                    </Button>

                                    {currentStep < steps.length - 1 ? (
                                        <Button
                                            type="primary"
                                            onClick={nextStep}
                                            size="large"
                                            style={{
                                                backgroundColor: '#52c41a',
                                                borderColor: '#52c41a'
                                            }}
                                        >
                                            Next
                                        </Button>
                                    ) : (
                                        <Button
                                            type="primary"
                                            onClick={handleSubmit}
                                            loading={loading}
                                            size="large"
                                            icon={<SaveOutlined />}
                                            style={{
                                                backgroundColor: '#52c41a',
                                                borderColor: '#52c41a'
                                            }}
                                        >
                                            Create Nurse
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Form>
                    </div>
                </Spin>
            </Modal>
        </>
    );
};

export default AddNurse;