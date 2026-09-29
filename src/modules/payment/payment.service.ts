

// backend/src/modules/payment/payment.service.ts
// Manual SSLCommerz implementation using direct HTTP requests
// backend/src/modules/payment/payment.service.ts
import prisma from '../../config/prisma';

const store_id = process.env.SSLCOMMERZ_STORE_ID!;
const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD!;
const is_live = process.env.SSLCOMMERZ_IS_LIVE === 'true';

// Direct v4 endpoint
const API_URL = is_live 
  ? 'https://securepay.sslcommerz.com/gwprocess/v4/api.php'
  : 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php';

const VALIDATION_URL = is_live
  ? 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php'
  : 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php';

export const initiateSSLCommerzPayment = async (bookingData: {
  bookingId: string;
  amount: number;
  touristId: string;
}) => {
  if (!store_id || !store_passwd) {
    throw new Error('SSLCommerz credentials not configured in environment');
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingData.bookingId },
    include: { listing: true, tourist: true, guide: true },
  });

  if (!booking) throw new Error('Booking not found');
  if (booking.touristId !== bookingData.touristId) {
    throw new Error('Unauthorized: You can only pay for your own bookings');
  }

  const transactionId = `TXN_${Date.now()}_${bookingData.bookingId.slice(0, 8)}`;

  const formData = new URLSearchParams({
    store_id: store_id,
    store_passwd: store_passwd,
    total_amount: bookingData.amount.toString(),
    currency: 'BDT',
    tran_id: transactionId,
    success_url: `${process.env.BACKEND_URL}/api/payments/success`,
    fail_url: `${process.env.BACKEND_URL}/api/payments/fail`,
    cancel_url: `${process.env.BACKEND_URL}/api/payments/cancel`,
    ipn_url: `${process.env.BACKEND_URL}/api/payments/ipn`,
    
    // Product info
    product_name: booking.listing.title.substring(0, 50),
    product_category: booking.listing.category || 'Travel',
    product_profile: 'general',
    
    // Customer info
    cus_name: booking.tourist.name || 'Guest User',
    cus_email: booking.tourist.email || 'customer@example.com',
    cus_add1: 'Dhaka',
    cus_city: 'Dhaka',
    cus_state: 'Dhaka',
    cus_postcode: '1000',
    cus_country: 'Bangladesh',
    cus_phone: '01700000000',
    
    // Shipping info (Required even for services)
    ship_name: booking.tourist.name || 'Guest User',
    ship_add1: 'Dhaka',
    ship_city: 'Dhaka',
    ship_state: 'Dhaka',
    ship_postcode: '1000',
    ship_country: 'Bangladesh',
    shipping_method: 'NO',
    num_of_item: '1',
    
    // Passthrough metadata
    value_a: bookingData.bookingId,
    value_b: booking.touristId,
    value_c: booking.guideId,
    value_d: booking.listingId,
  });

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        // Critical: Custom User-Agent prevents sandbox WAF timeout drops
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      body: formData.toString(),
      signal: AbortSignal.timeout(15000),
    });

    const responseText = await response.text();
    let apiResponse;

    try {
      apiResponse = JSON.parse(responseText);
    } catch {
      console.error('Non-JSON SSLCommerz Response:', responseText);
      throw new Error('SSLCommerz gateway returned an invalid payload.');
    }

    if (apiResponse.status === 'SUCCESS') {
      await prisma.booking.update({
        where: { id: bookingData.bookingId },
        data: {
          transactionId: transactionId,
          paymentStatus: 'PENDING',
        },
      });

      return {
        success: true,
        paymentUrl: apiResponse.GatewayPageURL,
        transactionId: transactionId,
      };
    } else {
      throw new Error(apiResponse.failedreason || 'Payment initialization failed');
    }
  } catch (error: any) {
    if (error.name === 'TimeoutError') {
      throw new Error('SSLCommerz Sandbox server unreachable. Check network/VPN settings.');
    }
    throw error;
  }
};

