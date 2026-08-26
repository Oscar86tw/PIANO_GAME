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
