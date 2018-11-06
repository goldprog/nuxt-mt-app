<template>
  <div>

  </div>
</template>

<script>
export default {
  layout: 'blank',
  middleware(ctx) {
    ctx.$axios('/users/exit').then(({ status, data }) => {
      if (status === 200) {
        if (data && data.code === 0) {
          window.location.href = '/'
        }
      }
    })
  }
}
</script>

<style scoped>
</style>
