import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Node } from '@vue-flow/core'

export const useCanvasStore = defineStore('canvas', () => {
	const nodes = ref<Node[]>([])

	function setNodes(next: Node[]) {
		nodes.value = next
	}

	return { nodes, setNodes }
})
