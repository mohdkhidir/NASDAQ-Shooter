# CLAUDE.md — NASDAQ Shooter project conventions

## Git workflow

Always use feature branches. Never commit directly to `main`.

```
git checkout -b feature/<short-name>   # start work
# ... make changes, commit ...
git push origin feature/<short-name>
gh pr create --base main --head feature/<short-name>
```

After the PR is merged on GitHub, delete the feature branch:

```
git checkout main
git pull origin main
git branch -d feature/<short-name>
```

## PR format

Use `gh pr create` with:
- A concise title (imperative verb, ≤ 70 chars)
- Body covering: what changed, why, and a short test plan checklist

Always append to the body:

```
🤖 Generated with [Claude Code](https://claude.com/claude-code)
```
