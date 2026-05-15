<script setup lang="ts">
	import { ref, watch } from 'vue'
	import { storeToRefs } from 'pinia'
	import { useMutation, useQuery } from '@tanstack/vue-query'
	import { nodesDataQuery, getNodes, editNodes, type FlowNode } from '@/api/node'
	import { useCanvasStore, type NodeData } from '@/stores/canvas'
	import {
		Drawer,
		DrawerClose,
		DrawerContent,
		DrawerDescription,
		DrawerFooter,
		DrawerHeader,
		DrawerTitle,
	} from '@/components/ui/drawer'
	import { Button } from '@/components/ui/button'
	import { useRoute, useRouter } from 'vue-router'
	import {
		VueFlow,
		type Node,
		type Edge,
		type NodeMouseEvent,
		type NodeTypesObject,
	} from '@vue-flow/core'
	import { Background } from '@vue-flow/background'
	import CustomNode from '@/components/nodes/CustomNode.vue'

	const route = useRoute()
	const router = useRouter()

	// Pinia owns the canvas state; storeToRefs keeps reactivity when destructuring.
	const canvasStore = useCanvasStore()
	const { nodes, edges, selectedId } = storeToRefs(canvasStore)

	// One component renders every business type. The data on each node tells
	// it how to render. VueFlow looks up `node.type` in this map.
	// Cast: VueFlow's NodeComponent insists on the full NodeProps surface,
	// but we only consume `data` in CustomNode — the cast keeps registration
	// concise without forcing the component to declare every passthrough prop.
	const nodeTypes = {
		custom: CustomNode,
		trigger: CustomNode,
		sendMessage: CustomNode,
		dateTime: CustomNode,
		dateTimeConnector: CustomNode,
		addComment: CustomNode,
	} as unknown as NodeTypesObject

	const TYPE_OPTIONS = [
		{
			value: 'trigger',
			label: 'Trigger',
		},
		{
			value: 'sendMessage',
			label: 'Send Message',
		},
		{
			value: 'dateTime',
			label: 'Date/Time',
		},
		{
			value: 'dateTimeConnector',
			label: 'Date/Time Connector',
		},
		{
			value: 'addComment',
			label: 'Add Comment',
		},
	] as const

	// --- Server data via TanStack Query ---
	const { data } = useQuery({
		queryKey: nodesDataQuery,
		queryFn: getNodes,
	})

	// Save mutation. Note: /public/data.json is a static file so the POST
	// won't actually persist — we intentionally don't invalidate the query
	// so the user's local edits stay visible.
	const mutation = useMutation({
		mutationFn: editNodes,
		onSuccess: () => {
			// queryClient.invalidateQueries({ queryKey: nodesDataQuery })
		},
	})

	// --- API rows → VueFlow nodes (with positions) + edges ---
	// x grows with depth in the parentId tree; y grows with sibling order
	// inside each depth band, so subtrees don't overlap.
	function toGraph(api: FlowNode[]): { nodes: Node[]; edges: Edge[] } {
		const byId = new Map(api.map((n) => [String(n.id), n]))
		const depthCache = new Map<string, number>()

		function depth(id: string): number {
			const cached = depthCache.get(id)
			if (cached !== undefined) return cached
			const n = byId.get(id)
			if (!n) return 0
			const p = n.parentId
			const d = p === undefined || p === -1 || !byId.has(String(p)) ? 0 : depth(String(p)) + 1
			depthCache.set(id, d)
			return d
		}

		const counterByDepth = new Map<number, number>()

		const flowNodes: Node[] = api.map((n) => {
			const id = String(n.id)
			const d = depth(id)
			const i = counterByDepth.get(d) ?? 0
			counterByDepth.set(d, i + 1)
			return {
				id,
				type: n.type,
				position: { x: d * 250, y: i * 120 },
				data: {
					type: n.type,
					label: n.name ?? n.type,
					raw: n.data ?? {},
				} satisfies NodeData,
			}
		})

		const flowEdges: Edge[] = api
			.filter(
				(n) =>
					n.parentId !== undefined && n.parentId !== -1 && byId.has(String(n.parentId)),
			)
			.map((n) => ({
				id: `e-${n.parentId}-${n.id}`,
				source: String(n.parentId),
				target: String(n.id),
			}))

		return { nodes: flowNodes, edges: flowEdges }
	}

	// Reverse: store → API shape, for the save mutation.
	function toApiNodes(): FlowNode[] {
		const parentByChild = new Map<string, string>()
		for (const e of edges.value) parentByChild.set(e.target, e.source)
		return (nodes.value as Node[]).map((n) => {
			const d = n.data as NodeData
			return {
				id: n.id,
				parentId: parentByChild.get(n.id) ?? -1,
				type: d.type,
				name: d.label,
				data: d.raw,
			}
		})
	}

	// Seed the store when query data arrives. immediate: true handles the
	// case where data is already cached on mount.
	watch(
		data,
		(api) => {
			if (!api) return
			const g = toGraph(api)
			canvasStore.setGraph(g.nodes, g.edges)
		},
		{ immediate: true },
	)

	// --- Drawer form state ---
	const drawerOpen = ref(false)
	const form = ref({ name: '', type: 'sendMessage', dataText: '{}' })
	const jsonError = ref<string | null>(null)

	function populateFormFromSelected() {
		const n = (nodes.value as Node[]).find((x) => x.id === selectedId.value)
		if (!n) {
			form.value = { name: '', type: 'sendMessage', dataText: '{}' }
			jsonError.value = null
			return
		}
		const d = n.data as NodeData
		form.value = {
			name: d.label,
			type: d.type,
			dataText: JSON.stringify(d.raw, null, 2),
		}
		jsonError.value = null
	}

	function commitFormToStore(): boolean {
		let raw: Record<string, unknown>
		try {
			raw = JSON.parse(form.value.dataText)
		} catch (err) {
			jsonError.value = (err as Error).message
			return false
		}
		jsonError.value = null
		canvasStore.updateSelected({
			name: form.value.name,
			type: form.value.type,
			raw,
		})
		return true
	}

	// --- Event handlers ---
	function handleNodeClick(e: NodeMouseEvent) {
		canvasStore.select(e.node.id)
		populateFormFromSelected()
		drawerOpen.value = true
	}

	function handleAddRoot() {
		canvasStore.addRoot()
		populateFormFromSelected()
		drawerOpen.value = true
	}

	function handleAddChild() {
		const id = canvasStore.addChildOfSelected()
		if (id) populateFormFromSelected()
	}

	function handleDelete() {
		canvasStore.deleteSelected()
		drawerOpen.value = false
	}

	function handleSave() {
		if (commitFormToStore()) mutation.mutate(toApiNodes())
	}

	function handleDrawerOpenChange(open: boolean) {
		drawerOpen.value = open
		if (!open) canvasStore.select(null)
	}
