# Architecture

| Component | Responsibility |
|---|---|
| quiz-engine | Selection, evaluation, adaptive difficulty, remediation, session state |
| question-schema | Versioned question contract and validation |
| Tizen TV | Remote-first quiz player and offline cache |
| Mobile Admin | Question CRUD, bulk import/export, settings, reports |
| Server | LAN API, SQLite persistence, pairing and sync |

## Runtime
1. TV syncs settings and question-bank version.
2. TV stores a local question cache.
3. Engine starts a gate with at least three base questions.
4. Every wrong answer creates one remediation obligation.
5. Two consecutive correct answers raise target difficulty; a wrong answer lowers it.
6. Unlock only after minimum base questions and all remediation obligations are complete.
7. Persist session after each answer; sync when network returns.

## Offline and lifecycle
Server is authoritative for question bank/settings. TV persists active session locally and can complete offline from cached content. Samsung documents that JavaScript execution pauses when an app is hidden; save/restore state on visibility changes. Cross-app enforcement is outside MVP.
