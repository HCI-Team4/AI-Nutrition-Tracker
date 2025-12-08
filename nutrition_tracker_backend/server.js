import express from "express";
import cors from "cors";
import userRoutes from "./src/routes/analyze.js";
import authRoutes from "./src/routes/auth.js";



const app = express();

app.use(cors({
    origin: "http://localhost:3000",   // Next.js default
    methods: "GET,POST",
    allowedHeaders: "Content-Type",
}));

app.use(express.json());

// Routes
app.use("/analyze", userRoutes);
app.use("/auth", authRoutes);

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

