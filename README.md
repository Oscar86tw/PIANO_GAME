# PIANO LEARNING V1.4 — Local Piano

## 修正
V1.3 的鋼琴聲依賴外部 Tone.js / SoundFont CDN，部分手機、平板或 GitHub Pages 環境可能載入失敗。

V1.4 改成「本地鋼琴取樣」：
- 專案內直接包含 `30` 個 Acoustic Grand Piano MP3 sample。
- 音色位於 `assets/piano/`。
- 執行時不再向第三方音色 CDN 下載。
- 不再需要 Tone.js。
- 使用瀏覽器原生 Web Audio API。
- 其他音高會用最近的 sample 做少量 pitch-shift。
- 本地取樣總大小約 0.34 MB。
- 第一次按「譜面鋼琴聲：關」會載入本地 sample，完成後立即播放 C4 測試音。
- 瀏覽器會快取本地 sample。

## GitHub
上傳時務必連同整個 `assets/piano/` 資料夾一起上傳，不能只覆蓋 index.html / app.js。
