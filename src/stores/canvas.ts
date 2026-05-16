import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Node, Edge } from '@vue-flow/core'

export const useCanvasStore = defineStore('canvas', () => {
	const nodes = ref<Node[]>([])
	const edges = ref<Edge[]>([])

	function setNodes(next: Node[]) {
		nodes.value = next
	}

	function setEdges(next: Edge[]) {
		edges.value = next
	}

	return {
		nodes,
		edges,
		setNodes,
		setEdges,
	}
})
