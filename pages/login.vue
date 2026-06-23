<script setup lang="ts">
definePageMeta({ layout: false })

const { login } = useAuth()
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await login(username.value, password.value)
    await navigateTo('/admin')
  }
  catch (e: any) {
    error.value = e?.data?.statusMessage || e?.message || '登录失败'
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <form
      class="w-full max-w-sm p-6 bg-white rounded shadow"
      @submit.prevent="submit"
    >
      <h1 class="text-2xl font-bold mb-4">
        登录
      </h1>
      <div class="space-y-3">
        <UiInput
          v-model="username"
          name="username"
          placeholder="用户名"
        />
        <UiInput
          v-model="password"
          name="password"
          type="password"
          placeholder="密码"
        />
        <p
          v-if="error"
          class="text-red-500 text-sm"
        >
          {{ error }}
        </p>
        <UiButton
          type="submit"
          :disabled="loading"
        >
          {{ loading ? '登录中…' : '登录' }}
        </UiButton>
      </div>
    </form>
  </div>
</template>
