<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { Button } from '@/components/ui/button'
import { useCanvasStore } from '@/stores/canvas'
import { useNodeMutation } from '@/composables/useNodeMutation'
import { validateComment } from '@/lib/validation'

const props = defineProps<{ nodeId: string }>()

const store = useCanvasStore()
const { updateNode } = useNodeMutation()

const node = computed(() => store.getNode(props.nodeId))
const initial = computed(() => {
	const data = node.value?.data as { comment?: string } | undefined
	return data?.comment ?? ''
})

const draft = ref(initial.value)
const error = ref<string | null>(null)

// If the user switches to a different addComment node while the drawer is
// open, seed the textarea with that node's comment.
watch(initial, (value) => {
	draft.value = value
	error.value = null
})

function save() {
	const result = validateComment(draft.value)
	if (!result.ok) {
		error.value = result.message
		return
	}
	error.value = null
	updateNode(props.nodeId, { data: { comment: draft.value.trim() } })
}

function clear() {
	draft.value = ''
	error.value = null
	updateNode(props.nodeId, { data: { comment: '' } })
}
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
		<div class="flex gap-2">
			<Button size="sm" class="flex-1" @click="save">Save comment</Button>
			<Button variant="outline" size="sm" class="flex-1" @click="clear">Remove</Button>
		</div>
	</div>
</template>
