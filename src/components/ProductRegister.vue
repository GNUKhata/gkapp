<template>
  <section class="m-2">
    <b-overlay :show="loading">
      <b-card
        header="Product Register"
        header-bg-variant="dark"
        header-text-variant="light"
        style="max-width: 40em"
        class="mx-auto d-print-none"
      >
        <b-form @submit.prevent="check">
          <b-form-group label="Product" label-align="right" label-cols="auto">
            <!-- select product -->
            <b-form-select
              :options="productList"
              v-model="productId"
              text-field="label"
              value-field="id"
              required
            ><template #first>
              <b-form-select-option :value="null">-- Please select a product --</b-form-select-option>
            </template>
            </b-form-select>
          </b-form-group>
          <div class="row">
            <div class="col">
              <b-form-group label="From" label-align="left">
                <gk-date
                  :required="true"
                  v-model="fromDate"
                  id="from"
                  class="mr-4"
                ></gk-date>
              </b-form-group>
            </div>
            <div class="col">
              <b-form-group label="To" label-align="left">
                <gk-date :required="true" v-model="toDate" id="to"></gk-date>
              </b-form-group>
            </div>
          </div>
          <!-- Godown select -->
          <b-form-group label="Godown" label-cols="auto">
            <autocomplete
              placeholder="Search / Select a godown"
              v-model="godownId"
              :godownData="godownId"
              :options="godowns"
              :required="true"
            ></autocomplete>
          </b-form-group>
          <b-button type="submit" variant="success" class="float-right"
            ><b-icon icon="eye-fill"></b-icon> View</b-button
          >
        </b-form>
      </b-card>
    </b-overlay>
    <!-- report -->
    <div v-if="report.length > 0" class="mt-2">
      <report-header>
        <template>
          <div class="text-center">
            Product Register:
            <b>{{ productName }}</b>
            | From
            <b>{{ dateReverse(fromDate) }}</b>
            to
            <b>{{ dateReverse(toDate) }}</b>
          </div>
        </template>
      </report-header>
      <!-- Toolbar -->
      <gk-toolbar>
        <!-- search bar -->
        <template #left>
          <b-form-input
            size="sm"
            v-model="search"
            class="border-dark"
            style="align-self: center"
            placeholder="search invoices"
          ></b-form-input>
        </template>
        <!-- filters -->
        <gk-hovermenu>
          <div class="font-weight-bold bg-dark text-light p-1 mb-1">
            Invoice Type
          </div>
          <b-form-checkbox-group
            @change="applyFilters"
            class=""
            v-model="invoiceFilter"
          >
            <b-form-checkbox class="w-100" value="invoice"
              ><b-icon icon="receipt"></b-icon> Invoice</b-form-checkbox
            >
            <b-form-checkbox class="w-100" value="Rejection Note"
              ><b-icon icon="journal-x" variant="danger"></b-icon> Rejection
              Note</b-form-checkbox
            >
            <b-form-checkbox class="w-100" value="Debit Note"
              ><b-icon icon="file-earmark-minus" variant="warning"></b-icon>
              Debit Note</b-form-checkbox
            >
            <b-form-checkbox class="w-100" value="Credit Note"
              ><b-icon icon="file-earmark-plus" variant="info"></b-icon> Credit
              Note</b-form-checkbox
            >
            <b-form-checkbox class="w-100" value="transfer note"
              ><b-icon icon="file-earmark-font" variant="info"></b-icon> Transfer
              note</b-form-checkbox
            >
            <b-form-checkbox class="w-100" value="delchal"
              ><b-icon icon="files-alt" variant="info"></b-icon> Delchal</b-form-checkbox
            >
          </b-form-checkbox-group>
        </gk-hovermenu>
        <!-- Report download -->
        <gk-file-download
          :url="
            `/spreadsheet/product-register?calculatefrom=${dateReverse(
              this.fromDate
            )}&calculateto=${dateReverse(this.toDate)}&productcode=${
              productId
            }&productdesc=${this.productName}&godownflag=1&goid=${
              this.godownId
            }&goname=${getGodownName(this.godownId)?.text}&goaddr=${
              getGodownName(this.godownId)?.text
            }&fystart=${dateReverse(this.yearStart)}&fyend=${dateReverse(
              this.yearEnd
            )}&orgname=${this.orgName}&orgtype=${this.orgType}`
          "
          fileExtn="xlsx"
          :commonParams="false"
          :messageFromParent="parentMessage"
        ></gk-file-download>
      </gk-toolbar>
      <!-- result table -->
      <b-table
        small
        class="table-border-dark"
        striped
        head-variant="dark"
        :items="report"
        responsive="sm"
        :fields="fields"
        :filter="search"
        show-empty
      >
        <!-- Transaction type -->
        <template #cell(particulars)="data">
          <div v-if="data.item.trntype === 'invoice'">
            <b-icon icon="receipt"></b-icon> {{ data.item.particulars }} :
            <b-link
              @click="updateRoute"
              :to="{
                name: 'Workflow',
                params: {
                  wfName:
                    data.item.icflag === 3
                      ? 'Transactions-CashMemo'
                      : 'Transactions-Invoice',
                  wfId: data.item.invid,
                },
              }"
            >
              <div class="d-inline" @click="updateRoute">
                {{ data.item.invno }}
              </div>
            </b-link>
          </div>
          <div v-else-if="data.item.trntype === 'delchal'">
            {{ data.item.particulars }} :
            <b-link
              @click="updateRoute"
              :to="{
                name: 'Workflow',
                params: {
                  wfName: 'Transactions-DeliveryNote',
                  wfId: data.item.dcid,
                },
              }"
            >
              <div class="d-inline" @click="updateRoute">
                {{ data.item.dcno }}
              </div>
            </b-link>
          </div>
          <div v-else-if="data.item.trntype === 'Rejection Note'">
            <b-icon variant="danger" icon="journal-x"></b-icon>
            {{ data.item.particulars }} :
            <b-link
              :to="{
                name: 'Workflow',
                params: {
                  wfName: 'Transactions-RejectionNote',
                  wfId: data.item.rnid,
                },
              }"
            >
              <div class="d-inline" @click="updateRoute">
                {{ data.item.rnno }}
              </div>
            </b-link>
          </div>
          <div v-else-if="data.item.trntype === 'Debit Note'">
            <b-icon variant="warning" icon="file-earmark-minus"></b-icon>
            {{ data.item.particulars }} :
            <b-link
              :to="{
                name: 'Workflow',
                params: {
                  wfName: 'Transactions-DebitCreditNote',
                  wfId: data.item.drcrid,
                },
              }"
            >
              <div class="d-inline" @click="updateRoute">
                {{ data.item.drcrno }}
              </div>
            </b-link>
          </div>
          <div v-else-if="data.item.trntype === 'Credit Note'">
            <b-icon variant="info" icon="file-earmark-plus"></b-icon>
            {{ data.item.particulars }} :
            <b-link
              :to="{
                name: 'Workflow',
                params: {
                  wfName: 'Transactions-DebitCreditNote',
                  wfId: data.item.drcrid,
                },
              }"
            >
              <div class="d-inline" @click="updateRoute">
                {{ data.item.drcrno }}
              </div>
            </b-link>
          </div>
          <div v-else-if="data.item.trntype === 'transfer note'">
            <b-link
              :to="{
                name: 'Workflow',
                params: {
                  wfName: 'Transactions-TransferNote',
                  wfId: data.item.tnid,
                },
              }"
            >
              <div class="d-inline" @click="updateRoute">
                {{ data.item.tnno }}
              </div>
            </b-link>
          </div>
          <div v-else class="font-weight-bold">
            <div class="d-inline" @click="updateRoute">
              {{ data.item.particulars }}
            </div>
          </div>
        </template>
        <template #cell(transactionType)="data">
          <div class="text-right">
            <span v-if="data.item.particulars === 'opening stock'"></span>
            <span v-if="data.item.particulars === 'Total'"></span>
            <span v-else>{{ data.item.trntype.charAt(0).toUpperCase() + data.item.trntype.slice(1) }}</span>
          </div>
        </template>
        <template #cell(inward)="data">
          <div class="text-right">
            <span v-if="data.item.particulars === 'opening stock'">{{
              data.item.inward
            }}</span>
            <span v-if="data.item.particulars === 'Total'">{{
              data.item.totalinwardqty
            }}</span>
            <span v-else>{{ data.item.inwardqty }}</span>
          </div>
        </template>
        <!-- Outward -->
        <template #cell(outward)="data">
          <div class="text-right">
            <span v-if="data.item.particulars === 'opening stock'">{{
              data.item.outward
            }}</span>
            <span v-if="data.item.particulars === 'Total'">{{
              data.item.totaloutwardqty
            }}</span>
            <span v-else>{{ data.item.outwardqty }}</span>
          </div>
        </template>
        <!-- balance -->
        <template #cell(balance)="data"
          ><div class="text-right">{{ data.item.balance }}</div>
        </template>
      </b-table>
  </div>
   <div v-if="report.length == 0">
      <!-- Toolbar -->
      <gk-toolbar>
        <!-- search bar -->
       
        <!-- filters -->
        <gk-hovermenu>
          <div class="font-weight-bold bg-dark text-light p-1 mb-1">
            Invoice Type
          </div>
          <b-form-checkbox-group
            @change="applyFilters"
            class=""
            v-model="invoiceFilter"
          >
            <b-form-checkbox class="w-100" value="invoice"
              ><b-icon icon="receipt"></b-icon> Invoice</b-form-checkbox
            >
            <b-form-checkbox class="w-100" value="Rejection Note"
              ><b-icon icon="journal-x" variant="danger"></b-icon> Rejection
              Note</b-form-checkbox
            >
            <b-form-checkbox class="w-100" value="Debit Note"
              ><b-icon icon="file-earmark-minus" variant="warning"></b-icon>
              Debit Note</b-form-checkbox
            >
            <b-form-checkbox class="w-100" value="Credit Note"
              ><b-icon icon="file-earmark-plus" variant="info"></b-icon> Credit
              Note</b-form-checkbox
            >
             <b-form-checkbox class="w-100" value="transfer note"
              ><b-icon icon="file-earmark-font" variant="info"></b-icon> Transfer
              Note</b-form-checkbox
            >
            <b-form-checkbox class="w-100" value="delchal"
              ><b-icon icon="files-alt" variant="info"></b-icon> Delchal </b-form-checkbox
            >
          </b-form-checkbox-group>
        </gk-hovermenu>
        <!-- Report download -->
      </gk-toolbar>
    <b-table  small
        class="table-border-dark"
        striped
        head-variant="dark"
        responsive="sm" :fields="fields" show-empty>
      <!-- Named slot "empty" for custom rendering when the table is empty -->
      <template #empty>
        <h4 style="text-align: center;">No result found.</h4>
      </template>
    </b-table>
    </div>
  </section>
