import requests
import sys

def check_vercel_health(url):
    """Check the health and auth status of the deployed Vercel API."""
    print(f"🔍 Checking SmartBud API at: {url}")
    
    # 1. Check basic connectivity
    try:
        res = requests.get(f"{url}/api/health", timeout=10)
        if res.status_code == 200:
            print("✅ API is REACHABLE (Status 200)")
            print(f"   Response: {res.json()}")
        else:
            print(f"❌ API returned status {res.status_code}")
            return
    except Exception as e:
        print(f"❌ FAILED to connect: {e}")
        return

    # 2. Check for the specific proxy error by triggering an auth route
    # (Even without a real token, the backend should return 401 'Invalid token' 
    # instead of crashing with 'unexpected keyword argument proxy')
    print("\n🛡️ Testing for 'Proxy Argument' crash...")
    headers = {"Authorization": "Bearer not-a-real-token"}
    try:
        res = requests.get(f"{url}/api/chat/history", headers=headers, timeout=10)
        
        # If we get a JSON response with status 401, it means the code DID NOT crash!
        if res.status_code == 401:
            detail = res.json().get("detail", "")
            if "proxy" in detail.lower():
                print(f"❌ CRASH DETECTED: {detail}")
                print("   The monkeypatch is not active or hasn't deployed yet.")
            else:
                print("✅ PROXY FIX VERIFIED: Backend returned 401 (Unauthorized) correctly.")
                print(f"   Detail: {detail}")
        else:
            print(f"❓ Unexpected status {res.status_code}: {res.text}")
    except Exception as e:
        print(f"❌ Request failed: {e}")

if __name__ == "__main__":
    target_url = "https://ai-smart-learn.vercel.app"
    if len(sys.argv) > 1:
        target_url = sys.argv[1]
    
    check_vercel_health(target_url.rstrip('/'))
