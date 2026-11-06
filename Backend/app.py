"""
app.py

FastAPI server that exposes a /chat endpoint for the frontend to call.
Run with: uvicorn app:app --reload
"""

import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag_engine import answer_question
from farmer_profile import FarmerProfile
from eligibility_engine import match_all_schemes

logger = logging.getLogger("kisaan")

app = FastAPI(title="Kisaan Sahayak API")

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
    try:
        result = answer_question(request.question)
    except Exception as exc:
        # Log the full error for the developer; send the farmer a plain message.
        logger.exception("Chat request failed")
        message = "Sahayak could not answer right now. Please try again in a minute."
        if "model" in str(exc) and ("does not exist" in str(exc) or "decommissioned" in str(exc)):
            message = "The AI model configured on the server is no longer available. Set GROQ_MODEL in Backend/.env."
        raise HTTPException(status_code=502, detail=message) from exc
    return ChatResponse(answer=result["answer"], sources=result["sources"])


@app.post("/check-eligibility")
def check_eligibility(profile: FarmerProfile):
    results = match_all_schemes(profile)
    eligible_schemes = [r for r in results if r["eligible"]]
    return {
        "eligible_count": len(eligible_schemes),
        "total_schemes_checked": len(results),
        "results": results,
    }
