<template>
  <b-container fluid>
    <b-overlay
      :show="isPreloading"
      variant="secondary"
      no-wrap
      blur
    />
    <div v-if="pdata.cancelledFlag">
      <span
        class="float-right h5 p-2 bg-danger text-white"
        v-translate
      >
        Cancelled
      </span>
      <div class="clearfix" />
      <br>
    </div>
    <!-- action buttons -->
    <div class="mb-3 clearfix d-print-none">
      <div class="float-right">
        <span v-if="!pdata.cancelledFlag">
          <b-button
            class="mr-1"
            size="sm"
            variant="primary"
            v-b-toggle.voucher-container
            v-if="delnote.narration?.includes('Cash Memo')"
          >
            <b-icon
              class="mr-1"
              icon="eye"
            />
            <router-link
              class="custom-link"
              :to="
                `/workflow/Transactions-CashMemo/${invid}`
              "
            >View Cash Memo
            </router-link>
          </b-button>
          <b-button
            class="mr-1"
            size="sm"
            variant="primary"
            v-b-toggle.voucher-container
            v-else
          >
            <b-icon
              class="mr-1"
              icon="eye"
            />
            <router-link
              class="custom-link"
              :to="
                `/workflow/Transactions-Invoice/${invid}`
              "
            >View Invoice
            </router-link>
          </b-button>

        </span>
      </div>
    </div>
    <b-row>
      <b-col
        order="2"
        order-md="1"
      >
        <b-container
          fluid
          class="pl-0"
        >
          <b-col class="px-0">
            <b v-translate> Dispatch From </b>
            <p class="text-small">
              <span> {{ delnote.from.name }}</span> <br>
              <span> {{ delnote.from.addr }} </span> <br>
              <span> {{ delnote.from.state }} </span> <br>
              <span v-if="delnote.from.pin">
                <b v-translate> Postal Code: </b> {{ delnote.from.pin }}
              </span>
              <br>
            </p>
          </b-col>
          <b-col class="px-0">
            <b v-translate> Deliver To </b>
            <p class="text-small">
              <span> {{ delnote.to.name }} </span> <br>
              <span> {{ delnote.to.addr }} </span> <br>
              <span> {{ delnote.to.state }} </span> <br>
              <span v-if="delnote.to.pin || delnote.to.gstin">
                <span>
                  <b v-translate> Postal Code: </b> {{ delnote.to.pin }}
                </span>
                <br>
                <span v-if="isGst">
                  <b>GSTIN: </b>{{ delnote.to.gstin }}
                </span>
                <span v-if="isVat">
                  <b>TIN: </b>{{ delnote.to.tin }}
                </span>
                <br>
              </span>
            </p>
          </b-col>
        </b-container>
      </b-col>
      <b-col
        class="text-md-right"
        cols="12"
        md="6"
        order="1"
        order-md="2"
      >
        <b v-translate> Delivery Note Details </b>
        <!-- Note Details Table -->
        <b-table-lite
          :fields="['title', 'value']"
          :items="dnoteData"
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
      :items="delnote.contents"
      :fields="tableFields"
      bordered
      head-variant="dark"
      stacked="sm"
      :responsive="true"
      small
      striped
      class="text-small table-border-dark"
      tbody-tr-class="gk-vertical-row"
    >
      <template #cell(name)="data">
        <template v-if="data.item.gsflag === 7">
          <router-link
            :to="`/product-register?product_id=${data.item.productcode}&current_date=${toDate}&goid=${data.item.goid}`"
          >
            {{ data.item.name }}
          </router-link>
        </template>
        <template v-else>
          <span>{{ data.item.name }}</span>
        </template>
      </template>
    </b-table-lite>
    <b-row>
      <b-col
        class="my-2"
        order="2"
        order-md="1"
      />
      <b-col
        cols="12"
        md="8"
        class="my-2"
        order="1"
        order-md="2"
      >
        <!-- Total Table -->
        <b-table-lite
          :items="totalDetails"
          :fields="[
            {key: 'title', label: '', tdClass: ''},
            {key: 'value', label: '₹', class: 'text-right'},
          ]"
          fixed
          small
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
          <b v-translate> Narration: </b>
          <span> {{ delnote.narration }} </span> <br>
        </p>
      </b-col>
    </b-row>
    <div class="float-right d-print-none">
      <b-button
        v-if="deleteFlag"
        @click.prevent="onDelete"
        size="sm"
        variant="danger"
        class=""
      >
        <translate> Cancel </translate>
      </b-button>
    </div>
    <br>
  </b-container>
</template>

