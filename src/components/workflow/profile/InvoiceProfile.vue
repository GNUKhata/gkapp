<template>
  <b-container fluid>
    <b-overlay :show="isPreloading" variant="secondary" no-wrap blur>
    </b-overlay>
    <div v-if="deletedFlag">
      <span class="float-right h5 p-2 bg-danger text-white" v-translate>
        Cancelled
      </span>
      <div class="clearfix"></div>
      <br />
    </div>
    <!-- action buttons -->
    <div class="mb-3 clearfix d-print-none">
      <div class="float-right">
        <span v-if="!deletedFlag">
          <b-button
            v-if="invoice.attachmentCount"
            class="mr-1"
            size="sm"
            variant="primary"
            v-b-toggle.attachment-container
            @click="fetchAttachments"
          >
            <b-icon class="mr-1" icon="eye"></b-icon>
            <translate>View Attachments</translate>
          </b-button>
          <b-button
            class="mr-1"
            size="sm"
            variant="primary"
            v-b-toggle.voucher-container
          >
            <b-icon class="mr-1" icon="eye"></b-icon>
            <translate>View Vouchers</translate>
          </b-button>
          <b-button
            class="mr-1"
            size="sm"
            variant="primary"
            v-b-toggle.voucher-container
            v-if="showButton(3)" @click="redirectBasedOnValue(3)"
          >
            <b-icon class="mr-1" icon="eye"></b-icon>
            <translate>View Credit Note</translate>
          </b-button>
          <b-button
            class="mr-1"
            size="sm"
            variant="primary"
            v-b-toggle.voucher-container
            v-if="showButton(4)" @click="redirectBasedOnValue(4)"
          >
            <b-icon class="mr-1" icon="eye"></b-icon>
            <translate>View Debit Note</translate>
          </b-button>
          <b-button
            class="mr-1"
            size="sm"
            variant="primary"
            v-if="showRejectionButton" @click="redirectRejectionNote()"
          >
            <b-icon class="mr-1" icon="eye"></b-icon>
            <translate>View Rejection Note</translate>
          </b-button>
          <b-button
            @click="onPayment"
            v-if="invoice.payment.mode != 5 && paymentFlag"
            class="mr-1"
            size="sm"
            variant="success"
          >
            <!-- <b-icon class="mr-1" icon="clipboard-check"></b-icon> -->
            <translate
              >{{ invoice.isSale ? 'Receive Payment' : 'Make Payment' }}
            </translate>
          </b-button>
          <b-button
            :to="{
                  name: 'Billwise',
                  params: { custType: 3, custName: '-1' },
                }"
            v-if="invoice.payment.mode != 5 && paymentFlag"
            class="mr-1"
            size="sm"
            variant="success"
          >
            <b-icon class="mr-1" icon="clipboard-check"></b-icon>
            <translate
              >Adjust
            </translate>
          </b-button>
          <b-button
            v-if="rectifyFlag"
            class="mr-1"
            size="sm"
            variant="warning"
            :to="{ name: 'Invoice_Edit', params: { invid: id } }"
          >
            <b-icon class="mr-1" icon="pencil"></b-icon>
            <translate>Rectify</translate>
          </b-button>
          <b-button
            v-if="cancelFlag"
            size="sm"
            variant="danger"
            @click="confirmOnCancel"
          >
            <b-icon class="mr-1" icon="x-octagon"></b-icon>
            <translate>Cancel</translate>
          </b-button>
        </span>
      </div>
    </div>
    <div>
      <h3 v-translate class="d-none d-print-block text-center mt-1">
        <span v-if="isGstEnabled || isVatEnabled">TAX</span>
        INVOICE
      </h3>
    </div>
    <b-card-group deck class="mb-2">
      <!-- buyer/seller details -->
      <b-card class="border-dark">
        <b key="1" v-if="invoice.isSale" v-translate>
          Buyer Details
        </b>
        <b key="2" v-else v-translate> Seller Details </b>
        <br />
        <p class="text-small">
          <template>
            <div>
              <router-link v-if="!deletedFlag" :to="`/ledger/${custid}`">{{ invoice.party.name }}</router-link>
              <span v-else>{{ invoice.party.name }}</span>
            </div>
          </template>
          <span>{{ invoice.party.addr }} </span> <br />
          <span>{{ invoice.party.state }} </span> <br />
          <span>{{ invoice.party.pincode }} </span> <br />
          <span>{{ invoice.party.country }} </span> <br />
          <span v-if="invoice.party.phone">
            <span>Contact No: {{ invoice.party.phone }} </span> <br />
          </span>
          <span v-if="invoice.party.email">
            <span>Email: {{ invoice.party.email }} </span> <br />
          </span>
          <span v-if="invoice.isGst">
            <b> GSTIN: </b> {{ invoice.party.gstin || '-' }}
          </span>
          <span v-if="invoice.isVat">
            <b> TIN: </b> {{ invoice.party.tin || '-' }}
          </span>
        </p>
      </b-card>

      <!-- invoice details -->
      <b-card class="border-dark" order="1">
        <b key="3" v-if="invoice.isSale" v-translate>
          Sale Invoice Details
        </b>
        <b key="4" v-else v-translate>
          Purchase Invoice Details
        </b>
        <!-- Note Details Table -->
        <b-table-lite
          :fields="['title', 'value']"
          :items="invoiceData"
          small
          thead-class="d-none"
          fixed
          class="text-small border-dark"
        >
          <template #cell(value)="data">
            <span v-if="typeof data.value === 'object'">
              <b-link
                :to="{
                  name: 'Workflow',
                  params: {
                    wfName: 'Transactions-DeliveryNote',
                    wfId: data.value.id,
                  },
                }"
              >
                {{ data.value.text }}
              </b-link>
            </span>
            <span v-else>
              {{ data.value }}
            </span>
          </template>
        </b-table-lite>
      </b-card>
    </b-card-group>
    <!-- bill items Table -->
    <b-table-lite
      :items="invoice.invItems"
      :fields="tableFields"
      bordered
      responsive
      stacked="sm"
      striped
      small
      class="text-small border border-dark"
      tbody-tr-class="gk-vertical-row"
    >
    <template #cell(name)="data">
      <template v-if="data.item.gsflag === 7 && !deletedFlag">
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
      <template #cell(hsn)="data">
        {{ data.item.hsn.hsn_code || 'N/A' }}
      </template>
      <template #cell(price)="data"> {{ data.value }} </template>
      <template #cell(discount)="data"> {{ data.value }} </template>
      <template #cell(tax)="data">
        {{ data.value.rate }} <small> % </small>
      </template>
      <template #cell(cgst)="data">
        {{ data.value }} <small> % </small>
      </template>
      <template #cell(sgst)="data">
        {{ data.value }} <small> % </small>
      </template>
      <template #cell(igst)="data">
        {{ data.value }} <small> % </small>
      </template>
      <template #cell(cess)="data">
        {{ data.value.rate }} <small> % </small>
      </template>
      <template #cell(vat)="data">
        {{ data.value }} <small> % </small>
      </template>
      <template #cell(total)="data"> {{ data.value }} </template>
      <template #custom-foot>
        <b-tr>
          <b-th
            v-translate
            :colspan="tableFields.length - 1"
          >
            Total
          </b-th>
          <b-th class="text-right"> {{ invoice.total.amount }}</b-th>
        </b-tr>
      </template>
    </b-table-lite>
    <b-card-group deck>
      <!-- payment details -->
      <b-card class="border-dark">
        <b v-translate> Payment Details </b>
        <div v-if="bankMode" class="mb-3">
          {{ paymentMode }}
          <b-table-lite
            :items="bankDetails"
            :fields="['title', 'value']"
            small
            bordered
            fixed
            thead-class="d-none"
            class="mt-1 text-small"
          >
          </b-table-lite>
        </div>
        <div class="text-small" v-else>
          {{ paymentMode }}
        </div>
        <b v-translate> Narration: </b> {{ invoice.narration }}
      </b-card>
      <!-- Total Table -->
      <b-card class="border-dark">
        <b-table-lite
          :items="totalDetails"
          :fields="[
            { key: 'title', label: 'Total', tdClass: '' },
            { key: 'value', label: '₹', class: 'text-right' },
          ]"
          small
          fixed
          class="text-small"
        ></b-table-lite>
      </b-card>
    </b-card-group>
    <!-- signature section -->
    <div class="text-right mt-5 font-weight-bold d-none d-print-block mr-2">
      Authorized signatory
    </div>
    <div class="clearfix"></div>
    <br />
    <b-collapse v-model="showAttachments" id="attachment-container">
      <div class="position-relative">
        <b-overlay :show="isAttachmentLoading" variant="secondary" no-wrap blur>
        </b-overlay>
        <b v-translate> Attachments: </b>
        <div class="clearfix"></div>
        <div
          class="m-1 d-inline-block text-center float-left position-relative"
          style="width: 200px; height: 200px; border: 1px solid; line-height: 196px;"
          v-for="(image, index) in attachments"
          :key="index"
        >
          <img
            style="height: 196px; box-sizing: border-box"
            @load="onAttachementPreviewLoad"
            :src="image"
            :alt="'Preview_' + index"
          />
        </div>
        <div class="clearfix"></div>
      </div>
    </b-collapse>
    <br />
    <b-collapse v-model="showVouchers" id="voucher-container">
      <div class="clearfix"></div>
      <b v-translate> Vouchers: </b>
      <div v-if="vouchers.length">
        <b-card
          class="mb-2"
          v-for="voucher in vouchers"
          :key="voucher.id"
          body-class="p-1"
        >
          <div class="text-center m-1 mb-2">
            <span class="float-left">
              Voucher No:
              <router-link :to="`/Workflow/Transactions-Voucher/${voucher.id}`">
                {{voucher.no}}
              </router-link>
            </span>
            <span> {{ voucher.type }} </span>
            <span class="float-right">
              <translate
                translate-comment="%{voucherDate} is a variable, translation is not required for it. Enter it, as it is while translation."
                :translate-params="{ voucherDate: voucher.date }"
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
          >
          </b-table-lite>
          <div>
            <translate
              translate-comment="%{narration} is a variable, translation is not required for it. Enter it, as it is while translation."
              :translate-params="{ narration: voucher.narration }"
            >
              Narration: %{narration}
            </translate>
          </div>
          <br />
        </b-card>
      </div>
      <div v-else>
        <translate
          translate-comment="%{invNo} is a variable, translation is not required for it. Enter it, as it is while translation."
          :translate-params="{ invNo: invoice.number }"
        >
          No vouchers were found for Invoice: %{invNo}
        </translate>
      </div>
    </b-collapse>
    <b-modal
      size="lg"
      v-model="showVoucherModal"
      centered
      static
      body-class="p-0"
      id="contact-item-modal"
      hide-footer
      hide-header
    >
      <easy-voucher
        :type="voucherType"
        :invId="voucherInvId"
        :onSave="onPaymentComplete"
      ></easy-voucher>
    </b-modal>
  </b-container>
