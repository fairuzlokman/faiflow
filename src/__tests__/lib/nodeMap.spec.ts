import { describe, it, expect } from 'vitest'
import type { FlowNode } from '@/api/node'
import { COL_WIDTH, ROW_HEIGHT, layoutTree, toFlowEdges, toFlowNodes } from '@/lib/nodeMap'

const seed: FlowNode[] = [
	{ id: '1', parentId: -1, type: 'trigger' },
	{ id: 'a', parentId: '1', type: 'sendMessage' },
	{ id: 'b', parentId: '1', type: 'sendMessage' },
	{ id: 'a1', parentId: 'a', type: 'addComment' },
]

describe('toFlowEdges', () => {
	it('skips the root marker (parentId === -1)', () => {
		const edges = toFlowEdges(seed)
		expect(edges.find((e) => e.target === '1')).toBeUndefined()
	})

	it('produces one edge per non-root node', () => {
		expect(toFlowEdges(seed)).toHaveLength(3)
	})

	it('drops edges that reference a missing parent', () => {
		const orphan: FlowNode[] = [{ id: 'x', parentId: 'missing', type: 'sendMessage' }]
		expect(toFlowEdges(orphan)).toHaveLength(0)
	})

	it('builds stable edge ids', () => {
		const edges = toFlowEdges(seed)
		expect(edges.map((e) => e.id).sort()).toEqual(['e-1-a', 'e-1-b', 'e-a-a1'])
	})
})

describe('layoutTree', () => {
	it('positions root at depth 0', () => {
		const positions = layoutTree(seed)
		expect(positions.get('1')?.y).toBe(0)
	})

	it('positions children one row below their parent', () => {
		const positions = layoutTree(seed)
		expect(positions.get('a')?.y).toBe(ROW_HEIGHT)
		expect(positions.get('a1')?.y).toBe(ROW_HEIGHT * 2)
	})

	it('places leaf siblings in consecutive columns', () => {
		const positions = layoutTree(seed)
		// `a` has a child (a1) which takes column 0; `b` is the next leaf at column 1.
		expect(positions.get('a1')?.x).toBe(0)
		expect(positions.get('b')?.x).toBe(COL_WIDTH)
	})

	it('centres a parent over its children', () => {
		const positions = layoutTree(seed)
		// root has children a (x=0) and b (x=COL_WIDTH) → centred at COL_WIDTH/2.
		expect(positions.get('1')?.x).toBe(COL_WIDTH / 2)
	})
})

describe('toFlowNodes', () => {
	it('uses a saved position when present', () => {
		const withPos: FlowNode[] = [
			{ id: '1', parentId: -1, type: 'trigger', position: { x: 42, y: 99 } },
		]
		expect(toFlowNodes(withPos)[0]?.position).toEqual({ x: 42, y: 99 })
	})

	it('falls back to the computed layout', () => {
		const result = toFlowNodes(seed)
		const root = result.find((n) => n.id === '1')
		expect(root?.position).toEqual({ x: COL_WIDTH / 2, y: 0 })
	})

	it('passes the title through into node.data', () => {
		const withTitle: FlowNode[] = [
			{ id: '1', parentId: -1, type: 'trigger', title: 'Start' },
		]
		expect(toFlowNodes(withTitle)[0]?.data).toEqual({ title: 'Start' })
	})
})
