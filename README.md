# PIANO LEARNING V6.2 Clean Rebuild

全新主程式，不再引用 V3.x `app-core.js`。

## 獨立頁面
- index.html：首頁
- pages/library.html：樂譜庫
- pages/practice.html：練習
- pages/import.html：拍照 / MusicXML / MIDI
- pages/sound.html：鋼琴音色
- pages/progress.html：進度 / AI
- pages/errors.html：錯誤診斷

## 已重建
- 樂譜庫 / 搜尋 / 分級
- READY 練習
- 譜面移動
- BPM / 手別 / 模式 UI
- 本地鋼琴 sample
- 六種鋼琴音色選擇
- 拍照樂譜保存（待 OMR）
- MusicXML / MIDI 專用入口
- AI 建議
- 進度
- 全站錯誤捕捉

## 範例網站
完整 V3.8 保存在 `範例網站_V3.8/`，V4 runtime 不引用它。

## 下一步移植
從範例網站逐項移植：
- 完整 MusicXML parser
- MIDI parser / Web MIDI
- 麥克風音高判定
- 雙手和弦
- 完整評分 / 考試模式
- Photo Score IndexedDB 圖片原檔
- 完整音色包管理


## V6.2 — MusicXML / MIDI Import Engine

新增真正數位譜 parser：
- MusicXML / XML
- Standard MIDI / MID
- BPM
- 拍號
- MusicXML key
- 休止符
- 音符時值
- MIDI delta time / running status / tempo meta event / time signature meta event

匯入成功：
1. 解析
2. 顯示結果與警告
3. 保存 localStorage
4. 自動合併到 V4 Library
5. 可直接從 Import 或 Library 進 Practice

目前 V6.2 為安全移植第一階段：
MusicXML 多聲部與 MIDI 同時和弦先取主要旋律，會明確顯示略過數量，不會假裝已完整保留。


## V6.2 — MIDI Polyphony + Grand Staff

新增：
- MIDI 同時間多音完整保留
- 同拍和弦事件可保存為 note array
- MIDI 依中央 C（MIDI 60）自動分左右手
- Practice 重新支援 Grand Staff 雙手顯示
- 右手深灰、左手紫色
- 同拍和弦音頭同時顯示
- Practice 顯示實際音符數

V6.2 之後：
MIDI 不再為了簡化而只取最高音。

目前 MusicXML 仍以主要 voice 為主；下一版可繼續處理 MusicXML 多聲部 / chord / staff 1/2。


## V6.2 — Kids Training Suite

新增：
- 音階練習（含 C / G 與雙手示範）
- 指法顯示切換
- 雙手訓練
- 視奏訓練（10級、9級隨機視奏）
- 聽奏訓練（播放題目 / 作答 / 修正）
- 拍子不對自動開節拍器（示範邏輯）
- 每次 1～5 顆星星獎勵
- 兒童曲庫分類：流行音樂、古典音樂、卡通歌、熱門歌、宮崎駿
- 訓練中心獨立頁面：pages/training.html

這版優先提供手機也能操作的訓練流程。


## V6.2 — Input & Scoring Engine

這版把 V4.3 的示意功能改成真正判定引擎。

### 真正輸入
- Web MIDI 即時 Note On
- 麥克風 getUserMedia
- 自相關音高偵測
- MIDI / 麥克風 / 虛擬琴鍵統一輸入事件

### 真正評分
- 依樂譜時間軸找目前應彈音
- 音高正確 / 錯音
- 節拍早 / 準 / 晚
- timing error ms
- 和弦多音完成度
- 音高 %
- 節拍 %
- 完全吻合 %
- 完成度
- 1～5 顆星自動計算

### 自動節拍器
最近輸入若持續大幅早 / 晚，Scoring Engine 會發出 auto-metronome 事件，Practice 真正啟動 Web Audio 節拍器。

### 聽奏
訓練頁可用：
- MIDI
- 麥克風
- 畫面琴鍵
作答。彈錯直接顯示「你彈什麼 / 正確是什麼」。

