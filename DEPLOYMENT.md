# Deployment Guide - Ramp Dashboard

## Quick Deploy to Vercel

### Option 1: One-Click Deploy (Recommended)

1. **Fork this repository** to your GitHub account
2. **Click the Deploy button** below:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/ramp-dashboard&env=RAMP_API_KEY,NEXTAUTH_SECRET&envDescription=Required%20environment%20variables&envLink=https://github.com/yourusername/ramp-dashboard%23environment-variables)

3. **Set environment variables** during deployment:
   - `RAMP_API_KEY`: Your Ramp API key from [Ramp Developer Portal](https://developer.ramp.com)
   - `NEXTAUTH_SECRET`: A random secret string (generate with `openssl rand -base64 32`)

### Option 2: Manual Deployment

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from project directory**:
   ```bash
   vercel
   ```

4. **Set environment variables** in Vercel dashboard or CLI:
   ```bash
   vercel env add RAMP_API_KEY
   vercel env add NEXTAUTH_SECRET
   ```

### Option 3: GitHub Integration

1. **Push code to GitHub repository**
2. **Connect repository to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
3. **Configure environment variables** in project settings
4. **Deploy automatically** on every push to main branch

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|----------|
| `RAMP_API_KEY` | Your Ramp API key | `ramp_live_...` |
| `NEXTAUTH_SECRET` | Secret for session encryption | `your-secret-here` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|----------|
| `NEXTAUTH_URL` | Your app URL | Auto-detected |

### Getting Your Ramp API Key

1. Go to [Ramp Developer Portal](https://developer.ramp.com)
2. Create a new application
3. Generate API credentials
4. Copy the API key to your environment variables

**Note**: For development/demo purposes, the app will use mock data if no API key is provided.

## Post-Deployment Setup

### 1. Verify Deployment

- Visit your deployed URL
- Test login with demo credentials: `demo@company.com` / `demo123`
- Verify all features work:
  - Dashboard statistics
  - Transaction filtering
  - Data export (CSV/Excel)
  - Responsive design

### 2. Custom Domain (Optional)

1. **Add domain in Vercel dashboard**:
   - Go to Project Settings → Domains
   - Add your custom domain
   - Configure DNS records as instructed

2. **Update environment variables**:
   - Set `NEXTAUTH_URL` to your custom domain

### 3. SSL Certificate

- Vercel automatically provides SSL certificates
- Custom domains get SSL within minutes
- No additional configuration needed

## Production Considerations

### Security

- [ ] Replace demo authentication with real SSO
- [ ] Use httpOnly cookies instead of localStorage
- [ ] Implement proper CORS policies
- [ ] Add rate limiting to API endpoints
- [ ] Enable security headers

### Performance

- [ ] Add React Query for API caching
- [ ] Implement proper error boundaries
- [ ] Add monitoring (Sentry, LogRocket)
- [ ] Optimize bundle size
- [ ] Add service worker for offline support

### Monitoring

- [ ] Set up Vercel Analytics
- [ ] Configure error tracking
- [ ] Add performance monitoring
- [ ] Set up uptime monitoring

## Troubleshooting

### Common Issues

**Build Failures**:
- Check environment variables are set
- Verify Node.js version compatibility
- Review build logs in Vercel dashboard

**API Errors**:
- Verify Ramp API key is valid
- Check API rate limits
- Review serverless function logs

**Authentication Issues**:
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches deployment URL
- Clear browser cache and cookies

### Getting Help

1. Check [Vercel Documentation](https://vercel.com/docs)
2. Review [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
3. Open an issue in the repository
4. Contact support with deployment logs

## Scaling Considerations

### Database Integration

For production use, consider adding:
- PostgreSQL for user sessions
- Redis for caching
- Database connection pooling

### Authentication Upgrade

Replace demo auth with:
- Okta integration
- Azure AD
- Auth0
- Custom SAML provider

### API Optimization

- Implement request caching
- Add pagination for large datasets
- Use database for transaction storage
- Add background job processing

---

**Deployment Status**: ✅ Ready for production deployment

**Estimated Deploy Time**: 2-3 minutes

**Supported Regions**: Global (Vercel Edge Network)