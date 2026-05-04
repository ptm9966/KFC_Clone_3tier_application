"""
Advanced Load Testing Script using Locust
For distributed load testing with better performance insights
"""

from locust import HttpUser, TaskSet, task, between
import random
import json
from datetime import datetime

# Configuration
BASE_API_URL = "/api"
BASE_AUTH_URL = "/auth"
PRODUCTS = []
TEST_USERS = {}


class OrderLoadTestTasks(TaskSet):
    """Define tasks for load testing order creation"""
    
    def on_start(self):
        """Called when a simulated user starts"""
        self.user_token = None
        self.products = []
        self.user_mobile = None
        self.user_name = None
        self.setup_user()
    
    def setup_user(self):
        """Create and authenticate a test user"""
        # Generate unique user credentials
        user_num = random.randint(10000, 99999)
        self.user_mobile = f"989{user_num}"
        self.user_name = f"LoadTest User {user_num}"
        email = f"loadtest{user_num}@test.com"
        password = f"TestPass@{user_num}"
        
        # Signup
        response = self.client.post(
            f"{BASE_AUTH_URL}/signup",
            json={
                "name": self.user_name,
                "email": email,
                "mobile": self.user_mobile,
                "password": password
            },
            catch_response=True
        )
        
        if response.status_code in [200, 201]:
            response.success()
            
            # Login
            login_response = self.client.post(
                f"{BASE_AUTH_URL}/login",
                json={
                    "mobile": self.user_mobile,
                    "password": password
                },
                catch_response=True
            )
            
            if login_response.status_code == 200:
                self.user_token = login_response.json().get("token")
                login_response.success()
            else:
                login_response.failure(f"Login failed: {login_response.status_code}")
        else:
            response.failure(f"Signup failed: {response.status_code}")
    
    def get_products(self):
        """Fetch available products"""
        with self.client.get(f"{BASE_API_URL}/products", catch_response=True) as response:
            if response.status_code == 200:
                self.products = response.json()[:10]
                response.success()
            else:
                response.failure(f"Failed to fetch products: {response.status_code}")
    
    def select_random_items(self, count: int = None):
        """Select random items from products"""
        if not self.products:
            return []
        
        if count is None:
            count = random.randint(1, 4)
        
        selected = []
        sampled = random.sample(self.products, min(count, len(self.products)))
        
        for product in sampled:
            qty = random.randint(1, 3)
            selected.append({
                "productId": product.get("_id", product.get("id")),
                "title": product.get("title", "Product"),
                "image": product.get("image", ""),
                "desc": product.get("desc", ""),
                "price": product.get("price", 0),
                "qty": qty
            })
        
        return selected
    
    @task(1)
    def create_order(self):
        """Task to create an order"""
        if not self.user_token:
            self.setup_user()
        
        if not self.products:
            self.get_products()
        
        items = self.select_random_items()
        if not items:
            print("No items selected for order")
            return
        
        total_items = sum(item.get("qty", 1) for item in items)
        total_price = sum(item.get("price", 0) * item.get("qty", 1) for item in items)
        
        payload = {
            "userId": self.user_token,
            "userName": self.user_name,
            "userMobile": self.user_mobile,
            "items": items,
            "totalItems": total_items,
            "totalPrice": total_price,
            "paymentMethod": random.choice(["Card", "UPI", "Cash"]),
            "clearCart": False
        }
        
        with self.client.post(
            f"{BASE_API_URL}/orders",
            json=payload,
            catch_response=True
        ) as response:
            if response.status_code in [200, 201]:
                response.success()
            else:
                response.failure(f"Order creation failed: {response.status_code}")


class OrderLoadTestUser(HttpUser):
    """Simulated user for load testing"""
    wait_time = between(1, 3)  # Wait 1-3 seconds between requests
    tasks = [OrderLoadTestTasks]


if __name__ == "__main__":
    print("Run this with: locust -f load_test_locust.py --host=http://localhost:8080")
