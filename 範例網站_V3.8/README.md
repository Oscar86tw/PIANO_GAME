# PIANO LEARNING V2.2 — MIDI + Chord Recognition

## 新增 MIDI 輸入
- USB MIDI 電鋼琴 / 電子琴
- 作業系統已辨識的 Bluetooth MIDI 裝置
- Chrome / Edge 等支援 Web MIDI 的瀏覽器可直接連接
- 連接必須由使用者按「連接 MIDI」觸發

## 多音與雙手判定
MIDI 模式可判定：
- 單音
- 左手雙音
- 三和弦 / 多音
- 左右手同一拍同時出現的完整音組

每一拍會比較：
- 譜面要求的全部音
- 實際按下的全部音
- 是否缺音 / 多音 / 錯音
- 拍點誤差 ms
- chordCompleteness 完整度

只有「所有要求音都正確 + 沒有多按 + 拍點正確」才算完全吻合。

## 麥克風模式
真鋼琴仍可使用麥克風模式；目前主要適用單音辨識。多音和弦建議 MIDI，準確度明顯較高。

## 專注模式
延續 V2.1.1：判定時不閃爍、不跳亮、不脈衝。


## V2.2.1 Audio Master Clock 同步修正
- 節拍器不再由畫面幀率觸發。
- 使用 Web Audio `AudioContext.currentTime` 作為唯一主時鐘。
- 節拍聲會提前排程到精確 AudioContext 時間點。
- 五線譜位置每一幀都從 AudioContext 時間反推，不會因手機掉幀逐漸漂移。
- 譜面鋼琴示範聲也改成同一 AudioContext 時間預排程。
- 暫停、播放、倒回都重新鎖定同一音訊時間軸。

理論同步鏈：
Audio Master Clock → BPM → 節拍聲 → 音符到藍線 → 示範鋼琴聲 → MIDI/麥克風判定。


## V2.2.2 — 雙手功能完整修正

雙手模式現在完整連動：
- 高音譜表＝右手
- 低音譜表＝左手
- 雙手時兩譜同步顯示與移動
- 譜面鋼琴聲可依右手 / 左手 / 雙手模式播放
- 雙手模式的示範聲會同時播放左右手事件
- 和弦內多顆音會同時發聲
- 示範音長依譜面 durationBeats 計算
- 節拍器 / BPM / 起拍 / 暫停 / 播放 / 倒回共用 Audio Master Clock
- MIDI 可以判定雙手同拍多音
- 麥克風模式清楚標示以單音追蹤為主
- 紀錄標示右手 / 左手 / 雙手
- 修正左右手視覺音符索引衝突，改用 hand + event + chordIndex 唯一鍵
- 到拍仍維持無閃爍專注模式


## V2.3 — 練習分析與錯誤回放

紀錄區新增：
- 音高正確率
- 節拍正確率
- 完全吻合率
- 平均節拍誤差
- 右手 / 左手表現
- MIDI 和弦平均完整度
- 太早 / 準時 / 太晚 / 漏音統計
- 自動找出最弱小節
- 最弱 5 個小節排行
- 「重練」可直接跳回該小節並開啟目前小節循環
- 「練最弱小節」一鍵進入 Focus Practice

分析資料只放在紀錄區，不在彈奏畫面中跳出，維持專注模式。


## V2.4 — 電影完整樂譜

新增「電影」整首分類。

### 內建
新增 24 首原創完整電影感鋼琴曲，全部為完整長度：
- 冒險
- 魔法
- 懸疑
- 浪漫
- 太空
- 英雄
- 奇幻
- 動畫電影感
- 片尾抒情

一般為 32 小節；Level 6–8 為 36 小節。

每首都支援：
- READY 後才播放
- 完整右手 / 左手 Grand Staff
- 雙手模式
- 譜面鋼琴示範聲
- 節拍器 / BPM / 起拍
- Audio Master Clock 同步
- 播放 / 暫停 / 倒回
- MIDI 多音與和弦判定
- 麥克風單音追蹤
- 練習紀錄
- 弱小節分析與重練
- 無閃爍專注模式

### 受版權保護的電影原聲
近代電影正式主題曲與原聲鋼琴譜不直接內建完整內容。
電影分類另外提供 16 個完整 MusicXML / MIDI 授權匯入槽。
使用者匯入合法取得的完整譜後，可使用同一套完整練習功能。


## V2.5 — 曲庫管理

