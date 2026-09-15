import re
from typing import List, Dict, Any

def extract_declarations(ocr_lines: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Parses raw OCR text lines to extract Legal Metrology mandatory declarations:
    1. Maximum Retail Price (MRP) & Unit Sale Price
    2. Net Quantity
    3. Manufacturer / Packer Details
    4. Consumer Care Details
    5. Date of Manufacture / Best Before / Expiry
    6. Country of Origin
    7. Ingredients & Nutritional Info
    """
    declarations = {
        "Product_Name": {"value": None, "confidence": 0.0, "raw_snippet": None},
        "MRP": {"value": None, "confidence": 0.0, "raw_snippet": None},
        "MRP_Tax_Text": {"value": None, "confidence": 0.0, "raw_snippet": None},
        "Net_Quantity": {"value": None, "confidence": 0.0, "raw_snippet": None},
        "Manufacturer": {"value": None, "confidence": 0.0, "raw_snippet": None},
        "Manufacturer_Address": {"value": None, "confidence": 0.0, "raw_snippet": None},
        "Consumer_Care": {"value": None, "confidence": 0.0, "raw_snippet": None},
        "Date_of_Mfg_or_Expiry": {"value": None, "confidence": 0.0, "raw_snippet": None},
        "Country_of_Origin": {"value": None, "confidence": 0.0, "raw_snippet": None},
        "FSSAI_Number": {"value": None, "confidence": 0.0, "raw_snippet": None},
        "Batch_Number": {"value": None, "confidence": 0.0, "raw_snippet": None},
        "Unit_Sale_Price": {"value": None, "confidence": 0.0, "raw_snippet": None},
        "Ingredients_Nutritional_Info": {"value": None, "confidence": 0.0, "raw_snippet": None}
    }

    if not ocr_lines:
        return declarations

    lines = [item.get("text", "").strip() for item in ocr_lines if item.get("text")]
    full_text = " ".join(lines)
    full_text_lower = full_text.lower()

    # -------------------------------------------------------------
    # 0. Product / Commodity Name (from prominent header lines)
    # -------------------------------------------------------------
    for line in lines[:5]:
        line_clean = line.strip()
        if len(line_clean) >= 4 and not any(k in line_clean.lower() for k in ["mrp", "net", "qty", "mfg", "exp", "rs.", "batch", "fssai", "care", "tax", "pvt", "ltd"]):
            declarations["Product_Name"]["value"] = line_clean
            declarations["Product_Name"]["confidence"] = 0.88
            declarations["Product_Name"]["raw_snippet"] = line_clean
            break

    # -------------------------------------------------------------
    # 1. MRP (Maximum Retail Price)
    # -------------------------------------------------------------
    mrp_regex = re.compile(
        r'(?:m\.?r\.?p\.?|max(?:imum)?\s*retail\s*price|price|rs\.?|₹)\s*[:\-\.]?\s*(?:rs\.?|₹)?\s*(\d+[\.,]?\d*)',
        re.IGNORECASE
    )
    # First search line by line for higher accuracy
    for line in lines:
        match = mrp_regex.search(line)
        if match:
            price_val = match.group(1).replace(',', '.')
            declarations["MRP"]["value"] = f"₹{price_val}"
            conf = 0.85
            if "tax" in line.lower() or "incl" in line.lower():
                conf = 0.95
            declarations["MRP"]["confidence"] = conf
            declarations["MRP"]["raw_snippet"] = line
            break

    # Fallback to full text search if not found line-by-line
    if not declarations["MRP"]["value"]:
        mrp_match = mrp_regex.search(full_text)
        if mrp_match:
            price_val = mrp_match.group(1).replace(',', '.')
            declarations["MRP"]["value"] = f"₹{price_val}"
            conf = 0.9 if "inclusive of all taxes" in full_text_lower else 0.75
            declarations["MRP"]["confidence"] = conf
            declarations["MRP"]["raw_snippet"] = full_text[max(0, mrp_match.start() - 10): min(len(full_text), mrp_match.end() + 25)]

    if any(phrase in full_text_lower for phrase in ["incl", "tax", "inclusive of all taxes", "incl of all taxes"]):
        declarations["MRP_Tax_Text"]["value"] = "Inclusive of all taxes"
        declarations["MRP_Tax_Text"]["confidence"] = 0.95
        declarations["MRP_Tax_Text"]["raw_snippet"] = "Inclusive of all taxes detected in text"

    # -------------------------------------------------------------
    # 2. Net Quantity
    # -------------------------------------------------------------
    # Units: g, gm, gms, kg, ml, l, ltr, litre, liters, cm, m, n, u, units, pcs, tablets, capsules
    qty_regex = re.compile(
        r'(?:net\s*(?:quantity|qty|weight|wt|vol|volume|content|mass)?|quantity|weight)\s*[:\-\.]?\s*(\d+(?:[\.,]\d+)?\s*(?:kg|g|gm|gms|grams|ml|l|ltr|litres?|liters?|cm|m|units?|pcs?|n))\b',
        re.IGNORECASE
    )
    for line in lines:
        match = qty_regex.search(line)
        if match:
            declarations["Net_Quantity"]["value"] = match.group(1)
            declarations["Net_Quantity"]["confidence"] = 0.92
            declarations["Net_Quantity"]["raw_snippet"] = line
            break

    if not declarations["Net_Quantity"]["value"]:
        qty_match = qty_regex.search(full_text)
        if qty_match:
            declarations["Net_Quantity"]["value"] = qty_match.group(1)
            declarations["Net_Quantity"]["confidence"] = 0.85
            declarations["Net_Quantity"]["raw_snippet"] = full_text[max(0, qty_match.start() - 5): min(len(full_text), qty_match.end() + 15)]
        else:
            # Standalone fallback unit match
            fallback_regex = re.compile(r'\b(\d+(?:[\.,]\d+)?\s*(?:kg|g|gm|gms|ml|l|ltr))\b', re.IGNORECASE)
            fb_match = fallback_regex.search(full_text)
            if fb_match:
                declarations["Net_Quantity"]["value"] = fb_match.group(1)
                declarations["Net_Quantity"]["confidence"] = 0.68
                declarations["Net_Quantity"]["raw_snippet"] = fb_match.group(0)

    # -------------------------------------------------------------
    # 3. Manufacturer / Packer Details
    # -------------------------------------------------------------
    mfg_regex = re.compile(
        r'(?:mfd\.?|mfg\.?|manufactured|packed|marketed|mktd\.?|imported)\s*(?:by|for|at)?\s*[:\-\.]?\s*([A-Za-z0-9\s,\.\-\'&]{5,80}(?:ltd|limited|pvt|private|inc|corp|enterprises|industries|foods|laboratories|co\.?))\b',
        re.IGNORECASE
    )
    for line in lines:
        match = mfg_regex.search(line)
        if match:
            declarations["Manufacturer"]["value"] = match.group(1).strip().title()
            declarations["Manufacturer"]["confidence"] = 0.90
            declarations["Manufacturer"]["raw_snippet"] = line
            break

    if not declarations["Manufacturer"]["value"]:
        mfg_match = mfg_regex.search(full_text)
        if mfg_match:
            declarations["Manufacturer"]["value"] = mfg_match.group(1).strip().title()
            declarations["Manufacturer"]["confidence"] = 0.82
            declarations["Manufacturer"]["raw_snippet"] = full_text[mfg_match.start(): min(len(full_text), mfg_match.end() + 30)]
        else:
            # Broader search for entity names with Ltd/Pvt Ltd
            alt_mfg = re.compile(r'([A-Za-z\s]{3,35}\s+(?:pvt\.?\s*ltd\.?|private\s*limited|limited|ltd\.?))', re.IGNORECASE)
            alt_match = alt_mfg.search(full_text)
            if alt_match:
                declarations["Manufacturer"]["value"] = alt_match.group(1).strip().title()
                declarations["Manufacturer"]["confidence"] = 0.72
                declarations["Manufacturer"]["raw_snippet"] = alt_match.group(1)

    # Manufacturer Address and PIN Code extraction
    pin_match = re.search(r'\b([1-9][0-9]{2}\s?[0-9]{3})\b', full_text)
    if pin_match:
        pin = pin_match.group(1).replace(" ", "")
        start_idx = max(0, pin_match.start() - 40)
        end_idx = min(len(full_text), pin_match.end() + 10)
        addr_snippet = full_text[start_idx:end_idx].strip()
        declarations["Manufacturer_Address"]["value"] = f"{declarations['Manufacturer']['value'] or 'Facility'}, PIN: {pin}"
        declarations["Manufacturer_Address"]["confidence"] = 0.90
        declarations["Manufacturer_Address"]["raw_snippet"] = addr_snippet
    elif declarations["Manufacturer"]["value"]:
        declarations["Manufacturer_Address"]["value"] = declarations["Manufacturer"]["value"]
        declarations["Manufacturer_Address"]["confidence"] = 0.75
        declarations["Manufacturer_Address"]["raw_snippet"] = declarations["Manufacturer"]["raw_snippet"]

    # -------------------------------------------------------------
    # 4. Consumer Care Details
    # -------------------------------------------------------------
    email_regex = re.compile(r'([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)')
    phone_regex = re.compile(r'(?:1800\s*\d{3}\s*\d{3,4}|(?:\+91[\-\s]?)?[6-9]\d{9})')
    care_prefix = re.compile(r'(?:consumer\s*care|customer\s*care|feedback|complaints|contact\s*us|helpline)', re.IGNORECASE)

    emails = email_regex.findall(full_text)
    phones = phone_regex.findall(full_text)
    
    care_snippets = []
    if emails:
        care_snippets.append(emails[0])
    if phones:
        care_snippets.append(phones[0])

    if care_snippets:
        declarations["Consumer_Care"]["value"] = " | ".join(care_snippets)
        declarations["Consumer_Care"]["confidence"] = 0.92
        declarations["Consumer_Care"]["raw_snippet"] = ", ".join(care_snippets)
    else:
        care_match = care_prefix.search(full_text)
        if care_match:
            snippet = full_text[care_match.end(): min(len(full_text), care_match.end() + 50)].strip()
            declarations["Consumer_Care"]["value"] = snippet[:50]
            declarations["Consumer_Care"]["confidence"] = 0.70
            declarations["Consumer_Care"]["raw_snippet"] = snippet

    # -------------------------------------------------------------
    # 5. Date of Manufacture / Best Before / Expiry
    # -------------------------------------------------------------
    date_regex = re.compile(
        r'(?:mfd\.?|mfg\.?|packed|best\s*before|use\s*by|exp\.?|expiry)\s*[:\-\.]?\s*([0-9]{1,2}[/\-\.][0-9]{1,2}[/\-\.][0-9]{2,4}|[0-9]{1,2}[/\-\.][0-9]{4}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s\.\-]+[0-9]{2,4})',
        re.IGNORECASE
    )
    for line in lines:
        d_match = date_regex.search(line)
        if d_match:
            declarations["Date_of_Mfg_or_Expiry"]["value"] = d_match.group(0).strip()
            declarations["Date_of_Mfg_or_Expiry"]["confidence"] = 0.88
            declarations["Date_of_Mfg_or_Expiry"]["raw_snippet"] = line
            break

    if not declarations["Date_of_Mfg_or_Expiry"]["value"]:
        d_match = date_regex.search(full_text)
        if d_match:
            declarations["Date_of_Mfg_or_Expiry"]["value"] = d_match.group(0).strip()
            declarations["Date_of_Mfg_or_Expiry"]["confidence"] = 0.78
            declarations["Date_of_Mfg_or_Expiry"]["raw_snippet"] = full_text[d_match.start(): min(len(full_text), d_match.end() + 20)]

    # -------------------------------------------------------------
    # 6. Country of Origin
    # -------------------------------------------------------------
    origin_regex = re.compile(
        r'(?:country\s*of\s*origin|made\s*in|product\s*of)\s*[:\-\.]?\s*([A-Za-z]{3,20})',
        re.IGNORECASE
    )
    orig_match = origin_regex.search(full_text)
    if orig_match:
        declarations["Country_of_Origin"]["value"] = orig_match.group(1).title()
        declarations["Country_of_Origin"]["confidence"] = 0.90
        declarations["Country_of_Origin"]["raw_snippet"] = orig_match.group(0)
    elif "india" in full_text_lower:
        declarations["Country_of_Origin"]["value"] = "India"
        declarations["Country_of_Origin"]["confidence"] = 0.75
        declarations["Country_of_Origin"]["raw_snippet"] = "India detected in packaging text"

    # -------------------------------------------------------------
    # 7. Ingredients & Nutritional Info
    # -------------------------------------------------------------
    ing_regex = re.compile(r'(?:ingredients?\s*[:\-\.]?\s*)([A-Za-z0-9\s,\(\)%\-\.]+)', re.IGNORECASE)
    ing_match = ing_regex.search(full_text)
    nutri_found = any(k in full_text_lower for k in ["energy", "protein", "carbohydrate", "fat", "nutrition", "nutritional information"])
    
    if ing_match:
        ing_val = ing_match.group(1)[:70].strip() + ("..." if len(ing_match.group(1)) > 70 else "")
        if nutri_found:
            ing_val += " [Nutritional Table Present]"
        declarations["Ingredients_Nutritional_Info"]["value"] = ing_val
        declarations["Ingredients_Nutritional_Info"]["confidence"] = 0.85
        declarations["Ingredients_Nutritional_Info"]["raw_snippet"] = ing_match.group(0)[:90]
    elif nutri_found:
        declarations["Ingredients_Nutritional_Info"]["value"] = "Nutritional Information Table Detected"
        declarations["Ingredients_Nutritional_Info"]["confidence"] = 0.80
        declarations["Ingredients_Nutritional_Info"]["raw_snippet"] = "Nutritional values found in text"

    # -------------------------------------------------------------
    # 8. FSSAI License Number (14 digits)
    # -------------------------------------------------------------
    fssai_match = re.search(r'(?:fssai|lic(?:\.|\s*no\.?)?)\s*[:\-\.]?\s*(\d{14})', full_text, re.IGNORECASE)
    if not fssai_match:
        fssai_match = re.search(r'\b(1\d{13})\b', full_text)
    if fssai_match:
        declarations["FSSAI_Number"]["value"] = fssai_match.group(1)
        declarations["FSSAI_Number"]["confidence"] = 0.94
        declarations["FSSAI_Number"]["raw_snippet"] = fssai_match.group(0)

    # -------------------------------------------------------------
    # 9. Batch / Lot Number
    # -------------------------------------------------------------
    batch_match = re.search(r'(?:batch|lot|b\.?\s*no\.?)\s*[:\-\.]?\s*([A-Za-z0-9\-\/]{3,15})', full_text, re.IGNORECASE)
    if batch_match:
        declarations["Batch_Number"]["value"] = batch_match.group(1)
        declarations["Batch_Number"]["confidence"] = 0.90
        declarations["Batch_Number"]["raw_snippet"] = batch_match.group(0)

    # -------------------------------------------------------------
    # 10. Unit Sale Price (USP)
    # -------------------------------------------------------------
    usp_match = re.search(r'(?:usp|unit\s*sale\s*price)\s*[:\-\.]?\s*(?:rs\.?|₹)?\s*(\d+(?:\.\d+)?\s*/\s*(?:g|gm|kg|ml|l|unit|piece|u|n))', full_text, re.IGNORECASE)
    if usp_match:
        declarations["Unit_Sale_Price"]["value"] = f"₹{usp_match.group(1)}"
        declarations["Unit_Sale_Price"]["confidence"] = 0.88
        declarations["Unit_Sale_Price"]["raw_snippet"] = usp_match.group(0)

    return declarations
