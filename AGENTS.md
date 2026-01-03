# SFS Revenue Analytics - AI Agent Guidelines

## Project Overview

Real-time revenue tracking, analytics, and optimization engine for the SmartFlow Systems ecosystem. This service provides centralized revenue monitoring across all SFS services, Stripe integration for subscription metrics, and intelligent optimization recommendations. Features in-memory analytics with production-ready patterns for database integration.

## Technology Stack

### Backend
- **Node.js 18+** with ES Modules
- **Express 4.21** for REST API
- **Stripe 16.12** for payment data integration

### Security & Performance
- **Helmet 8.1** for security headers
- **CORS 2.8** for cross-origin requests
- **Dotenv 16.6** for environment management

### Database Strategy
- **In-Memory Store:** Development and demo mode
- **Production Ready:** Prisma/PostgreSQL patterns documented
- **Redis Cache:** Recommended for production optimization

## Key Files & Directories

### Core Application
- `[server.js]` - Main Express server with analytics engine
  - Revenue tracking API
  - Stripe integration endpoints
  - Optimization recommendation engine
  - Health check endpoint
  - Status monitoring

### Configuration
- `[package.json]` - Dependencies and scripts
- `[.env.example]` - Environment variable template
- `[README.md]` - API documentation and integration guide

### Documentation
- `[README.md]` - Comprehensive API reference with examples

## Common Tasks

### Development Workflow

**Start Server:**
```bash
npm start
# Runs server.js on PORT 5000 (default)
```

**Development Mode:**
```bash
npm run dev
# Same as start, no hot-reload (add nodemon if needed)
```

**Build (No-op):**
```bash
npm run build
# Returns success immediately (no build needed)
```

**Test:**
```bash
npm test
# Currently returns "no tests configured"
# Add test suite as needed
```

### Revenue Tracking

**Track Revenue from Services:**
```bash
curl -X POST http://localhost:5000/api/analytics/revenue/track \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 99.99,
    "service": "sfs-marketing-and-growth",
    "customerId": "cust_123",
    "metadata": {}
  }'
```

**Get Dashboard Metrics:**
```bash
curl http://localhost:5000/api/analytics/dashboard
```

### Stripe Analytics

**Get Revenue Data:**
```bash
curl "http://localhost:5000/api/analytics/stripe/revenue?startDate=2025-01-01&endDate=2025-01-31"
```

**Get Subscription Metrics:**
```bash
curl http://localhost:5000/api/analytics/stripe/subscriptions
```

### Optimization Analysis

**Get Recommendations:**
```bash
curl http://localhost:5000/api/analytics/optimize
```

## Development Commands

```bash
# Installation
npm install                    # Install dependencies

# Server Management
npm start                      # Start server (production mode)
npm run dev                    # Start server (development mode)

# Utility
npm run build                  # No-op build command
npm test                       # Run tests (configure as needed)

# Health Check
curl http://localhost:5000/health
# Returns: {"ok":true}

# Status Check
curl http://localhost:5000/api/status
# Returns: Service info, uptime, analytics summary
```

## Integration Points

### SFS Service Integration

**Track Revenue from Any Service:**
```javascript
// In sfs-marketing-and-growth, SocialScaleBoosterAIbot, etc.
const trackRevenue = async (amount, customerId) => {
  await fetch('http://localhost:5000/api/analytics/revenue/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount,
      service: 'sfs-marketing-and-growth',
      customerId,
      metadata: { timestamp: new Date().toISOString() }
    })
  });
};

// After successful Stripe charge
stripe.charges.create({...}, async (err, charge) => {
  if (!err) {
    await trackRevenue(charge.amount / 100, charge.customer);
  }
});
```

**Display Analytics Dashboard:**
```javascript
const analytics = await fetch('http://localhost:5000/api/analytics/dashboard')
  .then(r => r.json());

console.log(`MRR: $${analytics.revenue.mrr}`);
console.log(`Growth: ${analytics.revenue.growth}`);
console.log(`Active Subscriptions: ${analytics.subscriptions.active}`);
```

