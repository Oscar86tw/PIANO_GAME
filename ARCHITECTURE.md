# V5.2 Clean Architecture

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


## V5.2 Polyphony ownership
- MIDI polyphony parsing belongs to `js/modules/importer/`
- visual hand/chord rendering belongs to `js/modules/practice/`
- core remains unchanged


## V5.2 Training ownership
- `pages/training.html`：訓練頁
- `js/pages/training.js`：音階 / 視奏 / 聽奏 / 星星 / 曲庫分類
- `data/scales.json`：音階資料
- `practice`：節拍器自動輔助、指法切換、星星評分


## V5.2 New modules
- `js/modules/input/index.js` — MIDI / microphone / virtual input
- `js/modules/scoring/index.js` — pitch + rhythm + stars
- `js/modules/metronome/index.js` — audible Web Audio metronome

Practice owns display only; Input owns hardware; Scoring owns judgment; Metronome owns click scheduling.


## V5.2 Progression
- `data/curriculum.json` — 10級到1級課程資料
- `js/modules/progression/index.js` — 星星 / 解鎖 / 每日分鐘
- `pages/course.html` — 課程路線 UI
- `js/pages/course.js` — 關卡呈現與導向

Practice / Training only award results; Progression owns unlock rules.


## V5.2 Formal Pedagogy
- `data/pedagogy.json` — formal teaching domains and mastery semantics
- `data/curriculum.json` — per-grade technique/rhythm/reading/aural/repertoire requirements
- Progression uses domain gates, not total-stars-only unlocking
- Training reads the selected grade specification to generate sight-reading and ear-training difficulty


## V5.2 Lesson Content
- `data/lesson-bank.json` — actual lesson content by grade
- `js/modules/lesson-engine/index.js` — grade-based exercise generator
- Course displays real content
- Training generates sight-reading / ear-training from the lesson bank


## V5.2 Formal Lesson Session
- `LessonEngine` owns lesson content.
- `LessonSession` owns required class-step state and review queue.
- `Progression` owns stars/unlocks.
- `ScoringEngine` owns actual note/rhythm judgment.
- Course routes into Formal Lesson before Practice/Test.


## V5.2 Complete Academy Modules
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


## V5.2 Large Score Library
- `data/scores-1000.json`: 1000 complete original pedagogical scores
- `data/scores-1000-index.json`: category manifest
- Library lazy-ish in-memory merge with existing/imported scores
- UI pagination: 30 scores per page


## V5.2 Score Renderer
- `ScoreRenderer` owns score-to-staff visualization and measure splitting.
- `Library` owns score discovery.
- `Practice` can now limit practice to selected measure ranges.
- Score Detail owns favorites / recents and range launch.
