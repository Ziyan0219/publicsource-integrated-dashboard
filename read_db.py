import sqlite3

# 数据库文件路径
db_path = 'src/database/app.db'

# 连接数据库
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 查询所有表名
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()
print("数据库中的所有表：")
for table in tables:
    print(table[0])

# 遍历每个表，打印前10行内容
for table in tables:
    print(f"\n表 {table[0]} 的前10行数据：")
    cursor.execute(f"SELECT * FROM {table[0]} LIMIT 10;")
    rows = cursor.fetchall()
    for row in rows:
        print(row)

# 关闭连接
cursor.close()
conn.close()