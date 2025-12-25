# python_server.py
import socket
import threading

DB_FILE = "users.db"

def insert(username, password):
    with open(DB_FILE, "a") as f:
        f.write(f"{username}|{password}\n")
    return "OK"

def lookup(username):
    with open(DB_FILE, "r") as f:
        for line in f:
            user, passwd = line.strip().split("|")
            if user == username:
                return passwd
    return "NOT_FOUND"

def handle_client(conn):
    try:
        data = conn.recv(1024).decode().strip()
        parts = data.split()
        if not parts:
            conn.send(b"ERROR\n")
            return
        cmd = parts[0]
        if cmd == "INSERT":
            res = insert(parts[1], parts[2])
        elif cmd == "LOOKUP":
            res = lookup(parts[1])
        else:
            res = "ERROR"
        conn.send((res+"\n").encode())
    finally:
        conn.close()

def start_server(host="0.0.0.0", port=12346):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind((host, port))
    s.listen(5)
    print(f"Python DB server listening on port {port}...")
    while True:
        conn, addr = s.accept()
        threading.Thread(target=handle_client, args=(conn,)).start()

if __name__ == "__main__":
    start_server()
