# Contributing to APIx 🤝

Thank you for your interest in contributing to the Real-Time Airfare Price Index (APIx) platform!

## 🏗️ Development Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### Setup Steps

```bash
# Fork and clone
git clone https://github.com/your-username/airfare-index.git
cd airfare-index

# Create virtual environment
python -m venv venv
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate   # Windows

# Install Python dependencies
pip install -r requirements.txt

# Install frontend dependencies
cd frontend && npm install && cd ..

# Seed demo database
python -m backend.seed.seed_database

# Run backend
uvicorn backend.main:app --reload --port 8000

# Run frontend (new terminal)
cd frontend && npm start
```

## 📝 Code Style

### Python
- Follow PEP 8
- Use type hints
- Write docstrings for all public functions
- Maximum line length: 100 characters

### JavaScript/React
- Use functional components with hooks
- Follow Airbnb style guide
- Use Ant Design components
- Format with Prettier

## 🧪 Testing

```bash
# Run all tests
python -m pytest tests/ -v

# Run with coverage
python -m pytest tests/ --cov=backend --cov-report=html
```

All new features must include tests. Minimum 80% code coverage.

## 🔀 Pull Request Process

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Add/update tests
4. Run tests: `python -m pytest tests/ -v`
5. Commit: `git commit -m "feat: description"`
6. Push: `git push origin feature/your-feature`
7. Open a Pull Request

### Commit Message Format
```
type: description

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code restructuring
- test: Adding tests
- chore: Maintenance
```

## 📄 License

By contributing, you agree that your contributions will be licensed under the Government of India license.

---

*Questions? Open an issue or contact the maintainers.*
