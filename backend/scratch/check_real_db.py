import sqlite3
import os

paths = [
    'ecotrade.db',
    'backend/ecotrade.db'
]

for p in paths:
    if os.path.exists(p):
        print(f"--- Checking {p} ---")
        try:
            conn = sqlite3.connect(p)
            cur = conn.cursor()
            cur.execute("SELECT id, name FROM company")
            rows = cur.fetchall()
            print(f"Found {len(rows)} companies:")
            for r in rows: print(f"  - {r}")
            conn.close()
        except Exception as e:
            print(f"Error: {e}")
    else:
        print(f"Path {p} does not exist.")
