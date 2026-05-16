import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCanvasStore } from '@/stores/canvas'

// Single source of truth for "which node is the drawer showing right now?".
// We read from the URL so links can deep-link to any node and the back
// button just works. If the id in the URL doesn't match any node (e.g.
// after deletion) we return null and let the drawer stay closed.
export function useSelectedNode() {
	const route = useRoute()
	const router = useRouter()
	const store = useCanvasStore()

	const selectedId = computed<string | null>(() => {
		const raw = route.params.id
		if (Array.isArray(raw)) return raw[0] ?? null
		return typeof raw === 'string' && raw.length > 0 ? raw : null
	})

	const selected = computed(() => {
		const id = selectedId.value
		return id ? (store.getNode(id) ?? null) : null
	})

	const isOpen = computed(() => selected.value !== null)

	function close() {
		router.push({ name: 'canvas' })
	}

	function open(id: string) {
		router.push({ name: 'node', params: { id } })
	}

	return { selectedId, selected, isOpen, close, open }
}
