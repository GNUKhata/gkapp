<template>
  <div class="d-flex">
    <div
      type="button"
      class="mr-auto text-light"
    >
      {{ name }}
    </div>
    <div v-b-modal.m1>
      <b-icon
        variant="light"
        icon="question-circle"
      />
    </div>
    <b-modal
      id="m1"
      size="md"
      ok-variant="dark"
      :title="helpTitle"
      hide-footer
      no-stacking
      scrollable
    >
      <p v-html="helpBody" />
    </b-modal>
  </div>
</template>

<script>
export default {
  name: 'GkCardHeader',
  props: {
    name: {
      type: String,
      required: true,
      note: 'name of header (required)',
    },
    helpTitle: {
      type: String,
      default: 'Help',
      note: 'title of help popover (optional)',
    },
    helpBody: {
      type: String,
      default: null,
      required: true,
      note: 'body of help popover (required)',
    },
  },
};
</script>
