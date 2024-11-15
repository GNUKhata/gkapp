<template>
  <div
    class="mt-4 mx-2 align-form-label-right"
    style="min-width: 300px"
  >
    <budget-item
      mode="edit"
      :id="id"
    />
  </div>
</template>

<script>
import BudgetItem from '../components/form/BudgetItem.vue';

export default {
  name: 'BudgetEdit',
  components: { BudgetItem },
  props: {
    id: {
      type: [String, Number],
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
