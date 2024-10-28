<template>
  <b-container fluid>
    <b-overlay
      :show="isPreloading"
      variant="secondary"
      no-wrap
      blur
    />
    <div class="clearfix d-print-none mb-3">
      <div class="float-right">
        <span>
          <b-button
            class="mr-1"
            size="sm"
            variant="primary"
            v-b-toggle.voucher-container
          >
            <b-icon
              class="mr-1"
              icon="eye"
            />
            <router-link
              class="custom-link"
              :to="{
                name: 'Workflow',
                params: {
                  wfName:
                    inv.icflag === 3
                      ? 'Transactions-CashMemo' : 
                        'Transactions-Invoice',
                  wfId: inv.id
                }
              }"
            >{{ inv.icflag === 3 ? 'View Cash Memo' : 'View Invoice' }}
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
      >
        <b
          key="dcp-1"
          v-if="flags.sale"
          v-translate
        > Buyer Details </b>
        <b
          key="dcp-2"
          v-else
          v-translate
        > Seller Details </b>
        <br>
        <p class="text-small">
          <span>
            <router-link :to="`/ledger/${custid}`">{{ party.name }}</router-link>
          </span>
          <span>{{ party.addr }} </span> <br>
          <span> <b v-translate> Postal Code: </b> {{ party.pincode }} </span>
          <br>
          <span v-if="party.gstin"><b> GSTIN: </b> {{ party.gstin }} </span>
          <span v-if="party.tin"><b> TIN: </b> {{ party.tin }} </span>
        </p>
      </b-col>
      <b-col
        cols="12"
        md="6"
        class="my-2 text-md-right"
      >
        <b
          v-if="this.flags.credit"
          v-translate
        >Credit Note Details</b>
        <b
          v-else
          v-translate
        >Debit Note Details</b>
        <br>
        <!-- Note Details Table -->
        <b-table-lite
          :fields="['title', 'value']"
          :items="dcNoteData"
          small
          bordered
          thead-class="d-none"
          fixed
          class="table-border-dark text-small"
        />
      </b-col>
    </b-row>
    <!-- Content Table -->
    <b-table-lite
      :items="dcNote.dcItems"
      :fields="tableFields"
      bordered
      head-variant="dark"
      stacked="sm"
      small
      class="table-border-dark text-small"
      striped
      tbody-tr-class="gk-vertical-row"
    >
      <template #cell(name)="data">
        <template v-if="data.item.gsflag === 7">
          <router-link
            :to="`/product-register?product_id=${data.item.id}&current_date=${toDate}&goid=${data.item.goid}`"
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
            {key: 'title', label: 'Total', tdClass: ''},
            {key: 'value', label: '₹', class: 'text-right'}
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
        <p class="text-small">
          <b v-translate> Narration: </b> <span> {{ dcNote.narration }} </span>
          <br>
        </p>
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
          <div class="m-1 mb-2 text-center">
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
          :translate-params="{memoNo: dcNote.no}"
        >
          No vouchers were found for DebitCreditNote: %{memoNo}
        </translate>
      </div>
    </b-collapse>
  </b-container>
</template>

