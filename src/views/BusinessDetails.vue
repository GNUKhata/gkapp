<template>
  <div class="d-flex justify-content-center align-form-label-right">
    <div class="d-inline-block mt-4 mx-2">
      <business-item :mode="mode" />
    </div>
  </div>
</template>

<script>
import BusinessItem from '../components/form/BusinessItem.vue';
export default {
  name: 'BusinessDetails',
  components: { BusinessItem },
  props: {
    mode: {
      type: String,
      validator: function(value) {
        return ['create', 'edit'].indexOf(value) !== -1;
      },
      required: true,
    },
  },
  data() {
    return {};
  },
};
</script>
