import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Node, Edge } from '@vue-flow/core'

// Shape of `data` we attach to every VueFlow node.
// `type` is our app-level node category (trigger, sendMessage, ...).
// `raw` is the API node's free-form `data` blob, edited as JSON in the drawer.
export type NodeData = {
	type: string
	label: string
	raw: Record<string, unknown>
}

// Helper to read our typed `data` off a generic VueFlow Node.
const dataOf = (n: Node): NodeData => n.data as NodeData

export const useCanvasStore = defineStore('canvas', () => {
	const nodes = ref<Node[]>([])
	const edges = ref<Edge[]>([])
	const selectedId = ref<string | null>(null)

	// Internal helper — not exposed via the store return because returning
	// functions whose signature involves VueFlow's deep `Node` type trips
	// TS2589 in Pinia's setup-store inference. Consumers find by id directly
	// from the exposed `nodes` ref.
	function currentSelected(): Node | undefined {
		return nodes.value.find((n) => n.id === selectedId.value)
	}

	function setGraph(nextNodes: Node[], nextEdges: Edge[]) {
		nodes.value = nextNodes
		edges.value = nextEdges
	}

	function select(id: string | null) {
		selectedId.value = id
	}

	function updateSelected(patch: { name?: string; type?: string; raw?: Record<string, unknown> }) {
		const n = currentSelected()
		if (!n) return
		const d = dataOf(n)
		if (patch.name !== undefined) d.label = patch.name
		if (patch.type !== undefined) d.type = patch.type
		if (patch.raw !== undefined) d.raw = patch.raw
	}

	// Generate a short random id; good enough for a demo.
	function makeId() {
		return Math.random().toString(36).slice(2, 8)
	}

	function addChildOfSelected() {
		const parent = currentSelected()
		if (!parent) return null
		const id = makeId()
		nodes.value.push({
			id,
			type: 'custom',
			position: { x: parent.position.x + 250, y: parent.position.y + 120 },
			data: { type: 'sendMessage', label: 'New node', raw: {} } satisfies NodeData,
		})
		edges.value.push({ id: `e-${parent.id}-${id}`, source: parent.id, target: id })
		selectedId.value = id
		return id
	}

	function addRoot() {
		const id = makeId()
		nodes.value.push({
			id,
			type: 'custom',
			position: { x: 0, y: nodes.value.length * 120 },
			data: { type: 'trigger', label: 'New root', raw: {} } satisfies NodeData,
		})
		selectedId.value = id
		return id
	}

	function deleteSelected() {
		const id = selectedId.value
		if (!id) return
		nodes.value = nodes.value.filter((n) => n.id !== id)
		edges.value = edges.value.filter((e) => e.source !== id && e.target !== id)
		selectedId.value = null
	}

	return {
		nodes,
		edges,
		selectedId,
		setGraph,
		select,
		updateSelected,
		addChildOfSelected,
		addRoot,
		deleteSelected,
	}
})