// export const validateSSLCommerzPayment = async (val_id: string) => {
//   try {
//     const formData = new URLSearchParams({
//       val_id: val_id,
//       store_id: store_id,
//       store_passwd: store_passwd,
//       format: 'json',
//     });

//     const response = await fetch(VALIDATION_URL, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//       },
//       body: formData.toString(),
//     });

//     const validation = await response.json();
//     return validation;
//   } catch (error: any) {
//     console.error('Validation Error:', error);
//     throw new Error('Payment validation failed');
//   }
// };

export const validateSSLCommerzPayment = async (val_id: string) => {
  try {
    // Construct URL with Query Parameters
    const params = new URLSearchParams({
      val_id: val_id,
      store_id: store_id,
      store_passwd: store_passwd,
      format: 'json',
    });

    const url = `${VALIDATION_URL}?${params.toString()}`;
    
    console.log('Validating payment at:', url);

    const response = await fetch(url);
    const validation = await response.json();
    
    console.log('Validation API Result:', validation);
    return validation;
  } catch (error: any) {
    console.error('Validation API Error:', error.message);
    throw new Error('Payment validation failed');
  }
};
export const handlePaymentSuccess = async (paymentData: any) => {
  try {
    const { tran_id, val_id, amount, card_type, store_amount, bank_tran_id } = paymentData;
    const bookingId = paymentData.value_a;

    if (!bookingId) {
      throw new Error('Booking ID not found in payment data');
    }

    console.log('Processing payment success for booking:', bookingId);

    // Validate payment with SSLCommerz
    const validation = await validateSSLCommerzPayment(val_id);

    if (validation.status === 'VALID' || validation.status === 'VALIDATED') {
      // Update booking
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          paymentStatus: 'COMPLETED',
          transactionId: tran_id,
          status: 'CONFIRMED',
        },
      });

      console.log('Payment successful for booking:', bookingId);

      return {
        success: true,
        message: 'Payment successful',
        bookingId,
        transactionId: tran_id,
      };
    } else {
      throw new Error(`Payment validation failed with status: ${validation.status}`);
    }
  } catch (error: any) {
    console.error('Payment Success Handler Error:', error);
    throw error;
  }
};

export const handlePaymentFail = async (paymentData: any) => {
  try {
    const bookingId = paymentData.value_a;

    if (bookingId) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          paymentStatus: 'FAILED',
        },
      });
    }

    return {
      success: false,
      message: 'Payment failed',
      bookingId,
    };
  } catch (error: any) {
    console.error('Payment Fail Handler Error:', error);
    throw error;
  }
};

export const handlePaymentCancel = async (paymentData: any) => {
  try {
    const bookingId = paymentData.value_a;

    if (bookingId) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          paymentStatus: 'CANCELLED',
        },
      });
    }

    return {
      success: false,
      message: 'Payment cancelled',
      bookingId,
    };
  } catch (error: any) {
    console.error('Payment Cancel Handler Error:', error);
    throw error;
  }
};

export const refundPayment = async (bankTransactionId: string) => {
  try {
    if (!bankTransactionId) {
      throw new Error('Bank transaction ID is required for refund');
    }

    const refundUrl = is_live
      ? 'https://securepay.sslcommerz.com/validator/api/merchantTransIDvalidationAPI.php'
      : 'https://sandbox.sslcommerz.com/validator/api/merchantTransIDvalidationAPI.php';

    const formData = new URLSearchParams({
      refund_amount: '0', // Full refund
      refund_remarks: 'Tour cancellation',
      bank_tran_id: bankTransactionId,
      store_id: store_id,
      store_passwd: store_passwd,
    });

    const response = await fetch(refundUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const refundResponse = await response.json();

    return {
      success: true,
      refundResponse,
    };
  } catch (error: any) {
    console.error('Refund Error:', error);
    throw new Error(error.message || 'Refund failed');
  }
};