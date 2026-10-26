"""Create the partial unique index for booking transaction safety."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.db.session import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text(
        "CREATE UNIQUE INDEX IF NOT EXISTS ix_bookings_confirmed_slot "
        "ON bookings (slot_id) WHERE status = 'confirmed'"
    ))
    conn.commit()
    print("Partial unique index ix_bookings_confirmed_slot created successfully.")
