/**
 * The "server": a sprint task table, the HTML template and the route handlers.
 * The page prints the part between the SERVER TEMPLATE markers beside the demo.
 */
const tasks = [
  ['T-101', 'Audit the checkout funnel', 'Ana Lopez', 'Growth', 'Done', 5],
  ['T-102', 'Redesign the pricing table', 'Dev Patel', 'Growth', 'Doing', 8],
  ['T-103', 'Write the launch email', 'Chloe Marsh', 'Growth', 'Doing', 3],
  ['T-104', 'Set up the A/B test', 'Ben Okafor', 'Growth', 'Todo', 5],
  ['T-105', 'Landing page for the webinar', 'Eva Lindqvist', 'Growth', 'Todo', 8],
  ['T-106', 'Segment the trial users', 'Ana Lopez', 'Growth', 'Done', 3],
  ['T-107', 'Referral programme copy', 'Chloe Marsh', 'Growth', 'Todo', 2],
  ['T-108', 'Fix the sign-up drop-off on mobile', 'Dev Patel', 'Growth', 'Doing', 5],
  ['T-109', 'Case study: logistics customer', 'Eva Lindqvist', 'Growth', 'Todo', 5],
  ['T-110', 'Onboarding checklist emails', 'Ana Lopez', 'Growth', 'Doing', 5],
  ['T-111', 'Track demo requests by source', 'Ben Okafor', 'Growth', 'Done', 2],
  ['T-112', 'Quarterly pricing review', 'Dev Patel', 'Growth', 'Todo', 13],
  ['T-201', 'Move billing to the new ledger', 'Ben Okafor', 'Platform', 'Doing', 13],
  ['T-202', 'Rotate the API keys', 'Eva Lindqvist', 'Platform', 'Done', 2],
  ['T-203', 'Cache the pricing lookups', 'Femi Adeyemi', 'Platform', 'Doing', 5],
  ['T-204', 'Retire the v1 webhooks', 'Chloe Marsh', 'Platform', 'Todo', 8],
  ['T-205', 'Database failover drill', 'Dev Patel', 'Platform', 'Todo', 2],
  ['T-206', 'Upgrade the job queue workers', 'Femi Adeyemi', 'Platform', 'Doing', 8],
  ['T-207', 'Rate limits for the public API', 'Ben Okafor', 'Platform', 'Todo', 5],
  ['T-208', 'Add tracing to the export service', 'Hana Sato', 'Platform', 'Done', 3],
  ['T-209', 'Archive audit logs after 13 months', 'Eva Lindqvist', 'Platform', 'Todo', 5],
  ['T-210', 'Split the reporting database', 'Femi Adeyemi', 'Platform', 'Todo', 13],
  ['T-211', 'Fix flaky invoice tests', 'Hana Sato', 'Platform', 'Doing', 3],
  ['T-212', 'Single sign-on for enterprise accounts', 'Ben Okafor', 'Platform', 'Doing', 13],
  ['T-301', 'Refresh the icon set', 'Grace Whitfield', 'Design', 'Doing', 5],
  ['T-302', 'Dark theme for the dashboard', 'Grace Whitfield', 'Design', 'Todo', 8],
  ['T-303', 'Empty states for the reports page', 'Ivan Petrov', 'Design', 'Done', 3],
  ['T-304', 'Usability test: new onboarding', 'Ivan Petrov', 'Design', 'Doing', 5],
  ['T-305', 'Accessibility pass on forms', 'Chloe Marsh', 'Design', 'Todo', 8],
  ['T-306', 'Design tokens handover', 'Grace Whitfield', 'Design', 'Done', 2],
  ['T-307', 'Pricing page mock-ups', 'Ivan Petrov', 'Design', 'Done', 5],
  ['T-308', 'Illustrations for the help centre', 'Jun Takeda', 'Design', 'Todo', 8],
  ['T-309', 'Mobile navigation prototype', 'Jun Takeda', 'Design', 'Doing', 5],
  ['T-310', 'Review the email templates', 'Chloe Marsh', 'Design', 'Todo', 3],
  ['T-311', 'Component library audit', 'Grace Whitfield', 'Design', 'Todo', 5],
  ['T-312', 'Motion guidelines', 'Jun Takeda', 'Design', 'Todo', 2],
  ['T-401', 'Answer the backlog of tickets older than a week', 'Kofi Mensah', 'Support', 'Doing', 8],
  ['T-402', 'Write the refund policy macro', 'Lena Fischer', 'Support', 'Done', 2],
  ['T-403', 'Tag tickets by product area', 'Kofi Mensah', 'Support', 'Doing', 3],
  ['T-404', 'Translate the help centre to German', 'Lena Fischer', 'Support', 'Todo', 13],
  ['T-405', 'Escalation path for outages', 'Hana Sato', 'Support', 'Done', 3],
  ['T-406', 'Weekly customer feedback digest', 'Kofi Mensah', 'Support', 'Todo', 2],
  ['T-407', 'Train the new starters on billing', 'Lena Fischer', 'Support', 'Doing', 5],
  ['T-408', 'Chat widget opening hours', 'Ana Lopez', 'Support', 'Todo', 2],
  ['T-409', 'Clean up the knowledge base', 'Kofi Mensah', 'Support', 'Todo', 8],
  ['T-410', 'Survey after resolved tickets', 'Lena Fischer', 'Support', 'Todo', 5],
  ['T-411', 'Status page templates', 'Hana Sato', 'Support', 'Done', 2],
  ['T-412', 'Shadow sessions with customers', 'Femi Adeyemi', 'Support', 'Todo', 3],
].map(([id, title, owner, team, status, points]) => ({ id, title, owner, team, status, points }));

