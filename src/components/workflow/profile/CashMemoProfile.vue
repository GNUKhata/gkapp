<template>
  <b-container fluid>
    <b-overlay
      :show="isPreloading"
      variant="secondary"
      no-wrap
      blur
    />
    <div class="mb-3 clearfix d-print-none">
      <div class="float-right">
        <span>
          <b-button
            class="mr-1"
            size="sm"
            variant="primary"
            v-b-toggle.voucher-container
            v-if="!pdata.cancelledFlag"
          >
            <b-icon
              class="mr-1"
              icon="eye"
            />
            <router-link
              v-if="dcid"
              class="custom-link"
              :to="{
                name: 'Workflow',
                params: {
                  wfName: 'Transactions-DeliveryNote',
                  wfId: dcid,
                },
              }"
            >View Delivery Note
            </router-link>
          </b-button>
          <b-button
            class=""
            size="sm"
            variant="primary"
            v-b-toggle.voucher-container
          >
            <b-icon
              icon="eye"
              class="mr-1"
            />
            <translate>View Voucher</translate>
          </b-button>
        </span>
      </div>
    </div>
    <b-row>
      <b-col
        cols="12"
        md="6"
        class="my-2"
      />
      <b-col
        cols="12"
        md="6"
        class="text-md-right my-2"
      >
        <b v-translate>Cash Memo Details</b>
        <br>
        <!-- Note Details Table -->
        <b-table-lite
          :fields="['title', 'value']"
          :items="memoData"
          small
          bordered
          thead-class="d-none"
          fixed
          class="text-small table-border-dark"
        />
      </b-col>
    </b-row>
    <!-- Content Table -->
    <b-table-lite
      :items="invoice.invItems"
      :fields="tableFields"
      bordered
      head-variant="dark"
      stacked="sm"
      small
      striped
      tbody-tr-class="gk-vertical-row"
      class="text-small table-border-dark"
    >
      <template #cell(name)="data">
        <template v-if="data.item.gsflag === 7">
          <router-link
            :to="`/product-register?product_id=${data.item.id}&current_date=${toDate}&goid=${dnote.goid}`"
          >
            {{ data.item.name }}
          </router-link>
        </template>
        <template v-else>
          <span>{{ data.item.name }}</span>
        </template>
      </template>
      <template #cell(qty)="data">
        {{ data.value }} <small> {{ data.item.uom }} </small>
      </template>
      <template #cell(price)="data">
        {{ data.value }}
      </template>
      <template #cell(discount)="data">
        {{ data.value }}
      </template>
      <template #cell(total)="data">
        {{ data.value }}
      </template>
    </b-table-lite>
    <b-row>
      <b-col class="my-2" />
      <b-col
        cols="12"
        md="8"
        class="my-2"
      >
        <!-- Total Table -->
        <b-table-lite
          :items="totalDetails"
          :fields="[
            {key: 'title', label: '', tdClass: ''},
            {key: 'value', label: '₹', class: 'text-right'},
          ]"
          small
          fixed
          class="text-small"
        />
      </b-col>
    </b-row>
    <b-row>
      <b-col class="my-2" />
      <b-col
        cols="12"
        md="8"
        class="my-2"
      >
        <div>
          <b v-translate>Payment Details</b>
          <div
            v-if="invoice.payment.mode > 2"
            class="mb-3"
          >
            <span
              v-if="invoice.payment.mode === 3"
              v-translate
            >
              Paid By Cash
            </span>
            <span
              v-else
              v-translate
            > On Credit </span>
          </div>
          <div
            class="text-small"
            v-else
          >
            <translate> Paid By Bank Transfer </translate>
            <b-table-lite
              :items="bankDetails"
              :fields="['title', 'value']"
              small
              bordered
              fixed
              thead-class="d-none"
            />
          </div>
        </div>
        <b v-translate> Narration: </b> {{ invoice.narration }}
      </b-col>
    </b-row>
    <div class="clearfix" />
    <b-collapse
      v-model="showVouchers"
      id="voucher-container"
    >
      <b v-translate>Voucher:</b>
      <b-card
        v-if="vouchers.length"
        body-class="p-1"
      >
        <div
          v-for="voucher in vouchers"
          :key="voucher.id"
        >
          <div class="text-center m-1 mb-2">
            <span class="float-left">
              Voucher No:
              <router-link :to="`/Workflow/Transactions-Voucher/${voucher.id}`">
                {{ voucher.no }}</router-link>
            </span>
            <span> {{ voucher.type }} </span>
            <span class="float-right">
              <translate
                translate-comment="%{voucherDate} is a variable, translation is not required for it. Enter it, as it is while translation."
                :translate-params="{voucherDate: voucher.date}"
              >
                Date: %{voucherDate}
              </translate>
            </span>
          </div>
          <b-table-lite
            bordered
            small
            head-variant="dark"
            :items="voucher.transactions"
            :tbody-tr-class="rowClass"
            fixed
          />
          <div>
            <translate
              translate-comment="%{narration} is a variable, translation is not required for it. Enter it, as it is while translation."
              :translate-params="{narration: voucher.narration}"
            >
              Narration: %{narration}
            </translate>
          </div>
          <br>
        </div>
      </b-card>
      <div v-else>
        <translate
          translate-comment="%{memoNo} is a variable, translation is not required for it. Enter it, as it is while translation."
          :translate-params="{memoNo: invoice.number}"
        >
          No vouchers were found for Cash Memo: %{memoNo}
        </translate>
      </div>
    </b-collapse>
  </b-container>
