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
  message,
  ConfigProvider
} from 'antd';
import {
  EditOutlined,
  SaveOutlined,
  UserOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { setMessage, clearMessage } from '../../../redux/slices/messageSlice';
import { getDoctorDetail, updateDoctor } from '../../../services/doctorService';
import { updateUser } from '../../../services/userService';
import { getProvinces } from '../../../services/provinceService';
import { getSpecializationsByHospitalId } from '../../../services/specializationService';
import { getAllDepartments } from '../../../services/departmentService';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import locale from 'antd/locale/vi_VN';

// ✅ Set dayjs locale to Vietnamese
dayjs.locale('vi');

const { Option } = Select;
const { TextArea } = Input;

const EditStaff = ({ visible, onCancel, onSuccess, staff }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  // Data states
  const [hospitalSpecializations, setHospitalSpecializations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [doctorDetail, setDoctorDetail] = useState(null);

  // Address states
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);

  const dispatch = useDispatch();
  const [messageApi, contextHolder] = message.useMessage();
  const messageState = useSelector((state) => state.message);
  const user = useSelector((state) => state.user.user);
  const hospitalId = user?.hospitals?.[0]?.id;

  // Handle Redux messages
  useEffect(() => {
    if (messageState) {
      messageApi.open({
        type: messageState.type,
        content: messageState.content,
      });
      dispatch(clearMessage());
    }
  }, [messageState, messageApi, dispatch]);

  // Load provinces once
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const data = await getProvinces();
        setProvinces(data.data || []);
      } catch (err) {
        console.error("Lỗi khi tải tỉnh thành:", err);
      }
    };
    loadProvinces();
  }, []);

  // Load wards when province changes
  useEffect(() => {
    if (selectedProvince && provinces.length > 0) {
      const provinceObj = provinces.find((p) => p.province === selectedProvince);
      setWards(provinceObj?.wards || []);
    } else {
      setWards([]);
    }
  }, [selectedProvince, provinces]);

  // Load departments
  const loadDepartments = async () => {
    try {
      const response = await getAllDepartments();
      const deptData = Array.isArray(response) ? response : (response?.data || []);
      setDepartments(deptData);
      return deptData;
    } catch (error) {
      console.error('Lỗi khi tải departments:', error);
      return [];
    }
  };

  // Load specializations
  const loadSpecializations = async () => {
    if (!hospitalId) return [];

    try {
      const response = await getSpecializationsByHospitalId(hospitalId);
      setHospitalSpecializations(response || []);
      return response || [];
    } catch (error) {
      console.error('Lỗi khi tải specializations:', error);
      return [];
    }
  };

  // ✅ Enhanced date parsing function
  const safeParseDob = (dateValue) => {
    console.log('🔍 Parsing date value:', dateValue, 'Type:', typeof dateValue);

    if (!dateValue) {
      console.log('❌ Date value is null/undefined');
      return null;
    }

    try {
      let parsedDate;

      if (typeof dateValue === 'string') {
        // Handle different date formats
        if (dateValue.includes('T')) {
          // ISO format: "2025-08-14T10:46:54.305"
          console.log('📅 Parsing ISO format:', dateValue);
          parsedDate = dayjs(dateValue);
        } else if (dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
          // Date only format: "2000-02-02"
          console.log('📅 Parsing YYYY-MM-DD format:', dateValue);
          parsedDate = dayjs(dateValue, 'YYYY-MM-DD');
        } else if (dateValue.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
          // DD/MM/YYYY format
          console.log('📅 Parsing DD/MM/YYYY format:', dateValue);
          parsedDate = dayjs(dateValue, 'DD/MM/YYYY');
        } else {
          console.log('📅 Parsing general format:', dateValue);
          parsedDate = dayjs(dateValue);
        }
      } else {
        console.log('📅 Parsing non-string date:', dateValue);
        parsedDate = dayjs(dateValue);
      }

      const isValid = parsedDate.isValid();
      console.log('✅ Date parsed successfully:', parsedDate.format('DD/MM/YYYY'), 'Valid:', isValid);

      return isValid ? parsedDate : null;
    } catch (error) {
      console.error("❌ Lỗi khi parse date:", error);
      return null;
    }
  };

  // ✅ Main modal initialization - FIXED logic
  useEffect(() => {
    const initializeEditModal = async () => {
      if (!visible || !staff) {
        return;
      }

      setInitialLoading(true);



      try {
        // Load basic data first
        console.log('🔄 Loading departments and specializations...');
        const [deptData, specData] = await Promise.all([
          loadDepartments(),
          loadSpecializations()
        ]);

        const isDoctor = staff.type === 'doctor' || staff.editApiType === 'updateDoctor';
        console.log('👨‍⚕️ Is doctor:', isDoctor, 'Staff ID:', staff.id);

        if (isDoctor && staff.id) {
          // ✅ Load doctor detail
          console.log('🔄 Calling getDoctorDetail with ID:', staff.id);
          const response = await getDoctorDetail(staff.id);
          console.log('✅ Doctor detail FULL response:', JSON.stringify(response, null, 2));

          // ✅ FIXED: Check for response data properly
          if (response && (response.result || response.id)) {
            // ✅ Handle both response.result and direct response
            const doctorData = response.result || response;
            console.log('📊 Doctor data extracted:', doctorData);
            console.log('👤 User data:', doctorData.user);

            setDoctorDetail(doctorData);

            // ✅ Extract data with enhanced debugging
            const userData = doctorData.user;
            const firstAffiliation = doctorData.hospitalAffiliations?.[0] || {};

            console.log('🏥 First affiliation:', firstAffiliation);
            console.log('🏥 Department name from affiliation:', firstAffiliation.departmentName);

            // Find department ID by name
            const departmentId = firstAffiliation.departmentName ?
              deptData.find(d => d.name === firstAffiliation.departmentName)?.id : null;
            console.log('🆔 Mapped department ID:', departmentId);

            // ✅ Set province for ward loading BEFORE form data
            if (userData.province) {
              console.log('🌏 Setting province:', userData.province);
              setSelectedProvince(userData.province);
            }

            // ✅ Enhanced data extraction with specific field debugging
            console.log('📋 CCCD from API:', userData.cccd, 'Type:', typeof userData.cccd);
            console.log('📅 DOB from API:', userData.dob, 'Type:', typeof userData.dob);
            console.log('📅 PracticingFrom from API:', doctorData.practicingFrom, 'Type:', typeof doctorData.practicingFrom);
            console.log('👤 Fullname from API:', userData.fullname);
            console.log('📧 Email from API:', userData.email);
            console.log('📞 Phone from API:', userData.phoneNumber);
            console.log('🏠 Province from API:', userData.province);
            console.log('🏘️ Ward from API:', userData.ward);
            console.log('🏠 Street from API:', userData.streetAddress);
            console.log('👨/👩 Gender from API:', userData.gender, 'Type:', typeof userData.gender);
            console.log('📝 Description from API:', doctorData.description);

            // Parse dates with enhanced debugging
            const parseDob = safeParseDob(userData.dob);
            const parsePracticingFrom = safeParseDob(doctorData.practicingFrom);

            // ✅ Extract specialization IDs
            const specializationIds = doctorData.specializations?.map(s => s.id) || [];
            console.log('🩺 Specialization IDs:', specializationIds);

            // ✅ Build form data with explicit field mapping
            const formData = {
              // User basic info - direct mapping from API
              fullname: userData.fullname || "",
              email: userData.email || "",
              phoneNumber: userData.phoneNumber || "",
              gender: userData.gender === true ? 'male' : 'female',  // ✅ Explicit boolean to string conversion
              dob: parseDob,
              cccd: userData.cccd || "",  // ✅ Direct mapping from API
              avatarUrl: userData.avatarUrl || "",
              job: userData.job || 'Bác sĩ',

              // Address info - direct mapping from API
              province: userData.province || "",
              ward: userData.ward || "",
              streetAddress: userData.streetAddress || "",

              // Doctor specific info
              description: doctorData.description || "",  // ✅ Direct mapping from API
              practicingFrom: parsePracticingFrom,
              departmentId: departmentId,
              specializationIds: specializationIds
            };

            console.log('✅ FINAL form data to be set:', JSON.stringify(formData, null, 2));

            // ✅ Set form data directly without delay first, then verify
            form.setFieldsValue(formData);
            console.log('✅ Form values set successfully (immediate)');

            // ✅ Also set with delay as backup
            setTimeout(() => {
              form.setFieldsValue(formData);
              console.log('✅ Form values set successfully (with delay)');

              // Verify the form was set correctly
              const currentValues = form.getFieldsValue();
              console.log('🔍 Current form values after setting:', currentValues);
              console.log('🔍 CCCD in form:', currentValues.cccd);
              console.log('🔍 DOB in form:', currentValues.dob);
              console.log('🔍 Description in form:', currentValues.description);
              console.log('🔍 Province in form:', currentValues.province);
              console.log('🔍 Ward in form:', currentValues.ward);
            }, 200);

            dispatch(setMessage({
              type: 'success',
              content: `✅ Đã tải thông tin bác sĩ "${userData.fullname}"`
            }));

          } else {
            console.log('❌ No valid data in response, using fallback');
            console.log('📋 Response structure:', response);
            // Fallback to staff data
            setFallbackFormData(staff, deptData);
          }
        } else {
          console.log('👩‍⚕️ Loading nurse data or no staff ID');
          // ✅ For nurses, use staff data directly
          setFallbackFormData(staff, deptData);
        }

      } catch (error) {
        console.error('❌ Error loading edit data:', error);
        dispatch(setMessage({
          type: 'error',
          content: '❌ Không thể tải thông tin. Vui lòng thử lại.'
        }));

        // Set fallback data
        setFallbackFormData(staff, departments);
      } finally {
        setInitialLoading(false);
      }
    };

    initializeEditModal();
  }, [visible, staff, hospitalId, form, dispatch]);

  // ✅ Enhanced fallback form data setter
  const setFallbackFormData = (staffData, deptData = departments) => {
    console.log('📋 Setting fallback data for:', staffData);

    // ✅ Try to get data from staff object first
    const staffUser = staffData.user || staffData;

    const parseDob = safeParseDob(staffUser.dob || staffData.dob);
    const parsePracticingFrom = safeParseDob(staffUser.practicingFrom || staffData.practicingFrom);

    const province = staffUser.province || staffData.province;
    if (province) {
      setSelectedProvince(province);
    }

    const fallbackData = {
      fullname: staffUser.fullname || staffData.fullname || staffData.name || "",
      email: staffUser.email || staffData.email || "",
      phoneNumber: staffUser.phoneNumber || staffData.phoneNumber || staffData.phone || "",
      gender: typeof staffUser.gender === 'boolean'
        ? (staffUser.gender ? 'male' : 'female')
        : (staffUser.gender || staffData.gender || 'male'),
      dob: parseDob,
      cccd: staffUser.cccd || staffData.cccd || "",  // ✅ Check both locations
      avatarUrl: staffUser.avatarUrl || staffData.avatarUrl || staffData.avatar || "",
      job: staffUser.job || staffData.job || 'Bác sĩ',
      province: province || "",
      ward: staffUser.ward || staffData.ward || "",
      streetAddress: staffUser.streetAddress || staffData.streetAddress || "",
      departmentId: staffData.departmentId || null,
      specializationIds: staffData.specializationIds || [],
      description: staffData.description || "",
      practicingFrom: parsePracticingFrom
    };

    console.log('📋 Fallback form data:', fallbackData);
    form.setFieldsValue(fallbackData);

    // ✅ Verify fallback data was set
    setTimeout(() => {
      const currentValues = form.getFieldsValue();
      console.log('🔍 Fallback form values after setting:', currentValues);
    }, 100);

    dispatch(setMessage({
      type: 'info',
      content: '📋 Đã tải thông tin cơ bản'
    }));
  };

  // Reset when modal closes
  useEffect(() => {
    if (!visible) {
      console.log('🚪 Modal closed, resetting form');
      form.resetFields();
      setDoctorDetail(null);
      setSelectedProvince(null);
      setWards([]);
      setLoading(false);
      setInitialLoading(false);
    }
  }, [visible, form]);

  // Handle form values change
  const onFormValuesChange = (changedValues) => {
    console.log('📝 Form values changed:', changedValues);

    if ("province" in changedValues) {
      const newProvince = changedValues.province || null;
      console.log('🌏 Province changed to:', newProvince);
      setSelectedProvince(newProvince);

      if (newProvince !== selectedProvince) {
        form.setFieldsValue({ ward: undefined });
        console.log('🏘️ Ward reset due to province change');
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    console.log('📤 Submitting form with values:', values);

    setLoading(true);

    const isDoctor = staff.type === 'doctor' || staff.editApiType === 'updateDoctor';
    const staffTypeText = isDoctor ? 'bác sĩ' : 'điều dưỡng';

    dispatch(setMessage({
      type: 'loading',
      content: `Đang cập nhật thông tin ${staffTypeText}...`
    }));

    try {
      // Format dates
      let dobFormatted = null;
      if (values.dob) {
        dobFormatted = dayjs(values.dob).format('YYYY-MM-DD');
        console.log('📅 DOB formatted:', dobFormatted);
      }

      let practicingFromFormatted = null;
      if (values.practicingFrom) {
        practicingFromFormatted = dayjs(values.practicingFrom).toISOString();
        console.log('📅 Practicing from formatted:', practicingFromFormatted);
      }

      let response;

      if (isDoctor) {
        // Doctor update
        const doctorId = doctorDetail?.id || staff.id;
        const userId = doctorDetail?.user?.id || staff.userId || staff.user?.id;

        const updateData = {
          id: parseInt(doctorId),
          hospitalAffiliations: [{
            hospitalId: parseInt(hospitalId),
            departmentId: parseInt(values.departmentId),
            contractStart: dayjs().toISOString(),
            contractEnd: dayjs().add(1, 'year').toISOString(),
            position: "Bác sĩ"
          }],
          user: {
            id: parseInt(userId),
            fullname: values.fullname?.trim() || "",
            phoneNumber: values.phoneNumber?.trim() || "",
            email: values.email?.trim() || "",
            avatarUrl: values.avatarUrl?.trim() || "",
            dob: dobFormatted,
            gender: values.gender === 'male',
            job: values.job || 'Bác sĩ',
            cccd: values.cccd?.trim() || "",
            province: values.province?.trim() || "",
            ward: values.ward?.trim() || "",
            streetAddress: values.streetAddress?.trim() || ""
          },
          description: values.description?.trim() || "",
          practicingFrom: practicingFromFormatted || dayjs().toISOString(),
          specializationIds: Array.isArray(values.specializationIds)
            ? values.specializationIds.map(id => parseInt(id))
            : [parseInt(values.specializationIds)]
        };

        console.log('🔄 Doctor update payload:', updateData);
        response = await updateDoctor(updateData);

      } else {
        // Nurse/User update
        const nurseId = staff.id || staff.userId;

        const updateData = {
          id: parseInt(nurseId),
          fullname: values.fullname?.trim() || "",
          phoneNumber: values.phoneNumber?.trim() || "",
          email: values.email?.trim() || "",
          avatarUrl: values.avatarUrl?.trim() || "",
          dob: dobFormatted,
          gender: values.gender === 'male',
          job: values.job || 'Điều dưỡng',
          cccd: values.cccd?.trim() || "",
          province: values.province?.trim() || "",
          ward: values.ward?.trim() || "",
          streetAddress: values.streetAddress?.trim() || ""
        };

        console.log('🔄 Nurse update payload:', updateData);
        response = await updateUser(nurseId, updateData);
      }

      // Success handling
      dispatch(setMessage({
        type: 'success',
        content: `✅ Cập nhật thông tin ${staffTypeText} thành công!`
      }));

      setTimeout(() => {
        dispatch(setMessage({
          type: 'info',
          content: '📋 Dữ liệu đã được lưu vào hệ thống'
        }));
      }, 1500);

      handleCancel();

      if (typeof onSuccess === 'function') {
        onSuccess(response);
      }

    } catch (error) {
      console.error(`❌ Lỗi khi cập nhật ${staffTypeText}:`, error);

      const errorMessage = error.response?.data?.message || error.message || `Cập nhật ${staffTypeText} thất bại`;

      dispatch(setMessage({
        type: 'error',
        content: `❌ ${errorMessage}`
      }));

      if (error.response?.status) {
        setTimeout(() => {
          dispatch(setMessage({
            type: 'warning',
            content: `🔍 Mã lỗi: ${error.response.status}`
          }));
        }, 1000);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    dispatch(setMessage({
      type: 'info',
      content: '🚫 Đã hủy chỉnh sửa thông tin'
    }));

    form.resetFields();
    setSelectedProvince(null);
    setWards([]);
    setDoctorDetail(null);
    setLoading(false);

    if (typeof onCancel === 'function') {
      onCancel();
    }
  };

  if (!staff) return null;

  return (
    <>
      {contextHolder}

      {/* ✅ ConfigProvider with Vietnamese locale */}
      <ConfigProvider locale={locale}>
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <EditOutlined style={{ color: '#1890ff', marginRight: 8, fontSize: '18px' }} />
              <span style={{ fontSize: '16px', fontWeight: 600 }}>
                Chỉnh sửa {(staff.type === 'doctor' || staff.editApiType === 'updateDoctor') ? 'Bác sĩ' : 'Điều dưỡng'} - {staff.fullname || staff.name}
              </span>
            </div>
          }
          open={visible}
          onCancel={handleCancel}
          footer={null}
          width={900}
          centered
          destroyOnClose
          maskClosable={false}
        >
          <Spin spinning={initialLoading || loading} tip={initialLoading ? "Đang tải dữ liệu..." : "Đang xử lý..."}>
            <div style={{ maxHeight: '70vh', overflowY: 'auto', padding: '0 4px' }}>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                onValuesChange={onFormValuesChange}
                preserve={false}
              >
                {/* Thông tin cơ bản */}
                <div style={{
                  marginBottom: 24,
                  padding: '20px',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e8e8e8'
                }}>
                  <h3 style={{
                    color: '#1890ff',
                    marginBottom: 16,
                    fontSize: '16px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <UserOutlined style={{ marginRight: 8 }} />
                    Thông tin cơ bản
                  </h3>

                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="fullname"
                        label="Họ và tên"
                        rules={[
                          { required: true, message: 'Vui lòng nhập họ tên' },
                          { min: 2, message: 'Tên phải có ít nhất 2 ký tự' }
                        ]}
                      >
                        <Input
                          placeholder="Họ và tên"
                          disabled={true}
                          style={{
                            backgroundColor: '#f5f5f5',
                            color: '#666'
                          }}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        name="email"
                        label="Địa chỉ email"
                        rules={[
                          { required: true, message: 'Vui lòng nhập email' },
                          { type: 'email', message: 'Email không hợp lệ' }
                        ]}
                      >
                        <Input
                          placeholder="email@benhvien.com"
                          disabled={true}
                          style={{
                            backgroundColor: '#f5f5f5',
                            color: '#666'
                          }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="phoneNumber"
                        label="Số điện thoại"
                        rules={[
                          { required: true, message: 'Vui lòng nhập số điện thoại' },
                          { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại phải có 10-11 chữ số' }
                        ]}
                      >
                        <Input placeholder="0123456789" />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                      <Form.Item
                        name="gender"
                        label="Giới tính"
                        rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
                      >
                        <Select placeholder="Chọn giới tính">
                          <Option value="male">👨 Nam</Option>
                          <Option value="female">👩 Nữ</Option>
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                      <Form.Item
                        name="dob"
                        label="Ngày sinh"
                        rules={[
                          { required: true, message: 'Vui lòng chọn ngày sinh' }
                        ]}
                      >
                        <DatePicker
                          style={{ width: '100%' }}
                          placeholder="Chọn ngày sinh"
                          format="DD/MM/YYYY"
                          locale={locale.DatePicker}
                          disabledDate={(current) => {
                            return current && current > dayjs().endOf('day');
                          }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="cccd"
                        label="Số CCCD/CMND"
                        rules={[
                          { pattern: /^[0-9]{9,12}$/, message: 'CCCD phải có 9-12 chữ số' }
                        ]}
                      >
                        <Input placeholder="Nhập số CCCD" maxLength={12} />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        name="avatarUrl"
                        label="URL ảnh đại diện"
                      >
                        <Input placeholder="https://example.com/photo.jpg" />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>

                {/* Thông tin chuyên môn - chỉ cho bác sĩ */}
                {(staff.type === 'doctor' || staff.editApiType === 'updateDoctor') && (
                  <div style={{
                    marginBottom: 24,
                    padding: '20px',
                    background: '#f0f7ff',
                    borderRadius: '8px',
                    border: '1px solid #d6e4ff'
                  }}>
                    <h3 style={{
                      color: '#1890ff',
                      marginBottom: 16,
                      fontSize: '16px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <MedicineBoxOutlined style={{ marginRight: 8 }} />
                      Thông tin chuyên môn
                    </h3>

                    <Form.Item
                      name="description"
                      label="Mô tả chuyên môn"
                    >
                      <TextArea
                        rows={3}
                        placeholder="Mô tả ngắn gọn về chuyên môn"
                      />
                    </Form.Item>

                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="departmentId"
                          label="Khoa"
                          rules={[{ required: true, message: 'Vui lòng chọn khoa' }]}
                        >
                          <Select
                            placeholder="Chọn khoa"
                            showSearch
                            filterOption={(input, option) =>
                              option?.children?.toLowerCase().includes(input.toLowerCase())
                            }
                          >
                            {departments.map(dept => (
                              <Option key={dept.id} value={dept.id}>
                                🏥 {dept.name}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>

                      <Col xs={24} md={12}>
                        <Form.Item
                          name="specializationIds"
                          label="Chuyên khoa"
                          rules={[{ required: true, message: 'Vui lòng chọn chuyên khoa' }]}
                        >
                          <Select
                            mode="multiple"
                            placeholder="Chọn chuyên khoa"
                            showSearch
                          >
                            {hospitalSpecializations.map(spec => (
                              <Option key={spec.id} value={spec.id}>
                                🩺 {spec.name}
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
                          label="Hành nghề từ"
                        >
                          <DatePicker
                            style={{ width: '100%' }}
                            placeholder="Chọn ngày hành nghề"
                            format="DD/MM/YYYY"
                            locale={locale.DatePicker}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                )}

                {/* Thông tin địa chỉ */}
                <div style={{
                  marginBottom: 24,
                  padding: '20px',
                  background: '#f6ffed',
                  borderRadius: '8px',
                  border: '1px solid #b7eb8f'
                }}>
                  <h3 style={{
                    color: '#52c41a',
                    marginBottom: 16,
                    fontSize: '16px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    📍 Thông tin địa chỉ
                  </h3>

                  <Row gutter={16}>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="province"
                        label="Tỉnh/Thành phố"
                        rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố' }]}
                      >
                        <Select
                          placeholder="Chọn tỉnh/thành phố"
                          showSearch
                          allowClear
                          loading={provinces.length === 0}
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
                        label="Quận/Huyện"
                        rules={[{ required: true, message: 'Vui lòng chọn quận/huyện' }]}
                      >
                        <Select
                          placeholder="Chọn quận/huyện"
                          disabled={!selectedProvince}
                          showSearch
                          allowClear
                          loading={selectedProvince && wards.length === 0}
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
                        label="Địa chỉ cụ thể"
                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ cụ thể' }]}
                      >
                        <Input placeholder="123 Đường Nguyễn Huệ" />
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
                    Hủy
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    size="large"
                    icon={<SaveOutlined />}
                  >
                    {loading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
                  </Button>
                </div>
              </Form>
            </div>
          </Spin>
        </Modal>
      </ConfigProvider>
    </>
  );
};

export default EditStaff;