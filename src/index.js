const HTML_PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>TUSC Concern Compiler</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/tabler-icons/2.44.0/tabler-icons.min.css" />
<style>
  :root {
    --border: #ddd8cd;
    --surface-0: #faf9f5;
    --surface-1: #f1efe8;
    --surface-2: #ffffff;
    --text-primary: #2c2c2a;
    --text-secondary: #5f5e5a;
    --text-muted: #888780;
    --text-danger: #791f1f;
    --radius: 8px;
    --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    --font-mono: ui-monospace, SFMono-Regular, Menlo, monospace;
    --accent: #A32D2D;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 24px;
    background: var(--surface-0);
    color: var(--text-primary);
    font-family: var(--font-sans);
  }
  button, select, input, textarea {
    font-family: inherit;
    font-size: 13px;
    border: 0.5px solid var(--border);
    border-radius: var(--radius);
    padding: 6px 10px;
    background: var(--surface-2);
    color: var(--text-primary);
  }
  button { cursor: pointer; white-space: nowrap; }
  button:hover { background: var(--surface-1); }
  table { border-collapse: collapse; width: 100%; font-size: 13px; }
  th, td { text-align: left; padding: 6px 8px; border-bottom: 0.5px solid var(--border); }
  th { color: var(--text-secondary); font-weight: 500; }

  .dept-tab {
    border: none;
    background: none;
    padding: 6px 12px;
    font-weight: 500;
    color: var(--text-muted);
    border-bottom: 2px solid transparent;
    border-radius: 0;
  }
  .dept-tab.active {
    color: var(--text-primary);
    border-bottom-color: var(--accent);
  }
  .dept-tabs-scroll {
    display: flex;
    gap: 2px;
    overflow-x: auto;
    flex: 1;
    min-width: 0;
    border-bottom: 0.5px solid var(--border);
  }

  #flyout-backdrop {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.15);
    z-index: 40;
  }
  #pending-flyout {
    position: fixed;
    top: 0;
    right: -340px;
    width: 320px;
    height: 100%;
    background: var(--surface-2);
    border-left: 0.5px solid var(--border);
    box-shadow: -4px 0 16px rgba(0,0,0,0.08);
    transition: right 0.2s ease;
    z-index: 50;
    padding: 16px;
    overflow-y: auto;
  }
  #pending-flyout.open { right: 0; }

  .pending-badge {
    position: absolute;
    top: -6px;
    right: -6px;
    background: var(--accent);
    color: #fff;
    font-size: 10px;
    line-height: 1;
    padding: 3px 5px;
    border-radius: 999px;
    min-width: 14px;
    text-align: center;
  }
</style>
</head>
<body>

