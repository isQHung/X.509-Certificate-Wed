# Backend - Flask Application

This is the backend service for the X.509 Certificate Platform, built with Flask and Firebase.

## Prerequisites

- Python 3.12 or higher
- [uv](https://docs.astral.sh/uv/) - Fast Python package manager

## Installation

1. **Install dependencies**
   ```bash
   cd src/backend
   uv sync
   ```

2. **Create environment file** (if needed)
   ```bash
   cp .env.example .env  # if applicable
   ```

## Running the Application

### Development Server
```bash
uv run python main.py
```

The app will start on `http://localhost:5000` by default.

### Using uv Scripts
If you have run scripts defined in `pyproject.toml`, you can use:
```bash
uv run <script-name>
```

## Project Structure

- `main.py` - Flask application entry point
- `pyproject.toml` - Project configuration and dependencies

## Dependencies

- **Flask** >= 3.1.3 - Web framework
- **firebase-admin** >= 7.2.0 - Firebase integration

## Development

To add new dependencies:
```bash
uv add <package-name>
```

To remove dependencies:
```bash
uv remove <package-name>
```

## Getting Started for Team Members

1. Clone the repository
2. Navigate to the backend directory: `cd src/backend`
3. Run `uv sync` to install dependencies
4. Run `uv run python main.py` to start the development server
5. Check the main.py file to understand the API endpoints

For more information, refer to the [uv documentation](https://docs.astral.sh/uv/).
