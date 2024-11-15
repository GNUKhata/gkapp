<template>
  <div class="d-flex justify-content-center mt-4 mx-2 align-form-label-right">
    <div
      class="d-inline-block"
      style="min-width: 300px"
    >
      <contact-item
        :mode="mode"
        :type="type"
      />
    </div>
  </div>
</template>

<script>
import ContactItem from "../components/form/ContactItem.vue";
export default {
  name: "ContactDetails",
  components: {
    ContactItem,
  },
  props: {
    mode: {
      type: String,
      validator: function (value) {
        return ["create", "edit"].indexOf(value) !== -1;
      },
      required: true,
    },
    type: {
      type: String,
      validator: function (value) {
        return ["customer", "supplier"].indexOf(value) !== -1;
      },
      required: true,
    },
  },
  data() {
    return {};
  },
};
</script>
