import { db } from "../config/db.js";

export const testDBConnection = async () => {
  try {
    const [rows] = await db.query("SELECT 1");
    console.log("✅ MySQL Database Connected Successfully");
  } catch (error) {
    console.error("❌ Database Connection Failed:", error.message);
    process.exit(1);
  }
};
