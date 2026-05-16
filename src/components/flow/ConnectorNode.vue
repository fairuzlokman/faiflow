<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { Check, X } from 'lucide-vue-next'
import { useCanvasStore } from '@/stores/canvas'
import { cn } from '@/lib/utils'

// Success/failure connectors are display-only, so this is a smaller pill
// rather than a full BaseNode card. The spec calls these out as
// non-accessible — the parent canvas wires click handlers to skip them.

interface Props {
	id: string
}
const props = defineProps<Props>()

const store = useCanvasStore()
const node = computed(() => store.getNode(props.id))

const connectorType = computed(() => {
	const data = node.value?.data as { connectorType?: 'success' | 'failure' } | undefined
	return data?.connectorType ?? 'success'
})

const isSuccess = computed(() => connectorType.value === 'success')
</script>

<template>
	<div
		:class="
			cn(
				'flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm',
				isSuccess
					? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300'
					: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300',
			)
		"
	>
		<Handle
			type="target"
			:position="Position.Top"
			class="!h-2 !w-2 !border-2 !border-background !bg-muted-foreground"
		/>
		<component :is="isSuccess ? Check : X" class="size-3.5" />
		<span>{{ node?.title ?? (isSuccess ? 'Success' : 'Failure') }}</span>
		<Handle
			type="source"
			:position="Position.Bottom"
			class="!h-2 !w-2 !border-2 !border-background !bg-muted-foreground"
		/>
	</div>
</template>
