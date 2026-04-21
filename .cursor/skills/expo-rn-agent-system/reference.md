# Reference: expo-rn-agent-system

## Source repository

- [claude-code-reactnative-expo-agent-system](https://github.com/senaiverse/claude-code-reactnative-expo-agent-system) — agents, slash commands, hooks, `CLAUDE.md` template, `install-agents.ps1`.

## Claude Code layout (after install)

Typical upstream layout:

- `ready-to-use/agents/` — tiered agent markdown (YAML frontmatter + body)
- `ready-to-use/commands/` — slash command definitions
- `ready-to-use/templates/` — `CLAUDE.md`, `settings.json`
- `scripts/install-agents.ps1` — copies into project `.claude/` or user global `~/.claude/`

Precedence (upstream docs): project `.claude/agents/` overrides global `~/.claude/agents/` for the same agent name.

## Expandable agent ideas (upstream “20-agent” design)

Examples named in the upstream README for custom agents you can add in Claude Code: version compatibility, user journey mapping, refactor safety, cross-platform UI parity, API contracts, memory leak patterns, bundle size, migrations, state management audit, feature impact analysis. Templates: `ready-to-use/agents/AGENTS-REFERENCE.md` in the upstream repo.

## License

Upstream is MIT; attribute or link to the repo when copying agent markdown verbatim into your own repos.
