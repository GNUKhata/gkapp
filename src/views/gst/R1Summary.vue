<template>
  <section class="m-2">
    <!-- Headings -->
    <report-header :show="true">
      <div class="text-center">
        GST R1 Summary
        <div>
          {{ fromDate }} to
          {{ toDate }}
        </div>
      </div>
    </report-header>

    <!-- R1 Tables (only shown if they have atleast one entry) -->
    <b-overlay
      :show="isLoading"
      spinner-type="grow"
    >
      <!-- B2B -->
      <div>
        <gk-file-download
          class="float-right"
          :url="spreadSheetUrl"
          file-name="GSTR1"
          file-extn="xlsx"
          :add-date="true"
          :add-time-stamp="true"
          name="Spreadsheet"
          icon="cloud-download"
          :message-from-parent="parentMessage"
        />
        <b-table
          caption-top
          class="mt-3"
          head-variant="dark"
          small
          bordered
          :items="summary.b2b"
          responsive
        >
          <template
            #table-caption
          >
            <h3 class="ml-4">
              B2B Invoices:
            </h3>
          </template>
        </b-table>
        <b-button
          size="sm"
          v-if="summary.b2b[0].invoice_count"
          @click="go('b2b')"
          class="float-right"
        >
          Details <b-icon
            icon="chevron-right"
            class="ml-1"
          />
        </b-button>
      </div>
      <!-- B2CL -->
      <div>
        <b-table
          caption-top
          class="mt-3"
          head-variant="dark"
          small
          bordered
          :items="summary.b2cl"
          responsive="sm"
        >
          <template #table-caption>
            <h3 class="ml-4">
              B2CL:
            </h3>
          </template>
        </b-table>
        <b-button
          size="sm"
          v-if="summary.b2cl[0].invoice_count"
          class="float-right"
          @click="go('b2cl')"
        >
          Details <b-icon
            class="mx-1"
            icon="chevron-right"
          />
        </b-button>
      </div>
      <!-- B2CS -->
      <div>
        <b-table
          caption-top
          class="mt-3"
          head-variant="dark"
          small
          bordered
          :items="summary.b2cs"
          responsive="sm"
        >
          <template #table-caption>
            <h3 class="ml-4">
              B2CS:
            </h3>
          </template>
        </b-table>
        <b-button
          size="sm"
          v-if="summary.b2cs[0].invoice_count"
          class="float-right"
          @click="go('b2cs')"
        >
          Details <b-icon
            class="ml-1"
            icon="chevron-right"
          />
        </b-button>
      </div>
      <!-- CDNR -->
      <div>
        <b-table
          caption-top
          class="mt-3"
          head-variant="dark"
          small
          bordered
          :items="summary.cdnr"
          responsive="sm"
        >
          <template #table-caption>
            <h3 class="ml-4">
              CDNR:
            </h3>
          </template>
        </b-table>
        <b-button
          size="sm"
          v-if="summary.cdnr[0].invoice_count"
          class="float-right"
          @click="go('cdnr')"
        >
          Details <b-icon
            icon="chevron-right"
            class="ml-1"
          />
        </b-button>
      </div>
      <!-- CDNUR -->
      <div>
        <b-table
          caption-top
          class="mt-3"
          head-variant="dark"
          small
          bordered
          :items="summary.cdnur"
          responsive="sm"
        >
          <template #table-caption>
            <h3 class="ml-4">
              CDNUR:
            </h3>
          </template>
        </b-table>
        <b-button
          size="sm"
          v-if="summary.cdnur[0].invoice_count"
          class="float-right"
          @click="go('cdnur')"
        >
          Details <b-icon
            icon="chevron-right"
            class="ml-1"
          />
        </b-button>
      </div>
      <!-- HSN -->
      <div>
        <b-table
          caption-top
          class="mt-3"
          head-variant="dark"
          small
          bordered
          :items="summary.hsn"
          responsive="sm"
        >
          <template #table-caption>
            <h3 class="ml-4">
              HSN:
            </h3>
          </template>
        </b-table>
        <b-button
          size="sm"
          v-if="summary.hsn[0].product_entries"
          class="float-right"
          @click="go('hsn1')"
        >
          Details <b-icon
            icon="chevron-right"
            class="ml-1"
          />
        </b-button>
        <div class="clearfix" />
      </div>
      <!-- JSON -->
      <div class="mt-4">
        <h3 class="d-inline-block text-secondary ml-3">
          GSTR-1 JSON:
        </h3>

        <div class="float-right">
          <b-button
            @click="copyJsonToClipboard"
            size="sm"
            variant="link"
          >
            <b-icon icon="files" />
          </b-button>
          <b-link
            class="display-inline-block p-1"
            :href="jsonDownloadLink"
            download="GSTR_1.json"
            :disabled="isLoading"
          >
            <b-icon icon="cloud-download" />
          </b-link>
        </div>
      </div>
      <b-overlay :show="isLoading">
        <div class="position-relative">
          <b-toast
            no-close-button
            variant="success"
            id="clipboard-toast"
            auto-hide-delay="1000"
            static
            class="position-absolute"
            style="right:0"
          >
            JSON copied to clipboard!
          </b-toast>
          <b-form-textarea
            id="textarea"
            v-model="jsonStr"
            rows="10"
            max-rows="20"
            readonly
          />
        </div>
      </b-overlay>
      <br>
      <br>
      <br>
    </b-overlay>
  </section>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
