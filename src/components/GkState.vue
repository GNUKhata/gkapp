<template>
  <b-select
    v-model="selectedState"
    :options="states"
    :text-field="textField"
    :value-field="valueField"
    :size="size"
    :required="required"
    @change="$emit('change', selectedState)"
  >
    <template #first>
      <b-form-select-option
        value=""
        disabled
      >
        -- Please select state --
      </b-form-select-option>
    </template>
  </b-select>
</template>

<script>
import axios from 'axios';
export default {
  name: 'GkState',
  model: {
    prop: 'selectedState',
    event: 'change',
  },
  props: {
    textField: {
      type: String,
      default: 'state_name',
    },
    valueField: {
      type: String,
      default: 'state_name',
    },
    size: {
      type: String,
      default: 'sm',
    },
    required: {
      type: [Boolean, String],
      default: false,
    },
  },
  data() {
    return {
      states: [],
      selectedState: '',
    };
  },
  methods: {
    getStateList() {
      axios.get('/state?full').then((r) => {
        if (r.status == 200) {
          this.states = r.data.gkresult;
        } else {
          console.log('failed to fetch states');
        }
      });
    },
  },
  mounted() {
    this.getStateList();
  },
};
</script>
