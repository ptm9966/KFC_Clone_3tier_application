"""
Quick Start Script for Load Testing
Run pre-configured test scenarios with simple commands
"""

import subprocess
import sys
import json
from pathlib import Path
from datetime import datetime

# Test scenarios
SCENARIOS = {
    "light": {
        "description": "Light load - 5 users, 3 orders each",
        "users": 5,
        "orders_per_user": 3,
        "concurrent": 2,
    },
    "medium": {
        "description": "Medium load - 20 users, 5 orders each",
        "users": 20,
        "orders_per_user": 5,
        "concurrent": 10,
    },
    "heavy": {
        "description": "Heavy load - 50 users, 10 orders each",
        "users": 50,
        "orders_per_user": 10,
        "concurrent": 20,
    },
    "stress": {
        "description": "Stress test - 100 users, 15 orders each",
        "users": 100,
        "orders_per_user": 15,
        "concurrent": 30,
    },
    "custom": {
        "description": "Custom scenario - interactive mode",
        "users": None,
        "orders_per_user": None,
        "concurrent": None,
    }
}


def print_banner():
    """Print welcome banner"""
    print("""
╔════════════════════════════════════════════════════════════╗
║          KFC CLONE LOAD TESTING - QUICK START              ║
╚════════════════════════════════════════════════════════════╝
    """)


def print_scenarios():
    """Print available test scenarios"""
    print("\nAvailable Test Scenarios:\n")
    for i, (key, scenario) in enumerate(SCENARIOS.items(), 1):
        desc = scenario["description"]
        if scenario["users"]:
            print(f"  {i}. {key:10} - {desc}")
            print(f"     → {scenario['users']} users × {scenario['orders_per_user']} orders = "
                  f"{scenario['users'] * scenario['orders_per_user']} total orders")
        else:
            print(f"  {i}. {key:10} - {desc}")


def get_custom_params():
    """Get custom parameters from user"""
    print("\n" + "="*60)
    print("CUSTOM SCENARIO SETUP")
    print("="*60)
    
    while True:
        try:
            users = int(input("\nNumber of test users: "))
            if users <= 0:
                print("✗ Must be > 0")
                continue
            break
        except ValueError:
            print("✗ Invalid input. Enter a number.")
    
    while True:
        try:
            orders = int(input("Orders per user: "))
            if orders <= 0:
                print("✗ Must be > 0")
                continue
            break
        except ValueError:
            print("✗ Invalid input. Enter a number.")
    
    while True:
        try:
            concurrent = int(input("Concurrent requests: "))
            if concurrent <= 0:
                print("✗ Must be > 0")
                continue
            if concurrent > users * orders:
                concurrent = min(concurrent, users * orders)
                print(f"⚠ Adjusted to {concurrent} (total orders: {users * orders})")
            break
        except ValueError:
            print("✗ Invalid input. Enter a number.")
    
    return users, orders, concurrent


def modify_load_test_script(users, orders_per_user, concurrent):
    """Modify load_test_orders.py with new parameters"""
    script_path = Path("load_test_orders.py")
    
    if not script_path.exists():
        print(f"✗ Error: {script_path} not found")
        return False
    
    try:
        content = script_path.read_text()
        
        # Replace configuration values
        content = content.replace(
            f"NUM_USERS = {10}",
            f"NUM_USERS = {users}"
        )
        content = content.replace(
            f"NUM_ORDERS_PER_USER = {5}",
            f"NUM_ORDERS_PER_USER = {orders_per_user}"
        )
        content = content.replace(
            f"CONCURRENT_REQUESTS = {5}",
            f"CONCURRENT_REQUESTS = {concurrent}"
        )
        
        script_path.write_text(content)
        return True
    except Exception as e:
        print(f"✗ Error modifying script: {e}")
        return False


