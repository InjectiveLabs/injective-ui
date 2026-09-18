<script setup lang="ts">
const data = [
  [0, 10],
  [1, 20],
  [2, 15]
]
</script>

<template>
  <main class="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
    <section class="mx-auto max-w-3xl">
      <p
        class="mb-3 text-sm font-semibold uppercase tracking-widest text-violet-400"
      >
        Injective UI · reproduction
      </p>

      <h1 class="text-3xl font-bold tracking-tight">
        LineGraph drops valid zero coordinates
      </h1>

      <p class="mt-3 max-w-2xl text-slate-400">
        The first data point has
        <code class="rounded bg-slate-800 px-1.5 py-0.5 text-slate-200"
          >x = 0</code
        >, but is skipped because the component treats zero as an invalid value.
      </p>

      <div
        class="mt-8 rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
      >
        <div class="mb-5 flex items-center justify-between">
          <div>
            <p class="font-semibold">Expected line path</p>
            <p class="mt-1 text-sm text-slate-400">
              Starts from the first point:
              <span class="text-emerald-400">[0, 10]</span>
            </p>
          </div>

          <span
            class="rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-medium text-emerald-400"
          >
            Fixed
          </span>
        </div>

        <div class="h-64 rounded-xl border border-slate-700 bg-slate-950 p-4">
          <SharedLineGraph :data="data" color="#a78bfa" :stroke-width="3" />
        </div>

        <div class="mt-6 grid gap-4 sm:grid-cols-2">
          <div class="rounded-lg bg-slate-800 p-4">
            <p
              class="text-xs font-semibold uppercase tracking-wider text-slate-400"
            >
              Input
            </p>
            <pre class="mt-2 overflow-auto text-sm text-violet-300">{{
              data
            }}</pre>
          </div>

          <div class="rounded-lg bg-slate-800 p-4">
            <p
              class="text-xs font-semibold uppercase tracking-wider text-slate-400"
            >
              Root cause
            </p>
            <code class="mt-2 block text-sm text-rose-300">
              if (!x || !y)
            </code>
            <code class="mt-2 block text-sm text-emerald-300">
              Number.isFinite(x)
            </code>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
