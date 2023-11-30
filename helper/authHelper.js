import bcrypt from "bcrypt";

export const hashPassword = async (password) => {
  try {
    const saltround = 10;
    const hashedPassword = await bcrypt.hash(password, saltround);
    return hashedPassword;
  } catch (error) {
    console.log(`error: ${error}`.bgRed);
  }
};
export const comparePassword = async (password, hashPassword) => {
  return bcrypt.compare(password, hashPassword);
};
