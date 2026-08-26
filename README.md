# PIANO GAME V0.1

真鋼琴互動練習遊戲原型。

## V0.1 已完成
- 三首測試歌曲
- Follow Me（彈對才前進）
- Free Play
- 瀏覽器麥克風收音
- 單音音高估算（Autocorrelation）
- 現在應彈 / 現場聽到音符
- 畫面琴鍵同步
- 分數 / Combo / 正確率 / 三星
- 手機與平板響應式版面
- 可直接部署 GitHub Pages

## 使用方式
1. 將全部檔案放到 GitHub repository 根目錄。
2. GitHub → Settings → Pages → Deploy from a branch → main / root。
3. 用 HTTPS 的 GitHub Pages 網址開啟。
4. 點「啟動麥克風」並允許權限。
5. 把平板、手機或筆電放在鋼琴附近後開始彈。

## 注意
V0.1 是單音辨識原型。真鋼琴因泛音、踏板、環境聲與同時多音，純麥克風辨識不是 100% 精準。下一版建議增加：
- 音高穩定器與連續幀確認
- 校正靈敏度
- 節奏 / BPM / 提早與延遲判定
- MIDI Input（電子琴高精準模式）
- MusicXML/MIDI 樂譜匯入
- 小節 Loop
- 練習歷史
- 多音/和弦辨識
