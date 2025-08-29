# 🚀 Deployment Guide - Ramp Dashboard

## Quick Deployment Steps

### Step 1: Create GitHub Repository

1. **Go to GitHub**: Visit [github.com/new](https://github.com/new)
2. **Repository Details**:
   - Repository name: `ramp-dashboard`
   - Description: `Enterprise-ready Ramp expense dashboard with Next.js and AG Grid`
   - Visibility: Public (recommended) or Private
   - **DO NOT** initialize with README, .gitignore, or license (we have these already)
3. **Click "Create repository"**

### Step 2: Push Code to GitHub

Run these commands in your terminal:

```bash
# Add the remote repository
git remote add origin https://github.com/BambamBandit11/ramp-dashboard.git

# Push the code
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Vercel

#### Option A: One-Click Deploy (Easiest)

1. **Click the Deploy Button** in the README
2. **Connect GitHub**: Authorize Vercel to access your repositories
3. **Select Repository**: Choose `BambamBandit11/ramp-dashboard`
4. **Configure Environment Variables**:
   ```
   RAMP_API_KEY=your_ramp_api_key_here
   NEXTAUTH_SECRET=your_random_secret_here
   ```
5. **Click Deploy**

#### Option B: Manual Vercel Deployment

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

4. **Follow the prompts**:
   - Link to existing project? `N`
   - What's your project's name? `ramp-dashboard`
   - In which directory is your code located? `./`
   - Want to override the settings? `N`

5. **Set Environment Variables**:
   ```bash
   vercel env add RAMP_API_KEY
   vercel env add NEXTAUTH_SECRET
   ```

6. **Redeploy with environment variables**:
   ```bash
   vercel --prod
   ```

#### Option C: Vercel Dashboard

1. **Go to Vercel Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)
2. **Click "New Project"**
3. **Import Git Repository**: Select your `ramp-dashboard` repo
4. **Configure Project**:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. **Add Environment Variables**:
   - `RAMP_API_KEY`: Your Ramp API key
   - `NEXTAUTH_SECRET`: Random secret string
6. **Click Deploy**

## Environment Variables Setup

### Required Variables

#### RAMP_API_KEY
- **Get from**: [Ramp Developer Portal](https://developer.ramp.com)
- **Format**: `ramp_live_...` or `ramp_sandbox_...`
- **Note**: App uses mock data if not provided (for demo purposes)

#### NEXTAUTH_SECRET
- **Generate with**: `openssl rand -base64 32`
- **Or use**: Any random 32+ character string
- **Example**: `your-super-secret-string-here-32-chars-min`

### Optional Variables

#### NEXTAUTH_URL
- **Auto-detected** in production
- **Only needed** for custom domains
- **Format**: `https://your-custom-domain.com`

## Post-Deployment Checklist

### ✅ Verify Deployment

1. **Visit your deployed URL**
2. **Test login**: Use `demo@company.com` / `demo123`
3. **Check dashboard features**:
   - [ ] Statistics cards load
   - [ ] Transactions table displays data
   - [ ] Filters work correctly
   - [ ] Export buttons function
   - [ ] Responsive design on mobile

### ✅ Test API Endpoints

Visit these URLs (replace with your domain):
- `https://your-app.vercel.app/api/ramp/transactions`
- `https://your-app.vercel.app/api/ramp/users`
- `https://your-app.vercel.app/api/ramp/cards`

### ✅ Performance Check

1. **Lighthouse Score**: Run in Chrome DevTools
2. **Core Web Vitals**: Check in Vercel Analytics
3. **Load Time**: Should be < 3 seconds

## Custom Domain Setup (Optional)

### Add Custom Domain

1. **Go to Project Settings** in Vercel
2. **Click "Domains"**
3. **Add your domain**: `dashboard.yourcompany.com`
4. **Configure DNS**:
   - Add CNAME record pointing to `cname.vercel-dns.com`
   - Or add A record pointing to Vercel's IP
5. **Update Environment Variables**:
   - Set `NEXTAUTH_URL` to your custom domain

### SSL Certificate

- **Automatic**: Vercel provides SSL certificates automatically
- **Custom**: Upload your own certificate if needed
- **Verification**: Usually takes 1-5 minutes

## Monitoring & Analytics

### Enable Vercel Analytics

1. **Go to Project Settings**
2. **Click "Analytics"**
3. **Enable Web Analytics**
4. **View real-time metrics**

### Error Monitoring

Recommended integrations:
- **Sentry**: Error tracking
- **LogRocket**: Session recording
- **DataDog**: Infrastructure monitoring

## Scaling Considerations

### Database Integration

For production scale:
- **PostgreSQL**: User sessions and caching
- **Redis**: API response caching
- **Prisma**: Database ORM

### Authentication Upgrade

Replace demo auth with:
- **Okta**: Enterprise SSO
- **Auth0**: Universal authentication
- **Azure AD**: Microsoft integration
- **Custom SAML**: Your identity provider

## Troubleshooting

### Common Deployment Issues

**Build Failures**:
```bash
# Check build logs
vercel logs

# Test build locally
npm run build
```

**Environment Variable Issues**:
```bash
# List current variables
vercel env ls

# Add missing variables
vercel env add VARIABLE_NAME
```

**Domain Issues**:
- Check DNS propagation: `dig your-domain.com`
- Verify CNAME/A records
- Wait 24-48 hours for full propagation

### Getting Help

1. **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
2. **GitHub Issues**: Create an issue in the repository
3. **Vercel Support**: Contact through dashboard
4. **Community**: Next.js Discord or Stack Overflow

## Success! 🎉

Once deployed, you'll have:
- ✅ Live production dashboard
- ✅ Automatic deployments on git push
- ✅ SSL certificate and CDN
- ✅ Serverless functions for API
- ✅ Analytics and monitoring
- ✅ Professional expense management tool

**Your dashboard will be live at**: `https://your-project-name.vercel.app`

---

**Need help?** Create an issue in the GitHub repository with your deployment logs and error messages.