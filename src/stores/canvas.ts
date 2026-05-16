import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Edge, Node } from '@vue-flow/core'
import type { FlowNode } from '@/api/node'
import { toFlowEdges, toFlowNodes } from '@/lib/nodeMap'
import type { LayoutPosition } from '@/api/layout'
import { readLayout, readNodes, updateNodeParent, writeLayout, writeNodes } from '@/lib/storage'

export const useCanvasStore = defineStore('canvas', () => {
	// ---------------------------------------------------------------------
	// State
	// ---------------------------------------------------------------------
	const domainNodes = ref<Map<string, FlowNode>>(new Map())
	const flowNodes = ref<Node[]>([])
	const flowEdges = ref<Edge[]>([])
	// User-customised positions, keyed by node id. Lives in localStorage so
	// drag positions survive a refresh even when the nodes themselves are
	// re-fetched from /data.json (which doesn't carry layout).
	const positions = ref<Record<string, LayoutPosition>>(readLayout())

	// ---------------------------------------------------------------------
	// Getters
	// ---------------------------------------------------------------------
	const allDomainNodes = computed<FlowNode[]>(() => Array.from(domainNodes.value.values()))

	// ---------------------------------------------------------------------
	// Internal helpers
	// ---------------------------------------------------------------------
	const syncFlowFromDomain = () => {
		flowNodes.value = toFlowNodes(allDomainNodes.value, positions.value)
		flowEdges.value = toFlowEdges(allDomainNodes.value)
	}

	const persistPositions = () => {
		writeLayout(positions.value)
	}

	// ---------------------------------------------------------------------
	// Hydration
	// ---------------------------------------------------------------------
	const hydrate = (nodes: FlowNode[]) => {
		domainNodes.value = new Map(nodes.map((n) => [n.id, n]))
		positions.value = readLayout()
		if (!readNodes()) writeNodes(nodes)
		syncFlowFromDomain()
	}

	// ---------------------------------------------------------------------
	// Read actions
	// ---------------------------------------------------------------------
	const getNode = (id: string): FlowNode | undefined => {
		return domainNodes.value.get(id)
	}

	// ---------------------------------------------------------------------
	// Mutations
	// ---------------------------------------------------------------------
	const addNode = (node: FlowNode) => {
		domainNodes.value.set(node.id, node)
		if (node.position) {
			positions.value = { ...positions.value, [node.id]: node.position }
			persistPositions()
		}
		syncFlowFromDomain()
	}

	const updateNode = (id: string, patch: Partial<FlowNode>) => {
		const current = domainNodes.value.get(id)
		if (!current) return
		const next: FlowNode = { ...current, ...patch }
		domainNodes.value.set(id, next)

		for (const node of flowNodes.value) {
			if (node.id === id) {
				node.data = { ...node.data, title: next.title ?? '' }
				break
			}
		}
	}

	// Delete a node and every descendant (cascade). Returning the affected
	// ids lets the caller log/show feedback if needed.
	const deleteNode = (id: string): string[] => {
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

		if (removed.length > 0) {
			const next = { ...positions.value }
			for (const removedId of removed) delete next[removedId]
			positions.value = next
			persistPositions()
		}
		return removed
	}

	// Wire an existing node as the parent of a currently-unattached node.
	// Edges live in the domain as `parentId`, so we update the target and let
	// `toFlowEdges` re-derive — same path hydration uses.
	const connectNodes = (sourceId: string, targetId: string) => {
		if (sourceId === targetId) return
		const source = domainNodes.value.get(sourceId)
		const target = domainNodes.value.get(targetId)
		if (!source || !target) return
		if (target.parentId !== -1) return
		domainNodes.value.set(targetId, { ...target, parentId: sourceId })
		flowEdges.value = toFlowEdges(allDomainNodes.value)
		updateNodeParent(targetId, sourceId)
	}

	const setNodePosition = (id: string, position: { x: number; y: number }) => {
		const current = domainNodes.value.get(id)
		if (!current) return
		domainNodes.value.set(id, { ...current, position })
		positions.value = { ...positions.value, [id]: position }
		persistPositions()
		// flowNodes already has the new position (VueFlow mutated it on drag).
	}

	// ---------------------------------------------------------------------
	// Reset
	// ---------------------------------------------------------------------
	const $reset = () => {
		domainNodes.value = new Map()
		flowNodes.value = []
		flowEdges.value = []
		positions.value = {}
		persistPositions()
	}

	// ---------------------------------------------------------------------
	// Public surface
	// ---------------------------------------------------------------------
	return {
		// state
		flowNodes,
		flowEdges,
		positions,
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
