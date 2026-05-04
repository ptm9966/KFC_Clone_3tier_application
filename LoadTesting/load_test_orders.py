"""
Load Testing Script for KFC Clone Order Creation
Creates multiple test users and generates orders automatically
"""

import os
import requests
import json
import time
import random
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from typing import Dict, List, Optional
import statistics

# Configuration
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8080")
AUTH_ENDPOINT = f"{API_BASE_URL}/auth"
API_ENDPOINT = f"{API_BASE_URL}/api"
PRODUCTS_ENDPOINT = f"{API_ENDPOINT}/product"
ORDERS_ENDPOINT = f"{API_ENDPOINT}/orders"

# Load Testing Configuration
NUM_USERS = 5  # Number of test users to create
NUM_ORDERS_PER_USER = 3  # Number of orders each user will place
CONCURRENT_REQUESTS = 2  # Number of concurrent threads
PAYMENT_METHODS = ["Card", "UPI", "Cash"]
ORDER_STATUSES = ["Placed"]

# Metrics tracking
metrics_lock = threading.Lock()
metrics = {
    "total_requests": 0,
    "successful_orders": 0,
    "failed_orders": 0,
    "response_times": [],
    "errors": []
}


class LoadTester:
    def __init__(self, base_url: str = API_BASE_URL):
        self.base_url = base_url
        self.auth_url = f"{base_url}/auth"
        self.api_url = f"{base_url}/api"
        self.session = requests.Session()
        self.products: List[Dict] = []
        self.created_users: List[Dict] = []
        
    def get_products(self) -> List[Dict]:
        """Fetch available products from the API"""
        try:
            response = self.session.get(f"{self.api_url}/product")
            if response.status_code == 200:
                products = response.json()
                print(f"✓ Fetched {len(products)} products")
                return products[:10]  # Limit to first 10 products for variety
            else:
                print(f"✗ Failed to fetch products: {response.status_code}")
                return []
        except Exception as e:
            print(f"✗ Error fetching products: {e}")
            return []
    
    def create_user(self, user_number: int) -> Optional[Dict]:
        """Create a new test user"""
        mobile = f"989{user_number:07d}"  # Generate unique mobile number
        email = f"testuser{user_number}@loadtest.com"
        password = f"TestPass@{user_number}"
        name = f"LoadTest User {user_number}"
        
        payload = {
            "name": name,
            "email": email,
            "mobile": mobile,
            "password": password
        }
        
        try:
            response = self.session.post(
                f"{self.auth_url}/signup",
                json=payload,
                timeout=10
            )
            if response.status_code in [200, 201]:
                user_data = {
                    "id": None,
                    "mobile": mobile,
                    "password": password,
                    "name": name,
                    "email": email
                }
                print(f"✓ Created user: {name} (Mobile: {mobile})")
                return user_data
            else:
                print(f"✗ Failed to create user {user_number}: {response.status_code}")
                print(f"  Response: {response.text}")
                return None
        except Exception as e:
            print(f"✗ Error creating user {user_number}: {e}")
            return None
    
    def login_user(self, mobile: str, password: str) -> Optional[str]:
        """Login user and get token (user ID)"""
        payload = {
            "mobile": mobile,
            "password": password
        }
        
        try:
            response = self.session.post(
                f"{self.auth_url}/login",
                json=payload,
                timeout=10
            )
            if response.status_code == 200:
                token = response.json().get("token")
                return token
            else:
                print(f"✗ Login failed for {mobile}: {response.status_code}")
                return None
        except Exception as e:
            print(f"✗ Error logging in user {mobile}: {e}")
            return None
    
    def select_random_items(self, count: int = None) -> List[Dict]:
        """Select random items from available products"""
        if not self.products:
            return []
        
        if count is None:
            count = random.randint(1, 4)  # Random 1-4 items per order
        
        selected_items = []
        sampled_products = random.sample(
            self.products,
            min(count, len(self.products))
        )
        
        for product in sampled_products:
            qty = random.randint(1, 3)
            item = {
                "productId": product.get("_id", product.get("id")),
                "title": product.get("title", "Unknown Product"),
                "image": product.get("image", ""),
                "desc": product.get("desc", ""),
                "price": product.get("price", 0),
                "qty": qty
            }
            selected_items.append(item)
        
        return selected_items
    
    def calculate_order_totals(self, items: List[Dict]) -> tuple:
        """Calculate total items and total price"""
        total_items = sum(item.get("qty", 1) for item in items)
        total_price = sum(
            item.get("price", 0) * item.get("qty", 1) 
            for item in items
        )
        return total_items, total_price
    
    def create_order(self, user_id: str, user_name: str, user_mobile: str) -> Dict:
        """Create an order for a user"""
        start_time = time.time()
        
        items = self.select_random_items()
        if not items:
            return {
                "success": False,
                "error": "No items selected",
                "response_time": 0,
                "status_code": 0
            }
        
        total_items, total_price = self.calculate_order_totals(items)
        
        payload = {
            "userId": user_id,
            "userName": user_name,
            "userMobile": user_mobile,
            "items": items,
            "totalItems": total_items,
            "totalPrice": total_price,
            "paymentMethod": random.choice(PAYMENT_METHODS),
            "clearCart": False
        }
        
        try:
            response = self.session.post(
                f"{self.api_url}/orders",
                json=payload,
                timeout=15
            )
            
            response_time = time.time() - start_time
            
            result = {
                "success": response.status_code in [200, 201],
                "status_code": response.status_code,
                "response_time": response_time,
                "user_mobile": user_mobile,
                "total_items": total_items,
                "total_price": total_price
            }
            
            if result["success"]:
                result["order_data"] = response.json()
            else:
                result["error"] = response.text
            
            return result
            
        except Exception as e:
            response_time = time.time() - start_time
            return {
                "success": False,
                "error": str(e),
                "response_time": response_time,
                "status_code": 0
            }
    
    def prepare_test_users(self) -> List[Dict]:
        """Create and prepare test users"""
        print(f"\n{'='*60}")
        print(f"PREPARING {NUM_USERS} TEST USERS")
        print(f"{'='*60}")
        
        users = []
        for i in range(1, NUM_USERS + 1):
            user = self.create_user(i)
            if user:
                # Login to get token
                token = self.login_user(user["mobile"], user["password"])
                if token:
                    user["id"] = token
                    users.append(user)
                    print(f"  User {i}: Authenticated successfully")
                else:
                    print(f"  User {i}: Authentication failed")
            else:
                print(f"  User {i}: Creation failed")
            time.sleep(0.1)  # Small delay between user creation
        
        self.created_users = users
        print(f"\n✓ Total users prepared: {len(users)}/{NUM_USERS}")
        return users
    
    def run_load_test(self):
        """Execute the load test"""
        # Fetch products
        print(f"\n{'='*60}")
        print("FETCHING PRODUCTS")
        print(f"{'='*60}")
        self.products = self.get_products()
        
        if not self.products:
            print("✗ No products available for testing")
            return
        
        # Prepare test users
        users = self.prepare_test_users()
        if not users:
            print("✗ No users prepared for testing")
            return
        
        # Create orders
        print(f"\n{'='*60}")
        print("CREATING ORDERS - LOAD TEST IN PROGRESS")
        print(f"{'='*60}")
        
        # Generate order creation tasks
        tasks = []
        for user in users:
            for order_num in range(NUM_ORDERS_PER_USER):
                tasks.append({
                    "user_id": user["id"],
                    "user_name": user["name"],
                    "user_mobile": user["mobile"],
                    "order_num": order_num + 1,
                    "user_num": users.index(user) + 1
                })
        
        total_tasks = len(tasks)
        print(f"Total orders to create: {total_tasks}")
        print(f"Concurrent threads: {CONCURRENT_REQUESTS}\n")
        
        start_time = time.time()
        successful = 0
        failed = 0
        
        # Execute with thread pool
        with ThreadPoolExecutor(max_workers=CONCURRENT_REQUESTS) as executor:
            futures = []
            
            for task in tasks:
                future = executor.submit(self._execute_order_creation, task)
                futures.append(future)
            
            # Process results as they complete
            for future in as_completed(futures):
                result = future.result()
                
                with metrics_lock:
                    metrics["total_requests"] += 1
                    metrics["response_times"].append(result["response_time"])
                    
                    if result["success"]:
                        metrics["successful_orders"] += 1
                        successful += 1
                        status = "✓"
                    else:
                        metrics["failed_orders"] += 1
                        failed += 1
                        metrics["errors"].append(result)
                        status = "✗"
                
                # Print progress
                progress = metrics["total_requests"]
                percentage = (progress / total_tasks) * 100
                print(f"{status} [{progress:3d}/{total_tasks}] {percentage:5.1f}% - "
                      f"User: {result['user_mobile']} | "
                      f"Time: {result['response_time']:.3f}s | "
                      f"Status: {result['status_code']}")
        
        total_time = time.time() - start_time
        
        # Print summary report
        self.print_summary_report(total_time, successful, failed)
    
    def _execute_order_creation(self, task: Dict) -> Dict:
        """Helper method to execute order creation"""
        result = self.create_order(
            task["user_id"],
            task["user_name"],
            task["user_mobile"]
        )
        result["user_mobile"] = task["user_mobile"]
        return result
    
    def print_summary_report(self, total_time: float, successful: int, failed: int):
        """Print a detailed summary report"""
        print(f"\n{'='*60}")
        print("LOAD TEST SUMMARY REPORT")
        print(f"{'='*60}")
        
        total = successful + failed
        success_rate = (successful / total * 100) if total > 0 else 0
        
        print(f"\nTest Statistics:")
        print(f"  Total Requests: {total}")
        print(f"  Successful Orders: {successful}")
        print(f"  Failed Orders: {failed}")
        print(f"  Success Rate: {success_rate:.2f}%")
        print(f"  Total Duration: {total_time:.2f}s")
        print(f"  Requests/sec: {total/total_time:.2f}")
        
        if metrics["response_times"]:
            response_times = metrics["response_times"]
            print(f"\nResponse Time Statistics:")
            print(f"  Min: {min(response_times):.3f}s")
            print(f"  Max: {max(response_times):.3f}s")
            print(f"  Avg: {statistics.mean(response_times):.3f}s")
            print(f"  Median: {statistics.median(response_times):.3f}s")
            print(f"  Std Dev: {statistics.stdev(response_times):.3f}s" if len(response_times) > 1 else "")
        
        if metrics["errors"]:
            print(f"\nErrors ({len(metrics['errors'])}):")
            for i, error in enumerate(metrics["errors"][:5], 1):  # Show first 5 errors
                print(f"  {i}. {error.get('error', 'Unknown error')} "
                      f"(Status: {error.get('status_code')})")
            if len(metrics["errors"]) > 5:
                print(f"  ... and {len(metrics['errors']) - 5} more errors")
        
        print(f"\n{'='*60}")
        print(f"Report Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'='*60}\n")


def main():
    """Main execution function"""
    print("╔════════════════════════════════════════════════════════════╗")
    print("║       KFC Clone Load Testing - Order Creation              ║")
    print("╚════════════════════════════════════════════════════════════╝")
    
    print(f"\nConfiguration:")
    print(f"  API Base URL: {API_BASE_URL}")
    print(f"  Test Users: {NUM_USERS}")
    print(f"  Orders per User: {NUM_ORDERS_PER_USER}")
    print(f"  Total Orders: {NUM_USERS * NUM_ORDERS_PER_USER}")
    print(f"  Concurrent Threads: {CONCURRENT_REQUESTS}")
    
    tester = LoadTester(API_BASE_URL)
    
    try:
        tester.run_load_test()
    except KeyboardInterrupt:
        print("\n\n✗ Test interrupted by user")
    except Exception as e:
        print(f"\n✗ Error during load test: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