### 視奏
10級與9級的隨機規則再擴充，並避免連續產生完全相同題目。

注意：
麥克風功能需要瀏覽器允許麥克風權限；部署到 GitHub Pages HTTPS 時最適合使用。


## V6.2 — Course Progression 10級 → 1級

新增真正兒童課程路線：

- 10級
- 9級
- 8級
- 7級
- 6級
- 5級
- 4級
- 3級
- 2級
- 1級

每一級四個任務：
1. 音階 / 指法
2. 視奏
3. 聽奏
4. 兒童曲目

每關最高 5 顆星。
本級累積達到解鎖門檻，才會自動開下一級。

### 星星與進度
- 最高星星紀錄
- 嘗試次數
- 最佳分數
- 是否完成
- 總星星
- 今日練習分鐘
- 自動解鎖下一級
- localStorage 保存

### 與 V4.4 整合
Practice 真實評分結束後，若是從 Course 進入，會把實際 1～5 顆星寫入課程進度。
Training 的視奏 / 聽奏 / 音階也會寫入同一套 Course Progression。


## V6.2 — Formal Pedagogy Curriculum

V6.2 把 10級→1級改成「正規教學邏輯」，不是只靠遊戲星星升級。

### 四個核心能力
1. 技巧・音階・指法
2. 五線譜・視奏
3. 聽力・聽奏
4. 曲目・演奏

### 升級規則
- 每一類至少 3 顆星
- 同時達成本級總星星門檻
- 任一核心能力未達 3 顆，不可用其他高分補掉
- V4.5 舊進度可遷移星星，但解鎖會依 V6.2 新規則重新計算

### 教學順序
坐姿/手型 → 指號 → 五指位置 → 基本節奏 → 地標音 →
級進/跳進 → 一個八度音階 → 和弦/調號 → 雙手 →
兩個八度/琶音 → 複合拍 → 多聲部 → 踏板/音色 →
快速視奏/聽力 → 完整演奏能力

### 每級內容真正不同
V6.2 的 curriculum.json 現在每級都有：
- keys
- technique
- rhythm
- reading
- aural
- sight-reading range / length / hands
- ear-training range / length
- repertoire direction
- tempo
- mastery gate

這套 10→1 是本 App 的自訂教學分級，不宣稱等同任何單一官方檢定級別。


## V6.2 — Lesson Content Bank

V4.6 是正規課綱；V6.2 開始把「教材內容」真正填進去。

新增 `data/lesson-bank.json`，每級都有：
- 技巧實際練習題
- 指法
- 建議 BPM
- 節奏時值池
- 視奏題型
- 視奏音域
- 聽力題型
- 曲目任務
- 正式練習流程

新增 Lesson Engine：
- `js/modules/lesson-engine/index.js`
- 可依級別產生視奏題
- 可依級別產生聽奏題
- 可取得該級技巧練習 / 曲目任務
- Course 頁可展開查看每級真正教材

V6.2 的目標是讓「10級、9級、8級……」不只是標題，而是真的出不同內容。


## V6.2 — Formal Lesson Flow

V6.2 把「教材」變成真正的一堂課。

固定課堂順序：
1. 老師示範
2. 慢速分段
3. 單手練習
4. 雙手練習
5. 正常速度
6. 正式測驗

規則：
- 必要步驟不可跳過
- 每一步保存完成狀態
- 正式測驗才給最終 1～5 顆星
- 3★ = 達標
- 低於 3★ 自動加入 Review Queue
- Progress 頁顯示「今天要複習」
- 從 Course 點任何課，先進 `pages/lesson.html`

新增：
- `js/modules/lesson-session/index.js`
- `pages/lesson.html`
- `js/pages/lesson.js`
- `css/lesson.css`

V6.2 的目標：更接近真正鋼琴老師的上課流程，而不是選題後直接考試。


# V6.2 COMPLETE PIANO ACADEMY