<script>
import axios from 'axios';
import { mapGetters } from 'vuex';
import { numberToRupees } from '../../../js/utils.js';
export default {
  name: 'DeliveryNoteProfile',
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
      invid: null,
      isPreloading: false,
      deleteFlag: false,
      no: '',
      isSale: false,
      isGst: false,
      isVat: false,
      delnote: {
        contents: [],
        date: '',
        narration: '',
        transport: {},
        supplyDate: '',
        from: {},
        to: {},
        issuer: '',
        designation: '',
      },
      party: {},
      total: {
        isIgst: false,
      },
      custid: null,
      toDate: '',
    };
  },
  computed: {
    ...mapGetters('global', ['isIndia', 'isGstEnabled', 'isVatEnabled']),
    dnoteData: (self) => {
      let noteData = self.delnote;
      let transport = noteData.transport;
      let designation = self.delnote.designation
        ? `(${self.delnote.designation})`
        : '';
      let data = [
        { title: self.$gettext('No.'), value: noteData.no },
        { title: self.$gettext('Date'), value: noteData.date },
        { title: self.$gettext('Supply Date.'), value: noteData.supplyDate },
        { title: self.$gettext('Package Count'), value: transport.packageQty },
        { title: self.$gettext('Mode of Transport'), value: transport.mode },
        { title: self.$gettext('Vehicle No.'), value: transport.vehicleNo },
        {
          title: self.$gettext('Issued By'),
          value: `${self.delnote.issuer}  ${designation}`,
        },
      ];
      if (!transport.mode) {
        data.splice(5, 1);
      }
      return data;
    },
    totalDetails: (self) => {
      const totalTaxableAmount = Number(self.total.taxable).toFixed(2);
      let totalDiscount = Number(self.total.discount).toFixed(2);
      const totalAmount = (Number(totalTaxableAmount) + Number(totalDiscount)).toFixed(2);
      if (totalDiscount > 0) {
        totalDiscount = `-${totalDiscount}`;
      }
      let total = [
        {
          title: self.$gettext('Total'),
          value: totalAmount,
        },
        {
          title: self.$gettext('Discount'),
          value: totalDiscount,
        },
        { title: self.$gettext('Taxable'), value: self.total.taxable },
      ];
      if (self.isIndia) {
        if (self.delnote.isGst) {
          if (self.total.isIgst) {
            total.push({ title: 'IGST', value: self.total.tax });
          } else {
            total.push(
              { title: 'CGST', value: self.total.tax },
              { title: 'SGST', value: self.total.tax }
            );
          }
          total.push({ title: 'CESS', value: self.total.cess });
        }
        if (self.delnote.isVat) {
          total.push({ title: 'VAT', value: self.total.tax });
        }
      }
      total.push(
        {
          title: self.$gettext('Total Invoice Value'),
          value: Math.round(self.total.amount).toFixed(2),
        },
        { title: self.$gettext('Total In Words'), value: numberToRupees(Math.round(self.total.amount)) }
      );
      return total;
    },
    tableFields: (self) => {
      let fields = [
        {
          key: 'name',
          label: self.$gettext('Item'),
        },
        'qty',
        {
          key: 'rate',
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
        if (self.delnote.isGst) {
          if (self.total.isIgst) {
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
        if (self.delnote.isVat) {
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
  methods: {
    onDelete() {
      const self = this;
      const text = this.$createElement('div', {
        domProps: {
          innerHTML: `Delete Delivery Note <b>${this.no}</b>?"`,
        },
      });
      this.$bvModal
        .msgBoxConfirm(text, {
          size: 'md',
          buttonSize: 'sm',
          okVariant: 'success',
          headerClass: 'p-0 border-bottom-0',
          footerClass: 'border-top-0', // p-1
          centered: true,
        })
        .then((val) => {
          if (val) {
            axios.delete(`/delchal/${this.id}`).then((resp) => {
              if (resp.data.gkstatus === 0) {
                let type = self.isSale ? 'sale' : 'purchase';
                let log = {
                  activity: `delivery note for ${type} deleted: ${self.no}`,
                };
                axios.post('/log', log);

                self.displayToast(
                  this.$gettext(`Delivery Note Delete success!`),
                  this.$gettextInterpolate(
                    this.$gettext(
                      `Delivery Note : %{delNoteNo}, deleted successfully.`
                    ),
                    {
                      delNoteNo: self.no,
                    }
                  ),
                  'success'
                );
                this.onUpdate({ type: 'delete' });
              } else {
                self.displayToast(
                  this.$gettext(`Delivery Note Delete failed!`),
                  this.$gettextInterpolate(
                    this.$gettext(
                      `Unable to delete Delivery Note : %{delNoteNo}`
                    ),
                    {
                      delNoteNo: self.no,
                    }
                  ),
                  'danger'
                );
              }
            });
          }
        });
    },
    formatDetails(details) {
      let noteData = details.delchaldata;
      this.no = noteData.dcno;
      this.deleteFlag = !this.pdata.invLinkedFlag && !this.pdata.cancelledFlag; // allow cancelling if invLinkedFlag = false
      this.isSale = noteData.inoutflag === 15;
      this.total = {
        amount: noteData.delchaltotal,
        isIgst: details.taxname === 'IGST',
        cess: details.totalcessamt,
        tax: details.totaltaxamt,
        discount: details.totaldiscount,
        taxable: details.totaltaxablevalue,
        text: numberToRupees(noteData.delchaltotal),
      };
      this.delnote = {
        isGst: this.isGstEnabled && ['GST', 'IGST', 'CGST', 'SGST'].includes(details.taxname),
        isVat: this.isVatEnabled && details.taxname === 'VAT',
        contents: [],
        no: noteData.dcno,
        date: noteData.dcdate,
        narration: noteData.dcnarration,
        supplyDate: details.dateofsupply,
        transport: {
          mode: noteData.modeoftransport,

          packageQty: noteData.noofpackages,
          vehicleNo: noteData.vehicleno,
        },
        issuer: noteData.issuername || '',
        designation: noteData.designation || '',
      };

      let party = {
        name: details.custSupDetails.custname,
        addr: details.custSupDetails.custaddr,
        state: details.custSupDetails.custsupstate,
        pin: details.custSupDetails.pincode,
      };

      let shipData = noteData.consignee || {};
      let shipTo = {
        name: shipData.consigneename || '',
        addr: shipData.consigneeaddress || '',
        state: shipData.consigneestate || '',
        pin: shipData.consigneepincode || '',
        gstin: shipData.gstinconsignee || '',
      };

      let godown = {
        name: noteData.goname,
        addr: noteData.goaddr,
        state: noteData.gostate,
      };

      if (noteData.inoutflag === 15) {
        this.delnote.from = godown;
        this.delnote.to = shipTo.name ? shipTo : party;
      } else {
        this.delnote.from = party;
        this.delnote.to = godown;
      }

      for (const name in details.delchalContents) {
        const item = details.delchalContents[name];
        this.delnote.contents.push({
          name: item.proddesc,
          qty: item.qty,
          rate: item.priceperunit,
          discount: item.discount,
          vat: item.taxrate,
          igst: item.taxrate,
          cgst: item.taxrate,
          sgst: item.taxrate,
          cess: item.cessrate,
          total: item.totalAmount,
          productcode: item.productCode,
          gsflag: item.gsflag,
          goid: item.goid,
        });
      }
      axios.get(`/accounts?type=getAccCode&accountname=${this.delnote.from.name}`)
        .then(response => {
          this.custid = response.data.accountcode;
        })
        .catch(error => {
          this.error = 'Failed to load data: ' + error.message;
        });
    },
    getDetails() {
      let url = `/delchal/${this.id}`;
      if (this.pdata.cancelledFlag) {
        url = `/delchal/cancel/${this.id}`;
      }
      return axios.get(url).catch((error) => {
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
        case 0:
          this.formatDetails(response.data.gkresult);
          break;
        case 2:
          this.$bvToast.toast(
            this.$gettext(`Unauthorized access, Please contact admin`),
            {
              title: this.$gettext(`Fetch Delivery Note Error!`),
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
              `Unable to Fetch Delivery Note Details! Please Try after sometime.`
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
    displayToast(title, message, variant) {
      this.$bvToast.toast(message, {
        title: title,
        autoHideDelay: 3000,
        variant: variant,
        appendToast: true,
        solid: true,
      });
    },
    fetchdId() {
      axios.get(`/delchal/invid/${this.id}`).then((resp) => {
        if (resp.data.gkstatus === 0) {
          this.invid = resp.data.data;
        }
      });
    },
  },
  watch: {
    id: function(id) {
      if (id && parseInt(id) > -1) {
        this.isPreloading = true;
        this.fetchAndUpdateData()
          .then(() => {
            this.isPreloading = false;
          })
          .catch(() => {
            this.isPreloading = false;
          });
        this.fetchdId();
      }
    },
  },
  mounted() {
    this.toDate = this.currentDate();
    if (this.id && parseInt(this.id) > -1) {
      this.isPreloading = true;
      this.fetchAndUpdateData()
        .then(() => {
          this.isPreloading = false;
        })
        .catch(() => {
          this.isPreloading = false;
        });
      this.fetchdId();
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

