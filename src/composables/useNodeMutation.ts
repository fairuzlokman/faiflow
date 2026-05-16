import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { editNodes, nodesDataQuery, type FlowNode } from '@/api/node'
import { useCanvasStore } from '@/stores/canvas'

// Thin wrapper that bundles "update Pinia → persist via mutation" so every
// caller doesn't reinvent it. The mutation invalidates the nodes-data
// query so any other consumer (e.g. devtools) sees fresh data, but the
// store already has the new state synchronously — the user doesn't wait.
export const useNodeMutation = () => {
	const store = useCanvasStore()
	const queryClient = useQueryClient()

	const mutation = useMutation({
		mutationFn: editNodes,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: nodesDataQuery })
		},
	})

	const persist = () => {
		mutation.mutate(store.allDomainNodes)
	}

	const createNode = (node: FlowNode) => {
		store.addNode(node)
		persist()
	}

	const updateNode = (id: string, patch: Partial<FlowNode>) => {
		store.updateNode(id, patch)
		persist()
	}

	const deleteNode = (id: string) => {
		const removed = store.deleteNode(id)
		persist()
		return removed
	}

	return { createNode, updateNode, deleteNode, persist, mutation }
}
