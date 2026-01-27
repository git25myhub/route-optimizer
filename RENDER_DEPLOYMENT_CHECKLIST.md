# 🚀 Render Deployment Checklist

Complete step-by-step checklist for deploying Route Optimizer Backend to Render.

## ✅ Pre-Deployment Checklist

- [ ] Code is pushed to Git repository (GitHub/GitLab/Bitbucket)
- [ ] All dependencies are in `requirements.txt`
- [ ] `render.yaml` exists in repository root
- [ ] `runtime.txt` specifies Python version
- [ ] Database models are ready (tables auto-create on startup)
- [ ] CORS is configured (currently allows all origins)

## 📋 Step-by-Step Deployment

### Step 1: Push Code to Git Repository

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit: Route Optimizer Backend"

# Add your remote repository
git remote add origin https://github.com/yourusername/route-optimizer-backend.git
git push -u origin main
```

**✅ Checkpoint:** Code is in Git repository

---

### Step 2: Create Render Account

1. Go to https://render.com
2. Sign up with GitHub/GitLab/Bitbucket (recommended) or email
3. Verify your email if required

**✅ Checkpoint:** Render account created

---

### Step 3: Create PostgreSQL Database

1. In Render Dashboard, click **"New +"** → **"PostgreSQL"**
2. Fill in the form:
   - **Name:** `route-optimizer-db`
   - **Database:** `route_optimizer` (or leave default)
   - **User:** `route_optimizer_user` (or leave default)
   - **Region:** Choose closest to your users
   - **PostgreSQL Version:** Latest (15 or 16)
   - **Plan:** Free (for testing) or Starter ($7/month for production)
3. Click **"Create Database"**
4. **IMPORTANT:** Copy the **"Internal Database URL"** - you'll need this!

**✅ Checkpoint:** PostgreSQL database created

**📝 Note:** The Internal Database URL looks like:
```
postgresql://user:password@dpg-xxxxx-a/route_optimizer
```

---

### Step 4: Create Web Service

1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect your Git repository:
   - Click **"Connect account"** if not already connected
   - Select your repository: `route-optimizer-backend`
   - Click **"Connect"**
3. Configure the service:

   **Basic Settings:**
   - **Name:** `route-optimizer-api`
   - **Region:** Same as database (recommended)
   - **Branch:** `main` (or your default branch)
   - **Root Directory:** Leave empty (or `./` if your app is in root)
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

   **Advanced Settings (if render.yaml doesn't work):**
   - Python Version: `3.11.0` (or check `runtime.txt`)

4. Click **"Create Web Service"**

**✅ Checkpoint:** Web service created

---

### Step 5: Link Database to Web Service

1. In your Web Service dashboard, go to **"Environment"** tab
2. Scroll down to **"Environment Variables"**
3. Click **"Add Environment Variable"**
4. Add:
   - **Key:** `DATABASE_URL`
   - **Value:** Paste the Internal Database URL from Step 3
   - Click **"Save Changes"**

**Alternative Method (Easier):**
1. In your PostgreSQL service dashboard
2. Find **"Connections"** section
3. Click **"Connect"** next to your web service name
4. Render automatically adds `DATABASE_URL`

**✅ Checkpoint:** Database linked to web service

---

### Step 6: Deploy

1. Render automatically starts building when you save changes
2. Go to **"Logs"** tab to watch the build process
3. Wait for build to complete (usually 2-5 minutes)
4. Check for any errors in logs

**✅ Checkpoint:** Deployment in progress

---

### Step 7: Verify Deployment

1. Once deployed, your service URL will be:
   ```
   https://route-optimizer-api.onrender.com
   ```
   (or your custom name)

2. **Test Root Endpoint:**
   ```bash
   curl https://route-optimizer-api.onrender.com/
   ```
   Should return: `{"message": "Route Optimization API Running"}`

3. **Test API Documentation:**
   Open in browser:
   ```
   https://route-optimizer-api.onrender.com/docs
   ```

4. **Test Route Optimization:**
   ```bash
   curl -X POST "https://route-optimizer-api.onrender.com/routes/optimize" \
     -H "Content-Type: application/json" \
     -d '{
       "locations": [
         {"lat": 40.7128, "lng": -74.0060},
         {"lat": 34.0522, "lng": -118.2437}
       ],
       "algorithm": "dijkstra"
     }'
   ```

**✅ Checkpoint:** API is working!

---

## 🔧 Post-Deployment Configuration

### Update CORS for Frontend (if deploying frontend)

1. Go to Web Service → **"Environment"**
2. Add environment variable:
   - **Key:** `FRONTEND_URL`
   - **Value:** Your frontend URL (e.g., `https://your-frontend.vercel.app`)
