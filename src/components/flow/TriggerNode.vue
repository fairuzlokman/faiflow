<script setup lang="ts">
import { computed } from 'vue'
import { Zap } from 'lucide-vue-next'
import { useCanvasStore } from '@/stores/canvas'
import BaseNode from './BaseNode.vue'

interface Props {
	id: string
	selected?: boolean
}
const props = defineProps<Props>()

const store = useCanvasStore()
const node = computed(() => store.getNode(props.id))
</script>

<template>
	<BaseNode
		:title="node?.title ?? 'Trigger'"
		:preview="node?.description"
		:selected="props.selected"
		tone="trigger"
		:show-target="false"
	>
		<template #icon>
			<Zap class="size-4" />
		</template>
	</BaseNode>
</template>
