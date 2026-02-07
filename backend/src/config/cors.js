import cors from "cors";

const corsOptions = {
  origin: "http://localhost:5173", // EXACT frontend origin
  credentials: true,               // allow cookies / auth headers
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

export default cors(corsOptions);
