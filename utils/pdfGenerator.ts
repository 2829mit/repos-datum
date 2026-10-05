import { 
  TANK_OPTIONS, 
  RFD_Z_BASE_OPTIONS, 
  RFD_Z_DISPENSING_UNITS, 
  RFD_Z_UPGRADE_OPTIONS,
  TERMS_AND_CONDITIONS,
  BANK_ACCOUNT_DETAILS,
  REPOS_COMPANY_FOOTER
} from '../constants';
import { QuoteData, CustomerDetails } from '../types';

// Declare jsPDF on window since we are using CDN
declare global {
  interface Window {
    jspdf: any;
  }
}

let cachedRobotoRegularB64: string | null = null;
let cachedRobotoMediumB64: string | null = null;

const fetchFontAsBase64 = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const buffer = await response.arrayBuffer();
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  } catch (e) {
    return null;
  }
};

const loadRobotoFont = async (doc: any): Promise<boolean> => {
  try {
    if (!cachedRobotoRegularB64) {
      cachedRobotoRegularB64 = await fetchFontAsBase64("https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Regular.ttf");
    }
    if (!cachedRobotoMediumB64) {
      cachedRobotoMediumB64 = await fetchFontAsBase64("https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Medium.ttf");
    }

    if (cachedRobotoRegularB64) {
      doc.addFileToVFS('Roboto-Regular.ttf', cachedRobotoRegularB64);
      doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');

      if (cachedRobotoMediumB64) {
        doc.addFileToVFS('Roboto-Medium.ttf', cachedRobotoMediumB64);
        doc.addFont('Roboto-Medium.ttf', 'Roboto', 'bold');
      } else {
        doc.addFont('Roboto-Regular.ttf', 'Roboto', 'bold');
      }
      return true;
    }
  } catch (e) {
    console.warn("Could not load custom font, using standard font", e);
  }
  return false;
};

export const getBase64ImageFromURL = (url: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.setAttribute("crossOrigin", "anonymous");
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL("image/png");
        resolve(dataURL);
      } catch (err) {
        console.warn("Canvas conversion error", err);
        resolve("");
      }
    };
    img.onerror = (error) => {
      console.warn("Failed to load logo for PDF", error);
      resolve("");
    };
    img.src = url;
  });
};

export const formatIndianCurrency = (num: number): string => {
  if (num === undefined || num === null || isNaN(num)) return "0";
  
  const val = Math.round(num);
  const s = val.toString();
  
  const lastThree = s.substring(s.length - 3);
  const otherNumbers = s.substring(0, s.length - 3);
  
  let res = lastThree;
  if (otherNumbers !== '') {
    res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
  }
  
  return res;
};

export interface QuoteItem {
  id: string;
  name: string;
  featureText: string;
  price: number;
  formattedPrice: string;
  isAddon: boolean;
}

export interface QuoteSelectedOptions {
  isRfdZ: boolean;
  baseName: string;
  baseFeatureText: string;
  basePrice: number;
  formattedBasePrice: string;
  capacityText: string;
  modifications: QuoteItem[];
  addons: QuoteItem[];
  subtotal: number;
  formattedSubtotal: string;
  operationsRowCount: number;
}