樂譜數量增加後，新增完整管理功能：
- 曲名 / 分類 / 調性 / BPM 關鍵字搜尋
- 依程度篩選
- 依經典 / 考試 / 時尚 / 電影 / Disney / 短練習分類
- 只看完整曲
- 收藏
- 最近練習
- 排序：曲名、程度、BPM、長度、最近練習
- 一鍵清除全部篩選
- 即時顯示目前符合條件的樂譜數量

收藏與最近練習會保存在瀏覽器 localStorage。


## V2.6 — 學習路徑＋進度保存

新增：
- 預備級 → Level 8 學習路徑
- 每級完成度
- 完成前一級 60% 後解鎖下一級
- 自動推薦下一課
- 完成課程數
- 完成完整曲數
- 星星獎勵
- 今日 15 分鐘練習目標
- 本週練習天數
- 進度資料保存在 localStorage

星星規則：
- 完全吻合率 ≥ 90%：3 ★
- ≥ 75%：2 ★
- ≥ 55%：1 ★

學習路徑與星星只顯示在首頁／進度頁，不會在彈奏畫面跳出。


## V2.7 — 考試模擬＋正式演奏

新增三種練習類型：

### 練習模式
- 可倒回
- 可小節循環
- 可使用節拍器
- 可使用譜面鋼琴示範聲
- 可開啟紀錄與弱小節分析

### 考試模擬
開始前可以完成所有準備；按下播放後：
- 鎖定 BPM、速度、左右手與模式設定
- 禁止倒回
- 禁止小節循環
- 禁止示範鋼琴聲
- 考試中不能打開紀錄分析
- 完整演奏結束後才解除鎖定
- 結束後產生 A / B / C / D / 再練習評級
- 顯示總分、音高、節奏與完整度

### 正式演奏
- 不使用示範鋼琴聲
- 不使用弱小節即時提示
- 適合完整不中斷演奏
- 保留必要播放 / 暫停與輸入判定

所有模式仍維持 READY 後由學生自行按播放才開始。


## V2.8 — 學校教材總庫

新增「學校教材」完整分類，依學生常見學習進程收納：

### 預備級 / 低年級
- 中央 C
- 五指位置
- 四分音符、二分音符
- 簡單童謠
- 單手旋律

### Level 1–2
- 八分音符
- 3/4、4/4
- C / G 大調基礎
- 傳統與公版兒童曲
- 簡單左右手

### Level 3–4
- 左手伴奏
- 附點節奏
- 小調
- 分解和弦
- 切分音
- 雙手對話

### Level 5–6
- 音階 / 琶音
- I / IV / V 和弦
- 終止式
- 視奏
- Alberti Bass
- 6/8
- 手部獨立

### Level 7–8
- 二聲部
- 和聲
- 轉調
- 中高階視奏
- 正式演奏練習
- 全課程總複習曲

本版新增 56 首學校教材類完整樂譜／完整學習曲。
其中公版與傳統旋律可直接內建；受版權保護的課本歌曲不直接內建完整內容。
另提供 16 個「學校課本／老師指定」MusicXML / MIDI 匯入槽。

所有學校教材均納入：
- 搜尋
- 收藏
- 最近練習
- 完整曲篩選
- READY
- 雙手譜
- 示範鋼琴聲
- MIDI / 麥克風
- Audio Master Clock
- 練習紀錄
- 弱小節分析
- 學習路徑
- 考試模式
- 無閃爍專注模式


## V2.9 — Photo Score Import

新增「📷 拍照樂譜」功能與曲庫分類。

### 支援來源
- 手機／平板直接開相機拍一頁
- 相簿一次選多張樂譜照片
- 掃描 PDF 原檔保存

### 多頁處理
- 頁面排序
- 前移／後移
- 90° 旋轉
- 自動偵測內容範圍並裁掉大部分白邊
- 單頁刪除
- 顯示頁數與儲存容量

### 曲目資料
- 曲名
- 作者／來源
- 程度
- 分類
- 是否完整曲

### 儲存方式
圖片／PDF 使用 IndexedDB 保存，不使用 localStorage，避免大型圖片很快超出容量。
儲存後會出現在：
- 匯入頁「我的拍照樂譜」
- 主樂譜庫「📷 拍照樂譜」分類
- 搜尋與完整曲篩選

### OMR 狀態
V2.9 已預留 Optical Music Recognition（OMR）流程，但不內建假辨識。
未連接真正的 OMR 引擎／服務前，拍照譜清楚標示「待 OMR」。
因此不會把照片猜成錯誤的音高或節奏，也不會讓尚未辨識的圖片直接進入跟譜演奏。

後續 OMR 成功輸出 MusicXML 後，可再送進目前既有 MusicXML importer，轉為 READY、雙手譜、示範聲、MIDI／麥克風判定、紀錄與分析。


