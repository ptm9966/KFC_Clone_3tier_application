# LoadTesting Folder

This folder contains all load testing scripts and documentation for the KFC Clone application.

## 📁 Contents

### Scripts
- **load_test_orders.py** - Main load testing script with threading-based concurrent order creation
- **load_test_locust.py** - Advanced distributed load testing using Locust framework
- **quickstart_loadtest.py** - Interactive quick-start helper with pre-configured scenarios
- **load_test_config.py** - Centralized configuration file for customizing test parameters

### Configuration
- **requirements_loadtest.txt** - Python dependencies (requests, locust)

### Documentation
- **LOAD_TESTING_GUIDE.md** - Comprehensive guide with detailed instructions
- **QUICKSTART_LOADTEST.md** - Quick reference guide for fast setup
- **README.md** - This file

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   pip install -r requirements_loadtest.txt
   ```

2. **Run interactive test:**
   ```bash
   python quickstart_loadtest.py
   ```

3. **Or run directly:**
   ```bash
   python load_test_orders.py
   ```

## 📊 Features

✅ Multiple concurrent test users  
✅ Full API flow testing (signup → login → orders)  
✅ Real-time performance metrics  
✅ Configurable load scenarios  
✅ Detailed error reporting  
✅ Web-based UI option (Locust)  

## 🎯 Test Scenarios

| Scenario | Users | Orders | Total | Command |
|----------|-------|--------|-------|---------|
| Light | 5 | 3 | 15 | `python quickstart_loadtest.py light` |
| Medium | 20 | 5 | 100 | `python quickstart_loadtest.py medium` |
| Heavy | 50 | 10 | 500 | `python quickstart_loadtest.py heavy` |
| Stress | 100 | 15 | 1500 | `python quickstart_loadtest.py stress` |

## 📚 Documentation

- **[LOAD_TESTING_GUIDE.md](LOAD_TESTING_GUIDE.md)** - Full guide with troubleshooting and best practices
- **[QUICKSTART_LOADTEST.md](QUICKSTART_LOADTEST.md)** - Quick reference for common tasks

## ⚙️ Configuration

Edit parameters in `load_test_config.py` or use environment variables:

```powershell
# PowerShell example
$env:API_BASE_URL = "https://bikkam.online"
$env:LOAD_TEST_USERS = "10"
$env:LOAD_TEST_ORDERS_PER_USER = "5"
$env:LOAD_TEST_CONCURRENCY = "5"
python load_test_orders.py
```

Or edit `load_test_config.py`:

```python
NUM_USERS = 10              # Number of test users
NUM_ORDERS_PER_USER = 5     # Orders per user
CONCURRENT_REQUESTS = 5     # Thread pool size
API_BASE_URL = "http://localhost:8080"
```

See [LOAD_TESTING_GUIDE.md](LOAD_TESTING_GUIDE.md#configuration) for full configuration details.

## 👤 Test Credentials

After running a load test, you can manually verify orders using the generated test users. Credentials follow this pattern:

**Mobile Number Format:**
```
989 + 7-digit offset number
```

**Password Format:**
```
TestPass@<user_number>
```

**Email Format:**
```
testuser<user_number>@loadtest.com
```

### Example Credentials

For the first test user with default offset:
- **Mobile:** `9890000001`
- **Password:** `TestPass@1`
- **Email:** `testuser1@loadtest.com`

For user #10 with offset 1,000,000:
- **Mobile:** `9891000010`
- **Password:** `TestPass@1000010`
- **Email:** `testuser1000010@loadtest.com`

**Note:** Check the console output during test execution to see actual mobile numbers printed, as they depend on the `LOAD_TEST_USER_OFFSET` environment variable.

## 🔐 Admin Credentials

Use these credentials to access the admin dashboard and manage products/orders:

**Admin Mobile:** `0123456789`

### To Create Admin User

1. Sign up with:
   - Mobile: `0123456789`
   - Email: `admin@kfc.com`
   - Password: `Admin@123`
   - Name: `Admin`

2. Login with:
   - Mobile: `0123456789`
   - Password: `Admin@123`

### Admin Features

Once logged in as admin, you can:
- ✅ View all orders from `/admin` dashboard
- ✅ Add products: `POST /api/products`
- ✅ Update products: `PUT /api/products/:id`
- ✅ Delete products: `DELETE /api/products/:id`

**Note:** Any user registered with mobile number `0123456789` automatically receives admin access.

## ✅ Requirements

- Python 3.7+
- Backend running at http://localhost:8080
- MongoDB connected and running
- Dependencies: `pip install -r requirements_loadtest.txt`

## 🔗 Related Files

From the parent directory:
- **Backend/** - API server
- **Frontend/** - React application
- **docker-compose.yml** - Container orchestration

---

For detailed instructions, see [LOAD_TESTING_GUIDE.md](LOAD_TESTING_GUIDE.md)