</template>

<script>
import axios from 'axios';
import { mapGetters } from 'vuex';
import { numberToRupees } from '../../../js/utils.js';
export default {
  name: 'CashMemoProfile',
  props: {
    id: {
      type: Number,
      required: true,
    },
    pdata: {
      type: Object,
      required: true,
    },
    onUpdate: {
      type: Function,
      required: false,
      note: `Run after every update of Invoice, as a callback.
      Used to update the data used in workflow.`,
    },
  },
  computed: {
    ...mapGetters('global', ['isIndia', 'isGstEnabled', 'isVatEnabled']),
    memoData: (self) => {
      const fields =  [
        { title: self.$gettext('No.'), value: self.invoice.number },
        { title: self.$gettext('Date'), value: self.invoice.date },
      ];
      if (self.invoice.isGst) {
        fields.push(
          { title: self.$gettext('GSTIN'), value: self.invoice.gstin },
        );
      }
      if (self.invoice.isVat) {
        fields.push(
          { title: self.$gettext('TIN'), value: self.invoice.tin },
        );
      }
      return fields;
    },
    totalDetails: (self) => {
      const totalAmount = self.invoice.invItems.reduce((_totalAmount, item) => (
        _totalAmount + (Number(item.price) * Number(item.qty))
      ), 0);
      let totalDiscount = (totalAmount - self.invoice.total.taxable).toFixed(2);
      if (totalDiscount > 0) {
        totalDiscount = `-${totalDiscount}`;
      }
      let details = [
        {
          title: self.$gettext('Total'),
          value: totalAmount.toFixed(2),
        },
        {
          title: self.$gettext('Discount'),
          value: totalDiscount,
        },
      ];
      let total = self.invoice.total;
      if (self.isIndia) {
        if (self.invoice.isGst || self.invoice.isVat) {
          details.push({
            title: self.$gettext('Taxable'),
            value: total.taxable,
          });
        }
        if (self.invoice.isGst) {
          if (total.isIgst) {
            details.push({ title: 'IGST', value: total.tax });
          } else {
            details.push(
              { title: 'CGST', value: total.tax },
              { title: 'SGST', value: total.tax }
            );
          }
        }
        if (self.invoice.isVat) {
          details.push({ title: 'VAT', value: total.tax });
        }
      }
      details.push(
        {
          title: self.$gettext(`Cash Memo Value`),
          value: total?.roundoffflag ? Math.round(total.amount).toFixed(2) : total.amount,
        },
        { title: self.$gettext('Total In Words'), value: total?.roundoffflag ? numberToRupees(Math.round(total.amount)) : numberToRupees(total.amount)}
      );
      return details;
    },
    bankDetails: (self) => {
      let details = self.invoice.payment.bankDetails;
      return [
        { title: self.$gettext('Account Number'), value: details.accountno || '' },
        { title: self.$gettext('Bank'), value: details.bankname || '' },
        { title: self.$gettext('Branch'), value: details.branch || '' },
        { title: self.$gettext('IFSC'), value: details.ifsc || '' },
      ];
    },
    tableFields: (self) => {
      let fields = [
        {
          key: 'name',
          label: self.$gettext('Item'),
        },
        { key: 'qty', label: self.$gettext('Qty') },
        {
          key: 'price',
          label: self.$gettext('Rate (₹)'),
          tdClass: 'gk-currency-sm',
        },
        {
          key: 'discount',
          label: self.$gettext('Discount (₹)'),
          tdClass: 'gk-currency-sm',
        },
      ];
      if (self.isIndia) {
        if (self.invoice.isGst) {
          if (self.invoice.total.isIgst) {
            fields.push({ key: 'igst', label: 'IGST (%)', tdClass: 'gk-currency-sm', });
          } else {
            fields.push({ key: 'cgst', label: 'CGST (%)', tdClass: 'gk-currency-sm', });
            fields.push({ key: 'sgst', label: 'SGST (%)', tdClass: 'gk-currency-sm', });
          }
        }
        if (self.invoice.isVat) {
          fields.push({ key: 'vat', label: 'VAT (%)', tdClass: 'gk-currency-sm', });
        }
      }

      fields.push({
        key: 'total',
        label: self.$gettext('Total (₹)'),
        tdClass: 'gk-currency-sm',
      });

      return fields;
    },
  },
  data() {
    return {
      isPreloading: false,
      vouchers: [],
      showVouchers: false,
      invoice: {
        payment: {
          mode: 2,
          bankDetails: {},
        },
        date: '',
        party: {
          csflag: '3', // 3 -> customer, 19 -> supplier
          name: ' ',
          state: '',
          addr: '',
          pincodce: '',
        },
        isSale: true,
        isGst: false,
        isVat: false,
        invItems: [],
        total: {
          amount: 0,
          text: 'Zero Rupee',
          cess: 0,
          tax: 0,
          taxable: 0,
          isIgst: false,
          roundoffflag: 0,
        },
        number: '',
      },
      toDate: '',
      dnote: {
        goid: '',
      },
      dcid: null,
    };
  },
  methods: {
    rowClass(item, type) {
      if (!item || type !== 'row') return;
      let rowClass = 'table-secondary';
      if (item.cr === '') {
        rowClass = 'table-success';
      } else if (item.dr === '') {
        rowClass = 'table-warning';
      }
      return rowClass;
    },
    getVouchers() {
      return axios
        .get(`/transaction?searchby=invoice&invid=${this.id}`)
        .then((resp) => {
          // TODO: Add Project support
          if (resp.data.gkstatus === 0) {
            this.vouchers = resp.data.gkresult.map((voucher) => {
              let data = {
                id: voucher.vouchercode,
                no: voucher.vouchernumber,
                date: voucher.voucherdate,
                type: voucher.vouchertype,
                transactions: [],
                narration: voucher.narration,
                fields: [],
              };
              let total = {
                dr: 0,
                cr: 0,
              };
              for (const drAcc in voucher.drs) {
                data.transactions.push({
                  account: drAcc,
                  dr: voucher.drs[drAcc],
                  cr: '',
                });
                total.dr += parseFloat(voucher.drs[drAcc]);
              }
              for (const crAcc in voucher.crs) {
                data.transactions.push({
                  account: crAcc,
                  cr: voucher.crs[crAcc],
                  dr: '',
                });
                total.cr += parseFloat(voucher.crs[crAcc]);
              }

              data.transactions.push({
                account: 'Total',
                dr: total.dr.toFixed(2),
                cr: total.cr.toFixed(2),
              });

              return data;
            });
          }
        })
        .catch((e) => {
          console.error(e);
        });
    },
    /**
     * formatInvoiceDetails()
     *
     * Description: Format the invoice details from gkcore to an
     * internal format for ease of use
     */
    formatInvoiceDetails(details) {
      if (details) {
        let party = details.custSupDetails || {};
        this.invoice = {
          date: details.invoicedate,
          party: {
            name: party.custname,
            state: party.custsupstate,
            addr: party.custaddr,
            pincodce: party.pincode,
            csflag: party.csflag,
          },
          isSale: details.inoutflag === 15,
          invItems: [],
          total: {
            amount: details.invoicetotal,
            text: details.invoicetotalword,
            taxable: details.totaltaxablevalue,
            cess: details.totalcessamt,
            tax: details.totaltaxamt,
            isIgst: details.taxname === 'IGST',
            roundoffflag: details.roundoff,
          },
          number: details.invoiceno,
          isGst: this.isGstEnabled && ['GST', 'IGST', 'CGST', 'SGST'].includes(details.taxname),
          isVat: this.isVatEnabled && details.taxname === 'VAT',
          gstin: details.orgstategstin,
          payment: {
            mode: details.paymentmode,
            bankDetails: details.bankdetails,
          },
          narration: details.narration,
        };
        if (details.invcontents) {
          let product = {};
          this.invoice.invItems = Object.keys(details.invcontents).map(
            (key) => {
              product = {
                id: key,
                name: details.invcontents[key].proddesc,
                uom: details.invcontents[key].uom,
                qty: details.invcontents[key].qty,
                freeQty: details.invcontents[key].freeQty,
                price: details.invcontents[key].priceperunit,
                discount: details.invcontents[key].discount,
                taxable: details.invcontents[key].taxableamount,
                total: details.invcontents[key].totalAmount,
                igst: details.invcontents[key].taxrate,
                cgst: details.invcontents[key].taxrate,
                sgst: details.invcontents[key].taxrate,
                vat: details.invcontents[key].taxrate,
                cess: {
                  rate: details.invcontents[key].cess,
                  amount: details.invcontents[key].cessrate,
                },
                gsflag: details.invcontents[key].gsflag,
              };
              return product;
            }
          );
        }
      }
    },
    getDetails() {
      return axios
        .get(`/invoice/${this.id}`)
        .catch((error) => {
          this.$bvToast.toast(`Error: ${error.message}`, {
            title: this.$gettext(`Fetch Cash Memo Error!`),
            autoHideDelay: 3000,
            variant: 'warning',
            appendToast: true,
            solid: true,
          });
        });
    },
    getDelNoteDetails(id) {
      return axios.get(`/delchal/${id}`).catch((error) => {
        this.$bvToast.toast(`Error: ${error.message}`, {
          title: this.$gettext(`Fetch Delivery Note Error!`),
          autoHideDelay: 3000,
          variant: 'warning',
          appendToast: true,
          solid: true,
        });
      });
    },
    fetchAndUpdateData() {
      return this.getDetails().then((response) => {
        switch (response.data.gkstatus) {
        case 0: {
          let invData = response.data.gkresult;
          this.formatInvoiceDetails(invData);
          this.dcid = invData.dcid;
          if (invData.dcid) {
            this.getDelNoteDetails(invData.dcid).then((dnResponse) => {
              let dndata = dnResponse.data.gkresult.delchaldata;
              if (dndata) {
                this.dnote = {
                  goid: dndata.goid,
                };
              }
            });
          } else {
            this.dnote = {
              goid: '',
            };
          }
          break;
        }
        case 2:
          this.$bvToast.toast(
            this.$gettext(`Unauthorized access, Please contact admin`),
            {
              title: this.$gettext(`Fetch Cash Memo Error!`),
              autoHideDelay: 3000,
              variant: 'warning',
              appendToast: true,
              solid: true,
            }
          );
          break;
        default:
          this.$bvToast.toast(
            this.$gettext(
              `Unable to Fetch Cash Memo Details! Please Try after sometime.`
            ),
            {
              title: this.$gettext(`Fetch Transaction Details Error!`),
              autoHideDelay: 3000,
              variant: 'warning',
              appendToast: true,
              solid: true,
            }
          );
        } // end switch
      });
    },
  },
  watch: {
    id: function(id) {
      if (id && parseInt(id) > -1) {
        this.showVouchers = false;
        this.vouchers = [];
        this.isPreloading = true;
        Promise.all([this.fetchAndUpdateData(), this.getVouchers()])
          .then(() => {
            this.isPreloading = false;
          })
          .catch(() => {
            this.isPreloading = false;
          });
      }
    },
  },
  mounted() {
    this.toDate = this.currentDate();
    if (this.id && parseInt(this.id) > -1) {
      this.isPreloading = true;
      Promise.all([this.fetchAndUpdateData(), this.getVouchers()])
        .then(() => {
          this.isPreloading = false;
        })
        .catch(() => {
          this.isPreloading = false;
        });
    }
  },
};
</script>

<style scoped>
.custom-link {
  color: white;
  text-decoration: none;
}
</style>