## V3.0 — Studio Grand Piano Engine

新增可選鋼琴音色：
- Lite Piano
- Studio Grand
- Concert Grand
- Warm Grand
- Bright Grand
- Soft Piano

新增音質選擇：
- Lite
- Studio
- Grand

本版已讓不同音色實際改變：
- 音色亮度
- Attack
- Release
- 動態曲線
- 輕量 Room 模擬
- Sustain Pedal（MIDI CC64）
- Soft Pedal（MIDI CC67）
- Polyphony 狀態
- 音色設定保存

重要說明：
V3.0 使用現有本地鋼琴 sample 搭配音色引擎建立 6 種聲音。
畫面上的 1-step / 3-step / 5-step dynamic 是目前動態映射模式，不代表專案已經內含 5 套不同力度錄音。
真正大型多力度 Studio / Concert sample pack 後續可做成額外下載包，避免 GitHub Pages 初次載入過大。


## V3.1 — Sound Pack Manager

新增音色包管理：
- Lite Piano 內建
- Studio Grand / Concert Grand / Warm Grand / Bright Grand / Soft Piano 可安裝本機 samples
- WAV / MP3 多檔匯入
- IndexedDB 保存
- 已安裝 / 未安裝 / 目前使用中
- 顯示 sample 數與本機容量
- 重新匯入 / 移除
- C4.mp3、Cs4.wav、F#3.mp3 等檔名自動辨識
- 缺少個別琴鍵時自動使用最近 sample 做 pitch shifting
- 單音測試
- C Major 和弦測試
- 延音踏板測試

另外修正 V3.0 `playLocalPiano()` 測試聲音中 `now` 建立順序問題。

本版不附第三方大型 sample pack，以避免授權與 GitHub Pages 容量問題。
可以匯入自己合法取得或有權使用的 WAV / MP3 鋼琴 samples。


## V3.2 — AI Practice Coach

新增「AI 練習教練」區塊。

目前是本機智慧分析，不需雲端 API。

AI 教練會根據：
- 音高正確率
- 節拍正確率
- 平均節拍誤差
- 左右手差距
- MIDI 和弦完整度
- 最弱小節
- 完全吻合率

自動產生：
- 最需要改善的問題
- 弱小節練習
- 較弱手單手練習
- 建議降低 BPM
- 音高優先練習
- 和弦拆分練習
- 表現穩定時的進階建議

新增：
- 「朗讀建議」：使用瀏覽器 Speech Synthesis
- 「開始建議練習」：自動套用弱小節、較弱手與建議 BPM，回到 READY 狀態

AI 教練只在練習後的紀錄區出現，不會在彈奏中打斷學生。


## V3.3 — AI Adaptive Learning

新增自適應學習系統。

### AI 會參考最近同一首曲目的 5 次紀錄
- 完全吻合率
- 音高正確率
- 節拍正確率
- 平均拍點誤差
- 左右手差距
- 最弱小節
- 最近實際 BPM

### READY 前產生建議
AI 可能建議：
- 降低 BPM
- 維持速度
- 小幅提高速度
- 右手單手
- 左手單手
- 雙手
- 循環最弱小節
- 整首練習

AI 不會偷偷修改設定。
READY 畫面會先顯示建議，學生選：
- 套用建議
- 這次忽略

### 進度頁
新增自適應狀態：
- 近期穩定度
- 平均練習速度
- 較弱手
- 近期學習趨勢

資料保存在 localStorage。


## V3.8 — 樂譜顯示＋控制列＋錯誤監控總修正

### 樂譜顯示
- 強化 scrolling-score / music-note z-index、visibility、opacity 與尺寸
- 不再使用 inset:0 與巨大 width 的互相制約
- 音符座標加入安全範圍，避免跑出可視區
- 支援 # / b 音名的座標解析
- 靜態與播放移動改用 translate3d
- 防止 pxPerBeat / lead 未初始化導致 transform NaN
- 每次 renderStaticScore 後檢查「時間軸音符數 vs DOM 音符數」
- 有時間軸但畫面 0 顆音符時自動重新建立
- 新增「♫ 樂譜顯示」健康狀態按鈕，可手動檢查／修復

### 控制列
- audio-row 從單行 flex 改為 responsive Grid
- 桌機 4 欄 / 中型 3 欄 / 平板 2 欄 / 手機 1 欄
- 所有按鈕、下拉、音量、音色、音質均有獨立點擊區
- 禁止按鈕文字被壓成直排

