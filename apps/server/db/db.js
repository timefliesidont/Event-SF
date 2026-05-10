import OracleDB from "oracledb";
import { configDotenv } from "dotenv";
configDotenv();

let pool;

export const initOraclePool = async () => {
  try {
    pool = await OracleDB.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectionString: process.env.DB_CONNECTION_STRING,
    });
    console.log("✅ Oracle connection pool created");
  } catch (error) {
    console.error("❌ Failed to create Oracle pool", error);
  }
};

export const getConnection = async () => {
  if (!pool) {
    throw new Error("Oracle pool not initialized");
  }
  return await pool.getConnection();
};
