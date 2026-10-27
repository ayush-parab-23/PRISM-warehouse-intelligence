# Contributing to PRISM

Thank you for contributing to the **PRISM — Multi-Agent AI Warehouse Intelligence Platform**! This guide is designed for all project contributors and team members to ensure smooth, organized, and error-free collaboration.

---

## 🌳 1. Git Branching Strategy

To keep the `main` branch stable at all times, avoid pushing unfinished code directly to `main`. Instead, follow this branch naming convention:

| Branch Prefix | Purpose | Example |
| :--- | :--- | :--- |
| `feature/` | New UI screen, component, or warehouse capability | `feature/dock-scheduling-ui` |
| `agent/` | New reasoning logic or tools for an AI Agent | `agent/reorder-optimization-inv02` |
| `fix/` | Bug fixes or database constraint corrections | `fix/zone-b2-capacity-overflow` |
| `docs/` | Updates to README, architecture guides, or run manuals | `docs/add-api-specs` |

### How to Create and Work on a Branch:
```bash
# 1. Ensure you have the latest code from main
git checkout main
git pull origin main

# 2. Create and switch to your feature branch
git checkout -b feature/your-feature-name

# 3. Make your edits and commit
git add .
git commit -m "feat: implement dock scheduling drawer"

# 4. Push your branch to GitHub
git push -u origin feature/your-feature-name
```

---

## 🧪 2. Pre-Commit Verification Checklist

Before creating a commit or opening a Pull Request, **always** run these three commands locally:

```bash
# 1. Typecheck & Build (Ensures no TypeScript or Vite compilation errors)
npm run build

# 2. Run Database & System Logic Tests (16 checks)
npm test

# 3. Run API Integration Tests (17 checks)
npm run test:api
```

> ⚠️ If any test fails, resolve the issue before pushing. GitHub Actions CI will automatically test every pull request.

---

## 📝 3. Commit Message Standards

Use standard conventional commit prefixes:
- `feat:` A new feature or agent reasoning capability
- `fix:` A bug fix or schema patch
- `docs:` Documentation only changes
- `refactor:` Code change that neither fixes a bug nor adds a feature
- `test:` Adding missing tests or correcting existing tests
- `chore:` Build process or auxiliary tool changes

**Examples:**
- `feat(inventory): add automated supplier PO proposal generation`
- `fix(zones): correct zone B2 cubic volume constraint check`
- `docs(setup): clarify node version prerequisites in HOW_TO_RUN.md`

---

## 🔀 4. Pull Request (PR) Workflow

1. Go to your repository on GitHub: [PRISM Repository](https://github.com/ayush-parab-23/PRISM-warehouse-intelligence).
2. Click **"Compare & pull request"** next to your branch.
3. Fill out the PR template:
   - Provide a concise summary of what was added or changed.
   - Confirm that all unit and API tests pass.
4. Request review from at least one team member.
5. Once approved and the green CI check passes, merge the branch into `main`.

---

## 📂 5. Code Organization Guidelines

- **Frontend Components:** Store in `src/components/` organized by domain (`agents/`, `warehouse/`, `layout/`, `common/`).
- **Pages:** Store in `src/pages/manager/` or `src/pages/employee/`.
- **Agent Logic:** Store in dedicated individual files inside `server/agents/roles/`. **Do not add monolithic logic directly into `orchestrator.ts`**.
- **Database Tools:** Register new tools in `server/agents/tools.ts`.
- **API Endpoints:** Create modular route files inside `server/routes/`.

Refer to [`docs/PROJECT_STRUCTURE.md`](./docs/PROJECT_STRUCTURE.md) for full architecture details.
