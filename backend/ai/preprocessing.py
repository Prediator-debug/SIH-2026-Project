import cv2
import numpy as np

def deskew(image: np.ndarray) -> np.ndarray:
    """
    Detects text skew angle and rotates the image to upright.
    """
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image.copy()

    # Invert binary image to make text white on black background
    thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]
    
    # Find all coordinates of foreground pixels
    coords = np.column_stack(np.where(thresh > 0))
    if len(coords) < 50:
        return image

    # Compute minimum area rectangle
    angle = cv2.minAreaRect(coords)[-1]

    # Normalize angle
    if angle < -45:
        angle = -(90 + angle)
    elif angle > 45:
        angle = 90 - angle
    else:
        angle = -angle

    # If angle is very small, no rotation needed
    if abs(angle) < 0.5 or abs(angle) > 45:
        return image

    (h, w) = image.shape[:2]
    center = (w // 2, h // 2)
    m = cv2.getRotationMatrix2D(center, angle, 1.0)
    rotated = cv2.warpAffine(
        image, m, (w, h),
        flags=cv2.INTER_CUBIC,
        borderMode=cv2.BORDER_REPLICATE
    )
    return rotated

def remove_noise(image: np.ndarray) -> np.ndarray:
    """
    Applies bilateral filter to smooth textures while preserving sharp text edges.
    """
    if len(image.shape) == 3:
        return cv2.bilateralFilter(image, d=9, sigmaColor=75, sigmaSpace=75)
    return cv2.bilateralFilter(image, d=7, sigmaColor=50, sigmaSpace=50)

def enhance_contrast(image: np.ndarray) -> np.ndarray:
    """
    Enhances contrast using CLAHE (Contrast Limited Adaptive Histogram Equalization).
    Works on color images via LAB color space or directly on grayscale.
    """
    if len(image.shape) == 3:
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        l_channel, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        cl = clahe.apply(l_channel)
        limg = cv2.merge((cl, a, b))
        return cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
    else:
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        return clahe.apply(image)

def correct_perspective(image: np.ndarray) -> np.ndarray:
    """
    Detects prominent rectangular contours (e.g. package face or label)
    and warps perspective to a front-facing rectangle if a prominent quad is detected.
    """
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image.copy()

    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edged = cv2.Canny(blurred, 50, 150)

    contours, _ = cv2.findContours(edged, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    contours = sorted(contours, key=cv2.contourArea, reverse=True)[:5]

    h, w = image.shape[:2]
    img_area = h * w

    for c in contours:
        peri = cv2.arcLength(c, True)
        approx = cv2.approxPolyDP(c, 0.02 * peri, True)
        # Check if 4 points and area covers at least 25% of image
        if len(approx) == 4 and cv2.contourArea(approx) > 0.25 * img_area:
            pts = approx.reshape(4, 2).astype("float32")
            
            # Order points: top-left, top-right, bottom-right, bottom-left
            s = pts.sum(axis=1)
            diff = np.diff(pts, axis=1)
            rect = np.zeros((4, 2), dtype="float32")
            rect[0] = pts[np.argmin(s)]
            rect[2] = pts[np.argmax(s)]
            rect[1] = pts[np.argmin(diff)]
            rect[3] = pts[np.argmax(diff)]

            (tl, tr, br, bl) = rect
            width_a = np.sqrt(((br[0] - bl[0]) ** 2) + ((br[1] - bl[1]) ** 2))
            width_b = np.sqrt(((tr[0] - tl[0]) ** 2) + ((tr[1] - tl[1]) ** 2))
            max_w = max(int(width_a), int(width_b))

            height_a = np.sqrt(((tr[0] - br[0]) ** 2) + ((tr[1] - br[1]) ** 2))
            height_b = np.sqrt(((tl[0] - bl[0]) ** 2) + ((tl[1] - bl[1]) ** 2))
            max_h = max(int(height_a), int(height_b))

            if max_w > 100 and max_h > 100:
                dst = np.array([
                    [0, 0],
                    [max_w - 1, 0],
                    [max_w - 1, max_h - 1],
                    [0, max_h - 1]
                ], dtype="float32")
                m = cv2.getPerspectiveTransform(rect, dst)
                warped = cv2.warpPerspective(image, m, (max_w, max_h))
                return warped

    return image

def preprocess_pipeline(image: np.ndarray) -> np.ndarray:
    """
    Standard preprocessing pipeline:
    1. Perspective correction (if packaging contour detected)
    2. Skew correction
    3. Noise reduction
    4. Contrast enhancement
    """
    # 1. Perspective
    corrected = correct_perspective(image)
    
    # 2. Deskew
    deskewed = deskew(corrected)
    
    # 3. Noise reduction
    denoised = remove_noise(deskewed)
    
    # 4. Contrast enhancement
    enhanced = enhance_contrast(denoised)
    
    return enhanced
