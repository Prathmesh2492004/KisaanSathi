"""
app.py

FastAPI server that exposes a /chat endpoint for the frontend to call.
Run with: uvicorn app:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag_engine import answer_question

app = FastAPI(title="Kisaan RAG API")

# Allow the Vite dev server to call this API during development.
# Add your deployed frontend URL here too once you host it.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    question: str


class ChatResponse(BaseModel):
    answer: str
    sources: list[str]


@app.get("/")
def health_check():
    return {"status": "Kisaan RAG backend is running"}


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    result = answer_question(request.question)
    return ChatResponse(answer=result["answer"], sources=result["sources"])
