<script setup lang="ts">
	import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
	import { ref } from 'vue'
	import { nodesDataQuery, getNodes, editNodes } from '@/api/node'
	import {
		Drawer,
		DrawerClose,
		DrawerContent,
		DrawerDescription,
		DrawerFooter,
		DrawerHeader,
		DrawerTitle,
		DrawerTrigger,
	} from '@/components/ui/drawer'
	import { Button } from '@/components/ui/button'
	import { useRoute, useRouter } from 'vue-router'
	import { VueFlow, type Node } from '@vue-flow/core'
	import { Background } from '@vue-flow/background'

	const route = useRoute()
	const router = useRouter()

	const queryClient = useQueryClient()

	const { isPending, isError, data, error } = useQuery({
		queryKey: nodesDataQuery,
		queryFn: getNodes,
	})

	const mutation = useMutation({
		mutationFn: editNodes,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: nodesDataQuery })
		},
	})

	const nodes = ref<Node[]>(data.value || [])
</script>

<template>
	<div class="h-dvh w-dvw">
		<VueFlow :nodes="nodes">
			<!-- The canvas for node visualization -->
			<Background />

			<!-- Drawer for node editing -->
			<Drawer direction="right">
				<DrawerTrigger>
					<Button>Open</Button>
				</DrawerTrigger>
				<DrawerContent>
					<DrawerHeader>
						<DrawerTitle>Are you absolutely sure?</DrawerTitle>
						<DrawerDescription> This action cannot be undone. </DrawerDescription>
					</DrawerHeader>
					<DrawerFooter>
						<Button>Submit</Button>
						<DrawerClose>
							<Button variant="outline"> Cancel </Button>
						</DrawerClose>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		</VueFlow>
	</div>
</template>