import ReportHeader from '@/components/ReportHeader.vue';
import GkFileDownload from '@/components/GkFileDownload.vue';
export default {
  components: { ReportHeader, GkFileDownload },
  name: 'R1Summary',
  data() {
    return {
      parentMessage: '',
      isLoading: false,
      list: { b2b: [], b2cl: [], b2cs: [], cdnr: [], cdnur: [], hsn1: [] },
      search: null,
      params: null,
      gstData: {},
      summary: {
        b2b: [{}],
        b2cs: [{}],
        b2cl: [{}],
        cdnr: [{}],
        cdnur: [{}],
        hsn: [{}],
      },
    };
  },
  props: {
    td: {
      type: String,
    },
    fd: {
      type: String,
    },
  },
  computed: {
    jsonStr: function() {
      return typeof this.gstData === 'object'
        ? JSON.stringify(this.gstData, null, 4)
        : JSON.stringify({}, null, 2);
    },
    jsonDownloadLink: function() {
      let link = '';
      if (typeof this.gstData === 'object') {
        link = `data:text/json;charset=utf-8,${encodeURIComponent(
          JSON.stringify(this.gstData)
        )}`;
      }
      return link;
    },
    spreadSheetUrl: function() {
      return `/spreadsheet?gstr1&start=${this.fd}&end=${this.td}`;
    },
    fromDate: function() {
      return this.fd ? this.dateReverse(this.fd) : '';
    },
    toDate: function() {
      return this.td ? this.dateReverse(this.td) : '';
    },
    ...mapState(['orgName', 'orgAddress']),
  },
  methods: {
    copyJsonToClipboard() {
      navigator.clipboard.writeText(this.jsonStr);
      this.$bvToast.show('clipboard-toast');
    },
    go(report) {
      this.$router.push(`/gst/r1/${report}/${this.fd}&${this.td}`);
    },
    generateSummary() {
      this.b2bSummary();
      this.cdnrSummary();
      this.cdnurSummary();
      this.b2csSummary();
      this.b2clSummary();
      this.hsnSummary();
    },
    /**
     * Generates B2B summary
     */
    b2bSummary() {
      const b2b = this.list.b2b;

      if (b2b.length) {
        let o = {
          invoice_count: b2b.length,
        };
        let [invVal, taxVal, cessVal] = [0, 0, 0];
        for (let i in b2b) {
          // add invoice values
          invVal += parseFloat(b2b[i].taxable_value);

          // add tax values
          taxVal +=
            parseFloat(b2b[i].taxable_value) * (parseFloat(b2b[i].rate) * 0.01);
          // add cess values
          cessVal +=
            parseFloat(b2b[i].taxable_value) * (parseFloat(b2b[i].cess) * 0.01);
        }
        o['taxable_value'] = invVal.toFixed(2);
        o['tax'] = taxVal.toFixed(2);
        o['cess'] = cessVal.toFixed(2);

        this.summary['b2b'] = [o];
      } else {
        this.summary['b2b'] = [
          {
            invoice_count: 0,
            taxable_value: 0,
            tax: 0,
            cess: 0,
          },
        ];
      }
    },
    b2csSummary() {
      const b2cs = this.list.b2cs;

      if (b2cs.length) {
        let summary = b2cs.reduce(
          (acc, item) => {
            let tax =
              parseFloat(item.taxable_value) * (parseFloat(item.rate) * 0.01);
            let cess =
              parseFloat(item.taxable_value) * (parseFloat(item.cess) * 0.01);
            acc.invoice_count++;
            acc.taxable_value += parseFloat(item.taxable_value) + tax + cess;
            acc.tax += tax;
            acc.cess += cess;
            return acc;
          },
          { invoice_count: 0, taxable_value: 0, tax: 0, cess: 0 }
        );
        this.summary['b2cs'] = [
          {
            invoice_count: summary.invoice_count,
            taxable_value: summary.taxable_value.toFixed(2),
            tax: summary.tax.toFixed(2),
            cess: summary.cess.toFixed(2),
          },
        ];
      } else {
        this.summary['b2cs'] = [
          {
            invoice_count: 0,
            taxable_value: 0,
            tax: 0,
            cess: 0,
          },
        ];
      }
    },
    b2clSummary() {
      const b2cl = this.list.b2cl;

      let summary = { invoice_count: 0, taxable_value: 0, tax: 0, cess: 0 };

      if (b2cl.length) {
        summary = b2cl.reduce(
          (acc, item) => {
            acc.invoice_count++;
            acc.taxable_value += parseFloat(item.taxable_value);
            acc.tax +=
              parseFloat(item.taxable_value) * (parseFloat(item.rate) * 0.01);
            acc.cess +=
              parseFloat(item.taxable_value) * (parseFloat(item.cess) * 0.01);
            return acc;
          },
          {
            invoice_count: 0,
            taxable_value: 0,
            tax: 0,
            cess: 0,
          }
        );
        summary = {
          invoice_count: summary.invoice_count,
          taxable_value: summary.taxable_value.toFixed(2),
          tax: summary.tax.toFixed(2),
          cess: summary.cess.toFixed(2),
        };
      }

      this.summary['b2cl'] = [summary];
    },
    cdnrSummary() {
      const cdnr = this.list.cdnr;

      if (cdnr.length) {
        let o = {
          invoice_count: cdnr.length,
        };
        let [rvVal, taxVal, cessVal] = [0, 0, 0];
        for (let i in cdnr) {
          // add refund voucher taxable values
          rvVal += parseFloat(cdnr[i].taxable_value);

          // add taxable values
          taxVal +=
            parseFloat(cdnr[i].taxable_value) *
            (parseFloat(cdnr[i].rate) * 0.01);
          // add cess values
          cessVal +=
            parseFloat(cdnr[i].taxable_value) *
            (parseFloat(cdnr[i].cess) * 0.01);
        }
        o['taxable_value'] = parseFloat(rvVal).toFixed(2);
        o['tax'] = taxVal.toFixed(2);
        o['CESS'] = cessVal.toFixed(2);

        this.summary['cdnr'] = [o];
      } else {
        this.summary['cdnr'] = [
          {
            invoice_count: 0,
            taxable_value: 0,
            tax: 0,
            cess: 0,
          },
        ];
      }
    },
    cdnurSummary() {
      const cdnur = this.list.cdnur;

      let summary = {
        invoice_count: 0,
        taxable_value: 0,
        tax: 0,
        cess: 0,
      };

      if (cdnur.length) {
        summary = cdnur.reduce(
          (acc, item) => {
            acc.invoice_count++;
            acc.refund_voucher_value += parseFloat(item.taxable_value);
            acc.tax +=
              parseFloat(item.taxable_value) * (parseFloat(item.rate) * 0.01);
            acc.cess +=
              parseFloat(item.taxable_value) * (parseFloat(item.cess) * 0.01);
            return acc;
          },
          {
            invoice_count: 0,
            taxable_value: 0,
            tax: 0,
            cess: 0,
          }
        );
        summary = {
          invoice_count: summary.invoice_count,
          taxable_value: summary.refund_voucher_value.toFixed(2),
          tax: summary.tax.toFixed(2),
          cess: summary.cess.toFixed(2),
        };
      }

      this.summary['cdnur'] = [summary];
    },
    hsnSummary() {
      const hsn = this.list.hsn1;

      if (hsn.length) {
        let o = {
          product_entries: hsn.length,
        };
        let [totVal, sgstVal, igstVal, cessVal] = [0, 0, 0, 0];
        for (let i in hsn) {
          // add total values
          totVal += parseFloat(hsn[i].taxableamt);
          // SGST values
          sgstVal += parseFloat(hsn[i].SGSTamt);
          // IGST values
          igstVal += parseFloat(hsn[i].IGSTamt);
          // add cess values
          cessVal += parseFloat(hsn[i].CESSamt);
        }
        o['taxable_value'] = totVal.toFixed(2);
        o['SGST'] = sgstVal.toFixed(2);
        o['IGST'] = igstVal.toFixed(2);
        o['CESS'] = cessVal.toFixed(2);

        this.summary['hsn'] = [o];
      } else {
        this.summary['hsn'] = [
          {
            product_entries: 0,
            taxable_value: 0,
            SGST: 0,
            IGST: 0,
            cess: 0,
          },
        ];
      }
    },
    /**
     * get GST R1 list
     */
    getGstR1List() {
      this.isLoading = true;
      axios
        .get(`/gst/returns/r1?start=${this.fd}&end=${this.td}`)
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
            case 0:
              this.list = r.data.gkdata;
              this.gstData = r.data.json;
              this.generateSummary();
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
            console.error(r);
          }
          this.isLoading = false;
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            variant: 'danger',
            solid: true,
          });
          this.isLoading = false;
        });
    },
  },
  mounted() {
    this.getGstR1List();
  },
};
</script>

<style>
#textarea {
  font-size: 0.8em;
}
</style>
