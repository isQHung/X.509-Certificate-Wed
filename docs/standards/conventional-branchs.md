# Conventional Branch 1.0.0

## Summary

**Conventional Branch** refers to a structured and standardized naming convention for Git branches which aims to make branches more readable and actionable.

We’ve suggested some branch prefixes you might want to use, but you can also specify your own naming convention. A consistent naming convention makes it easier to identify branches by type.

---

## Key Points

### 1. Purpose-driven Branch Names
Each branch name clearly indicates its purpose, making it easy for all developers to understand what the branch is for.

### 2. Integration with CI/CD
By using consistent branch names, it can help automated systems (like Continuous Integration/Continuous Deployment pipelines) trigger specific actions based on the branch type (e.g., auto-deployment from release branches).

### 3. Team Collaboration
It encourages collaboration within teams by making branch purpose explicit, reducing misunderstandings, and making it easier for team members to switch between tasks without confusion.

---

## Specification

### Branch Naming Prefixes

Branch names should follow the structure:
```
<type>/<description>
```

Supported prefixes:

| Type | Description | Example |
|-----|-------------|--------|
| `main` | The main development branch | `main`, `master`, `develop` |
| `feature/` or `feat/` | For new features | `feature/add-login-page` |
| `bugfix/` or `fix/` | For bug fixes | `bugfix/fix-header-bug` |
| `hotfix/` | For urgent fixes | `hotfix/security-patch` |
| `release/` | For release preparation | `release/v1.2.0` |
| `chore/` | Non-code tasks (dependencies, docs, etc.) | `chore/update-dependencies` |

---

## Basic Rules

### 1. Use Lowercase Alphanumerics, Hyphens, and Dots

Always use:

- lowercase letters (`a-z`)
- numbers (`0-9`)
- hyphens (`-`) to separate words

Avoid:

- special characters
- underscores (`_`)
- spaces

For **release branches**, dots (`.`) may be used for version numbers.

Example:
```
release/v1.2.0
```

---

### 2. No Consecutive, Leading, or Trailing Hyphens or Dots

Invalid examples:
```
feature/new--login
release/v1.-2.0
feature/-new-login
release/v1.2.0.
```

---

### 3. Keep It Clear and Concise

Branch names should be **descriptive but short**, clearly indicating the purpose of the work.

Example:
```
feature/add-payment-gateway
fix/login-validation-error
```

---

### 4. Include Ticket Numbers

If applicable, include the **ticket ID** from your project management system.

Example:
```
feature/issue-123-new-login
fix/bug-456-header-overflow
```

---

## Conclusion

### Clear Communication
The branch name alone provides a clear understanding of its purpose and code changes.

### Automation-Friendly
Easily integrates with automation processes (e.g., different workflows for `feature`, `release`, etc.).

### Scalability
Works well in large teams where many developers are working on different tasks simultaneously.

---

## Summary

**Conventional Branch** is designed to improve:

- Project organization
- Team communication
- Automation within Git workflows