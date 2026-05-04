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

Edit parameters in `load_test_orders.py`:

```python
NUM_USERS = 10              # Number of test users
NUM_ORDERS_PER_USER = 5     # Orders per user
CONCURRENT_REQUESTS = 5     # Thread pool size
```

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
