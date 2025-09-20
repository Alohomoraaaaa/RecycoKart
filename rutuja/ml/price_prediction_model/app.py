# app.py
import uvicorn
from rutuja.api import app

if __name__ == "__main__":
    uvicorn.run("rutuja.api:app", host="127.0.0.1", port=8000, reload=True)
