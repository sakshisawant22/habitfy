// --- Habit Tracker Logic ---
const STORAGE_KEY = 'habits_v1';
let state = { habits: [] };

function uid(){ return Math.random().toString(36).slice(2,9); }
function todayIndex(){ return currentSpan()-1; }
function currentSpan(){ return parseInt(document.getElementById('spanSelect').value,10)||7; }

function loadState(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(raw) state = JSON.parse(raw);
}
function saveState(){
  state.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  render();
}
function initSpanForHabits(){
  const span=currentSpan();
  state.habits.forEach(h=>{
    if(!h.days||h.days.length!==span){
      const newDays=new Array(span).fill(false);
      if(h.days){ 
        for(let i=0;i<Math.min(h.days.length,span);i++){ 
          newDays[span-1-i]=h.days[h.days.length-1-i]; 
        } 
      }
      h.days=newDays;
    }
  });
}
function addHabit(title){
  const span=currentSpan();
  state.habits.unshift({id:uid(),title:title.trim(),days:new Array(span).fill(false)});
  saveState();
}
function toggleDay(id,idx){
  const h=state.habits.find(x=>x.id===id); 
  if(!h) return;
  h.days[idx]=!h.days[idx]; 
  saveState();
}

// --- Delete Habit ---
function deleteHabit(id){
  if(confirm("Are you sure you want to delete this habit?")){
    state.habits = state.habits.filter(h => h.id !== id);
    saveState();
  }
}

// --- Stats Calculation ---
function updateStats(){
  const totalHabits = state.habits.length;
  let todayDone = 0;
  let completed = 0;
  let totalDays = 0;
  let longestStreak = 0;

  const today = todayIndex();

  state.habits.forEach(h=>{
    if(h.days[today]) todayDone++;
    completed += h.days.filter(Boolean).length;
    totalDays += h.days.length;

    // calculate streak for this habit
    let streak=0;
    for(let i=h.days.length-1;i>=0;i--){
      if(h.days[i]) streak++;
      else break;
    }
    if(streak>longestStreak) longestStreak=streak;
  });

  const overallPct = totalDays ? Math.round((completed/totalDays)*100) : 0;

  // update DOM
  const elTotal=document.getElementById("totalHabits");
  const elToday=document.getElementById("todayDone");
  const elOverall=document.getElementById("overallPct");
  const elStreak=document.getElementById("longestStreak");

  if(elTotal) elTotal.textContent=totalHabits;
  if(elToday) elToday.textContent=todayDone;
  if(elOverall) elOverall.textContent=overallPct+"%";
  if(elStreak) elStreak.textContent=longestStreak;
}

// --- Render Habits ---
function render(){
  const cont=document.getElementById('habits'); 
  if(!cont) return;
  cont.innerHTML=''; 
  initSpanForHabits();
  state.habits.forEach(h=>{
    const el=document.createElement('div'); 
    el.className='card';

    // header with title + delete button
    const head=document.createElement('div');
    head.className='habit-head';
    head.innerHTML=`<div class="habit-title">${h.title}</div>`;
    const delBtn=document.createElement('button');
    delBtn.textContent="✖";
    delBtn.className="delete-btn";
    delBtn.onclick=()=>deleteHabit(h.id);
    head.appendChild(delBtn);
    el.appendChild(head);

    // days buttons
    const days=document.createElement('div'); 
    days.className='days';
    h.days.forEach((d,i)=>{
      const btn=document.createElement('div'); 
      btn.className='day'; 
      if(d) btn.classList.add('done');
      if(i===todayIndex()) btn.classList.add('today');
      btn.textContent=i+1; 
      btn.onclick=()=>toggleDay(h.id,i);
      days.appendChild(btn);
    });
    el.appendChild(days); 
    cont.appendChild(el);
  });
  updateStats();
}

// --- Bind Events ---
window.addEventListener('DOMContentLoaded',()=>{
  if(document.getElementById('addHabitBtn')){
    document.getElementById('addHabitBtn').onclick=()=>{
      const v=document.getElementById('newHabitInput').value;
      if(!v.trim()) return alert("Enter a habit");
      addHabit(v); 
      document.getElementById('newHabitInput').value="";
    };
    document.getElementById('spanSelect').onchange=()=>{initSpanForHabits(); saveState();};
    loadState(); initSpanForHabits(); render();
  }
});
