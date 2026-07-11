"""
ingest.py

Reads every .txt file inside schemes/, splits each into overlapping chunks,
generates embeddings using a local sentence-transformers model, and stores
everything in a persistent ChromaDB collection on disk.

Run this once initially, and again any time you add or edit files in schemes/.

Usage:
    python ingest.py
"""

import os
import glob
from dotenv import load_dotenv
import chromadb
from chromadb.utils import embedding_functions

load_dotenv()

SCHEMES_DIR = os.path.join(os.path.dirname(__file__), "schemes")
CHROMA_DB_DIR = os.path.join(os.path.dirname(__file__), "chroma_db")
COLLECTION_NAME = "kisaan_schemes"

CHUNK_SIZE = 500      # target characters per chunk
CHUNK_OVERLAP = 100   # characters carried over into the next chunk for context continuity


def chunk_text(text, chunk_size=CHUNK_SIZE, overlap=CHUNK_OVERLAP):
    """Split text into overlapping chunks, breaking at paragraph boundaries
    where possible so we don't cut a sentence in half."""
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks = []
    current = ""

    for para in paragraphs:
        if len(current) + len(para) <= chunk_size:
            current += para + "\n\n"
        else:
            if current:
                chunks.append(current.strip())
            overlap_text = current[-overlap:] if current else ""
            current = overlap_text + para + "\n\n"

    if current.strip():
        chunks.append(current.strip())

    return chunks


def load_documents():
    """Read every .txt file in schemes/ and return a list of (filename, text)."""
    filepaths = sorted(glob.glob(os.path.join(SCHEMES_DIR, "*.txt")))
    documents = []
    for path in filepaths:
        filename = os.path.basename(path)
        with open(path, "r", encoding="utf-8") as f:
            text = f.read()
        documents.append((filename, text))
    return documents


def main():
    print("Loading documents from schemes/ ...")
    documents = load_documents()
    print(f"Found {len(documents)} files.")

    if not documents:
        print("No .txt files found in schemes/. Add your files and re-run.")
        return

    print("Loading embedding model (all-MiniLM-L6-v2, downloads on first run) ...")
    embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name="all-MiniLM-L6-v2"
    )

    client = chromadb.PersistentClient(path=CHROMA_DB_DIR)

    # Drop any existing collection so re-running ingest.py doesn't leave stale chunks
    try:
        client.delete_collection(COLLECTION_NAME)
    except Exception:
        pass

    collection = client.create_collection(
        name=COLLECTION_NAME,
        embedding_function=embedding_fn
    )

    all_ids, all_texts, all_metadatas = [], [], []

    for filename, text in documents:
        chunks = chunk_text(text)
        print(f"  {filename}: {len(chunks)} chunks")
        for i, chunk in enumerate(chunks):
            all_ids.append(f"{filename}_{i}")
            all_texts.append(chunk)
            all_metadatas.append({"source": filename, "chunk_index": i})

    if not all_texts:
        print("No text extracted from files. Check that they aren't empty.")
        return

    collection.add(ids=all_ids, documents=all_texts, metadatas=all_metadatas)

    print(f"\nDone. Ingested {len(all_texts)} chunks from {len(documents)} files into '{COLLECTION_NAME}'.")
    print(f"Vector store saved at: {CHROMA_DB_DIR}")


if __name__ == "__main__":
    main()
