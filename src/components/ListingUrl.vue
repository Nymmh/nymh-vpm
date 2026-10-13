<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ url: string }>()
const message = ref('')
const copy = async (): Promise<void> => {
  try {
    await navigator.clipboard.writeText(props.url)
    message.value = 'Copied!'
  } catch {
    message.value = 'Could not copy. Select the URL and copy it manually.'
  }
}
</script>

<template>
  <div class="listing-url">
    <div class="listing-url__controls">
      <input :value="url" readonly aria-label="Listing URL" @focus="message = ''" />
      <button type="button" @click="copy">Copy</button>
      <slot />
    </div>
    <span class="listing-url__message" role="status">{{ message }}</span>
  </div>
</template>

<style lang="scss" scoped>
.listing-url {
  width: 100%;

  &__controls {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    input {
      flex: 1;
      min-width: min(100%, 280px);
    }
  }
  
  &__message {
    display: block;
    font-size: 0.875rem;
    margin-top: 6px;
  }
}
</style>