</template>
<script>
import axios from 'axios';
import GkDate from './GkDate.vue';
import ReportHeader from './ReportHeader.vue';
import { mapState } from 'vuex';
import GkFileDownload from '@/components/GkFileDownload.vue';
import GkToolbar from './GkToolbar.vue';
import autocomplete from '@/components/Autocomplete.vue';
import GkHovermenu from '@/components/GkHovermenu.vue';

export default {
  name: 'ProductRegister',
  components: {
    GkDate,
    ReportHeader,
    GkFileDownload,
    GkToolbar,
    autocomplete,
    GkHovermenu,
  },
  data() {
    return {
      parentMessage: '',
      productList: [],
      search: '',
      loading: false,
      productId: null,
      fromDate: '',
      toDate: '',
      report: [],
      immutableReport: [],
      godowns: [],
      godownId: '',
      godownReport: [],
      invoiceFilter: ['invoice', 'Rejection Note', 'Debit Note', 'Credit Note', 'transfer note', 'delchal'],
      fields: [
        {
          key: 'date',
          label: 'Date',
          sortable: true,
        },
        {
          key: 'particulars',
          label: 'Particulars',
        },
         {
          key: 'transactionType',
          label: 'Trntype',
        },
        {
          key: 'inward',
          label: 'Inward',
          class: 'text-right',
        },
        {
          key: 'outward',
          label: 'Outward',
          class: 'text-center',
        },
        {
          key: 'balance',
          label: 'Balance',
          class: 'text-center',
        },
      ],
    };
  },
  methods: {
    getGodownName(id) {
      return this.godowns.filter((go) => {
        return go.value == id;
      })[0];
    },
    check() {
      this.getGodownStock();
    },
    applyFilters() {
      if (this.invoiceFilter.length > 0) {
        let items = [];
        for (let i in this.invoiceFilter) {
          this.immutableReport.forEach((data) => {
            if (data.trntype == this.invoiceFilter[i]) {
              items.push(data);
            }
          });
        }
        if (items.length > 0) {
          this.report = items;
          // if selected filter has no matching entries show notification
        } else {
          this.report = [];
          this.gk_toast(
            this.$gettext('Alert'),
            this.$gettext('No data present for selected filter'),
            'warning'
          );
        }
      } else {
        this.report = [];
      }
    },
    getStockReport() {
      this.loading = true;
      axios
        .get(
          `/reports/stock-report?productcode=${this.productId}&startdate=${this.fromDate}&enddate=${this.toDate}`
        )
        .then((r) => {
          const data = r.data;
          if (r.status == 200) {
            switch (data.gkstatus) {
              case 0:
                {
                  const r = data.gkresult.map((item) => {
                    if (item.trntype === 'delchal&invoice') {
                      item.trntype = 'invoice';
                    }
                    return item;
                  });
                  this.report = r;
                  this.immutableReport = r;
                }
                break;
              case 1:
                this.gk_toast(
                  this.$gettext('Alert'),
                  this.$gettext('Duplicate Entry'),
                  'warning'
                );
                break;
              case 2:
                this.gk_toast(
                  this.$gettext('Unauthorised Access'),
                  this.$gettext('Invalid user'),
                  'danger'
                );
                break;
              case 3:
                this.gk_toast(
                  this.$gettext('Data Error'),
                  this.$gettext('Error in fetching the data'),
                  'danger'
                );
                break;
              case 4:
                this.gk_toast(
                  this.$gettext('Privilege Error'),
                  this.$gettext('Your role does not have access to this data'),
                  'danger'
                );
                break;
              case 5:
                this.gk_toast(
                  this.$gettext('Integrity error'),
                  this.$gettext('Something unexpected has happened'),
                  'danger'
                );
                break;
            }
          } else {
            this.gk_toast(
              this.$gettext('Error'),
              this.$gettext('Failed to get the stock report'),
              'danger'
            );
          }
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
          this.gk_toast(
            this.$gettext('Error'),
            this.$gettext('Failed to get the stock report'),
            'danger'
          );
        });
    },
    getGodownStock() {
      if (!this.godownId) {
        const params = this.$route.query;
        this.fromDate = this.yearStart;
        this.toDate = params.current_date;
        this.productId = params.product_id;
        this.godownId = params.goid;
      }
      this.loading = true;
      this.invoiceFilter = ['invoice', 'Rejection Note', 'Debit Note', 'Credit Note', 'transfer note', 'delchal'],
      axios
        .get(
          `/reports/product-register?goid=${this.godownId}&productcode=${this.productId}&startdate=${this.fromDate}&enddate=${this.toDate}`
        )
        .then((r) => {
          if (r.status == 200) {
            const report = r.data.gkresult.map((item) => {
              if (item.trntype === 'delchal&invoice') {
                item.trntype = 'invoice';
              }
              return item;
            });
            this.report = report;
            this.immutableReport = report;
          }
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
          this.gk_toast(
            this.$gettext('Error'),
            this.$gettext('Failed to get the stock report'),
            'danger'
          );
        })
        .finally(() => (this.loading = false));
    },
    getProductList() {
      this.loading = true;
      axios
        .get('/product?invdc=4')
        .then((r) => {
          if (r.status == 200) {
            this.productList = r.data.gkresult.map((data) => {
              return {
                label: data.productdesc,
                id: data.productcode,
              };
            });
          }
          this.loading = false;
        })
        .then(() => this.parseParams())
        .catch((e) => {
          this.gk_toast(this.$gettext('Error'), e.message);
          this.loading = false;
        });
      this.loading = true;
    },
    getGodownList() {
      return axios
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
          console.log(e.message);
        });
    },
    // change url query params when user clicks on one of result
    // this is useful in keep track page of history
    updateRoute() {
      this.$router.replace({
        query: {
          from: this.fromDate,
          to: this.toDate,
          godown_id: this.godownId,
          product_id: this.productId,
        },
      });
    },
    // parse params and assign them to variables
    parseParams() {
      const params = this.$route.query;
      this.fromDate = this.yearStart;
      this.toDate = this.yearEnd;
      if (Object.keys(params).length > 0) {
        this.productId = this.productList.filter((product) => {
          return parseInt(params.product_id) == product.id;
        })[0];
        this.toDate = params.to;
        this.godownId = params.godown_id;
        this.productId = this.productId?.id;
        this.getGodownStock();
      }
    },
  },
  computed: {
    ...mapState(['yearStart', 'yearEnd', 'orgName', 'orgType']),
    /**
     * Return godown object for given godown id
     */
    // eslint-disable-next-line
    godownInfo(id) {
      this.godowns.filter((data) => {
        if (data.goid == id) {
          return data;
        }
      });
    },
    /**
     * Fetch product name from product ID
     */
    productName: function () {
      let product = this.productList.find(obj => {
        return obj.id == this.productId;
      });
      return product.label;
    },
  },
   created() {
    this.getProductList();
    this.getGodownList()
      .then(() => {
        this.godownId = this.$store.getters['global/getDefaultGodown'];
      })
      .then(() => this.parseParams());
  },
};
</script>
