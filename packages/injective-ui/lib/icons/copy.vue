<script lang="ts" setup>
const uuid = `${Math.random()}`
</script>

<template>
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g :clip-path="`url(#${uuid})`">
      <path
        d="M11.6668 0.666626H3.66683C2.9335 0.666626 2.3335 1.26663 2.3335 1.99996V11.3333H3.66683V1.99996H11.6668V0.666626ZM13.6668 3.33329H6.3335C5.60016 3.33329 5.00016 3.93329 5.00016 4.66663V14C5.00016 14.7333 5.60016 15.3333 6.3335 15.3333H13.6668C14.4002 15.3333 15.0002 14.7333 15.0002 14V4.66663C15.0002 3.93329 14.4002 3.33329 13.6668 3.33329ZM13.6668 14H6.3335V4.66663H13.6668V14Z"
        fill="currentColor"
      />
    </g>
    <defs>
      <clipPath :id="uuid">
        <rect
          width="13"
          height="16"
          fill="currentColor"
          transform="translate(2)"
        />
      </clipPath>
    </defs>
  </svg>
</template>
