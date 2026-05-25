export const AuthValidation = {
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isHumgEmail: (email: string): boolean => {
    return email.endsWith("@student.humg.edu.vn");
  },

  isValidPassword: (password: string): boolean => {
    return password.length >= 8;
  },

  doPasswordsMatch: (p1: string, p2: string): boolean => {
    return p1 === p2;
  },
};
