export interface ExtractedDeclaration {
  field_name: string;
  found: boolean;
  value: string | null;
  confidence: number;
  font_size_mm?: number;
  location?: string;
}

export type ComplianceStatus = 'pass' | 'fail' | 'warning' | 'not_applicable';
export type Severity = 'critical' | 'major' | 'minor';
export type OverallStatus = 'compliant' | 'non_compliant' | 'warning';

export interface ComplianceResult {
  rule_id: string;
  name: string;
  rule_reference: string;
  status: ComplianceStatus;
  severity: Severity;
  message: string;
  suggestion?: string;
}

export interface AnalysisMetrics {
  readability_score?: number;
  readability_status?: string;
  sharpness?: { laplacian_variance?: number; sharpness_status?: string };
  contrast?: { contrast_status?: string };
  average_font_height_px?: number;
  average_ocr_confidence?: number;
}

export interface ScanResult {
  id: string;
  product_name: string;
  brand: string;
  category: string;
  scan_date: string;
  images: string[];
  declarations: ExtractedDeclaration[];
  compliance_results: ComplianceResult[];
  overall_score: number;
  overall_status: OverallStatus;
  raw_text_lines?: string[];
  analysis?: AnalysisMetrics;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  created_at: string;
}

export interface Report {
  id: string;
  title: string;
  generated_at: string;
  url: string;
}

export interface Inspection {
  id: string;
  product_id: string;
  inspector_name: string;
  date: string;
  result: 'pass' | 'fail';
}