def run_test(users, orders_per_user, concurrent, scenario_name):
    """Run the load test"""
    total_orders = users * orders_per_user
    
    print("\n" + "="*60)
    print(f"STARTING LOAD TEST: {scenario_name.upper()}")
    print("="*60)
    print(f"\nConfiguration:")
    print(f"  Test Users: {users}")
    print(f"  Orders per User: {orders_per_user}")
    print(f"  Total Orders: {total_orders}")
    print(f"  Concurrent Requests: {concurrent}")
    print(f"  Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"\n{'='*60}")
    
    # Update script
    print("\n⏳ Preparing test script...")
    if not modify_load_test_script(users, orders_per_user, concurrent):
        return False
    
    # Run test
    print("▶ Running load test...\n")
    try:
        result = subprocess.run(
            [sys.executable, "load_test_orders.py"],
            check=False
        )
        return result.returncode == 0
    except Exception as e:
        print(f"✗ Error running test: {e}")
        return False


def run_locust_test():
    """Run Locust-based load test"""
    print("\n" + "="*60)
    print("STARTING LOCUST LOAD TEST")
    print("="*60)
    print("\nLocust will start on http://localhost:8089")
    print("Open it in your browser to control the test.\n")
    
    try:
        subprocess.run([
            sys.executable, "-m", "locust",
            "-f", "load_test_locust.py",
            "--host=http://localhost:8080"
        ])
        return True
    except Exception as e:
        print(f"✗ Error running Locust: {e}")
        print("\nMake sure Locust is installed:")
        print("  pip install locust")
        return False


def show_help():
    """Show help information"""
    print("""
Usage Examples:

  python quickstart_loadtest.py                 # Interactive mode
  python quickstart_loadtest.py light           # Run light scenario
  python quickstart_loadtest.py medium          # Run medium scenario
  python quickstart_loadtest.py heavy           # Run heavy scenario
  python quickstart_loadtest.py stress          # Run stress test
  python quickstart_loadtest.py custom          # Custom parameters
  python quickstart_loadtest.py locust          # Run Locust test

Environment Requirements:
  • Backend running at http://localhost:8080
  • MongoDB running and connected
  • Python 3.7+
  • Dependencies installed: pip install -r requirements_loadtest.txt

For detailed documentation, see: LOAD_TESTING_GUIDE.md
    """)


def main():
    """Main execution"""
    print_banner()
    
    # Check for command line arguments
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == "help":
            show_help()
            return
        
        if command == "locust":
            run_locust_test()
            return
        
        if command in SCENARIOS:
            scenario = SCENARIOS[command]
            if scenario["users"] is None:
                users, orders_per_user, concurrent = get_custom_params()
            else:
                users = scenario["users"]
                orders_per_user = scenario["orders_per_user"]
                concurrent = scenario["concurrent"]
                print(f"\n✓ Selected Scenario: {command}")
                print(f"  {scenario['description']}")
            
            success = run_test(users, orders_per_user, concurrent, command)
            sys.exit(0 if success else 1)
        
        print(f"✗ Unknown command: {command}")
        show_help()
        return
    
    # Interactive mode
    print_scenarios()
    
    print("\n" + "="*60)
    choice = input("\nSelect a scenario (1-5) or enter 'help': ").strip().lower()
    print("="*60)
    
    if choice == "help":
        show_help()
        return
    
    # Map choice to scenario
    scenario_keys = list(SCENARIOS.keys())
    try:
        scenario_idx = int(choice) - 1
        if 0 <= scenario_idx < len(scenario_keys):
            scenario_name = scenario_keys[scenario_idx]
        else:
            print("✗ Invalid selection")
            return
    except ValueError:
        print("✗ Invalid input")
        return
    
    if scenario_name == "locust":
        run_locust_test()
        return
    
    scenario = SCENARIOS[scenario_name]
    
    if scenario["users"] is None:
        users, orders_per_user, concurrent = get_custom_params()
    else:
        users = scenario["users"]
        orders_per_user = scenario["orders_per_user"]
        concurrent = scenario["concurrent"]
        print(f"\n✓ Selected: {scenario['description']}")
    
    success = run_test(users, orders_per_user, concurrent, scenario_name)


if __name__ == "__main__":
    main()
