FROM python:3.11-slim

WORKDIR /app

# Cài uv (package manager nhanh)
RUN pip install uv

# Copy dependency trước để cache
COPY pyproject.toml uv.lock* ./

RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
RUN uv sync --no-dev

# Copy source code
COPY . .

# Expose port Flask
EXPOSE 5000

# Run app
CMD ["uv", "run", "--env-file", ".env", "python", "main.py"]