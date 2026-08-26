# PIANO LEARNING V3.8 Modular Architecture

## Independent entry pages
- `/index.html` — Home / curriculum
- `/pages/library.html` — Score library
- `/pages/import.html` — Photo / MusicXML / MIDI import
- `/pages/progress.html` — Progress / adaptive learning
- `/pages/practice.html` — Score practice only
- `/pages/sound.html` — Piano sound pack management
- `/pages/errors.html` — Error diagnosis

## JavaScript
- `js/core/app-core.js` — compatibility core from V3.3.2
- `js/core/navigation.js` — cross-page routing
- `js/core/page-bootstrap.js` — page activation
- `js/modules/*` — stable public facades for each functional domain
- `js/pages/*` — page-only initialization

## CSS
- `css/core.css` — shared visual primitives / compatibility styles
- `css/pages/*.css` — page-only overrides

## Upgrade rule from V3.8
Future changes should target the owning module:
- score display → `js/modules/practice/` + `css/pages/practice.css`
- library → `js/modules/library/` + `css/pages/library.css`
- import → `js/modules/importer/` + `css/pages/import.css`
- sound → `js/modules/audio/` + `css/pages/sound.css`
- AI → `js/modules/ai/`
- errors → `js/modules/errors/` + `css/pages/errors.css`

`app-core.js` is a compatibility layer. New features should not be added directly to it unless they are genuinely cross-module.


## V3.8 Page Isolation

V3.4 split routes and source folders. V3.8 adds runtime ownership isolation.

### Runtime isolation
After the legacy compatibility core has attached its listeners, `page-isolation.js` removes unrelated page trees:
- library page keeps only `homeView + songsPanel`
- import page keeps only `homeView + importPanel`
- progress page keeps only `homeView + progressPanel`
- practice / sound / errors remove `homeView`

This reduces accidental CSS/DOM coupling between unrelated features.

### Module Registry
`js/core/module-registry.js` defines required DOM IDs and owning modules for each route.

### Module Health
`js/core/module-health.js` checks required DOM after startup.
The header MODULE badge shows `OK` or `ERROR`.

### Ownership rule
Do not edit another module's DOM/CSS to solve a local issue.
If Practice needs a new button, it belongs to Practice.
If Audio needs a new control, it belongs to Audio.
Cross-module communication should use a module facade or core event, not arbitrary querySelector mutation.


## V3.8 Event Bus + Module Loader

新增 `AppEvents` 作為跨模組事件中心。

模組之間不應直接操作另一模組：
- Practice 要換音色 → emit `audio:voice`
- AI 要要求練習重建 → emit Practice event
- 任一模組錯誤 → emit `error:report`

新增 ModuleLoader：
- home → home
- library → library
- import → importer
- progress → ai
- practice → practice + audio + errors + ai
- sound → audio + errors
- errors → errors + practice dependencies

錯誤頁新增 Event Bus 事件檢視器，可查看最近 30 筆模組事件。


## V3.8 True Lazy Module Loading

V3.6 only delayed module startup, but every HTML page still contained six module `<script>` tags.

V3.8 removes those static module script references completely.

`ModuleLoader` now dynamically injects only the modules required for the active page:

- home: core only
- library: LibraryModule
- import: ImportModule
- progress: AICoachModule
- practice: PracticeModule + AudioModule + ErrorModule + AICoachModule
- sound: AudioModule + ErrorModule
- errors: ErrorModule + Practice dependencies

Dependencies are loaded automatically before their owner module starts.

Important: `app-core.js` remains the V3.x compatibility core. V3.8 is true lazy loading for domain facade modules; later versions can continue extracting legacy implementation code out of `app-core.js` module by module.


## V3.8 Core Split Phase 1 — Errors

First real implementation extraction from `app-core.js`.

Moved out of `app-core.js`:
- error record list state
- error normalization/advice
- toast UI
- error monitor rendering
- copy latest/all
- clear history
- error monitor open/close listeners
- score repair button handling

New lightweight core:
- `js/core/error-client.js`
- must exist on every page because any page can fail
- only records/persists errors and exposes `reportAppError` compatibility API

Full UI:
- dynamically loaded `js/modules/errors/index.js`
- only Practice / Sound / Errors routes load this module

This is the migration pattern for future core reduction:
1. keep only genuinely cross-page primitives in core
2. move full UI/feature implementation to its owning lazy module
3. retain compatibility API temporarily so legacy functions do not break.
