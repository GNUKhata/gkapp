<template>
  <div class="px-md-3 px-1 py-2">
    <voucher
      :type="type"
      :customer="customer"
      mode="create"
    />
  </div>
</template>

<script>
import Voucher from "../components/form/Voucher.vue";
export default {
  name: "CreateVoucher",
  components: { Voucher },
  props: {
    type: {
      type: String,
      validator: function (value) {
        return (
          [
            "receipt",
            "payment",
            "purchase",
            "sales",
            "journal",
            "contra",
          ].indexOf(value) !== -1
        );
      },
      default: "receipt",
      required: false,
    },
    customer: {
      type: String,
      required: false,
      default: null,
    },
  },
  data() {
    return {};
  },
  computed: {},
  watch: {},
  methods: {
    
  },
  mounted() {},
};
</script>
