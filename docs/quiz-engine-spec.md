# Quiz Engine Specification

## Confirmed settings
- Mode: adaptive
- Subjects: math, english, spelling
- Minimum base questions: 3
- Wrong-answer rule: one extra remediation question
- Difficulty: easy, medium, hard

## Adaptive policy
Start at configured difficulty (default medium). Two consecutive correct answers raise target difficulty by one level. An incorrect answer lowers it one level and creates one remediation obligation. Remediation prefers same subject and topic, then same subject, then any enabled subject.

## Unlock
Unlock only when at least three base questions have been answered and pending remediation is zero. Recommended cap: five extra questions. If cap is reached while remediation remains, return NEEDS_PARENT_REVIEW; never silently unlock.

## Selection
Filter active questions by enabled subjects, avoid repeats, balance base questions across subjects, randomize selection, and return BANK_EXHAUSTED if no eligible question remains.

## V1 types
single_choice and true_false. Multi-select and typed answers later.

## Acceptance criteria
1. Three correct base answers unlock.
2. Any wrong answer adds one remediation question.
3. Wrong remediation creates another obligation.
4. Pending remediation blocks unlock.
5. Two consecutive correct answers increase difficulty.
6. Wrong answer decreases difficulty.
7. No repeated question unless bank exhaustion is explicit.
8. Session can be serialized and restored.
