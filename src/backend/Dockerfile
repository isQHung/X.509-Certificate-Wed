FROM python:3.11-slim

WORKDIR /app

# Cài uv (package manager nhanh)
RUN pip install uv

# Copy dependency trước để cache
COPY pyproject.toml uv.lock* ./

# Install dependencies
RUN uv sync --no-dev

# Copy source code
COPY . .

# Expose port Flask
EXPOSE 5000

# Run app
CMD ["uv", "run", "--env-file", ".env", "python", "main.py"]