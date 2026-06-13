"""
One-time script to backfill crop/soil metadata on existing farms.

Usage (from backend/):
    .venv\\Scripts\\python scripts/backfill_farms.py
"""
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from dotenv import load_dotenv

load_dotenv()

from app.db.database import SessionLocal, migrate_farm_columns
from app.db.models import Farm  # noqa: F401 — register models
from app.services.farm_backfill import backfill_farm_metadata


def main() -> None:
    migrate_farm_columns()
    db = SessionLocal()
    try:
        count = backfill_farm_metadata(db)
        print(f"Backfilled metadata on {count} farm(s).")
    finally:
        db.close()


if __name__ == "__main__":
    main()
