# coordination.md

This file provides guidance for coordinating multiple Claude Code instances working in the same repository.

## Task List

Use the shared task list to coordinate work. All teammates share the same task list via `TaskList`, `TaskCreate`, `TaskUpdate`.

**Before starting work:**
1. Call `TaskList` to see what tasks are in progress, pending, or blocked
2. Claim a task with `TaskUpdate` (set `owner` to your agent name, `status` to `in_progress`)

**After completing work:**
1. Mark task as `completed` via `TaskUpdate`
2. Check `TaskList` for newly unblocked tasks

**Creating tasks:**
- Use `TaskCreate` with a clear `subject` and `description`
- Set up `addBlockedBy` for dependencies
- Example: Task 2 blocked by Task 1 → `TaskUpdate` taskId=2 with `addBlockedBy: ["1"]`

## Branch Strategy

- One feature/bug per branch
- Branch naming: `feature/description`, `fix/description`, `refactor/description`
- Delete merged branches promptly to avoid clutter

## Shared JSON Data Files

The `/data/` directory contains JSON files that are the source of truth for the app:
- `products.json`, `projects.json`, `blog.json`, `inquiries.json`, `crm.json`, `conversations.json`, `fabricators.json`, `calculator-pricing.json`

**Conflict prevention:**
- If you need to modify a JSON file, claim the task first (prevents another agent from editing the same file)
- Use `git fetch` + `git status` before starting significant work to see if another branch modified shared files
- For large JSON edits, create a dedicated branch and merge quickly to minimize conflicts

## Commit Convention

Follow conventional commits:

```
<type>: <short summary>

<optional body>
```

Types: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`, `style`

Examples:
- `feat: add product gallery grid layout`
- `fix: resolve mobile menu z-index layering`
- `refactor: extract estimator logic into separate module`

## Multi-Agent Communication

When spawned as teammates via `TeamCreate`:

- Read team config at `~/.claude/teams/{team-name}/config.json` to discover teammate names
- Use `SendMessage` to communicate with specific teammates by name
- Messages are delivered automatically — do not poll for replies
- After sending a message, wait for a response before continuing the same thread

## Coordination with Human Operators

- If a human is actively working on a branch or file, they may have set `SKIP_AUTH=1` or be mid-edit
- Check `git status` before force-pushing or destructive operations
- When in doubt, ask the human which branch to target

## Production Safety

- Never run `git push --force` to main or shared branches
- Never delete branches that are not your own
- Before merging, ensure tests pass (`npm run test:e2e`)
- The `SKIP_AUTH=1` env var is for local/e2e testing only — never commit changes that require it to function
