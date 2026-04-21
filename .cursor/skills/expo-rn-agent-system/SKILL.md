---
name: expo-rn-agent-system
description: Applies SenaiVerse-style multi-agent workflows for Expo/React Native—planning (Grand Architect), design-token enforcement, WCAG-oriented accessibility, test generation, performance budgets, predictive performance review, and OWASP Mobile–oriented security passes. Use when building or reviewing RN/Expo features, holistic code review, test suites, or when the user mentions design tokens, accessibility compliance, performance budgets, mobile security, multi-agent workflows, /feature, /review, /test, or the senaiverse claude-code-reactnative-expo-agent-system.
---

# Expo / React Native agent workflows (Cursor)

## Upstream

Workflows and role names follow [senaiverse/claude-code-reactnative-expo-agent-system](https://github.com/senaiverse/claude-code-reactnative-expo-agent-system) (MIT). That repository ships **Claude Code** `.claude/` agents, commands, and a Windows installer. This skill adapts the same **roles and sequencing** for Cursor’s agent.

- **Claude Code CLI:** clone the repo and run `scripts/install-agents.ps1` (project or global scope). See upstream `START-HERE.md` and `COMPLETE-GUIDE.md`.
- **Cursor:** follow the workflows below; for list/gesture/thread performance specifics, also read [react-native-skills](../react-native-skills/SKILL.md) when relevant.

## When to use

Use this skill when the user wants any of: end-to-end feature delivery with quality gates, a combined review (design + a11y + security + performance), focused test generation, or explicit mention of the seven core roles below.

## Core roles (apply in order as needed)

| Role | Responsibility |
|------|------------------|
| Grand Architect | Clarify scope, constraints, and acceptance criteria; produce a short ordered plan before large edits; call out cross-cutting risks. |
| Design Token Guardian | Enforce theme/design system: avoid hardcoded colors/spacing/typography where tokens exist; keep visual API consistent. |
| A11y Compliance Enforcer | WCAG 2.x–oriented mobile checks: labels, roles/hints, focus and reading order, touch targets, motion/reduced-motion where applicable. |
| Smart Test Generator | Tests for new logic and critical UI paths; edge cases and regressions; match the repo’s test stack and patterns. |
| Performance Budget Enforcer | Concrete perf guardrails: list virtualization, stable keys/callbacks, image sizing, avoid expensive work in render; align with RN perf skill for Reanimated/FlashList. |
| Performance Prophet | Predict likely perf cliffs (lists, images, navigation, state churn) before merge; suggest measurements. |
| Security Penetration Specialist | OWASP Mobile Top 10–oriented review for changed surfaces: secrets, storage, deep links, auth/session, input validation, logging. |

## Workflow: feature (equivalent to /feature)

1. Grand Architect: plan, file list, and risks.
2. Design Token Guardian: token/theme constraints for touched UI.
3. Implement with minimal, project-consistent diffs.
4. A11y Compliance Enforcer: checklist pass on new or changed interactive UI.
5. Smart Test Generator: add or update tests tied to the change.
6. Performance Budget Enforcer + Performance Prophet: quick pass on hot paths touched by the change.
7. Security Penetration Specialist: short pass on sensitive flows if any.

## Workflow: review (equivalent to /review)

In one pass, cover: **correctness and edge cases** → **design tokens** → **accessibility** → **security** → **performance**. Structure feedback as must-fix vs should-fix vs optional, with file-level pointers.

## Workflow: test (equivalent to /test)

Derive cases from requirements and control flow; prefer deterministic unit tests for logic; use component/integration tests where the project already does; avoid brittle timing unless necessary.

## Optional expansion

The upstream repo documents additional specialized agents (version compatibility, navigation journeys, bundle size, state audit, etc.). See [reference.md](reference.md) for pointers and install layout.
