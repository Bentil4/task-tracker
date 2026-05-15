import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = ["JWT_SECRET"];

export const validateEnvVars = () => {
  const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`);
  }
};


