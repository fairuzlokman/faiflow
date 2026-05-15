<script setup lang="ts">
	import { useQuery } from '@tanstack/vue-query'
	import { watchEffect } from 'vue'
	import { nodesDataQuery, getNodes } from '@/api/node'
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

	const { data } = useQuery({
		queryKey: nodesDataQuery,
		queryFn: getNodes,
	})

	watchEffect(() => {
		if (data.value) {
			console.log('Nodes data response:', data.value)
		}
	})
</script>

<template>
	<Drawer direction="right">
		<DrawerTrigger>Open</DrawerTrigger>
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
</template>