### Supported SFS Services
- sfs-marketing-and-growth
- SFSDataQueryEngine
- SocialScaleBoosterAIbot
- Barber-booker-tempate-v1
- SocialScaleBooster
- DataScrapeInsights
- Any other SFS service with revenue

### Stripe Integration
- Real-time charge tracking
- Subscription metrics (active, MRR, ARR)
- Customer lifetime value (LTV)
- Churn rate analysis

### Database Integration (Production)

**With Prisma:**
```javascript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Store metrics
await prisma.revenueMetric.create({
  data: { amount, service, customerId, timestamp: new Date() }
});
```

**With Redis Cache:**
```javascript
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

await redis.set('analytics:mrr', currentMRR);
await redis.expire('analytics:mrr', 3600); // 1 hour cache
```

## Environment Variables

```env
# Server Configuration
PORT=5000                      # Server port

# Stripe Integration
STRIPE_SECRET_KEY=sk_test_...  # Stripe secret key (test or live)

# Runtime
NODE_ENV=production           # Environment mode

# Production Database (optional)
DATABASE_URL=postgresql://...  # PostgreSQL connection string
REDIS_URL=redis://...         # Redis cache connection
```

## API Endpoints

### Revenue Tracking
**POST `/api/analytics/revenue/track`**
- Track revenue from any SFS service
- Parameters: amount, service, customerId, metadata
- Response: Success confirmation with new total

### Dashboard Metrics
**GET `/api/analytics/dashboard`**
- Comprehensive analytics overview
- Returns: Revenue, subscriptions, customers
- Includes: MRR, growth rate, churn rate, LTV

### Stripe Revenue
**GET `/api/analytics/stripe/revenue`**
- Query parameters: startDate, endDate
- Returns: Total revenue, charge count, charge details
- Date format: YYYY-MM-DD

### Stripe Subscriptions
**GET `/api/analytics/stripe/subscriptions`**
- Returns: Active subscriptions, MRR, ARR
- Subscription details with customer info

### Optimization Recommendations
**GET `/api/analytics/optimize`**
- Automated business insights
- Returns: Categorized recommendations with priority
- Includes: Potential impact calculations

### Health & Status
**GET `/health`**
- Health check endpoint
- Returns: `{"ok":true}`

**GET `/api/status`**
- Service status and metadata
- Returns: Version, uptime, analytics summary

## Agent Best Practices

### File Operations
- **VERIFY** before modifying analytics calculation logic in `[server.js]`
- **UNDO** capability for all file changes
- **Show file paths** in brackets `[path/to/file]`
- **Preserve** Stripe integration logic

### Code Safety
- Bash scripts use `set -euo pipefail`
- Validate Stripe API key before making calls
- Handle Stripe API errors gracefully
- Never commit `.env` files with real API keys

### Analytics Accuracy
- Verify calculation logic for MRR, ARR, churn rate
- Test edge cases (zero revenue, negative growth)
- Validate date range calculations
- Ensure currency consistency (cents vs dollars)

### Stripe Integration
- Always use test keys in development
- Handle Stripe rate limits
- Implement retry logic for failed requests
- Cache Stripe responses when appropriate

### Performance Optimization
- Implement database storage for production
- Use Redis for caching frequent queries
- Paginate large result sets
- Index database queries properly

### Error Handling
- Return meaningful error messages
- Log errors for debugging
- Use appropriate HTTP status codes
- Handle Stripe webhook failures

## Metrics Calculated

| Metric | Calculation | Description |
|--------|-------------|-------------|
| **MRR** | Sum of monthly subscriptions | Monthly Recurring Revenue |
| **ARR** | MRR × 12 | Annual Recurring Revenue |
| **Churn Rate** | (Churned / Active) × 100 | % of customers lost |
| **Growth Rate** | ((Current - Previous) / Previous) × 100 | Month-over-month growth |
| **LTV** | Average revenue per customer lifetime | Customer Lifetime Value |

## Optimization Engine

### Automated Analysis

