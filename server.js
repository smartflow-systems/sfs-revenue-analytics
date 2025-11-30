import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// In-memory analytics store (use database in production)
const analytics = {
  revenue: {
    total: 0,
    monthly: {},
    byService: {}
  },
  subscriptions: {
    active: 0,
    churned: 0,
    mrr: 0
  },
  customers: {
    total: 0,
    new: 0,
    ltv: 0
  }
};

// ============================================================================
// REVENUE TRACKING
// ============================================================================

app.post('/api/analytics/revenue/track', async (req, res) => {
  try {
    const { amount, service, customerId, metadata } = req.body;

    analytics.revenue.total += amount;

    const month = new Date().toISOString().slice(0, 7);
    analytics.revenue.monthly[month] = (analytics.revenue.monthly[month] || 0) + amount;

    analytics.revenue.byService[service] = (analytics.revenue.byService[service] || 0) + amount;

    res.json({
      success: true,
      message: 'Revenue tracked successfully',
      newTotal: analytics.revenue.total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// METRICS DASHBOARD
// ============================================================================

app.get('/api/analytics/dashboard', async (req, res) => {
  try {
    // Calculate key metrics
    const currentMonth = new Date().toISOString().slice(0, 7);
    const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);

    const currentMRR = analytics.revenue.monthly[currentMonth] || 0;
    const lastMRR = analytics.revenue.monthly[lastMonth] || 0;
    const growth = lastMRR > 0 ? ((currentMRR - lastMRR) / lastMRR * 100).toFixed(2) : 0;

    res.json({
      revenue: {
        total: analytics.revenue.total,
        mrr: currentMRR,
        growth: `${growth}%`,
        byService: analytics.revenue.byService
      },
      subscriptions: {
        active: analytics.subscriptions.active,
        churned: analytics.subscriptions.churned,
        mrr: analytics.subscriptions.mrr,
        churnRate: analytics.subscriptions.active > 0
          ? (analytics.subscriptions.churned / analytics.subscriptions.active * 100).toFixed(2) + '%'
          : '0%'
      },
      customers: {
        total: analytics.customers.total,
        new: analytics.customers.new,
        ltv: analytics.customers.ltv
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// STRIPE INTEGRATION
// ============================================================================

app.get('/api/analytics/stripe/revenue', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const charges = await stripe.charges.list({
      created: {
        gte: startDate ? Math.floor(new Date(startDate).getTime() / 1000) : Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000),
        lte: endDate ? Math.floor(new Date(endDate).getTime() / 1000) : Math.floor(Date.now() / 1000)
      },
      limit: 100
    });

    const totalRevenue = charges.data
      .filter(charge => charge.paid)
      .reduce((sum, charge) => sum + charge.amount, 0) / 100;

    res.json({
      totalRevenue,
      chargeCount: charges.data.length,
      charges: charges.data.map(c => ({
        id: c.id,
        amount: c.amount / 100,
        currency: c.currency,
        created: new Date(c.created * 1000).toISOString(),
        customer: c.customer
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/analytics/stripe/subscriptions', async (req, res) => {
  try {
    const subscriptions = await stripe.subscriptions.list({
      status: 'active',
      limit: 100
    });

    const mrr = subscriptions.data.reduce((sum, sub) => {
      return sum + (sub.items.data[0]?.price?.unit_amount || 0) / 100;
    }, 0);

    res.json({
      activeSubscriptions: subscriptions.data.length,
      mrr,
      arr: mrr * 12,
      subscriptions: subscriptions.data.map(s => ({
        id: s.id,
        customer: s.customer,
        status: s.status,
        amount: (s.items.data[0]?.price?.unit_amount || 0) / 100,
        interval: s.items.data[0]?.price?.recurring?.interval,
        created: new Date(s.created * 1000).toISOString()
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// OPTIMIZATION RECOMMENDATIONS
// ============================================================================

app.get('/api/analytics/optimize', async (req, res) => {
  try {
    const recommendations = [];

    // Analyze churn rate
    const churnRate = analytics.subscriptions.active > 0
      ? (analytics.subscriptions.churned / analytics.subscriptions.active * 100)
      : 0;

    if (churnRate > 5) {
      recommendations.push({
        category: 'Retention',
        priority: 'high',
        issue: `High churn rate: ${churnRate.toFixed(2)}%`,
        recommendation: 'Implement customer feedback surveys and improve onboarding',
        potentialImpact: 'Reduce churn by 50% could increase MRR by $' + (analytics.subscriptions.mrr * 0.05).toFixed(2)
      });
    }

    // Analyze revenue distribution
    const services = Object.keys(analytics.revenue.byService);
    if (services.length > 0) {
      const topService = services.reduce((a, b) =>
        analytics.revenue.byService[a] > analytics.revenue.byService[b] ? a : b
      );
      const topServiceRevenue = analytics.revenue.byService[topService];
      const concentration = (topServiceRevenue / analytics.revenue.total * 100);

      if (concentration > 70) {
        recommendations.push({
          category: 'Diversification',
          priority: 'medium',
          issue: `${concentration.toFixed(0)}% of revenue from ${topService}`,
          recommendation: 'Invest in marketing for underperforming services',
          potentialImpact: 'Diversify revenue streams to reduce risk'
        });
      }
    }

    // Growth analysis
    const currentMonth = new Date().toISOString().slice(0, 7);
    const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);
    const growth = analytics.revenue.monthly[lastMonth] > 0
      ? ((analytics.revenue.monthly[currentMonth] - analytics.revenue.monthly[lastMonth]) / analytics.revenue.monthly[lastMonth] * 100)
      : 0;

    if (growth < 10) {
      recommendations.push({
        category: 'Growth',
        priority: 'high',
        issue: `Low growth rate: ${growth.toFixed(2)}%`,
        recommendation: 'Launch targeted marketing campaigns and referral programs',
        potentialImpact: 'Increase growth to 15% monthly could add $' + (analytics.subscriptions.mrr * 0.15).toFixed(2) + ' MRR'
      });
    }

    res.json({
      recommendations,
      summary: {
        totalRecommendations: recommendations.length,
        highPriority: recommendations.filter(r => r.priority === 'high').length,
        potentialMonthlyImpact: '$' + recommendations.reduce((sum, r) => {
          const match = r.potentialImpact.match(/\$(\d+\.?\d*)/);
          return sum + (match ? parseFloat(match[1]) : 0);
        }, 0).toFixed(2)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// HEALTH & STATUS
// ============================================================================

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/status', (req, res) => {
  res.json({
    service: 'SFS Revenue Analytics',
    version: '1.0.0',
    status: 'operational',
    uptime: process.uptime(),
    analytics: {
      totalRevenue: analytics.revenue.total,
      activeSubscriptions: analytics.subscriptions.active,
      totalCustomers: analytics.customers.total
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n════════════════════════════════════════════════════════════════`);
  console.log(`   SFS Revenue Analytics & Optimization Engine`);
  console.log(`   Running on port ${PORT}`);
  console.log(`════════════════════════════════════════════════════════════════\n`);
  console.log(`Endpoints:`);
  console.log(`  • POST   /api/analytics/revenue/track`);
  console.log(`  • GET    /api/analytics/dashboard`);
  console.log(`  • GET    /api/analytics/stripe/revenue`);
  console.log(`  • GET    /api/analytics/stripe/subscriptions`);
  console.log(`  • GET    /api/analytics/optimize`);
  console.log(`  • GET    /health`);
  console.log(`  • GET    /api/status\n`);
});
