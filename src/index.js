export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return new Response(getHtmlPage('home'), { headers: { "content-type": "text/html" } });
    }
    if (url.pathname === "/dev") {
      return new Response(getHtmlPage('dev'), { headers: { "content-type": "text/html" } });
    }

    // GET: Fetch metadata for the SQL Builder dropdowns
    if (url.pathname === "/api/schema" && request.method === "GET") {
      try {
        // TODO: Query your DB to get table lists and columns
        const schema = {}; 

        return Response.json({ schema });
      } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
      }
    }

    // POST: Execute the predefined dynamic dropdown query safely
    if (url.pathname === "/api/query" && request.method === "POST") {
      try {
        const { column, table } = await request.json();

        // TODO: Implement your own DB query handling using column and table
        const results = []; 

        return Response.json({ results });
      } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
      }
    }

    // GET & POST: Main Concerns Endpoint Router
    if (url.pathname === "/api/concerns") {
      if (request.method === "GET") {
        try {
          // TODO: Fetch concerns records from your database
          const results = []; 

          return Response.json({ results });
        } catch (err) {
          return Response.json({ error: err.message }, { status: 500 });
        }
      }
      
      if (request.method === "POST") {
        try {
          const { text } = await request.json();
          
          // TODO: Ingest text into DB, run your own AI process, and get an identity back
          const insertedId = 0;
          const aiOutput = "{}"; 

          return Response.json({ success: true, id: insertedId, ai_output: aiOutput });
        } catch (err) {
          return Response.json({ error: err.message }, { status: 500 });
        }
      }
    }

    // POST: Alternate route support to catch explicit single inference runs safely
    if (url.pathname === "/api/ai-process" && request.method === "POST") {
      try {
        const { text } = await request.json();
        
        // TODO: Handle single AI inference payload yourself
        const aiOutput = "{}"; 

        return Response.json({ success: true, ai_output: aiOutput });
      } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
      }
    }

    // POST: Run batch compilation over all lingering unprocessed entries
    if (url.pathname === "/api/compile-all" && request.method === "POST") {
      try {
        // TODO: Loop over unprocessed entries, call AI, update rows
        const logs = []; 

        return Response.json({ success: true, logs });
      } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
      }
    }

    return new Response("Not Found", { status: 404 });
  }
};