**Churn Rate Monitoring:**
- Flags churn > 5%
- Recommends retention strategies
- Calculates potential MRR impact

**Revenue Concentration:**
- Detects over-reliance on single service (>70%)
- Suggests diversification strategies
- Identifies underperforming services

**Growth Rate Analysis:**
- Alerts on low growth (<10%)
- Recommends marketing initiatives
- Projects potential MRR increase

**Customer LTV:**
- Identifies upsell opportunities
- Suggests pricing optimization
- Analyzes customer segments

### Recommendation Categories
- **Retention:** Customer churn reduction
- **Diversification:** Revenue stream optimization
- **Growth:** Marketing and expansion
- **Pricing:** Revenue optimization

### Priority Levels
- **High:** Immediate action recommended
- **Medium:** Important but not urgent
- **Low:** Nice-to-have improvements

## SmartFlow Standards

### Theme & Design
- Analytics dashboard should use brown/black/gold theme
- Consistent with SFS ecosystem branding
- Professional business intelligence aesthetic

### CI/CD
- **GitHub Actions:** Standard SFS workflows
- **Deployment:** Replit-ready configuration
- **Health Check:** `GET /health → {"ok":true}`

### API Standards
- RESTful endpoint design
- JSON responses
- Consistent error format
- Proper HTTP status codes

### Security
- Helmet.js security headers
- CORS configuration
- API key validation
- Input sanitization

## Production Deployment

### Database Migration

**From In-Memory to PostgreSQL:**
1. Set up Prisma schema for analytics tables
2. Migrate data storage to database
3. Update queries to use Prisma client
4. Test data persistence across restarts

**Schema Example:**
```prisma
model RevenueMetric {
  id         String   @id @default(cuid())
  amount     Float
  service    String
  customerId String
  metadata   Json?
  timestamp  DateTime @default(now())
}
```

### Caching Strategy

**Redis Implementation:**
- Cache dashboard metrics (1 hour TTL)
- Cache Stripe subscription data (30 minutes TTL)
- Invalidate on revenue tracking events
- Background refresh for stale data

### Monitoring

**Key Metrics to Monitor:**
- API response times
- Stripe API call volume
- Error rates
- Cache hit rates
- Database query performance

### Scaling Considerations
- Implement request queuing for high volume
- Use database read replicas for analytics queries
- Consider time-series database for metrics storage
- Implement data retention policies

## Integration Examples

### SFS Marketing & Growth
```javascript
// Track booking revenue
app.post('/api/bookings', async (req, res) => {
  const booking = await createBooking(req.body);

  // Track revenue
  await fetch('http://analytics:5000/api/analytics/revenue/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: booking.amount,
      service: 'sfs-marketing-and-growth',
      customerId: booking.customerId
    })
  });
});
```

### SocialScaleBoosterAIbot
```javascript
// Track subscription upgrade
app.post('/api/subscriptions/upgrade', async (req, res) => {
  const subscription = await upgradeSubscription(req.body);

  await trackRevenue(
    subscription.newAmount - subscription.oldAmount,
    subscription.customerId
  );
});
```

## Testing Strategy

**Unit Tests:**
- Test calculation logic for metrics
- Validate optimization algorithm
- Test edge cases (zero revenue, etc.)

**Integration Tests:**
- Test Stripe API integration
- Verify revenue tracking endpoint
- Test dashboard data aggregation

**Load Tests:**
- Simulate high-volume revenue tracking
- Test Stripe API rate limit handling
- Verify database performance

## Troubleshooting

**Common Issues:**
- **Stripe API errors:** Verify API key, check rate limits
- **Incorrect metrics:** Validate calculation logic, check data types
- **Performance issues:** Implement caching, optimize queries
- **Missing data:** Verify revenue tracking integration in services

## Support & Resources

**Stripe Documentation:**
- https://stripe.com/docs/api

**Revenue Metrics:**
- SaaS metrics best practices
- Churn rate benchmarks
- LTV calculation methods

**License:** MIT

**Organization:** SmartFlow Systems
