# htmx data grid over a server task table

**Live demo:** https://toclocoinc.github.io/lattice-grid-demo-htmx-grid/

The server renders a plain `<table data-lattice-grid>` of tasks. [Lattice Grid](https://www.latticegrid.dev/htmx/) turns it into an editable, sortable data grid with no mount code on the page: only markup, [htmx](https://htmx.org/) and the Lattice htmx module.

The data is a sprint board of 48 tasks across four teams (Growth, Platform, Design and Support). The page shows five things:

1. **Built on load.** The server-rendered task table becomes the grid. With JavaScript off it is still a readable table.
2. **Edit.** `data-edit` on a column header makes it editable. A committed cell edit is re-raised as `lattice:grid-change` with the row key, the field and the new value; `hx-trigger="lattice:grid-change"` posts it with `hx-post`, and the server's reply appears under the grid.
3. **Sort.** Clicking the Points header sorts the grid. The sort is view state, kept by the grid and saved with htmx's history snapshot.
4. **Swap.** Picking a team runs an `hx-get`; the old grid is torn down and a new one is built from the new table.
5. **Back.** Pressing Back restores the earlier team and its sort, with the grid drawn once.

## The stand-in server

GitHub Pages is static, so `src/mock-server.js` answers htmx's requests to `/htmx-demo/` in the browser, from the route handlers in `src/server.js`, after a short delay so each swap is visible. Nothing leaves the page. Those handlers are exactly what a real server would do: return a team's table as HTML for `GET /htmx-demo/grid/tasks`, and store the edited cell and reply with a line of HTML for `POST /htmx-demo/grid/save`. Port them to your own backend (Django, Rails, Laravel, Go, anything that renders HTML) and delete the stand-in.

## Run it

```
npm ci
npm run serve        # http://localhost:8000/lattice-grid-demo-htmx-grid/
npm run verify       # headless Chrome check of the steps (needs Chrome)
```

The grid loads from the published `@toclocoinc/lattice-grid` package on jsDelivr; change the version in `index.html` and `main.js` to move to a newer release. On `localhost` no licence key is needed; the key in `main.js` is the public one for `toclocoinc.github.io`.

## Files

- `index.html`: the page, with the server-rendered task table already in it.
- `main.js`: installs the stand-in server, loads the Lattice htmx module and htmx.
- `src/server.js`: the demo data, the HTML template and the route handlers.
- `src/mock-server.js`: the in-browser stand-in for a backend.

Licence: MIT for this demo's code. Lattice Grid itself is commercially licensed; see [latticegrid.dev/pricing](https://www.latticegrid.dev/pricing/).