<div style="max-width: 1000px; margin: 0 auto; font-family: var(--font-sans);">

  <div style="display:flex; align-items:center; gap:10px; margin-bottom:1.25rem;">
    <div style="width:34px; height:34px; border-radius:50%; background:var(--accent); display:flex; align-items:center; justify-content:center; color:#fff; font-weight:500; font-size:14px; flex-shrink:0;">S</div>
    <div>
      <p style="font-weight:500; font-size:15px; margin:0;">Concern compiler</p>
      <p style="font-size:12px; color:var(--text-muted); margin:0;">Taylor's University Student Council</p>
    </div>
  </div>

  <div style="display:flex; gap:4px; border-bottom:0.5px solid var(--border); margin-bottom:1.25rem;">
    <button id="tab-monitor" onclick="switchTab('monitor')" style="border:none; background:none; padding:8px 4px; margin-right:20px; font-weight:500; border-bottom:2px solid var(--accent);">Monitor</button>
    <button id="tab-dev" onclick="switchTab('dev')" style="border:none; background:none; padding:8px 4px; margin-right:20px; font-weight:500; color:var(--text-muted); border-bottom:2px solid transparent;">Dev</button>
  </div>

  <div id="panel-monitor">
    <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:14px;">
      <div id="dept-tabs" class="dept-tabs-scroll"></div>
      <div style="display:flex; gap:8px; align-items:center; flex-shrink:0;">
        <button id="pending-btn" onclick="togglePendingFlyout()" style="position:relative;">
          <i class="ti ti-bell" style="font-size:14px; vertical-align:-2px;" aria-hidden="true"></i> Pending
          <span id="pending-badge" class="pending-badge" style="display:none;"></span>
        </button>
        <button onclick="compileAllClick()"><i class="ti ti-refresh" style="font-size:14px; vertical-align:-2px;" aria-hidden="true"></i> Compile all</button>
      </div>
    </div>

    <p id="compile-status" style="font-size:12px; color:var(--text-muted); margin:0 0 10px;"></p>

    <div id="dept-table-wrap"></div>
  </div>

  <div id="panel-dev" style="display:none;">
    <div style="background:var(--surface-1); border-radius:var(--radius); padding:12px; margin-bottom:12px;">
      <p style="font-size:12px; color:var(--text-secondary); margin:0 0 8px;">Enter a test concern</p>
      <textarea id="test-concern-input" rows="3" placeholder="The wifi in Block A keeps dropping during lectures" style="width:100%; resize:vertical;"></textarea>
      <button onclick="submitTestConcernClick()" style="margin-top:8px;"><i class="ti ti-send" style="font-size:14px; vertical-align:-2px;" aria-hidden="true"></i> Submit test concern</button>
    </div>

    <div style="background:var(--surface-1); border-radius:var(--radius); padding:12px; margin-bottom:12px;">
      <p style="font-size:12px; color:var(--text-secondary); margin:0 0 8px;">Advanced query</p>
      <div id="conditions" style="display:flex; flex-direction:column; gap:8px;"></div>
      <div style="display:flex; gap:8px; margin-top:8px;">
        <button onclick="addCondition()"><i class="ti ti-plus" style="font-size:14px; vertical-align:-2px;" aria-hidden="true"></i> Add condition</button>
        <button onclick="runQueryClick()"><i class="ti ti-player-play" style="font-size:14px; vertical-align:-2px;" aria-hidden="true"></i> Run query</button>
        <span id="query-status" style="font-size:12px; color:var(--text-muted); align-self:center;"></span>
      </div>
      <div id="results-wrap" style="margin-top:10px;"></div>
    </div>

    <div>
      <p style="font-size:12px; color:var(--text-secondary); margin:0 0 6px;">Console</p>
      <div id="console-log" style="background:var(--surface-0); border:0.5px solid var(--border); border-radius:var(--radius); padding:10px; font-family:var(--font-mono); font-size:12px; line-height:1.6; height:220px; overflow-y:auto; white-space:pre-wrap;"></div>
    </div>
  </div>

</div>

<div id="flyout-backdrop" onclick="togglePendingFlyout()"></div>
<div id="pending-flyout">
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
    <p style="font-weight:500; margin:0;">Pending concerns</p>
    <button onclick="togglePendingFlyout()"><i class="ti ti-x" style="font-size:14px;" aria-hidden="true"></i></button>
  </div>
  <div id="pending-list" style="display:flex; flex-direction:column; gap:6px;"></div>
</div>

<script>
function logLine(msg, color) {
  var el = document.getElementById('console-log');
  var line = document.createElement('div');
  var t = new Date().toLocaleTimeString();
  line.textContent = '[' + t + '] ' + msg;
  if (color) line.style.color = color;
  el.appendChild(line);
  el.scrollTop = el.scrollHeight;
}

var TABLES = {
  RawData: ['EntryID', 'RawConcern', 'Date', 'Source'],
  CompiledData: ['EntryID', 'DepartmentID', 'Reference'],
  Department: ['DepartmentID', 'DepartmentName', 'Abbreviation', 'Description'],
  KeyWords: ['KeyWord', 'InsertedDate', 'ManuallyInserted']
};
var OPERATORS = ['=', '!=', 'contains', '>', '<'];

var departments = [];
var currentDepartmentId = null;

async function getTableNames() {
  const res = await fetch('/api/schema/tables');
  return await res.json();
}

async function getFieldsForTable(table) {
  const res = await fetch('/api/schema/' + encodeURIComponent(table) + '/fields');
  return await res.json();
}

async function runQuery(conditions) {
  const res = await fetch('/api/query', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(conditions)
  });
  return await res.json();
}

async function getDepartments() {
  const res = await fetch('/api/departments');
  return await res.json();
}

async function getCompiledForDepartment(departmentId) {
  const res = await fetch('/api/compiled?departmentId=' + encodeURIComponent(departmentId));
  return await res.json();
}

async function getUnprocessedConcerns() {
  const res = await fetch('/api/raw/unprocessed');
  return await res.json();
}

async function compileAll() {
  const res = await fetch('/api/compile-all', { method: 'POST' });
  return await res.json();
}

