export const generateReferralCode = (name) => {
    // Clean the name: remove spaces, special chars, take first 4 letters, uppercase
    const cleanName = name.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase();

    // Generate 4 random numbers
    const randomNum = Math.floor(1000 + Math.random() * 9000);

    // Combine them
    return `${cleanName}${randomNum}`;
};
