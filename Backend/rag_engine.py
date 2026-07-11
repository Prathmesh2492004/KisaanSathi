"""
rag_engine.py

Core RAG logic: takes a farmer's question, retrieves the most relevant chunks
from the ChromaDB vector store built by ingest.py, and asks Groq to answer
using only that retrieved context.
"""

import os
from dotenv import load_dotenv
import chromadb
from chromadb.utils import embedding_functions
from openai import OpenAI

load_dotenv()

CHROMA_DB_DIR = os.path.join(os.path.dirname(__file__), "chroma_db")
COLLECTION_NAME = "kisaan_schemes"
TOP_K = 4  # number of chunks to retrieve per question

_embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)
_client = chromadb.PersistentClient(path=CHROMA_DB_DIR)
_collection = _client.get_collection(name=COLLECTION_NAME, embedding_function=_embedding_fn)

_groq_client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)

SYSTEM_PROMPT = """You are Kisaan Sahayak, a helpful assistant for Indian farmers.
Answer questions about government schemes, crop insurance, loans, and agricultural
support using ONLY the context provided below. If the context does not contain the
answer, say you don't have that information and suggest the farmer contact their
nearest Krishi Vigyan Kendra or the helpline number.

Keep answers simple, clear, and practical. Avoid jargon. Use short sentences."""


def retrieve_context(query, top_k=TOP_K):
    """Search the vector store and return the most relevant chunks, formatted
    with their source filename, plus a list of unique source files used."""
    results = _collection.query(query_texts=[query], n_results=top_k)

    chunks = results["documents"][0]
    metadatas = results["metadatas"][0]

    context_blocks = []
    sources = []
    for chunk, meta in zip(chunks, metadatas):
        context_blocks.append(f"[Source: {meta['source']}]\n{chunk}")
        if meta["source"] not in sources:
            sources.append(meta["source"])

    return "\n\n---\n\n".join(context_blocks), sources


def answer_question(query):
    """Full RAG pipeline: retrieve relevant chunks, then ask Groq to answer
    grounded in that context. Returns a dict with the answer text and sources."""
    context, sources = retrieve_context(query)

    user_message = f"""Context:
{context}

Farmer's question: {query}"""

    response = _groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        max_tokens=1000,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message}
        ]
    )

    answer_text = response.choices[0].message.content

    return {"answer": answer_text, "sources": sources}
