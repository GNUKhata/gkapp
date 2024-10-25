<template>
  <section class="m-1">
    <b-overlay :show="loading">
      <b-card
        :header="$gettext('Stock On Hand')"
        header-bg-variant="dark"
        header-text-variant="light"
        class="mx-auto gkcard d-print-none"
      >
        <b-form @submit.prevent="stockOnHand">
          <!-- product select -->
          <b-form-group :label="$gettext('Product')" label-cols="auto">
            <v-select
              :options="productList"
              v-model="selectedProduct"
              :placeholder="this.$gettext('Search Products')"
              label="name"
              :required="true"
            ></v-select>
            <div class="text-left"></div>
          </b-form-group>
          <!-- Godown select -->
          <b-form-group :label="$gettext('Godown')" label-cols="auto">
            <v-select
              v-model="selectedGodown"
              :options="godowns"
              :placeholder="this.$gettext('Search / Select a godown')"
              label="name"
              :required="true"
            ></v-select>
          </b-form-group>
          <div class="col">
            <b-form-group
              :label="$gettext('As on')"
              label-cols="auto"
              label-align="right"
            >
              <gk-date
              v-model="toDate"
              :format="dateFormat"
              :min="minimumDate"
              :max="maxDate"
              id="to"
              @validity="setDateValidity"
              :required="true"
              ></gk-date>
            </b-form-group>
          </div>
          <b-button
            @click="updateRoute"
            type="submit"
            variant="success"
            class="float-right"
          >
            <b-icon class="mr-1" icon="cloud-download"></b-icon>
            <translate>Get Details</translate>
          </b-button>
        </b-form>
      </b-card>
    </b-overlay>
    <!-- Table -->
    <section class="mt-2" v-if="report.length > 0">
      <report-header>
        <div class="text-center">
          <i
            >Stock report of {{ selectedProduct.name }} in Godown:
            {{ selectedGodown.name }} as on: {{ dateReverse(toDate) }}
          </i>
        </div>
      </report-header>
      <b-form-input
        v-model="search"
        :placeholder="$gettext('Search Products')"
        class="gkcard mx-auto d-print-none"
      ></b-form-input>
      <!-- results -->
      <b-table
        caption-top
        class="mt-3"
        head-variant="dark"
        small
        bordered
        striped
        responsive
        :filter="search"
        v-if="report.length > 0"
        :items="report"
        :fields="fields"
      >
        <template #cell(product)="data">
          <router-link
            :to="
              `/product-register?product_id=${selectedProduct.id}&current_date=${toDate}&goid=${selectedGodown?.id}`
            "
            >{{ data.item.product }}
          </router-link>
        </template>
        <template #cell(balance)="data">
          <div
            class="bg-danger text-light"
            v-if="data.item.balance.split('').includes('-')"
          >
            <div class="ml-1">{{ data.item.balance }}</div>
          </div>
          <div v-else>{{ data.item.balance }}</div>
        </template>
      </b-table>
    </section>
  </section>
</template>