3. Update `app/main.py` to use this variable:
   ```python
   allow_origins=[os.getenv("FRONTEND_URL", "*")]
   ```

### Set Up Health Check (Optional)

Render automatically monitors your service, but you can add a health endpoint:

```python
@app.get("/health")
def health_check():
    return {"status": "healthy"}
```

---

## 📊 Monitoring

### View Logs
- Go to Web Service → **"Logs"** tab
- Real-time logs are available
- Check for errors or warnings

### View Metrics
- Go to Web Service → **"Metrics"** tab
- Monitor CPU, memory, and request metrics

### Database Management
- Go to PostgreSQL service → **"Info"** tab
- View connection details and database stats
- Use **"Connect"** button to get connection strings

---

## 🐛 Troubleshooting

### Build Fails

**Error:** `ModuleNotFoundError: No module named 'app'`
- **Solution:** Make sure `Start Command` is: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Check that `app/` directory exists in repository

**Error:** `pip install` fails
- **Solution:** Check `requirements.txt` has correct package names
- Verify Python version in `runtime.txt` matches Render's Python version

### Database Connection Fails

**Error:** `could not connect to server`
- **Solution:** 
  1. Verify `DATABASE_URL` is set correctly
  2. Use **Internal Database URL** (not External)
  3. Check database is running (Status should be "Available")

**Error:** `relation "routes" does not exist`
- **Solution:** Tables auto-create on first request. Wait a moment and try again.
- Check logs for SQL errors

### Service Crashes

**Error:** Service keeps restarting
- **Solution:** 
  1. Check logs for error messages
  2. Verify all environment variables are set
  3. Check database connection is working
  4. Ensure `$PORT` is used in start command (Render sets this automatically)

---

## 🔗 Share Your Live API

Once deployed, your API is available at:
```
https://route-optimizer-api.onrender.com
```

**API Documentation:**
```
https://route-optimizer-api.onrender.com/docs
```

**Test Endpoint:**
```bash
curl https://route-optimizer-api.onrender.com/
```

---

## 📝 Environment Variables Summary

Required:
- `DATABASE_URL` - PostgreSQL connection string (auto-set when database is linked)

Optional:
- `FRONTEND_URL` - For CORS configuration
- `PYTHON_VERSION` - Python version (if not in runtime.txt)

---

## ✅ Final Checklist

- [ ] Code pushed to Git
- [ ] PostgreSQL database created
- [ ] Web service created
- [ ] Database linked to web service
- [ ] Environment variables configured
- [ ] Deployment successful
- [ ] API root endpoint works
- [ ] API docs accessible
- [ ] Route optimization endpoint tested
- [ ] Database tables created (check logs)

---

## 🎉 Success!

Your Route Optimizer API is now live on Render!

**Next Steps:**
1. Update frontend `VITE_API_URL` to your Render URL
2. Deploy frontend to Vercel/Netlify
3. Share your project! 🚀

---

## 💡 Pro Tips

1. **Free Tier Limitations:**
   - Services spin down after 15 min of inactivity
   - First request after spin-down takes 30-60 seconds
   - Consider paid plan for production

2. **Database Backups:**
   - Free tier: Manual backups only
   - Paid tier: Automatic daily backups

3. **Custom Domain:**
   - Go to Web Service → "Custom Domains"
   - Add your domain and configure DNS

4. **Monitoring:**
   - Set up alerts in Render dashboard
   - Monitor logs regularly
   - Check metrics for performance issues

---

**Need Help?**
- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
- Check application logs for detailed error messages