// =========================================================================
// 3. SINGLE-FILE UI COMPONENT SYSTEM
// =========================================================================
function getHtmlPage(page) {
  const isHome = page === 'home';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tusc Concern Compiler</title>
  <style>
    :root {
      --bg: #111827; --card-bg: #1f2937; --text: #f9fafb;
      --text-muted: #9ca3af; --accent: #3b82f6; --accent-hover: #2563eb;
      --border: #374151; --success: #10b981;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, sans-serif; }
    body { background-color: var(--bg); color: var(--text); display: flex; flex-direction: column; min-height: 100vh; }
    header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; background: var(--card-bg); border-bottom: 1px solid var(--border); }
    .toggle-btn { background: var(--accent); color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.375rem; cursor: pointer; text-decoration: none; font-weight: 500; }
    .toggle-btn:hover { background: var(--accent-hover); }
    main { padding: 2rem; flex: 1; max-width: 1400px; width: 100%; margin: 0 auto; display: grid; gap: 2rem; }
    .card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 0.5rem; padding: 1.5rem; }
    h2 { margin-bottom: 1rem; font-size: 1.25rem; color: var(--text); border-bottom: 1px solid var(--border); padding-bottom: 0.5rem;}
    .sql-builder { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; margin-bottom: 1rem;}
    select, textarea, input { background: var(--bg); color: var(--text); border: 1px solid var(--border); padding: 0.5rem; border-radius: 0.375rem; font-size: 0.9rem; }
    select:focus, textarea:focus { outline: 2px solid var(--accent); }
    button.primary { background: var(--accent); color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.375rem; cursor: pointer; }
    button.primary:hover { background: var(--accent-hover); }
    .table-container { overflow-x: auto; margin-top: 1rem; background: var(--bg); border-radius: 0.375rem; border: 1px solid var(--border);}
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; }
    th, td { padding: 0.75rem 1rem; border-bottom: 1px solid var(--border); }
    th { background: rgba(255,255,255,0.05); font-weight: 600; }
    .flyout { position: fixed; top: 0; right: -450px; width: 450px; height: 100%; background: var(--card-bg); border-left: 1px solid var(--border); box-shadow: -4px 0 15px rgba(0,0,0,0.5); transition: right 0.3s ease; display: flex; flex-direction: column; z-index: 100; }
    .flyout.open { right: 0; }
    .flyout-header { padding: 1.5rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
    .flyout-content { padding: 1.5rem; flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; }
    .flyout-footer { padding: 1.5rem; border-top: 1px solid var(--border); }
    .close-btn { background: none; border: none; color: var(--text-muted); font-size: 1.5rem; cursor: pointer; }
    .concern-item { background: var(--bg); border: 1px solid var(--border); padding: 0.75rem; border-radius: 0.375rem; margin-bottom: 0.75rem; }
    .status-badge { display: inline-block; padding: 0.15rem 0.4rem; font-size: 0.75rem; border-radius: 0.25rem; font-weight: bold; margin-top: 0.25rem;}
    .status-unprocessed { background: #b45309; color: #fef3c7; }
    .status-processed { background: #065f46; color: #d1fae5; }
    .console { background: #000; font-family: monospace; color: #10b981; padding: 1rem; border-radius: 0.375rem; height: 250px; overflow-y: auto; font-size: 0.85rem; line-height: 1.4; }
    .form-group { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
    textarea { resize: vertical; min-height: 120px; }
    pre { background: rgba(0,0,0,0.4); padding: 0.5rem; border-radius: 0.25rem; overflow-x: auto; margin-top: 0.25rem; font-family: monospace; font-size: 0.8rem; color: #a7f3d0;}
  </style>
</head>
<body>
  <header>
    <a href="${isHome ? '/dev' : '/'}" class="toggle-btn">${isHome ? '➔ Switch to Dev Page' : '➔ Switch to Home Page'}</a>
    <h1>Tusc Concern Compiler ${isHome ? '' : '[Dev Mode]'}</h1>
    ${isHome ? `<button class="primary" onclick="toggleFlyout(true)">View Unprocessed Pipeline</button>` : '<div></div>'}
  </header>
  <main style="${isHome ? 'grid-template-columns: 1fr;' : 'grid-template-columns: 1fr 1fr;'}">
    ${isHome ? `
      <section class="card">
        <h2>Predefined SQL Statement Runner</h2>
        <div class="sql-builder">
          <span>SELECT</span>
          <select id="colSelect"><option value="*">* (All Columns)</option></select>
          <span>FROM</span>
          <select id="tableSelect" onchange="updateColumnDropdown()"><option value="">Select Table...</option></select>
          <button class="primary" onclick="runPredefinedQuery()">Execute Query</button>
        </div>
        <div class="table-container">
          <table id="queryResultTable"><thead><tr><th>No data queried yet</th></tr></thead><tbody></tbody></table>
        </div>
      </section>
      <section class="card">
        <h2>All Tracked Concerns & Logs</h2>
        <div id="allConcernsList">Loading concerns...</div>
      </section>
      <div id="flyoutMenu" class="flyout">
        <div class="flyout-header">
          <h3>Unprocessed Pipeline</h3>
          <button class="close-btn" onclick="toggleFlyout(false)">&times;</button>
        </div>
        <div class="flyout-content" id="unprocessedContainer">Loading stack...</div>
        <div class="flyout-footer"><button class="primary" style="width: 100%; padding: 0.75rem;" onclick="compileAllUnprocessed()">Compile All via AI</button></div>
      </div>
    ` : `
      <section class="card">
        <h2>Manual Concern Ingestion Entry</h2>
        <div class="form-group">
          <label>Describe the student concern:</label>
          <textarea id="concernInput" placeholder="Type raw student complaint here..."></textarea>
        </div>
        <button class="primary" onclick="submitManualConcern()">Ingest and Deterministically Classify</button>
      </section>
      <section class="card" style="display: flex; flex-direction: column; gap: 1rem;">
        <div>
          <h2>Deterministic JSON Schema Target Output</h2>
          <div id="aiOutputView" class="concern-item" style="min-height: 120px; background: var(--bg); font-family: monospace; white-space: pre-wrap;">Awaiting submission...</div>
        </div>
        <div>
          <h2>Environment Runtime Log Console</h2>
          <div id="devConsole" class="console">[System initialized at execution sandbox branch runtime]</div>
        </div>
      </section>
    `}
  </main>
  <script>
    let dbSchema = {};
    function logToConsole(message) {
      const consoleBox = document.getElementById('devConsole');
      if (!consoleBox) return;
      const ts = new Date().toLocaleTimeString();
      consoleBox.innerHTML += \`<div>[\${ts}] \${message}</div>\`;
      consoleBox.scrollTop = consoleBox.scrollHeight;
    }
    function formatOutputText(text) {
      try {
        const obj = JSON.parse(text);
        return \`<pre>\${JSON.stringify(obj, null, 2)}</pre>\`;
      } catch(e) { return text; }
    }
    if (${isHome}) {
      function toggleFlyout(open) { document.getElementById('flyoutMenu').classList.toggle('open', open); }
      async function loadSchemaMetaData() {
        try {
          const res = await fetch('/api/schema');
          const data = await res.json();
          if(data.error) return;
          dbSchema = data.schema;
          const tableSel = document.getElementById('tableSelect');
          tableSel.innerHTML = '<option value="">Select Table...</option>';
          Object.keys(dbSchema).forEach(table => { tableSel.innerHTML += \`<option value="\${table}">\${table}</option>\`; });
        } catch(e) { console.error(e); }
      }
      function updateColumnDropdown() {
        const table = document.getElementById('tableSelect').value;
        const colSel = document.getElementById('colSelect');
        colSel.innerHTML = '<option value="*">* (All Columns)</option>';
        if (table && dbSchema[table]) {
          dbSchema[table].forEach(col => { colSel.innerHTML += \`<option value="\${col}">\${col}</option>\`; });
        }
      }
      async function runPredefinedQuery() {
        const table = document.getElementById('tableSelect').value;
        const column = document.getElementById('colSelect').value;
        if(!table) return alert("Select a target platform entity table first.");
        const tableHead = document.querySelector('#queryResultTable thead');
        const tableBody = document.querySelector('#queryResultTable tbody');
        try {
          const res = await fetch('/api/query', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ column, table }) });
          const data = await res.json();
          if(data.error) {
            tableHead.innerHTML = '<tr><th>Error occurred</th></tr>';
            tableBody.innerHTML = \`<tr><td>\${data.error}</td></tr>\`;
            return;
          }
          if(!data.results || data.results.length === 0) {
            tableHead.innerHTML = '<tr><th>Empty Dataset</th></tr>';
            tableBody.innerHTML = '<tr><td>No records matched execution parameters.</td></tr>';
            return;
          }
          const columns = Object.keys(data.results[0]);
          tableHead.innerHTML = '<tr>' + columns.map(c => \`<th>\${c}</th>\`).join('') + '</tr>';
          tableBody.innerHTML = data.results.map(row => '<tr>' + columns.map(c => { const cellVal = row[c]; return \`<td>\${typeof cellVal === 'object' && cellVal !== null ? JSON.stringify(cellVal) : (cellVal !== null ? cellVal : '')}</td>\`; }).join('') + '</tr>').join('');
        } catch (e) { alert("Failed query dispatch operation."); }
      }
      async function fetchConcernsPipeline() {
        try {
          const res = await fetch('/api/concerns');
          const data = await res.json();
          const allList = document.getElementById('allConcernsList');
          const unprocList = document.getElementById('unprocessedContainer');
          allList.innerHTML = ''; unprocList.innerHTML = '';
          let unprocessedCount = 0;
          data.results.forEach(item => {
            const el = document.createElement('div');
            el.className = 'concern-item';
            el.innerHTML = \`<div><strong>ID \${item.id}:</strong> \${item.text}</div><span class="status-badge status-\${item.status}">\${item.status}</span>\${item.ai_output ? \`<div style="margin-top:0.5rem;"><strong>Analysis Mapping:</strong> \${formatOutputText(item.ai_output)}</div>\` : ''}\`;
            allList.appendChild(el.cloneNode(true));
            if(item.status === 'unprocessed') { unprocessedCount++; unprocList.appendChild(el); }
          });
          if(unprocessedCount === 0) { unprocList.innerHTML = '<div style="color:var(--text-muted)">All tasks cleared in pipeline stack context.</div>'; }
        } catch(e) { console.error(e); }
      }
      async function compileAllUnprocessed() {
        try {
          const res = await fetch('/api/compile-all', { method: 'POST' });
          const data = await res.json();
          alert(data.message || "Deterministic compilation complete.");
          fetchConcernsPipeline();
          toggleFlyout(false);
        } catch(e) { alert("Compilation thread exception encountered."); }
      }
      loadSchemaMetaData(); fetchConcernsPipeline();
    }
    if (!${isHome}) {
      async function submitManualConcern() {
        const textarea = document.getElementById('concernInput');
        const text = textarea.value.trim();
        if(!text) return alert("Write an issue description prior to processing.");
        logToConsole(\`Sending concern string payload to remote classification pipeline...\\n"\${text}"\`);
        try {
          const res = await fetch('/api/concerns', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ text }) });
          const data = await res.json();
          if(data.success) {
            logToConsole(\`Success: Ingested record row ID \${data.id}\`);
            document.getElementById('aiOutputView').innerHTML = formatOutputText(data.ai_output);
            logToConsole(\`Deterministic classification JSON loaded with locked 0 temperature.\`);
            textarea.value = '';
          } else { logToConsole(\`Error event response: \${data.error}\`); }
        } catch (e) { logToConsole(\`Critical Network Transaction failure: \${e.message}\`); }
      }
    }
  </script>
</body>
</html>`;
}
