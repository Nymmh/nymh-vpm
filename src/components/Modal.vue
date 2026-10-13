<script setup lang="ts">
import { onMounted, ref } from 'vue'

defineProps<{ title: string }>()
const emit = defineEmits<{ close: [] }>()
const dialog = ref<HTMLDialogElement | null>(null)

const closeOnBackdrop = (event: MouseEvent): void => {
  const element = dialog.value
  if (!element || event.target !== element) return
  const bounds = element.getBoundingClientRect()
  
  if (
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom
  ) {
    element.close()
  }
}

onMounted(() => dialog.value?.showModal())
</script>

<template>
  <dialog
    ref="dialog"
    class="modal"
    aria-labelledby="modal-title"
    @close="emit('close')"
    @click="closeOnBackdrop"
  >
    <header class="modal__header">
      <h2 id="modal-title">{{ title }}</h2>
      <button type="button" aria-label="Close dialog" @click="dialog?.close()">Close</button>
    </header>
    <slot />
  </dialog>
</template>

<style lang="scss" scoped>
.modal {
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 24px;
  width: min(680px, calc(100% - 32px));
  max-height: calc(100dvh - 48px);
  overflow: auto;

  &::backdrop {
    background: rgb(0 0 0 / 55%);
  }

  &__header {
    display: flex;
    gap: 20px;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 24px;
    
    h2 {
      margin: 0;
    }
  }
}
</style>
