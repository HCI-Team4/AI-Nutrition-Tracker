import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import { addNutritionEntry } from "./helpers/nutritionStorage.js";

export const analyzeImage = async (req, res) => {
  try {

    // 1. validation
    if (!req.file) {
      return res.status(400).json({ error: "Image file is required" });
    }


    // 2. process buffer → base64
    //const base64Image = imageBuffer.toString("base64");
    const form = new FormData();
        form.append("file", req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
    });

    const response = await axios.post("http://localhost:8000/analyze", form, {
      headers: form.getHeaders(),
    });
    // 3. call LangChain
    const dishes= response.data ? response.data : {
        food :  "Egg Fried Rice",
        calories: 163,
        protein: 18,
        carbs: 70,
        fat: 12
    }

      console.log(dishes);
// Parse the nested JSON string
    const userName = req.userEmail; // TODO: replace with req.user or email later
for (const dish of dishes) {
  try {
      console.log("write start");
    addNutritionEntry(userName, dish);
    console.log("write complete for", dish.food);
  } catch (err) {
    console.error("Failed to write dish:", dish.food, err);
  }
}
console.log("All dishes processed");
      console.log("full write complete")
    const highestCalDish = dishes.reduce((max, dish) => dish.calories > max.calories ? dish : max, dishes[0]);

// Sum all nutrients
const totalNutrients = dishes.reduce((sum, dish) => {
  sum.calories += dish.calories;
  sum.carbs += dish.carbs;
  sum.protein += dish.protein;
  sum.fats += dish.fats;
  return sum;
}, { calories: 0, carbs: 0, protein: 0, fats: 0 });

// Combine results
const mainDish = {
  food: highestCalDish.name,
  calories: totalNutrients.calories,
  carbs: totalNutrients.carbs,
  protein: totalNutrients.protein,
  fat: totalNutrients.fats
};

console.log(mainDish);


    // 4. send back result
    res.json({ success: true, mainDish});

  } catch (err) {
    console.error("Analyze error:", err);
    res.status(500).json({
      error: "Internal Server Error",
      details: err.message,
    });
  }
};
