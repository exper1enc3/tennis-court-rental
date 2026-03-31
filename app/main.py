from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # New import
import uvicorn

from app.api.routes import router

from fastapi.staticfiles import StaticFiles


app = FastAPI(title="courtly")

# Enable CORS so the React frontend can communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Your Vite dev server URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/app", StaticFiles(directory="app/static", html=True), name="static")

app.include_router(router)


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=5000, reload=True)
