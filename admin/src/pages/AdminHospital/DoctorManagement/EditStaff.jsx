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
  MedicineBoxOutlined,
  HeartOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { setMessage, clearMessage } from '../../../redux/slices/messageSlice';
import { getDoctorDetail, updateDoctor } from '../../../services/doctorService';
import { updateUser, getUserById } from '../../../services/userService';
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
  const [nurseDetail, setNurseDetail] = useState(null);

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

  // ✅ ENHANCED: Modal initialization with getUserById instead of getStaffNurseByUserId
  useEffect(() => {
    const initializeEditModal = async () => {
      if (!visible || !staff) {
        console.log('❌ Modal not visible or no staff data:', { visible, staff });
        return;
      }

      setInitialLoading(true);
      console.log('🔄 Starting to initialize edit modal...');
      console.log('📊 Staff object received:', JSON.stringify(staff, null, 2));

      try {
        // Load basic data first
        console.log('🔄 Loading departments and specializations...');
        const [deptData, specData] = await Promise.all([
          loadDepartments(),
          loadSpecializations()
        ]);

        const isDoctor = staff.type === 'doctor' || staff.editApiType === 'updateDoctor';
        const isNurse = staff.type === 'nurse' || staff.editApiType === 'updateUser' || staff.type === 'staff';
        console.log('👨‍⚕️ Is doctor:', isDoctor, '👩‍⚕️ Is nurse:', isNurse);
        console.log('🆔 Staff ID:', staff.id, 'User ID:', staff.userId, 'Staff Type:', staff.type);

        if (isDoctor && staff.id) {
          // ✅ Load doctor detail
          console.log('🔄 Calling getDoctorDetail with ID:', staff.id);
          const response = await getDoctorDetail(staff.id);
          console.log('✅ Doctor detail FULL response:', JSON.stringify(response, null, 2));

          if (response && (response.result || response.id)) {
            const doctorData = response.result || response;
            console.log('📊 Doctor data extracted:', doctorData);
            setDoctorDetail(doctorData);
            
            // ✅ Wait a bit for modal to render completely
            setTimeout(async () => {
              await setDoctorFormData(doctorData, deptData);
            }, 100);
            
            dispatch(setMessage({
              type: 'success',
              content: `✅ Đã tải thông tin bác sĩ "${doctorData.user?.fullname}"`
            }));
          } else {
            console.log('❌ No valid doctor data in response, using fallback');
            setTimeout(() => {
              setFallbackFormData(staff, deptData);
            }, 100);
          }

        } else if (isNurse) {
          // ✅ ENHANCED: Use getUserById instead of getStaffNurseByUserId
          const nurseUserId = staff.id || staff.userId || staff.user?.id;
          console.log('🔄 Attempting to load nurse user with ID:', nurseUserId);
          console.log('🔍 Available IDs in staff:', {
            id: staff.id,
            userId: staff.userId,
            userNestedId: staff.user?.id,
            staffId: staff.staffId
          });

          if (nurseUserId) {
            try {
              console.log('🔄 Calling getUserById with user ID:', nurseUserId);
              const response = await getUserById(nurseUserId);
              console.log('✅ User detail FULL response:', JSON.stringify(response, null, 2));

              // ✅ ENHANCED response parsing for getUserById
              let userData = null;
              if (response?.result) {
                userData = response.result;
                console.log('📊 User data from result:', userData);
              } else if (response?.data) {
                userData = response.data;
                console.log('📊 User data from data:', userData);
              } else if (response && response.id) {
                userData = response;
                console.log('📊 User data direct:', userData);
              } else if (response && (response.fullname || response.email)) {
                userData = response;
                console.log('📊 User data by properties:', userData);
              }

              if (userData) {
                // ✅ Merge staff data with user data for complete nurse information
                const mergedNurseData = {
                  ...userData,
                  staffId: staff.staffId || userData.staffId,
                  hospitalId: staff.hospitalId || userData.hospitalId || hospitalId,
                  hospitalName: staff.hospitalName || userData.hospitalName,
                  roleId: staff.roleId || userData.roleId,
                  roleName: staff.roleName || userData.roleName || staff.job,
                  roleType: staff.roleType || userData.roleType
                };
                
                console.log('📊 Merged nurse data:', mergedNurseData);
                setNurseDetail(mergedNurseData);
                
                // ✅ CRITICAL FIX: Wait for modal to render completely
                setTimeout(async () => {
                  await setNurseFormData(mergedNurseData, deptData);
                }, 300);
                
                dispatch(setMessage({
                  type: 'success',
                  content: `✅ Đã tải thông tin điều dưỡng "${userData.fullname || userData.name}"`
                }));
              } else {
                console.log('❌ No valid user data in response, using fallback');
                console.log('📄 Full response for debugging:', response);
                setTimeout(() => {
                  setFallbackFormData(staff, deptData);
                }, 100);
              }

            } catch (userError) {
              console.error('❌ Error loading user data:', userError);
              console.log('🔄 Fallback to staff data due to API error');
              setTimeout(() => {
                setFallbackFormData(staff, deptData);
              }, 100);
            }

          } else {
            console.log('❌ No valid user ID found, using fallback');
            setTimeout(() => {
              setFallbackFormData(staff, deptData);
            }, 100);
          }

        } else {
          console.log('🔧 Unknown staff type or missing ID, using fallback data');
          setTimeout(() => {
            setFallbackFormData(staff, deptData);
          }, 100);
        }

      } catch (error) {
        console.error('❌ Error loading edit data:', error);
        dispatch(setMessage({
          type: 'error',
          content: '❌ Không thể tải thông tin. Vui lòng thử lại.'
        }));

        // Set fallback data
        setTimeout(() => {
          setFallbackFormData(staff, departments);
        }, 100);
      } finally {
        setInitialLoading(false);
        console.log('✅ Finished initializing edit modal');
      }
    };

    initializeEditModal();
  }, [visible, staff, hospitalId, form, dispatch]);

  // ✅ Set doctor form data
  const setDoctorFormData = async (doctorData, deptData) => {
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
      gender: userData.gender === true ? 'male' : 'female',
      dob: parseDob,
      cccd: userData.cccd || "",
      avatarUrl: userData.avatarUrl || "",
      job: userData.job || 'Bác sĩ',

      // Address info - direct mapping from API
      province: userData.province || "",
      ward: userData.ward || "",
      streetAddress: userData.streetAddress || "",

      // Doctor specific info
      description: doctorData.description || "",
      practicingFrom: parsePracticingFrom,
      departmentId: departmentId,
      specializationIds: specializationIds
    };

    console.log('✅ FINAL doctor form data to be set:', JSON.stringify(formData, null, 2));

    // ✅ Set form data with multiple attempts
    form.setFieldsValue(formData);
    console.log('✅ Doctor form values set successfully');

    // ✅ Force update multiple times
    setTimeout(() => {
      form.setFieldsValue(formData);
      form.validateFields();
      console.log('✅ Doctor form values set successfully (backup 1)');
    }, 100);

    setTimeout(() => {
      form.setFieldsValue(formData);
      console.log('✅ Doctor form values set successfully (backup 2)');
    }, 300);
  };

  // ✅ UPDATED: Enhanced nurse form data setter using getUserById response
  const setNurseFormData = async (nurseData, deptData) => {
    console.log('👩‍⚕️ Setting nurse form data...');
    console.log('📊 Nurse data received:', JSON.stringify(nurseData, null, 2));

    // ✅ Set province for ward loading BEFORE form data
    if (nurseData.province) {
      console.log('🌏 Setting nurse province:', nurseData.province);
      setSelectedProvince(nurseData.province);
    }

    // Parse dates
    const parseDob = safeParseDob(nurseData.dob);
    console.log('📅 Parsed DOB:', parseDob);

    // ✅ Enhanced gender detection from getUserById response
    const genderValue = nurseData.gender === true ? 'male' : 
                       nurseData.gender === false ? 'female' : 
                       nurseData.fullname?.toLowerCase().includes('thi') ? 'female' : 'male';

    // ✅ ENHANCED form data mapping optimized for getUserById response
    const formData = {
      // User basic info - direct mapping from getUserById API response
      fullname: nurseData.fullname || nurseData.name || nurseData.fullName || "",
      email: nurseData.email || nurseData.emailAddress || "",
      phoneNumber: nurseData.phoneNumber || nurseData.phone || nurseData.mobilePhone || "",
      gender: genderValue,
      dob: parseDob,
      cccd: nurseData.cccd || nurseData.identityCard || nurseData.citizenId || "",
      avatarUrl: nurseData.avatarUrl || nurseData.avatar || nurseData.profilePicture || "",
      job: nurseData.job || nurseData.position || nurseData.roleName || 'Điều dưỡng',

      // Address info - direct mapping from getUserById API response
      province: nurseData.province || nurseData.city || "",
      ward: nurseData.ward || nurseData.district || "",
      streetAddress: nurseData.streetAddress || nurseData.address || nurseData.street || "",

      // Nurse specific info
      description: nurseData.description || nurseData.bio || "",
      
      // Additional nurse fields merged from staff data
      staffId: nurseData.staffId || nurseData.employeeId || "",
      hospitalId: nurseData.hospitalId || "",
      hospitalName: nurseData.hospitalName || nurseData.hospital?.name || "",
      roleId: nurseData.roleId || "",
      roleName: nurseData.roleName || "",
      roleType: nurseData.roleType || ""
    };

    console.log('✅ FINAL nurse form data to be set:', JSON.stringify(formData, null, 2));

    // ✅ CRITICAL FIX: Multiple form setting attempts with longer delays
    form.setFieldsValue(formData);
    console.log('✅ Nurse form values set immediately');

    // ✅ Force form update with increasing delays
    setTimeout(() => {
      form.setFieldsValue(formData);
      const currentValues = form.getFieldsValue();
      console.log('✅ Nurse form values set with delay 1 (200ms)');
      console.log('🔍 Current form values after setting:', currentValues);
    }, 200);

    setTimeout(() => {
      form.setFieldsValue(formData);
      form.validateFields();
      console.log('✅ Nurse form values set with delay 2 (500ms) + validation');
    }, 500);

    // ✅ Final verification and force update
    setTimeout(() => {
      const finalValues = form.getFieldsValue();
      console.log('🔍 Final form values verification:', finalValues);
      
      // Check if critical fields are empty and retry if needed
      if (!finalValues.fullname && nurseData.fullname) {
        console.log('⚠️ Form values not set properly, force setting again...');
        form.setFieldsValue(formData);
        
        // One more try with validation
        setTimeout(() => {
          form.setFieldsValue(formData);
          form.validateFields();
          console.log('🔄 Final force update completed');
        }, 100);
      }
    }, 800);
  };

  // ✅ ENHANCED fallback form data setter
  const setFallbackFormData = (staffData, deptData = departments) => {
    console.log('📋 Setting fallback data...');
    console.log('📊 Staff data for fallback:', JSON.stringify(staffData, null, 2));

    // ✅ Try to get data from staff object with multiple nested paths
    const staffUser = staffData.user || staffData;
    console.log('👤 Staff user data:', staffUser);

    const parseDob = safeParseDob(staffUser.dob || staffData.dob);
    const parsePracticingFrom = safeParseDob(staffUser.practicingFrom || staffData.practicingFrom);

    const province = staffUser.province || staffData.province;
    if (province) {
      setSelectedProvince(province);
      console.log('🌏 Fallback province set:', province);
    }

    // ✅ Better gender detection for fallback
    const fallbackGender = typeof staffUser.gender === 'boolean'
      ? (staffUser.gender ? 'male' : 'female')
      : staffData.fullname?.toLowerCase().includes('thi') || staffData.name?.toLowerCase().includes('thi') ? 'female' : 'male';

    const fallbackData = {
      fullname: staffUser.fullname || staffUser.name || staffData.fullname || staffData.name || "",
      email: staffUser.email || staffData.email || "",
      phoneNumber: staffUser.phoneNumber || staffUser.phone || staffData.phoneNumber || staffData.phone || "",
      gender: fallbackGender,
      dob: parseDob,
      cccd: staffUser.cccd || staffData.cccd || "",
      avatarUrl: staffUser.avatarUrl || staffUser.avatar || staffData.avatarUrl || staffData.avatar || "",
      job: staffUser.job || staffData.job || (staffData.type === 'doctor' ? 'Bác sĩ' : 'Điều dưỡng'),
      province: province || "",
      ward: staffUser.ward || staffData.ward || "",
      streetAddress: staffUser.streetAddress || staffData.streetAddress || "",
      departmentId: staffData.departmentId || null,
      specializationIds: staffData.specializationIds || [],
      description: staffData.description || "",
      practicingFrom: parsePracticingFrom
    };

    console.log('📋 FINAL fallback form data:', JSON.stringify(fallbackData, null, 2));
    
    // ✅ Set fallback data with multiple attempts
    form.setFieldsValue(fallbackData);
    console.log('✅ Fallback form values set');

    setTimeout(() => {
      form.setFieldsValue(fallbackData);
      const currentValues = form.getFieldsValue();
      console.log('🔍 Fallback form values after setting:', currentValues);
    }, 200);

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
      setNurseDetail(null);
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
        // ✅ ENHANCED nurse update with getUserById data
        const nurseUserId = nurseDetail?.id || staff.id || staff.userId || staff.user?.id;
        console.log('👩‍⚕️ Nurse user ID for update:', nurseUserId);

        const updateData = {
          id: parseInt(nurseUserId),
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
          streetAddress: values.streetAddress?.trim() || "",
          
          // ✅ Include nurse-specific fields from merged data
          description: values.description?.trim() || "",
          staffId: nurseDetail?.staffId || values.staffId || "",
          hospitalId: nurseDetail?.hospitalId || hospitalId,
          roleId: nurseDetail?.roleId || values.roleId
        };

        console.log('🔄 Nurse update payload:', updateData);
        response = await updateUser(nurseUserId, updateData);
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
    setNurseDetail(null);
    setLoading(false);

    if (typeof onCancel === 'function') {
      onCancel();
    }
  };

  if (!staff) return null;

  const isDoctor = staff.type === 'doctor' || staff.editApiType === 'updateDoctor';

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
                Chỉnh sửa {isDoctor ? 'Bác sĩ' : 'Điều dưỡng'} - {staff.fullname || staff.name}
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
                {isDoctor && (
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

                {/* ✅ Thông tin chuyên môn cho điều dưỡng */}
                {!isDoctor && (
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
                      <HeartOutlined style={{ marginRight: 8 }} />
                      Thông tin nghề nghiệp
                    </h3>

                    <Form.Item
                      name="description"
                      label="Mô tả công việc"
                    >
                      <TextArea
                        rows={3}
                        placeholder="Mô tả ngắn gọn về công việc và kinh nghiệm"
                      />
                    </Form.Item>

                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="job"
                          label="Chức vụ"
                        >
                          <Input placeholder="Điều dưỡng viên, Y tá trưởng..." />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* ✅ Display nurse-specific info from getUserById + staff merged data */}
                    {nurseDetail && (
                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="staffId"
                            label="Mã nhân viên"
                          >
                            <Input placeholder="Staff ID" disabled style={{ backgroundColor: '#f5f5f5' }} />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="roleName"
                            label="Vai trò"
                          >
                            <Input placeholder="Role Name" disabled style={{ backgroundColor: '#f5f5f5' }} />
                          </Form.Item>
                        </Col>
                      </Row>
                    )}
                  </div>
                )}

                {/* Thông tin địa chỉ */}
                <div style={{
                  marginBottom: 24,
                  padding: '20px',
                  background: '#fff7e6',
                  borderRadius: '8px',
                  border: '1px solid #ffd591'
                }}>
                  <h3 style={{
                    color: '#fa8c16',
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