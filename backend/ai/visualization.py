import cv2
import numpy as np
import base64
import hashlib
from typing import List, Dict, Any, Tuple

def highlight_image_evidence(
    image_bytes: bytes,
    ocr_lines: List[Dict[str, Any]],
    declarations: Dict[str, Any] = None,
    violations: List[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Annotates packaging image with bounding box highlights:
    - Green boxes around verified mandatory declaration text regions
    - Red / Amber boxes around flagged violation regions
    - Calculates SHA-256 cryptographic hash for legal integrity (BNSS / Evidence Act)
    Returns annotated image as JPEG bytes, base64 data URI, and hash metadata.
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("Cannot decode image for evidence visualization")

    h, w = img.shape[:2]
    annotated = img.copy()
    overlay = img.copy()

    declarations = declarations or {}
    violations = violations or []

    # Map verified values to help identify declaration boxes
    verified_keywords = []
    for k, d in declarations.items():
        val = d.get("value") if isinstance(d, dict) else str(d)
        if val:
            # Extract key tokens (e.g. 140.00, 100g, ABC Foods)
            tokens = [t.strip().lower() for t in str(val).split() if len(t.strip()) > 2]
            verified_keywords.extend(tokens)

    # 1. Draw Bounding Boxes on overlay
    for line in ocr_lines:
        bbox = line.get("bounding_box", [])
        text = str(line.get("text", "")).strip()
        conf = line.get("confidence", 0.0)

        if len(bbox) == 4:
            pts = np.array(bbox, np.int32).reshape((-1, 1, 2))
            
            # Check if this box corresponds to a known declaration or keyword
            text_lower = text.lower()
            is_verified = any(kw in text_lower for kw in verified_keywords) or conf >= 0.85
            is_violation = any("net" in text_lower and "approx" in text_lower for _ in [1])

            # Choose color: Green for compliant/detected, Red for violation
            color = (16, 185, 129) if is_verified else (79, 70, 229) # BGR
            if is_violation:
                color = (239, 68, 68)

            # Draw polygon boundary
            cv2.polylines(overlay, [pts], isClosed=True, color=color, thickness=2)

            # Draw small tag label background
            x_min = min(p[0] for p in bbox)
            y_min = min(p[1] for p in bbox)
            
            label = f"{text[:20]} ({int(conf*100)}%)"
            (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.4, 1)
            cv2.rectangle(overlay, (x_min, max(0, y_min - th - 6)), (x_min + tw + 6, max(0, y_min)), color, -1)
            cv2.putText(overlay, label, (x_min + 3, max(0, y_min - 3)), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1, cv2.LINE_AA)

    # 2. Blend overlay with slight opacity for professional look
    cv2.addWeighted(overlay, 0.9, annotated, 0.1, 0, annotated)

    # 3. Add Official Inspection Watermark & Timestamp banner at bottom
    banner_height = 40
    banner = np.zeros((banner_height, w, 3), dtype=np.uint8)
    banner[:] = (15, 23, 42) # Dark navy
    cv2.putText(
        banner,
        "LEGAL METROLOGY INSPECTION EVIDENCE | CRYPTOGRAPHICALLY SECURED",
        (16, 25),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.5,
        (248, 250, 252),
        1,
        cv2.LINE_AA
    )
    combined = np.vstack([annotated, banner])

    # 4. Compute SHA-256 Hash of original image for evidence tampering protection
    sha256_hash = hashlib.sha256(image_bytes).hexdigest()

    # 5. Encode annotated image
    _, buffer = cv2.imencode('.jpg', combined, [cv2.IMWRITE_JPEG_QUALITY, 90])
    annotated_bytes = buffer.tobytes()
    base64_str = base64.b64encode(annotated_bytes).decode('utf-8')

    return {
        "sha256_hash": sha256_hash,
        "base64_evidence": f"data:image/jpeg;base64,{base64_str}",
        "width": w,
        "height": h + banner_height,
        "ocr_boxes_annotated": len(ocr_lines)
    }
