from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import numpy as np
from typing import List, Dict, Any
import pandas as pd
import pickle
import os
import string
from pydantic import BaseModel

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to the frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

class SymptomsRequest(BaseModel):
    symptoms: List[str]

# Load symptoms from CSV
symptoms_file = 'symptoms.csv'
try:
    symptoms_df = pd.read_csv(symptoms_file)
    symptoms_all = symptoms_df['symptom'].tolist()
except FileNotFoundError:
    raise HTTPException(status_code=500, detail="Symptoms file not found")

MODEL_DIR = 'models'

# Function to load models
def load_models(model_dir):
    models = {}
    for file_name in os.listdir(model_dir):
        if file_name.startswith('model_') and file_name.endswith('.pkl'):
            disease_name = file_name[len('model_'):-len('.pkl')]
            try:
                with open(os.path.join(model_dir, file_name), 'rb') as f:
                    models[disease_name] = pickle.load(f)
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Error loading model {file_name}: {str(e)}")
    return models

models = load_models(MODEL_DIR)

# Function to format symptoms for input to model
def set_symptoms(symptoms, num_given_symptoms):
    given_symptoms = set(symptoms[:num_given_symptoms])
    rest_symptoms = {symptom: 1 if symptom in given_symptoms else 0 for symptom in symptoms_all}
    return rest_symptoms

# Predict disease based on symptoms
def predict_disease(symptoms):
    input_data = pd.DataFrame([set_symptoms(symptoms, len(symptoms))])
    probabilities = {}
    
    for disease, model in models.items():
        try:
            prob = model.predict_proba(input_data)[0][1]  # Probability of having the disease
            probabilities[disease] = prob
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error predicting disease for {disease}: {str(e)}")
    
    predicted_disease = max(probabilities, key=probabilities.get)
    
    return predicted_disease, probabilities

# Endpoint to get all symptoms
@app.get("/allsymptoms", response_model=List[str])
async def get_all_symptoms():
    return symptoms_all

# Endpoint to predict disease
@app.post("/predict_disease", response_model=Dict[str, Any])
async def predict_disease_form(symptoms: str = Form(...)):
    symptoms_list = symptoms.split(',')
    if not symptoms_list:
        raise HTTPException(status_code=400, detail="No symptoms provided")
    
    predicted_disease, probabilities = predict_disease(symptoms_list)
    response = {
        "predicted_disease": predicted_disease,
        "disease_probabilities": probabilities
    }
    return response

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Healthcare APIs"}

# Running the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("ml_api:app", host="localhost", port=8000, log_level="debug", proxy_headers=True, reload=True)
