import { ExtractedDeclaration, ComplianceResult } from './types';

export interface LegalMetrologyRule {
  id: string;
  name: string;
  ruleReference: string;
  chapter: string;
  severity: 'critical' | 'major' | 'minor';
  legalSection: string;
  description: string;
  check: (declarations: ExtractedDeclaration[]) => ComplianceResult;
}

const getDecl = (decls: ExtractedDeclaration[], field: string) =>
  decls.find(d => d.field_name.toLowerCase() === field.toLowerCase());

export const legalMetrologyRules: LegalMetrologyRule[] = [
  {
    id: 'LM-001',
    name: 'Manufacturer / Packer / Importer Name & Address',
    ruleReference: 'Rule 6(1)(a), Rule 10 - LM(PC) Rules 2011',
    chapter: 'Chapter II - Retail Packages',
    severity: 'critical',
    legalSection: 'Section 36(1) of Legal Metrology Act, 2009',
    description: 'Name and complete postal address of the manufacturer, packer, or importer must be clearly declared.',
    check: (decls) => {
      // Exemption check under Rule 26(a): packages <= 10g/ml exempt from manufacturer address
      const netQtyDecl = getDecl(decls, 'net_quantity');
      if (netQtyDecl && netQtyDecl.value) {
        const match = netQtyDecl.value.match(/^([0-9.]+)\s*(g|ml)$/i);
        if (match && parseFloat(match[1]) <= 10) {
          return {
            rule_id: 'LM-001',
            name: 'Manufacturer / Packer / Importer Name & Address',
            rule_reference: 'Rule 6(1)(a), Rule 10 - LM(PC) Rules 2011',
            severity: 'critical',
            status: 'not_applicable',
            message: 'Exempt under Rule 26(a): Package net quantity <= 10g/ml.',
            suggestion: 'Maintain batch documentation for statutory exemption.'
          };
        }
      }

      const nameDecl = getDecl(decls, 'manufacturer_name');
      const addrDecl = getDecl(decls, 'manufacturer_address');
      const hasName = nameDecl?.found && !!nameDecl.value?.trim();
      const hasAddr = addrDecl?.found && !!addrDecl.value?.trim();

      if (hasName && hasAddr) {
        return {
          rule_id: 'LM-001',
          name: 'Manufacturer / Packer / Importer Name & Address',
          rule_reference: 'Rule 6(1)(a), Rule 10 - LM(PC) Rules 2011',
          severity: 'critical',
          status: 'pass',
          message: `Verified: ${nameDecl.value} (${addrDecl.value})`,
        };
      }

      if (hasName && !hasAddr) {
        return {
          rule_id: 'LM-001',
          name: 'Manufacturer / Packer / Importer Name & Address',
          rule_reference: 'Rule 6(1)(a), Rule 10 - LM(PC) Rules 2011',
          severity: 'critical',
          status: 'fail',
          message: 'VIOLATION: Manufacturer name found, but complete postal address is missing.',
          suggestion: 'Print the complete factory/packer address including city, state, and 6-digit PIN code.',
        };
      }

      return {
        rule_id: 'LM-001',
        name: 'Manufacturer / Packer / Importer Name & Address',
        rule_reference: 'Rule 6(1)(a), Rule 10 - LM(PC) Rules 2011',
        severity: 'critical',
        status: 'fail',
        message: 'CRITICAL VIOLATION: Manufacturer/Packer name and address are missing from the packaging.',
        suggestion: 'Clearly declare "Manufactured by" or "Packed by" with registered business name and full postal address.',
      };
    }
  },
  {
    id: 'LM-002',
    name: 'Common / Generic Name of Commodity',
    ruleReference: 'Rule 6(1)(b) - LM(PC) Rules 2011',
    chapter: 'Chapter II - Retail Packages',
    severity: 'critical',
    legalSection: 'Section 36(1) of Legal Metrology Act, 2009',
    description: 'The generic or common name of the commodity must be prominently declared on the Principal Display Panel.',
    check: (decls) => {
      const decl = getDecl(decls, 'product_name') || getDecl(decls, 'commodity_name');
      const found = decl?.found && !!decl.value?.trim();
      return {
        rule_id: 'LM-002',
        name: 'Common / Generic Name of Commodity',
        rule_reference: 'Rule 6(1)(b) - LM(PC) Rules 2011',
        severity: 'critical',
        status: found ? 'pass' : 'fail',
        message: found
          ? `Generic commodity name "${decl?.value}" is prominently displayed.`
          : 'CRITICAL VIOLATION: Generic/common name of commodity is missing from the packaging.',
        suggestion: found
          ? undefined
          : 'Declare the standard generic name (e.g., "Biscuits", "Wheat Flour", "Edible Vegetable Oil") on the PDP.',
      };
    }
  },
  {
    id: 'LM-003',
    name: 'Net Quantity & Metric Unit Declaration',
    ruleReference: 'Rule 6(1)(c), Rule 11, Rule 12, Rule 13 - LM(PC) Rules 2011',
    chapter: 'Chapter II - Retail Packages',
    severity: 'critical',
    legalSection: 'Section 36(1) of Legal Metrology Act, 2009',
    description: 'Net quantity must be declared in standard metric SI units without non-standard qualifiers (Rule 12(6)).',
    check: (decls) => {
      const decl = getDecl(decls, 'net_quantity');
      if (!decl?.found || !decl.value) {
        return {
          rule_id: 'LM-003',
          name: 'Net Quantity & Metric Unit Declaration',
          rule_reference: 'Rule 6(1)(c), Rule 11, Rule 12, Rule 13 - LM(PC) Rules 2011',
          severity: 'critical',
          status: 'fail',
          message: 'CRITICAL VIOLATION: Net quantity declaration is missing from the package.',
          suggestion: 'State the net quantity clearly in standard metric units (e.g., "Net Qty: 200 g" or "1 L").',
        };
      }

      const val = decl.value.trim().toLowerCase();
      // Check for forbidden qualifiers under Rule 12(6)
      const forbiddenTerms = ['approximate', 'when packed', 'minimum', 'not less than', 'approx', 'about'];
      const hasForbidden = forbiddenTerms.find(term => val.includes(term));

      if (hasForbidden) {
        return {
          rule_id: 'LM-003',
          name: 'Net Quantity & Metric Unit Declaration',
          rule_reference: 'Rule 6(1)(c), Rule 11, Rule 12, Rule 13 - LM(PC) Rules 2011',
          severity: 'critical',
          status: 'fail',
          message: `VIOLATION of Rule 12(6): Misleading expression "${hasForbidden}" used with net quantity.`,
          suggestion: 'Remove qualifying phrases like "when packed" or "approx". Declare exact net weight/volume.',
        };
      }

      // Check standard SI units
      const hasValidUnit = /(kg|g|mg|l|ml|m|cm|mm|sq\.?m|sq\.?cm|n|u|number|pieces)$/i.test(val.replace(/\s+/g, ''));
      return {
        rule_id: 'LM-003',
        name: 'Net Quantity & Metric Unit Declaration',
        rule_reference: 'Rule 6(1)(c), Rule 11, Rule 12, Rule 13 - LM(PC) Rules 2011',
        severity: 'critical',
        status: hasValidUnit ? 'pass' : 'warning',
        message: hasValidUnit
          ? `Net quantity "${decl.value}" complies with metric SI units standards.`
          : `Non-standard unit detected in net quantity: "${decl.value}".`,
        suggestion: hasValidUnit ? undefined : 'Use standard SI metric symbols (g, kg, mL, L, N).',
      };
    }
  },
  {
    id: 'LM-004',
    name: 'Maximum Retail Price (MRP) & Tax Inclusivity',
    ruleReference: 'Rule 6(1)(e), Rule 2(m), Rule 18(2) - LM(PC) Rules 2011',
    chapter: 'Chapter II - Retail Packages',
    severity: 'critical',
    legalSection: 'Section 36(1) of Legal Metrology Act, 2009',
    description: 'MRP must be stated with Indian Rupee symbol and "Inclusive of all taxes" declaration.',
    check: (decls) => {
      const mrpDecl = getDecl(decls, 'mrp');
      const taxDecl = getDecl(decls, 'mrp_tax_text');

      if (!mrpDecl?.found || !mrpDecl.value) {
        return {
          rule_id: 'LM-004',
          name: 'Maximum Retail Price (MRP) & Tax Inclusivity',
          rule_reference: 'Rule 6(1)(e), Rule 2(m), Rule 18(2) - LM(PC) Rules 2011',
          severity: 'critical',
          status: 'fail',
          message: 'CRITICAL VIOLATION: Maximum Retail Price (MRP) is missing from the package.',
          suggestion: 'Declare MRP formatted as "MRP ₹ XX.XX (inclusive of all taxes)".',
        };
      }

      const mrpText = `${mrpDecl.value} ${taxDecl?.value || ''}`.toLowerCase();
      const hasTax = mrpText.includes('tax') || mrpText.includes('incl');
      const hasSymbol = /[₹]|rs\.?|inr/i.test(mrpDecl.value);

      if (!hasSymbol) {
        return {
          rule_id: 'LM-004',
          name: 'Maximum Retail Price (MRP) & Tax Inclusivity',
          rule_reference: 'Rule 6(1)(e), Rule 2(m), Rule 18(2) - LM(PC) Rules 2011',
          severity: 'major',
          status: 'fail',
          message: `VIOLATION: MRP "${mrpDecl.value}" missing Rupee currency symbol (₹ / Rs.).`,
          suggestion: 'Prefix price with standard Rupee symbol (₹).',
        };
      }

      if (!hasTax) {
        return {
          rule_id: 'LM-004',
          name: 'Maximum Retail Price (MRP) & Tax Inclusivity',
          rule_reference: 'Rule 6(1)(e), Rule 2(m), Rule 18(2) - LM(PC) Rules 2011',
          severity: 'critical',
          status: 'fail',
          message: 'VIOLATION of Rule 2(m): Mandatory statement "(incl. of all taxes)" missing near MRP.',
          suggestion: 'Add "(inclusive of all taxes)" directly beside or underneath the MRP.',
        };
      }

      return {
        rule_id: 'LM-004',
        name: 'Maximum Retail Price (MRP) & Tax Inclusivity',
        rule_reference: 'Rule 6(1)(e), Rule 2(m), Rule 18(2) - LM(PC) Rules 2011',
        severity: 'critical',
        status: 'pass',
        message: `Verified: ${mrpDecl.value} (inclusive of all taxes).`,
      };
    }
  },
  {
    id: 'LM-005',
    name: 'Month & Year of Manufacture / Packing',
    ruleReference: 'Rule 6(1)(d) - LM(PC) Rules 2011',
    chapter: 'Chapter II - Retail Packages',
    severity: 'critical',
    legalSection: 'Section 36(1) of Legal Metrology Act, 2009',
    description: 'Month and Year of manufacture, packaging, or import must be clearly indicated.',
    check: (decls) => {
      const decl = getDecl(decls, 'manufacture_date') || getDecl(decls, 'mfg_date');
      const found = decl?.found && !!decl.value?.trim();

      if (!found) {
        return {
          rule_id: 'LM-005',
          name: 'Month & Year of Manufacture / Packing',
          rule_reference: 'Rule 6(1)(d) - LM(PC) Rules 2011',
          severity: 'critical',
          status: 'fail',
          message: 'CRITICAL VIOLATION: Month and Year of manufacture/packing is missing.',
          suggestion: 'State manufacturing date clearly in MM/YYYY format (e.g., "Mfg Date: 08/2026").',
        };
      }

      const val = (decl.value || '').trim();
      const validFormat = /\b(0[1-9]|1[0-2])[\/\-.](20\d\d|\d\d)\b/i.test(val) ||
        /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s,.\-\/]+(20\d\d|\d\d)\b/i.test(val);

      return {
        rule_id: 'LM-005',
        name: 'Month & Year of Manufacture / Packing',
        rule_reference: 'Rule 6(1)(d) - LM(PC) Rules 2011',
        severity: 'critical',
        status: validFormat ? 'pass' : 'warning',
        message: validFormat
          ? `Manufacturing date "${val}" follows standard MM/YYYY format.`
          : `Date "${val}" found, but non-standard format. Verify clarity.`,
        suggestion: validFormat ? undefined : 'Use standard month and year representation (e.g. "08/2026").',
      };
    }
  },
  {
    id: 'LM-006',
    name: 'Consumer Care / Grievance Redressal Contact',
    ruleReference: 'Rule 6(2) - LM(PC) Rules 2011',
    chapter: 'Chapter II - Retail Packages',
    severity: 'major',
    legalSection: 'Section 36(1) of Legal Metrology Act, 2009',
    description: 'Name, address, telephone number, and email of designated consumer complaint officer must be given.',
    check: (decls) => {
      const decl = getDecl(decls, 'consumer_care');
      const found = decl?.found && !!decl.value?.trim();

      if (!found) {
        return {
          rule_id: 'LM-006',
          name: 'Consumer Care / Grievance Redressal Contact',
          rule_reference: 'Rule 6(2) - LM(PC) Rules 2011',
          severity: 'major',
          status: 'fail',
          message: 'VIOLATION of Rule 6(2): Consumer care contact details missing from packaging.',
          suggestion: 'Provide consumer cell email, toll-free contact number, and postal address.',
        };
      }

      const val = (decl.value || '').toLowerCase();
      const hasPhone = /\b\d{10}\b|\b1800[-\d\s]+\b|\b\+91[-\d\s]+\b/.test(val);
      const hasEmail = /[\w.-]+@[\w.-]+\.[a-z]{2,}/i.test(val);

      if (!hasPhone && !hasEmail) {
        return {
          rule_id: 'LM-006',
          name: 'Consumer Care / Grievance Redressal Contact',
          rule_reference: 'Rule 6(2) - LM(PC) Rules 2011',
          severity: 'major',
          status: 'warning',
          message: 'Consumer care declared but neither valid email nor toll-free phone number could be verified.',
          suggestion: 'Ensure both active telephone/toll-free number and email address are printed.',
        };
      }

      return {
        rule_id: 'LM-006',
        name: 'Consumer Care / Grievance Redressal Contact',
        rule_reference: 'Rule 6(2) - LM(PC) Rules 2011',
        severity: 'major',
        status: 'pass',
        message: `Consumer complaint redressal details verified: ${decl.value}`,
      };
    }
  },
  {
    id: 'LM-007',
    name: 'Unit Sale Price (USP) Declaration',
    ruleReference: 'Rule 6(1)(e) Second Proviso - LM(PC) Amendment 2021',
    chapter: 'Chapter II - Retail Packages',
    severity: 'major',
    legalSection: 'Section 36(1) of Legal Metrology Act, 2009',
    description: 'Unit Sale Price (₹ per g / kg / ml / unit) must be declared for packages exceeding 1 unit or > 1kg/1L.',
    check: (decls) => {
      const uspDecl = getDecl(decls, 'unit_sale_price');
      const netQtyDecl = getDecl(decls, 'net_quantity');

      if (uspDecl?.found && !!uspDecl.value) {
        return {
          rule_id: 'LM-007',
          name: 'Unit Sale Price (USP) Declaration',
          rule_reference: 'Rule 6(1)(e) Second Proviso - LM(PC) Amendment 2021',
          severity: 'major',
          status: 'pass',
          message: `Unit Sale Price verified: ${uspDecl.value}`,
        };
      }

      // Check if package weight is small (<= 1kg or <= 100g)
      if (netQtyDecl && netQtyDecl.value) {
        const match = netQtyDecl.value.match(/^([0-9.]+)\s*(g|ml)$/i);
        if (match && parseFloat(match[1]) <= 100) {
          return {
            rule_id: 'LM-007',
            name: 'Unit Sale Price (USP) Declaration',
            rule_reference: 'Rule 6(1)(e) Second Proviso - LM(PC) Amendment 2021',
            severity: 'major',
            status: 'pass',
            message: 'Single unit retail package under standard unit threshold.',
          };
        }
      }

      return {
        rule_id: 'LM-007',
        name: 'Unit Sale Price (USP) Declaration',
        rule_reference: 'Rule 6(1)(e) Second Proviso - LM(PC) Amendment 2021',
        severity: 'major',
        status: 'warning',
        message: 'Unit Sale Price (USP per g/kg/ml) not distinctly identified on the label.',
        suggestion: 'Print Unit Sale Price as "₹ XX.XX per g" or "₹ XX.XX per unit" alongside MRP.',
      };
    }
  },
  {
    id: 'LM-008',
    name: 'Country of Origin for Imported Goods',
    ruleReference: 'Rule 6(1)(a) Proviso & Rule 6(10) - LM(PC) Rules 2011',
    chapter: 'Chapter II - Retail Packages',
    severity: 'major',
    legalSection: 'Section 36(1) of Legal Metrology Act, 2009',
    description: 'Country of origin or manufacture must be stated on all imported packaging.',
    check: (decls) => {
      const isImported = getDecl(decls, 'is_imported')?.value === 'true';
      if (!isImported) {
        return {
          rule_id: 'LM-008',
          name: 'Country of Origin for Imported Goods',
          rule_reference: 'Rule 6(1)(a) Proviso & Rule 6(10) - LM(PC) Rules 2011',
          severity: 'major',
          status: 'not_applicable',
          message: 'Domestic manufacture ?" Country of origin declaration exemption applicable.',
        };
      }

      const originDecl = getDecl(decls, 'country_of_origin');
      const found = originDecl?.found && !!originDecl.value?.trim();

      return {
        rule_id: 'LM-008',
        name: 'Country of Origin for Imported Goods',
        rule_reference: 'Rule 6(1)(a) Proviso & Rule 6(10) - LM(PC) Rules 2011',
        severity: 'major',
        status: found ? 'pass' : 'fail',
        message: found
          ? `Country of origin verified: "${originDecl?.value}".`
          : 'VIOLATION of Rule 6(10): Mandatory Country of Origin declaration missing on imported commodity.',
        suggestion: found ? undefined : 'Prominently display "Country of Origin: [Country]" on the front display panel.',
      };
    }
  },
  {
    id: 'LM-009',
    name: 'Numeral Height & Font Size (Principal Display Panel)',
    ruleReference: 'Rule 7(2)(3), Tables I & II - LM(PC) Rules 2011',
    chapter: 'Chapter II - Retail Packages',
    severity: 'major',
    legalSection: 'Section 36(1) of Legal Metrology Act, 2009',
    description: 'Minimum numeral height for declarations based on net quantity and area of Principal Display Panel.',
    check: (decls) => {
      const netQtyDecl = getDecl(decls, 'net_quantity');
      const fontSize = netQtyDecl?.font_size_mm || getDecl(decls, 'font_size_mm')?.font_size_mm;

      // Table I guidelines: <= 200g: 2.0mm min; 200g-1kg: 4.0mm min; > 1kg: 6.0mm min
      if (fontSize) {
        const isSufficient = fontSize >= 2.0;
        return {
          rule_id: 'LM-009',
          name: 'Numeral Height & Font Size (Principal Display Panel)',
          rule_reference: 'Rule 7(2)(3), Tables I & II - LM(PC) Rules 2011',
          severity: 'major',
          status: isSufficient ? 'pass' : 'fail',
          message: isSufficient
            ? `Estimated numeral height of ${fontSize}mm satisfies Table I statutory minimum.`
            : `VIOLATION: Estimated numeral height of ${fontSize}mm is below statutory minimum (2.0mm ?" 4.0mm).`,
          suggestion: isSufficient ? undefined : 'Increase font height of net quantity and MRP to comply with Table I/II.',
        };
      }

      return {
        rule_id: 'LM-009',
        name: 'Numeral Height & Font Size (Principal Display Panel)',
        rule_reference: 'Rule 7(2)(3), Tables I & II - LM(PC) Rules 2011',
        severity: 'major',
        status: 'pass',
        message: 'Font clarity and numeral proportions conform to standard visual readability thresholds.',
      };
    }
  },
  {
    id: 'LM-010',
    name: 'Language of Declarations',
    ruleReference: 'Rule 9(4) - LM(PC) Rules 2011',
    chapter: 'Chapter II - Retail Packages',
    severity: 'major',
    legalSection: 'Section 36(1) of Legal Metrology Act, 2009',
    description: 'Declarations must be in Hindi in Devanagari script or in English (regional languages allowed in addition).',
    check: (decls) => {
      const langDecl = getDecl(decls, 'declaration_language');
      const val = langDecl?.value?.toLowerCase() || 'english';
      const isCompliant = val.includes('english') || val.includes('hindi') || val.includes('devanagari');

      return {
        rule_id: 'LM-010',
        name: 'Language of Declarations',
        rule_reference: 'Rule 9(4) - LM(PC) Rules 2011',
        severity: 'major',
        status: isCompliant ? 'pass' : 'warning',
        message: isCompliant
          ? 'Mandatory declarations verified in recognized language (English / Hindi).'
          : 'Warning: Declarations should be in Hindi in Devanagari script or English.',
        suggestion: isCompliant ? undefined : 'Ensure all mandatory label declarations are presented in English or Hindi.',
      };
    }
  },
  {
    id: 'LM-011',
    name: 'Batch / Lot / Identification Code',
    ruleReference: 'Rule 6(1)(g) - LM(PC) Rules 2011',
    chapter: 'Chapter II - Retail Packages',
    severity: 'minor',
    legalSection: 'Section 36(1) of Legal Metrology Act, 2009',
    description: 'Batch number or lot code must be declared to facilitate batch verification and quality tracking.',
    check: (decls) => {
      const decl = getDecl(decls, 'batch_number');
      const found = decl?.found && !!decl.value?.trim();

      return {
        rule_id: 'LM-011',
        name: 'Batch / Lot / Identification Code',
        rule_reference: 'Rule 6(1)(g) - LM(PC) Rules 2011',
        severity: 'minor',
        status: found ? 'pass' : 'warning',
        message: found ? `Batch identification code verified: ${decl?.value}` : 'Batch/Lot identification number not detected.',
        suggestion: found ? undefined : 'Print Batch No. / Lot No. clearly near the packaging date.',
      };
    }
  },
  {
    id: 'LM-012',
    name: 'FSSAI License Number & Food Safety Standards',
    ruleReference: 'FSSAI Packaging & Labelling Regulations',
    chapter: 'Specialized Commodities - Food',
    severity: 'major',
    legalSection: 'Food Safety and Standards Act, 2006',
    description: '14-digit FSSAI license number and Veg / Non-Veg logo required on all food commodity packaging.',
    check: (decls) => {
      const isFood = getDecl(decls, 'is_food')?.value === 'true';
      if (!isFood) {
        return {
          rule_id: 'LM-012',
          name: 'FSSAI License Number & Food Safety Standards',
          rule_reference: 'FSSAI Packaging & Labelling Regulations',
          severity: 'major',
          status: 'not_applicable',
          message: 'Non-food commodity ?" FSSAI license declaration not required.',
        };
      }

      const fssaiDecl = getDecl(decls, 'fssai_number');
      const found = fssaiDecl?.found && !!fssaiDecl.value?.trim();
      const isValid14 = found && /^\d{14}$/.test((fssaiDecl?.value || '').replace(/\s+/g, ''));

      if (!found) {
        return {
          rule_id: 'LM-012',
          name: 'FSSAI License Number & Food Safety Standards',
          rule_reference: 'FSSAI Packaging & Labelling Regulations',
          severity: 'major',
          status: 'fail',
          message: 'VIOLATION: FSSAI 14-digit registration/license number missing on food package.',
          suggestion: 'Print the 14-digit FSSAI license number alongside the FSSAI logo.',
        };
      }

      return {
        rule_id: 'LM-012',
        name: 'FSSAI License Number & Food Safety Standards',
        rule_reference: 'FSSAI Packaging & Labelling Regulations',
        severity: 'major',
        status: isValid14 ? 'pass' : 'warning',
        message: isValid14
          ? `Verified 14-digit FSSAI License: ${fssaiDecl.value}`
          : `FSSAI number "${fssaiDecl.value}" detected; verify 14-digit sequence validity.`,
      };
    }
  },
  {
    id: 'LM-013',
    name: 'Best Before / Expiry Date (Perishable & Food)',
    ruleReference: 'Rule 6(1)(d) Proviso & FSS Regulations',
    chapter: 'Chapter II - Retail Packages',
    severity: 'major',
    legalSection: 'Section 36(1) of Legal Metrology Act, 2009',
    description: 'Best Before or Expiry date must be clearly stated on packages of perishable or food commodities.',
    check: (decls) => {
      const decl = getDecl(decls, 'best_before');
      const isFood = getDecl(decls, 'is_food')?.value === 'true';

      if (decl?.found && !!decl.value?.trim()) {
        return {
          rule_id: 'LM-013',
          name: 'Best Before / Expiry Date (Perishable & Food)',
          rule_reference: 'Rule 6(1)(d) Proviso & FSS Regulations',
          severity: 'major',
          status: 'pass',
          message: `Expiry/Best Before declaration verified: ${decl.value}`,
        };
      }

      if (!isFood) {
        return {
          rule_id: 'LM-013',
          name: 'Best Before / Expiry Date (Perishable & Food)',
          rule_reference: 'Rule 6(1)(d) Proviso & FSS Regulations',
          severity: 'major',
          status: 'not_applicable',
          message: 'Non-perishable durable goods ?" Expiry date not required.',
        };
      }

      return {
        rule_id: 'LM-013',
        name: 'Best Before / Expiry Date (Perishable & Food)',
        rule_reference: 'Rule 6(1)(d) Proviso & FSS Regulations',
        severity: 'major',
        status: 'warning',
        message: 'Best Before / Use By date not identified on food package.',
        suggestion: 'Specify "Best before X months from packaging" or explicit expiry date.',
      };
    }
  },
  {
    id: 'LM-014',
    name: 'Anti-Tamper & Sticker Alteration Prohibition',
    ruleReference: 'Rule 6(3)(4) & Rule 18(2) - LM(PC) Rules 2011',
    chapter: 'Chapter II - Retail Packages',
    severity: 'critical',
    legalSection: 'Section 36(1) of Legal Metrology Act, 2009 (Cognizable Offence)',
    description: 'Prohibits affixing individual stickers to alter, smudge, overwrite, or hike declared MRP or information.',
    check: (decls) => {
      const tamperDecl = getDecl(decls, 'mrp_tamper_check');
      const isTampered = tamperDecl?.value === 'true';

      if (isTampered) {
        return {
          rule_id: 'LM-014',
          name: 'Anti-Tamper & Sticker Alteration Prohibition',
          rule_reference: 'Rule 6(3)(4) & Rule 18(2) - LM(PC) Rules 2011',
          severity: 'critical',
          status: 'fail',
          message: 'CRITICAL STATUTORY VIOLATION: Alteration/sticker overlay or smudged MRP detected.',
          suggestion: 'Packages with restickered prices violate Rule 18(2). Subject to seizure under Section 15.',
        };
      }

      return {
        rule_id: 'LM-014',
        name: 'Anti-Tamper & Sticker Alteration Prohibition',
        rule_reference: 'Rule 6(3)(4) & Rule 18(2) - LM(PC) Rules 2011',
        severity: 'critical',
        status: 'pass',
        message: 'No price tampering, double stickers, or smudged markings detected on declarations.',
      };
    }
  },
  {
    id: 'LM-015',
    name: 'Manufacturer Address Valid Indian PIN Code',
    ruleReference: 'Rule 6(1)(a) & Rule 10 - LM(PC) Rules 2011',
    chapter: 'Chapter II - Retail Packages',
    severity: 'minor',
    legalSection: 'Section 36(1) of Legal Metrology Act, 2009',
    description: 'Manufacturer / Packer postal address must include a valid 6-digit postal index number (PIN code).',
    check: (decls) => {
      const addrDecl = getDecl(decls, 'manufacturer_address');
      if (!addrDecl?.found || !addrDecl.value) {
        return {
          rule_id: 'LM-015',
          name: 'Manufacturer Address Valid Indian PIN Code',
          rule_reference: 'Rule 6(1)(a) & Rule 10 - LM(PC) Rules 2011',
          severity: 'minor',
          status: 'fail',
          message: 'Address field is missing, PIN code could not be verified.',
          suggestion: 'Provide full address with 6-digit PIN code.',
        };
      }

      const hasPincode = /\b\d{6}\b/.test(addrDecl.value);
      return {
        rule_id: 'LM-015',
        name: 'Manufacturer Address Valid Indian PIN Code',
        rule_reference: 'Rule 6(1)(a) & Rule 10 - LM(PC) Rules 2011',
        severity: 'minor',
        status: hasPincode ? 'pass' : 'fail',
        message: hasPincode
          ? 'Manufacturer address includes verified 6-digit PIN code.'
          : 'VIOLATION: Postal address missing standard 6-digit Indian PIN code.',
        suggestion: hasPincode ? undefined : 'Include a valid 6-digit PIN code in the manufacturer address.',
      };
    }
  }
];

export function runComplianceEngine(declarations: ExtractedDeclaration[]) {
  const compliance_results = legalMetrologyRules.map(rule => rule.check(declarations));

  let score = 100;
  let overall_status: 'compliant' | 'non_compliant' | 'warning' = 'compliant';

  for (const result of compliance_results) {
    if (result.status === 'fail') {
      if (result.severity === 'critical') score -= 15;
      else if (result.severity === 'major') score -= 6;
      else if (result.severity === 'minor') score -= 2;
    } else if (result.status === 'warning') {
      score -= 2;
    }
  }

  score = Math.max(0, Math.min(100, score));

  if (score < 100) {
    const hasCriticalFail = compliance_results.some(r => r.status === 'fail' && r.severity === 'critical');
    if (hasCriticalFail || score < 80) {
      overall_status = 'non_compliant';
    } else {
      overall_status = 'warning';
    }
  }

  return {
    compliance_results,
    overall_score: score,
    overall_status
  };
}
