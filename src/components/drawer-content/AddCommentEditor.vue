<script setup lang="ts">
	import { computed, ref, watch } from 'vue'

	import { useCanvasStore } from '@/stores/canvas'
	import { validateComment } from '@/lib/validation'
	import type { NodeData } from '@/api/node'

	const props = defineProps<{ nodeId: string }>()

	const store = useCanvasStore()

	const node = computed(() => store.getNode(props.nodeId))
	const initial = computed(() => {
		const data = node.value?.data as { comment?: string } | undefined
		return data?.comment ?? ''
	})

	const draft = ref(initial.value)
	const error = ref<string | null>(null)

	watch(initial, (value) => {
		draft.value = value
		error.value = null
	})

	function getCommitData(): NodeData | null {
		const result = validateComment(draft.value)
		if (!result.ok) {
			error.value = result.message
			return null
		}
		error.value = null
		return { comment: draft.value.trim() }
	}

	defineExpose({ getCommitData })
</script>

<template>
	<div class="space-y-3">
		<header>
			<h3 class="text-sm font-semibold">Comment</h3>
			<p class="text-xs text-muted-foreground">Internal note shown to operators.</p>
		</header>
		<textarea
			v-model="draft"
			rows="4"
			class="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
			:aria-invalid="error ? 'true' : 'false'"
			@input="error = null"
		/>
		<p v-if="error" class="text-xs text-destructive">{{ error }}</p>
	</div>
</template>
