import type { Edge, Node } from '@vue-flow/core'
import { Position } from '@vue-flow/core'
import type { FlowNode } from '@/api/node'
import type { LayoutPosition } from '@/api/layout'

// Hand-rolled tree layout, top-down. Each row is one depth level; within a
// row siblings spread horizontally. Subtree centring keeps a parent
// visually aligned with the middle of its children, which reads well for
// the small graphs this app targets without pulling in a layout library.

export const COL_WIDTH = 280
export const ROW_HEIGHT = 180

type XY = { x: number; y: number }

const buildChildIndex = (nodes: FlowNode[]): Map<string, FlowNode[]> => {
	const byParent = new Map<string, FlowNode[]>()
	for (const node of nodes) {
		const parentKey = String(node.parentId)
		const siblings = byParent.get(parentKey)
		if (siblings) siblings.push(node)
		else byParent.set(parentKey, [node])
	}
	return byParent
}

const findRoots = (nodes: FlowNode[]): FlowNode[] => {
	const idSet = new Set(nodes.map((n) => n.id))
	return nodes.filter((n) => !idSet.has(String(n.parentId)))
}

/**
 * Walks the parentId tree depth-first, assigning y by depth and x by the
 * in-order position of each leaf. Internal nodes are centred over their
 * children. Returns a Map keyed by node id.
 */
export const layoutTree = (nodes: FlowNode[]): Map<string, XY> => {
	const positions = new Map<string, XY>()
	const childIndex = buildChildIndex(nodes)
	let nextLeafColumn = 0

	const visit = (node: FlowNode, depth: number): number => {
		const children = childIndex.get(node.id) ?? []
		const y = depth * ROW_HEIGHT

		if (children.length === 0) {
			const x = nextLeafColumn * COL_WIDTH
			positions.set(node.id, { x, y })
			nextLeafColumn += 1
			return x
		}

		const childXs = children.map((child) => visit(child, depth + 1))
		const first = childXs[0] ?? 0
		const last = childXs[childXs.length - 1] ?? first
		const x = (first + last) / 2
		positions.set(node.id, { x, y })
		return x
	}

	for (const root of findRoots(nodes)) visit(root, 0)
	return positions
}

/**
 * Maps a single domain node to the shape VueFlow expects. The custom node
 * components read the original domain record from the store via id — we only
 * stuff `title` here so VueFlow's selection state has something readable.
 */
export const toFlowNode = (domain: FlowNode, position: XY): Node => {
	return {
		id: domain.id,
		type: domain.type,
		position,
		data: { title: domain.title ?? '' },
	}
}

export const toFlowNodes = (
	nodes: FlowNode[],
	persistedPositions: Record<string, LayoutPosition> = {},
): Node[] => {
	const layout = layoutTree(nodes)
	return nodes.map((node) => {
		const position =
			persistedPositions[node.id] ?? node.position ?? layout.get(node.id) ?? { x: 0, y: 0 }
		return toFlowNode(node, position)
	})
}

/**
 * Derives edges from parentId. We skip the root marker (parentId === -1) and
 * set handle positions so connections always exit the bottom of the parent
 * and enter the top of the child, matching the top-down layout above.
 */
export const toFlowEdges = (nodes: FlowNode[]): Edge[] => {
	const idSet = new Set(nodes.map((n) => n.id))
	return nodes
		.filter((n) => n.parentId !== -1 && idSet.has(String(n.parentId)))
		.map((n) => ({
			id: `e-${n.parentId}-${n.id}`,
			source: String(n.parentId),
			target: n.id,
			type: 'smoothstep',
			sourceHandle: Position.Bottom,
			targetHandle: Position.Top,
		}))
}