</script>

<template>
	<div class="relative h-dvh w-dvw">
		<VueFlow
			v-model:nodes="nodes"
			v-model:edges="edges"
			:node-types="nodeTypes"
			@node-click="handleNodeClick"
		>
			<Background />
		</VueFlow>

		<!-- Toolbar overlay -->
		<div class="absolute left-3 top-3 z-10 flex gap-2">
			<Button @click="handleAddRoot">+ Add Node</Button>
		</div>

		<!-- Editor drawer: opens when a node is selected -->
		<Drawer direction="right" :open="drawerOpen" @update:open="handleDrawerOpenChange">
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Edit node</DrawerTitle>
					<DrawerDescription>
						Edits apply locally; Save also fires the editNodes mutation (the demo
						backend is a static file so the POST will fail — local state stays).
					</DrawerDescription>
				</DrawerHeader>

				<div class="flex flex-col gap-3 px-4">
					<label class="flex flex-col gap-1 text-sm">
						<span>Name</span>
						<input
							v-model="form.name"
							class="rounded border px-2 py-1"
							:disabled="!selectedId"
						/>
					</label>

					<label class="flex flex-col gap-1 text-sm">
						<span>Type</span>
						<select
							v-model="form.type"
							class="rounded border px-2 py-1"
							:disabled="!selectedId"
						>
							<option v-for="t in TYPE_OPTIONS" :key="t.value" :value="t.value">
								{{ t.label }}
							</option>
						</select>
					</label>

					<label class="flex flex-col gap-1 text-sm">
						<span>Data (JSON)</span>
						<textarea
							v-model="form.dataText"
							rows="10"
							class="rounded border px-2 py-1 font-mono text-xs"
							:disabled="!selectedId"
						/>
						<span v-if="jsonError" class="text-xs text-red-600">
							{{ jsonError }}
						</span>
					</label>

					<div v-if="mutation.isError.value" class="text-xs text-red-600">
						Save failed: {{ mutation.error.value?.message }}
					</div>
					<div v-else-if="mutation.isSuccess.value" class="text-xs text-green-600">
						Saved.
					</div>
				</div>

				<DrawerFooter>
					<div class="flex flex-wrap gap-2">
						<Button
							:disabled="!selectedId || mutation.isPending.value"
							@click="handleSave"
						>
							{{ mutation.isPending.value ? 'Saving…' : 'Save' }}
						</Button>
						<Button variant="outline" :disabled="!selectedId" @click="handleAddChild">
							Add child
						</Button>
						<Button variant="outline" :disabled="!selectedId" @click="handleDelete">
							Delete
						</Button>
						<DrawerClose as-child>
							<Button variant="outline">Close</Button>
						</DrawerClose>
					</div>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	</div>
</template>
