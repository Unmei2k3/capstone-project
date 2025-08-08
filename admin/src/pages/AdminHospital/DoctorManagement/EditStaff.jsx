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
  message
} from 'antd';
import {
  EditOutlined,
  SaveOutlined,
  UserOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { setMessage } from '../../../redux/slices/messageSlice';
import { updateDoctor } from '../../../services/doctorService';
import { getProvinces } from '../../../services/provinceService';
import { getHospitalById, getSpecializationsByHospitalId } from '../../../services/hospitalService';
import { getDepartmentsByHospitalId } from '../../../services/departmentService';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const EditStaff = ({ visible, onCancel, onSuccess, staff, departments: propDepartments, specializations: propSpecializations }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  // Hospital-specific states
  const [currentHospital, setCurrentHospital] = useState(null);
  const [hospitalSpecializations, setHospitalSpecializations] = useState([]);
  const [hospitalDepartments, setHospitalDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [specializationsLoading, setSpecializationsLoading] = useState(false);
  
  // Address states
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  // ✅ Fetch provinces once
  useEffect(() => {
    getProvinces()
      .then((data) => setProvinces(data.data))
      .catch((err) => console.error("Error fetching provinces:", err));
  }, []);

  // ✅ Load wards when province changes
  useEffect(() => {
    if (selectedProvince) {
      const provinceObj = provinces.find((p) => p.province === selectedProvince);
      setWards(provinceObj?.wards || []);
    } else {
      setWards([]);
    }
  }, [selectedProvince, provinces]);

  // ✅ Fetch hospital data
  const fetchHospitalData = async () => {
    if (!user?.hospitals?.[0]?.id) {
      console.warn('No hospital ID found for user');
      return;
    }

    setDepartmentsLoading(true);
    setSpecializationsLoading(true);
    
    try {
      const hospitalId = user.hospitals[0].id;
      console.log('🏥 Fetching data for hospital ID:', hospitalId);

      const [hospital, specs, depts] = await Promise.all([
        getHospitalById(hospitalId),
        getSpecializationsByHospitalId(hospitalId),
        getDepartmentsByHospitalId(hospitalId)
      ]);

      setCurrentHospital(hospital);
      setHospitalSpecializations(specs);
      setHospitalDepartments(depts);

      console.log('🏥 Current hospital set:', hospital);
      console.log('🩺 Hospital specializations set:', specs);
      console.log('🏢 Hospital departments set:', depts);

    } catch (error) {
      console.error('❌ Error fetching hospital data:', error);

      // Fallback
      const fallbackHospitalId = user?.hospitals?.[0]?.id || 105;
      setCurrentHospital({
        id: fallbackHospitalId,
        name: user?.hospitals?.[0]?.name || 'Default Hospital',
        address: 'Unknown'
      });

      setHospitalSpecializations(propSpecializations || []);
      setHospitalDepartments(propDepartments || []);

      message.warning('Could not load hospital data. Using default values.');
    } finally {
      setDepartmentsLoading(false);
      setSpecializationsLoading(false);
    }
  };

  // ✅ SINGLE useEffect để set form data - Remove duplicate
  useEffect(() => {
    if (staff && visible && provinces.length > 0) {
      console.log("🔧 EditStaff initializing with staff:", staff);

      // ✅ Parse và prepare form data với better error handling
      const prepareFormData = () => {
        let formData = {};

        try {
          if (staff.originalData) {
            const { doctor, user } = staff.originalData;
            console.log("📊 Using originalData structure:", { doctor, user });

            // ✅ Parse DOB với multiple format support
            let dobValue = null;
            const dobSource = user.dob || staff.dob;
            if (dobSource) {
              console.log("🗓️ Parsing DOB:", dobSource, typeof dobSource);
              try {
                if (typeof dobSource === 'string') {
                  if (dobSource.includes('T')) {
                    dobValue = dayjs(dobSource); // ISO format
                  } else if (dobSource.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    dobValue = dayjs(dobSource, 'YYYY-MM-DD'); // Date only
                  } else {
                    dobValue = dayjs(dobSource); // Other formats
                  }
                } else {
                  dobValue = dayjs(dobSource);
                }
                
                if (!dobValue.isValid()) {
                  console.warn("⚠️ Invalid DOB, setting to null");
                  dobValue = null;
                } else {
                  console.log("✅ DOB parsed:", dobValue.format('YYYY-MM-DD'));
                }
              } catch (error) {
                console.error("❌ Error parsing DOB:", error);
                dobValue = null;
              }
            }

            // ✅ Parse practicing date
            let practicingFromValue = null;
            const practicingSource = doctor.practicingFrom || staff.practicingFrom;
            if (practicingSource) {
              console.log("🏥 Parsing practicingFrom:", practicingSource);
              try {
                practicingFromValue = dayjs(practicingSource);
                if (!practicingFromValue.isValid()) {
                  practicingFromValue = null;
                } else {
                  console.log("✅ PracticingFrom parsed:", practicingFromValue.format('YYYY-MM-DD'));
                }
              } catch (error) {
                console.error("❌ Error parsing practicingFrom:", error);
                practicingFromValue = null;
              }
            }

            formData = {
              // ✅ Basic Information
              fullname: user.fullname || staff.fullname || staff.name || "",
              email: user.email || staff.email || "",
              phoneNumber: user.phoneNumber || staff.phoneNumber || staff.phone || "",
              gender: typeof user.gender === 'boolean' 
                ? (user.gender ? 'male' : 'female') 
                : (user.gender === 'male' ? 'male' : 'female'),
              dob: dobValue,
              cccd: user.cccd || staff.cccd || "",
              avatarUrl: user.avatarUrl || staff.avatarUrl || staff.avatar || "",
              job: user.job || 'Doctor',

              // ✅ Address Information
              province: user.province || staff.province || "",
              ward: user.ward || staff.ward || "",
              streetAddress: user.streetAddress || staff.streetAddress || "",

              // ✅ Professional Information
              departmentId: staff.departmentId || null,
              specializationIds: staff.specializationIds || [],
              description: doctor.description || staff.description || "",
              practicingFrom: practicingFromValue,

              // ✅ Hospital affiliations
              hospitalAffiliations: staff.hospitalAffiliations || []
            };

          } else {
            // ✅ Handle direct staff object structure
            console.log("📊 Using direct staff structure");

            let dobValue = null;
            if (staff.dob) {
              try {
                dobValue = dayjs(staff.dob);
                if (!dobValue.isValid()) dobValue = null;
              } catch (error) {
                console.error("❌ Error parsing staff DOB:", error);
                dobValue = null;
              }
            }

            let practicingFromValue = null;
            if (staff.practicingFrom) {
              try {
                practicingFromValue = dayjs(staff.practicingFrom);
                if (!practicingFromValue.isValid()) practicingFromValue = null;
              } catch (error) {
                practicingFromValue = null;
              }
            }

            formData = {
              fullname: staff.fullname || staff.name || "",
              email: staff.email || "",
              phoneNumber: staff.phoneNumber || staff.phone || "",
              gender: typeof staff.gender === 'boolean' 
                ? (staff.gender ? 'male' : 'female') 
                : (staff.gender === 'male' ? 'male' : 'female'),
              dob: dobValue,
              cccd: staff.cccd || "",
              avatarUrl: staff.avatarUrl || staff.avatar || "",
              job: 'Doctor',
              province: staff.province || "",
              ward: staff.ward || "",
              streetAddress: staff.streetAddress || "",
              departmentId: staff.departmentId || null,
              specializationIds: staff.specializationIds || [],
              description: staff.description || "",
              practicingFrom: practicingFromValue,
              hospitalAffiliations: staff.hospitalAffiliations || []
            };
          }

          return formData;

        } catch (error) {
          console.error("❌ Error preparing form data:", error);
          // ✅ Return minimal safe data
          return {
            fullname: staff.fullname || staff.name || "",
            email: staff.email || "",
            phoneNumber: staff.phoneNumber || staff.phone || "",
            gender: 'male',
            dob: null,
            cccd: "",
            avatarUrl: "",
            job: 'Doctor',
            province: "",
            ward: "",
            streetAddress: "",
            departmentId: null,
            specializationIds: [],
            description: "",
            practicingFrom: null,
            hospitalAffiliations: []
          };
        }
      };

      const formData = prepareFormData();
      
      console.log("📝 Final form data to set:", formData);
      console.log("🗓️ DOB value:", formData.dob, formData.dob?.format?.('YYYY-MM-DD'));
      console.log("🏥 Department ID:", formData.departmentId);
      console.log("🩺 Specialization IDs:", formData.specializationIds);

      // ✅ Set form values
      form.setFieldsValue(formData);

      // ✅ Set selected province để load wards
      if (formData.province) {
        setSelectedProvince(formData.province);
      }

      // ✅ Fetch hospital data sau khi set form
      fetchHospitalData();

    }
  }, [staff, visible, provinces, form]); // ✅ Proper dependencies

  // ✅ Handle form values change
  const onFormValuesChange = (changedValues) => {
    console.log("📝 Form values changed:", changedValues);
    
    if ("province" in changedValues) {
      const newProvince = changedValues.province || null;
      setSelectedProvince(newProvince);
      
      // ✅ Clear ward when province changes
      if (newProvince !== selectedProvince) {
        form.setFieldsValue({ ward: undefined });
      }
    }
  };

  // ✅ Enhanced handleSubmit với better validation
  const handleSubmit = async (values) => {
    setLoading(true);

    try {
      console.log('🔄 Starting update process for staff ID:', staff.id);
      console.log('📝 Form values received:', values);

      // ✅ Pre-submit validation
      if (!values.dob) {
        message.error('Date of birth is required');
        setLoading(false);
        return;
      }

      if (!values.departmentId) {
        message.error('Department selection is required');
        setLoading(false);
        return;
      }

      if (!values.specializationIds || values.specializationIds.length === 0) {
        message.error('At least one specialization is required');
        setLoading(false);
        return;
      }

      // ✅ Get hospital ID
      const hospitalId = currentHospital?.id || user?.hospitals?.[0]?.id;
      if (!hospitalId) {
        throw new Error('Hospital ID not found. Please refresh and try again.');
      }

      // ✅ Format dates properly
      let dobFormatted = null;
      if (values.dob) {
        try {
          if (typeof values.dob === 'string') {
            dobFormatted = values.dob.match(/^\d{4}-\d{2}-\d{2}$/) 
              ? values.dob 
              : dayjs(values.dob).format('YYYY-MM-DD');
          } else if (values.dob && values.dob.format) {
            dobFormatted = values.dob.format('YYYY-MM-DD');
          } else {
            dobFormatted = dayjs(values.dob).format('YYYY-MM-DD');
          }
        } catch (error) {
          console.error('❌ Error formatting DOB:', error);
          throw new Error('Invalid date of birth format');
        }
      }

      let practicingFromFormatted = null;
      if (values.practicingFrom) {
        try {
          if (typeof values.practicingFrom === 'string') {
            practicingFromFormatted = values.practicingFrom;
          } else if (values.practicingFrom.toISOString) {
            practicingFromFormatted = values.practicingFrom.toISOString();
          } else {
            practicingFromFormatted = dayjs(values.practicingFrom).toISOString();
          }
        } catch (error) {
          console.error('❌ Error formatting practicingFrom:', error);
          practicingFromFormatted = null;
        }
      }

      // ✅ Prepare update payload
      const updateData = {
        id: staff.originalData?.id || staff.id,
        
        hospitalAffiliations: [{
          hospitalId: parseInt(hospitalId),
          departmentId: parseInt(values.departmentId),
          contractStart: dayjs().toISOString(),
          contractEnd: dayjs().add(1, 'year').toISOString(),
          position: "Doctor"
        }],

        user: {
          id: staff.originalData?.user?.id || staff.userId || staff.id,
          fullname: values.fullname?.trim() || "",
          phoneNumber: values.phoneNumber?.trim() || "",
          email: values.email?.trim() || "",
          avatarUrl: values.avatarUrl?.trim() || "",
          dob: dobFormatted,
          gender: values.gender === 'male',
          job: values.job || 'Doctor',
          cccd: values.cccd?.trim() || "",
          province: values.province?.trim() || "",
          ward: values.ward?.trim() || "",
          streetAddress: values.streetAddress?.trim() || ""
        },

        doctor: {
          id: staff.originalData?.id || staff.id,
          description: values.description?.trim() || "",
          practicingFrom: practicingFromFormatted,
        },

        description: values.description?.trim() || "",
        practicingFrom: practicingFromFormatted,
        specializationIds: Array.isArray(values.specializationIds) 
          ? values.specializationIds 
          : [values.specializationIds]
      };

      console.log('📤 Update payload:', JSON.stringify(updateData, null, 2));

      const response = await updateDoctor(staff.id, updateData);
      console.log('📥 Update response:', response);

      // ✅ Handle success
      const isSuccess = (
        response === true ||
        response?.success === true ||
        response?.success !== false ||
        (response?.status >= 200 && response?.status < 300) ||
        response?.message?.toLowerCase().includes('success') ||
        (!response?.error && response !== false && response !== null)
      );

      if (isSuccess) {
        console.log('✅ Doctor updated successfully');
        message.success('Doctor updated successfully!');
        dispatch(setMessage({
          type: 'success',
          content: '🎉 Doctor information updated successfully!',
          duration: 4
        }));

        onSuccess();
      } else {
        const errorMessage = response?.message || response?.error || 'Failed to update doctor';
        throw new Error(errorMessage);
      }

    } catch (error) {
      console.error('❌ Error updating doctor:', error);

      let errorMessage = 'Failed to update doctor. Please try again.';

      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.title) {
          errorMessage = error.response.data.title;
        } else if (error.response.data.errors) {
          const validationErrors = [];
          Object.entries(error.response.data.errors).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              messages.forEach(msg => validationErrors.push(`${field}: ${msg}`));
            } else {
              validationErrors.push(`${field}: ${messages}`);
            }
          });
          errorMessage = validationErrors.join('\n');
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      message.error(errorMessage);
      dispatch(setMessage({
        type: 'error',
        content: `❌ ${errorMessage}`,
        duration: 8
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedProvince(null);
    setWards([]);
    setCurrentHospital(null);
    setHospitalDepartments([]);
    setHospitalSpecializations([]);
    onCancel();
  };

  if (!staff) return null;

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <EditOutlined style={{
            color: '#1890ff',
            marginRight: 8,
            fontSize: '20px'
          }} />
          <span style={{ fontSize: '18px', fontWeight: 600 }}>
            Edit Doctor - {staff.fullname || staff.name}
          </span>
          {currentHospital && (
            <span style={{
              fontSize: '12px',
              color: '#666',
              marginLeft: '8px',
              fontWeight: 'normal'
            }}>
              ({currentHospital.name})
            </span>
          )}
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={1000}
      destroyOnClose
      style={{ top: 20 }}
      maskClosable={false}
    >
      <Spin spinning={loading}>
        <div style={{ maxHeight: '70vh', overflowY: 'auto', padding: '0 4px' }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            onValuesChange={onFormValuesChange}
            preserve={false}
          >
            {/* Basic Information */}
            <div style={{
              marginBottom: 32,
              padding: '20px',
              background: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e8e8e8'
            }}>
              <h3 style={{
                color: '#1890ff',
                marginBottom: 20,
                fontSize: '16px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center'
              }}>
                <UserOutlined style={{ marginRight: 8 }} />
                Basic Information
              </h3>

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
                    <Input placeholder="Full name" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="email"
                    label="Email Address"
                    rules={[
                      { required: true, message: 'Please enter email' },
                      { type: 'email', message: 'Please enter valid email' }
                    ]}
                  >
                    <Input placeholder="email@hospital.com" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={8}>
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
                    rules={[
                      { required: true, message: 'Please select date of birth' }, // ✅ Add required validation
                      {
                        validator: (_, value) => {
                          if (value && dayjs().diff(value, 'years') < 18) {
                            return Promise.reject(new Error('Must be at least 18 years old'));
                          }
                          if (value && dayjs().diff(value, 'years') > 100) {
                            return Promise.reject(new Error('Please enter a valid birth date'));
                          }
                          return Promise.resolve();
                        }
                      }
                    ]}
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      placeholder="Select date of birth"
                      format="YYYY-MM-DD"
                      disabledDate={(current) => {

                        return current && (
                          current > dayjs().endOf('day') ||
                          current < dayjs().subtract(100, 'years')
                        );
                      }}
                      showToday={false}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="cccd"
                    label="CCCD/ID Card Number"
                    rules={[
                      { pattern: /^[0-9]{9,12}$/, message: 'ID must be 9-12 digits' }
                    ]}
                  >
                    <Input placeholder="Enter ID number" />
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
                <Col xs={24} md={12}>
                  <Form.Item
                    name="job"
                    label="Job Title"
                  >
                    <Input placeholder="Doctor" />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* Professional Information */}
            <div style={{
              marginBottom: 32,
              padding: '20px',
              background: '#f0f7ff',
              borderRadius: '8px',
              border: '1px solid #d6e4ff'
            }}>
              <h3 style={{
                color: '#1890ff',
                marginBottom: 20,
                fontSize: '16px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center'
              }}>
                <MedicineBoxOutlined style={{ marginRight: 8 }} />
                Professional Information
                {hospitalDepartments.length > 0 && (
                  <span style={{
                    fontSize: '12px',
                    color: '#666',
                    marginLeft: '8px',
                    fontWeight: 'normal'
                  }}>
                    ({hospitalDepartments.length} departments available)
                  </span>
                )}
              </h3>

              <Form.Item
                name="description"
                label="Professional Description"
              >
                <TextArea
                  rows={3}
                  placeholder="Brief professional description or summary"
                />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="departmentId"
                    label="Department"
                    rules={[{ required: true, message: 'Please select department' }]}
                  >
                    <Select
                      placeholder={hospitalDepartments.length > 0 ? "Select department" : "Loading departments..."}
                      loading={departmentsLoading}
                      showSearch
                      filterOption={(input, option) =>
                        option?.children?.toLowerCase().includes(input.toLowerCase())
                      }
                      notFoundContent={hospitalDepartments.length === 0 ? "No departments found" : "No matching departments"}
                    >
                      {hospitalDepartments?.map(dept => (
                        <Option key={dept.id} value={dept.id}>
                          🏥 {dept.name}
                          {dept.description && (
                            <span style={{ color: '#999', fontSize: '12px' }}>
                              {' - ' + dept.description}
                            </span>
                          )}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="specializationIds"
                    label="Specializations"
                    rules={[{ required: true, message: 'Please select specializations' }]}
                  >
                    <Select
                      mode="multiple"
                      placeholder={hospitalSpecializations.length > 0 ? "Select specializations" : "Loading specializations..."}
                      loading={specializationsLoading}
                      showSearch
                      notFoundContent={hospitalSpecializations.length === 0 ? "No specializations found" : "No matching specializations"}
                    >
                      {hospitalSpecializations?.map(spec => (
                        <Option key={spec.id} value={spec.id}>
                          🩺 {spec.name}
                          {spec.description && (
                            <span style={{ color: '#999', fontSize: '12px' }}>
                              {' - ' + spec.description}
                            </span>
                          )}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="practicingFrom"
                    label="Practicing Since"
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      placeholder="Select date"
                      format="YYYY-MM-DD"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* Address Information */}
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
                📍 Address Information
              </h3>

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
                      allowClear
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      options={provinces.map((p) => ({
                        label: p.province,
                        value: p.province,
                      }))}
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
                      placeholder="Select ward"
                      disabled={!selectedProvince}
                      showSearch
                      allowClear
                      options={wards.map((w) => ({ label: w.name, value: w.name }))}
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Form.Item
                    name="streetAddress"
                    label="Street Address"
                    rules={[{ required: true, message: 'Please enter street address' }]}
                  >
                    <Input placeholder="123 Nguyen Hue Street" />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* Form Actions */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 12,
              paddingTop: 16,
              borderTop: '1px solid #f0f0f0'
            }}>
              <Button onClick={handleCancel} size="large" disabled={loading}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                icon={<SaveOutlined />}
              >
                {loading ? 'Updating...' : 'Update Doctor'}
              </Button>
            </div>
          </Form>
        </div>
      </Spin>
    </Modal>
  );
};

export default EditStaff;