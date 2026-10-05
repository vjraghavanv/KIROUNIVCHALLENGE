# Namma Seva AI backend — production image for AWS App Runner.
# Small, dependency-pinned, no secrets. Starts FastAPI with uvicorn on $PORT.

FROM python:3.11-slim

# Faster, cleaner Python in containers.
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Install runtime dependencies first (better layer caching).
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application package only (see .dockerignore for exclusions).
COPY app ./app

# App Runner provides $PORT (defaults to 8080). Document it for clarity.
ENV PORT=8080
EXPOSE 8080

# Offline MockProvider is the default; no AWS access required.
ENV NSA_PROVIDER=mock

# Shell form so $PORT is expanded at runtime. Binds all interfaces for App Runner.
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT}
