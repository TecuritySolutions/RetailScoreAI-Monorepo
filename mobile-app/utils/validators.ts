export const validators = {
  email: (email: string): boolean => {
    const emailRegex = /^\S+@\S+\.\S+$/;
    return emailRegex.test(email);
  },

  otp: (otp: string): boolean => {
    const otpRegex = /^\d{6}$/;
    return otpRegex.test(otp);
  },

  phoneNumber: (phone: string, country: string = 'India'): boolean => {
    if (country === 'India') {
      return /^\d{10}$/.test(phone);
    }
    return /^\d{10,20}$/.test(phone);
  },
};

export const formatters = {
  phoneNumber: (phone: string): string => {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    return digits;
  },

  otp: (otp: string): string => {
    // Only allow digits and limit to 6
    const digits = otp.replace(/\D/g, '');
    return digits.slice(0, 6);
  },
};
