<template>
  <div
    class="mt-4 mx-2 align-form-label-right"
    style="min-width: 300px"
  >
    <budget-item
      mode="create"
      :type="type"
    />
  </div>
</template>

<script>
import BudgetItem from '../components/form/BudgetItem.vue';

export default {
  name: 'BudgetCreate',
  components: { BudgetItem },
  props: {
    type: {
      type: [String],
      validator: function(value) {
        return ['cash', 'pl'].indexOf(value) !== -1;
      },
      required: true,
    },
  },
  data() {
    return {
    };
  },
  computed: {},
  watch: {},
};
</script>
