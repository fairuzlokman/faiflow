<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { cn } from '@/lib/utils'

// The shared visual shell every node card sits inside. Concrete node
// components provide the icon (slot) plus the title and preview props, and
// can hide the inbound/outbound handles for special cases (the root trigger
// has no inbound handle; nothing typically attaches before it).

interface Props {
	title: string
	preview?: string
	selected?: boolean
	tone?: 'default' | 'success' | 'failure' | 'trigger'
	showSource?: boolean
	showTarget?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	tone: 'default',
	showSource: true,
	showTarget: true,
	selected: false,
})

const toneClass = {
	default: 'bg-background',
	success: 'bg-emerald-50 dark:bg-emerald-950/40',
	failure: 'bg-rose-50 dark:bg-rose-950/40',
	trigger: 'bg-amber-50 dark:bg-amber-950/40',
}[props.tone]
</script>

<template>
	<div
		:class="
			cn(
				'group relative w-64 cursor-pointer rounded-lg border shadow-sm transition-all',
				'hover:shadow-md',
				toneClass,
				props.selected && 'ring-2 ring-primary',
			)
		"
	>
		<Handle
			v-if="props.showTarget"
			type="target"
			:position="Position.Top"
			class="!h-2 !w-2 !border-2 !border-background !bg-muted-foreground"
		/>

		<div class="flex items-start gap-3 p-3">
			<div
				class="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"
			>
				<slot name="icon" />
			</div>
			<div class="min-w-0 flex-1">
				<p class="truncate text-sm font-semibold">{{ props.title || 'Untitled' }}</p>
				<p v-if="props.preview" class="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
					{{ props.preview }}
				</p>
			</div>
		</div>

		<Handle
			v-if="props.showSource"
			type="source"
			:position="Position.Bottom"
			class="!h-2 !w-2 !border-2 !border-background !bg-muted-foreground"
		/>
	</div>
</template>
