<script setup lang="ts">
	import { watch } from 'vue'
	import { storeToRefs } from 'pinia'
	import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
	import { nodesDataQuery, getNodes, editNodes, type FlowNode } from '@/api/node'
	import { useCanvasStore } from '@/stores/canvas'
	import {
		Drawer,
		DrawerClose,
		DrawerContent,
		DrawerDescription,
		DrawerFooter,
		DrawerHeader,
		DrawerTitle,
		DrawerTrigger,
	} from '@/components/ui/drawer'
	import { Button } from '@/components/ui/button'
	import { useRoute, useRouter } from 'vue-router'
	import { VueFlow, type Node } from '@vue-flow/core'
	import { Background } from '@vue-flow/background'

	const route = useRoute()
	const router = useRouter()

	const queryClient = useQueryClient()

	// Pinia holds the canvas state; TanStack Query owns the server fetch.
	const canvasStore = useCanvasStore()
	// storeToRefs keeps `nodes` reactive when destructured from the store.
	const { nodes } = storeToRefs(canvasStore)

	const { data } = useQuery({
		queryKey: nodesDataQuery,
		queryFn: getNodes,
	})

	const mutation = useMutation({
		mutationFn: editNodes,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: nodesDataQuery })
		},
	})

	// VueFlow requires `position` on every node, and only renders its built-in
	// types (default/input/output) unless we register custom ones — so for now
	// every node is rendered as a plain "default" node stacked vertically.
	function toFlowNodes(apiNodes: FlowNode[]): Node[] {
		return apiNodes.map((n, i) => ({
			id: String(n.id),
			type: 'default',
			position: { x: 0, y: i * 120 },
			data: { label: n.name ?? n.type },
		}))
	}

	// Seed the store once the query resolves. `immediate: true` runs the
	// callback right away so cached data also flows in on mount.
	watch(
		data,
		(apiNodes) => {
			if (apiNodes) canvasStore.setNodes(toFlowNodes(apiNodes))
		},
		{ immediate: true },
	)
</script>

<template>
	<div class="h-dvh w-dvw">
		<VueFlow v-model:nodes="nodes">
			<!-- The canvas for node visualization -->
			<Background />

			<!-- Drawer for node editing -->
			<Drawer direction="right">
				<DrawerTrigger>
					<Button>Open</Button>
				</DrawerTrigger>
				<DrawerContent>
					<DrawerHeader>
						<DrawerTitle>Are you absolutely sure?</DrawerTitle>
						<DrawerDescription> This action cannot be undone. </DrawerDescription>
					</DrawerHeader>
					<DrawerFooter>
						<Button>Submit</Button>
						<DrawerClose>
							<Button variant="outline"> Cancel </Button>
						</DrawerClose>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		</VueFlow>
	</div>
</template>
