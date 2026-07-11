"""
farmer_profile.py

Defines the shape of a farmer's profile — the data collected from the
intake form and used to match against scheme eligibility rules.
"""

from pydantic import BaseModel, Field
from typing import Optional


class FarmerProfile(BaseModel):
    # Land record (from 7/12 utara)
    land_holding_hectares: float = Field(..., description="Total land holding in hectares")
    farmer_type: str = Field(..., description="owner_farmer | tenant_farmer | oral_lessee | sharecropper")

    # Personal details
    age: int
    state: str = "Maharashtra"
    district: Optional[str] = None
    caste_category: Optional[str] = Field(None, description="General | OBC | SC | ST")
    ration_card_category: Optional[str] = Field(None, description="APL | BPL | AAY | Priority")

    # Exclusion-relevant flags (used against scheme exclusion lists)
    is_income_tax_payer: bool = False
    is_government_employee_above_group_d: bool = False
    is_pensioner_high: bool = Field(False, description="Monthly pension >= 10,000")
    is_registered_professional: bool = Field(False, description="Doctor, engineer, lawyer, or CA")
    family_constitutional_post_holder: bool = False
    family_minister_or_mp_mla: bool = False
    is_institutional_land_holder: bool = False

    # Cross-scheme dependencies
    enrolled_in_pm_kisan: bool = False
    enrolled_in_pmfby: bool = False
    has_kcc: bool = False

    # New fields for expanded scheme coverage
    has_overdue_crop_loan_before_cutoff: bool = Field(False, description="Had an overdue short-term crop loan as of the scheme's cutoff date")
    covered_by_other_pension_scheme: bool = Field(False, description="Already covered by EPFO, ESIC, NPS, or similar")
    has_irrigation_source: bool = False
    willing_for_organic_farming: bool = False
