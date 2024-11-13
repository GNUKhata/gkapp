<template>
  <section class="container-fluid">
    <!-- <b-overlay :show="isLoading" no-wrap> </b-overlay> -->
    <report-header>
      <div class="text-center mb-2 d-none d-print-block">
        <i>Product List</i>
      </div>
    </report-header>
    <div class="d-flex justify-content-center mt-3 mb-3 d-print-none">
      <b-form-input
        class="border border-secondary container-sm gksearch"
        type="text"
        placeholder="Search Products/Services"
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
        value="7"
      >
        Products
      </b-form-checkbox>
      <b-form-checkbox
        @change="applyFilter"
        v-model="status"
        value="19"
      >
        Services
      </b-form-checkbox>
    </div>
    <b-table
      stacked="sm"
      small
      hover
      striped
      head-variant="dark"
      fixed
      bordered
      :items="result"
      :filter="searchText"
      :fields="fields"
      :busy="isLoading"
    >
      <template #table-busy>
        <div class="text-center">
          <b-spinner
            class="align-middle"
            type="grow"
          />
          <strong> Fetching Products ... </strong>
        </div>
      </template>
      <template #cell(productdesc)="data">
        <b-link
          @click="$router.push(`/workflow/Business/${data.item.productcode}`)"
        >
          {{ data.item.productdesc }}
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
  name: 'ProductList',
  data() {
    return {
      productList: [],
      isLoading: true,
      searchText: '',
      result: [],
      status: '',
      fields: [
        {
          key: 'productdesc',
          label: 'Name',
          sortable: true,
        },
        {
          key: 'productquantity',
          sortable: true,
          label: 'Quantity',
        },
        {
          key: 'unitname',
          label: 'UOM',
          sortable: true,
        },
        {
          key: 'categoryname',
          label: 'Category',
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
      if (this.status !== 'all') {
        let list = this.productList.filter((p) => {
          return p.gsflag == this.status;
        });
        this.result = list;
      } else {
        this.result = this.productList;
      }
    },
    getProducts() {
      axios
        .get('/product')
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
            case 0:
              this.productList = r.data.gkresult;
              this.applyFilter();
              this.isLoading = false;
              break;
            case 2:
              this.$bvToast.toast('Unauthorised Access', {
                title: 'Error',
                variant: 'danger',
                solid: true,
              });
              break;
            case 4:
              this.$bvToast.toast('You have no permission to access', {
                title: 'Error',
                variant: 'danger',
                solid: true,
              });
              break;
            }
          }
        })
        .catch((e) => {
          console.error(e);
          this.$bvToast.toast(e.message, {
            title: e.message,
            variant: 'danger',
            solid: true,
          });
        });
    },
  },
  mounted() {
    this.status = 'all';
    this.getProducts();
  },
};
</script>
