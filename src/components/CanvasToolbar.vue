<script setup lang="ts">
import { Panel } from '@vue-flow/core'
import CreateNodeDialog from './CreateNodeDialog.vue'

// VueFlow's <Panel> keeps children pinned in the viewport coordinate system
// (above the canvas, ignoring pan/zoom), which is exactly what a toolbar
// wants.
</script>

<template>
	<Panel position="top-left" class="!m-3">
		<div class="flex items-center gap-2 rounded-md border bg-background p-2 shadow-sm">
			<CreateNodeDialog />
		</div>
	</Panel>
</template>
