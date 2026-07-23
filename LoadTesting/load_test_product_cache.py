"""
Load test for product creation and cache behavior using Locust.

This script creates new products with unique titles and periodically fetches the product list
so that backend cache behavior can be exercised:

- POST /api/product to add new products
- GET /api/product to warm the cache and verify list retrieval

Run with:
    python -m locust -f load_test_product_cache.py --host=http://localhost:8080
"""

from locust import HttpUser, TaskSet, task, between
import random
import string
import uuid

BASE_API_URL = "/api"
CATEGORIES = [
    "BEVERAGES",
    "Biryani_Buckets",
    "BOX_MEALS",
    "BURGERS",
    "CHICKEN",
    "NEWLUNCH",
    "SNACKS",
    "STAY_HOME",
]


def random_string(length=8):
    return "".join(random.choice(string.ascii_letters + string.digits) for _ in range(length))


class ProductCacheLoadTestTasks(TaskSet):
    """Tasks for testing product creation and cache refresh behavior."""

    def on_start(self):
        self.prefix = str(uuid.uuid4())[:8]
        self.created_count = 0

    def build_product_payload(self):
        self.created_count += 1
        title = f"LoadTest Product {self.prefix}-{self.created_count}-{random_string(4)}"
        category = random.choice(CATEGORIES)
        return {
            "image": f"https://example.com/images/{self.prefix}-{self.created_count}.jpg",
            "title": title,
            "desc": f"Load test generated product {title}",
            "categories": category,
            "price": round(random.uniform(99.0, 599.0), 2),
            "type": random.choice(["Veg", "Non veg"]),
            "serve": random.choice(["1 pc", "2 pcs", "Family"]),
        }

    @task(3)
    def get_product_list(self):
        with self.client.get(f"{BASE_API_URL}/product", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"GET /api/product failed: {response.status_code}")

    @task(1)
    def create_product(self):
        payload = self.build_product_payload()
        with self.client.post(
            f"{BASE_API_URL}/product",
            json=payload,
            catch_response=True
        ) as response:
            if response.status_code in [200, 201]:
                response.success()
            else:
                response.failure(f"POST /api/product failed: {response.status_code} - {response.text}")


class ProductCacheLoadTestUser(HttpUser):
    tasks = [ProductCacheLoadTestTasks]
    wait_time = between(1, 3)


if __name__ == "__main__":
    print("Run this with: locust -f load_test_product_cache.py --host=http://localhost:8080")