<script>
import axios from 'axios';
import { mapGetters } from 'vuex';
import { numberToRupees } from '../../../js/utils.js';
import { DR_CR_MODE } from '@/js/enum.js';
export default {
  name: 'DcNoteProfile',
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
  data() {
    return {
      isPreloading: false,
      showVouchers: false,
      vouchers: [],
      dcNote: {
        dcItems: [],
        date: '',
      },
      inv: {
        no: '',
        date: '',
      },
      party: {
        name: '',
        addr: '',
        pincode: '',
        gstin: '',
        tin: '',
      },
      total: {},
      flags: {
        gst: false,
        igst: false, // igst or cgst+sgst
        vat: false,
        credit: true, // debit or credit
        qty: false, // qty or price
        badQuality: false,
        sale: true, // sale or purchase
      },
      custid: null,
      toDate: '',
    };
  },
  computed: {
    ...mapGetters('global', ['isIndia', 'isGstEnabled', 'isVatEnabled']),
    dcNoteData: (self) => {
      let modeNameMap = {};
      modeNameMap[DR_CR_MODE['discount']] = self.$gettext(
        'Adjust Price / Discount'
      );
      modeNameMap[DR_CR_MODE['returns']] = self.$gettext(
        'Adjust Qty / Return Goods'
      );
      modeNameMap[DR_CR_MODE['service_deficiency']] = self.$gettext(
        'Deficiency in services'
      );
      modeNameMap[DR_CR_MODE['inv_correction']] = self.$gettext(
        'Correction in Invoice'
      );
      modeNameMap[DR_CR_MODE['pos_change']] = self.$gettext('Change in POS');
      modeNameMap[DR_CR_MODE['prov_assessment']] = self.$gettext(
        'Finalization of Provisional assessment'
      );
      modeNameMap[DR_CR_MODE['others']] = self.$gettext('Others');
      let purpose = modeNameMap[self.dcNote.drcrmode];

      return [
        { title: self.$gettext('No.'), value: self.dcNote.no },
        { title: self.$gettext('Date'), value: self.dcNote.date },
        { title: self.$gettext('Inv No.'), value: self.inv.no },
        { title: self.$gettext('Inv Date'), value: self.inv.date },
        { title: self.$gettext('Purpose'), value: purpose },
      ];
    },
    totalDetails: (self) => {
      let total = [
        { title: self.$gettext('Taxable'), value: self.total.taxable },
      ];
      if (self.isIndia) {
        if (self.flags.gst) {
          if (self.flags.igst) {
            total.push({ title: 'IGST', value: self.total.tax });
          } else {
            total.push(
              { title: 'CGST', value: self.total.tax },
              { title: 'SGST', value: self.total.tax }
            );
          }
          total.push({ title: 'CESS', value: self.total.cess });
        }
        if (self.flags.vat) {
          total.push({ title: 'VAT', value: self.total.tax });
        }
      }
      total.push(
        {
          title: self.flags.credit
            ? self.$gettext('Credit Note Value')
            : self.$gettext('Debit Note Value'),
          value: self.total.roundoffflag ? Math.round(self.total.reduct).toFixed(2) : self.total.reduct,
        },
        { title: self.$gettext('Total In Words'),
          value: self.total.roundoffflag ? numberToRupees(Math.round(self.total.reduct)) : numberToRupees(self.total.reduct), }
      );
      return total;
    },
    tableFields: (self) => {
      let fields = [{ key: 'name', label: self.$gettext('Item') }];
      if (self.flags.qty) {
        fields.push({
          key: 'qty',
          label: self.flags.credit
            ? self.$gettext('Qty Credited')
            : self.$gettext('Qty Debited'),
        });
        fields.push({
          key: 'rate',
          label: 'Item Rate',
          tdClass: 'gk-currency-sm',
        });
      } else {
        fields.push({
          key: 'qty',
          label: self.flags.qty,
        });
        fields.push({
          key: 'dcValue',
          label: self.flags.credit
            ? self.$gettext('Credited Value (₹)')
            : self.$gettext('Debited Value (₹)'),
          tdClass: 'gk-currency-sm',
        });
      }
      if (self.isIndia) {
        if (self.flags.gst) {
          if (self.flags.igst) {
            fields.push({
              key: 'igst',
              label: 'IGST (%)',
              tdClass: 'gk-currency-sm',
            });
          } else {
            fields.push({
              key: 'cgst',
              label: 'CGST (%)',
              tdClass: 'gk-currency-sm',
            });
            fields.push({
              key: 'sgst',
              label: 'SGST (%)',
              tdClass: 'gk-currency-sm',
            });
          }
          fields.push({
            key: 'cess',
            label: 'CESS (%)',
            tdClass: 'gk-currency-sm',
          });
        }
        if (self.flags.vat) {
          fields.push({
            key: 'vat',
            label: 'VAT (%)',
            tdClass: 'gk-currency-sm',
          });
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
  watch: {
    id: function(id) {
      if (id && parseInt(id) > -1) {
        this.isPreloading = true;
        this.showVouchers = false;
        this.vouchers = [];
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
    formatDetails(details) {
      if (details) {
        // this.output = JSON.stringify(details, null, 4);
        this.dcNote = {
          date: details.drcrdate,
          dcItems: [],
          narration: details.drcrnarration,
          no: details.drcrno,
          drcrmode: details.drcrmode,
          roundoffflag: details.roundoffflag,
        };
        this.flags = {
          gst: this.isGstEnabled && ['GST', 'IGST', 'CGST', 'SGST'].includes(details.taxname),
          igst: this.isGstEnabled && details.taxname === 'IGST',
          vat: this.isVatEnabled && details.taxname === 'VAT',
          credit: details.dctypeflag === 3,
          qty: details.drcrmode === 18,
          badQuality: details.badquality === 1,
          sale: details.invdata.inoutflag === 15,
        };

        this.party = {
          name: details.custSupDetails.custname,
          addr: details.custSupDetails.custaddr,
          pincode: details.custSupDetails.pincode,
          gstin: Object.values(details.custSupDetails?.gstin || {}).join(", "),
          tin: details.custSupDetails.tin,
        };
        this.inv = {
          no: details.invdata.invoiceno,
          date: details.invdata.invoicedate,
          id: details.invdata.invid,
          icflag: details.invdata.icflag,
        };
        this.total = {
          taxable: details.totaltaxablevalue,
          tax: details.totaltaxamt,
          cess: details.totalcessamt,
          reduct: details.totreduct,
          text: numberToRupees(details.totreduct),
        };
        if (details.drcrcontents) {
          // let taxState = details.invdata.taxstate;
          for (const id in details.drcrcontents) {
            let item = details.drcrcontents[id];
            this.dcNote.dcItems.push({
              id: id,
              name: item.proddesc,
              rate: item.reductionval,
              qty: item.qty,
              dcValue: item.reductionval,
              igst: item.taxrate,
              cgst: item.taxrate / 2,
              sgst: item.taxrate / 2,
              cess: item.cessrate,
              vat: item.taxrate,
              total: item.totalAmount,
              uom: item.uom,
              gsflag: item.gsflag,
              goid: item.goid,
            });
          }
        }
        axios.get(`/accounts?type=getAccCode&accountname=${this.party.name}`)
          .then(response => {
            this.custid = response.data.accountcode;
          })
          .catch(error => {
            this.error = 'Failed to load data: ' + error.message;
          });
      }
    },
    getVouchers() {
      return axios
        .get(`/transaction?searchby=drcr&drcrid=${this.id}`)
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
          console.log(e);
        });
    },
    getDetails() {
      return axios
        .get(`/drcrnote?drcr=single&drcrid=${this.id}`)
        .catch((error) => {
          this.$bvToast.toast(`Error: ${error.message}`, {
            title: this.$gettext(`Fetch Debit Credit Note Error!`),
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
        case 0:
          // this.invoice = response.data.gkresult;
          this.formatDetails(response.data.gkresult);
          break;
        case 2:
          this.$bvToast.toast(
            this.$gettext(`Unauthorized access, Please contact admin`),
            {
              title: this.$gettext(`Fetch Debit Credit Note Error!`),
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
              `Unable to Fetch Debit Credit Note Details! Please Try after sometime.`
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
