
# 🧠 Git Workflow Cheat Sheet for Muza Productions

This document summarizes the Git commands used in your workflow: branching, merging, deleting, and resetting. Designed as a quick reference while working in VSCode.

---

## 🔀 Branching Off (Start a New Branch from an Existing One)

### From `main`:
```bash
git checkout main
git pull origin main
git checkout -b feature/branch-name
git push origin feature/branch-name
```

### From any other branch (e.g., `feature/sprint1`):
```bash
git checkout feature/sprint1
git pull origin feature/sprint1
git checkout -b feature/new-task
git push origin feature/new-task
```

---

## 🔁 Merging Branches

### Merge a feature branch into `develop` or `main`:
```bash
git checkout develop           # or main
git pull origin develop        # or main
git merge feature/branch-name
git push origin develop        # or main
```

### Save your progress from an experimental branch into your base:
```bash
git checkout feature/sprint1
git merge feature/sound-effects
git push origin feature/sprint1
```

---

## 🧼 Deleting Old Branches

### Delete locally:
```bash
git branch -d feature/old-branch-name        # Safe delete (only if merged)
git branch -D feature/old-branch-name        # Force delete (even if not merged)
```

### Delete remotely (GitHub):
```bash
git push origin --delete feature/old-branch-name
```

---

## 🔄 Reset a Branch to Match Another

### Example: Reset `develop` to match `main`:
```bash
git checkout develop
git reset --hard origin/main
git push --force origin develop
```

---

## 🌐 Change GitHub Pages Branch

1. Go to your repo on GitHub → **Settings** → **Pages**.
2. Set Source to your chosen branch (e.g. `feature/sprint1`) and root folder.
3. Optional: trigger a fresh build with:
```bash
git commit --allow-empty -m "Trigger Pages rebuild"
git push
```

---

## 🧪 Use Python HTTP Server to Test Locally

From your project directory:
```bash
python -m http.server
```

This serves your project on `http://localhost:8000/`

---

## 🧭 Quick Tips

- Always `pull` before creating a new branch.
- Push new branches right away to avoid confusion.
- Delete branches once their work is merged or abandoned.
- Use `--allow-empty` to trigger GitHub Pages rebuilds.
- Merge into `develop` for staging, into `main` for production.

---

_Created for Gabriele (Muza Productions) — your cinematic science deserves cinematic Git hygiene._
