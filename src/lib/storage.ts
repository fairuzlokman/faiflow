import type { LayoutPosition } from '@/api/layout'
import type { FlowNode } from '@/api/node'

const NODES_STORAGE_KEY = 'faiflow-nodes'
const LAYOUT_STORAGE_KEY = 'faiflow-layout'

// ---------------------------------------------------------------------
// Nodes persistence
// ---------------------------------------------------------------------
export const readNodes = (): FlowNode[] | null => {
	try {
		const raw = localStorage.getItem(NODES_STORAGE_KEY)
		if (!raw) return null

		const parsed = JSON.parse(raw)
		return Array.isArray(parsed) ? (parsed as FlowNode[]) : null
	} catch (error) {
		console.error('Failed to parse nodes from storage:', error)
		return null
	}
}

export const writeNodes = (nodes: FlowNode[]): void => {
	try {
		localStorage.setItem(NODES_STORAGE_KEY, JSON.stringify(nodes))
	} catch (error) {
		console.error('Failed to serialize nodes for storage:', error)
	}
}

export const updateNodeParent = (nodeId: string, parentId: string | number): void => {
	const nodes = readNodes()
	if (!nodes) return
	const next = nodes.map((node) => (node.id === nodeId ? { ...node, parentId } : node))
	writeNodes(next)
}

// ---------------------------------------------------------------------
// Layout persistence
// ---------------------------------------------------------------------
export const readLayout = (): Record<string, LayoutPosition> => {
	try {
		const raw = localStorage.getItem(LAYOUT_STORAGE_KEY)
		if (!raw) return {}

		const parsed = JSON.parse(raw)
		return typeof parsed === 'object' && parsed !== null
			? (parsed as Record<string, LayoutPosition>)
			: {}
	} catch {
		return {}
	}
}

export const writeLayout = (layout: Record<string, LayoutPosition>): void => {
	try {
		localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout))
	} catch (error) {
		console.error('Failed to serialize layout for storage:', error)
	}
}

// Reset canvas
export const resetCanvas = (): void => {
	localStorage.removeItem(NODES_STORAGE_KEY)
	localStorage.removeItem(LAYOUT_STORAGE_KEY)
}
