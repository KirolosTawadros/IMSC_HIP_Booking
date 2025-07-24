const axios = require('axios');

const API_BASE_URL = 'https://imsc-hip-booking-back-end.onrender.com/api';

async function testCancelBooking() {
  try {
    console.log('Testing cancel booking functionality...\n');

    // 1. Get all bookings
    console.log('1. Getting all bookings...');
    const bookingsResponse = await axios.get(`${API_BASE_URL}/bookings/user/64f8b2b3c4d5e6f7a8b9c0d1`); // Replace with actual user ID
    console.log(`Found ${bookingsResponse.data.length} bookings\n`);

    if (bookingsResponse.data.length === 0) {
      console.log('No bookings found to test cancellation');
      return;
    }

    // 2. Find a future booking to cancel
    const now = new Date();
    const futureBookings = bookingsResponse.data.filter(booking => {
      const bookingDate = new Date(booking.date);
      return bookingDate > now;
    });

    if (futureBookings.length === 0) {
      console.log('No future bookings found to test cancellation');
      return;
    }

    const bookingToCancel = futureBookings[0];
    console.log(`2. Testing cancellation for booking: ${bookingToCancel._id}`);
    console.log(`   Date: ${bookingToCancel.date}`);
    console.log(`   Joint Type: ${bookingToCancel.joint_type_id.name}`);
    console.log(`   Time: ${bookingToCancel.time_slot_id.start_time}\n`);

    // 3. Try to cancel the booking
    console.log('3. Attempting to cancel booking...');
    const cancelResponse = await axios.delete(`${API_BASE_URL}/bookings/${bookingToCancel._id}`);
    console.log('✅ Booking cancelled successfully!');
    console.log(`Response: ${cancelResponse.data.message}\n`);

    // 4. Verify booking is deleted
    console.log('4. Verifying booking is deleted...');
    const updatedBookingsResponse = await axios.get(`${API_BASE_URL}/bookings/user/64f8b2b3c4d5e6f7a8b9c0d1`);
    const bookingStillExists = updatedBookingsResponse.data.find(b => b._id === bookingToCancel._id);
    
    if (!bookingStillExists) {
      console.log('✅ Booking successfully deleted from database');
    } else {
      console.log('❌ Booking still exists in database');
    }

  } catch (error) {
    console.error('❌ Error testing cancel booking:', error.response?.data || error.message);
  }
}

// Test past booking cancellation (should fail)
async function testPastBookingCancellation() {
  try {
    console.log('\n--- Testing past booking cancellation (should fail) ---\n');

    // Get all bookings
    const bookingsResponse = await axios.get(`${API_BASE_URL}/bookings/user/64f8b2b3c4d5e6f7a8b9c0d1`);
    
    // Find a past booking
    const now = new Date();
    const pastBookings = bookingsResponse.data.filter(booking => {
      const bookingDate = new Date(booking.date);
      return bookingDate < now;
    });

    if (pastBookings.length === 0) {
      console.log('No past bookings found to test');
      return;
    }

    const pastBooking = pastBookings[0];
    console.log(`Attempting to cancel past booking: ${pastBooking._id}`);
    console.log(`Date: ${pastBooking.date}`);

    // Try to cancel past booking
    await axios.delete(`${API_BASE_URL}/bookings/${pastBooking._id}`);
    console.log('❌ Past booking was cancelled (this should not happen)');

  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Past booking cancellation correctly rejected');
      console.log(`Error message: ${error.response.data.message}`);
    } else {
      console.error('❌ Unexpected error:', error.response?.data || error.message);
    }
  }
}

// Run tests
async function runTests() {
  await testCancelBooking();
  await testPastBookingCancellation();
}

runTests(); 