from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil
import tempfile
import os
from main import analyze_meal_from_image  # import your function from main.py

app = FastAPI(title="Nutrition Agent API")

# Enable CORS so your JS backend can call it
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or restrict to your frontend/backend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze")
async def analyze_meal(file: UploadFile, meal_type: str = None):
    """
    Endpoint to analyze a meal image.
    Accepts an image upload and optional meal_type.
    Returns JSON result from analyze_food.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")

    # Save uploaded file temporarily
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name

        # Call your existing analyze_food function
        result = analyze_meal_from_image(tmp_path, meal_type)
        return result

    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
