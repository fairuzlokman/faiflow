<script setup lang="ts">
	import { useRouter } from 'vue-router'

	const router = useRouter()

	const handleClickMe = () => {
		router.push({ name: 'node', params: { id: '123' } })
	}
</script>

<template>
	<h1>Hello there!</h1>
	<button @click="handleClickMe">Click me!</button>
</template>

<style scoped>
	@import '@vue-flow/core/dist/style.css';
	@import '@vue-flow/core/dist/theme-default.css';
</style>