export const extractSelectedOptions = (data?: QuoteData): QuoteSelectedOptions => {
  const isRfdZ = !data?.selectedProduct || data.selectedProduct === 'rfd-z';

  let baseName = 'Base Model';
  let baseFeatureText = 'Base Model:\n3-in-1 DATUM Technology for organized fuel\nstorage, dispensing and authorization with:';
  let basePrice = 399999;
  let capacityText = 'Capacity: 2,000L';

  const modifications: QuoteItem[] = [];
  const addons: QuoteItem[] = [];

  if (isRfdZ) {
    const baseId = data?.rfdZConfiguration?.base;
    const baseOpt = RFD_Z_BASE_OPTIONS.find(b => b.id === baseId);
    if (baseOpt) {
      baseName = baseOpt.name;
      basePrice = baseOpt.totalAmount || Math.round(baseOpt.price * 36);
      capacityText = baseOpt.id === 'datum-1kl' ? 'Capacity: 1,000L' : 'Capacity: 2,000L';
    } else if (baseId === 'datum-1kl') {
      baseName = 'DATUM Z 1KL';
      basePrice = 349999;
      capacityText = 'Capacity: 1,000L';
    }

    const selectedUpgradeIds = new Set<string>(data?.rfdZConfiguration?.upgrades || []);

    // Check modification features in exact sequence
    if (selectedUpgradeIds.has('fuel-monitoring')) {
      modifications.push({
        id: 'fuel-monitoring',
        name: 'Fuel Monitoring System',
        featureText: '• Fuel Monitoring System: for live fuel tracking via\nsensors to track how much is available',
        price: 50000,
        formattedPrice: formatIndianCurrency(50000),
        isAddon: false,
      });
    }

    if (selectedUpgradeIds.has('safety-security')) {
      modifications.push({
        id: 'safety-security',
        name: 'Safety & Security System',
        featureText: '• Safety & Security System: for ensuring fire safety\nand security through cameras',
        price: 35000,
        formattedPrice: formatIndianCurrency(35000),
        isAddon: false,
      });
    }

    if (selectedUpgradeIds.has('secure-fueling')) {
      modifications.push({
        id: 'secure-fueling',
        name: 'Secure Fuelling System',
        featureText: '• Secure Fuelling System: RFID based checks to\ndetect theft',
        price: 50000,
        formattedPrice: formatIndianCurrency(50000),
        isAddon: false,
      });
    }

    // Check add-ons in exact sequence
    if (selectedUpgradeIds.has('lm-stamping') || selectedUpgradeIds.has('legal-metrology')) {
      addons.push({
        id: 'lm-stamping',
        name: 'Legal Metrology',
        featureText: '• Legal Metrology: calibrated & stamped dispensers',
        price: 25000,
        formattedPrice: formatIndianCurrency(25000),
        isAddon: true,
      });
    }

    if (selectedUpgradeIds.has('transportation')) {
      addons.push({
        id: 'transportation',
        name: 'Forwarding & Transportation',
        featureText: '• Forwarding & Transportation',
        price: 20000,
        formattedPrice: formatIndianCurrency(20000),
        isAddon: true,
      });
    }

    if (selectedUpgradeIds.has('packing-forwarding') || selectedUpgradeIds.has('installation-stamping')) {
      addons.push({
        id: 'packing-forwarding',
        name: 'Commissioning',
        featureText: '• Commissioning',
        price: 20000,
        formattedPrice: formatIndianCurrency(20000),
        isAddon: true,
      });
    }
  } else {
    // Portable / Standard Datum Tank
    const tankId = data?.configuration?.tank || '22kl';
    const tank = TANK_OPTIONS.find(t => t.id === tankId);
    basePrice = tank ? tank.price : 1599999;
    capacityText = tankId === '30kl' ? 'Capacity: 30,000L' : 'Capacity: 22,000L';
    baseName = tank?.name || 'Base Tank';
    baseFeatureText = `Base Model: ${tank?.name || 'DATUM Tank'} with organized fuel storage, dispensing and authorization:`;

    // Dispensing units
    data?.configuration?.dispensingUnits?.forEach(du => {
      modifications.push({
        id: du.id,
        name: du.name,
        featureText: `• ${du.name} (${du.subtext})`,
        price: du.price * 36,
        formattedPrice: formatIndianCurrency(du.price * 36),
        isAddon: false,
      });
    });

    // Accessories
    const acc = data?.configuration?.accessories;
    acc?.reposOs?.forEach(opt => {
      modifications.push({
        id: opt.id,
        name: opt.name,
        featureText: `• ${opt.name}`,
        price: opt.price * 36,
        formattedPrice: formatIndianCurrency(opt.price * 36),
        isAddon: false,
      });
    });
    acc?.mechanical?.forEach(opt => {
      modifications.push({
        id: opt.id,
        name: opt.name,
        featureText: `• ${opt.name}`,
        price: opt.price * 36,
        formattedPrice: formatIndianCurrency(opt.price * 36),
        isAddon: false,
      });
    });
    acc?.safetyUnits?.forEach(opt => {
      addons.push({
        id: opt.id,
        name: opt.name,
        featureText: `• ${opt.name}`,
        price: opt.price * 36,
        formattedPrice: formatIndianCurrency(opt.price * 36),
        isAddon: true,
      });
    });
    acc?.safetyUpgrades?.forEach(opt => {
      addons.push({
        id: opt.id,
        name: opt.name,
        featureText: `• ${opt.name}`,
        price: opt.price * 36,
        formattedPrice: formatIndianCurrency(opt.price * 36),
        isAddon: true,
      });
    });
  }

  // Calculate Subtotal strictly as sum of Base Price + selected modifications + selected add-ons
  const modsSum = modifications.reduce((sum, item) => sum + item.price, 0);
  const addonsSum = addons.reduce((sum, item) => sum + item.price, 0);
  const subtotal = basePrice + modsSum + addonsSum;

  const operationsRowCount = 1 + modifications.length + (addons.length > 0 ? 1 + addons.length : 0);

  return {
    isRfdZ,
    baseName,
    baseFeatureText,
    basePrice,
    formattedBasePrice: formatIndianCurrency(basePrice),
    capacityText,
    modifications,
    addons,
    subtotal,
    formattedSubtotal: formatIndianCurrency(subtotal),
    operationsRowCount,
  };
};

