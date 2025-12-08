import { Router } from "express";
import pkg from "multer";
import { analyzeImage } from "../controllers/analyzeController.js";

const multer = pkg;


const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("image"), analyzeImage);

export default router;