async function submitTestConcern(text) {
  const res = await fetch('/api/test/classify', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text })
  });
  return await res.json();
}

async function addCondition() {
  var wrap = document.getElementById('conditions');
  var row = document.createElement('div');
  row.style.cssText = 'display:flex; gap:6px;';

  var tableSel = document.createElement('select');
  (await getTableNames()).forEach(function (t) {
    var o = document.createElement('option'); o.value = t; o.textContent = t; tableSel.appendChild(o);
  });

  var fieldSel = document.createElement('select');
  var opSel = document.createElement('select');
  OPERATORS.forEach(function (op) {
    var o = document.createElement('option'); o.value = op; o.textContent = op; opSel.appendChild(o);
  });

  var valInput = document.createElement('input');
  valInput.type = 'text'; valInput.placeholder = 'value'; valInput.style.cssText = 'width:90px;';

  var delBtn = document.createElement('button');
  delBtn.innerHTML = '<i class="ti ti-x" style="font-size:14px;" aria-hidden="true"></i>';
  delBtn.setAttribute('aria-label', 'Remove condition');
  delBtn.onclick = function () { row.remove(); };

  async function refreshFields() {
    fieldSel.innerHTML = '';
    (await getFieldsForTable(tableSel.value)).forEach(function (f) {
      var o = document.createElement('option'); o.value = f; o.textContent = f; fieldSel.appendChild(o);
    });
  }
  tableSel.onchange = refreshFields;
  await refreshFields();

  row.appendChild(tableSel); row.appendChild(fieldSel); row.appendChild(opSel); row.appendChild(valInput); row.appendChild(delBtn);
  wrap.appendChild(row);
}

function renderResults(rows) {
  var wrap = document.getElementById('results-wrap');
  if (!rows.length) {
    wrap.innerHTML = '<p style="font-size:13px; color:var(--text-muted);">No rows match this query.</p>';
    return;
  }
  var cols = Object.keys(rows[0]);
  var html = '<div style="overflow-x:auto;"><table>';
  html += '<tr>' + cols.map(function (c) { return '<th>' + c + '</th>'; }).join('') + '</tr>';
  rows.forEach(function (r) {
    html += '<tr>' + cols.map(function (c) { return '<td>' + r[c] + '</td>'; }).join('') + '</tr>';
  });
  html += '</table></div>';
  wrap.innerHTML = html;
}

function renderDeptTabs() {
  var wrap = document.getElementById('dept-tabs');
  wrap.innerHTML = '';
  departments.forEach(function (d) {
    var btn = document.createElement('button');
    btn.className = 'dept-tab' + (d.DepartmentID === currentDepartmentId ? ' active' : '');
    btn.textContent = d.Abbreviation || d.DepartmentName;
    btn.title = d.DepartmentName;
    btn.onclick = function () { selectDepartment(d.DepartmentID); };
    wrap.appendChild(btn);
  });
}

function renderDeptTable(rows) {
  var wrap = document.getElementById('dept-table-wrap');
  if (!rows.length) {
    wrap.innerHTML = '<p style="font-size:13px; color:var(--text-muted);">No compiled concerns for this department yet.</p>';
    return;
  }
  var cols = Object.keys(rows[0]);
  var html = '<div style="overflow-x:auto;"><table>';
  html += '<tr>' + cols.map(function (c) { return '<th>' + c + '</th>'; }).join('') + '</tr>';
  rows.forEach(function (r) {
    html += '<tr>' + cols.map(function (c) { return '<td>' + r[c] + '</td>'; }).join('') + '</tr>';
  });
  html += '</table></div>';
  wrap.innerHTML = html;
}

function renderPending(items) {
  var wrap = document.getElementById('pending-list');
  wrap.innerHTML = '';
  items.forEach(function (it) {
    var card = document.createElement('div');
    card.style.cssText = 'background:var(--surface-1); border:0.5px solid var(--border); border-radius:var(--radius); padding:8px;';
    card.innerHTML = '<p style="font-size:11px; color:var(--text-muted); margin:0 0 2px;">Entry ' + it.EntryID + '</p><p style="font-size:12px; margin:0;">' + it.RawConcern + '</p>';
    wrap.appendChild(card);
  });

  var badge = document.getElementById('pending-badge');
  if (items.length > 0) {
    badge.textContent = items.length;
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }
}

