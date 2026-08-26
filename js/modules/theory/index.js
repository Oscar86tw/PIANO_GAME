
window.TheoryEngine={
  async bank(){return fetch(AppBase+'data/theory-bank.json').then(r=>r.json())},
  score(answer,question){return Number(answer)===Number(question.answer)},
  stars(percent){return percent>=95?5:percent>=85?4:percent>=75?3:percent>=60?2:1}
};
