# Debugging "Failed to Fetch" Error

Follow these steps to resolve the issue:

## Step 1: Verify Backend is Running

Open PowerShell and run:

```powershell
cd d:\project\ovio\backend
python app.py
```

You should see output like:
```
(werkzeug) WARNING: This is a development server. Do not use it in production deployments.
(socketio) Server initialized for threading.
 * Running on http://0.0.0.0:5000
```

**Make sure the backend is running on port 5000!**

---

## Step 2: Test Backend Directly

In a new PowerShell, test if the backend is accessible:

```powershell
curl -X GET http://localhost:5000/auth/login -H "Content-Type: application/json"
```

You should get a response (even if it's an error about missing credentials).

---

## Step 3: Check Environment Variables

I've created a `.env.local` file in your frontend folder with:
```
VITE_API_BASE=http://localhost:5000
```

**Important:** If you changed the backend port, update this file accordingly.

---

## Step 4: Restart Frontend Dev Server

After updating environment variables, restart your frontend:

```powershell
cd d:\project\ovio\frontend
npm run dev
```

---

## Step 5: Check Browser Console

1. Open your browser DevTools (F12)
2. Go to the **Network** tab
3. Look for failed requests to `http://localhost:5000/...`
4. Check the **Console** tab for specific error messages

---

## Common Issues & Solutions

### Issue 1: "CORS error" or "No 'Access-Control-Allow-Origin' header"
**Solution:** Flask-CORS might not be installed
```powershell
cd d:\project\ovio\backend
pip install flask-cors
```

### Issue 2: Backend returns 401 (Unauthorized)
**Solution:** You didn't pass the token correctly. Check:
- Token is saved in localStorage
- Authorization header format is exactly: `Bearer <token>`

### Issue 3: Backend returns 404 (Not Found)
**Solution:** URL might be wrong. Check:
- Backend is running on http://localhost:5000
- API endpoint matches exactly (e.g., `/auth/login`, `/projects/`)

### Issue 4: Connection refused
**Solution:** Backend is not running
```powershell
cd d:\project\ovio\backend
python app.py
```

---

## Quick Checklist

- [ ] Backend running on port 5000
- [ ] Frontend `.env.local` has `VITE_API_BASE=http://localhost:5000`
- [ ] Flask-CORS installed
- [ ] Frontend dev server restarted after env changes
- [ ] Token exists in localStorage (check DevTools > Application > LocalStorage)
- [ ] Network requests show CORS headers in Response Headers

---

## If Still Not Working

Run this debug command in browser console:

```javascript
// Check if API_BASE is set
console.log(import.meta.env.VITE_API_BASE);

// Test a basic fetch
fetch('http://localhost:5000/projects/', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(r => r.json())
.then(d => console.log(d))
.catch(e => console.error(e));
```
