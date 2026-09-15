import { GoogleGenerativeAI } from '@google/generative-ai';
import { ExtractedDeclaration } from './types';

import config from '@/lib/config';

export const isGeminiConfigured = Boolean(config.geminiApiKey && config.geminiApiKey.trim() !== '');

export async function analyzeLabelImages(base64Images: string[], mimeType: string = 'image/jpeg'): Promise<ExtractedDeclaration[]> {
  if (!isGeminiConfigured) {
    throw new Error('GEMINI_API_KEY is not configured in .env.local.');
  }

  const genAI = new GoogleGenerativeAI(config.geminiApiKey);

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.1,
    }
  });

  const imageParts = base64Images.map(base64 => ({
    inlineData: {
      data: base64,
      mimeType
    }
  }));

  const prompt = `
  You are an expert Legal Metrology compliance inspector in India. 
  Analyze the provided product packaging images and extract all mandatory declarations required under the Legal Metrology (Packaged Commodities) Rules, 2011.
  
  Return a JSON array of objects. Each object must have these exact fields:
  - "field_name": string (one of: product_name, net_quantity, mrp, mrp_tax_text, manufacturer_name, manufacturer_address, manufacture_date, consumer_care, is_imported, country_of_origin, is_food, fssai_number, batch_number, best_before, mrp_tamper_check)
  - "found": boolean (whether the field was found on the packaging)
  - "value": string or null (the extracted value, null if not found)
  - "confidence": number (0.0 to 1.0)
  - "font_size_mm": number or null (estimated font height in millimeters if discernible)
  - "location": string or null (where on the package: "front", "back", "side", "bottom")

  Extract these 15 fields:
  1. product_name - The name of the commodity
  2. net_quantity - Net weight/volume with units (e.g., "250 g", "500 mL")
  3. mrp - Maximum Retail Price (e.g., "₹ 35.00")
  4. mrp_tax_text - Look for "Inclusive of all taxes" near MRP
  5. manufacturer_name - Name of the manufacturer/packer/importer
  6. manufacturer_address - Complete address including pincode
  7. manufacture_date - Month and year of manufacture/packing (e.g., "08/2026")
  8. consumer_care - Consumer care details (phone, email, or address)
  9. is_imported - Set value to "true" if product appears imported, else "false"
  10. country_of_origin - Country of origin (only if imported)
  11. is_food - Set value to "true" if it's a food item, else "false"
  12. fssai_number - FSSAI license number (14-digit, only for food items)
  13. batch_number - Batch/Lot/Code number
  14. best_before - Best before or expiry date
  15. mrp_tamper_check - Set value to "true" if MRP looks tampered/restickered, else "false"
  
  If a field is not found, set "found" to false and "value" to null. Be thorough and accurate.
  `;

  try {
    const result = await model.generateContent([prompt, ...imageParts]);
    const responseText = result.response.text();
    const declarations: ExtractedDeclaration[] = JSON.parse(responseText);
    return declarations;
  } catch (error) {
    console.error('Error analyzing images with Gemini:', error);
    throw error;
  }
}
