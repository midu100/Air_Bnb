
const emailVerificationTemp = (item) => {
  return `
  <div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-10">
    <div
      class="flex flex-col w-full max-w-lg rounded-3xl border border-white/10 bg-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden"
    >
      <!-- Top Blur -->
      <div class="flex h-2 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500"></div>

      <div class="flex flex-col px-10 py-12">
        <!-- Logo -->
        <div class="flex items-center justify-center">
          <div
            class="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 border border-white/20 shadow-lg"
          >
            <span class="text-3xl">✉️</span>
          </div>
        </div>

        <!-- Heading -->
        <div class="flex flex-col items-center mt-8">
          <h1 class="text-3xl font-bold text-white">
            Verify Your Email
          </h1>

          <p class="text-sm text-slate-300 text-center mt-3 leading-6">
            Use the verification code below to complete your account setup.
            This code is valid for a limited time.
          </p>
        </div>

        <!-- OTP -->
        <div class="flex items-center justify-center mt-10">
          <div
            class="flex items-center justify-center px-10 py-5 rounded-2xl bg-white/10 border border-white/20 shadow-xl"
          >
            <span class="text-4xl font-bold tracking-[14px] text-white">
              ${item}
            </span>
          </div>
        </div>

        <!-- Info -->
        <div class="flex flex-col mt-10">
          <div
            class="flex items-center rounded-2xl border border-white/10 bg-white/5 px-5 py-4"
          >
            <p class="text-sm text-slate-300 leading-6">
              If you didn't request this verification, you can safely ignore
              this email. No further action is required.
            </p>
          </div>
        </div>

        
        <div class="flex flex-col items-center mt-10">
          <p class="text-xs text-slate-400">
            © 2026 Your Company. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  </div>
  `
};

const bookingConfirmationTemp = (item) => {
  return `
  <div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-10">
    <div
      class="flex flex-col w-full max-w-lg rounded-3xl border border-white/10 bg-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden"
    >
      <div class="flex h-2 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500"></div>

      <div class="flex flex-col px-10 py-12">
        <div class="flex items-center justify-center">
          <div
            class="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 border border-white/20 shadow-lg"
          >
            <span class="text-3xl">🏠</span>
          </div>
        </div>

        <div class="flex flex-col items-center mt-8">
          <h1 class="text-3xl font-bold text-white">
            Booking Confirmed!
          </h1>

          <p class="text-sm text-slate-300 text-center mt-3 leading-6">
            Your booking has been received. Here are your booking details.
          </p>
        </div>

        <div class="flex flex-col mt-10 rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
          <p class="text-sm text-slate-300 leading-7">
            <strong>Property:</strong> ${item.propertyTitle}<br/>
            <strong>Check-in:</strong> ${item.checkInDate}<br/>
            <strong>Check-out:</strong> ${item.checkOutDate}<br/>
            <strong>Guests:</strong> ${item.guestsCount}<br/>
            <strong>Total Nights:</strong> ${item.totalNights}<br/>
            <strong>Total Amount:</strong> $${item.totalAmount}
          </p>
        </div>

        <div class="flex flex-col items-center mt-10">
          <p class="text-xs text-slate-400">
            © 2026 Air-bnb. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  </div>
  `
};

module.exports = { emailVerificationTemp, bookingConfirmationTemp };

