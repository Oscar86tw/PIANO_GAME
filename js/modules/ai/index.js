
window.AICoach={build(stats={}){const pitch=stats.pitch??100,rhythm=stats.rhythm??100,timing=stats.timing??0;let summary='表現穩定，可以維持速度繼續練習。',steps=[];if(pitch<80){summary='目前音高正確率較低，先慢速確認音符。';steps.push('先單手慢速練習','確認每顆音再往下一拍')}if(rhythm<80||timing>180){summary='目前節拍比較需要加強。';steps.push('降低約 20% BPM','開啟節拍器重新對齊拍點')}if(!steps.length)steps=['完整彈一次','穩定後提高 5 BPM'];return{summary,steps}}};