const drawPageFooter = (doc: any, fontFamily: string) => {
  const footerY = 276;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.35);
  doc.line(14, footerY, 196, footerY);

  doc.setFont(fontFamily, "bold");
  doc.setFontSize(7.2);
  doc.setTextColor(30, 30, 30);
  doc.text(REPOS_COMPANY_FOOTER.name, 105, footerY + 3.8, { align: "center" });

  doc.setFont(fontFamily, "normal");
  doc.setFontSize(6.4);
  doc.setTextColor(80, 80, 80);
  doc.text(REPOS_COMPANY_FOOTER.address, 105, footerY + 7.2, { align: "center" });
  doc.text(REPOS_COMPANY_FOOTER.cinGst, 105, footerY + 10.4, { align: "center" });

  doc.setTextColor(37, 99, 235);
  doc.text(`${REPOS_COMPANY_FOOTER.website} | ${REPOS_COMPANY_FOOTER.email} | ${REPOS_COMPANY_FOOTER.phone}`, 105, footerY + 13.6, { align: "center" });
};

export const generateQuotePDF = async (data: QuoteData) => {
  if (!window.jspdf) {
    alert("PDF library not loaded yet. Please check your connection.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const hasRoboto = await loadRobotoFont(doc);
  const fontFamily = hasRoboto ? 'Roboto' : 'helvetica';
  const currSym = hasRoboto ? '₹' : 'INR ';

  const logoUrl = "https://i.postimg.cc/52fvQyLD/Repos-New-Logo-V1-1.png";
  let logoBase64 = "";
  try {
    logoBase64 = await getBase64ImageFromURL(logoUrl);
  } catch (e) {
    console.warn("Could not load Repos logo", e);
  }

  const d = data?.customerDetails;
  const customerName = d?.name?.trim() ? d.name : '{Name}';
  const location = d?.state?.trim() ? d.state : '{State}';
  const application = d?.industry?.trim() ? d.industry : '{Industry}';
  const fleetSize = d?.fleetSize?.toString().trim() ? d.fleetSize.toString() : '{Fleet Size}';
  const monthlyConsumption = d?.consumption?.trim() ? d.consumption : '{Monthly Consumption}';
  const numberOfSite = (d?.numberOfSites || d?.numberOfSite)?.toString().trim() 
    ? (d.numberOfSites || d.numberOfSite)!.toString() 
    : '{Number of sites}';

  const {
    baseFeatureText,
    formattedBasePrice,
    capacityText,
    modifications,
    addons,
    formattedSubtotal,
    operationsRowCount,
  } = extractSelectedOptions(data);

  // ==========================================
  // PAGE 1: COMMERCIAL PROPOSAL
  // ==========================================

  // 1. Centered Repos Logo at Top
  if (logoBase64) {
    doc.addImage(logoBase64, 'PNG', 81, 10, 48, 14);
  } else {
    doc.setFont(fontFamily, "bold");
    doc.setFontSize(16);
    doc.setTextColor(20, 20, 20);
    doc.text("REPOS", 105, 18, { align: "center" });
  }

  // 2. Proposal Title
  doc.setFont(fontFamily, "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 15, 15);
  doc.text("Commercial Proposal for Total Fuel Management (TFM):", 14, 29);

  // 3. Table 1: Particulars & Details
  const table1Body = [
    ['Customer Name', customerName],
    ['Location', location],
    ['Application', application],
    ['Fleet Size', fleetSize],
    ['Monthly Consumption', monthlyConsumption],
    ['Number of Site', numberOfSite],
  ];

  (doc as any).autoTable({
    startY: 33,
    head: [['Particulars', 'Details']],
    body: table1Body,
    theme: 'grid',
    tableWidth: 182,
    margin: { left: 14, right: 14 },
    styles: {
      fontSize: 8.2,
      cellPadding: { top: 1.8, bottom: 1.8, left: 3, right: 3 },
      textColor: [20, 20, 20],
      lineColor: [170, 170, 170],
      lineWidth: 0.2,
      valign: 'middle',
      font: fontFamily,
    },
    headStyles: {
      fillColor: [225, 225, 225],
      textColor: [10, 10, 10],
      fontStyle: 'bold',
      fontSize: 8.5,
      lineColor: [170, 170, 170],
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 78, fontStyle: 'bold' },
      1: { cellWidth: 104 },
    },
  });

  const table1FinalY = (doc as any).lastAutoTable.finalY;

  // 4. Table 2: Stage | Feature | Pricing (Aligned with Selected Options)
  const table2Head = [['Stage', 'Feature', 'Pricing']];
  const table2Body: any[] = [
    // Procurement (split into two rows)
    [
      { content: 'Procurement', rowSpan: 2, styles: { valign: 'middle', halign: 'center', fontStyle: 'bold', fillColor: [255, 255, 255] } },
      { content: 'Doorstep Diesel Delivery with assured:\n\n• Fuel quality\n• Fuel quantity\n• Fuel delivery', rowSpan: 2, styles: { valign: 'middle' } },
      { content: 'No extra fuel delivery\ncharges', styles: { valign: 'middle', halign: 'right', fontStyle: 'bold' } },
    ],
    [
      { content: 'Diesel at retail price', styles: { valign: 'middle', halign: 'right', fontStyle: 'bold' } },
    ],
    // Operations Base Model
    [
      { content: 'Operations', rowSpan: operationsRowCount, styles: { valign: 'middle', halign: 'center', fontStyle: 'bold', fillColor: [255, 255, 255] } },
      { content: baseFeatureText },
      { content: `${currSym}${formattedBasePrice}`, styles: { halign: 'right', fontStyle: 'bold' } },
    ],
  ];

  // Append selected modifications
  for (const mod of modifications) {
    table2Body.push([
      { content: mod.featureText },
      { content: `${currSym}${mod.formattedPrice}`, styles: { halign: 'right' } },
    ]);
  }

  // Append add-ons (if any selected)
  if (addons.length > 0) {
    table2Body.push([
      { content: 'Add-ons:', styles: { fontStyle: 'bold', fillColor: [248, 248, 248] } },
      { content: 'Add-ons:', styles: { fontStyle: 'bold', fillColor: [248, 248, 248] } },
    ]);
    for (const addon of addons) {
      table2Body.push([
        { content: addon.featureText },
        { content: `${currSym}${addon.formattedPrice}`, styles: { halign: 'right' } },
      ]);
    }
  }

  (doc as any).autoTable({
    startY: table1FinalY + 4,
    head: table2Head,
    body: table2Body,
    theme: 'grid',
    tableWidth: 182,
    margin: { left: 14, right: 14 },
    styles: {
      fontSize: 7.6,
      cellPadding: { top: 1.8, bottom: 1.8, left: 2.5, right: 2.5 },
      textColor: [20, 20, 20],
      lineColor: [170, 170, 170],
      lineWidth: 0.2,
      font: fontFamily,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [225, 225, 225],
      textColor: [10, 10, 10],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'center',
      lineColor: [170, 170, 170],
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 26 },
      1: { cellWidth: 106 },
      2: { cellWidth: 50 },
    },
  });

  const table2FinalY = (doc as any).lastAutoTable.finalY;

  // 5. Pricing Model Selected & Options
  let bottomY = table2FinalY + 5;

  doc.setFont(fontFamily, "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 15, 15);
  doc.text(`Pricing Model Selected: ${currSym}${formattedSubtotal} + Taxes`, 14, bottomY);

  bottomY += 4.5;
  doc.setFont(fontFamily, "bold");
  doc.setFontSize(9);
  doc.text(capacityText, 14, bottomY);

  bottomY += 5;
  doc.setFont(fontFamily, "bold");
  doc.setFontSize(8.5);
  doc.text("Options to avail DATUM:", 14, bottomY);
  bottomY += 4;
  doc.setFont(fontFamily, "normal");
  doc.setFontSize(8.2);
  doc.text(`1. Outright Purchase - starting at ${currSym}3,49,999*`, 14, bottomY);
  bottomY += 3.8;
  doc.text(`2. Monthly Lease - starting at ${currSym}14,999*`, 14, bottomY);

  bottomY += 5;
  doc.setFont(fontFamily, "normal");
  doc.setFontSize(7.8);
  doc.setTextColor(35, 35, 35);
  doc.text("We duly acknowledge the above-mentioned model selection, and commit to provide the terms as agreed.", 14, bottomY);

  bottomY += 4.8;
  doc.setFontSize(8.2);
  doc.setTextColor(20, 20, 20);
  doc.text("Regards,", 14, bottomY);
  bottomY += 4;
  doc.setFont(fontFamily, "bold");
  doc.setFontSize(8.8);
  doc.text("Team Repos", 14, bottomY);

  // Page 1 Footer
  drawPageFooter(doc, fontFamily);

  // ==========================================
  // PAGE 2+: TERMS AND CONDITIONS & BANK DETAILS
  // ==========================================
  doc.addPage();
  let tcY = 16;

  // Header on Terms page
  doc.setFont(fontFamily, "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 15, 15);
  doc.text("Terms and Conditions : Please read", 14, tcY);
  tcY += 6;

  doc.setFontSize(7.2);
  doc.setTextColor(35, 35, 35);

  for (const term of TERMS_AND_CONDITIONS) {
    const headerText = `${term.prefix} ${term.title}`;
    const bodyLines = doc.splitTextToSize(term.content, 182);
    const blockHeight = bodyLines.length * 3.0 + 4.2;

    if (tcY + blockHeight > 268) {
      drawPageFooter(doc, fontFamily);
      doc.addPage();
      tcY = 16;
    }

    doc.setFont(fontFamily, "bold");
    doc.text(headerText, 14, tcY);

    doc.setFont(fontFamily, "normal");
    doc.text(bodyLines, 14, tcY + 3.1);

    tcY += bodyLines.length * 3.0 + 4.2;
  }

  // Check space for Bank Account Details box (~40mm height)
  if (tcY + 44 > 268) {
    drawPageFooter(doc, fontFamily);
    doc.addPage();
    tcY = 16;
  } else {
    tcY += 3;
  }

  // Render Bank Account Details card
  const boxWidth = 182;
  const boxHeight = 36;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, tcY, boxWidth, boxHeight, 1.5, 1.5, 'FD');

  doc.setFont(fontFamily, "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Account Details:", 18, tcY + 6);

  doc.setFontSize(8.2);
  const leftX = 18;
  const valX = 72;
  let accY = tcY + 12;

  const accRows = [
    ["Account Number:", BANK_ACCOUNT_DETAILS.accountNumber],
    ["Name of the Beneficiary:", BANK_ACCOUNT_DETAILS.beneficiaryName],
    ["Bank Name:", BANK_ACCOUNT_DETAILS.bankName],
    ["Branch:", BANK_ACCOUNT_DETAILS.branch],
    ["IFSC Code:", BANK_ACCOUNT_DETAILS.ifscCode],
  ];

  for (const [lbl, val] of accRows) {
    doc.setFont(fontFamily, "bold");
    doc.setTextColor(51, 65, 85);
    doc.text(lbl, leftX, accY);

    doc.setFont(fontFamily, "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(val, valX, accY);

    accY += 4.5;
  }

  // Footer on final page
  drawPageFooter(doc, fontFamily);

  // Clean filename
  const cleanName = customerName === '{Name}' ? 'Quotation' : customerName.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Repos_TFM_Quotation_${cleanName}.pdf`);
};
