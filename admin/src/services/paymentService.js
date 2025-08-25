import { getAuth, postAuth, putAuth, putAuthNum } from "../utils/request";

export const getPayments = async (hospitalId, userId) => {
  try {
    let url = `/payment`;
    const queryParams = [];

    if (hospitalId !== undefined && hospitalId !== null) {
      queryParams.push(`hospitalId=${encodeURIComponent(hospitalId)}`);
    }
    if (userId !== undefined && userId !== null) {
      queryParams.push(`userId=${encodeURIComponent(userId)}`);
    }

    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }

    const result = await getAuth(url);
    return result;
  } catch (error) {
    console.error("Lỗi khi lấy thanh toán:", error);
    throw error;
  }
};

export const getTrackPayments = async (hospitalId) => {
  try {
    const result = await getAuth(`/payment/track-payments?hospitalId=${encodeURIComponent(hospitalId)}`);
    console.log("result in track payments is ", result);
    return result.result;
  } catch (error) {
    console.error('Lỗi khi lấy track payments:', error);
    throw error;
  }
};
export const cancelAppointment = async (appointmentId) => {
  if (!appointmentId) throw new Error('appointmentId là bắt buộc');
  try {
    const result = await putAuth(`/appointments/${appointmentId}/cancel`);
    return result;
  } catch (error) {
    console.error('Lỗi khi hủy lịch hẹn:', error);
    throw error;
  }
};

export const changeAppointmentStatus = async (appointmentId, status) => {
  if (!appointmentId) throw new Error('appointmentId là bắt buộc');
  if (typeof status !== 'string') throw new Error('status phải là string');
  try {
    console.log(`Đang đổi trạng thái lịch hẹn ${appointmentId} sang ${status}`);
    const result = await putAuth(`/appointments/${appointmentId}/change-status`, status);
    return result;
  } catch (error) {
    console.error('Lỗi khi đổi trạng thái lịch hẹn:', error);
    throw error;
  }
};


export const changePaymentStatus = async (paymentId, status) => {
  if (!paymentId) throw new Error('appointmentId là bắt buộc');

  try {
    console.log(`Đang đổi trạng thái lịch hẹn ${paymentId} sang ${status}`);

    const jsonStringBody = JSON.stringify(String(status));

    const result = await putAuthNum(
      `/payment/${paymentId}/change-status`,
      jsonStringBody,
      { 'Content-Type': 'application/json' }
    );

    return result;
  } catch (error) {
    console.error('Lỗi khi đổi trạng thái lịch hẹn:', error);
    throw error;
  }
};

export const getPaymentDetail = async (paymentId) => {

  try {

    const result = await getAuth(`/payment/${paymentId}`);

    return result.result;
  } catch (error) {
    console.error("Lỗi khi lấy yêu cầu theo hospital:", error);
    throw error;
  }
};




export const createPaymentLink = async (paymentData) => {
  try {
    console.log('🔄 Creating payment link:', paymentData);
    const result = await postAuth('/payment/payos/create-payment-link', paymentData);
    console.log('✅ Payment link created:', result);
    return result;
  } catch (error) {
    console.error('❌ Error creating payment link:', error.message);
    throw error;
  }
};

// ✅ Handle transfer (webhook handler)
export const handleTransfer = async (transferData) => {
  try {
    console.log('🔄 Handling transfer:', transferData);
    const result = await postAuth('/payment/payos/transfer_handler', transferData);
    console.log('✅ Transfer handled:', result);
    return result;
  } catch (error) {
    console.error('❌ Error handling transfer:', error.message);
    throw error;
  }
};

// ✅ Confirm webhook
export const confirmWebhook = async (webhookData) => {
  try {
    console.log('🔄 Confirming webhook:', webhookData);
    const result = await postAuth('/payment/payos/confirm-webhook', webhookData);
    console.log('✅ Webhook confirmed:', result);
    return result;
  } catch (error) {
    console.error('❌ Error confirming webhook:', error.message);
    throw error;
  }
};

// ✅ Get payment by order ID
export const getPaymentByOrderId = async (orderId) => {
  try {
    console.log('🔄 Fetching payment for order:', orderId);
    const result = await getAuth(`/payment/payos/${orderId}`);
    console.log('✅ Payment data fetched:', result);
    return result;
  } catch (error) {
    console.error('❌ Error fetching payment:', error.message);
    throw error;
  }
};

// ✅ Cancel payment
export const cancelPayment = async (orderId, cancelData) => {
  try {
    console.log('🔄 Cancelling payment for order:', orderId);
    const result = await putAuth(`/payment/payos/${orderId}/cancel`, cancelData);
    console.log('✅ Payment cancelled:', result);
    return result;
  } catch (error) {
    console.error('❌ Error cancelling payment:', error.message);
    throw error;
  }
};