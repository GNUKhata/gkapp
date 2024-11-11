<template>
  <b-icon
    v-b-popover.hover="helpContent"
    tabindex="0"
    role="link"
    :variant="variant"
    :icon="icon"
    :scale="scale"
  />
</template>

<script>
export default {
  name: 'GkTooltip',
  props: {
    helpTitle: {
      type: String,
      note: 'title of help popover (optional)',
    },
    helpBody: {
      type: String,
      default: 'Fill text here',
      required: true,
      note: 'body of help popover (required). Supports html',
    },
    icon: {
      type: String,
      default: 'question-circle',
      required: false,
      note: 'Icon for tooltip',
    },
    scale: {
      type: [String, Number],
      default: 1,
      note: 'Icon size',
    },
    variant: {
      type: String,
      default: 'dark',
      required: false,
      note: 'Tooltip variant',
    },
  },
  computed: {
    helpContent() {
      let o = {
        html: true,
        placement: 'auto',
        variant: 'dark',
        content: this.helpBody,
      };
      if (this.helpTitle !== null) {
        o['title'] = this.helpTitle;
      }
      return o;
    },
  },
};
</script>