V6.2 不再用小版本逐項補功能，而是整合成完整學院。

## 核心能力
1. 技巧・音階・指法
2. 節奏・拍感
3. 五線譜・視奏
4. 聽力・聽奏
5. 樂理・音樂知識
6. 曲目・演奏
7. 音樂表現・創造
8. 弱項複習

## 完整功能
- 10級→1級
- 正式 Lesson Flow
- 技巧 / 音階 / 琶音 / 和弦
- 指法
- Grand Staff
- Sight Reading
- Ear Training
- Rhythm Training
- Theory
- Repertoire
- MIDI
- Microphone pitch detection
- Pitch / rhythm / exact scoring
- Auto Metronome
- 1–5 stars
- Review Queue
- Daily 15-minute goal
- Academy Progress
- Teacher / Parent dashboard
- Mock Exam
- MusicXML / MIDI import
- Photo Score pending OMR
- Error Diagnostics

## 版權
熱門歌、Disney、宮崎駿、電影、卡通等受版權保護的完整樂譜，不內建未授權內容。
系統提供：
- 公版作品
- 原創風格曲
- 授權 / 自有 MusicXML、MIDI 匯入槽

## 分級聲明
V6.2 的 10級→1級是本 App 的自訂課程進程，吸收正式鋼琴教學常見能力結構，但不是 ABRSM、Trinity、RCM 或任何單一官方檢定的等值表。


# V6.2 — 1000 Complete Score Library

新增 1000 首「完整原創教學樂譜」；不是 1000 個空白曲名。

分類：
- 音階・技巧：160
- 視奏練習：160
- 節奏練習：120
- 古典風格原創：140
- 流行風格原創：120
- 卡通風格原創：100
- 動畫・電影風格原創：100
- 雙手練習：60
- 聽奏練習：40

合計：1000 首。

每首包含：
- 完整 events
- BPM
- 拍號
- 調性
- 級別
- 小節數
- 完整譜標記
- 分類
- 可直接進 Practice
- 部分音階譜含 fingering
- 部分雙手/風格曲含 chord / polyphony

新增：
- data/scores-1000.json
- data/scores-1000-index.json
- pages/score-categories.html
- Library 分頁、搜尋、分類、級別過濾

版權：
受版權保護的熱門歌 / 卡通 / Disney / 宮崎駿 / 電影完整樂譜不直接內建。
這些分類使用原創風格曲與授權 / 自有 MusicXML、MIDI 匯入。


# V6.2 — Score Engraving & Library UX

V6.2 將 V5.1 的 1000 首 events 進一步變成「可閱讀、可挑小節」的樂譜體驗。

新增：
- Grand Staff 樂譜預覽
- 高音 / 低音譜表
- 左右手顏色區分
- 升記號
- 休止符
- 小節線
- 小節編號
- ledger line
- 指法
- note duration 外觀
- 完整樂譜詳情頁
- 指定小節練習
- 收藏
- 最近使用
- Library 收藏 / 最近篩選
- Library 「看完整譜」按鈕

新增：
- js/modules/score-renderer/index.js
- css/score-renderer.css
- pages/score-detail.html
- js/pages/score-detail.js


# V6.2 — MASTER CLOCK SYNC + STAFF GEOMETRY FIX

這版優先修正三個核心問題：

## 1. 唯一 Master Clock
五線譜移動、譜面鋼琴聲、節拍器、即時節拍判定全部以：
`AudioContext.currentTime → TransportMaster → currentBeat`
為唯一時間來源。

BPM 改變時：
- 保留目前 beat
- 重建 tempo anchor
- 五線譜立即跟新速度
- Demo Score 重新排程
- Metronome 重新排程
- Scoring 直接用 master beat 判斷
因此不再有每個模組自己累積誤差。

## 2. 五線譜尺寸統一
Practice 與完整樂譜 Viewer 共用 `StaffGeometry`：
- 高音譜表：5 條
- 低音譜表：5 條
- 每條線固定 12px
- 音高每半線距 6px
- 高低音譜表列高一致
- Grand Staff 中央間距固定

