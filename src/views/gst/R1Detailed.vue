<template>
  <section class="m-2">
    <!-- Headings -->
    <div class="text-center">
      <h4>{{ orgName }}</h4>
      <h5 class="text-muted text-center text-uppercase">
        GST R1 {{ params.type }} ({{ dateReverse(params.fd) }} to
        {{ dateReverse(params.td) }})
      </h5>
    </div>
    <div class="gkcard mx-auto">
      <b-form-input
        type="text"
        v-model="search"
        placeholder="Search"
      />
    </div>
    <!-- report  -->
    <b-table
      class="mt-3"
      head-variant="dark"
      small
      bordered
      striped
      :items="tableItems"
      :filter="search"
      :busy="loading"
      :fields="fields"
      :sort-desc="true"
      sort-by="invoice_date"
      sticky-header="400px"
      no-border-collapse
    >
      <template #table-busy>
        <div class="text-center">
          <b-spinner
            type="grow"
            class="align-middle"
          />
          <strong> Fetching data</strong>
        </div>
      </template>
      <!-- <template #cell(invoice_value)="data">
        <div class="text-right">
          {{ data.item.invoice_value }}
        </div>
      </template>
      <template #cell(rate)="data">
        <div class="text-right">
          {{ data.item.rate }}
        </div>
      </template>
      <template #cell(refund_voucher_value)="data">
        <div class="text-right">
          {{ data.item.refund_voucher_value }}
        </div>
      </template> -->
      <template #cell(invoice_number)="data">
        <router-link
          v-if="data.item.icflag && data.item.icflag === 3"
          :to="'/workflow/Transactions-CashMemo/' + data.item.invid"
        >
          {{ data.item.invoice_number }}
        </router-link>
        <router-link
          v-else
          :to="'/workflow/Transactions-Invoice/' + data.item.invid"
        >
          {{ data.item.invoice_number }}
        </router-link>
      </template>
      <template #cell(voucher_number)="data">
        <router-link
          :to="'/workflow/Transactions-DebitCreditNote/' + data.item.drcrid"
        >
          {{ data.item.voucher_number }}
        </router-link>
      </template>
      <!-- <template #cell(taxable_value)="data">
        <div class="text-right">
          {{ data.item.taxable_value }}
        </div>
      </template> -->
    </b-table>
  </section>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
export default {
  name: 'R1Detailed',
  data() {
    return {
      fields: [],
      list: [],
      search: null,
      params: null,
      loading: false,
    };
  },
  computed: {
    tableItems: (self) => self.list[self.params.type],
    ...mapState(['orgName']),
  },
  methods: {
    getGstR1Report() {
      this.loading = true;
      axios
        .get(`/gst/returns/r1?start=${this.params.fd}&end=${this.params.td}`)
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
            case 0:
              this.list = r.data.gkdata;

              // remove drilldown id columns
              if (this.list[this.params.type].length) {
                this.fields = Object.keys(this.list[this.params.type][0]);

                let rightAlignFields = {
                  rate: true,
                  taxable_value: true,
                  applicable_tax_rate: true,
                  refund_voucher_value: true,
                  invoice_value: true,
                  qty: true,
                  totalvalue: true,
                  taxableamt: true,
                  SGSTamt: true,
                  IGSTamt: true,
                  CESSamt: true,
                };

                // if (
                //   this.params.type === 'b2b' ||
                //   this.params.type === 'cdnr' ||
                //   this.params.type === 'cdnur' ||
                //   this.params.type === 'b2cs' ||
                //   this.params.type === 'b2cl'
                // ) {
                //   }
                // remove ids from display as they will be used for drop down purposes with respective document no.
                let index = this.fields.findIndex(
                  (field) => field === 'invid'
                );
                if (index >= 0) this.fields.splice(index, 1);

                index = this.fields.findIndex((field) => field === 'drcrid');
                if (index >= 0) this.fields.splice(index, 1);

                index = this.fields.findIndex((field) => field === 'icflag');
                if (index >= 0) this.fields.splice(index, 1);

                // move invoice_number to first column
                index = this.fields.findIndex(
                  (field) => field === 'invoice_number'
                );
                if (index >= 0) {
                  this.fields.splice(index, 1);
                  this.fields.unshift('invoice_number');
                }

                // update labels
                for (let i = 0, l = this.fields.length; i < l; i++) {
                  let field = this.fields[i];
                  let label = '';
                  switch (field) {
                  case 'voucher_number':
                    label = 'Note Number';
                    break;
                  case 'voucher_date':
                    label = 'Note Date';
                    break;
                  case 'prodctname':
                    label = 'Description';
                    break;
                  case 'hsnsac':
                    label = 'HSN';
                    break;
                  case 'totalvalue':
                    label = 'Total Value';
                    break;
                  case 'taxableamt':
                    label = 'Taxable Amount';
                    break;
                  case 'IGSTamt':
                    label = 'Integrated Tax';
                    break;
                  case 'CESSamt':
                    label = 'Cess';
                    break;
                  case 'uqc':
                    label = 'UQC';
                    break;
                  case 'qty':
                    label = 'Total Quantity';
                    break;
                  case 'SGSTamt':
                    label = 'State/UT tax';
                    break;
                  case 'pregst':
                    label = 'Pre GST';
                    break;
                  case 'receiver':
                    label = 'Receiver Name';
                    break;
                  case 'gstin':
                    label = 'GSTIN/UIN of Recipient';
                    break;
                  case 'ecommerce_gstin':
                    label = 'E-Commerce GSTIN';
                    break;
                  case 'applicable_tax_rate':
                    label = 'Applicable % of Tax Rate';
                    break;
                  case 'document_type':
                    label = 'Note Type';
                    break;
                  case 'refund_voucher_value':
                    label = 'Note Value';
                    break;
                  }
                  if (label) {
                    this.fields[i] = {
                      key: field,
                      label: label,
                      sortable: true,
                    };
                  } else {
                    this.fields[i] = {
                      key: field,
                      sortable: true,
                    };
                  }

                  if (field === 'invoice_number') {
                    this.fields[i].stickyColumn = true;
                  }

                  // adds right align class for numerical fields
                  if (rightAlignFields[field]) {
                    this.fields[i].tdClass = ['text-right'];
                  }
                }

                if (this.params.type === 'hsn1') {
                  this.list['hsn1'].forEach((item) => {
                    // console.log(item.hsnsac)
                    if (item.hsnsac && typeof item.hsnsac === 'object') {
                      let hsn = JSON.parse(item.hsnsac || '{}');
                      if (typeof hsn === 'object') {
                        hsn = hsn.hsn_code || '';
                      }
                      item.hsnsac = hsn;
                    }
                  });
                }
              }
              break;
            case 1:
              this.$bvToast.toast('Duplicate Entry', {
                variant: 'warning',
                solid: true,
              });
              break;
            case 2:
              this.$bvToast.toast('Unauthorised Access', {
                variant: 'danger',
                solid: true,
              });
              break;
            case 3:
              this.$bvToast.toast('Data error', {
                variant: 'danger',
                solid: true,
              });
              break;
            case 4:
              this.$bvToast.toast('No Privilege', {
                variant: 'danger',
                solid: true,
              });
              break;
            case 5:
              this.$bvToast.toast('Integrity error', {
                variant: 'danger',
                solid: true,
              });
              break;
            }
          } else {
            console.log(r);
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
  created() {
    this.params = this.$route.params;
    this.getGstR1Report();
  },
};
</script>
