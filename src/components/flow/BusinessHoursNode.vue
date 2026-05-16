<script setup lang="ts">
import { computed } from 'vue'
import { Clock } from 'lucide-vue-next'
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
	const data = n.data as
		| { times?: Array<{ day: string; startTime: string; endTime: string }> }
		| undefined
	const count = data?.times?.length ?? 0
	return count > 0 ? `Active on ${count} day${count === 1 ? '' : 's'} per week.` : ''
})
</script>

<template>
	<BaseNode :title="node?.title ?? ''" :preview="preview" :selected="props.selected">
		<template #icon>
			<Clock class="size-4" />
		</template>
	</BaseNode>
</template>