### 錯誤監控
新增：
- JavaScript runtime error
- Promise error
- 樂譜建立 / 顯示異常
- MIDI 不支援 / 連線失敗
- 麥克風啟動失敗
- 鋼琴 sample 載入失敗
- 音色包匯入失敗

可查看：
- 時間
- 功能區
- 錯誤內容
- 建議處理
- stack
- 版本 / URL / 瀏覽器

可「複製最新錯誤資訊」直接貼給 AI。


## V3.8 — Modular Architecture

這版不增加新的鋼琴功能，先處理大型專案的結構問題。

### 獨立頁面
- 首頁 / 課程：`index.html`
- 樂譜庫：`pages/library.html`
- 匯入樂譜：`pages/import.html`
- 進度：`pages/progress.html`
- 練習：`pages/practice.html`
- 音色管理：`pages/sound.html`
- 錯誤診斷：`pages/errors.html`

從首頁或曲庫選曲後，會導向獨立 `practice.html`，不再直接在原頁面內切換成練習畫面。

### CSS
共用基礎放 `css/core.css`；每個頁面有自己的 `css/pages/*.css`。
未來修改 practice，不需要去動 library 的 page CSS。

### JavaScript
V3.3.2 的大型 app.js 先移為 `js/core/app-core.js` 相容核心，確保原功能保留。
新增 domain facade：
- PracticeModule
- LibraryModule
- ImportModule
- AudioModule
- AICoachModule
- ErrorModule

未來新增／修改功能優先進自己的 module，不再繼續把功能塞進單一 app.js。

### 路徑
音色 sample 路徑改用 `APP_BASE`，所以從 `/pages/*.html` 開啟也能正確找到 `assets/piano/`。


## V3.8 — Page Isolation + Module Health

第二階段模組化：

- 各頁載入完成後，會把其他頁面的 DOM 區塊移除
- 樂譜庫不再同時保留 practice DOM
- 練習頁不再同時保留首頁 / 曲庫 / 匯入 DOM
- 音色頁與錯誤頁只保留自己需要的管理視窗
- 新增 Module Registry，定義每頁該有哪些必要元件
- 新增 Module Health Check
- 頁首 MODULE 按鈕會顯示 OK / ERROR
- 點 MODULE 可以看到缺少哪個元件
- 模組初始化錯誤會送到既有錯誤監控

這樣之後改某一頁時，其他頁面的 CSS / DOM 不會在背景一起受到影響。


## V3.8 — Event Bus + Lazy Module Startup

第三階段模組化：

- 新增 AppEvents 事件中心
- 新增 ModuleLoader
- 模組不再透過 facade 直接呼叫其他核心功能，改由事件橋接
- 每頁只啟動自己需要的功能模組
- Practice 自動帶 Audio / Errors 相依模組
- Progress 只啟動 AI
- Library 只啟動 Library
- Import 只啟動 Importer
- Sound 只啟動 Audio / Errors
- 錯誤診斷頁新增「模組事件紀錄」
- Module Health 同時檢查模組是否成功啟動

這一版讓未來修改某個功能時，模組之間的耦合再降低一層。


## V3.8 — True Lazy Module Loading

V3.6 每一頁仍然把六個 `js/modules/*/index.js` 都下載，只是沒有全部啟動。

V3.8 已移除所有頁面的固定 module script。

現在 ModuleLoader 會按照頁面需要才下載：
- 首頁：不下載功能 module
- 樂譜庫：只下載 Library
- 匯入：只下載 Importer
- 進度：只下載 AI
- 練習：下載 Practice / Audio / Errors / AI
- 音色：只下載 Audio / Errors
- 錯誤頁：下載 Errors 與 Practice 相依模組

錯誤診斷頁新增「目前實際載入模組」，可直接檢查本頁到底下載、啟動了哪些 module。

注意：V3.8 仍保留 `app-core.js` 相容核心，以避免一次把既有鋼琴、譜面、MIDI、照片等實作全部重寫造成回歸。


## V3.8 — Core Split Phase 1：錯誤監控正式拆出 app-core

這次開始真正縮小 `app-core.js`，不是只有 facade。

已從 `app-core.js` 搬出去：
- 錯誤紀錄管理
- Toast
- 錯誤列表
- 複製最新 / 全部
- 清除紀錄
- 錯誤診斷視窗控制
- 重新建立樂譜按鈕處理

新增：
- `js/core/error-client.js`：每頁都載入的最小錯誤接收器
- `js/modules/errors/index.js`：完整錯誤 UI，只有需要的頁面才 Lazy Load

因此首頁 / 曲庫 / Import 不需要下載完整 Errors UI，但仍然可以捕捉 JavaScript 錯誤。