## 3. 節拍器改為 Audio Clock 排程
不再用 setInterval 的觸發時間當真正拍點。
setTimeout 只負責「提前喚醒 scheduler」；
實際 click 時間由 AudioContext timestamp 決定。

新增：
- js/core/staff-geometry.js
- js/modules/transport/index.js
- js/modules/demo-scheduler/index.js


# V6.2 — EVENT LOCK + AUDIO HEALTH FIX

修正實機發現的兩個問題。

## 音符碰線才出聲
新增 EventTimeline。每個音符只有一個 startBeat，同一個 startBeat 同時供：
- Practice 畫面 X 位置
- DemoScheduler 聲音排程
- Scoring 判定拍點

Beat 0 音符中心直接對齊藍色判定線，不再使用固定 220px 起點。

## 部分樂譜沒有聲音
AudioEngine 改為：
- 開始前平行預載所有 piano samples
- 支援 # 與 b 音名
- 任意音高使用最近 sample pitch shift
- samples 全部失敗時使用 Web Audio synth fallback
- Practice 顯示音色健康狀態


# V6.2 — AUDIO MIXER

新增三組獨立音量：
- 鋼琴聲：0–200%，預設 135%
- 節拍器：0–150%，預設 72%
- 總音量：0–150%，預設 100%

音量設定保存到 localStorage，下次開啟保留。

AudioEngine 新增三層 Gain Bus：
Piano → PianoGain → MasterGain → Output
Metronome → MetroGain → MasterGain → Output

調整 BPM 不會改變音量；調音量也不會影響 Master Clock。


# V6.2 — 7-SECOND READY BUFFER

按「開始」後新增固定 7 秒準備時間。

流程：
1. 按開始
2. Master Clock 從負 beat 開始
3. 第一顆音符從右側往藍線移動
4. 畫面顯示 READY 7.0 → 0.0 秒
5. Beat 0 時第一顆音符中心碰到藍線
6. 同一瞬間：
   - Demo Piano 才出聲
   - Scoring 才開始判定
   - 節拍器第一拍才開始
   - READY 變成 GO

重要：
- 沒有另外建立一個獨立 7 秒 timer
- 7 秒緩衝仍使用同一個 AudioContext Master Clock
- 因此五線譜 / 音符 / 琴聲 / 節拍器 / Scoring 仍保持同步
- 準備時間內彈琴不計錯


# V6.2 — FOCUS PRACTICE + SETTINGS DRAWER

依照 V2.9 練習畫面的優點重新整理：
- 五線譜是主要視覺
- 設定開始前展開
- 按開始後設定自動收起
- 練習中只保留精簡控制列
- 可隨時用「設定」重新展開抽屜

手部模式：
- 右手：高音譜表清楚，左手淡化
- 左手：低音譜表清楚，右手淡化
- 雙手：Grand Staff 完整顯示

保留 V5.6：
- 7 秒 READY
- Master Clock
- Event Lock
- Audio Mixer
- MIDI / 麥克風
- Scoring / Stars


# V6.2 — USER SCHOOL SCORE: THE WAMPUS CATS

新增使用者提供的學校教材譜面：
- Dueling High School Bands
- 1. The Wampus Cats｜貓人隊
- 分類：學校教材 → 個人教材匯入
- 目前保存上傳的第 1 頁（可見小節約 1–16）
- 原始照片譜面完整保留
- 未提供的後續頁不自行補入

新增 `data/personal-scores.json`，Library 會優先合併個人教材。


## V5.9 — 使用者教材批次匯入（照片樂譜）

本次新增 8 張使用者提供教材照片，整理成以下照片樂譜條目：
- The Thunder Hawks｜迅雷鷹隊
- Moonlight Sonata｜月光奏鳴曲（2 頁）
- Virtuoso Chord Patterns｜精湛的和弦進行
- Virtuoso Scale Patterns｜精湛的音階進行
- Silver Rain Etude｜銀雨練習曲（2 頁）
- G Scale in Contrary Motion｜反向進行 G 大調音階
- Scale Toccata in G｜G 大調音階觸技曲
- Circle Shapes｜圓圈圈

