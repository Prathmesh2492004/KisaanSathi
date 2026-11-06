// Mirrors Backend/farmer_profile.py. Keep the keys in sync with FarmerProfile.

export const DEFAULT_PROFILE = {
  land_unit: "acres", // form-only: farmers usually think in acres; converted before sending
  land_holding_hectares: "",
  farmer_type: "owner_farmer",
  age: "",
  state: "Maharashtra",
  district: "",
  caste_category: "",
  ration_card_category: "",

  is_income_tax_payer: false,
  is_government_employee_above_group_d: false,
  is_pensioner_high: false,
  is_registered_professional: false,
  family_constitutional_post_holder: false,
  family_minister_or_mp_mla: false,
  is_institutional_land_holder: false,

  enrolled_in_pm_kisan: false,
  enrolled_in_pmfby: false,
  has_kcc: false,

  has_overdue_crop_loan_before_cutoff: false,
  covered_by_other_pension_scheme: false,
  has_irrigation_source: false,
  willing_for_organic_farming: false,
};

export const ACRES_PER_HECTARE = 2.47105;

export const FARMER_TYPES = [
  { value: "owner_farmer", label: "I own the land", hint: "Land is in my or my family's name on the 7/12" },
  { value: "tenant_farmer", label: "Tenant farmer", hint: "I farm someone else's land on a written lease" },
  { value: "oral_lessee", label: "Oral lessee", hint: "I farm someone else's land on a verbal agreement" },
  { value: "sharecropper", label: "Sharecropper (batai)", hint: "I share the harvest with the land owner" },
];

export const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
  "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

export const CASTE_CATEGORIES = ["General", "OBC", "SC", "ST"];
export const RATION_CARDS = ["APL", "BPL", "AAY", "Priority"];

export const FARM_QUESTIONS = [
  { key: "has_irrigation_source", label: "Do you have a water source for irrigation?", hint: "Bore well, well, canal, or farm pond" },
  { key: "willing_for_organic_farming", label: "Are you willing to try organic farming?", hint: "Using natural inputs instead of chemical fertilisers" },
  { key: "has_overdue_crop_loan_before_cutoff", label: "Do you have an unpaid (overdue) crop loan?", hint: "A short-term crop loan that was overdue as of the loan waiver cutoff date" },
];

export const ENROLMENT_QUESTIONS = [
  { key: "enrolled_in_pm_kisan", label: "Do you already get PM-KISAN money?", hint: "₹2,000 installments credited to your bank account" },
  { key: "enrolled_in_pmfby", label: "Is your crop insured under PMFBY?", hint: "Pradhan Mantri Fasal Bima Yojana" },
  { key: "has_kcc", label: "Do you have a Kisan Credit Card (KCC)?", hint: "Crop loan card from your bank" },
  { key: "covered_by_other_pension_scheme", label: "Are you already in a pension scheme?", hint: "EPFO, ESIC, NPS or similar" },
];

export const EXCLUSION_QUESTIONS = [
  { key: "is_income_tax_payer", label: "Paid income tax last year", hint: "You or a family member filed and paid income tax" },
  { key: "is_government_employee_above_group_d", label: "Government job (above Group D)", hint: "Serving or retired officer, not peon/Group D staff" },
  { key: "is_pensioner_high", label: "Pension of ₹10,000 or more per month", hint: "Any family member" },
  { key: "is_registered_professional", label: "Registered professional", hint: "Doctor, engineer, lawyer, or chartered accountant" },
  { key: "family_constitutional_post_holder", label: "Holds a constitutional post", hint: "Now or in the past" },
  { key: "family_minister_or_mp_mla", label: "Minister, MP, or MLA", hint: "Now or in the past" },
  { key: "is_institutional_land_holder", label: "Land belongs to an institution", hint: "Trust, company, or organisation rather than a family" },
];

/** Converts form state into the JSON body FarmerProfile expects. */
export function toApiProfile(profile) {
  const { land_unit, ...rest } = profile;
  const land = parseFloat(rest.land_holding_hectares);
  const hectares = land_unit === "acres" ? land / ACRES_PER_HECTARE : land;
  return {
    ...rest,
    land_holding_hectares: Math.round(hectares * 1000) / 1000,
    age: parseInt(rest.age, 10),
    district: rest.district.trim() || null,
    caste_category: rest.caste_category || null,
    ration_card_category: rest.ration_card_category || null,
  };
}
