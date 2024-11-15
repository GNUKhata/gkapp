<template>
  <div class="px-md-3 px-1 py-2">
    <voucher
      :vid="vid"
      mode="edit"
    />
  </div>
</template>

<script>
import Voucher from "../components/form/Voucher.vue";
export default {
  name: "VoucherEdit",
  components: { Voucher },
  props: {
    vid: {
      type: [Number, String],
      required: true
    }
  },
  data() {
    return {};
  },
  computed: {},
  watch: {},
  methods: {},
  mounted() {},
};
</script>
