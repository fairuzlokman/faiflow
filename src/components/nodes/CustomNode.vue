<script setup lang="ts">
	import { Handle, Position } from '@vue-flow/core'
	import type { NodeData } from '@/stores/canvas'

	// VueFlow passes the node's `data` (and other props) into the registered
	// node component. We only need `data` here.
	defineProps<{ data: NodeData }>()
</script>

<template>
	<div :class="['cnode', `cnode--${data.type}`]">
		<Handle type="target" :position="Position.Left" />
		<div class="cnode__type">{{ data.type }}</div>
		<div class="cnode__label">{{ data.label }}</div>
		<Handle type="source" :position="Position.Right" />
	</div>
</template>

<style scoped>
	.cnode {
		padding: 8px 12px;
		border-radius: 6px;
		background: #fff;
		border: 2px solid #94a3b8;
		font-size: 12px;
		min-width: 140px;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
	}
	.cnode__type {
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: #64748b;
	}
	.cnode__label {
		font-weight: 600;
		color: #0f172a;
	}
	.cnode--trigger { border-color: #10b981; }
	.cnode--sendMessage { border-color: #3b82f6; }
	.cnode--dateTime { border-color: #f59e0b; }
	.cnode--dateTimeConnector { border-color: #a855f7; }
	.cnode--addComment { border-color: #ef4444; }
</style>
