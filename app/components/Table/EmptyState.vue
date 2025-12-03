<script lang="ts" setup>
import { NuxtUiIcons } from "../../types";

withDefaults(
  defineProps<{
    text?: string;
    icon?: string;
    iconClass?: string;
    textClass?: string;
  }>(),
  {
    text: "",
    icon: "",
    iconClass: "",
    textClass: "",
  },
);
</script>

<template>
  <UIcon
    :name="icon || NuxtUiIcons.EmptyData"
    :class="iconClass || 'size-6 mb-4'"
  />
  <p :class="textClass || 'text-white text-sm text-center'">
    {{ text || $t("common.noItems") }}
  </p>
</template>
