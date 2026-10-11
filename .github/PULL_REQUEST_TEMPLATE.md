Task: <link to the story task description in the RS qualifying-stage repo>
Screenshots:
<add screenshots>

Done: <YYYY-MM-DD HH:MM> / deadline <YYYY-MM-DD HH:MM>
Score: <self-score> / <max>

## 🔗 Links
- Deployment: <public deploy link>
- Pull Request: <story-N → story-(N-1)>, not merged

## 🎮 Overview
Short description of what this story adds.

## ✅ Tasks
### <Section name> — <points> / <max>
- <task id and name — points>
  - What was implemented
  - Edge cases handled

## 🧪 Verification
- Unit tests: <N> passing, aggregate statement coverage <XX.XX>%
- How to test:
  1. Steps to run locally
  2. Steps to verify behavior

## Code Quality
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] `npm run format:check` passes
- [ ] `npx tsc -p tsconfig.json --noEmit` passes
- [ ] `npm test` and `npm run test:coverage` pass
- [ ] No `console.log`, no `alert()`/`confirm()`, no explicit `any`
- [ ] No magic CSS values (design tokens only)

## Workflow
- [ ] Branch `story-N` was created from `story-(N-1)`
- [ ] Each task was done on its own feature branch and merged into `story-N` via PR
- [ ] This PR (`story-N` → `story-(N-1)`) is NOT merged

## 📊 Self-Assessment
| Section | Score |
| --- | --- |
| <section> | <x> / <y> |
| **Total** | **<x> / <y>** |