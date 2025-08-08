import { deleteAuth, getAuth, postAuth, putAuth } from '../utils/request';

// Get reviews with filters
export const getReviews = async (params = {}) => {
  try {
    // Build query string from params
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== 'all') {
        queryParams.append(key, params[key]);
      }
    });
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/reviews?${queryString}` : '/reviews';
    
    const response = await getAuth(endpoint);

    // Xử lý response data từ backend
    if (Array.isArray(response)) {
      return {
        items: response,
        total: response.length
      };
    }

    if (response && typeof response === 'object') {
      return {
        items: response.data || response.items || response.reviews || [],
        total: response.total || response.count || (response.data?.length) || 0,
        page: response.page || params.page || 1,
        pageSize: response.pageSize || params.pageSize || 10
      };
    }

    return {
      items: [],
      total: 0,
      page: 1,
      pageSize: 10
    };

  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw new Error(`Failed to fetch reviews: ${error.message}`);
  }
};

// Get review statistics
export const getReviewStatistics = async () => {
  try {
    const response = await getAuth('/reviews/statistics');
    return response;
  } catch (error) {
    console.error('Error fetching review statistics:', error);
    
    // Return empty statistics if API fails
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0
      },
      statusCount: {
        approved: 0,
        pending: 0,
        under_review: 0,
        escalated: 0
      },
      typeCount: {
        doctor_review: 0,
        service_review: 0,
        facility_review: 0
      }
    };
  }
};

// Update review status
export const updateReviewStatus = async (id, status, notes = '') => {
  try {
    const response = await putAuth(`/reviews/${id}/status`, {
      status,
      notes
    });
    return response;
  } catch (error) {
    console.error('Error updating review status:', error);
    throw new Error(`Failed to update review status: ${error.message}`);
  }
};

// Add response to review
export const addReviewResponse = async (id, responseData) => {
  try {
    const response = await postAuth(`/reviews/${id}/response`, responseData);
    return response;
  } catch (error) {
    console.error('Error adding review response:', error);
    throw new Error(`Failed to add review response: ${error.message}`);
  }
};

// Get departments
export const getDepartments = async () => {
  try {
    const response = await getAuth('/departments');

    if (Array.isArray(response)) {
      return response.map(dept => ({
        name: dept.name,
        value: dept.code || dept.id
      }));
    }

    if (response && response.data) {
      return response.data.map(dept => ({
        name: dept.name,
        value: dept.code || dept.id
      }));
    }

    return [];
  } catch (error) {
    console.error('Error fetching departments:', error);
    return [];
  }
};

// Get review by ID
export const getReviewById = async (id) => {
  try {
    const response = await getAuth(`/reviews/${id}`);
    return response;
  } catch (error) {
    console.error(`Error fetching review ${id}:`, error);
    throw new Error(`Failed to fetch review: ${error.message}`);
  }
};

// Delete review
export const deleteReview = async (id) => {
  try {
    const response = await deleteAuth(`/reviews/${id}`);
    return response;
  } catch (error) {
    console.error(`Error deleting review ${id}:`, error);
    throw new Error(`Failed to delete review: ${error.message}`);
  }
};

// Get doctors for dropdown
export const getDoctors = async () => {
  try {
    const response = await getAuth('/doctors');
    
    if (Array.isArray(response)) {
      return response.map(doctor => ({
        name: doctor.fullName || doctor.name,
        value: doctor.id,
        department: doctor.department
      }));
    }
    
    if (response && response.data) {
      return response.data.map(doctor => ({
        name: doctor.fullName || doctor.name,
        value: doctor.id,
        department: doctor.department
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return [];
  }
};

// Get services for dropdown
export const getServices = async () => {
  try {
    const response = await getAuth('/services');
    
    if (Array.isArray(response)) {
      return response.map(service => ({
        name: service.name,
        value: service.id,
        department: service.department
      }));
    }
    
    if (response && response.data) {
      return response.data.map(service => ({
        name: service.name,
        value: service.id,
        department: service.department
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
};

// Bulk update review status
export const bulkUpdateReviewStatus = async (reviewIds, status, notes = '') => {
  try {
    const response = await putAuth('/reviews/bulk-status', {
      reviewIds,
      status,
      notes
    });
    return response;
  } catch (error) {
    console.error('Error bulk updating review status:', error);
    throw new Error(`Failed to bulk update reviews: ${error.message}`);
  }
};

// Export review to CSV/Excel
export const exportReviews = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== 'all') {
        queryParams.append(key, params[key]);
      }
    });
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/reviews/export?${queryString}` : '/reviews/export';
    
    const response = await getAuth(endpoint);
    return response;
  } catch (error) {
    console.error('Error exporting reviews:', error);
    throw new Error(`Failed to export reviews: ${error.message}`);
  }
};

// Get review trends (for analytics)
export const getReviewTrends = async (period = 'month') => {
  try {
    const response = await getAuth(`/reviews/trends?period=${period}`);
    return response;
  } catch (error) {
    console.error('Error fetching review trends:', error);
    return {
      labels: [],
      datasets: []
    };
  }
};