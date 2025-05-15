### Ticket #148: **Limit Each Quiz Session to 5 Random Questions**

---

## Overview

**Type**: Feature  
**Priority**: High (improves replayability & pedagogy)  
**Estimated Effort**: Small-to-Medium (one JS module + tests)  
**Dependencies**: none

## Context

Right now the quiz engine loads *every* question in `data/questions.json`, shuffles them, and marches the user through the full set. When we expanded the file to ten questions, a single play-through became a ten-question marathon—too long and too predictable. We want each run to feel brisk and addictive, encouraging repeat sessions.

## Objective (definition of done)

> **During each game session, the quiz must display exactly five random, non-repeating questions chosen from the full JSON bank—regardless of how many total questions exist.**  
> The rest of the game flow (progress bar, score, “quiz complete” screen) must still work with this reduced set.

## Required Reading

1. **Quiz engine source**
   
   - `src/js/quiz-engine.js` (core logic)
   
   - `src/js/ui-controller.js` (progress bar & end-screen logic)

2. **Data**
   
   - `data/questions.json` (question bank)

3. **Template** — `ticket_template.md` for structure

## Implementation Requirements

### Must-Implement

1. **Shuffle then Slice**
   
   - Inside `loadQuestions()` (or its async wrapper) fetch the JSON, shuffle the full array, then assign:
     
     ```js
     if (questions.length > 5) {
      questions = questions.slice(0, 5);
     }
     ```
   
   - Retain the existing Fisher-Yates shuffle utility to guarantee unbiased selection.

2. **Edge-case fallback**
   
   - If the JSON contains `<5` questions, serve all of them—don’t crash or pad with duplicates.

3. **Accurate progress metrics**
   
   - `getTotalQuestions()` should return `questions.length` (now 5) so the progress bar and “X of Y” counter auto-update.

4. **Replay freshness**
   
   - On a *new* session (`window.location.reload()` or “Play Again”), rerun `loadQuestions()` so the slice chooses a fresh random subset.

5. **Unit tests** (Jest)
   
   - **Test 1**: With a mock array of 12 items, ensure length after `loadQuestions()` === 5.
   
   - **Test 2**: With ≥2 play-throughs, verify ≥1 question differs between runs (statistical; loop 10× and expect at least one mismatch).
   
   - **Test 3**: With an array of 3 items, length remains 3.

### Code Guidelines

- **Files to modify**:
  
  - `src/js/quiz-engine.js` (main change)
  
  - `test/quiz-engine.test.js` (new)

- Follow existing ES6 style; keep functions pure where possible.

- Add JSDoc comments for any new helpers.

- Commit message convention: `feat(engine): limit session to 5 random questions`.

### Data Flow (updated)

```
questions.json  ──fetch──► loadQuestions()
                                    │
                                    ▼
                        shuffleQuestions()
                                    │
             ┌────slice to 5──────┐ │
             │                    ▼ ▼
[Q1..Q5] → UI Controller → User Interactions → Score Screen
```

## Edge Cases

| Case                                   | Expected Behaviour                                       |
| -------------------------------------- | -------------------------------------------------------- |
| JSON has <5 questions                  | Use all available; UI still shows “Question N of 3” etc. |
| JSON fetch fails                       | Existing error modal remains; *no regression*.           |
| Developer accidentally sets slice to 0 | Jest test will fail; CI blocks merge.                    |

## Visual / UX Changes

Nothing in the DOM changes except the total question count. Confirm:

- Progress bar hits 100 % after Q5.

- “Quiz Complete” dialog appears after five answers, not ten.

## Testing Requirements

```bash
npm run test # all new Jest cases must pass
npm run dev  # manually play twice; confirm different mixes of questions
```

## Success Criteria

- Exactly 5 questions per session when ≥5 exist.

- All UI counters, score, and completion logic accurate.

- Unit tests pass in CI.

- No linter errors (`npm run lint`).

- README “Development” section notes the 5-question behavior.

## Deliverables

1. Updated `quiz-engine.js` with slice logic & comments.

2. New Jest tests in `test/quiz-engine.test.js`.

3. PR description linking this ticket and screenshots (or short Loom) of two sessions with different question sets.

## Notes

- Keep the slice length (`5`) in a *single* constant at top of the module so we can tweak later.

- Resist the urge to mutate global state elsewhere—`questions` should stay encapsulated.

- Heads-up: once this lands we’ll bump the question bank to 25+, so write code that scales.

---


