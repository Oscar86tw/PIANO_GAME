# PIANO LEARNING V1.8 — Score Import

## 新增 MusicXML / MIDI 匯入
首頁新增「匯入樂譜」。

支援：
- `.musicxml`
- `.xml`
- `.mid`
- `.midi`

匯入後會解析：
- 音高
- 音符時值 / 休止
- BPM
- 拍號
- 調性（MusicXML）

匯入成功後會加入歌曲庫，並把解析後資料存入瀏覽器 localStorage。
重新開啟網站仍可使用。

## READY 流程
匯入譜與內建譜一樣：
1. 選譜
2. 進 READY
3. 先調 BPM / 速度 / 左右手 / 麥克風 / 節拍器 / 示範鋼琴聲
4. 按 ▶ 才開始

## V1.8 匯入限制
目前練習引擎仍是單一旋律線：
- MusicXML 先讀第一個主要 voice；其他 voice 暫時略過。
- MusicXML chord 標記的附加音暫時略過。
- MIDI 同時出現多個音時暫取最高音作為旋律線。

下一階段會擴充雙手 Grand Staff、和弦與多聲部。
