"""
inspect_db.py

Quick utility to peek inside your ChromaDB vector store — see what chunks
were stored, which files they came from, and optionally test a retrieval
query directly against the store.

Usage:
    python inspect_db.py                  -> shows a summary + sample chunks
    python inspect_db.py --all             -> prints every chunk in full
    python inspect_db.py --query "your question here"   -> test retrieval
"""

import os
import sys
import chromadb
from chromadb.utils import embedding_functions

CHROMA_DB_DIR = os.path.join(os.path.dirname(__file__), "chroma_db")
COLLECTION_NAME = "kisaan_schemes"


def get_collection():
    embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name="all-MiniLM-L6-v2"
    )
    client = chromadb.PersistentClient(path=CHROMA_DB_DIR)
    return client.get_collection(name=COLLECTION_NAME, embedding_function=embedding_fn)


def show_summary(collection):
    data = collection.get()
    ids = data["ids"]
    metadatas = data["metadatas"]

    print(f"Total chunks stored: {len(ids)}\n")

    # Count chunks per source file
    counts = {}
    for meta in metadatas:
        source = meta["source"]
        counts[source] = counts.get(source, 0) + 1

    print("Chunks per file:")
    for source, count in sorted(counts.items()):
        print(f"  {source}: {count} chunks")


def show_all_chunks(collection):
    data = collection.get()
    ids = data["ids"]
    documents = data["documents"]
    metadatas = data["metadatas"]

    for chunk_id, doc, meta in zip(ids, documents, metadatas):
        print(f"\n{'=' * 60}")
        print(f"ID: {chunk_id}  |  Source: {meta['source']}  |  Chunk #{meta['chunk_index']}")
        print(f"{'-' * 60}")
        print(doc)


def test_query(collection, query, top_k=4):
    results = collection.query(query_texts=[query], n_results=top_k)

    print(f"Query: \"{query}\"\n")
    print(f"Top {top_k} matching chunks:\n")

    for i, (doc, meta, distance) in enumerate(zip(
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0]
    ), start=1):
        print(f"{'=' * 60}")
        print(f"#{i}  Source: {meta['source']}  |  Distance: {distance:.4f}  (lower = more similar)")
        print(f"{'-' * 60}")
        print(doc[:300] + ("..." if len(doc) > 300 else ""))
        print()


def main():
    collection = get_collection()

    if "--query" in sys.argv:
        query_index = sys.argv.index("--query")
        if query_index + 1 >= len(sys.argv):
            print("Usage: python inspect_db.py --query \"your question here\"")
            return
        query = sys.argv[query_index + 1]
        test_query(collection, query)
    elif "--all" in sys.argv:
        show_all_chunks(collection)
    else:
        show_summary(collection)
        print("\nRun with --all to see every chunk's full text.")
        print("Run with --query \"your question\" to test retrieval directly.")


if __name__ == "__main__":
    main()