async function selectDepartment(departmentId) {
  currentDepartmentId = departmentId;
  renderDeptTabs();
  var rows = await getCompiledForDepartment(departmentId);
  renderDeptTable(rows);
}

async function refreshPending() {
  renderPending(await getUnprocessedConcerns());
}

function togglePendingFlyout() {
  var flyout = document.getElementById('pending-flyout');
  var backdrop = document.getElementById('flyout-backdrop');
  var isOpen = flyout.classList.contains('open');
  if (isOpen) {
    flyout.classList.remove('open');
    backdrop.style.display = 'none';
  } else {
    flyout.classList.add('open');
    backdrop.style.display = 'block';
  }
}

async function runQueryClick() {
  document.getElementById('query-status').textContent = 'Running...';
  var rows = await runQuery({});
  renderResults(rows);
  document.getElementById('query-status').textContent = rows.length + ' rows';
}

async function compileAllClick() {
  var status = document.getElementById('compile-status');
  status.textContent = 'Compiling...';
  var result = await compileAll();
  status.textContent = 'Processed ' + result.processed + ' (' + result.newDepartmentEntries + ' new, ' + result.matchedExisting + ' matched)';
  await refreshPending();
  if (currentDepartmentId !== null) {
    renderDeptTable(await getCompiledForDepartment(currentDepartmentId));
  }
}

async function submitTestConcernClick() {
  var input = document.getElementById('test-concern-input');
  var text = input.value.trim();
  if (!text) { logLine('Enter a concern before submitting.', 'var(--text-danger)'); return; }
  logLine('Submitting: ' + text);
  var result = await submitTestConcern(text);
  logLine('Department: ' + result.department);
  logLine('Keywords: ' + result.keywords.join(', '));
  logLine('Rewrite: ' + result.rewrite);
  logLine('Signature: ' + result.signature);
}

function switchTab(name) {
  document.getElementById('panel-monitor').style.display = name === 'monitor' ? 'block' : 'none';
  document.getElementById('panel-dev').style.display = name === 'dev' ? 'block' : 'none';
  document.getElementById('tab-monitor').style.borderBottomColor = name === 'monitor' ? 'var(--accent)' : 'transparent';
  document.getElementById('tab-monitor').style.color = name === 'monitor' ? 'var(--text-primary)' : 'var(--text-muted)';
  document.getElementById('tab-dev').style.borderBottomColor = name === 'dev' ? 'var(--accent)' : 'transparent';
  document.getElementById('tab-dev').style.color = name === 'dev' ? 'var(--text-primary)' : 'var(--text-muted)';
}

