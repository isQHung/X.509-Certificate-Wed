FROM python:3.12-slim

WORKDIR /app

# Cài uv (package manager nhanh)
RUN pip install uv

# Copy dependency trước để cache
COPY pyproject.toml uv.lock* ./

# Install dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*
RUN uv sync --no-dev

# Copy source code
COPY . .

# Expose port Flask
EXPOSE 5000

# Run app
CMD ["uv", "run", "--env-file", ".env", "python", "main.py"]