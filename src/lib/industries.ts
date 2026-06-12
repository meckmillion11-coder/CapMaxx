export const industryMap: Record<string, string[]> = {
  Manufacturing: ["CNC Machining", "Powder Coating", "Fabrication", "Injection Molding", "Assembly", "Welding", "Stamping", "Casting", "Forging", "Heat Treatment"],
  Logistics: ["Transportation", "Warehousing", "Distribution", "Fulfillment", "Last-Mile Delivery", "Cold Chain", "Cross-Docking"],
  "Food & Beverage": ["Bakery", "Dairy", "Poultry", "Meat Processing", "Frozen Food", "Co-Packing", "Beverage", "Snack Foods", "Seafood", "Organic & Natural"],
  Freight: ["Flatbed", "Dry Van", "Refrigerated", "LTL", "Full Truckload", "Intermodal", "Oversized / Heavy Haul"],
  Construction: ["General Contractor", "Concrete", "Steel & Structural", "Electrical", "Plumbing", "HVAC", "Roofing", "Excavation"],
  Agriculture: ["Crop Production", "Livestock", "Grain Storage", "Equipment", "Processing", "Organic Farming"],
  Healthcare: ["Medical Devices", "Life Sciences", "Clinical Services", "Pharma", "Diagnostics", "Home Health"],
  Electronics: ["PCB Assembly", "Contract Manufacturing", "Testing & Inspection", "Cable Harness", "Box Build", "Firmware"],
  Packaging: ["Corrugated", "Flexible Packaging", "Custom Design", "Labeling", "Shrink Wrap", "Retail Packaging"],
  Plastics: ["Injection Molding", "Extrusion", "Blow Molding", "Thermoforming", "Rotomolding"],
  Apparel: ["Cut and Sew", "Embroidery", "Screen Printing", "Private Label", "Technical Wear", "Uniform Manufacturing"],
  Technology: ["Software Development", "IT Services", "Hardware", "Data & Analytics", "Cybersecurity", "Cloud Services"],
  Mining: ["Equipment & Parts", "Services", "Environmental", "Reclamation", "Exploration"],
  Energy: ["Oil & Gas", "Renewables", "Utilities", "Equipment & Services"],
  Automotive: ["OEM Parts", "Aftermarket", "Assembly", "Testing", "Coatings"],
};

export const industries = ["All Industries", ...Object.keys(industryMap)];

export const commonCertifications = [
  // Quality
  "ISO 9001", "ISO 9001:2015", "AS9100", "AS9100D", "IATF 16949", "ISO 13485",
  // Food Safety
  "SQF Level 1", "SQF Level 2", "SQF Level 3", "FSSC 22000", "BRC", "HACCP", "FDA Registered", "USDA",
  // Environmental
  "ISO 14001", "ISO 50001", "FSC",
  // Safety & Labor
  "OSHA 10", "OSHA 30", "ISNetworld", "Avetta",
  // Freight & Transport
  "FMCSA", "DOT", "TWIC",
  // Electronics
  "IPC-A-610", "IPC-A-620", "UL Listed", "CE Marking", "RoHS",
  // Welding & Fabrication
  "AWS D1.1", "AWS D1.2", "ASME",
  // Other
  "WOSB", "MBE", "SDVOSB", "VOSB", "HUBZone", "Women-Owned", "Minority-Owned", "Small Business",
];

export const opportunityTypes = [
  "Overflow Production",
  "Contract Manufacturing",
  "Private Label",
  "Warehousing",
  "Logistics",
  "Distribution Partners",
  "Strategic Partnerships",
  "New Customers",
  "New Suppliers",
  "Joint Ventures",
];
