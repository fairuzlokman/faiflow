<script setup lang="ts">
import { computed } from 'vue'
import { MessageCircle } from 'lucide-vue-next'
import { useCanvasStore } from '@/stores/canvas'
import BaseNode from './BaseNode.vue'

interface Props {
	id: string
	selected?: boolean
}
const props = defineProps<Props>()

const store = useCanvasStore()
const node = computed(() => store.getNode(props.id))

const preview = computed(() => {
	const n = node.value
	if (!n) return ''
	if (n.description) return n.description
	const data = n.data as { comment?: string } | undefined
	return data?.comment ?? ''
})
</script>

<template>
	<BaseNode :title="node?.title ?? ''" :preview="preview" :selected="props.selected">
		<template #icon>
			<MessageCircle class="size-4" />
		</template>
	</BaseNode>
</template>
