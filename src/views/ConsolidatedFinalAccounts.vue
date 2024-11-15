<template>
  <section class="m-2">
    <b-card
      header="Consolidated Final Accounts"
      class="gkcard mx-auto"
      header-bg-variant="dark"
      header-text-variant="light"
    >
      <autocomplete
        :options="orgList"
        text-field="yearstart"
        value-field="orgcode"
        placeholder="Select year"
      />
      <b-button
        size="sm"
        variant="success"
        class="mt-3 float-right"
      >
        <b-icon icon="eye-fill" /> View
      </b-button>
    </b-card>
  </section>
</template>

<script>
import axios from 'axios';
import Autocomplete from '../components/Autocomplete.vue';
export default {
  components: { Autocomplete },
  name: 'ConsolidatedFinalAccounts',
  data() {
    return {
      orgList: [],
    };
  },
  methods: {
    /*
     * send org name & type & get a org's financial years as objects
     */
    getOrgYears() {
      this.isDisabled = true;
      const org = JSON.parse(sessionStorage.getItem('orgArray'));
      // Save org name for next login
      axios
        .get(`/orgyears/${org[0]}/${org[1]}`)
        .then((r) => {
          if (r.status == 200) {
            this.orgList = r.data.gkdata;
          }
          this.isDisabled = false;
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            title: 'Get Orgyears',
            variant: 'danger',
          });
          this.isDisabled = false;
        });
    },
  },
  mounted() {
    this.getOrgYears();
  },
};
</script>
