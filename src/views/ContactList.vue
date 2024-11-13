<template>
  <section class="container-fluid">
    <!-- <b-overlay :show="isLoading" no-wrap> </b-overlay> -->
    <report-header>
      <div class="text-center mb-2 d-none d-print-block">
        <i>Customer / Supplier List</i>
      </div>
    </report-header>
    <div class="d-flex justify-content-center mt-3 mb-3 d-print-none">
      <b-form-input
        class="border border-secondary container-sm gksearch"
        type="text"
        placeholder="Search Customers / Suppliers"
        v-model="searchText"
      />
    </div>
    <div class="d-flex justify-content-center mb-2">
      Sort by:
      <b-form-checkbox
        class="ml-2 mr-2"
        @change="applyFilter"
        v-model="status"
        value="all"
      >
        All
      </b-form-checkbox>
      <b-form-checkbox
        @change="applyFilter"
        class="mr-2"
        v-model="status"
        value="cus"
      >
        Customers
      </b-form-checkbox>
      <b-form-checkbox
        @change="applyFilter"
        v-model="status"
        value="sup"
      >
        Suppliers
      </b-form-checkbox>
    </div>
    <b-table
      class="rtable mx-auto"
      stacked="sm"
      small
      hover
      striped
      head-variant="dark"
      bordered
      :items="result"
      :filter="searchText"
      :busy="isLoading"
      :fields="fields"
    >
      <template #table-busy>
        <div class="text-center">
          <b-spinner
            class="align-middle"
            type="grow"
          />
          <strong>Fetching Contacts ...</strong>
        </div>
      </template>
      <template #cell(custname)="data">
        <b-link
          @click="$router.push(`/workflow/Contacts/${data.item.custid}`)"
        >
          {{ data.item.custname }}
        </b-link>
      </template>
    </b-table>
  </section>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
import ReportHeader from '../components/ReportHeader.vue';
export default {
  components: { ReportHeader },
  name: 'ContactList',
  data() {
    return {
      productList: [],
      isLoading: true,
      searchText: '',
      result: [],
      status: '',
      fields: [
        {
          key: 'custname',
          label: 'Name',
          sortable: true,
        },
      ],
    };
  },
  computed: {
    ...mapState(['orgName']),
  },
  methods: {
    applyFilter() {
      switch (this.status) {
      case 'all':
        this.result = [...this.customerList, ...this.supplierList];
        break;
      case 'cus':
        this.result = this.customerList;
        break;
      case 'sup':
        this.result = this.supplierList;
        break;
      }
    },
    getContacts() {
      const requests = [
        axios.get('/customer?qty=custall').catch((error) => {
          return error;
        }),
        axios.get('/customer?qty=supall').catch((error) => {
          return error;
        }),
      ];
      Promise.all([requests[0], requests[1]])
        .then((r) => {
          if (r[0].status == 200) {
            this.customerList = r[0].data.gkresult;
          }
          if (r[1].status == 200) {
            this.supplierList = r[1].data.gkresult;
          }
          this.result = [...this.customerList, ...this.supplierList];
          this.isLoading = false;
        })
        .catch((e) => {
          console.error(e);
        });
    },
  },
  mounted() {
    this.status = 'all';
    this.getContacts();
  },
};
</script>
