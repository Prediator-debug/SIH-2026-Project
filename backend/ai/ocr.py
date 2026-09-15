import cv2
import numpy as np
import easyocr
from typing import List, Dict, Any, Tuple
from ai.preprocessing import preprocess_pipeline
from ai.analysis import analyze_font_and_layout

# EasyOCR reader singleton instance (initialized lazily or upon module load)
_reader = None

def get_ocr_reader() -> easyocr.Reader:
    global _reader
    if _reader is None:
        print("[EasyOCR] Initializing reader for ['en'] on CPU...")
        try:
            _reader = easyocr.Reader(['en'], gpu=False, verbose=False)
            print("[EasyOCR] Reader successfully initialized.")
        except Exception as e:
            print(f"[EasyOCR Warning] Error initializing reader: {e}")
            raise
    return _reader

def process_image(image_bytes: bytes, apply_preprocessing: bool = True) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """
    Takes raw image bytes:
    1. Decodes to cv2 image
    2. Runs image preprocessing (perspective, deskew, noise reduction, contrast)
    3. Executes EasyOCR
    4. Computes font and visual quality heuristics
    5. Returns extracted text lines with bounding boxes and image analysis metrics.
    """
    reader = get_ocr_reader()

    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        try:
            from PIL import Image
            import io
            pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
        except Exception:
            raise ValueError("Could not decode image from provided bytes.")

    processed_img = img
    if apply_preprocessing:
        try:
            processed_img = preprocess_pipeline(img)
        except Exception as e:
            print(f"[Preprocessing Warning] Preprocessing failed, falling back to original image: {e}")
            processed_img = img

    # Run EasyOCR
    # detail=1 returns list of (bbox, text, prob)
    results = reader.readtext(processed_img, detail=1)

    # Fallback to original image if preprocessing yielded 0 results on an image with text
    if not results and apply_preprocessing:
        results = reader.readtext(img, detail=1)

    extracted_lines = []
    for (bbox, text, prob) in results:
        clean_text = str(text).strip()
        if not clean_text:
            continue
        extracted_lines.append({
            "text": clean_text,
            "confidence": round(float(prob), 4),
            "bounding_box": [
                [int(p[0]), int(p[1])] for p in bbox
            ]
        })

    # Run layout and readability heuristics
    analysis_metrics = analyze_font_and_layout(processed_img, extracted_lines)

    return extracted_lines, analysis_metrics
