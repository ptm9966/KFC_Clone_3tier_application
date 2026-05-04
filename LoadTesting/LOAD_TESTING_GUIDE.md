# KFC Clone Load Testing Guide

Load testing scripts for automated order creation testing with multiple concurrent users.

## Overview

This package contains three load testing scripts:

1. **load_test_orders.py** - Main standalone load testing script with threading
2. **load_test_locust.py** - Advanced load testing using Locust framework
3. **load_test_config.py** - Configuration file for customization

## Prerequisites

- Python 3.7+
- Running KFC Clone Backend API (http://localhost:8080)
- MongoDB running and connected

## Installation

1. Install dependencies:
```bash
pip install -r requirements_loadtest.txt
```

## Usage

### Option 1: Simple Load Test (Recommended for Quick Testing)

```bash
python load_test_orders.py
```

**Features:**
- Creates multiple test users
- Performs concurrent order creation
- Detailed performance metrics
- Easy to understand output
- Single-threaded test execution

### Option 2: Advanced Locust Load Test

```bash
locust -f load_test_locust.py --host=http://localhost:8080
```

Then open: http://localhost:8089 in your browser

**Features:**
- Web-based interface for test control
- Real-time metrics and charts
- Distributed load testing capability
- Customizable number of users and spawn rate
- Better visualization of results

### Option 3: Headless Locust Test

```bash
locust -f load_test_locust.py --host=http://localhost:8080 \
  --users 50 --spawn-rate 5 --run-time 5m --headless
```

## Configuration

### Edit load_test_config.py

```python
# API Configuration
API_BASE_URL = "http://localhost:8080"

# Load Test Parameters
NUM_USERS = 10                    # Number of test users to create
NUM_ORDERS_PER_USER = 5           # Orders per user
CONCURRENT_REQUESTS = 5           # Thread pool size

# Test data
ITEMS_PER_ORDER = (1, 4)          # Min-max items per order
QUANTITY_RANGE = (1, 3)           # Min-max quantity per item
PAYMENT_METHODS = ["Card", "UPI", "Cash"]
```

### Modify load_test_orders.py directly (if needed)

Edit the configuration section at the top:

```python
# Configuration
API_BASE_URL = "http://localhost:8080"
NUM_USERS = 10              # Number of test users
NUM_ORDERS_PER_USER = 5     # Orders each user places
CONCURRENT_REQUESTS = 5     # Concurrent threads
```

## Understanding Test Parameters

- **NUM_USERS**: Total number of unique test users to create
  - Lower = less API calls, faster test
  - Higher = better load simulation
  
- **NUM_ORDERS_PER_USER**: How many orders each user places
  - Total orders = NUM_USERS × NUM_ORDERS_PER_USER
  
- **CONCURRENT_REQUESTS**: Number of simultaneous thread workers
  - Higher = more concurrent load
  - Recommended: 5-20 for most systems

## Output & Metrics

### Console Output Example

```
✓ [001/050] 2.0% - User: 9890000001 | Time: 0.432s | Status: 201
✓ [002/050] 4.0% - User: 9890000002 | Time: 0.389s | Status: 201
✗ [003/050] 6.0% - User: 9890000003 | Time: 5.021s | Status: 500
...

============================================================
LOAD TEST SUMMARY REPORT
============================================================

Test Statistics:
  Total Requests: 50
  Successful Orders: 48
  Failed Orders: 2
  Success Rate: 96.00%
  Total Duration: 12.45s
  Requests/sec: 4.02

Response Time Statistics:
  Min: 0.123s
  Max: 5.021s
  Avg: 0.456s
  Median: 0.389s
  Std Dev: 0.789s
```

### Key Metrics Explained

| Metric | Meaning |
|--------|---------|
| Success Rate | % of orders created successfully |
| Requests/sec | Throughput (orders per second) |
| Response Time (Min) | Fastest request |
| Response Time (Avg) | Average response time |
| Response Time (Max) | Slowest request (may indicate timeout) |

## API Flow Tested

1. **User Signup** - Create unique test user
2. **User Login** - Authenticate and get token
3. **Fetch Products** - Get available products
4. **Create Order** - Submit order with random items

```
User Signup → User Login → Get Products → Create Order → Repeat
```

## Load Testing Scenarios

### Scenario 1: Light Load (Default)
```python
NUM_USERS = 5
NUM_ORDERS_PER_USER = 3
CONCURRENT_REQUESTS = 2
# Total: 15 orders, very gentle load
```

### Scenario 2: Medium Load
```python
NUM_USERS = 20
NUM_ORDERS_PER_USER = 5
CONCURRENT_REQUESTS = 10
# Total: 100 orders, moderate load
```

### Scenario 3: Heavy Load
```python
NUM_USERS = 50
NUM_ORDERS_PER_USER = 10
CONCURRENT_REQUESTS = 20
# Total: 500 orders, significant load
```

### Scenario 4: Stress Test
```python
NUM_USERS = 100
NUM_ORDERS_PER_USER = 20
CONCURRENT_REQUESTS = 30
# Total: 2000 orders, heavy stress
```

## Troubleshooting

### Connection Refused
```
Error: Failed to connect to http://localhost:8080
```
**Solution:** Ensure backend is running:
```bash
cd Backend
npm start
```

### MongoDB Connection Error
```
Error: connect ECONNREFUSED
```
**Solution:** Start MongoDB
```bash
mongod
```

### Too Many Users Error
```
"User with email already exists"
```
**Solution:** Wait a few minutes for previous test users to become available, or clear test users from database:
```javascript
db.users.deleteMany({email: /loadtest/})
```

### Timeout Errors
```
RequestTimeout: Connection timeout
```
**Solution:** 
- Increase REQUEST_TIMEOUT in config
- Reduce CONCURRENT_REQUESTS
- Check server performance

### Out of Memory
```
MemoryError or Process killed
```
**Solution:**
- Reduce NUM_USERS
- Reduce NUM_ORDERS_PER_USER
- Run on machine with more RAM

## Performance Tips

1. **Use Locust for distributed testing** - Better scaling
2. **Monitor API server** - Watch CPU, memory, database
3. **Increase gradually** - Start low, increase parameters slowly
4. **Check database indexes** - Ensure queries are optimized
5. **Use cache** - Implement caching for products endpoint

## Advanced: Custom Test Modifications

### Add Custom Logic

Edit `load_test_orders.py`:

```python
def create_order(self, user_id, user_name, user_mobile):
    # Add custom validation
    if not self.validate_order_data(user_id):
        return {"success": False, "error": "Validation failed"}
    
    # Add custom retry logic
    for attempt in range(3):
        result = self._create_order_with_retry(user_id, user_name, user_mobile)
        if result["success"]:
            return result
    
    return {"success": False, "error": "Max retries exceeded"}
```

### Add Database Verification

```python
# After order creation
def verify_order_in_db(self, user_id):
    # Query database to verify order was actually created
    # Useful for detecting silent failures
    pass
```

## Results Analysis

### Save Results to File

Modify `load_test_orders.py` to add:

```python
def save_results(self, filename="results.json"):
    with open(filename, 'w') as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "metrics": metrics,
            "configuration": {
                "NUM_USERS": NUM_USERS,
                "NUM_ORDERS_PER_USER": NUM_ORDERS_PER_USER,
                "CONCURRENT_REQUESTS": CONCURRENT_REQUESTS
            }
        }, f, indent=2)
```

### Compare Multiple Test Runs

```bash
# Run test and capture output
python load_test_orders.py > test_run_1.txt

# Modify parameters and run again
python load_test_orders.py > test_run_2.txt

# Compare results
diff test_run_1.txt test_run_2.txt
```

## Best Practices

✅ **Do:**
- Start with small numbers and increase gradually
- Monitor server during tests
- Test during off-peak hours
- Document test configuration and results
- Use version control for scripts

❌ **Don't:**
- Run against production systems without permission
- Leave high concurrent loads running unattended
- Ignore server warnings
- Use unrealistic data volumes
- Skip database backups before testing

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Token expired | Check login endpoint |
| 400 Bad Request | Invalid payload | Verify order schema |
| 503 Service Unavailable | Server overloaded | Reduce CONCURRENT_REQUESTS |
| Connection timeout | Network issue | Increase REQUEST_TIMEOUT |
| Memory leak | Long-running test | Add cleanup code |

## Contact & Support

For issues or improvements, check the backend logs:

```bash
# Backend logs (if using Docker)
docker logs kfc_backend

# Or check directly in Node
# Logs printed to console
```

## Performance Benchmarks

### Expected Performance (Single Thread, Local Setup)

| Configuration | Orders/sec | Avg Response | Success % |
|---|---|---|---|
| 5 users, 5 orders | ~2-3 | 0.4s | 98% |
| 20 users, 5 orders | ~4-6 | 0.6s | 96% |
| 50 users, 10 orders | ~8-12 | 0.9s | 94% |

*Results vary based on hardware and network*

---

**Last Updated:** 2024
**Version:** 1.0
