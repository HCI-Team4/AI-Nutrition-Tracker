import { analyzeWithLangChain } from "./helpers/langchainClient.js";
import { addNutritionEntry } from "./helpers/nutritionStorage.js";

export const analyzeImage = async (req, res) => {
  try {

    console.log("image recieved");
    // 1. validation
    if (!req.file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    const imageBuffer = req.file.buffer;

    // 2. process buffer → base64
    const base64Image = imageBuffer.toString("base64");

    // 3. call LangChain
    const result = process.env.OPENAI_API_KEY ? await analyzeWithLangChain(base64Image) : {
        food :  "Egg Fried Rice",
        calories: 163,
        protein: 18,
        carbs: 70,
        fat: 12
    }

    console.log(req.userEmail);
    const userName = req.userEmail; // TODO: replace with req.user or email later
    addNutritionEntry(userName, result);

      console.log("returned");

    // 4. send back result
    res.json({ success: true, result });

  } catch (err) {
    console.error("Analyze error:", err);
    res.status(500).json({
      error: "Internal Server Error",
      details: err.message,
    });
  }
};
