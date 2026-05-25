export const getMailProviderInfo = (email: string) => {
  const lowerEmail = email.toLowerCase();

  if (
    lowerEmail.endsWith("@humg.edu.vn") ||
    lowerEmail.endsWith("@student.humg.edu.vn")
  ) {
    return {
      label: "Outlook",
      url: "https://outlook.office.com/mail/",
      colorClass: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20",
    };
  }

  return {
    label: "Gmail",
    url: "https://mail.google.com/",
    colorClass: "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20",
  };
};
