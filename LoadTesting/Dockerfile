FROM python:3.12-slim

WORKDIR /app

COPY requirements_loadtest.txt ./
RUN pip install --no-cache-dir -r requirements_loadtest.txt

COPY . .

ENV API_BASE_URL=http://backend:8080

ENTRYPOINT ["python", "load_test_orders.py"]
