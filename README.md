# Ramp Dashboard

A lightweight, enterprise-ready web application dashboard with direct Ramp API integration. Built with Next.js, React, TypeScript, and TailwindCSS.

## Features

- 🔄 **Live Data View**: Real-time transaction data with on-demand refresh
- 🔍 **Advanced Filtering**: Filter by employee, category, date range, amount, department, and status
- 📊 **Interactive Data Table**: Powered by AG Grid with sorting, filtering, and pagination
- 📈 **Dashboard Statistics**: Key metrics and insights at a glance
- 📤 **Data Export**: Export filtered datasets to CSV or Excel formats
- 🔐 **Authentication Ready**: Simple auth with SSO-ready architecture
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- ⚡ **Serverless Functions**: Secure Ramp API integration via Vercel functions

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: TailwindCSS
- **Data Table**: AG Grid Community (with proper module registration)
- **API Integration**: Ramp API via serverless functions
- **Authentication**: Custom auth system (SSO-ready)
- **Deployment**: Vercel
- **Export**: XLSX for Excel, CSV for spreadsheets

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Ramp API key (get from [Ramp Developer Portal](https://developer.ramp.com))
- Vercel account for deployment

### Local Development

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd ramp-dashboard
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Ramp API key:
   ```env
   RAMP_API_KEY=your_actual_ramp_api_key_here
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   - Open [http://localhost:3000](http://localhost:3000)
   - Use demo credentials: `demo@company.com` / `demo123`

## Deployment to Vercel

### Option 1: Deploy Button (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/ramp-dashboard&env=RAMP_API_KEY,NEXTAUTH_SECRET&envDescription=Required%20environment%20variables&envLink=https://github.com/yourusername/ramp-dashboard%23environment-variables)

### Option 2: Manual Deployment

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Set environment variables** in Vercel dashboard:
   - `RAMP_API_KEY`: Your Ramp API key
   - `NEXTAUTH_SECRET`: Random secret for session encryption
   - `NEXTAUTH_URL`: Your production URL

### Option 3: GitHub Integration

1. Push code to GitHub repository
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

## Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|----------|
| `RAMP_API_KEY` | Your Ramp API key | Yes | `ramp_live_...` |
| `NEXTAUTH_SECRET` | Secret for session encryption | Yes | `random-secret-string` |
| `NEXTAUTH_URL` | Your app URL | Production | `https://your-app.vercel.app` |

## API Endpoints

The application includes the following serverless API endpoints:

- `GET /api/ramp/transactions` - Fetch transactions with filtering
- `GET /api/ramp/cards` - Fetch company cards
- `GET /api/ramp/users` - Fetch users/employees
- `GET /api/ramp/export` - Export data as CSV/Excel

## Authentication

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

## Project Structure

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

## Key Components

### Dashboard Components
- **StatsCards**: Key metrics display
- **Filters**: Advanced filtering interface
- **TransactionsTable**: AG Grid data table with proper module registration

### API Integration
- **rampApi**: Client-side API wrapper
- **rampServerClient**: Server-side Ramp API client
- **useDashboardData**: Custom hook for data management

## AG Grid Setup

The application properly registers AG Grid Community modules to avoid console errors:

```typescript
// src/lib/ag-grid-setup.ts
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);
```

This setup is automatically imported in the root layout to ensure modules are registered before any grid components are used.

## Customization

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

## Performance Considerations

- **Pagination**: AG Grid handles large datasets efficiently
- **Filtering**: Server-side filtering reduces data transfer
- **Caching**: Consider adding React Query for API caching
- **Bundle Size**: Tree-shaking enabled, only imports used components
- **Module Registration**: Proper AG Grid setup prevents runtime errors

## Security

- API key stored securely in environment variables
- Client-side API calls go through serverless functions
- Authentication tokens stored in localStorage (consider httpOnly cookies for production)
- Input validation on all API endpoints

## Troubleshooting

### Common Issues

**AG Grid Console Errors**:
- ✅ **Fixed**: Module registration is properly configured
- All community features are available via `AllCommunityModule`

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

## Monitoring and Analytics

Consider adding:
- **Vercel Analytics**: Built-in performance monitoring
- **Sentry**: Error tracking and performance monitoring
- **LogRocket**: User session recording
- **Custom Analytics**: Track feature usage

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the [Issues](https://github.com/yourusername/ramp-dashboard/issues) page
2. Create a new issue with detailed description
3. Include environment details and error messages

---

**Built with ❤️ for modern expense management**

**Status**: ✅ Production Ready | 🔧 AG Grid Fixed | 🚀 Vercel Deployable