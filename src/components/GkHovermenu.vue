<template>
  <div class="d-print-none">
    <!-- trigger button -->
    <b-button
      :title="title"
      variant="link"
      id="select"
    >
      <b-icon
        :icon="icon"
        class="mt-1"
      />
    </b-button>
    <!-- Filters -->
    <b-popover
      class="bg-light d-print-none"
      target="select"
      triggers="click"
      placement="bottom"
    >
      <slot />
    </b-popover>
  </div>
</template>

<script>
export default {
  name: 'GkHovermenu',
  props: {
    icon: {
      type: String,
      default: 'funnel',
    },
    title: {
      type: String,
      default: 'Filter',
    },
  },
};
</script>

<style></style>
