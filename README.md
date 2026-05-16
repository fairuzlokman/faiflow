# faiflow

A small Vue 3 flow-chart editor built for the respond.io assessment. Nodes are loaded from a JSON payload, rendered with [Vue Flow](https://vueflow.dev/), and edited through a URL-addressable drawer.

## Getting started

```sh
npm install
npm run dev
```

The dev server runs at http://localhost:5173 (or the next free port). Other useful scripts:

| Script              | What it does                                    |
| ------------------- | ----------------------------------------------- |
| `npm run dev`       | Vite dev server with HMR                        |
| `npm run build`     | Type-check + production build to `dist/`        |
| `npm run preview`   | Serve the production build locally              |
| `npm run test:unit` | Vitest unit tests (jsdom)                       |
| `npm run lint`      | Oxlint + ESLint, both with `--fix`              |
| `npm run format`    | Prettier                                        |

## What's inside

| Area               | Stack                                                          |
| ------------------ | -------------------------------------------------------------- |
| Build              | Vite 8, TypeScript                                             |
| Framework          | Vue 3 (Composition API, `<script setup>`)                      |
| State              | Pinia                                                          |
| Routing            | Vue Router (history mode)                                      |
| Server state       | TanStack Query (`@tanstack/vue-query`)                         |
| Canvas             | Vue Flow (`@vue-flow/core`, `@vue-flow/background`)            |
| Styling            | Tailwind CSS v4 + a small shadcn-vue button/drawer set         |
| Icons              | Lucide icons		                                              |
| Tests              | Vitest + @vue/test-utils                                       |

## Features

- Vue Flow canvas with five custom node components (Send Message, Add Comment, Business Hours, Trigger, Connector).
- Hand-rolled tree layout from `parentId` (`src/lib/nodeMap.ts`) — no layout library.
- "Create New Node" dialog with Title / Description / Type fields and validation.
- Node details drawer driven by the URL (`/node/:id`). Reload or share the link and the right node opens. Closing the drawer routes back to `/`.
- Editable Title + Description on every editable node.
- Type-specific editors:
  - **Send Message** — text payload items with inline edit/remove and image uploads (read as data URLs).
  - **Add Comment** — single textarea with save/remove.
  - **Business Hours** — per-day enable + time window + timezone.
- Cascade delete from the drawer footer (with a native confirm).
- localStorage mirror so edits and Create flows survive a refresh; clear it from devtools to reset.

The Trigger node and the Success / Failure connectors are intentionally non-editable — the click handler in `CanvasEditorView.vue` skips them per the spec.

## Architecture

```
data.json (seed)
   │
   ▼
TanStack Query ──hydrates──▶ Pinia canvas store ──derives──▶ VueFlow nodes/edges
       ▲                              │                                │
       │                              │ mutations                       │ drag → store
       └──────invalidate──────────────┤                                 │ click → router.push
                                      ▼
                            localStorage mirror
```

- **Domain shape** (`FlowNode` in `src/api/node.ts`): `{ id, parentId, type, title, description, data, position }`.
- **VueFlow shape** is derived in `src/lib/nodeMap.ts` and lives in the store as `flowNodes` / `flowEdges`. VueFlow mutates these on drag/select, which is by design.
- The store also keeps a parallel `domainNodes` map keyed by id; editor components read from it so they're typed against the domain rather than VueFlow's `Node`.

### Project layout

```
src/
├── api/node.ts                       # domain types, getNodes/editNodes
├── lib/
│   ├── nodeMap.ts                    # tree layout + domain↔VueFlow mapping
│   ├── nodeTypes.ts                  # NODE_TYPE_META (icon, label, creatable…)
│   ├── persistence.ts                # localStorage mirror
│   ├── validation.ts                 # pure validators
│   ├── ids.ts                        # short hex id generator
│   └── utils.ts                      # cn() — clsx + tailwind-merge
├── stores/canvas.ts                  # Pinia: domain + VueFlow state, CRUD
├── composables/
│   ├── useSelectedNode.ts            # URL → selected node
│   └── useNodeMutation.ts            # store update + Query mutation
├── components/
│   ├── flow/
│   │   ├── BaseNode.vue              # shared card shell
│   │   ├── SendMessageNode.vue
│   │   ├── AddCommentNode.vue
│   │   ├── BusinessHoursNode.vue
│   │   ├── TriggerNode.vue
│   │   └── ConnectorNode.vue
│   ├── drawer-content/
│   │   ├── NodeDetailsDrawer.vue     # URL-driven shell + shared form
│   │   ├── SendMessageEditor.vue
│   │   ├── AddCommentEditor.vue
│   │   └── BusinessHoursEditor.vue
│   ├── CanvasToolbar.vue             # Create button pinned to canvas
│   ├── CreateNodeDialog.vue          # reka-ui modal
│   └── ui/                           # shadcn-vue button + drawer primitives
├── views/CanvasEditorView.vue        # thin shell
└── __tests__/                        # Vitest specs (lib, store, composable)
```

## Design decisions

- **TanStack Query configuration** matches the spec verbatim (`refetchOnWindowFocus: false`, `networkMode: 'always'`, `staleTime: Infinity`, `gcTime: 60 * 60 * 1000`) — see `src/main.ts`.
- **No-backend persistence.** `editNodes` is wired through `useMutation` exactly as the spec asks, but the mutation writes a localStorage mirror instead of POSTing to `/data.json` (Vite would refuse since `public/` is static). `getNodes` prefers the mirror, falling back to the seed file on first load and when localStorage is cleared.
- **Hand-rolled tree layout** rather than dagre/elkjs. The graphs here are small and the spec mentions custom implementation, so `layoutTree` walks the `parentId` tree depth-first and centres parents over their children. ~60 lines, fully unit-tested.
- **URL as drawer state.** The drawer's open/closed state is the URL: `/` is closed, `/node/:id` is open. This gives deep-linking, back-button support, and shareable links for free, and keeps the drawer logic in one tiny composable (`useSelectedNode`).
- **Cascade delete.** Deleting a node removes its descendants in the same pass. Removing only the node would leave its subtree orphaned, since edges are derived from `parentId`. The footer's `window.confirm` makes the destructive action explicit.
- **Domain ↔ VueFlow split.** VueFlow's `Node` is UI-shaped (position, selected, dimensions, …). Editor components read from a typed `FlowNode` (domain) instead, which keeps `data: { payload | times | comment | … }` type-narrowable.
- **Image uploads** are stored as data URLs in localStorage. Convenient for an assessment, not what you'd do in production (a real bucket / signed URLs would replace this).

## Tests

Vitest runs in jsdom and currently covers:

- `src/__tests__/lib/validation.spec.ts` — title/description/comment/time validators.
- `src/__tests__/lib/nodeMap.spec.ts` — `toFlowEdges`, `layoutTree`, `toFlowNodes`.
- `src/__tests__/stores/canvas.spec.ts` — Pinia store hydrate, add, update, delete (cascade), setNodePosition.
- `src/__tests__/composables/useSelectedNode.spec.ts` — URL ↔ selected-node bridge with a memory-history router.

```
$ npm run test:unit
```

## Routes

| Path         | Component           | Purpose                              |
| ------------ | ------------------- | ------------------------------------ |
| `/`          | `CanvasEditorView`  | Canvas, drawer closed                |
| `/node/:id`  | `CanvasEditorView`  | Canvas + drawer open for that node   |
| `/:catchAll` | `NotFoundView`      | 404                                  |
