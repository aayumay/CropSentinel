"""
Backfill optional farm metadata for rows created before crop/soil fields existed.
"""
from datetime import timedelta

from sqlalchemy.orm import Session

from app.db.models import Farm

CROP_KEYWORDS = {
    "wheat": "Wheat",
    "rice": "Rice",
    "cotton": "Cotton",
    "sugarcane": "Sugarcane",
    "corn": "Corn",
    "maize": "Corn",
    "soybean": "Soybean",
}

SOIL_KEYWORDS = {
    "sandy": "Sandy",
    "clay": "Clay",
    "loamy": "Loamy",
    "silty": "Silty",
    "peaty": "Peaty",
}


def _infer_crop(farm_name: str) -> str:
    name = farm_name.lower()
    for keyword, crop in CROP_KEYWORDS.items():
        if keyword in name:
            return crop
    return "Wheat"


def _infer_soil(farm_name: str) -> str:
    name = farm_name.lower()
    for keyword, soil in SOIL_KEYWORDS.items():
        if keyword in name:
            return soil
    return "Loamy"


def _estimate_sowing_date(created_at) -> str:
    sowing = created_at - timedelta(days=75)
    return sowing.date().isoformat()


def _estimate_area(farm_id: int) -> float:
    return round(3.0 + (farm_id * 1.7) % 10, 1)


def backfill_farm_metadata(db: Session) -> int:
    """
    Fill missing crop_type, sowing_date, area, and soil_type on existing farms.
    Returns the number of farms updated.
    """
    farms = db.query(Farm).all()
    updated = 0

    for farm in farms:
        changed = False

        if not farm.crop_type or not farm.crop_type.strip():
            farm.crop_type = _infer_crop(farm.farm_name)
            changed = True

        if not farm.sowing_date or not farm.sowing_date.strip():
            farm.sowing_date = _estimate_sowing_date(farm.created_at)
            changed = True

        if farm.area is None:
            farm.area = _estimate_area(farm.id)
            changed = True

        if not farm.soil_type or not farm.soil_type.strip():
            farm.soil_type = _infer_soil(farm.farm_name)
            changed = True

        if changed:
            updated += 1

    if updated:
        db.commit()

    return updated
