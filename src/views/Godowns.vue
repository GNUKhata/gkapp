<template>
  <section class="m-2">
    <b-input-group class="mb-3 container-sm gksearch d-print-none">
      <template #prepend>
        <b-button
          @click="$router.push('/godowns/add')"
          variant="warning"
          size="sm"
        >
          <b-icon icon="building" /> <translate> Add Godown </translate>
        </b-button>
      </template>
      <b-form-input
        type="text"
        placeholder="Search Godowns"
        v-model="searchText"
      />
    </b-input-group>
    <gk-toolbar>
      <gk-file-download
        title="Download Godown List"
        file-suffix="GodownList"
        :url="
          `/spreadsheet?all-godowns&fystart=${this.dateReverse(
            this.yearStart,
          )}&fyend=${this.dateReverse(this.yearEnd)}&orgname=${this.orgName}`
        "
        :message-from-parent="parentMessage"
      />
    </gk-toolbar>
    <b-table
      :filter="searchText"
      :items="allGodowns"
      :fields="fields"
      striped
      sort-direction="asc"
      head-variant="dark"
      class="mx-auto"
      hover
      outlined
      small
      responsive
      fixed
      stacked="sm"
      :busy="loading"
    >
      <template #table-busy>
        <div class="text-center">
          <b-spinner
            class="align-middle"
            type="grow"
          />
          <strong> Fetching Godowns... </strong>
        </div>
      </template>
      <template #cell(godown_name)="data">
        <b-link
          variant="dark"
          @click="$router.push(`/godowns/${data.item.goid}`)"
        >
          {{ data.item.godown_name }}
        </b-link>
      </template>
    </b-table>
  </section>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import axios from 'axios';
import GkFileDownload from '@/components/GkFileDownload.vue';
import GkToolbar from '../components/GkToolbar.vue';
export default {
  name: 'Godowns',
  components: { GkFileDownload, GkToolbar },
  data() {
    return {
      parentMessage: '',
      searchText: '',
      loading: false,
      allGodowns: [],
      godownId: Number,
    };
  },
  computed: {
    ...mapGetters('global', ['isIndia']),
    fields:  (self) => {
      const tableFields = [
        { key: 'godown_name', sortable: true },
        { key: 'address', sortable: true },
        { key: 'contact_person', sortable: true },
        { key: 'contact_number', sortable: true },
      ];
      if (self.isIndia) {
        tableFields.splice(1, 0 , { key: 'state', sortable: true });
      }
      return tableFields;
    },
    ...mapState(['gkCoreUrl', 'authToken', 'yearStart', 'yearEnd', 'orgName']),
  },
  methods: {
    /* Fetch all categories from api and assign it to allGodowns */
    getGodownsList() {
      this.loading = true;
      axios
        .get(`${this.gkCoreUrl}/godown`, {
          headers: { gktoken: this.authToken },
        })
        .then((r) => {
          if (r.status == 200) {
            let u = r.data.gkresult.map((data) => {
              let obj = {};
              obj.goid = data.goid;
              obj.godown_name = data.goname;
              obj.state = data.state;
              obj.address = data.goaddr;
              obj.contact_person = data.contactname;
              obj.contact_number = data.gocontact;
              return obj;
            });
            this.allGodowns = u;
          } else {
            this.$bvToast.toast('Failed to fetch godowns', {
              variant: 'danger',
              solid: true,
            });
          }
          this.loading = false;
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            variant: 'danger',
            solid: true,
          });
        });
      this.loading = false;
    },
  },
  mounted() {
    this.getGodownsList();
  },
};
</script>

<style scoped>
table {
  width: 70%;
}
@media all and (max-width: 600px) {
  table {
    width: 90%;
  }
}
</style>
