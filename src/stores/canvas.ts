import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Edge, Node } from '@vue-flow/core'
import type { FlowNode } from '@/api/node'
import { toFlowEdges, toFlowNodes } from '@/lib/nodeMap'

// The canvas store keeps two views of the same data in sync:
//   1. `domainNodes` — the canonical FlowNode records (Map keyed by id),
//      which is what we persist and what editors read from.
//   2. `flowNodes` / `flowEdges` — the VueFlow-shaped values bound directly
//      to `<VueFlow v-model:nodes>`. VueFlow mutates these on drag/select.
//
// Keeping both lets editor components stay typed against the domain shape
// while VueFlow still gets the live array it needs.

export const useCanvasStore = defineStore('canvas', () => {
	const domainNodes = ref<Map<string, FlowNode>>(new Map())
	const flowNodes = ref<Node[]>([])
	const flowEdges = ref<Edge[]>([])

	const allDomainNodes = computed<FlowNode[]>(() => Array.from(domainNodes.value.values()))

	// ---------------------------------------------------------------------
	// Hydration
	// ---------------------------------------------------------------------
	function hydrate(nodes: FlowNode[]) {
		domainNodes.value = new Map(nodes.map((n) => [n.id, n]))
		flowNodes.value = toFlowNodes(nodes)
		flowEdges.value = toFlowEdges(nodes)
	}

	function getNode(id: string): FlowNode | undefined {
		return domainNodes.value.get(id)
	}

	// ---------------------------------------------------------------------
	// Mutations
	// ---------------------------------------------------------------------
	// Each mutation updates the domain Map and then re-derives only what
	// changed in the VueFlow array — we avoid rebuilding the whole list so
	// VueFlow keeps its internal state (selection, dragging) intact.

	function addNode(node: FlowNode) {
		domainNodes.value.set(node.id, node)
		flowNodes.value = toFlowNodes(allDomainNodes.value)
		flowEdges.value = toFlowEdges(allDomainNodes.value)
	}

	function updateNode(id: string, patch: Partial<FlowNode>) {
		const current = domainNodes.value.get(id)
		if (!current) return
		const next: FlowNode = { ...current, ...patch }
		domainNodes.value.set(id, next)

		// VueFlow watches `flowNodes` for shape changes; mutating `data` in
		// place keeps node positions and selection state untouched. A for-of
		// loop avoids inferring VueFlow's deep generic callback type.
		for (const node of flowNodes.value) {
			if (node.id === id) {
				node.data = { ...node.data, title: next.title ?? '' }
				break
			}
		}
	}

	// Delete a node and every descendant (cascade). Returning the affected
	// ids lets the caller log/show feedback if needed.
	function deleteNode(id: string): string[] {
		const removed: string[] = []
		const queue: string[] = [id]
		while (queue.length > 0) {
			const current = queue.shift()!
			if (!domainNodes.value.has(current)) continue
			removed.push(current)
			domainNodes.value.delete(current)
			for (const node of domainNodes.value.values()) {
				if (String(node.parentId) === current) queue.push(node.id)
			}
		}
		// Splice out by walking from the end so indexes stay valid; avoids
		// `Array.filter`, which trips VueFlow's deep Node generic.
		const removedSet = new Set(removed)
		for (let i = flowNodes.value.length - 1; i >= 0; i--) {
			const candidate = flowNodes.value[i]
			if (candidate && removedSet.has(candidate.id)) {
				flowNodes.value.splice(i, 1)
			}
		}
		flowEdges.value = toFlowEdges(allDomainNodes.value)
		return removed
	}

	// Wire an existing node as the parent of a currently-unattached node.
	// Edges live in the domain as `parentId`, so we update the target and let
	// `toFlowEdges` re-derive — same path hydration uses.
	function connectNodes(sourceId: string, targetId: string) {
		if (sourceId === targetId) return
		const source = domainNodes.value.get(sourceId)
		const target = domainNodes.value.get(targetId)
		if (!source || !target) return
		if (target.parentId !== -1) return
		domainNodes.value.set(targetId, { ...target, parentId: sourceId })
		flowEdges.value = toFlowEdges(allDomainNodes.value)
	}

	function setNodePosition(id: string, position: { x: number; y: number }) {
		const current = domainNodes.value.get(id)
		if (!current) return
		domainNodes.value.set(id, { ...current, position })
		// flowNodes already has the new position (VueFlow mutated it on drag).
	}

	function $reset() {
		domainNodes.value = new Map()
		flowNodes.value = []
		flowEdges.value = []
	}

	return {
		// state
		flowNodes,
		flowEdges,
		// getters
		allDomainNodes,
		getNode,
		// actions
		hydrate,
		addNode,
		updateNode,
		deleteNode,
		connectNodes,
		setNodePosition,
		$reset,
	}
})
