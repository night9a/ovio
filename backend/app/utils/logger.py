#import logging

#monitor for server usage and errors trackign system put it in json file in ../../runtime folder 

import platform
import psutil
import shutil

def server_specs():
    cpu_freq = psutil.cpu_freq()
    
    return {
        "OS": platform.system(),
        "OS Version": platform.version(),
        "Architecture": platform.machine(),
        "CPU Cores (logical)": psutil.cpu_count(logical=True),
        "CPU Cores (physical)": psutil.cpu_count(logical=False),
        "CPU Frequency (MHz)": cpu_freq.max if cpu_freq else None,
        "Total RAM (GB)": round(psutil.virtual_memory().total / 1e9, 2),
        "Disk Total (GB)": round(shutil.disk_usage("/").total / 1e9, 2),
    }

for k, v in server_specs().items():
    print(f"{k}: {v}")