// SERVER TEMPLATE START
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
const teams = ['Growth', 'Platform', 'Design', 'Support'];

const taskRow = (r) =>
  `<tr data-lattice-row="${r.id}"><td>${r.id}</td><td>${esc(r.title)}</td><td>${esc(r.owner)}</td><td>${r.status}</td><td>${r.points}</td></tr>`;

/** The whole view for one team: the picker, and the grid's table inside the element that posts its edits. */
export function gridFragment(team = '') {
  const list = team ? tasks.filter((r) => r.team === team) : tasks;
  const picker = ['', ...teams]
    .map((t) => `<button hx-get="/htmx-demo/grid/tasks?team=${t}" hx-target="#grid-view"
      hx-push-url="${location.pathname}?team=${t}" aria-pressed="${t === team}">${t || 'All teams'}</button>`)
    .join('\n  ');
  return `<div class="view"><div class="filters">${picker}</div>
<div hx-post="/htmx-demo/grid/save" hx-trigger="lattice:grid-change"
  hx-vals='js:{key: event.detail.key, field: event.detail.field, value: event.detail.newValue}'
  hx-target="#save-log" hx-swap="afterbegin">
<table id="tasks" data-lattice-grid>
  <thead><tr><th data-field="id">Ref</th><th data-field="title" data-edit>Task</th><th data-field="owner" data-edit>Owner</th>
    <th data-field="status" data-edit>Status</th><th data-field="points" data-type="number" data-edit>Points</th></tr></thead>
  <tbody>
  ${list.map(taskRow).join('\n  ')}
  </tbody>
</table>
</div></div>`;
}

export const routes = {
  // hx-get: another team's tasks; the old grid is torn down and a new one built.
  'GET /htmx-demo/grid/tasks': ({ params }) => gridFragment(teams.includes(params.team) ? params.team : ''),

  // hx-post from lattice:grid-change: the key, the field and the new value of the committed cell.
  'POST /htmx-demo/grid/save': ({ params }) => {
    const row = tasks.find((r) => r.id === params.key);
    if (!row || !(params.field in row)) return { html: '', status: 404 };
    row[params.field] = params.field === 'points' ? Number(params.value) : params.value;
    return `<li>Server saved <strong>${esc(row.id)}</strong>: ${esc(params.field)} is now ${esc(params.value)}</li>`;
  },
};
// SERVER TEMPLATE END