以上皆放入：學校教材 / 技巧訓練 → 個人教材匯入。
目前先以原始照片樂譜保存，可在樂譜庫直接開啟；若之後要做同步播放、碰線判定、節拍器同步與自動評分，再另外建立音符事件資料。


## V6.0 — 照片教材轉成可同步練習版

本次把目前已匯入的照片教材樂譜，補上第一版同步音符事件資料，讓它們可以直接進入：
- 7 秒準備時間
- BPM / 五線譜 / 節拍器同步
- 左手 / 右手 / 雙手練習
- 即時輸入判定與星星評分

已轉成同步練習版的曲目：
- The Wampus Cats｜貓人隊
- The Thunder Hawks｜迅雷鷹隊
- Moonlight Sonata｜月光奏鳴曲
- Virtuoso Chord Patterns｜精湛的和弦進行
- Virtuoso Scale Patterns｜精湛的音階進行
- Silver Rain Etude｜銀雨練習曲
- G Scale in Contrary Motion｜反向進行 G 大調音階
- Scale Toccata in G｜G 大調音階觸技曲
- Circle Shapes｜圓圈圈

說明：
- 目前這一版為「同步練習版第一版」，以你上傳的頁面內容為基礎整理成可練習事件資料。
- 原始照片頁面仍保留，可在樂譜詳情頁繼續查看。
- 之後可再逐首細修到更貼近原譜每一顆音、每個和弦與指法。


## V6.2 手機拍照上傳＋同步練習轉換

這一版新增了手機友善流程：
- 可直接用手機相機拍樂譜並上傳。
- 拍照後會立刻加入「曲庫」。
- 保留原始照片頁面，可在樂譜詳情頁查看。
- 可在匯入頁直接按「轉同步版」，建立同步練習事件資料。
- 轉換後可直接進入練習頁，使用 7 秒準備時間、節拍器同步、左右手 / 雙手模式與即時判定。

### 實作方式
- 手機拍照圖片會先壓縮後存入瀏覽器本機儲存（localStorage）。
- 同步練習版目前屬於 **starter conversion**：會依你選的模板（右手單音 / 左手單音 / 雙手分解 / 雙手和弦 / 音階 / 技巧練習曲）建立可運作的同步事件資料。
- 原始照片不會被假裝 OCR 成錯誤音符；後續仍可逐首精修。


## V6.2 — 大五線譜＋拍點漸層提示
- 練習畫面的五線譜放大為主視覺。
- 高音 / 低音譜表都增加線距、音符大小與譜號尺寸。
- Focus Practice 模式下可佔約 70% 螢幕高度。
- 音符在距離判定線約 2.4 拍內開始平滑變色，越靠近拍點越接近青色。
- 不使用閃爍、縮放、跳動或 pulse；只有連續顏色插值與柔和光暈。
- 碰線判定、聲音與節拍器仍由同一 Master Clock 控制。


## V6.4 — 手機拍照樂譜流程強化
- 明確的「拍第一頁」「拍下一頁」「從相簿選多頁」按鈕。
- 支援多頁連拍、頁面順序前移/後移、單頁刪除、整批清除。
- 加入曲庫後可直接轉同步練習版。
- 所有網站頁面可見版本號同步更新為 V6.4。


## V6.4 — 手機拍照樂譜管理器
- 拍照頁面改存 IndexedDB，避免多頁照片塞爆 localStorage。
- 支援多頁拍攝、前移、後移、旋轉 90°、刪頁、重新拍第一頁。
- 顯示瀏覽器儲存空間使用量。
- 刪除曲目時會同步清除 IndexedDB 圖片。
- 原有「加入曲庫 → 轉同步練習版」流程保留。
