"""
ocr_service.py - Evidence text extraction from uploaded files.

Supports:
  • Plain-text files  (.txt)
  • Images            (.jpg, .jpeg, .png, .bmp, .tiff, .webp)
  • PDF documents     (.pdf)  – each page is rendered and OCR'd

Pytesseract is used for all image-based OCR.  pdf2image converts PDF
pages to PIL Images before passing them to Tesseract.
"""

import io
import os
from pathlib import Path

import pytesseract
from PIL import Image

# ---------------------------------------------------------------------------
# Optional PDF support via pdf2image
# ---------------------------------------------------------------------------
try:
    from pdf2image import convert_from_bytes

    PDF_SUPPORT = True
except ImportError:  # pragma: no cover
    PDF_SUPPORT = False

# Path to the Tesseract OCR executable (Windows)
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


def extract_text(file_bytes: bytes, filename: str) -> str:
    """
    Extract plain text from an uploaded file.

    Parameters
    ----------
    file_bytes : Raw bytes of the uploaded file.
    filename   : Original filename (used to determine file type).

    Returns
    -------
    Extracted text string, or an error message if extraction fails.
    """
    suffix = Path(filename).suffix.lower()

    # --- Plain text files ---
    if suffix == ".txt":
        return _extract_from_text(file_bytes)

    # --- PDF files ---
    if suffix == ".pdf":
        return _extract_from_pdf(file_bytes)

    # --- Image files ---
    image_extensions = {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif", ".webp"}
    if suffix in image_extensions:
        return _extract_from_image(file_bytes)

    return f"Unsupported file type: '{suffix}'. Please upload a .txt, .pdf, or image file."


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _extract_from_text(file_bytes: bytes) -> str:
    """Decode a plain-text file, trying UTF-8 with Latin-1 as fallback."""
    try:
        return file_bytes.decode("utf-8")
    except UnicodeDecodeError:
        return file_bytes.decode("latin-1", errors="replace")


def _extract_from_image(file_bytes: bytes) -> str:
    """Run Tesseract OCR on a single image."""
    try:
        image = Image.open(io.BytesIO(file_bytes))
        text = pytesseract.image_to_string(image)
        return text.strip() or "No text could be extracted from this image."
    except Exception as exc:
        return f"OCR error processing image: {exc}"


def _extract_from_pdf(file_bytes: bytes) -> str:
    """Convert each PDF page to an image then OCR all pages."""
    if not PDF_SUPPORT:
        return (
            "PDF support is unavailable. "
            "Please install pdf2image and poppler, then try again."
        )
    try:
        pages = convert_from_bytes(file_bytes, dpi=200)
        page_texts: list[str] = []
        for i, page_image in enumerate(pages, start=1):
            page_text = pytesseract.image_to_string(page_image).strip()
            page_texts.append(f"--- Page {i} ---\n{page_text}")
        combined = "\n\n".join(page_texts)
        return combined or "No text could be extracted from this PDF."
    except Exception as exc:
        return f"Error processing PDF: {exc}"
