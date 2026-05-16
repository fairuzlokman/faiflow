import { beforeEach, describe, expect, it } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'

import { useSelectedNode } from '@/composables/useSelectedNode'
import { useCanvasStore } from '@/stores/canvas'

// We harness the composable inside a tiny component because useRoute/
// useRouter require an active router instance and inject context. Memory
// history keeps the test hermetic (no jsdom URL manipulation needed).

function makeHarness() {
	return defineComponent({
		setup() {
			return useSelectedNode()
		},
		template: '<div />',
	})
}

function makeRouter() {
	return createRouter({
		history: createMemoryHistory(),
		routes: [
			{ path: '/', name: 'canvas', component: { template: '<div />' } },
			{ path: '/node/:id', name: 'node', component: { template: '<div />' } },
		],
	})
}

describe('useSelectedNode', () => {
	beforeEach(() => setActivePinia(createPinia()))

	it('returns null when the route has no node id', async () => {
		const router = makeRouter()
		await router.push('/')
		const wrapper = mount(makeHarness(), { global: { plugins: [router] } })
		expect(wrapper.vm.isOpen).toBe(false)
		expect(wrapper.vm.selected).toBeNull()
	})

	it('resolves the route id to the matching domain node', async () => {
		const store = useCanvasStore()
		store.hydrate([{ id: 'abc', parentId: -1, type: 'sendMessage', title: 'Hi' }])

		const router = makeRouter()
		await router.push('/node/abc')
		const wrapper = mount(makeHarness(), { global: { plugins: [router] } })

		expect(wrapper.vm.isOpen).toBe(true)
		expect(wrapper.vm.selected?.title).toBe('Hi')
	})

	it('stays closed when the route id does not match any node', async () => {
		useCanvasStore().hydrate([{ id: 'abc', parentId: -1, type: 'sendMessage' }])
		const router = makeRouter()
		await router.push('/node/missing')
		const wrapper = mount(makeHarness(), { global: { plugins: [router] } })
		expect(wrapper.vm.isOpen).toBe(false)
		expect(wrapper.vm.selected).toBeNull()
	})

	it('navigates back to the canvas when close() is called', async () => {
		const router = makeRouter()
		await router.push('/node/abc')
		const wrapper = mount(makeHarness(), { global: { plugins: [router] } })
		wrapper.vm.close()
		await flushPromises()
		await nextTick()
		expect(router.currentRoute.value.name).toBe('canvas')
	})
})
