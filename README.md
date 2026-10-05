# Go

A beginner-first, learning-first Go (Baduk/Weiqi) application.

The product goal is not to recreate an online Go server. It is to teach a complete beginner from zero until they can play independent, sensible games and understand why their moves work or fail.

## Product promise

> Open the app knowing nothing about Go. Learn by touching the board. Finish your first guided 9×9 game. Gradually become an independent player.

## Core loop

**Learn → Practice → Play → Review → Target weaknesses → Play again**

The board is the primary teaching surface. Definitions follow intuition; visual demonstrations and interaction come before terminology.

## Principles

1. Zero prior Go knowledge is assumed.
2. One new idea at a time.
3. Experience → recognition → terminology → practice.
4. Wrong answers explain the misconception instead of merely failing.
5. Assistance fades as competence grows.
6. The beginner UI exposes only concepts the learner already knows.
7. Visual motion must communicate Go, not decorate the page.
8. The rules engine, pedagogy, content, rendering, and analysis layers stay separate.
9. No account wall before learning.
10. Online multiplayer is not an MVP requirement.

## Initial progression

- Welcome to Go
- Board, stones, and turns
- Liberties
- Atari and capture
- Groups and connection
- Staying safe
- Territory
- Life and basic eyes
- Passing and scoring
- First guided 9×9 game
- Assisted 9×9 games
- Independent 9×9
- Reading and tactical techniques
- Shape and strategy
- 13×13
- 19×19 foundations

## Analysis architecture

Post-game review has two complementary layers:

- deterministic rule-based review for explainable tactical facts;
- optional KataGo analysis for candidate moves, score comparison, ownership, policy, and principal variations.

KataGo runs behind a server-side analysis bridge and is not required for the core learning app to function.

## Repository direction

This repository is being built in phases. See `docs/` for the authoritative product, learning, study, review, and analysis contracts.
