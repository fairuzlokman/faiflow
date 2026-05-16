<script setup lang="ts">
import { markRaw, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { Background } from '@vue-flow/background'
import {
	VueFlow,
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

// VueFlow expects each custom component wrapped in `markRaw` so it doesn't
// try to make the component reactive (a Vue performance pattern). VueFlow's
// strict NodeProps type is incompatible with our simpler component props
// without re-typing every field; casting once here keeps the call sites clean.
const nodeTypes = {
	sendMessage: markRaw(SendMessageNode),
	addComment: markRaw(AddCommentNode),
	dateTime: markRaw(BusinessHoursNode),
	trigger: markRaw(TriggerNode),
	dateTimeConnector: markRaw(ConnectorNode),
} as unknown as NodeTypesObject

const router = useRouter()
const store = useCanvasStore()

const { data } = useQuery({
	queryKey: nodesDataQuery,
	queryFn: getNodes,
})

// Seed the store once the query resolves. After hydration, edits flow
// through the store directly; we only re-hydrate when the query data
// itself changes (e.g. after a mutation invalidates the cache).
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
		>
			<Background />
			<CanvasToolbar />
		</VueFlow>

		<NodeDetailsDrawer />
	</div>
</template>
