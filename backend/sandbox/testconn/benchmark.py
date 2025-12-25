# benchmark.py
import socket
import time
import psutil

servers = [
    ("Lua", 12345),
    ("Python", 12346),
    ("Go", 12347),
]

def test_server(host, port, requests=1000):
    start_time = time.time()
    for i in range(requests):
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect((host, port))
        s.send(f"INSERT user{i} pass{i}\n".encode())
        s.recv(1024)
        s.close()
    latency = (time.time() - start_time) / requests
    return latency

print("Benchmarking servers...")
results = []
for name, port in servers:
    latency = test_server("127.0.0.1", port)
    mem = psutil.virtual_memory().used / (1024 * 1024)
    cpu = psutil.cpu_percent(interval=1)
    results.append((name, latency*1000, mem, cpu))

print("\nResults (Latency ms/request | Memory MB | CPU %):")
print("{:<10} {:<20} {:<10} {:<10}".format("Server", "Latency", "Memory", "CPU"))
for r in results:
    print("{:<10} {:<20.3f} {:<10.1f} {:<10.1f}".format(*r))
