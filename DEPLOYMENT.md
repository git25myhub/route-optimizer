# Deployment Guide for Render

This guide will help you deploy the Route Optimization API to Render.

## Prerequisites

1. A Render account (sign up at https://render.com)
2. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Steps

### 1. Prepare Your Repository

Make sure your repository includes:
- `requirements.txt` - Python dependencies
- `render.yaml` - Render configuration (optional but recommended)
- `runtime.txt` - Python version specification
- All application code in the `app/` directory

### 2. Create a Web Service on Render

1. Log in to Render Dashboard
2. Click "New +" → "Web Service"
3. Connect your Git repository
4. Render will auto-detect the configuration from `render.yaml` or you can configure manually:

**Manual Configuration:**
- **Name:** route-optimizer-api
- **Environment:** Python 3
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Root Directory:** (leave empty, or set to root if your app is in a subdirectory)

### 3. Create a PostgreSQL Database

1. In Render Dashboard, click "New +" → "PostgreSQL"
2. Configure:
   - **Name:** route-optimizer-db
   - **Database:** route_optimizer
   - **User:** route_optimizer_user
   - **Plan:** Free (or choose a paid plan for production)

### 4. Link Database to Web Service

1. Go to your Web Service settings
2. Navigate to "Environment" section
3. Add environment variable:
   - **Key:** `DATABASE_URL`
   - **Value:** Copy the "Internal Database URL" from your PostgreSQL service
   - **Note:** Render automatically provides this if you link the database in the dashboard

### 5. Environment Variables

Add any additional environment variables if needed:
- `DATABASE_URL` - Automatically set when database is linked
- `PYTHON_VERSION` - Set to `3.11.0` (or your preferred version)

### 6. Deploy

1. Click "Save Changes"
2. Render will automatically build and deploy your application
3. Monitor the build logs for any issues
4. Once deployed, your API will be available at: `https://your-service-name.onrender.com`

## Post-Deployment

### Verify Deployment

1. Check the API root endpoint:
   ```
   https://your-service-name.onrender.com/
   ```
   Should return: `{"message": "Route Optimization API Running"}`

2. Check API documentation:
   ```
   https://your-service-name.onrender.com/docs
   ```

3. Test route optimization:
   ```bash
   curl -X POST "https://your-service-name.onrender.com/routes/optimize" \
     -H "Content-Type: application/json" \
     -d '{
       "locations": [
         {"lat": 40.7128, "lng": -74.0060},
         {"lat": 40.7589, "lng": -73.9851},
         {"lat": 40.7489, "lng": -73.9680}
       ],
       "algorithm": "dijkstra"
     }'
   ```

### Database Migration

The application automatically creates tables on startup using `Base.metadata.create_all()`. For production, consider using Alembic for proper database migrations:

```bash
pip install alembic
alembic init alembic
# Configure alembic.ini and create migrations
```

## Troubleshooting

### Build Failures

- Check build logs for missing dependencies
- Ensure `requirements.txt` includes all necessary packages
- Verify Python version compatibility

### Database Connection Issues

- Verify `DATABASE_URL` is correctly set
- Check database is running and accessible
- Ensure database credentials are correct

### Application Crashes

- Check application logs in Render dashboard
- Verify all environment variables are set
- Ensure database tables are created (check logs for SQL errors)

### Free Tier Limitations

- Free tier services spin down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- Consider upgrading to paid plan for production use

## Monitoring

- **Logs:** Available in Render Dashboard → Your Service → Logs
- **Metrics:** View CPU, memory, and request metrics in dashboard
- **Health Checks:** Render automatically monitors your service

## Custom Domain (Optional)

1. Go to your Web Service settings
2. Navigate to "Custom Domains"
3. Add your domain and follow DNS configuration instructions

## Security Considerations

1. **CORS:** Currently set to allow all origins (`*`). Update in `app/main.py` for production:
   ```python
   allow_origins=["https://your-frontend-domain.com"]
   ```

2. **Environment Variables:** Never commit sensitive data. Use Render's environment variable system.

3. **Database:** Use strong passwords and restrict database access to your web service only.

## Cost Estimation

- **Free Tier:** 
  - Web Service: Free (with limitations)
  - PostgreSQL: Free (90 days, then $7/month)
- **Paid Tier:**
  - Web Service: Starting at $7/month
  - PostgreSQL: Starting at $7/month

## Quick Deployment Checklist

See [RENDER_DEPLOYMENT_CHECKLIST.md](RENDER_DEPLOYMENT_CHECKLIST.md) for a detailed step-by-step checklist.

**Quick Steps:**
1. ✅ Push code to Git repository
2. ✅ Create PostgreSQL database on Render
3. ✅ Create Web Service on Render
4. ✅ Link database to web service
5. ✅ Deploy and verify

## Frontend Deployment

After deploying the backend, deploy the frontend:

1. **Update API URL:**
   - Create `.env` file in `frontend/` directory
   - Set `VITE_API_URL=https://your-api.onrender.com`

2. **Deploy to Vercel (Recommended):**
   ```bash
   cd frontend
   npm install
   npm run build
   # Deploy to Vercel
   ```

3. **Or deploy to Netlify:**
   - Connect Git repository
   - Build command: `npm run build`
   - Publish directory: `dist`

## Support

For Render-specific issues, check:
- Render Documentation: https://render.com/docs
- Render Community: https://community.render.com
- Render Status: https://status.render.com

**Detailed Checklist:** See [RENDER_DEPLOYMENT_CHECKLIST.md](RENDER_DEPLOYMENT_CHECKLIST.md)
