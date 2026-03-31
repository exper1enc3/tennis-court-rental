from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # New import
import uvicorn

from app.api.routes import router

from app.infrastructure.database import engine, Base
from app.infrastructure.models import * 

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


app = FastAPI(title="courtly")

# Enable CORS so the React frontend can communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://orange-mud-027edf503.1.azurestaticapps.net"],  # Your Vite dev server URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=5000, reload=True)
