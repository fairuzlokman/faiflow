<script setup lang="ts">
	import { markRaw, watch } from 'vue'
	import { useRouter } from 'vue-router'
	import { useQuery } from '@tanstack/vue-query'
	import { Background } from '@vue-flow/background'
	import {
		VueFlow,
		type Connection,
		type NodeMouseEvent,
		type NodeDragEvent,
		type NodeTypesObject,
	} from '@vue-flow/core'

	import { getNodes, nodesDataQuery } from '@/api/node'
	import { useCanvasStore } from '@/stores/canvas'
	import SendMessageNode from '@/components/flow/SendMessageNode.vue'
	import AddCommentNode from '@/components/flow/AddCommentNode.vue'
	import BusinessHoursNode from '@/components/flow/BusinessHoursNode.vue'
	import TriggerNode from '@/components/flow/TriggerNode.vue'
	import ConnectorNode from '@/components/flow/ConnectorNode.vue'
	import NodeDetailsDrawer from '@/components/drawer-content/NodeDetailsDrawer.vue'
	import CanvasToolbar from '@/components/CanvasToolbar.vue'

	const nodeTypes = {
		trigger: markRaw(TriggerNode),
		dateTime: markRaw(BusinessHoursNode),
		dateTimeConnector: markRaw(ConnectorNode),
		sendMessage: markRaw(SendMessageNode),
		addComment: markRaw(AddCommentNode),
	} as unknown as NodeTypesObject

	const router = useRouter()
	const store = useCanvasStore()

	const { data } = useQuery({
		queryKey: nodesDataQuery,
		queryFn: getNodes,
	})

	watch(
		data,
		(next) => {
			if (next) store.hydrate(next)
		},
		{ immediate: true },
	)

	// Editable nodes route to /node/:id, which opens the drawer. Connector and
	// trigger nodes are display-only per the spec.
	function handleNodeClick({ node }: NodeMouseEvent) {
		if (node.type === 'dateTimeConnector' || node.type === 'trigger') return
		router.push({ name: 'node', params: { id: node.id } })
	}

	// Persist the new position into the domain record so it survives a refresh.
	function handleNodeDragStop({ node }: NodeDragEvent) {
		store.setNodePosition(node.id, node.position)
	}

	function handleConnect({ source, target }: Connection) {
		store.connectNodes(source, target)
	}
</script>

<template>
	<div class="h-dvh w-dvw">
		<VueFlow
			v-model:nodes="store.flowNodes"
			v-model:edges="store.flowEdges"
			:node-types="nodeTypes"
			:default-edge-options="{ type: 'smoothstep' }"
			fit-view-on-init
			class="bg-muted/40"
			@node-click="handleNodeClick"
			@node-drag-stop="handleNodeDragStop"
			@connect="handleConnect"
		>
			<Background />
			<CanvasToolbar />
		</VueFlow>

		<NodeDetailsDrawer />
	</div>
</template>
