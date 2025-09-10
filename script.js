
    // Profile toggle and localStorage for user data
    const profileBtn = document.getElementById('profile-btn');
    const profileCard = document.getElementById('profile-card');
    const regModal = document.getElementById('reg-modal');

    function showProfileCard(show=true){ profileCard.style.display = show?'block':'none'; }
    profileBtn.addEventListener('click', ()=>{ profileCard.style.display = profileCard.style.display==='block'?'none':'block'; });

    const STORAGE_KEY_USER = 'timecapsule-user';
    function loadProfile(){
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY_USER));
      if(!data){
        regModal.style.display='flex';
      } else {
        regModal.style.display='none';
        document.getElementById('p-name').textContent = data.name;
        document.getElementById('p-age').textContent = data.age;
        document.getElementById('p-phone').textContent = data.phone;
        document.getElementById('p-email').textContent = data.email;
      }
    }

    document.getElementById('reg-save').addEventListener('click', ()=>{
      const name = document.getElementById('reg-name').value;
      const age = document.getElementById('reg-age').value;
      const phone = document.getElementById('reg-phone').value;
      const email = document.getElementById('reg-email').value;
      if(name && age && phone && email){
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify({name,age,phone,email}));
        regModal.style.display='none';
        loadProfile();
      } else {
        // Replaced alert with a custom message.
        document.getElementById('reg-modal').querySelector('.modal-content').innerHTML += '<p style="color:var(--danger)">Please fill all fields.</p>';
      }
    });

    document.getElementById('logout').addEventListener('click', ()=>{
      localStorage.removeItem(STORAGE_KEY_USER);
      location.reload();
    });

    loadProfile();

    // ---- Data Store (localStorage) ----
    const store = {
      key: 'timecapsule-v1',
      data: { tasks: [], notes: [], checklist: [] },
      load(){
        try{ const raw = localStorage.getItem(this.key); if(raw){ this.data = JSON.parse(raw); } }catch(e){ console.warn('Load failed', e) }
      },
      save(){ localStorage.setItem(this.key, JSON.stringify(this.data)); refresh(); }
    };
    store.load();

    // ---- Utilities ----
    const $ = sel => document.querySelector(sel);
    const $$ = sel => Array.from(document.querySelectorAll(sel));
    const fmtDateTime = d => new Date(d).toLocaleString([], { dateStyle:'medium', timeStyle:'short' });
    const fmtDate = d => new Date(d).toLocaleDateString([], { dateStyle:'medium' });
    const isSameDay = (a,b)=>{const A=new Date(a),B=new Date(b);return A.getFullYear()==B.getFullYear() && A.getMonth()==B.getMonth() && A.getDate()==B.getDate()}
    const noteLockCheck = () => {
        const now = new Date();
        let changed = false;
        store.data.notes.forEach(note => {
            if (note.lock && new Date(note.lock) <= now) {
                note.lock = null; // Unlock the note
                changed = true;
            }
        });
        if (changed) {
            store.save();
        }
    };
    noteLockCheck();

    // ---- Voice-to-Text ----
    function startVoiceInput(textareaId, buttonId) {
      if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
        // A better user-friendly message for no support
        document.getElementById(buttonId).innerHTML = 'Browser not supported';
        return;
      }
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      const textarea = document.getElementById(textareaId);
      const button = document.getElementById(buttonId);
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      button.classList.add('active');
      button.innerHTML = '<i class="fa-solid fa-microphone-lines-slash"></i>';

      recognition.start();

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        textarea.value += transcript + ' ';
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
            document.getElementById(buttonId).innerHTML = 'Permission Denied';
        } else {
            document.getElementById(buttonId).innerHTML = 'Error';
        }
        button.classList.remove('active');
      };

      recognition.onend = () => {
        button.classList.remove('active');
        button.innerHTML = '🎤';
      };
    }

    $('#today-note-voice').addEventListener('click', () => startVoiceInput('today-note', 'today-note-voice'));
    $('#note-voice').addEventListener('click', () => startVoiceInput('note-body', 'note-voice'));
    $('#task-note-voice').addEventListener('click', () => startVoiceInput('task-note', 'task-note-voice'));


    // ---- Navigation ----
    const views = ['dashboard','notes','calendar','tasks','checklist','graphs', 'timeline'];
    function show(view){
      $$('.nav button').forEach(b=>b.classList.toggle('active', b.dataset.view===view));
      views.forEach(v=>{ const el = document.getElementById('view-'+v); if(el){ el.style.display = (v===view)?'grid':'none'; } });
      if(view==='graphs') drawCharts();
      if(view==='timeline') renderTimeline();
      if(view==='calendar') renderCalendar();
    }
    $$('.nav button[data-view]').forEach(b=>b.addEventListener('click', e=> show(b.dataset.view)));
    $$('[data-view-link]').forEach(b=>b.addEventListener('click', e=> show(b.getAttribute('data-view-link'))));

    // ---- Topbar Today ----
    function setTodayChip(){ $('#today-chip').textContent = new Date().toLocaleString([], {weekday:'long', month:'short', day:'numeric'}) }
    setTodayChip(); setInterval(setTodayChip, 60_000);

    // ---- Dashboard Quick Add ----
    $('#qa-add').addEventListener('click', ()=>{
      const title=$('#qa-title').value.trim(); const when=$('#qa-date').value; const note=$('#qa-note').value.trim();
      if(!title||!when) {
          // Replaced alert with a custom message
          document.getElementById('qa-add').innerHTML = 'Please add title & date';
          setTimeout(()=> { document.getElementById('qa-add').innerHTML = 'Save'; }, 2000);
          return;
      }
      store.data.tasks.push({ id:crypto.randomUUID(), title, when, note, done:false, created:Date.now() });
      $('#qa-title').value=''; $('#qa-date').value=''; $('#qa-note').value='';
      store.save(); show('tasks');
    });

    $('#save-today-note').addEventListener('click', ()=>{
      const body = $('#today-note').value.trim(); if(!body) {
        document.getElementById('save-today-note').innerHTML = 'Write something first';
        setTimeout(()=> { document.getElementById('save-today-note').innerHTML = 'Save Note'; }, 2000);
        return;
      }
      store.data.notes.push({ id:crypto.randomUUID(), title:'Today', body, lock:null, created:Date.now() });
      $('#today-note').value=''; store.save(); show('notes');
    });

    // ---- Notes ----
    $('#add-note').addEventListener('click', ()=>{
      const title=$('#note-title').value.trim()||'Untitled';
      const lock=$('#note-lock').value||null; const body=$('#note-body').value.trim();
      if(!body) {
        document.getElementById('add-note').innerHTML = 'Write a note first';
        setTimeout(()=> { document.getElementById('add-note').innerHTML = '+ Save Note'; }, 2000);
        return;
      }
      store.data.notes.unshift({ id:crypto.randomUUID(), title, lock, body, created:Date.now() });
      $('#note-title').value=''; $('#note-lock').value=''; $('#note-body').value='';
      store.save();
    });

    function renderNotes(filter=''){
      const wrap = $('#notes-list'); wrap.innerHTML='';
      const q = filter.toLowerCase();
      const items = store.data.notes
        .filter(n=> n.title.toLowerCase().includes(q) || (n.body||'').toLowerCase().includes(q))
        .sort((a,b)=>b.created-a.created);
      if(!items.length){ wrap.innerHTML = `<p class="muted">No notes yet.</p>`; return; }
      items.forEach(n=>{
        const locked = n.lock && new Date(n.lock)>new Date();
        const div = document.createElement('div'); div.className='task';
        div.innerHTML = `
          <div class="badge">${n.title}</div>
          <div>
            <div class="muted">${n.lock?`Unlocks: ${fmtDate(n.lock)}`:'—'}</div>
            <div style="margin-top:6px">${locked?'<em class="muted">🔒 Locked</em>':n.body.replace(/</g,'&lt;')}</div>
          </div>
          <div style="display:flex; gap:8px">
            <button class="btn secondary" data-note="${n.id}">Delete</button>
          </div>`;
        div.querySelector('[data-note]')?.addEventListener('click',()=>{ store.data.notes = store.data.notes.filter(x=>x.id!==n.id); store.save(); })
        wrap.appendChild(div);
      });
    }

    // ---- Tasks ----
    $('#add-task').addEventListener('click', ()=>{
      const title=$('#task-title').value.trim(); const when=$('#task-date').value; const note=$('#task-note').value.trim();
      if(!title||!when) {
          document.getElementById('add-task').innerHTML = 'Please add title & date';
          setTimeout(()=> { document.getElementById('add-task').innerHTML = '+ Add Task'; }, 2000);
          return;
      }
      store.data.tasks.unshift({ id:crypto.randomUUID(), title, when, note, done:false, created:Date.now() });
      $('#task-title').value=''; $('#task-date').value=''; $('#task-note').value='';
      store.save();
    });

    function renderTasks(filter='', sortBy='date-asc'){
        const list=$('#task-list'); list.innerHTML='';
        const q = filter.toLowerCase();
        let items = store.data.tasks.filter(t=> t.title.toLowerCase().includes(q) || (t.note||'').toLowerCase().includes(q));

        if (sortBy === 'date-asc') {
            items.sort((a, b) => new Date(a.when) - new Date(b.when));
        } else if (sortBy === 'date-desc') {
            items.sort((a, b) => new Date(b.when) - new Date(a.when));
        } else if (sortBy === 'status') {
            items.sort((a, b) => a.done - b.done);
        }

        if(!items.length){ list.innerHTML = `<p class="muted">No tasks.</p>`; return; }
        items.forEach(t=>{
            const row=document.createElement('div'); row.className='task'+(t.done?' done':'');
            const overdue = !t.done && new Date(t.when) < new Date();
            row.innerHTML=`
              <input type="checkbox" ${t.done?'checked':''} />
              <div>
                <div style="font-weight:700">${t.title.replace(/</g,'&lt;')}</div>
                <div class="muted">${fmtDateTime(t.when)} ${overdue?'<span class="badge" style="border-color:rgba(255,107,107,.4); color:#ffb3b3">Overdue</span>':''}</div>
                ${t.note?`<div style="margin-top:6px">${t.note.replace(/</g,'&lt;')}</div>`:''}
              </div>
              <div style="display:flex; gap:8px">
                <button class="btn secondary" data-del="${t.id}">Delete</button>
              </div>`;
            row.querySelector('input').addEventListener('change', e=>{ t.done=e.target.checked; store.save(); });
            row.querySelector('[data-del]')?.addEventListener('click',()=>{ store.data.tasks = store.data.tasks.filter(x=>x.id!==t.id); store.save(); })
            list.appendChild(row);
        });
    }

    $('#task-sort-by').addEventListener('change', (e) => {
        renderTasks($('#search').value, e.target.value);
    });

    // Upcoming in dashboard
    function renderUpcoming(){
      const wrap = $('#upcoming'); wrap.innerHTML='';
      const soon = [...store.data.tasks]
        .filter(t=>!t.done)
        .sort((a,b)=> new Date(a.when)-new Date(b.when))
        .slice(0,5);
      if(!soon.length){ wrap.innerHTML = `<p class="muted">No upcoming deadlines 🎉</p>`; return; }
      soon.forEach(t=>{
        const el = document.createElement('div'); el.className='task';
        el.innerHTML=`<div class="badge">Due</div><div><div style="font-weight:700">${t.title.replace(/</g,'&lt;')}</div><div class="muted">${fmtDateTime(t.when)}</div></div><div><button class="btn" onclick="markDone('${t.id}')">Mark done</button></div>`;
        wrap.appendChild(el);
      })
    }
    window.markDone = (id)=>{ const t=store.data.tasks.find(x=>x.id===id); if(t){ t.done=true; store.save(); } };

    // Progress ring
    function renderProgress(){
      const total = store.data.tasks.length; const done = store.data.tasks.filter(t=>t.done).length;
      const pct = total? Math.round(done/total*100) : 0;
      const ring = $('#progress-ring');
      ring.style.setProperty('--p', pct);
      $('#progress-text').textContent = pct+"%";
      $('#progress-sub').textContent = `${done} of ${total} tasks done`;
      updateBadges();
    }

    // ---- Checklist ----
    $('#check-add').addEventListener('click', ()=>{
      const v = $('#check-input').value.trim(); if(!v) return;
      store.data.checklist.push({ id:crypto.randomUUID(), text:v, completed:false });
      $('#check-input').value=''; store.save();
    })
    function renderChecklist(filter=''){
      const wrap = $('#check-list'); wrap.innerHTML='';
      const q = filter.toLowerCase();
      const items = store.data.checklist.filter(c=>c.text.toLowerCase().includes(q));
      if(!items.length){ wrap.innerHTML = `<p class="muted">No items.</p>`; return; }
      items.forEach(c=>{
        const row = document.createElement('div'); row.className='check';
        if(c.completed) row.classList.add('done');
        row.innerHTML = `<div style="flex:1">${c.text.replace(/</g,'&lt;')}</div><button class="btn secondary" data-complete="${c.id}">Completed</button><button class="btn secondary" data-del="${c.id}">Delete</button>`;
        row.querySelector('[data-complete]').addEventListener('click', e=>{ c.completed=true; store.save(); })
        row.querySelector('[data-del]')?.addEventListener('click',()=>{ store.data.checklist = store.data.checklist.filter(x=>x.id!==c.id); store.save(); })
        wrap.appendChild(row);
      })
    }

    // ---- Calendar ----
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();

    function renderCalendar() {
      const calendar = document.getElementById("calendar");
      calendar.innerHTML = "";
      const date = new Date(currentYear, currentMonth);
      const monthYearDisplay = document.getElementById("calendar-month-year");
      monthYearDisplay.textContent = `${date.toLocaleString('default', { month: 'long' })} ${currentYear}`;

      const firstDay = new Date(currentYear, currentMonth, 1).getDay();
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const today = new Date();

      const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      weekdays.forEach(day => {
          const weekdayEl = document.createElement("div");
          weekdayEl.textContent = day;
          weekdayEl.style.fontWeight = 'bold';
          calendar.appendChild(weekdayEl);
      });

      // Empty slots before first day
      for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement("div");
        emptyDay.className = "day other";
        calendar.appendChild(emptyDay);
      }

      // Days of month
      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dayBox = document.createElement("div");
        dayBox.className = "day";
        if (isSameDay(today, new Date(currentYear, currentMonth, d))) {
            dayBox.classList.add('today');
        }
        dayBox.setAttribute("data-date", dateStr);
        dayBox.innerHTML = `<strong>${d}</strong>`;

        const tasksForDay = store.data.tasks.filter(t => t.when && t.when.startsWith(dateStr));
        tasksForDay.forEach(task => {
            const taskEl = document.createElement("div");
            taskEl.className = "task";
            taskEl.textContent = task.title;
            dayBox.appendChild(taskEl);
        });

        dayBox.addEventListener('click', () => {
            document.getElementById('taskDate').value = dateStr;
        });

        calendar.appendChild(dayBox);
      }
    }

    document.getElementById('prev-month').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });

    document.getElementById('next-month').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });

    function saveTask() {
      const title = document.getElementById("taskTitle").value;
      const date = document.getElementById("taskDate").value;

      if (!title || !date) {
        // Replaced alert with a custom message.
        document.getElementById('taskTitle').placeholder = 'Please enter a title!';
        return;
      }

      store.data.tasks.push({ id: crypto.randomUUID(), title, when: date, note: '', done: false, created: Date.now() });
      store.save();

      document.getElementById("taskTitle").value = "";
      document.getElementById("taskDate").value = "";
      renderCalendar();
    }
    window.saveTask = saveTask;


    // ---- Charts ----
    let pie, bar, checklistPie;
    function drawCharts(){
      const ctx1 = document.getElementById('pie');
      const ctx2 = document.getElementById('bar');
      const ctx3 = document.getElementById('checklist-pie');

      // Task Charts
      const totalTasks = store.data.tasks.length;
      const doneTasks = store.data.tasks.filter(t => t.done).length;
      const pendingTasks = totalTasks - doneTasks;
      if(pie) pie.destroy();
      pie = new Chart(ctx1, {
          type:'doughnut',
          data:{
              labels:['Done','Pending'],
              datasets:[{ data:[doneTasks,pendingTasks], backgroundColor:['var(--accent)','rgba(255,255,255,.08)'] }]
          },
          options:{
              plugins:{ legend:{ labels:{ color:'#cfe9ff' } } }
          }
      });

      const days=[...Array(7)].map((_,i)=>{ const d=new Date(); d.setDate(d.getDate()- (6-i)); return d });
      const counts = days.map(d=> store.data.tasks.filter(t=> isSameDay(t.when, d) && t.done).length);
      if(bar) bar.destroy();
      bar = new Chart(ctx2, {
          type:'bar',
          data:{
              labels:days.map(d=> d.toLocaleDateString([], { weekday:'short'})),
              datasets:[{ label:'Completed Tasks', data:counts, backgroundColor:'var(--accent-2)' }]
          },
          options:{
              scales:{ x:{ ticks:{ color:'#cfe9ff'} }, y:{ ticks:{ color:'#cfe9ff'} } },
              plugins:{ legend:{ labels:{ color:'#cfe9ff'} } }
          }
      });

      // Checklist Chart
      const totalChecklist = store.data.checklist.length;
      const doneChecklist = store.data.checklist.filter(c => c.completed).length;
      const pendingChecklist = totalChecklist - doneChecklist;
      if(checklistPie) checklistPie.destroy();
      checklistPie = new Chart(ctx3, {
          type:'doughnut',
          data:{
              labels:['Completed','Pending'],
              datasets:[{ data:[doneChecklist, pendingChecklist], backgroundColor:['var(--accent)','rgba(255,255,255,.08)'] }]
          },
          options:{
              plugins:{ legend:{ labels:{ color:'#cfe9ff' } } }
          }
      });
    }

    // ---- Timeline ----
    function renderTimeline() {
        const container = $('#timeline-container');
        container.innerHTML = '';
        const allItems = [
            ...store.data.tasks.map(t => ({...t, type: 'task'})),
            ...store.data.notes.map(n => ({...n, type: 'note'}))
        ].sort((a, b) => new Date(b.created) - new Date(a.created));

        if (allItems.length === 0) {
            container.innerHTML = '<p class="muted">Your timeline is empty. Add a note or a task to start your journey!</p>';
            return;
        }

        allItems.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'timeline-item';
            const icon = item.type === 'task' ? '📋' : '📝';
            const statusBadge = item.type === 'task' ?
                `<span class="badge" style="background:${item.done ? 'var(--accent)' : 'var(--danger)'}; color:white;">${item.done ? 'Completed' : 'Pending'}</span>` :
                '';
            itemEl.innerHTML = `
                <div class="timeline-date">${fmtDate(item.created)}</div>
                <div class="timeline-content">
                    <span class="badge">${icon} ${item.type === 'task' ? 'Task' : 'Note'}</span>
                    <h3>${item.title} ${statusBadge}</h3>
                    <p>${item.type === 'task' ? item.note || 'No details' : item.body}</p>
                </div>
            `;
            container.appendChild(itemEl);
        });
    }

    // ---- Gamification ----
    function updateBadges() {
        const doneTasksCount = store.data.tasks.filter(t => t.done).length;
        const badgesContainer = $('#badges-container');
        badgesContainer.innerHTML = '';

        if (doneTasksCount >= 10) {
            badgesContainer.innerHTML += '<div class="badge">👑 Completionist</div>';
        }
        if (doneTasksCount >= 25) {
            badgesContainer.innerHTML += '<div class="badge">🚀 Pro Achiever</div>';
        }
    }


    // ---- Search ----
    $('#search').addEventListener('input', e=>{
      const q=e.target.value;
      renderTasks(q, $('#task-sort-by').value);
      renderNotes(q);
      renderChecklist(q);
    })

    // ---- Clear ----
    const deleteModal = $('#delete-modal');
    $('#clear-all').addEventListener('click', ()=>{
      deleteModal.classList.add('active');
    });

    $('#cancel-delete').addEventListener('click', () => {
        deleteModal.classList.remove('active');
    });

    $('#confirm-delete').addEventListener('click', () => {
        store.data = { tasks: [], notes: [], checklist: [] };
        store.save();
        deleteModal.classList.remove('active');
    });

    // ---- Refresh UI ----
    function refresh(){
      noteLockCheck();
      renderProgress();
      renderUpcoming();
      renderTasks($('#search').value, $('#task-sort-by').value);
      renderNotes($('#search').value);
      renderChecklist($('#search').value);
      // Calendar and timeline are rendered when their view is shown
      updateBadges();
    }

    // Initial
    refresh();
    show('dashboard');

 