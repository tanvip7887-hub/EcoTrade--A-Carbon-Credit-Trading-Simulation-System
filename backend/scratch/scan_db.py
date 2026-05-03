import sqlite3
import os

paths = ['ecotrade.db', 'backend/ecotrade.db']

for p in paths:
    if os.path.exists(p):
        print(f"\n--- Scanning {p} ---")
        conn = sqlite3.connect(p)
        cur = conn.cursor()
        cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cur.fetchall()
        print(f"Tables found: {tables}")
        for (table_name,) in tables:
            try:
                cur.execute(f"SELECT count(*) FROM {table_name}")
                count = cur.fetchone()[0]
                print(f"  Table '{table_name}' has {count} rows.")
                if count > 0:
                    cur.execute(f"SELECT * FROM {table_name} LIMIT 1")
                    print(f"  Sample row: {cur.fetchone()}")
            except Exception as e:
                print(f"  Error reading {table_name}: {e}")
        conn.close()
