import sqlite3
import os

db_path = 'ecotrade.db'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(company)")
    columns = cursor.fetchall()
    print("Columns in 'company' table:")
    for col in columns:
        print(f" - {col[1]} ({col[2]})")
    conn.close()
else:
    print("Database not found in root.")