</template>

<script>
import axios from 'axios';
import { mapGetters, mapState } from 'vuex';
import EasyVoucher from '@/components/form/VoucherEasy.vue';
import { numberToWords } from '../../../js/utils.js';

export default {
  name: 'InvoiceProfile',
  components: { EasyVoucher },
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
      data: {},
      showCreditButton: false,
      showDebitButton: false,
      showRejectionButton: false,
      rejectionnoteid: null,
      paymentFlag: false,
      isPreloading: false,
      invoice: {
        attachmentCount: 0,
        taxState: '',
        issuer: '',
        designation: '',
        date: '',
        payment: {
          mode: 2,
          bankDetails: {},
        },
        party: {
          csflag: '3', // 3 -> customer, 19 -> supplier
          name: ' ',
          state: '',
          country: '',
          addr: '',
          pincode: '',
          phone: '',
          email: '',
        },
        isSale: '',
        isGst: false,
        isVat: false,
        invItems: [],
        total: {
          amount: 0,
          text: 'Zero Rupee',
          taxable: 0,
          cess: 0,
          tax: 0,
          isIgst: false,
          roundoff: 0,
        },
        number: '',
      },
      custid: null,
      dnote: {
        id: '',
        no: '',
        goname: '',
        goid: '',
        packageQty: 0,
      },
      vouchers: [],
      attachments: [],
      showAttachments: false,
      showVouchers: false,
      isAttachmentLoading: false,
      voucherType: 'receipt',
      voucherInvId: -1,
      showVoucherModal: false,
      states: {},
      toDate: '',
    };
  },
  computed: {
    ...mapGetters('global', ['isIndia', 'isGstEnabled', 'isVatEnabled']),
    isIndianParty: (self) =>
      !self.invoice.party.country || self.invoice.party.country === 'India',
    tableFields: (self) => {
      // let designation = self.invoice.designation
      //   ? `(${self.invoice.designation})`
      //   : '';
      let fields = [
        {
          key: 'name',
          label: self.$gettext('Item'),
        },
        {
          key: 'qty',
          label: self.$gettext('Qty'),
          tdClass: 'gk-currency-sm',
        },
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
            fields.push({
              key: 'igst',
              label: 'IGST',
              tdClass: 'gk-currency-sm',
            });
          } else {
            fields.push(
              { key: 'cgst', label: 'CGST', tdClass: 'gk-currency-sm' },
              { key: 'sgst', label: 'SGST', tdClass: 'gk-currency-sm' }
            );
          }
          fields.splice(1, 0, {
            key: 'hsn',
            label: self.$gettext('HSN / SAC'),
            tdClass: 'gk-currency-sm',
          });
          fields.push({ key: 'cess', label: 'CESS', tdClass: 'gk-currency-sm' });
        }
        if (self.invoice.isVat) {
          fields.push({ key: 'vat', label: 'VAT', tdClass: 'gk-currency-sm' });
        }
      }
      fields.push({
        key: 'total',
        label: self.$gettext('Total (₹)'),
        tdClass: 'gk-currency-sm',
      });
      // fields.push({
      //   title: 'Issued By',
      //   value: `${self.invoice.issuer}  ${designation}`,
      // });
      return fields;
    },
    invoiceData: (self) => {
      let details = self.invoice;
      let designation = details.designation ? `(${details.designation})` : '';

      let res = [
        { title: self.$gettext('No'), value: details.number },
        { title: self.$gettext('Date'), value: details.date },
      ];

      if (details.supinvno) {
        res.push({
          title: self.$gettext('Sup. Inv. No'),
          value: details.supinvno,
        });
      }

      if (details.supinvdate) {
        res.push({
          title: self.$gettext('Sup. Inv. Date'),
          value: details.supinvdate,
        });
      }

      if (details.eway) {
        res.push({
          title: self.$gettext('Eway Bill No.'),
          value: details.eway || '',
        });
      }

      if (details.dcid && !self.deletedFlag) {
        res.push({
          title: self.$gettext('Delivery Note No.'),
          value: details.dcid
            ? { type: 'delchal', id: details.dcid, text: details.dcno }
            : '',
        });
      }

      res.push({
        title: self.$gettext('Godown'), value: self.dnote.goname || ''
      });

      if (self.isIndia && self.isIndianParty) {
        res.push({
          title: self.$gettext('Place of Supply'),
          value: details.taxState || '',
        });
      }

      res.push({
        title: self.$gettext('Issued By'),
        value: `${details.issuer}  ${designation}`,
      });

      return res;
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
    totalDetails: (self) => {
      let total = [];
      if (self.isIndia && (self.invoice.isGst || self.invoice.isVat)) {
        total.push[{ title: 'Taxable', value: self.invoice.total.taxable }];
        if (self.invoice.isGst) {
          if (self.invoice.total.isIgst) {
            total.push({ title: 'IGST', value: self.invoice.total.tax });
          } else {
            total.push(
              { title: 'CGST', value: self.invoice.total.tax },
              { title: 'SGST', value: self.invoice.total.tax }
            );
          }
          total.push({ title: 'CESS', value: self.invoice.total.cess });
        }
        if (self.invoice.isVat) {
          total.push({ title: 'VAT', value: self.invoice.total.tax });
        }
      }
      total.push(
        {
          title: self.$gettext('Invoice Value'),
          value: self.invoice.total.roundoff ? Math.round(self.invoice.total.amount).toFixed(2) : self.invoice.total.amount,
        },
        {
          title: self.$gettext('Invoice Value In Words'),
          value: `${(
            self.invoice.total.roundoff
              ? numberToWords(Math.round(self.invoice.total.amount))
              : numberToWords(self.invoice.total.amount)
          )} Only`,
        }
      );
      return total;
    },
    paymentMode: (self) => {
      let mode = '';
      switch (parseInt(self.invoice.payment.mode)) {
        case 2:
        case 4:
          mode = 'Paid By Bank Transfer';
          break;
        case 3:
        case 5:
          mode = 'Paid By Cash';
          break;
        case 15:
          mode = 'On Credit';
      }
      return mode;
    },
    bankMode: (self) => {
      let mode = parseInt(self.invoice.payment.mode);
      return mode === 2 || mode === 4;
    },
    deletedFlag: (self) => !!self.pdata.deletedFlag,
    onCreditFlag: (self) => !!self.pdata.onCreditFlag,
    rectifyFlag: (self) => !!self.pdata.rectifyFlag,
    cancelFlag: (self) => !!self.pdata.cancelFlag,
    ...mapState(['authToken']),
  },
  methods: {
    onPayment() {
      this.voucherType = this.invoice.isSale ? 'receipt' : 'payment';
      this.voucherInvId = this.id;
      this.showVoucherModal = true;
    },
    onPaymentComplete() {
      this.showVoucherModal = false;
      this.voucherInvId = -1;
      this.refresh();
    },
    onAttachementPreviewLoad(e) {
      // console.log(e)
      if (e.target) {
        let height = e.target.height;
        let width = e.target.width;
        if (width > height) {
          e.target.style.height = 'auto';
          e.target.style.width = '196px';
        } else {
          e.target.style.width = 'auto';
          e.target.style.height = '196px';
        }
      }
    },
    fetchAttachments() {
      if (this.attachments.length) {
        return;
      }
      this.isAttachmentLoading = true;
      axios.get(`/invoice/attachment/${this.id}`).then((resp) => {
        this.attachments = resp.data.gkresult;
        this.isAttachmentLoading = false;
      });
    },
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
          console.log(e);
        });
    },
    getPaymentData() {
      axios.get('/billwise?type=all').then((resp) => {
        if (resp.data.gkstatus === 0) {
          this.paymentFlag = resp.data.invoices.some(inv => inv.invid === this.id);
        }
      });
    },
    getDetails() {
      // let type = this.deletedFlag ? 'deletedsingle' : 'single';
      let url = this.deletedFlag
        ? `/invoice/cancel/${this.id}`
        : `/invoice/${this.id}`;
      return axios.get(url).catch((error) => {
        this.$bvToast.toast(`Error: ${error.message}`, {
          title: `${this.formMode} ${this.formType} Error!`,
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
    /**
     * formatInvoiceDetails()
     *
     * Description: Format the invoice details from gkcore to an
     * internal format for ease of use
     */
    formatInvoiceDetails(details) {
      if (details) {
        let party = details.custSupDetails || {};
        let gstinList =
          party.custgstinlist && typeof party.custgstinlist === 'object'
            ? Object.values(party.custgstinlist)
            : [];
        let gstin = gstinList.length ? gstinList[0] : '';
        this.invoice = {
          issuer: details.issuername,
          designation: details.designation,
          number: details.invoiceno,
          date: details.invoicedate,
          dcno: details.dcno || '',
          dcid: details.dcid || '',
          taxState: this.states[details.taxstatecode],
          eway:
            details.ewaybillno !== 'undefined' && !!details.ewaybillno
              ? details.ewaybillno
              : '',
          payment: {
            mode: details.paymentmode,
            bankDetails: details.bankdetails,
          },
          party: {
            name: party.custname,
            state: party.custsupstate,
            country: party.country,
            addr: party.custaddr,
            pincodce: party.pincode,
            phone: party.custphone,
            email: party.custemail,
            csflag: party.csflag,
            gstin: gstin,
          },
          isSale: details.inoutflag === 15,
          isGst: this.isGstEnabled && ['GST', 'IGST', 'CGST', 'SGST'].includes(details.taxname),
          isVat: this.isVatEnabled && details.taxname === 'VAT',
          invItems: [],
          total: {
            amount: details.invoicetotal,
            text: details.invoicetotalword,
            taxable: details.totaltaxablevalue,
            cess: details.totalcessamt,
            tax: details.totaltaxamt,
            isIgst: details.taxname === 'IGST',
            roundoff: details.roundoff,
          },
          narration: details.narration,
          attachmentCount: details.attachmentcount,
        };
        if (details.inoutflag === 9) {
          Object.assign(this.invoice, {
            supinvno: details.supinvno,
            supinvdate: details.supinvdate,
          });
        }

        if (details.invcontents) {
          let product = {};
          this.invoice.invItems = Object.keys(details.invcontents).map(
            (key) => {
              let taxrate = parseFloat(details.invcontents[key].taxrate) || 0;
              let cgst = taxrate.toFixed(2);
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
                hsn: JSON.parse(details.invcontents[key].gscode) || 'N/A',
                tax: {
                  name: details.invcontents[key].taxname,
                  rate: details.invcontents[key].taxrate,
                  amount: details.invcontents[key].taxamount,
                },
                igst: taxrate,
                cgst: cgst,
                sgst: cgst,
                vat: taxrate,
                cess: {
                  rate: details.invcontents[key].cessrate,
                  amount: details.invcontents[key].cess,
                },
                gsflag: details.invcontents[key].gsflag,
              };
              return product;
            }
          );
        }
        axios.get(`/accounts?type=getAccCode&accountname=${this.invoice?.party.name}`)
        .then(response => {
          this.custid = response.data.accountcode;
        })
        .catch(error => {
          this.error = 'Failed to load data: ' + error.message;
        });
      }
    },
    cancelInvoice() {
      axios
        .delete(`/invoice/cancel/${this.id}`)
        .then((response) => {
          switch (response.data.gkstatus) {
            case 0:
              this.displayToast(
                'Cancel Invoice Success!',
                `Successfully cancelled Invoice ${this.invoice.number}`,
                'success'
              );
              this.getDetails().then((response) => {
                if (typeof this.onUpdate === 'function') {
                  this.onUpdate(response.data);
                }
              });
              break;
            case 3:
              this.displayToast(
                'Cancel Invoice Failure!',
                `Could not cancel Invoice ${this.invoice.number}. Try again later or Contact admin`,
                'danger'
              );
              break;
            default:
              this.displayToast(
                'Cancel Invoice Failure!',
                `Could not cancel Invoice ${this.invoice.number}. Try again later or Contact admin`,
                'danger'
              );
          }
        })
        .catch((error) => {
          this.displayToast('Cancel Invoice Failure!', error.message, 'danger');
        });
    },
    confirmOnCancel() {
      let invType = this.invoice.isSale ? 'Sale to' : 'Purchase from';
      let text = this.$createElement('div', {
        domProps: {
          innerHTML: `About to cancel Invoice: <b>${this.invoice.number}</b>, of ${this.invoice.total.text} <b>(₹ ${this.invoice.total.amount})</b> for ${invType}  ${this.invoice.party.name}. Are you sure?`,
        },
      });
      this.$bvModal
        .msgBoxConfirm(text, {
          size: 'md',
          buttonSize: 'sm',
          okVariant: 'success',
          headerClass: 'p-0 border-bottom-0',
          footerClass: 'border-top-0', // p-1
          // bodyClass: 'p-2',
          centered: true,
        })
        .then((val) => {
          if (val) {
            this.cancelInvoice();
          }
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
    fetchAndUpdateData() {
      return this.getDetails().then((response) => {
        switch (response.data.gkstatus) {
          case 0:
            {
              // this.invoice = response.data.gkresult;
              let invData = response.data.gkresult;
              this.formatInvoiceDetails(invData);
              if (invData.dcid) {
                this.getDelNoteDetails(invData.dcid).then((dnResponse) => {
                  let dndata = dnResponse.data.gkresult.delchaldata;
                  if (dndata) {
                    this.dnote = {
                      id: dndata.dcid,
                      no: dndata.dcno,
                      goname: dndata.goname,
                      goid: dndata.goid,
                      packageQty: dndata.noofpackages,
                    };
                  }
                });
              } else {
                this.dnote = {
                  id: '',
                  no: '',
                  goname: '',
                  goid: '',
                  packageQty: 0,
                };
              }
            }
            break;
          case 2:
            this.$bvToast.toast(`Unauthorized access, Please contact admin`, {
              title: `${this.formMode} ${this.formType} Error!`,
              autoHideDelay: 3000,
              variant: 'warning',
              appendToast: true,
              solid: true,
            });
            break;
          default:
            this.$bvToast.toast(
              `Unable to Fetch Invoice Details! Please Try after sometime.`,
              {
                title: `Fetch Transaction Details Error!`,
                autoHideDelay: 3000,
                variant: 'warning',
                appendToast: true,
                solid: true,
              }
            );
        } // end switch
      });
    },
    fetchState() {
      return axios.get('/state').then((resp) => {
        if (resp.data.gkstatus === 0) {
          this.states = {};
          resp.data.gkresult.forEach((state) => {
            let code = Object.keys(state)[0];
            let name = Object.values(state)[0];
            this.states[code] = name;
          });
        }
      });
    },
    refresh() {
      this.isPreloading = true;
      this.showVouchers = false;
      this.vouchers = [];
      this.showAttachments = false;
      this.attachments = [];
      Promise.all([this.fetchAndUpdateData(), this.getVouchers(), this.getPaymentData()])
        .then(() => {
          this.isPreloading = false;
        })
        .catch(() => {
          this.isPreloading = false;
        });
    },
    redirectBasedOnValue(value) {
      const selectedKey = Object.keys(this.data).find(key => this.data[key] === value);

      if (selectedKey) {
        this.$router.push({ path: `/workflow/Transactions-DebitCreditNote/${selectedKey}` });
      }
    },
    redirectRejectionNote() {
      if (this.rejectionnoteid) {
        this.$router.push({ path: `/workflow/Transactions-RejectionNote/${this.rejectionnoteid}`});
      }
    },
    checkDcCrValues() {
      axios.get(`/invoice/drcr/${this.id}`).then((resp) => {
        if (resp.data.gkstatus === 0 && resp.data?.data) {
          this.data = resp.data.data;
          const values = Object.values(this.data);

          this.showCreditButton = values.includes(3);
          this.showDebitButton = values.includes(4);
        }
      });
      axios.get(`/invoice/rnid/${this.id}`).then((resp) => {
        if (resp.data.gkstatus === 0 && resp.data?.data) {
          this.rejectionnoteid = resp.data.data;
          this.showRejectionButton = true;
        } else {
          this.showRejectionButton = false;
        }
      });
    },
    showButton(value) {
      return Object.values(this.data).includes(value);
    },
  },
  watch: {
    id(newId) {
      if (newId && parseInt(newId) > -1) {
        this.refresh();
      }
      this.checkDcCrValues();
    },
  },
  mounted() {
    this.toDate = this.currentDate();
    // console.log("mounted")
    if (this.id && parseInt(this.id) > -1) {
      this.isPreloading = true;
      Promise.all([
        this.fetchState(),
        this.fetchAndUpdateData(),
        this.getVouchers(),
      ])
        .then(() => {
          this.isPreloading = false;
        })
        .catch(() => {
          this.isPreloading = false;
        });
        this.getPaymentData();
    } else {
      this.isPreloading = true;
      this.fetchState()
        .then(() => {
          this.isPreloading = false;
        })
        .catch(() => {
          this.isPreloading = false;
        });
    }
  },
  created() {
    this.checkDcCrValues();
  }
};
</script>

<style scoped>
.carousel-control-prev-icon,
.carousel-control-next-icon {
  filter: invert(1);
}
.carousel-indicators > li {
  background-color: #000;
}
thead > tr > th {
  width: 0;
}
</style>
