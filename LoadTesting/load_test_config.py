"""
Advanced Load Testing Configuration
Edit this file to customize the load testing parameters
"""

# API Configuration
API_BASE_URL = "http://localhost:8080"

# Load Test Parameters
NUM_USERS = 10                    # Number of unique test users to create
NUM_ORDERS_PER_USER = 5           # Orders each user will place
CONCURRENT_REQUESTS = 5           # Number of concurrent threads

# Random configuration
ITEMS_PER_ORDER = (1, 4)          # Random range: min, max items per order
QUANTITY_RANGE = (1, 3)           # Random range: min, max quantity per item
PAYMENT_METHODS = ["Card", "UPI", "Cash"]  # Available payment methods

# Delay configuration (in seconds)
DELAY_BETWEEN_USER_CREATION = 0.1  # Delay between user signup requests
DELAY_BETWEEN_ORDERS = 0.0         # Delay between order creation requests

# Timeout configuration (in seconds)
REQUEST_TIMEOUT = 15              # HTTP request timeout

# Logging
VERBOSE_MODE = True               # Print detailed logs
SAVE_RESULTS = True               # Save test results to file
RESULTS_FILE = "load_test_results.json"  # Output file for results

# Test Data Prefix
USER_PREFIX = "loadtest"           # Prefix for test user emails
USER_PHONE_PREFIX = "989"          # Prefix for test user phone numbers
