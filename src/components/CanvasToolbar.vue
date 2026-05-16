<script setup lang="ts">
	import { Panel } from '@vue-flow/core'
	import CreateNodeDialog from './CreateNodeDialog.vue'
	import { RotateCcw } from 'lucide-vue-next'
	import { Button } from './ui/button'
	import { resetCanvas } from '@/lib/storage'

	const reset = () => {
		resetCanvas()
		window.location.reload()
	}
</script>

<template>
	<Panel position="top-left">
		<div class="flex items-center gap-2">
			<CreateNodeDialog />
			<Button @click="reset" variant="outline">
				<RotateCcw />
			</Button>
		</div>
	</Panel>
</template>
