# 🚀 Ramp Dashboard - Enterprise Expense Management

A lightweight, enterprise-ready web application dashboard with direct Ramp API integration. Built with Next.js, React, TypeScript, and TailwindCSS.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/BambamBandit11/ramp-dashboard&env=RAMP_API_KEY,NEXTAUTH_SECRET&envDescription=Required%20environment%20variables%20for%20Ramp%20API%20and%20authentication&envLink=https://github.com/BambamBandit11/ramp-dashboard%23environment-variables)

## ✨ Features

- 🔄 **Live Data View**: Real-time transaction data with on-demand refresh
- 🔍 **Advanced Filtering**: Filter by employee, category, date range, amount, department, and status
- 📊 **Interactive Data Table**: Powered by AG Grid with sorting, filtering, and pagination
- 📈 **Dashboard Statistics**: Key metrics and insights at a glance
- 📤 **Data Export**: Export filtered datasets to CSV or Excel formats
- 🔐 **Authentication Ready**: Simple auth with SSO-ready architecture
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- ⚡ **Serverless Functions**: Secure Ramp API integration via Vercel functions
- 🎨 **Modern UI**: Clean, professional interface with TailwindCSS

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: TailwindCSS
- **Data Table**: AG Grid Community (properly configured)
- **API Integration**: Ramp API via serverless functions
- **Authentication**: Custom auth system (SSO-ready)
- **Deployment**: Vercel
- **Export**: XLSX for Excel, CSV for spreadsheets

## 🚀 Quick Deploy

### Option 1: One-Click Deploy (Recommended)

1. Click the "Deploy with Vercel" button above
2. Connect your GitHub account
3. Set the required environment variables:
   - `RAMP_API_KEY`: Your Ramp API key
   - `NEXTAUTH_SECRET`: Random secret for session encryption
4. Deploy!

### Option 2: Manual Setup

1. **Fork this repository**
2. **Clone to your local machine**:
   ```bash
   git clone https://github.com/BambamBandit11/ramp-dashboard.git
   cd ramp-dashboard
   npm install
   ```
3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
4. **Deploy to Vercel**:
   ```bash
   npm i -g vercel
   vercel
   ```

## 🔧 Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|----------|
| `RAMP_API_KEY` | Your Ramp API key from [Ramp Developer Portal](https://developer.ramp.com) | Yes* | `ramp_live_...` |
| `NEXTAUTH_SECRET` | Secret for session encryption (generate with `openssl rand -base64 32`) | Yes | `your-secret-here` |
| `NEXTAUTH_URL` | Your app URL (auto-detected in production) | No | `https://your-app.vercel.app` |

*Note: The app will use mock data for development/demo if no API key is provided.

## 🎯 Getting Started

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   - Open [http://localhost:3000](http://localhost:3000)
   - Use demo credentials: `demo@company.com` / `demo123`

### Production Build

```bash
npm run build
npm start
```

## 📋 API Endpoints

The application includes these serverless API endpoints:

- `GET /api/ramp/transactions` - Fetch transactions with filtering
- `GET /api/ramp/cards` - Fetch company cards
- `GET /api/ramp/users` - Fetch users/employees
- `GET /api/ramp/export` - Export data as CSV/Excel

## 🔐 Authentication

### Current Implementation
- Simple email/password authentication
- Demo account: `demo@company.com` / `demo123`
- Session stored in localStorage
- Ready for SSO integration

### SSO Integration (Future)

The architecture supports easy integration with:
- **Okta**: Set `OKTA_CLIENT_ID`, `OKTA_CLIENT_SECRET`, `OKTA_DOMAIN`
- **Azure AD**: Set `AZURE_AD_CLIENT_ID`, `AZURE_AD_CLIENT_SECRET`, `AZURE_AD_TENANT_ID`
- **Google Workspace**: Standard OAuth2 flow
- **SAML**: Generic SAML provider support

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/ramp/          # Serverless API routes
│   ├── dashboard/         # Dashboard page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard-specific components
│   └── ui/               # Reusable UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and API clients
│   └── ag-grid-setup.ts  # AG Grid module registration
└── types/                # TypeScript type definitions
```

## 🎨 Key Components

### Dashboard Components
- **StatsCards**: Real-time metrics display
- **Filters**: Advanced filtering interface with expandable options
- **TransactionsTable**: AG Grid data table with custom renderers

### API Integration
- **rampApi**: Client-side API wrapper
- **rampServerClient**: Server-side Ramp API client with mock data fallback
- **useDashboardData**: Custom hook for data management

## 🔧 Customization

### Adding New Filters
1. Update `FilterOptions` type in `src/types/ramp.ts`
2. Add filter UI in `src/components/dashboard/filters.tsx`
3. Update API endpoints to handle new parameters

### Modifying Data Table
1. Update column definitions in `src/components/dashboard/transactions-table.tsx`
2. Add custom cell renderers as needed
3. Modify export functionality if new fields are added

### Styling
- Uses TailwindCSS for styling
- Custom components in `src/components/ui/`
- Modify `tailwind.config.js` for theme customization

## 🚀 Performance Features

- **Pagination**: AG Grid handles large datasets efficiently
- **Server-side Filtering**: Reduces data transfer
- **Proper Module Registration**: AG Grid setup prevents runtime errors
- **Bundle Optimization**: Tree-shaking enabled
- **SSR/Client Hydration**: Proper mounting prevents hydration mismatches

## 🔒 Security

- API key stored securely in environment variables
- Client-side API calls go through serverless functions
- Input validation on all API endpoints
- Authentication tokens with proper session management
- CORS policies and security headers

## 🐛 Troubleshooting

### Common Issues

**Build Failures**:
- ✅ Turbopack disabled for stability
- ✅ AG Grid modules properly registered
- Check environment variables are set
- Review build logs in Vercel dashboard

**API Errors**:
- Verify Ramp API key is valid and has proper permissions
- Check API rate limits
- Review serverless function logs in Vercel

**Authentication Issues**:
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches deployment URL
- Clear browser cache and cookies

## 📊 Monitoring

Recommended monitoring tools:
- **Vercel Analytics**: Built-in performance monitoring
- **Sentry**: Error tracking and performance monitoring
- **LogRocket**: User session recording
- **Custom Analytics**: Track feature usage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the [Issues](https://github.com/BambamBandit11/ramp-dashboard/issues) page
2. Create a new issue with detailed description
3. Include environment details and error messages

---

**Built with ❤️ for modern expense management**

**Status**: ✅ Production Ready | 🔧 AG Grid Fixed | 🚀 Vercel Deployable | 📊 Full Featured

**Live Demo**: [Coming Soon - Deploy to see your live dashboard!]