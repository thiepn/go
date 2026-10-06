# THIEPN Account Integration

P16 integrates Go as an optional THIEPN Account Platform 1.0 consumer.

## Authority boundary

THIEPN Account owns:
- canonical user identity;
- sessions and credentials;
- OAuth;
- password recovery;
- security/account state;
- account deletion.

Go owns:
- course progress;
- guided-game completion;
- mastery evidence;
- practice history;
- saved Go games;
- Coach plans;
- Study documents.

Go does not create a second account profile, copy tokens into app storage, call
`setSession`, or turn network failures into logout.

## Guest-first behavior

An account is optional. The complete learning product remains usable using the
existing local-first persistence when signed out, offline, or when the account
service is unavailable.

Account integration activates only on:
- `https://thiepn.dev/go/`;
- localhost / 127.0.0.1 development origins.

Other deployments remain anonymous/local rather than creating an incompatible
session origin.

## SDK

The browser loads the canonical THIEPN Account SDK 1.x from:

`https://thiepn.dev/account-platform/sdk/v1/index.js`

It passes the pinned Supabase JS 2.116.0 `createClient` implementation to the
SDK. Authentication actions go through the SDK.

The app slug is `go`.

## Cloud state

The canonical account project stores one isolated row per signed-in user in
`public.go_user_state`.

The table:
- uses `auth.users(id)` as the identity reference;
- has RLS enabled;
- explicitly grants Data API access only to `authenticated`;
- allows users to select, insert, update, and delete only their own row;
- limits the JSON payload to 5 MiB;
- tracks a monotonic revision.

`public.go_sync_write` is a SECURITY INVOKER RPC. It performs an
optimistic-concurrency write and returns NULL when another device changed the
row first. The client then pulls, merges, and retries rather than overwriting a
newer device state.

## Merge policy

Cloud sign-in must never roll progress backward.

- first guided game: boolean OR;
- course progress: maximum completed lesson index;
- mastery evidence: union by immutable evidence ID;
- practice history: monotonic maximum counters with the latest attempt metadata;
- saved games: union by record ID, newest first, capped to the existing 50-game
  product limit;
- Coach plans: union by plan ID, newest plan state wins;
- Study documents: union by study ID, highest `updatedAt` wins, capped to the
  existing 50-study limit.

Device-specific sound, haptic, motion preferences, recovery snapshots, authoring
drafts, and KataGo cache data are intentionally not synced.

## Automatic sync

After a valid signed-in session:
1. local and remote state are pulled;
2. state is merged deterministically;
3. merged state is applied locally;
4. changed remote state is written with revision checking.

Durable local-storage writes emit an internal event. While signed in, the
account provider debounces those events and syncs in the background. Returning
online also triggers a sync.

A sync failure changes sync status only. It does not clear the canonical
session or local data.

## Backup

The Account screen also supports portable JSON export/import independent of
cloud sync.

Import uses the same monotonic merge rules as cross-device sync instead of
blindly replacing local state.

## Deletion

“Delete cloud Go data” removes only the signed-in user's `go_user_state` row.
It does not delete local data or the THIEPN Account.

Canonical account deletion remains owned by THIEPN Account.
