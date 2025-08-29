# 🚀 Ramp Dashboard - Enterprise Expense Management

A lightweight, enterprise-ready web application dashboard with direct Ramp API integration. Built with Next.js, React, TypeScript, and TailwindCSS.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/BambamBandit11/ramp-dashboard)

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
- 🧪 **Demo Mode**: Works with mock data when no API credentials are provided

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: TailwindCSS
- **Data Table**: AG Grid Community (properly configured)
- **API Integration**: Ramp API via OAuth 2.0 Client Credentials
- **Authentication**: Custom auth system (SSO-ready)
- **Deployment**: Vercel
- **Export**: XLSX for Excel, CSV for spreadsheets

## 🚀 Quick Deploy

### Option 1: Demo Mode (Recommended for Testing)

1. Click the "Deploy with Vercel" button above
2. Connect your GitHub account
3. **When prompted for environment variables, add these**:
   - `RAMP_CLIENT_ID`: Leave empty or type `demo`
   - `RAMP_CLIENT_SECRET`: Leave empty or type `demo`
   - `RAMP_ENVIRONMENT`: `sandbox`
   - `NEXTAUTH_SECRET`: Type any random text like `my-demo-secret-123`
4. Deploy!
5. Login with `demo@company.com` / `demo123`

### Option 2: Production Mode (Real Ramp Data)

1. **Set up your Ramp Developer App**:
   - Go to your Ramp account → Developer API
   - Create a new app or use existing one
   - Enable "Client Credentials" grant type
   - Add scopes: `transactions:read`, `users:read`, `cards:read`, `business:read`
   - Copy your Client ID and Client Secret

2. **Deploy to Vercel**:
   - Click the "Deploy with Vercel" button above
   - **Set environment variables**:
     - `RAMP_CLIENT_ID`: Your actual Ramp Client ID (starts with `ramp_id_`)
     - `RAMP_CLIENT_SECRET`: Your actual Ramp Client Secret (starts with `ramp_sec_`)
     - `RAMP_ENVIRONMENT`: `production`
     - `NEXTAUTH_SECRET`: A secure random string (32+ characters)
   - Deploy!

## 🔧 Environment Variables

| Variable | Demo Mode | Production Mode | Required |
|----------|-----------|-----------------|----------|
| `RAMP_CLIENT_ID` | Leave empty or `demo` | Your actual Ramp Client ID | No* |
| `RAMP_CLIENT_SECRET` | Leave empty or `demo` | Your actual Ramp Client Secret | No* |
| `RAMP_ENVIRONMENT` | `sandbox` | `production` | No |
| `NEXTAUTH_SECRET` | Any random text | Secure random string | Yes |
| `NEXTAUTH_URL` | Auto-detected | Your domain URL | No |

*App automatically uses mock data when no valid credentials are provided.

## 🎯 Getting Started

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Ramp credentials
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

## 🔐 Ramp API Setup

### Required Permissions
- Your Ramp account must have **ADMIN** or **IT_ADMIN** role
- Regular users cannot create apps or generate tokens

### Setting Up Your Developer App

1. **Access Developer Console**:
   - Press CMD + K in Ramp and select "Developer API"
   - Or go to Settings → Developer API

2. **Create New App**:
   - Click "Create New App"
   - Name your app (e.g., "Expense Dashboard")
   - Accept terms and click "Create"

3. **Configure Grant Types**:
   - Under "Grant types", click "Add new grant type"
   - Select "Client Credentials"

4. **Configure Scopes**:
   - Click "Configure allowed scopes"
   - Select these scopes:
     - `transactions:read` - View transaction data
     - `users:read` - View employee data
     - `cards:read` - View card information
     - `business:read` - View company information

5. **Get Credentials**:
   - Copy your **Client ID** (starts with `ramp_id_`)
   - Copy your **Client Secret** (starts with `ramp_sec_`)

### Authentication Flow

The dashboard uses OAuth 2.0 Client Credentials flow:
1. **Token Request**: Exchanges Client ID/Secret for access token
2. **API Calls**: Uses Bearer token for all API requests
3. **Token Refresh**: Automatically refreshes tokens (~10 day expiry)

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
│   └── ramp-server.ts    # OAuth-enabled Ramp API client
└── types/                # TypeScript type definitions
```

## 🎨 Key Components

### Dashboard Components
- **StatsCards**: Real-time metrics display
- **Filters**: Advanced filtering interface with expandable options
- **TransactionsTable**: AG Grid data table with custom renderers

### API Integration
- **rampApi**: Client-side API wrapper
- **rampServerClient**: Server-side OAuth-enabled Ramp API client
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

- **OAuth Token Caching**: Tokens cached and auto-refreshed
- **Pagination**: AG Grid handles large datasets efficiently
- **Server-side Filtering**: Reduces data transfer
- **Proper Module Registration**: AG Grid setup prevents runtime errors
- **Bundle Optimization**: Tree-shaking enabled
- **SSR/Client Hydration**: Proper mounting prevents hydration mismatches
- **Automatic Mock Data**: Seamless fallback when API is unavailable

## 🔒 Security

- OAuth 2.0 Client Credentials flow
- Client credentials stored securely in environment variables
- Access tokens cached server-side only
- Client-side API calls go through serverless functions
- Input validation on all API endpoints
- Authentication tokens with proper session management
- CORS policies and security headers

## 🐛 Troubleshooting

### Common Issues

**Demo Mode Not Working**:
- ✅ Leave `RAMP_CLIENT_ID` and `RAMP_CLIENT_SECRET` empty in Vercel
- ✅ Check browser console for "Using mock data" messages
- ✅ Ensure you're using `demo@company.com` / `demo123` to login

**Authentication Errors**:
- ✅ Verify your Ramp app has "Client Credentials" grant type enabled
- ✅ Check that required scopes are configured in your Ramp app
- ✅ Ensure you have ADMIN or IT_ADMIN role in Ramp
- ✅ Verify Client ID starts with `ramp_id_` and Secret starts with `ramp_sec_`

**API Errors**:
- ✅ Check Vercel function logs for detailed error messages
- ✅ Verify your Ramp account has access to the data you're requesting
- ✅ Ensure your app's scopes match the data you're trying to access

**Build Failures**:
- ✅ Check environment variables are set correctly in Vercel
- ✅ Review build logs in Vercel dashboard
- ✅ Ensure all required environment variables are present

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
4. For Ramp API issues, contact `developer-support@ramp.com`

---

**Built with ❤️ for modern expense management**

**Status**: ✅ Production Ready | 🔧 OAuth Enabled | 🚀 Vercel Deployable | 📊 Full Featured | 🧪 Demo Mode Ready

**Live Demo**: Deploy now to see your dashboard with real Ramp data!