import json
import msgpack
import cbor2
import time
import os

# Sample data: mimic your canvas JSON structure
data = {
    "id": "6",
    "canvas": [
        {"actions": [
            {"config": {"endpoint": "ww", "headers": "d", "method": "POST"}, "id": "action-1", "type": "api_call"},
            {"config": {}, "id": "action-2", "type": "db_insert"}
        ], "category": "Layout", "id": "container", "name": "Container", "uniqueId": "container-1", "x": 284, "y": 202},
        {"actions": [], "category": "Layout", "id": "grid", "name": "Grid", "uniqueId": "grid-1", "x": 308, "y": 142},
        {"actions": [], "category": "Layout", "id": "container", "name": "Container", "uniqueId": "container-2", "x": 173, "y": 192},
        {"actions": [], "category": "Content", "id": "text", "name": "Text", "uniqueId": "text-1", "x": 94, "y": 275},
        {"actions": [], "category": "Content", "id": "button", "name": "Button", "uniqueId": "button-1", "x": 288, "y": 410},
    ] * 2000  # Multiply to make dataset large (~10k items)
}

# ---------- JSON ----------
start = time.time()
with open("data.json", "w") as f:
    json.dump(data, f)
json_write = time.time() - start

start = time.time()
with open("data.json", "r") as f:
    data_json = json.load(f)
json_read = time.time() - start

json_size = os.path.getsize("data.json")

# ---------- MessagePack ----------
start = time.time()
with open("data.msgpack", "wb") as f:
    f.write(msgpack.packb(data))
msgpack_write = time.time() - start

start = time.time()
with open("data.msgpack", "rb") as f:
    data_msgpack = msgpack.unpackb(f.read(), strict_map_key=False)
msgpack_read = time.time() - start

msgpack_size = os.path.getsize("data.msgpack")

# ---------- CBOR ----------
start = time.time()
with open("data.cbor", "wb") as f:
    f.write(cbor2.dumps(data))
cbor_write = time.time() - start

start = time.time()
with open("data.cbor", "rb") as f:
    data_cbor = cbor2.loads(f.read())
cbor_read = time.time() - start

cbor_size = os.path.getsize("data.cbor")

# ---------- Results ----------
print(f"{'Format':<10} {'Write(s)':<10} {'Read(s)':<10} {'Size(MB)':<10}")
print(f"{'-'*40}")
print(f"{'JSON':<10} {json_write:<10.4f} {json_read:<10.4f} {json_size/1024/1024:<10.2f}")
print(f"{'MsgPack':<10} {msgpack_write:<10.4f} {msgpack_read:<10.4f} {msgpack_size/1024/1024:<10.2f}")
print(f"{'CBOR':<10} {cbor_write:<10.4f} {cbor_read:<10.4f} {cbor_size/1024/1024:<10.2f}")

