<script setup lang="ts">
import { computed } from 'vue'
import { MessageSquare } from 'lucide-vue-next'
import { useCanvasStore } from '@/stores/canvas'
import BaseNode from './BaseNode.vue'

interface Props {
	id: string
	selected?: boolean
}
const props = defineProps<Props>()

const store = useCanvasStore()
const node = computed(() => store.getNode(props.id))

// Prefer the explicit description; fall back to the first text payload so
// existing seed nodes still get a useful preview without forcing the user
// to fill in a description.
const preview = computed(() => {
	const n = node.value
	if (!n) return ''
	if (n.description) return n.description
	const data = n.data as { payload?: Array<{ type: string; text?: string }> } | undefined
	const firstText = data?.payload?.find((p) => p.type === 'text')?.text
	return firstText ?? ''
})
</script>

<template>
	<BaseNode :title="node?.title ?? ''" :preview="preview" :selected="props.selected">
		<template #icon>
			<MessageSquare class="size-4" />
		</template>
	</BaseNode>
</template>
