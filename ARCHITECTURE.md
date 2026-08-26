# V5.8 Clean Architecture

## Core
- storage.js
- events.js
- router.js
- error-client.js
- audio-engine.js

## Modules
- library
- practice
- importer
- audio
- ai
- errors

## Rules
- 不使用單一巨大 app.js
- 一頁一責任
- 一功能一模組
- 頁面只載自己需要的 module
- 舊 V3.8 僅供參考，不參與 runtime

## Ownership
- 譜面 → practice
- 曲庫 → library
- 拍照 / MusicXML / MIDI → importer
- 音色 → audio
- AI → ai
- 錯誤 → errors


## V5.8 Polyphony ownership
- MIDI polyphony parsing belongs to `js/modules/importer/`
- visual hand/chord rendering belongs to `js/modules/practice/`
- core remains unchanged


## V5.8 Training ownership
- `pages/training.html`：訓練頁
- `js/pages/training.js`：音階 / 視奏 / 聽奏 / 星星 / 曲庫分類
- `data/scales.json`：音階資料
- `practice`：節拍器自動輔助、指法切換、星星評分


## V5.8 New modules
- `js/modules/input/index.js` — MIDI / microphone / virtual input
- `js/modules/scoring/index.js` — pitch + rhythm + stars
- `js/modules/metronome/index.js` — audible Web Audio metronome

Practice owns display only; Input owns hardware; Scoring owns judgment; Metronome owns click scheduling.


## V5.8 Progression
- `data/curriculum.json` — 10級到1級課程資料
- `js/modules/progression/index.js` — 星星 / 解鎖 / 每日分鐘
- `pages/course.html` — 課程路線 UI
- `js/pages/course.js` — 關卡呈現與導向

Practice / Training only award results; Progression owns unlock rules.


## V5.8 Formal Pedagogy
- `data/pedagogy.json` — formal teaching domains and mastery semantics
- `data/curriculum.json` — per-grade technique/rhythm/reading/aural/repertoire requirements
- Progression uses domain gates, not total-stars-only unlocking
- Training reads the selected grade specification to generate sight-reading and ear-training difficulty


## V5.8 Lesson Content
- `data/lesson-bank.json` — actual lesson content by grade
- `js/modules/lesson-engine/index.js` — grade-based exercise generator
- Course displays real content
- Training generates sight-reading / ear-training from the lesson bank


## V5.8 Formal Lesson Session
- `LessonEngine` owns lesson content.
- `LessonSession` owns required class-step state and review queue.
- `Progression` owns stars/unlocks.
- `ScoringEngine` owns actual note/rhythm judgment.
- Course routes into Formal Lesson before Practice/Test.


## V5.8 Complete Academy Modules
- academy: global curriculum / daily progress
- lesson-session: formal lesson steps
- lesson-engine: lesson content generation
- input: MIDI / microphone
- scoring: pitch / timing / stars
- metronome: automatic click
- theory: theory quizzes
- rhythm: pulse / tap evaluation
- exam: complete mock exam
- progression: compatibility with older V4 course progress

New pages:
- academy.html
- theory.html
- rhythm.html
- exam.html
- teacher.html


## V5.8 Large Score Library
- `data/scores-1000.json`: 1000 complete original pedagogical scores
- `data/scores-1000-index.json`: category manifest
- Library lazy-ish in-memory merge with existing/imported scores
- UI pagination: 30 scores per page


## V5.8 Score Renderer
- `ScoreRenderer` owns score-to-staff visualization and measure splitting.
- `Library` owns score discovery.
- `Practice` can now limit practice to selected measure ranges.
- Score Detail owns favorites / recents and range launch.


## V5.8 Time Architecture
AudioContext.currentTime
→ TransportMaster beat
→ Practice visual position
→ DemoScheduler note timestamps
→ Metronome click timestamps
→ Scoring timing

No independent visual/performance timer is allowed to define musical time.

## V5.8 Staff Geometry
StaffGeometry is the sole geometry source for:
- practice grand staff
- score viewer
- note vertical position
- ledger-line threshold


## V5.8 Event Lock
EventTimeline is the single event timing source:
`{ index, startBeat, duration, endBeat, note }`

Practice visual, DemoScheduler and ScoringEngine consume the same timeline.

## V5.8 Audio Health
AudioEngine preloads samples in parallel and exposes health().
Synth fallback guarantees audible output if sample loading fails.


## V5.8 Audio Mixer
Audio routing:
- Piano samples / synth fallback → pianoGain
- Metronome click → metroGain
- both buses → masterGain → destination

Volume settings persist independently of tempo/transport state.


## V5.8 Lead-In Architecture

A 7-second ready buffer is represented as negative musical beat time:

`leadInBeats = BPM × 7 / 60`

Transport starts at `-leadInBeats`.
The first score event remains at `startBeat = 0`.

This guarantees:
- visual note reaches judgement line at beat 0
- demo audio starts at beat 0
- metronome first click starts at beat 0
- scoring starts at beat 0
- no separate countdown clock can drift


## V5.8 Focus UX
Settings drawer only changes presentation. It does not recreate or stop TransportMaster, EventTimeline, DemoScheduler, Metronome or ScoringEngine.

Hand focus is a CSS emphasis layer; underlying score data remains unchanged.


## V5.8 Personal Score Images
`data/personal-scores.json` stores user-provided score-image metadata.
Score Detail can render `photoScore` entries directly from `pageImages`.
Photo-only scores are viewable immediately; playable EventTimeline data can be added later without replacing the original scan.


## V5.9 Personal Score Batch Import

- 新增 personal score images 共 8 張教材照片。
- personal-scores.json 新增 8 個條目（含多頁條目與共用頁面條目）。
- 圖檔置於 assets/user-scores/*。
- 仍採 photoScore 模式，由 score-detail.js 直接讀取 pageImages 渲染。


## V6.0 Photo Score → Sync Practice

- 在 personal-scores.json 為 9 首使用者照片教材加入 events、timeSig、fingering、syncReady。
- 維持 photoScore/pageImages 顯示，並同步提供 practice.html 練習入口。
- score-detail.js 已調整：當 photoScore 同時擁有 events 時，仍顯示照片頁，但允許直接進入同步練習與小節範圍練習。
- 此版屬於 starter synchronization layer，後續可逐首精修音高、和弦、節拍與指法。


## V6.1 Mobile Camera Upload + Sync Builder
- 新增 `photo-library-v61`：手機拍照後直接加入曲庫。
- `savePhotoToLibrary()`：圖片壓縮為 JPEG data URL 後保存。
- `convertPhotoToSync()`：依模板把照片樂譜轉成可同步練習版。
- `Library.load()` 已納入 photo-library-v61。
- `score-detail.js` 支援 data URL 圖片與未轉同步版提示。
- 匯入頁新增同步轉換面板，可直接在手機完成整個流程。
