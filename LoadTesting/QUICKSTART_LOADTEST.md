# Load Testing Quick Reference

## 🚀 Get Started (30 seconds)

```bash
pip install -r requirements_loadtest.txt
python quickstart_loadtest.py
```

## 📋 Available Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `load_test_orders.py` | Main load test | `python load_test_orders.py` |
| `quickstart_loadtest.py` | Interactive runner | `python quickstart_loadtest.py` |
| `load_test_locust.py` | Distributed testing | `python quickstart_loadtest.py locust` |
| `load_test_config.py` | Configuration | Edit to customize parameters |

## 🎯 Quick Commands

### Pre-configured Scenarios
```bash
python quickstart_loadtest.py light      # 15 orders total
python quickstart_loadtest.py medium     # 100 orders total
python quickstart_loadtest.py heavy      # 500 orders total
python quickstart_loadtest.py stress     # 1500 orders total
```

### Direct Testing
```bash
# Edit these values in load_test_orders.py
NUM_USERS = 10              # Number of users
NUM_ORDERS_PER_USER = 5     # Orders per user
CONCURRENT_REQUESTS = 5     # Thread pool size

python load_test_orders.py
```

### Web-based Testing (Locust)
```bash
python quickstart_loadtest.py locust
# Open http://localhost:8089 in browser
# Set users and spawn rate, then start
```

## 📊 Output Metrics

- ✓ Total Requests & Success Rate
- ✓ Response Time (Min, Max, Avg, Median, Std Dev)
- ✓ Throughput (Requests/sec)
- ✓ Error Count & Types
- ✓ Per-user details with timestamps

## 🔧 Configuration Parameters

```python
# In load_test_orders.py (top section)

API_BASE_URL = "http://localhost:8080"  # API endpoint
NUM_USERS = 10                          # Test users to create
NUM_ORDERS_PER_USER = 5                 # Orders per user
CONCURRENT_REQUESTS = 5                 # Thread pool size
PAYMENT_METHODS = ["Card", "UPI", "Cash"]
```

## ✅ Prerequisites

- ✓ Backend API running: `http://localhost:8080`
- ✓ MongoDB connected and running
- ✓ Python 3.7+
- ✓ Dependencies installed: `pip install -r requirements_loadtest.txt`

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Connection refused | Start backend: `cd Backend && npm start` |
| MongoDB error | Start MongoDB: `mongod` |
| User exists error | Wait 5 mins or clear test users from DB |
| Timeout errors | Reduce CONCURRENT_REQUESTS |
| Out of memory | Reduce NUM_USERS or NUM_ORDERS_PER_USER |

## 📚 Full Documentation

See [LOAD_TESTING_GUIDE.md](LOAD_TESTING_GUIDE.md) for:
- Detailed configuration options
- Advanced scenarios & customization
- Performance tips & best practices
- Results analysis & comparison
- Common issues & solutions

---

**Test Scenarios Overview:**

| Scenario | Users | Orders/User | Total | Concurrent |
|----------|-------|------------|-------|-----------|
| Light | 5 | 3 | 15 | 2 |
| Medium | 20 | 5 | 100 | 10 |
| Heavy | 50 | 10 | 500 | 20 |
| Stress | 100 | 15 | 1500 | 30 |
