import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useCanvasStore } from '@/stores/canvas'
import type { FlowNode } from '@/api/node'

const seed: FlowNode[] = [
	{ id: '1', parentId: -1, type: 'trigger', title: 'Start' },
	{ id: 'a', parentId: '1', type: 'sendMessage', title: 'Greeting' },
	{ id: 'a1', parentId: 'a', type: 'addComment', title: 'Note' },
	{ id: 'b', parentId: '1', type: 'sendMessage', title: 'Away' },
]

describe('useCanvasStore', () => {
	beforeEach(() => setActivePinia(createPinia()))

	it('hydrates domain + flow state from a node list', () => {
		const store = useCanvasStore()
		store.hydrate(seed)
		expect(store.allDomainNodes).toHaveLength(4)
		expect(store.flowNodes).toHaveLength(4)
		expect(store.flowEdges).toHaveLength(3) // root edge is dropped
	})

	it('looks up a node by id', () => {
		const store = useCanvasStore()
		store.hydrate(seed)
		expect(store.getNode('a')?.title).toBe('Greeting')
		expect(store.getNode('missing')).toBeUndefined()
	})

	it('adds a new node and exposes it on both views', () => {
		const store = useCanvasStore()
		store.hydrate(seed)
		store.addNode({
			id: 'c',
			parentId: '1',
			type: 'sendMessage',
			title: 'New',
		})
		expect(store.getNode('c')?.title).toBe('New')
		expect(store.flowNodes.find((n) => n.id === 'c')).toBeDefined()
	})

	it('updates a node and reflects the title onto its flow node', () => {
		const store = useCanvasStore()
		store.hydrate(seed)
		store.updateNode('a', { title: 'Renamed' })
		expect(store.getNode('a')?.title).toBe('Renamed')
		const flowA = store.flowNodes.find((n) => n.id === 'a')
		expect(flowA).toBeDefined()
		expect((flowA!.data as { title: string }).title).toBe('Renamed')
	})

	it('ignores updates to unknown ids', () => {
		const store = useCanvasStore()
		store.hydrate(seed)
		store.updateNode('missing', { title: 'never' })
		expect(store.allDomainNodes).toHaveLength(4)
	})

	it('cascades deletes to descendants', () => {
		const store = useCanvasStore()
		store.hydrate(seed)
		const removed = store.deleteNode('a')
		expect(removed.sort()).toEqual(['a', 'a1'])
		expect(store.getNode('a')).toBeUndefined()
		expect(store.getNode('a1')).toBeUndefined()
		expect(store.flowNodes.map((n) => n.id).sort()).toEqual(['1', 'b'])
	})

	it('persists a dragged position into the domain record', () => {
		const store = useCanvasStore()
		store.hydrate(seed)
		store.setNodePosition('a', { x: 999, y: 1234 })
		expect(store.getNode('a')?.position).toEqual({ x: 999, y: 1234 })
	})
})
