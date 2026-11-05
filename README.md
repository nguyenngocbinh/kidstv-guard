# KidsTV Guard

Quiz-first learning and screen-time companion for Samsung Tizen Smart TVs.

## Agreed MVP quiz behavior
- Adaptive quiz mode.
- Enabled subjects: Math, English and Spelling.
- Minimum 3 base questions per gate.
- Every incorrect answer schedules one extra remediation question.
- Two consecutive correct answers raise target difficulty; an incorrect answer lowers it.
- Unlock only after the minimum base questions are answered and no remediation remains.
- Randomized selection with no repeats until the eligible question pool is exhausted.

## Repository structure
- `packages/quiz-engine`: pure TypeScript state machine shared by TV and admin.
- `packages/question-schema`: canonical question contract.
- `apps/tizen-tv`: Samsung Tizen TV player (planned).
- `apps/mobile-admin`: phone-based question management (planned).
- `server`: LAN API, persistence and sync (planned).
- `docs`: architecture, quiz specification and roadmap.

## Start here
- [Architecture](docs/architecture.md)
- [Quiz Engine specification](docs/quiz-engine-spec.md)
- [Implementation roadmap](docs/roadmap.md)
- [Vietnamese sample questions](data/sample-questions/questions.vi.json)

## Important Tizen limitation
Samsung documents that JavaScript execution pauses when a TV app is hidden. The app must persist and restore state on visibility changes. A normal Tizen app must not be assumed to overlay Netflix/YouTube or prevent switching apps. Cross-app enforcement is a separate feasibility track, not an MVP promise.

## Current development
See the open draft pull request for the initial architecture and Quiz Engine foundation.
