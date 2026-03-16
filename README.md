# This is a test for JIRA automation
# X.509-Certificate-Wed

- This branch for PoC only, do not merge to main.
- Each PoC is an independent project to test the feasibility of a feature. 
- Each PoC needs to have installation instructions and purpose in the README.md.
- PoCs are stored in the PoC folder. 

## Project Layout
```
.
├── .github/                # GitHub Actions (CI/CD), issue templates
├── PoC/                    # 0. PROJECT's Proof of Concept
├── docs/                   # 1. PROJECT DOCUMENTATION
│   ├── standards/          # Working regulations, Git workflow, Coding conventions
│   ├── design/             # Database schema, System Architecture, UI/UX Mockups
│   ├── requirements/       # Software Requirements Specification (SRS), User Stories
│   └── drafts/             # Idea drafts, technical research/R&D
├── src/                    # 2. MAIN SOURCE CODE
│   ├── backend/            # X.509 processing logic (Python, Go, Node.js...)
│   ├── frontend/           # User Interface (React, Vue, ...)
│   └── shared/             # Constants, shared utility/helper functions
├── scripts/                # Utility scripts (e.g., auto-generate test CAs)
├── tests/                  # Unit tests, Integration tests
├── data/                   # 3. DATA (TESTING ONLY)
│   ├── templates/          # OpenSSL configuration templates (.cnf)
│   └── samples/            # Sample certificates for demo (DO NOT store real keys here)
├── .gitignore              # Exclude junk files, logs, and private keys
├── LICENSE                 # Source code license
└── README.md               # Project overview (The Roadmap)
```
## Tech Stack
| Layer | Technologies |
|-------|--------------|
| **Frontend** |  |
| **Backend** |  |
| **Database** |  |

## Setup

