# PIANO LEARNING V5.3 Clean Rebuild

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


## V5.3 — MusicXML / MIDI Import Engine

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

目前 V5.3 為安全移植第一階段：
MusicXML 多聲部與 MIDI 同時和弦先取主要旋律，會明確顯示略過數量，不會假裝已完整保留。


## V5.3 — MIDI Polyphony + Grand Staff

新增：
- MIDI 同時間多音完整保留
- 同拍和弦事件可保存為 note array
- MIDI 依中央 C（MIDI 60）自動分左右手
- Practice 重新支援 Grand Staff 雙手顯示
- 右手深灰、左手紫色
- 同拍和弦音頭同時顯示
- Practice 顯示實際音符數

V5.3 之後：
MIDI 不再為了簡化而只取最高音。

目前 MusicXML 仍以主要 voice 為主；下一版可繼續處理 MusicXML 多聲部 / chord / staff 1/2。


## V5.3 — Kids Training Suite

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


## V5.3 — Input & Scoring Engine

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


## V5.3 — Course Progression 10級 → 1級

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


## V5.3 — Formal Pedagogy Curriculum

V5.3 把 10級→1級改成「正規教學邏輯」，不是只靠遊戲星星升級。

### 四個核心能力
1. 技巧・音階・指法
2. 五線譜・視奏
3. 聽力・聽奏
4. 曲目・演奏

### 升級規則
- 每一類至少 3 顆星
- 同時達成本級總星星門檻
- 任一核心能力未達 3 顆，不可用其他高分補掉
- V4.5 舊進度可遷移星星，但解鎖會依 V5.3 新規則重新計算

### 教學順序
坐姿/手型 → 指號 → 五指位置 → 基本節奏 → 地標音 →
級進/跳進 → 一個八度音階 → 和弦/調號 → 雙手 →
兩個八度/琶音 → 複合拍 → 多聲部 → 踏板/音色 →
快速視奏/聽力 → 完整演奏能力

### 每級內容真正不同
V5.3 的 curriculum.json 現在每級都有：
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


## V5.3 — Lesson Content Bank

V4.6 是正規課綱；V5.3 開始把「教材內容」真正填進去。

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

V5.3 的目標是讓「10級、9級、8級……」不只是標題，而是真的出不同內容。


## V5.3 — Formal Lesson Flow

V5.3 把「教材」變成真正的一堂課。

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

V5.3 的目標：更接近真正鋼琴老師的上課流程，而不是選題後直接考試。


# V5.3 COMPLETE PIANO ACADEMY

V5.3 不再用小版本逐項補功能，而是整合成完整學院。

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
V5.3 的 10級→1級是本 App 的自訂課程進程，吸收正式鋼琴教學常見能力結構，但不是 ABRSM、Trinity、RCM 或任何單一官方檢定的等值表。


# V5.3 — 1000 Complete Score Library

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


# V5.3 — Score Engraving & Library UX

V5.3 將 V5.1 的 1000 首 events 進一步變成「可閱讀、可挑小節」的樂譜體驗。

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


# V5.3 — MASTER CLOCK SYNC + STAFF GEOMETRY FIX

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
