"""
eligibility_engine.py

Deterministic, rule-based matching between a FarmerProfile and every scheme
in eligibility_rules/*.json. This intentionally does NOT use the LLM —
eligibility for government schemes should be a traceable yes/no decision,
not a probabilistic guess.

Each scheme JSON file's "exclusions" list uses keys that map directly to
boolean fields on FarmerProfile (see EXCLUSION_FIELD_MAP below).
"""

import json
import glob
import os
from farmer_profile import FarmerProfile

RULES_DIR = os.path.join(os.path.dirname(__file__), "eligibility_rules")

# Maps each exclusion key used in the scheme JSON files to the matching
# FarmerProfile field. If a farmer has this field set to True, they are
# excluded from any scheme listing that exclusion key.
EXCLUSION_FIELD_MAP = {
    "institutional_land_holder": "is_institutional_land_holder",
    "family_member_constitutional_post_holder": "family_constitutional_post_holder",
    "family_member_current_or_former_minister": "family_minister_or_mp_mla",
    "family_member_current_or_former_mp_or_mla": "family_minister_or_mp_mla",
    "family_member_government_employee_above_group_d": "is_government_employee_above_group_d",
    "income_tax_payer_last_assessment_year": "is_income_tax_payer",
    "registered_professional_doctor_engineer_lawyer_ca": "is_registered_professional",
    "pensioner_with_monthly_pension_10000_or_more": "is_pensioner_high",
    "covered_by_other_statutory_pension_scheme": "covered_by_other_pension_scheme",
}


def load_scheme_rules():
    """Load every scheme's structured eligibility rules from eligibility_rules/*.json."""
    schemes = []
    for path in sorted(glob.glob(os.path.join(RULES_DIR, "*.json"))):
        with open(path, "r", encoding="utf-8") as f:
            schemes.append(json.load(f))
    return schemes


def check_scheme_eligibility(profile: FarmerProfile, scheme: dict):
    """
    Check one scheme's rules against a farmer profile.
    Returns (is_eligible: bool, reasons: list[str]) — reasons explain
    every condition that caused ineligibility, or a positive confirmation
    if eligible.
    """
    reasons = []
    elig = scheme.get("eligibility", {})

    # Farmer type check
    allowed_types = elig.get("farmer_type_allowed")
    if allowed_types and profile.farmer_type not in allowed_types:
        reasons.append(f"Farmer type '{profile.farmer_type}' is not in the allowed list: {allowed_types}")

    # Land holding cap
    max_land = elig.get("max_land_holding_hectares")
    if max_land is not None and profile.land_holding_hectares > max_land:
        reasons.append(f"Land holding {profile.land_holding_hectares} ha exceeds the {max_land} ha cap")

    min_land = elig.get("min_land_holding_hectares")
    if min_land is not None and profile.land_holding_hectares < min_land:
        reasons.append(f"Land holding {profile.land_holding_hectares} ha is below the minimum of {min_land} ha")

    # Must already hold a Kisan Credit Card
    if elig.get("must_have_kcc") and not profile.has_kcc:
        reasons.append("Requires an existing Kisan Credit Card")

    # Must have an irrigation water source
    if elig.get("requires_irrigation_source") and not profile.has_irrigation_source:
        reasons.append("Requires an existing irrigation water source (bore well, canal, or farm pond)")

    # Must be willing to adopt organic farming
    if elig.get("requires_organic_farming_interest") and not profile.willing_for_organic_farming:
        reasons.append("Requires willingness to adopt organic farming practices")

    # Age range
    min_age = elig.get("min_age")
    max_age = elig.get("max_age")
    if min_age is not None and profile.age < min_age:
        reasons.append(f"Age {profile.age} is below the minimum age of {min_age}")
    if max_age is not None and profile.age > max_age:
        reasons.append(f"Age {profile.age} is above the maximum age of {max_age}")

    # State residency
    required_state = elig.get("must_reside_in_state") or elig.get("must_be_registered_farmer_in_state")
    if required_state and profile.state != required_state:
        reasons.append(f"Scheme requires residency in {required_state}, profile has {profile.state}")

    # Cross-scheme dependency: must already be a PM-KISAN beneficiary
    if elig.get("must_be_pm_kisan_beneficiary") and not profile.enrolled_in_pm_kisan:
        reasons.append("Requires existing PM-KISAN enrollment")

    # Generic positive requirements — profile field must be True
    for field_key in elig.get("requires_true_fields", []):
        if not getattr(profile, field_key, False):
            reasons.append(f"Requires: {field_key.replace('_', ' ')}")

    # Exclusion checks
    for exclusion_key in scheme.get("exclusions", []):
        field_name = EXCLUSION_FIELD_MAP.get(exclusion_key)
        if field_name and getattr(profile, field_name, False):
            reasons.append(f"Excluded due to: {exclusion_key.replace('_', ' ')}")

    is_eligible = len(reasons) == 0
    if is_eligible:
        reasons = ["Meets all checked eligibility conditions"]

    return is_eligible, reasons


def match_all_schemes(profile: FarmerProfile):
    """
    Run a farmer profile against every known scheme.
    Returns a list of dicts: scheme name, eligibility, reasons, benefit summary.
    """
    results = []
    for scheme in load_scheme_rules():
        is_eligible, reasons = check_scheme_eligibility(profile, scheme)
        results.append({
            "scheme_id": scheme["scheme_id"],
            "name": scheme["name"],
            "level": scheme.get("level"),
            "eligible": is_eligible,
            "reasons": reasons,
            "benefit_summary": scheme.get("benefit_summary"),
            "required_documents": scheme.get("required_documents", []),
            "source_file": scheme.get("source_file"),
        })
    return results
