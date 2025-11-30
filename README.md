# SFS Revenue Analytics & Optimization Engine

Real-time revenue tracking, analytics, and optimization recommendations for the SmartFlow Systems ecosystem.

## Features

### Revenue Tracking
- Track revenue across all SFS services
- Monthly recurring revenue (MRR) calculation
- Revenue breakdown by service
- Growth rate analysis

### Stripe Integration
- Real-time sync with Stripe
- Subscription metrics
- Annual recurring revenue (ARR)
- Customer lifetime value (LTV)

### Optimization Engine
- Automatic recommendations
- Churn analysis
- Revenue diversification insights
- Growth opportunity identification

## API Endpoints

### Revenue Tracking
```bash
POST /api/analytics/revenue/track
{
  "amount": 99.99,
  "service": "sfs-marketing-and-growth",
  "customerId": "cust_123",
  "metadata": {}
}
```

### Dashboard
```bash
GET /api/analytics/dashboard

Response:
{
  "revenue": {
    "total": 12500,
    "mrr": 3500,
    "growth": "15.5%",
    "byService": {
      "sfs-marketing-and-growth": 5000,
      "SFSDataQueryEngine": 3500,
      "SocialScaleBoosterAIbot": 2000,
      "Barber-booker-tempate-v1": 2000
    }
  },
  "subscriptions": {
    "active": 45,
    "churned": 3,
    "mrr": 3500,
    "churnRate": "6.67%"
  },
  "customers": {
    "total": 48,
    "new": 8,
    "ltv": 1250
  }
}
```

### Stripe Revenue
```bash
GET /api/analytics/stripe/revenue?startDate=2025-01-01&endDate=2025-01-31

Response:
{
  "totalRevenue": 12500,
  "chargeCount": 45,
  "charges": [...]
}
```

### Stripe Subscriptions
```bash
GET /api/analytics/stripe/subscriptions

Response:
{
  "activeSubscriptions": 45,
  "mrr": 3500,
  "arr": 42000,
  "subscriptions": [...]
}
```

### Optimization Recommendations
```bash
GET /api/analytics/optimize

Response:
{
  "recommendations": [
    {
      "category": "Retention",
      "priority": "high",
      "issue": "High churn rate: 8.5%",
      "recommendation": "Implement customer feedback surveys and improve onboarding",
      "potentialImpact": "Reduce churn by 50% could increase MRR by $175.00"
    },
    {
      "category": "Growth",
      "priority": "high",
      "issue": "Low growth rate: 5.2%",
      "recommendation": "Launch targeted marketing campaigns and referral programs",
      "potentialImpact": "Increase growth to 15% monthly could add $525.00 MRR"
    }
  ],
  "summary": {
    "totalRecommendations": 2,
    "highPriority": 2,
    "potentialMonthlyImpact": "$700.00"
  }
}
```

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Add your STRIPE_SECRET_KEY
```

3. **Start server:**
```bash
npm start
```

## Environment Variables

```env
PORT=5000
STRIPE_SECRET_KEY=sk_test_...
NODE_ENV=production
```

## Integration with SFS Services

### Track Revenue from Any Service

```javascript
// In your service (e.g., sfs-marketing-and-growth)
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

### Display Analytics Dashboard

```javascript
// Fetch analytics for dashboard
const analytics = await fetch('http://localhost:5000/api/analytics/dashboard')
  .then(r => r.json());

console.log(`MRR: $${analytics.revenue.mrr}`);
console.log(`Growth: ${analytics.revenue.growth}`);
console.log(`Active Subscriptions: ${analytics.subscriptions.active}`);
```

## Optimization Recommendations

The engine automatically analyzes:
- **Churn Rate:** Flags high churn and suggests retention strategies
- **Revenue Concentration:** Identifies over-reliance on single services
- **Growth Rate:** Recommends marketing when growth slows
- **Customer LTV:** Suggests upsell opportunities

## Metrics Calculated

| Metric | Calculation | Description |
|--------|-------------|-------------|
| MRR | Sum of monthly subscriptions | Monthly Recurring Revenue |
| ARR | MRR × 12 | Annual Recurring Revenue |
| Churn Rate | (Churned / Active) × 100 | % of customers lost |
| Growth Rate | ((Current - Previous) / Previous) × 100 | Month-over-month growth |
| LTV | Average revenue per customer lifetime | Customer Lifetime Value |

## Production Deployment

### With PostgreSQL
Replace in-memory storage with database:

```javascript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Store metrics
await prisma.revenueMetric.create({
  data: { amount, service, customerId, timestamp: new Date() }
});
```

### With Caching (Redis)
```javascript
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

await redis.set('analytics:mrr', currentMRR);
```

## License

MIT - SmartFlow Systems
