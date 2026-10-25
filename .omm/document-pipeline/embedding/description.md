CPU ONNX inference creates normalized 384-dimensional passage vectors using a pinned model identity. Missing/disabled models fall back to keyword-only search.

Source: `backend/app/documents/embedding.py`.
