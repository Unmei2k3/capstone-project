import { getAuth, postAuth, putAuth, deleteAuth } from '../utils/request';

const sampleDepartments = []

export const getAllDepartments = async (hospitalId) => {
  try {
    const result = await getAuth(`/departments`);
    console.log(`Fetched services for department :`, result);
    return result.result;
  } catch (error) {
    console.error(`Error fetching services for department ID ${hospitalId}:`, error.message);
    throw error;
  }
};

// Get all departments with pagination and filters


// Get department by ID
export const getDepartmentById = async (id) => {
  try {
    const result = await getAuth(`/departments/${id}`);
    console.log(`Fetched department with ID ${id}:`, result);
    return result.result;
  } catch (error) {
    console.error(`Error fetching department with ID ${id}:`, error.message);
    throw error;
  }
};

// Create new department
export const createDepartment = async (department) => {
  try {
    const result = await postAuth(`/departments/create`, department);
    console.log(`Department created successfully:`, result);
    return result;
  } catch (error) {
    console.error(`Error creating department :`, error.message);
    throw error;
  }
};

// Update department
export const updateDepartment = async (departmentData) => {
  try {
    const result = await putAuth(`/departments/update`, departmentData);
    console.log(`Department updated successfully:`, result);
    return result;
  } catch (error) {
    console.error(`Error updating department with ID ${departmentData.id}:`, error.message);
    throw error;
  }
};

// Delete department
export const deleteDepartment = async (departmentId) => {
  try {
    const result = await deleteAuth(`/departments`, departmentId);
    console.log(`Department deleted successfully:`, result);
    return result;
  } catch (error) {
    console.error(`Error deleting department with ID ${departmentId}:`, error.message);
    throw error;
  }
};

// Get departments for dropdown/select (simple list)
export const getDepartmentsList = async () => {
  try {
    const response = await getAuth('/departments');
    const departments = Array.isArray(response)
      ? response
      : response?.data || response?.items || [];

    return departments.map(dept => ({
      value: dept.id || dept.code,
      label: dept.name,
      code: dept.code
    }));
  } catch (error) {
    console.error('Error fetching departments list:', error);

    if (process.env.NODE_ENV === 'development') {
      return sampleDepartments.map(dept => ({
        value: dept.id,
        label: dept.name,
        code: dept.code
      }));
    }

    return [];
  }
};

// Get department statistics
export const getDepartmentStatistics = async () => {
  try {
    const response = await getAuth('/departments/statistics');
    return response;
  } catch (error) {
    console.error('Error fetching department statistics:', error);

    // Fallback: calculate từ getAllDepartments
    try {
      const allDepts = await getAllDepartments();
      const departments = allDepts.items || [];

      return {
        total: departments.length,
        active: departments.filter(d => d.status === 'active').length,
        inactive: departments.filter(d => d.status === 'inactive').length,
        totalStaff: departments.reduce((sum, d) => sum + (d.totalStaff || 0), 0),
        totalBeds: departments.reduce((sum, d) => sum + (d.totalBeds || 0), 0)
      };
    } catch (fallbackError) {
      console.error('Error in fallback statistics:', fallbackError);

      if (process.env.NODE_ENV === 'development') {
        return {
          total: sampleDepartments.length,
          active: sampleDepartments.filter(d => d.status === 'active').length,
          inactive: sampleDepartments.filter(d => d.status === 'inactive').length,
          totalStaff: sampleDepartments.reduce((sum, d) => sum + (d.totalStaff || 0), 0),
          totalBeds: sampleDepartments.reduce((sum, d) => sum + (d.totalBeds || 0), 0)
        };
      }

      return {
        total: 0,
        active: 0,
        inactive: 0,
        totalStaff: 0,
        totalBeds: 0
      };
    }
  }
};


export const getHospitalDepartments = async (hospitalId) => {
  try {
    const result = await getAuth(`/departments?hospitalId=${hospitalId}`);
    console.log(`Fetched departments for hospital ${hospitalId}:`, result);
    return result.result;
  } catch (error) {
    console.error(`Error fetching departments for hospital ID ${hospitalId}:`, error.message);
    throw error;
  }
};


export const getDepartmentsByHospitalId = async (hospitalId) => {
  try {
    const result = await getAuth(`/departments?hospitalId=${hospitalId}`);
    console.log(`🏥 Fetched departments for hospital ${hospitalId}:`, result);
    return result.result || result;
  } catch (error) {
    console.error(`❌ Error fetching departments for hospital ${hospitalId}:`, error);
    throw error;
  }
};