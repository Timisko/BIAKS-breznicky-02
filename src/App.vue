<script setup lang="ts">
import { ref } from "vue";

const count = ref(0);
</script>

<template>
  <h1>Hello Vue!</h1>
  <button @click="count++">Count: {{ count }}</button>
</template>
