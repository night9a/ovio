#!/usr/bin/env python
"""Test script to verify backend is running and CORS is configured."""
import requests
import sys

API_BASE = "http://localhost:5000"

def test_cors_headers():
    """Test if CORS headers are present."""
    print("Testing CORS configuration...")
    try:
        response = requests.options(f"{API_BASE}/auth/login")
        cors_headers = {k: v for k, v in response.headers.items() if 'access-control' in k.lower()}
        
        if cors_headers:
            print("✓ CORS headers found:")
            for header, value in cors_headers.items():
                print(f"  {header}: {value}")
        else:
            print("✗ No CORS headers found!")
            return False
        return True
    except Exception as e:
        print(f"✗ Error testing CORS: {e}")
        return False

def test_backend_connection():
    """Test if backend is running."""
    print("\nTesting backend connection...")
    try:
        response = requests.get(f"{API_BASE}/projects/", 
                              headers={"Authorization": "Bearer invalid-token"})
        print(f"✓ Backend responded with status: {response.status_code}")
        return True
    except requests.exceptions.ConnectionError:
        print(f"✗ Cannot connect to {API_BASE}")
        print("  Make sure backend is running: python app.py")
        return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def main():
    print("=" * 50)
    print("Backend Connection Test")
    print("=" * 50)
    
    if not test_backend_connection():
        sys.exit(1)
    
    if not test_cors_headers():
        sys.exit(1)
    
    print("\n✓ Everything looks good!")
    print("=" * 50)

if __name__ == "__main__":
    main()
