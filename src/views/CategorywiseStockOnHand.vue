<template>
  <section class="m-2">
    <b-overlay :show="loading">
      <b-card
        :header="$gettext('Category wise Stock On Hand')"
        header-bg-variant="dark"
        header-text-variant="light"
        class="mx-auto gkcard d-print-none"
      >
        <b-form @submit.prevent="stockOnHand">
          <!-- category select -->
          <b-form-group
            :label="$gettext('Category')"
            label-size="sm"
            label-align="right"
            label-cols="4"
          >
            <autocomplete
              @input="getSubcategoryList"
              v-model="categoryID"
              :options="categoryList"
              placeholder="Search / Select Category"
              :required="!allProducts"
            />
          </b-form-group>
          <!-- subcategory select -->
          <b-form-group
            :label="$gettext('Sub Category')"
            label-size="sm"
            label-align="right"
            label-cols="4"
          >
            <autocomplete
              v-model="subCategoryID"
              :options="subCategoryList"
              :placeholder="$gettext('Search / Select sub category')"
              :required="false"
            />
          </b-form-group>
          <!-- date -->
          <div class="col">
            <b-form-group
              :label="$gettext('As on')"
              label-size="sm"
              label-cols="4"
              label-align="right"
            >
              <gk-date
                :required="true"
                v-model="toDate"
                id="1"
              />
            </b-form-group>
          </div>
          <!-- checkboxes -->
          <div class="d-flex justify-content-center">
            <b-form-checkbox
              size="sm"
              v-model="showGodowns"
              ref="allstock"
              class="mb-2 justify-content-right"
              switch
              :unchecked-value="false"
              :disabled="allProducts"
            >
              <translate>
                Godown Wise Stock On Hand Report
              </translate>
            </b-form-checkbox>
          </div>
          <!-- Godown select -->
          <b-form-group
            v-if="showGodowns"
            :label="$gettext('Godown')"
            label-align="right"
            label-size="sm"
            label-cols="4"
          >
            <autocomplete
              :placeholder="$gettext('Search / Select a godown')"
              v-model="godownId"
              :options="godowns"
            />
          </b-form-group>
          <b-button
            size="sm"
            type="submit"
            variant="success"
            class="float-right"
          >
            <b-icon
              class="mr-1"
              icon="cloud-download"
            />
            <translate>Get Details</translate>
          </b-button>
        </b-form>
      </b-card>
    </b-overlay>

    <!-- Table -->
    <section
      class="mt-5 rtable mx-auto"
      v-if="report.length > 0"
    >
      <report-header>
        <div class="text-center">
          <translate>Categorywise Stock On Hand report as on: </translate>
          {{ dateReverse(toDate) }}
        </div>
      </report-header>
      <b-form-input
        v-model="search"
        :placeholder="$gettext('Search Products')"
        class="gkcard mx-auto d-print-none"
      />
      <b-table
        caption-top
        class="mt-3"
        head-variant="dark"
        small
        bordered
        striped
        stacked="sm"
        :filter="search"
        v-if="report.length > 0"
        :items="report"
        :fields="fields"
      />
    </section>
  </section>
</template>

<script>
import axios from 'axios';
import Autocomplete from '../components/Autocomplete.vue';
import GkDate from '../components/GkDate.vue';
import { mapState } from 'vuex';
import ReportHeader from '../components/ReportHeader.vue';
export default {
  name: 'CategorywiseStockOnHand',
  components: { Autocomplete, GkDate, ReportHeader },
  data() {
    return {
      categoryList: [],
      subCategoryList: [],
      loading: false,
      categoryID: '',
      subCategoryID: null,
      allProducts: false,
      fromDate: '',
      toDate: '',
      report: [],
      godowns: [],
      showGodowns: false,
      godownId: null,
      godownReport: [],
      showCard: true,
      search: '',
      fields: [
        {
          key: 'productname',
          label: this.$gettext('Product Name'),
          sortable: true,
        },
        {
          key: 'balance',
          label: this.$gettext('Balance'),
          sortable: true,
        },
      ],
    };
  },
  computed: {
    ...mapState(['yearStart', 'yearEnd', 'orgName', 'orgCode']),
  },
  methods: {
    getGodownList() {
      axios
        .get('/godown')
        .then((r) => {
          if (r.status == 200 && r.data.gkstatus == 0) {
            this.godowns = r.data.gkresult.map((data) => {
              return {
                value: data.goid,
                text: `${data.goname} (${data.goaddr}) `,
              };
            });
          }
        })
        .catch((e) => {
          console.error(e.message);
        });
    },
    getCategoryList() {
      this.loading = true;
      axios
        .get('/categories')
        .then((r) => {
          if (r.status == 200) {
            this.categoryList = r.data.gkresult.map((data) => {
              return {
                text: data.categoryname,
                value: data.categorycode,
              };
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
      this.loading = true;
    },
    getSubcategoryList() {
      axios
        .get(`/categories?type=children&categorycode=${this.categoryID}`)
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
            case 0:
              this.subCategoryList = r.data.gkresult.map((data) => {
                return {
                  text: data.categoryname,
                  value: data.categorycode,
                };
              });
              break;
            case 1:
              this.$bvToast.toast(this.$gettext('Duplicate Entry'), {
                variant: 'warning',
                solid: true,
              });
              break;
              // case 2:
              //   this.$bvToast.toast('Unauthorised Access', {
              //     variant: 'danger',
              //     solid: true,
              //   });
              //   break;
              // case 3:
              //   this.$bvToast.toast('Data error', {
              //     variant: 'danger',
              //     solid: true,
              //   });
              //   break;
              // case 4:
              //   this.$bvToast.toast('No Privilege', {
              //     variant: 'danger',
              //     solid: true,
              //   });
              //   break;
              // case 5:
              //   this.$bvToast.toast('Integrity error', {
              //     variant: 'danger',
              //     solid: true,
              //   });
              //   break;
            }
          }
        });
    },
    stockOnHand() {
      this.report = [];
      this.loading = true;

      if (this.subCategoryID == null) {
        this.subCategoryID = 'all';
      }
      if (!this.showGodowns) {
        this.godownId = 'all';
      }
      let url = `/reports/category-wise-stock-on-hand?categorycode=${this.categoryID}&subcategorycode=${this.subCategoryID}&enddate=${this.toDate}&goid=${this.godownId}&speccode=all`;
      axios
        .get(url)
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
            case 0:
              this.report = r.data.gkresult;
              break;
            case 1:
              this.$bvToast.toast(this.$gettext('Duplicate Entry'), {
                variant: 'warning',
                solid: true,
              });
              break;
            case 2:
              this.$bvToast.toast(this.$gettext('Unauthorised Access'), {
                variant: 'danger',
                solid: true,
              });
              break;
            case 3:
              this.$bvToast.toast(this.$gettext('Data error'), {
                variant: 'danger',
                solid: true,
              });
              break;
            case 4:
              this.$bvToast.toast(this.$gettext('No Privilege'), {
                variant: 'danger',
                solid: true,
              });
              break;
            case 5:
              this.$bvToast.toast(this.$gettext('Integrity error'), {
                variant: 'danger',
                solid: true,
              });
              break;
            }
          } else {
            this.$bvToast.toast(
              this.$gettext('Failed to get product stock report with status ') +
                r.status,
              {
                variant: 'danger',
                solid: true,
              }
            );
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
  },
  mounted() {
    this.getCategoryList();
    this.getGodownList();
    this.toDate = this.currentDate();
  },
};
</script>
