<template>
  <div
    class="spinner border-transparent block bg-transparent rounded-full top-0 left-0"
  />
</template>

<style scoped>
.spinner {
  animation: spin 0.8s ease-out infinite;
}

.spinner:not(.m-0) {
  margin-left: auto;
  margin-right: auto;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}
</style>