(async function init() {
  departments = await getDepartments();
  if (departments.length) {
    await selectDepartment(departments[0].DepartmentID);
  }
  await refreshPending();
  await addCondition();
  logLine('Console ready.');
})();
</script>
</body>
</html>`;

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "content-type": "application/json" },
  });
}

// TODO: replace with a real D1 query per department, e.g.
// const { results } = await env.DB.prepare(
//   "SELECT c.EntryID, r.RawConcern, r.Date, c.Reference, " +
//   "GROUP_CONCAT(k.KeyWord, ', ') as Keywords " +
//   "FROM CompiledData c " +
//   "JOIN RawData r ON r.EntryID = c.EntryID " +
//   "LEFT JOIN CategorizedDataKeyWords ck ON ck.EntryID = c.EntryID " +
//   "LEFT JOIN KeyWords k ON k.KeyWord = ck.KeyWord " +
//   "WHERE c.DepartmentID = ? " +
//   "GROUP BY c.EntryID"
// ).bind(departmentId).all();
const STUB_COMPILED_BY_DEPARTMENT = {
  1: [
    { EntryID: 12, RawConcern: "Wifi keeps dropping in Block A lecture halls", Keywords: "wifi, connectivity", Date: "2026-05-14", Reference: "concerns_may.csv:14" },
    { EntryID: 33, RawConcern: "MyTimes app crashes on login", Keywords: "app, login", Date: "2026-06-02", Reference: "concerns_june.csv:2" },
  ],
  2: [
    { EntryID: 27, RawConcern: "No lockers available near Campus Central", Keywords: "lockers, facilities", Date: "2026-05-31", Reference: "concerns_may.csv:31" },
  ],
  3: [],
  4: [],
  5: [],
};

async function handleApi(request, env, ctx, url) {
  const path = url.pathname;
  const method = request.method;

  if (path === "/api/schema/tables" && method === "GET") {
    const { results } = await env.DB.prepare(`
      SELECT name
      FROM sqlite_master
      WHERE type = 'table'
        AND name NOT IN ('_cf_KV', 'sqlite_sequence')
    `).all();
  
    return json(results.map(r => r.name));
  }

  const fieldsMatch = path.match(/^\/api\/schema\/([^/]+)\/fields$/);
  if (fieldsMatch && method === "GET") {
    const tableName = fieldsMatch[1];
    const { results } = await env.DB.prepare(
        "PRAGMA table_info(" + tableName + ")"
    ).all();
    return json(results.map(r => r.name));
  }

  if (path === "/api/departments" && method === "GET") {
    const { results } = await env.DB.prepare(
       "SELECT d.* FROM Department d "
     ).all();
     return json(results);
  }

  if (path === "/api/compiled" && method === "GET") {
    if (url.searchParams.has("departmentId")) {
     const { results } = await env.DB.prepare(
       "SELECT c.* FROM CompiledData c " +
        "WHERE c.DepartmentID = url.searchParams.get("departmentId") 
     ).all();
     return json(results);
    }
    else {
     const { results } = await env.DB.prepare(
       "SELECT c.* FROM CompiledData c "
     ).all();
     return json(results);
    }
  }

  if (path === "/api/query" && method === "POST") {
    // TODO: build a parameterized SQL query from the posted conditions and run it against env.DB, e.g.
    // const conditions = await request.json();
    // const { sql, params } = buildSqlFromConditions(conditions); // your own builder
    // const { results } = await env.DB.prepare(sql).bind(...params).all();
    // return json(results);
    return json([
      { EntryID: 12, DepartmentName: "Information and Communication Technology", Reference: "concerns_may.csv:14" },
      { EntryID: 27, DepartmentName: "Facilities Management", Reference: "concerns_may.csv:31" },
      { EntryID: 33, DepartmentName: "Information and Communication Technology", Reference: "concerns_june.csv:2" },
    ]);
  }

  if (path === "/api/raw/unprocessed" && method === "GET") {
    const { results } = await env.DB.prepare(
       "SELECT r.EntryID, r.RawConcern FROM RawData r " +
       "LEFT JOIN CompiledData c ON c.EntryID = r.EntryID " +
       "WHERE c.EntryID IS NULL"
     ).all();
     return json(results);
  }

  if (path === "/api/compile-all" && method === "POST") {
    // TODO: for each unprocessed RawData row:
    //   1. call env.AI.run(...) to classify (department, keywords, rewrite)
    //   2. build the signature (DepartmentID + sorted keywords)
    //   3. check CompiledData for an existing match on that signature
    //   4. if candidates exist, call env.AI.run(...) again to disambiguate
    //   5. insert into CompiledData (+ CategorizedDataKeyWords), or link to the matched row
    // return json({ processed, newDepartmentEntries, matchedExisting });
    return json({ processed: 3, newDepartmentEntries: 2, matchedExisting: 1 });
  }

  if (path === "/api/test/classify" && method === "POST") {
    // TODO: call env.AI.run(...) with the posted { text }, using the Department + KeyWords
    // closed sets as the prompt's allowed values, temperature: 0 for determinism, e.g.
    // const { text } = await request.json();
    // const result = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
    //   messages: [...],
    //   temperature: 0,
    // });
    // return json(parsedResultFromModel);
    return json({
      department: "Information and Communication Technology",
      keywords: ["wifi", "connectivity"],
      rewrite: "Student reports intermittent Wi-Fi disconnections during lectures in Block A.",
      signature: "10:connectivity,wifi",
    });
  }

  if (path === "/api/google-forms" && method === "POST") {
    let body;
    try {
      body = await request.json();
    } catch (err) {
      return json({ error: "Invalid JSON" }, 400);
    }

    const today = new Date().toISOString().split('T')[0];
    const data = JSON.parse(data);

    const { results } = await env.DB.prepare(
      "INSERT INTO RawData (RawConcern, dateEntered, status, source, json) VALUES (?, 'pending', 'FCF', ?)"
    )
      .bind(data["What is your concern(s)?"], today, JSON.stringify(body))
      .run();

    return json(results);
  }

  return json({ error: "Not found" }, 404);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      return handleApi(request, env, ctx, url);
    }

    return new Response(HTML_PAGE, {
      headers: { "content-type": "text/html;charset=UTF-8" },
    });
  },
};