<script>
import axios from 'axios';
import GkDate from '../components/GkDate.vue';
import { mapState } from 'vuex';
import ReportHeader from '@/components/ReportHeader.vue';
export default {
  name: 'StockOnHand',
  components: { GkDate, ReportHeader },
  data() {
    return {
      date: {
        valid: null,
        format: 'dd-mm-yyyy',
      },
      productList: [],
      loading: false,
      selectedProduct: {},
      allProducts: false,
      fromDate: '',
      toDate: '',
      report: [],
      godowns: [],
      selectedGodown: {},
      godownReport: [],
      fields: [],
      showCard: true,
      search: '',
    };
  },
  computed: {
    ...mapState(['yearStart', 'yearEnd', 'orgName']),
    defaultFields: function() {
      let fields = [
        {
          key: 'product',
          label: this.$gettext('Product'),
        },
        {
          key: 'total_inward_qty',
          label: this.$gettext('Total Inward Qty'),
        },
        {
          key: 'total_outward_qty',
          label: this.$gettext('Total Outward Qty'),
        },
        {
          key: 'balance',
          label: this.$gettext('Balance'),
        },
      ];
      return fields;
    },
    minimumDate: (self) => {
      let date = self.reverseDate(self.yearStart);
      return date;
    },
    maxDate: (self) => {
      let date = self.reverseDate(self.yearEnd);
      return date;
    },
    dateFormat: (self) => self.$store.getters['global/getDateFormat'],
  },
  methods: {
    getGodownList() {
      axios
        .get('/godown')
        .then((r) => {
          if (r.status == 200 && r.data.gkstatus == 0) {
            this.godowns = r.data.gkresult.map((data) => {
              return {
                id: data.goid,
                name: `${data.goname} (${data.goaddr}) `,
              };
            });
            this.godowns = [
              {
                name: 'All',
                id: 0,
              },
              ...this.godowns,
            ];
            // pre fill the godown input with a godown if user selected godown exits
            if (Object.keys(this.$route.query).length == 0) {
              this.selectedGodown = this.godowns[0];
            }
          }
        })
        .catch((e) => {
          console.log(e.message);
        });
    },
    // get product list from the api
    getProductList() {
      this.loading = true;
      axios
        .get('/product?invdc=4')
        .then((r) => {
          if (r.status == 200) {
            this.productList = r.data.gkresult.map((data) => {
              return {
                name: data.productdesc,
                id: data.productcode,
              };
            });
            this.productList = [
              {
                name: 'All',
                id: 0,
              },
              ...this.productList,
            ];
            //prefill a product if user did not specify any
            if (Object.keys(this.$route.query).length == 0) {
              this.selectedProduct = this.productList[0];
            }
          }
          this.loading = false;
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            variant: 'danger',
            solid: true,
          });
          this.loading = false;
        });
      this.loading = true;
    },
    stockOnHand() {
      this.report = [];
      this.loading = true;

      let requests = [];

      let _type = 'pg';
      this.fields = this.defaultFields;
      if (Number(this.selectedProduct.id) === 0 && Number(this.selectedGodown.id) === 0) {
        _type = 'apag';
      } else if (Number(this.selectedProduct.id) === 0 && Number(this.selectedGodown.id) !== 0) {
        _type = 'apg';
      } else if (Number(this.selectedProduct.id) !== 0 && Number(this.selectedGodown.id) === 0) {
        _type = 'pag';
      } else {
        this.fields = [
          ...this.defaultFields,
          {
            key: 'value',
            label: this.$gettext('Value'),
          }
        ];
      }
      let url = `/reports/godownwise-stock-on-hand?type=${_type}&goid=${this.selectedGodown.id}&productcode=${this.selectedProduct.id}&enddate=${this.toDate}`;
      let stockValueUrl = `/reports/godownwise-stock-value?goid=${this.selectedGodown.id}&productcode=${this.selectedProduct.id}&enddate=${this.toDate}`;
      requests = [axios.get(url), axios.get(stockValueUrl)];

      Promise.all(requests)
        .then(([resp1, resp2]) => {
          switch (resp1.data.gkstatus) {
            case 0:
              this.report = resp1.data.gkresult?.map((data) => {
                return {
                  no: data.srno,
                  product: data.productname || this.selectedProduct.name,
                  total_inward_qty: data.totalinwardqty,
                  total_outward_qty: data.totaloutwardqty,
                  balance: data.balance,
                  productcode: data.productcode,
                };
              }) ?? [];
              break;
            case 2:
              this.$bvToast.toast(this.$gettext('Unauthorised Access'), {
                variant: 'danger',
                solid: true,
              });
              break;
            default:
              this.$bvToast.toast(this.$gettext('Data error'), {
                variant: 'danger',
                solid: true,
              });
          }

          if (resp2.data.gkstatus === 0 && this.report?.[0]) {
            this.report[0].value = resp2.data.gkresult;
          } else {
            this.$bvToast.toast('No data found', {
              title: 'Error',
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
          this.loading = false;
        });
    },
    // change url query params when date is changed by user
    updateRoute() {
      this.$router.replace({
        query: {
          to: this.toDate,
          prodcode: this.selectedProduct.id,
          prodname: this.selectedProduct.name,
          goid: this.selectedGodown.id,
          goname: this.selectedGodown.name,
        },
      });
    },
    // check if user changed the date range, then applied them to the url
    parseParams() {
      this.getGodownList();
      this.getProductList();
      this.toDate = this.currentDate();
      const params = this.$route.query;
      if (Object.keys(params).length > 0) {
        this.toDate = params.to;
        this.selectedProduct['id'] = params.prodcode;
        this.selectedProduct['name'] = params.prodname;
        this.selectedGodown.id = params.goid;
        this.selectedGodown.name = params.goname;
        this.stockOnHand();
      } else {
        this.selectedGodown = this.godowns[0];
      }
    },
    setDateValidity(validity) {
      this.date.valid = validity;
    },
    reverseDate(date) {
      return date
        ? date
            .split('-')
            .reverse()
            .join('-')
        : '';
    },
  },
  mounted() {
    this.parseParams();
  },
};
</script>
