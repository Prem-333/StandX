"""Frontend and OpenAPI contracts; evidence extensions remain visible."""
from datetime import datetime
from typing import Any, Literal
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, field_validator


class Extensible(BaseModel):
    model_config=ConfigDict(extra='allow')


class CertificationContext(BaseModel):
    model_config=ConfigDict(extra='forbid')
    domestic_supply:bool|None=None
    exemption_claimed:bool|None=None
    district_in_current_annexure:bool|None=None


class RecommendRequest(BaseModel):
    model_config=ConfigDict(extra='forbid')
    text:str=Field(min_length=1,max_length=100000)
    top_k:int=Field(default=5,ge=1,le=10)
    tender:bool=False
    language_hint:Literal['en','hi','hi-Latn','bn','mr','te','ta','gu','kn','ml','pa','ur']|None=None
    product_category:str|None=Field(default=None,pattern=r'^[a-z0-9_-]{1,80}$')
    certification_context:CertificationContext=Field(default_factory=CertificationContext)

    @field_validator('text')
    @classmethod
    def valid_text(cls,value):
        if not value.strip() or '\x00' in value or any(0xD800<=ord(c)<=0xDFFF for c in value):
            raise ValueError('Text must contain readable content without NUL or invalid Unicode characters')
        return value


class Evidence(Extensible):
    record_id:str
    is_number:str
    source:str
    source_url:str|None=None
    fetched_at:str|None=None


class VersionInfo(Extensible):
    is_number:str
    record_id:str
    status:str
    is_latest_revision:bool|None
    final_current_standard:str|None
    unresolved_amendments:int|None


class CertificationRequirement(Extensible):
    id:str
    product_category:str
    scheme:str
    requirement:Literal['mandatory','voluntary','not_applicable','unknown']
    as_verified_on:str
    stale:bool
    applies_to_supplied_context:bool|None
    trigger:dict[str,Any]
    evidence:list[dict[str,Any]]


class Warning(Extensible):
    severity:Literal['hard','review']
    code:str
    message:str


class AlliedStandard(Extensible):
    record_id:str
    is_number:str
    title:str
    source:str
    score:float
    relationship_type:str
    evidence:list[Evidence]


class PrimaryStandard(Extensible):
    record_id:str
    is_number:str
    title:str
    source:str
    score:float=Field(ge=0,le=1)
    confidence_score:float=Field(ge=0,le=1)
    status:str
    version_status:VersionInfo
    evidence:list[Evidence]
    allied_standards:dict[str,list[AlliedStandard]]
    certification_requirements:list[CertificationRequirement]
    warnings:list[Warning]


class RecommendResponse(Extensible):
    recommendation_id:UUID
    timestamp:datetime
    query_text:str
    status:str
    message:str
    primary_standards:list[PrimaryStandard]
    allied_standards:dict[str,list[AlliedStandard]]
    certification_requirements:list[CertificationRequirement]
    warnings:list[Warning]
    normalization:dict[str,Any]


class StandardResponse(Extensible):
    record:dict[str,Any]
    version_status:VersionInfo
    certification_requirements:list[CertificationRequirement]
    warnings:list[Warning]
    evidence:list[Evidence]


class AlliedResponse(BaseModel):
    is_number:str
    allied_standards:dict[str,list[AlliedStandard]]
    evidence:list[Evidence]


class CertificationResponse(Extensible):
    product_category:str
    status:str
    certification_requirements:list[CertificationRequirement]
    rules_fingerprint:str
    coverage:str


class FeedbackRequest(BaseModel):
    model_config=ConfigDict(extra='forbid')
    recommendation_id:UUID
    decision:Literal['confirm','correct','reject']
    record_id:str|None=Field(default=None,max_length=120)
    comment:str=Field(default='',max_length=2000)


class FeedbackResponse(BaseModel):
    feedback_id:UUID
    recommendation_id:UUID
    stored:bool


class HealthResponse(BaseModel):
    status:Literal['ok','degraded']
    services:dict[str,str]
    translation:dict[str,Any]


class DirectoryResponse(BaseModel):
    total:int
    limit:int
    offset:int
    items:list[StandardResponse]


class HistoryItem(BaseModel):
    recommendation_id:UUID
    timestamp:datetime
    query_text:str
    status:str
    candidate_count:int


class HistoryResponse(BaseModel):
    total:int
    limit:int
    offset:int
    items:list[HistoryItem]


class SystemResponse(BaseModel):
    kb_fingerprint:str
    visible_records:int
    verified_records:int
    synthetic_records:int
    include_synthetic:bool
    confidence_threshold:float
    graph_backend:str
    models:dict[str,str]
    ranking_adjustments:str
    notice:str
