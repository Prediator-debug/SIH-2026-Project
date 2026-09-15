import cv2
import numpy as np
from typing import List, Dict, Any

def calculate_sharpness_score(image: np.ndarray) -> Dict[str, Any]:
    """
    Computes blur score using variance of Laplacian.
    Higher values indicate sharper images.
    Threshold: < 100 is blurry, 100-300 moderate, > 300 sharp.
    """
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image
        
    variance = cv2.Laplacian(gray, cv2.CV_64F).var()
    normalized_score = min(100.0, (variance / 300.0) * 100.0)
    
    status = "Sharp"
    if variance < 80:
        status = "Blurry"
    elif variance < 200:
        status = "Moderate"

    return {
        "laplacian_variance": round(float(variance), 2),
        "sharpness_score": round(float(normalized_score), 1),
        "sharpness_status": status
    }

def calculate_contrast_ratio(image: np.ndarray, bboxes: List[List[List[int]]] = None) -> Dict[str, Any]:
    """
    Computes RMS contrast of image or localized contrast within text regions.
    """
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image

    # Overall RMS Contrast
    rms_contrast = float(gray.std())
    # Standard deviation ranges roughly 0 to 80 on typical packaging
    normalized_contrast = min(100.0, (rms_contrast / 64.0) * 100.0)
    
    contrast_status = "Good"
    if rms_contrast < 25:
        contrast_status = "Poor"
    elif rms_contrast < 40:
        contrast_status = "Adequate"

    return {
        "rms_contrast": round(rms_contrast, 2),
        "contrast_score": round(float(normalized_contrast), 1),
        "contrast_status": contrast_status
    }

def analyze_font_and_layout(image: np.ndarray, ocr_lines: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Estimates font sizes, heights, bounding box areas, and compares against package face area.
    """
    img_h, img_w = image.shape[:2]
    total_area = float(img_h * img_w)

    if not ocr_lines:
        return {
            "average_font_height_px": 0,
            "min_font_height_px": 0,
            "max_font_height_px": 0,
            "text_coverage_ratio": 0.0,
            "readability_score": 0.0,
            "verdict": "No Text Detected"
        }

    heights = []
    total_text_area = 0.0
    confidences = []

    for item in ocr_lines:
        bbox = item.get("bounding_box", [])
        conf = item.get("confidence", 0.0)
        confidences.append(conf)

        if len(bbox) == 4:
            # bbox: [[x1, y1], [x2, y2], [x3, y3], [x4, y4]]
            ys = [p[1] for p in bbox]
            xs = [p[0] for p in bbox]
            h = max(ys) - min(ys)
            w = max(xs) - min(xs)
            if h > 0 and w > 0:
                heights.append(h)
                total_text_area += (h * w)

    avg_height = float(np.mean(heights)) if heights else 0.0
    min_height = float(np.min(heights)) if heights else 0.0
    max_height = float(np.max(heights)) if heights else 0.0
    coverage_ratio = (total_text_area / total_area) * 100.0 if total_area > 0 else 0.0
    avg_conf = float(np.mean(confidences)) if confidences else 0.0

    sharpness = calculate_sharpness_score(image)
    contrast = calculate_contrast_ratio(image)

    # Heuristic composite readability score (0 - 100)
    # 40% OCR confidence, 30% contrast score, 30% sharpness score
    readability = (
        (avg_conf * 100.0 * 0.4) +
        (contrast["contrast_score"] * 0.3) +
        (sharpness["sharpness_score"] * 0.3)
    )
    readability = round(min(100.0, max(0.0, readability)), 1)

    readability_status = "High Readability"
    if readability < 50:
        readability_status = "Poor Readability (Potential Non-Compliance with Rule 9)"
    elif readability < 75:
        readability_status = "Moderate Readability"

    return {
        "average_font_height_px": round(avg_height, 1),
        "min_font_height_px": round(min_height, 1),
        "max_font_height_px": round(max_height, 1),
        "text_coverage_percentage": round(coverage_ratio, 2),
        "average_ocr_confidence": round(avg_conf * 100.0, 1),
        "sharpness": sharpness,
        "contrast": contrast,
        "readability_score": readability,
        "readability_status": readability_status
    }
