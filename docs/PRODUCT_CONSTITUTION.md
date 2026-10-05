# Product Constitution

## Mission

Build an interactive Go teacher that can take a person from zero knowledge to competent independent play without requiring outside explanations.

The app is **learning software first** and a Go client second.

## Primary user

The primary user has never played Go and may not know:

- that stones are placed on intersections;
- what liberties, groups, atari, territory, eyes, ko, komi, ranks, or SGF mean;
- when a game ends;
- why a move is legal or useful;
- how to judge whether a group is alive.

The product must never treat that ignorance as user error.

## Product promise

A learner can:

1. open the app;
2. start immediately without creating an account;
3. learn concepts through direct board interaction;
4. complete a fully guided 9×9 game;
5. transition to assisted and then independent play;
6. receive explanations in vocabulary they already understand;
7. practice weaknesses detected from lessons and games;
8. eventually progress to 13×13 and 19×19.

## Core loop

```
Learn concept
    ↓
Manipulate board
    ↓
Practice concept
    ↓
Use concept in a game
    ↓
Review meaningful mistakes
    ↓
Update mastery
    ↓
Target weak prerequisite
    ↓
Play again
```

## Non-negotiable pedagogy

### 1. One idea at a time

Do not introduce multiple unfamiliar concepts in the same instruction unless they are inseparable.

### 2. Intuition before vocabulary

Preferred order:

```
experience → notice pattern → explain → name it → practice it
```

Never lead with jargon when the board can demonstrate the idea first.

### 3. Show before telling

Prefer:
- animated board state;
- highlighted relation;
- predicted consequence;
- user manipulation;

over paragraphs of explanation.

### 4. Wrong answers teach

A failed action should answer at least one of:

- What did I overlook?
- What remains true?
- What consequence would happen?
- What prerequisite am I missing?

Avoid generic “Wrong” states.

### 5. Scaffold, then remove support

Learner stages:

1. **Demonstrated** — app performs most actions.
2. **Guided** — learner acts with strong cues.
3. **Assisted** — help appears selectively.
4. **Independent** — help is requested, not imposed.
5. **Developing** — feedback moves mainly to post-game review.

### 6. Vocabulary-aware explanations

Every concept has a learner state:

```
unknown → introduced → practiced → understood → mastered
```

Explanations may not depend on unknown vocabulary.

### 7. Never expose expert complexity by default

Coordinates, move trees, engine scores, ownership maps, SGF details, joseki terminology, advanced rules, and deep analysis remain hidden until useful.

## Beginner Guardian

The app must be able to detect:

- unknown terms shown to the learner;
- interactions requiring an unintroduced mechanic;
- repeated errors caused by a prerequisite;
- explanations that are too advanced;
- forgotten foundational concepts;
- opportunities where animation is clearer than prose.

The Beginner Guardian may:
- simplify wording;
- insert a micro-remediation;
- highlight the relevant board relationship;
- offer a progressive hint;
- delay a concept until prerequisites are ready.

## First certification milestone

A learner who began with zero knowledge can complete a legal 9×9 game and explain, in simple terms:

- where stones go;
- how turns work;
- what makes a stone/group capturable;
- why groups connect;
- what territory is;
- why living groups survive;
- when to pass;
- how the winner is determined.

## What this product is not

Early development must not prioritize:

- online matchmaking;
- chat;
- tournaments;
- social feeds;
- leaderboards;
- clans;
- giant achievement systems;
- professional-game databases;
- advanced joseki encyclopedias;
- generative AI chat;
- cloud engine infrastructure.

Those features do not solve the primary learning problem.
