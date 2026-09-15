"use client";

import React, { createContext, useState, useContext, useEffect } from 'react';

export type LanguageCode = 'en' | 'hi' | 'mr';

export const translations: Record<LanguageCode, Record<string, string>> = {
  en: {
    app_title: 'Legal Metrology Compliance Platform',
    govt_title: 'Government of India • Ministry of Consumer Affairs',
    dashboard: 'Dashboard',
    new_scan: 'New Scan',
    products: 'Products',
    inspections: 'Inspections',
    reports: 'Reports',
    ecommerce_check: 'E-Commerce Audit',
    risk_analytics: 'Risk Analytics',
    consumer_portal: 'Consumer Portal',
    admin_terminal: 'Admin Terminal',
    total_inspections: 'Total Inspections',
    compliance_rate: 'Compliance Rate',
    active_violations: 'Active Violations',
    products_scanned: 'Products Cataloged',
    offline_mode: 'Offline Mode',
    network_online: 'Network Online',
    pending_sync: 'Pending Sync',
    sync_now: 'Sync Offline Data',
    sign_out: 'Sign Out',
    dual_mrp_alert: 'Rule 18(2) Dual Pricing Detected',
    scan_btn: 'Upload or Capture Packaging',
    review_declarations: 'Human-in-the-Loop Review',
    statutory_rules: '15 Statutory Legal Metrology Rules',
    lodge_complaint: 'Lodge Overcharging Complaint (Sec 36)'
  },
  hi: {
    app_title: 'विधिक मापविज्ञान अनुपालन मंच',
    govt_title: 'भारत सरकार • उपभोक्ता मामले मंत्रालय',
    dashboard: 'डैशबोर्ड',
    new_scan: 'नया स्कैन / निरीक्षण',
    products: 'उत्पाद सूची',
    inspections: 'निरीक्षण इतिहास',
    reports: 'प्रमाणपत्र एवं रिपोर्ट्स',
    ecommerce_check: 'ई-कॉमर्स जांच (दोहरा MRP)',
    risk_analytics: 'जोखिम विश्लेषण (धारा 36)',
    consumer_portal: 'उपभोक्ता मंच (जागो ग्राहक)',
    admin_terminal: 'व्यवस्थापक टर्मिनल (Admin)',
    total_inspections: 'कुल निरीक्षण',
    compliance_rate: 'अनुपालन दर',
    active_violations: 'सक्रिय उल्लंघन',
    products_scanned: 'सत्यापित उत्पाद',
    offline_mode: 'ऑफलाइन मोड',
    network_online: 'नेटवर्क ऑनलाइन',
    pending_sync: 'सिंक लंबित',
    sync_now: 'ऑफलाइन डेटा सिंक करें',
    sign_out: 'लॉग आउट',
    dual_mrp_alert: 'नियम 18(2) दोहरा एमआरपी उल्लंघन',
    scan_btn: 'पैकेजिंग फोटो कैप्चर या अपलोड करें',
    review_declarations: 'अधिकारी सत्यापन तालिका',
    statutory_rules: '15 विधिक मापविज्ञान नियम',
    lodge_complaint: 'अतिरिक्त वसूली की शिकायत दर्ज करें'
  },
  mr: {
    app_title: 'वैधानिक मापनशास्त्र अनुपालन मंच',
    govt_title: 'भारत सरकार • ग्राहक व्यवहार मंत्रालय',
    dashboard: 'डॅशबोर्ड',
    new_scan: 'नवीन तपासणी स्कॅन',
    products: 'उत्पादन भांडार',
    inspections: 'तपासणी नोंदी',
    reports: 'अहवाल व प्रमाणपत्रे',
    ecommerce_check: 'ई-कॉमर्स तपासणी (दुहेरी MRP)',
    risk_analytics: 'धोका विश्लेषण (कलम 36)',
    consumer_portal: 'ग्राहक संरक्षण मंच',
    admin_terminal: 'प्रशासक नियंत्रण (Admin)',
    total_inspections: 'एकूण तपासण्या',
    compliance_rate: 'अनुपालन दर',
    active_violations: 'उल्लंघन आढळले',
    products_scanned: 'नोंदणीकृत उत्पादने',
    offline_mode: 'ऑफलाइन मोड',
    network_online: 'नेटवर्क सुरू आहे',
    pending_sync: 'सिंक बाकी',
    sync_now: 'डेटा सिंक करा',
    sign_out: 'बाहेर पडा',
    dual_mrp_alert: 'नियम 18(2) दुहेरी एमआरपी उल्लंघन',
    scan_btn: 'पॅकेजिंग फोटो काढा किंवा अपलोड करा',
    review_declarations: 'अधिकारी पडताळणी तक्ता',
    statutory_rules: '15 वैधानिक नियम तपासणी',
    lodge_complaint: 'जास्त दराची तक्रार नोंदवा'
  }
};

interface LanguageContextType {
  lang: LanguageCode;
  changeLanguage: (code: LanguageCode) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  changeLanguage: () => {},
  t: (key: string) => key
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState<LanguageCode>('en');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('lmd_lang') as LanguageCode;
      if (stored && (stored === 'en' || stored === 'hi' || stored === 'mr')) {
        setLang(stored);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const changeLanguage = (newLang: LanguageCode) => {
    setLang(newLang);
    try {
      localStorage.setItem('lmd_lang', newLang);
    } catch (e) {
      console.error(e);
    }
  };

  const t = (key: string): string => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
