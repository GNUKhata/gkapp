<!-- 
Credits:
The GSTR3B summary structure was used from ErpNext's GSTR3B report (https://github.com/frappe/erpnext/blob/develop/erpnext/regional/doctype/gstr_3b_report/gstr_3b_report.html)
License: GPLv3 (https://github.com/frappe/erpnext/blob/develop/license.txt)
-->
<template>
  <section class="m-1">
    <b-card
      header="GSTR 3B Report"
      header-bg-variant="dark"
      header-text-variant="light"
      class="mx-auto gkcard d-print-none"
    >
      <b-form @submit.prevent="getGst3rbJson">
        <gk-period
          @update="onPeriodUpdate"
          @validity="updateValidity"
        />
        <b-button
          type="submit"
          size="sm"
          variant="success"
          class="float-right"
          :disabled="!periodValidity || isLoading"
        >
          <b-icon
            class="mr-1"
            icon="eye-fill"
          /> Show
        </b-button>
      </b-form>
    </b-card>

    <div class="container-fluid mt-4">
      <div>
        <h3 class="text-center">
          GSTR3B-Form
        </h3>
        <small>
          <b> GSTIN: {{ gstData.gstin }} </b>
        </small>
        <small>
          <b> Period: {{ gstData.ret_period }} </b>
        </small>
        <gk-file-download
          class="float-right"
          :url="spreadSheetUrl"
          file-name="GSTR-3B"
          file-extn="xlsx"
          :add-date="true"
          :add-time-stamp="true"
          name="Spreadsheet"
          :disabled="!datesValid || isLoading"
          icon="cloud-download"
          :message-from-parent="parentMessage"
        />
      </div>

      <small class="mb-1">
        <b>
          3.1 Details of Outward Supplies and inward supplies liable to reverse
          charge
        </b>
      </small>
      <b-overlay :show="isLoading">
        <div style="overflow: scroll">
          <table
            class="table table-bordered table-striped table-sm table-border-dark small"
          >
            <thead>
              <tr>
                <th class="border-bottom-0">
                  Nature Of Supplies
                </th>
                <th class="border-bottom-0">
                  Total Taxable value
                </th>
                <th class="border-bottom-0">
                  Integrated Tax
                </th>
                <th class="border-bottom-0">
                  Central Tax
                </th>
                <th class="border-bottom-0">
                  State/UT Tax
                </th>
                <th class="border-bottom-0">
                  Cess
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b-button
                    variant="link"
                    size="sm"
                    class="p-0 text-left"
                    @click="openInvoicesTable('outward_taxable_supplies')"
                    v-if="
                      this.options.invOptions['outward_taxable_supplies'].length
                    "
                  >
                    (a) Outward taxable supplies(other than zero rated, nil
                    rated and exempted)
                  </b-button>
                  <span v-else>
                    (a) Outward taxable supplies(other than zero rated, nil
                    rated and exempted)
                  </span>
                </td>
                <td class="right">
                  {{ gstData.sup_details.osup_det.txval }}
                </td>
                <td class="right">
                  {{ gstData.sup_details.osup_det.iamt }}
                </td>
                <td class="right">
                  {{ gstData.sup_details.osup_det.camt }}
                </td>
                <td class="right">
                  {{ gstData.sup_details.osup_det.samt }}
                </td>
                <td class="right">
                  {{ gstData.sup_details.osup_det.csamt }}
                </td>
              </tr>
              <tr>
                <td>
                  <b-button
                    variant="link"
                    size="sm"
                    class="p-0 text-left"
                    @click="openInvoicesTable('outward_taxable_zero_rated')"
                    v-if="
                      this.options.invOptions['outward_taxable_zero_rated']
                        .length
                    "
                  >
                    (b) Outward taxable supplies(zero rated)
                  </b-button>
                  <span v-else>
                    (b) Outward taxable supplies(zero rated)
                  </span>
                </td>
                <td class="right">
                  {{ gstData.sup_details.osup_zero.txval }}
                </td>
                <td class="right">
                  {{ gstData.sup_details.osup_zero.iamt }}
                </td>
                <td class="disabled" />
                <td class="disabled" />
                <td class="right">
                  {{ gstData.sup_details.osup_zero.csamt }}
                </td>
              </tr>
              <tr>
                <td>
                  <b-button
                    variant="link"
                    size="sm"
                    class="p-0 text-left"
                    @click="openInvoicesTable('outward_taxable_exempted')"
                    v-if="
                      this.options.invOptions['outward_taxable_exempted'].length
                    "
                  >
                    (c) Other outward supplies(Nil rated,Exempted)
                  </b-button>
                  <span v-else>
                    (c) Other outward supplies(Nil rated,Exempted)
                  </span>
                </td>
                <td class="right">
                  {{ gstData.sup_details.osup_nil_exmp.txval }}
                </td>
                <td class="disabled" />
                <td class="disabled" />
                <td class="disabled" />
                <td class="disabled" />
              </tr>

              <tr>
                <td>
                  <b-button
                    variant="link"
                    size="sm"
                    class="p-0 text-left"
                    @click="openInvoicesTable('inward_reverse_charge')"
                    v-if="
                      this.options.invOptions['inward_reverse_charge'].length
                    "
                  >
                    (d) Inward Supplies(liable to reverse charge)
                  </b-button>
                  <span v-else>
                    (d) Inward Supplies(liable to reverse charge)
                  </span>
                </td>
                <td class="right">
                  {{ gstData.sup_details.isup_rev.txval }}
                </td>
                <td class="right">
                  {{ gstData.sup_details.isup_rev.iamt }}
                </td>
                <td class="right">
                  {{ gstData.sup_details.isup_rev.camt }}
                </td>
                <td class="right">
                  {{ gstData.sup_details.isup_rev.samt }}
                </td>
                <td class="right">
                  {{ gstData.sup_details.isup_rev.csamt }}
                </td>
              </tr>
              <tr>
                <td>
                  <b-button
                    variant="link"
                    size="sm"
                    class="p-0 text-left"
                    @click="openInvoicesTable('outward_non_gst')"
                    v-if="options.invOptions['outward_non_gst'].length"
                  >
                    (e) Non-GST outward supplies
                  </b-button>
                  <span v-else>
                    (e) Non-GST outward supplies
                  </span>
                </td>
                <td class="right">
                  {{ gstData.sup_details.osup_nongst.txval }}
                </td>
                <td class="disabled" />
                <td class="disabled" />
                <td class="disabled" />
                <td class="disabled" />
              </tr>
            </tbody>
          </table>
        </div>
      </b-overlay>

      <small>
        <b>
          3.2 Of the supplies shown in 3.1 (a) above, details of inter-State
          supplies made to unregisterd persons, composition taxable persons and
          UIN holders
        </b>
      </small>
      <b-overlay :show="isLoading">
        <table
          class="table table-bordered table-striped table-sm table-border-dark small"
        >
          <thead>
            <tr>
              <th class="border-bottom-0" />
              <th class="border-bottom-0">
                Place Of Supply (State/UT)
              </th>
              <th class="border-bottom-0">
                Total Taxable Value
              </th>
              <th class="border-bottom-0">
                Amount of Integrated Tax
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><b> Supplies made to Unregistered Persons </b></td>
              <td colspan="3" />
            </tr>
            <tr
              v-for="(row, index) in gstData.inter_sup.unreg_details"
              :key="`${index}-unreg`"
            >
              <td />
              <td class="right">
                <b-button
                  variant="link"
                  size="sm"
                  class="p-0 text-left"
                  @click="
                    openInvoicesTable(
                      'pos_unreg_comp_uin_igst',
                      row.pos,
                      'unreg',
                    )
                  "
                  v-if="
                    options.invOptions.pos_unreg_comp_uin_igst.unreg.length[
                      row.pos
                    ]
                  "
                >
                  {{ stateIdToName[row.pos] }}
                </b-button>
                <span v-else>
                  {{ stateIdToName[row.pos] }}
                </span>
              </td>
              <td class="right">
                {{ row.txval }}
              </td>
              <td class="right">
                {{ row.iamt }}
              </td>
            </tr>
            <tr>
              <td><b> Supplies made to Composition Taxable Persons </b></td>
              <td colspan="3" />
            </tr>
            <tr
              v-for="(row, index) in gstData.inter_sup.comp_details"
              :key="`${index}-comp`"
            >
              <td />
              <td class="right">
                {{ stateIdToName[row.pos] }}
              </td>
              <td class="right">
                {{ row.txval }}
              </td>
              <td class="right">
                {{ row.iamt }}
              </td>
            </tr>
            <tr>
              <td><b> Supplies made to UIN holders </b></td>
              <td colspan="3" />
            </tr>
            <tr
              v-for="(row, index) in gstData.inter_sup.uin_details"
              :key="`${index}-uin`"
            >
              <td />
              <td class="right">
                {{ stateIdToName[row.pos] }}
              </td>
              <td class="right">
                {{ row.txval }}
              </td>
              <td class="right">
                {{ row.iamt }}
              </td>
            </tr>
          </tbody>
        </table>
      </b-overlay>

      <small> <b> 4. Eligible ITC </b> </small>
      <b-overlay :show="isLoading">
        <table
          class="table table-bordered table-striped table-sm table-border-dark small"
        >
          <thead>
            <tr>
              <th class="border-bottom-0">
                Details
              </th>
              <th class="border-bottom-0">
                Integrated Tax
              </th>
              <th class="border-bottom-0">
                Central Tax
              </th>
              <th class="border-bottom-0">
                State/UT tax
              </th>
              <th class="border-bottom-0">
                Cess
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <small>
                  <b> (A) ITC Available (whether in full or part) </b>
                </small>
              </td>
              <td />
              <td />
              <td />
              <td />
            </tr>
            <tr>
              <td>
                <b-button
                  variant="link"
                  size="sm"
                  class="p-0 text-left"
                  @click="openInvoicesTable('import_goods')"
                  v-if="options.invOptions['import_goods'].length"
                >
                  (1) Import of goods
                </b-button>
                <span v-else>
                  (1) Import of goods
                </span>
              </td>
              <td class="right">
                {{ gstData.itc_elg.itc_avl[0].iamt }}
              </td>
              <td class="right">
                {{ gstData.itc_elg.itc_avl[0].camt }}
              </td>
              <td class="right">
                {{ gstData.itc_elg.itc_avl[0].samt }}
              </td>
              <td class="right">
                {{ gstData.itc_elg.itc_avl[0].csamt }}
              </td>
            </tr>
            <tr>
              <td>
                <b-button
                  variant="link"
                  size="sm"
                  class="p-0 text-left"
                  @click="openInvoicesTable('import_service')"
                  v-if="options.invOptions['import_service'].length"
                >
                  (2) Import of services
                </b-button>
                <span v-else>
                  (2) Import of services
                </span>
              </td>
              <td class="right">
                {{ gstData.itc_elg.itc_avl[1].iamt }}
              </td>
              <td class="right">
                {{ gstData.itc_elg.itc_avl[1].camt }}
              </td>
              <td class="right">
                {{ gstData.itc_elg.itc_avl[1].samt }}
              </td>
              <td class="right">
                {{ gstData.itc_elg.itc_avl[1].csamt }}
              </td>
            </tr>
            <tr>
              <td>
                <b-button
                  variant="link"
                  size="sm"
                  class="p-0 text-left"
                  @click="openInvoicesTable('inward_reverse_charge')"
                  v-if="options.invOptions['inward_reverse_charge'].length"
                >
                  (3) Inward supplies liable to reverse charge (other than 1 & 2
                  above)
                </b-button>
                <span v-else>
                  (3) Inward supplies liable to reverse charge (other than 1 & 2
                  above)
                </span>
              </td>
              <td class="right">
                {{ gstData.itc_elg.itc_avl[2].iamt }}
              </td>
              <td class="right">
                {{ gstData.itc_elg.itc_avl[2].camt }}
              </td>
              <td class="right">
                {{ gstData.itc_elg.itc_avl[2].samt }}
              </td>
              <td class="right">
                {{ gstData.itc_elg.itc_avl[2].csamt }}
              </td>
            </tr>
            <tr>
              <td>
                <b-button
                  variant="link"
                  size="sm"
                  class="p-0 text-left"
                  @click="openInvoicesTable('inward_isd')"
                  v-if="options.invOptions['inward_isd'].length"
                >
                  (4) Inward supplies from ISD
                </b-button>
                <span v-else>
                  (4) Inward supplies from ISD
                </span>
              </td>
              <td class="right">
                {{ gstData.itc_elg.itc_avl[3].iamt }}
              </td>
              <td class="right">
                {{ gstData.itc_elg.itc_avl[3].camt }}
              </td>
              <td class="right">
                {{ gstData.itc_elg.itc_avl[3].samt }}
              </td>
              <td class="right">
                {{ gstData.itc_elg.itc_avl[3].csamt }}
              </td>
            </tr>
            <tr>
              <td>
                <b-button
                  variant="link"
                  size="sm"
                  class="p-0 text-left"
                  @click="openInvoicesTable('all_itc')"
                  v-if="options.invOptions['all_itc'].length"
                >
                  (5) All other ITC
                </b-button>
                <span v-else>
                  (5) All other ITC
                </span>
              </td>
              <td class="right">
                {{ gstData.itc_elg.itc_avl[4].iamt }}
              </td>
              <td class="right">
                {{ gstData.itc_elg.itc_avl[4].camt }}
              </td>
              <td class="right">
                {{ gstData.itc_elg.itc_avl[4].samt }}
              </td>
              <td class="right">
                {{ gstData.itc_elg.itc_avl[4].csamt }}
              </td>
            </tr>
            <tr>
              <td>
                <small> <b> (B) ITC Reversed </b> </small>
              </td>
              <td />
              <td />
              <td />
              <td />
            </tr>
            <tr>
              <td>
                <b-button
                  variant="link"
                  size="sm"
                  class="p-0 text-left"
                  @click="openInvoicesTable('itc_reversed_1')"
                  v-if="options.invOptions['itc_reversed_1'].length"
                >
                  (1) As per rules 42 & 43 of CGST Rules
                </b-button>
                <span v-else>
                  (1) As per rules 42 & 43 of CGST Rules
                </span>
              </td>
              <td class="right">
                {{ gstData.itc_elg.itc_rev[0].iamt }}
              </td>
              <td class="right">
                {{ gstData.itc_elg.itc_rev[0].camt }}
              </td>
              <td class="right">
                {{ gstData.itc_elg.itc_rev[0].samt }}
              </td>
              <td class="right">
                {{ gstData.itc_elg.itc_rev[0].csamt }}
              </td>
            </tr>
            <tr>
              <td>
                <b-button
                  variant="link"
                  size="sm"
                  class="p-0 text-left"
                  @click="openInvoicesTable('itc_reversed_2')"
                  v-if="options.invOptions['itc_reversed_2'].length"
                >
                  (2) Others
                </b-button>
                <span v-else>
                  (2) Others
                </span>
              </td>
              <td class="right">
                {{ gstData.itc_elg.itc_rev[1].iamt }}
              </td>
              <td class="right">
                {{ gstData.itc_elg.itc_rev[1].camt }}
              </td>
              <td class="right">
                {{ gstData.itc_elg.itc_rev[1].samt }}
              </td>
              <td class="right">
                {{ gstData.itc_elg.itc_rev[1].csamt }}
              </td>
            </tr>
            <tr>
              <td>
                <small> <b> (C) Net ITC Available(A) - (B) </b> </small>
              </td>
              <td class="right">
                {{ gstData.itc_elg.itc_net.iamt }}
              </td>
              <td class="right">
                {{ gstData.itc_elg.itc_net.camt }}
              </td>
              <td class="right">
                {{ gstData.itc_elg.itc_net.samt }}
              </td>
              <td class="right">
                {{ gstData.itc_elg.itc_net.csamt }}
              </td>
            </tr>
            <tr>
              <td>
                <small> <b> (D) Ineligible ITC </b> </small>
              </td>
              <td />
              <td />
              <td />
              <td />
            </tr>
            <tr>
              <td>
                <b-button
                  variant="link"
                  size="sm"
                  class="p-0 text-left"
                  @click="openInvoicesTable('ineligible_1')"
                  v-if="options.invOptions['ineligible_1'].length"
                >
                  (1) As per section 17(5)
                </b-button>
                <span v-else>
                  (1) As per section 17(5)
                </span>
              </td>
              <td class="right">
                {{ gstData.itc_elg.itc_inelg[0].iamt }}
              </td>
              <td class="right">
                {{ gstData.itc_elg.itc_inelg[0].camt }}
              </td>
              <td class="right">
                {{ gstData.itc_elg.itc_inelg[0].samt }}
              </td>
              <td class="right">
                {{ gstData.itc_elg.itc_inelg[0].csamt }}
              </td>
            </tr>
            <tr>
              <td>
                <b-button
                  variant="link"
                  size="sm"
                  class="p-0 text-left"
                  @click="openInvoicesTable('ineligible_2')"
                  v-if="options.invOptions['ineligible_2'].length"
                >
                  (2) Others
                </b-button>
                <span v-else>
                  (2) Others
                </span>
              </td>
              <td class="right">
                {{ gstData.itc_elg.itc_inelg[1].iamt }}
              </td>
              <td class="right">
                {{ gstData.itc_elg.itc_inelg[1].camt }}
              </td>
              <td class="right">
                {{ gstData.itc_elg.itc_inelg[1].samt }}
              </td>
              <td class="right">
                {{ gstData.itc_elg.itc_inelg[1].csamt }}
              </td>
            </tr>
          </tbody>
        </table>
      </b-overlay>

      <small>
        <b>
          5. Values of exempt, nil rated and non-GST inward supplies
        </b>
      </small>
      <b-overlay :show="isLoading">
        <table
          class="table table-bordered table-striped table-sm table-border-dark small"
        >
          <thead>
            <tr>
              <th class="border-bottom-0">
                Nature of Supplies
              </th>
              <th class="border-bottom-0">
                Inter-State Supplies
              </th>
              <th class="border-bottom-0">
                Intra-State Supplies
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <b-button
                  variant="link"
                  size="sm"
                  class="p-0 text-left"
                  @click="openInvoicesTable('inward_zero_gst')"
                  v-if="options.invOptions['inward_zero_gst'].length"
                >
                  From a supplier under composition scheme, Exempt and Nil rated
                </b-button>
                <span v-else>
                  From a supplier under composition scheme, Exempt and Nil rated
                </span>
              </td>
              <td class="right">
                {{ gstData.inward_sup.isup_details[0].inter }}
              </td>
              <td class="right">
                {{ gstData.inward_sup.isup_details[0].intra }}
              </td>
            </tr>
            <tr>
              <td>
                <b-button
                  variant="link"
                  size="sm"
                  class="p-0 text-left"
                  @click="openInvoicesTable('non_gst')"
                  v-if="options.invOptions['non_gst'].length"
                >
                  Non GST Inward Supplies
                </b-button>
                <span v-else>
                  Non GST Inward Supplies
                </span>
              </td>
              <td class="right">
                {{ gstData.inward_sup.isup_details[1].inter }}
              </td>
              <td class="right">
                {{ gstData.inward_sup.isup_details[1].intra }}
              </td>
            </tr>
          </tbody>
        </table>
      </b-overlay>

      <div>
        <small>
          <b>
            GSTR-3B JSON
          </b>
        </small>
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
            download="GSTR_3B.json"
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

      <!-- Invoices for each GST group listed above-->
      <b-modal
        v-model="showInvoices"
        body-class="p-0"
        id="business-item-modal"
        hide-footer
        :scrollable="true"
        :title="invTitle"
        content-class="modal-content text-small"
        centered
      >
        <div class="m-2">
          <b-form-input
            :placeholder="$gettext('Search Invoices')"
            size="sm"
            v-model="invTableSearch"
            type="text"
          />
        </div>
        <b-table
          head-variant="dark"
          small
          bordered
          striped
          :items="invList"
          responsive="sm"
          :busy="isLoading"
          :fields="invFields"
          :filter="invTableSearch"
          sticky-header="450px"
          sort-by="invoicedate"
          :sort-desc="true"
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
          <template #cell(index)="data">
            {{ data.index + 1 }}
          </template>
          <template #cell(invoiceno)="data">
            <router-link
              :to="'/workflow/Transactions-Invoice/' + data.item.invid"
            >
              {{ data.item.invoiceno }}
            </router-link>
          </template>
          <template #cell(grossamt)="data">
            <div class="text-right">
              {{ data.item.grossamt }}
            </div>
          </template>
        </b-table>
      </b-modal>
    </div>
  </section>
</template>

<script>
import { mapState } from 'vuex';
import axios from 'axios';
import GkFileDownload from '@/components/GkFileDownload.vue';
import GkPeriod from '@/components/GkPeriod.vue';
export default {
  components: { GkFileDownload, GkPeriod },
  name: '3B',
  data() {
    return {
      parentMessage: '',
      gstData: {
        gstin: '',
        ret_period: '',
        sup_details: {
          osup_zero: {},
          osup_nil_exmp: {},
          osup_nongst: {},
          osup_det: {},
          isup_rev: {},
        },
        inter_sup: { unreg_details: [], comp_details: [], uin_details: [] },
        itc_elg: {
          itc_avl: [{}, {}, {}, {}, {}],
          itc_net: {},
          itc_rev: [{}, {}],
          itc_inelg: [{}, {}],
        },
        inward_sup: {
          isup_details: [{}, {}],
        },
        intr_ltfee: {
          intr_details: {},
        },
      },
      taxGroup: '',
      showInvoices: false,
      fromDate: null,
      toDate: null,
      periodValidity: false,
      isLoading: false,
      state: '',
      search: '',
      invTableSearch: '',
      report: {
        data: null,
        selected: '',
        summary: null,
      },
      dateValidity: {
        from: true,
        to: true,
      },
      orgGstin: '',
      spreadSheetName: '',
      options: {
        invoices: {},
        stateIdToName: {},
        invOptions: {
          outward_taxable_supplies: {
            title:
              '(a) Outward taxable supplies(other than zero rated, nil rated and exempted)',
            fields: [
              { key: 'index', label: 'No' },
              { key: 'invoiceno', label: 'Inv No' },
              {
                key: 'invoicedate',
                label: 'Date',
                thStyle: 'width: 175px',
                tdClass: 'text-truncate',
              },
              // {key: "custname", label: 'Customer'},
              { key: 'netamt', label: 'Taxable Value' },
              { key: 'taxamt', label: 'Integrated Tax' },
              // { key: 'grossamt', label: 'Inv Amt' },
            ],
            length: 0,
          },
          outward_taxable_zero_rated: {
            title: '(b) Outward taxable supplies(zero rated)',
            fields: [],
            length: 0,
          },
          outward_taxable_exempted: {
            title: '(c) Other outward supplies(Nil rated,Exempted)',
            fields: [],
            length: 0,
          },
          outward_non_gst: {
            title: '(e) Non-GST outward supplies',
            fields: [],
            length: 0,
          },
          inward_reverse_charge: {
            title: 'Inward Supplies(liable to reverse charge)',
            fields: [],
            length: 0,
          },
          import_goods: {
            title:
              '(A) ITC Available (whether in full or part) (1) Import of goods',
            fields: [],
            length: 0,
          },
          import_service: {
            title:
              '(A) ITC Available (whether in full or part) (2) Import of services',
            fields: [],
            length: 0,
          },
          inward_isd: {
            title:
              '(A) ITC Available (whether in full or part) (4) Inward supplies from ISD',
            fields: [],
            length: 0,
          },
          all_itc: {
            title:
              '(A) ITC Available (whether in full or part) (5) All other ITC',
            fields: [],
            length: 0,
          },
          net_itc: {
            title: '',
            fields: [],
            length: 0,
          },
          itc_reversed_1: {
            title: '(B) ITC Reversed (1) As per rules 42 & 43 of CGST Rules',
            fields: [],
            length: 0,
          },
          itc_reversed_2: {
            title: '(B) ITC Reversed (2) Others',
            fields: [],
            length: 0,
          },
          ineligible_1: {
            title: '(D) Ineligible ITC (1) As per section 17(5)',
            fields: [],
            length: 0,
          },
          ineligible_2: {
            title: '(D) Ineligible ITC (2) Others',
            fields: [],
            length: 0,
          },
          inward_zero_gst: {
            title:
              '5. Values of exempt, nil rated and non-GST inward supplies. From a supplier under composition scheme, Exempt and Nil rated',
            fields: [],
            length: 0,
          },
          non_gst: {
            title:
              '5. Values of exempt, nil rated and non-GST inward supplies. Non GST Inward Supplies',
            fields: [],
            length: 0,
          },
          interest: {
            title: '',
            fields: [],
            length: 0,
          },
          pos_unreg_comp_uin_igst: {
            unreg: {
              title: {},
              fields: [],
              length: {},
            },
            compos: {
              title: {},
              fields: [],
              length: {},
            },
            uin: {
              title: {},
              fields: [],
              length: {},
            },
            stateCode: '',
            type: '',
          },
        },
      },
    };
  },
  computed: {
    invTitle: function() {
      let title = '';
      if (this.taxGroup) {
        if (this.taxGroup === 'pos_unreg_comp_uin_igst') {
          let options = this.options.invOptions[this.taxGroup];
          title = this.options.invOptions[this.taxGroup][options.type].title[
            options.stateCode
          ];
        } else {
          title = this.options.invOptions[this.taxGroup].title;
        }
      }
      return title;
    },
    invFields: function() {
      let fields = [
        { key: 'index', label: 'No' },
        { key: 'invoiceno', label: 'Inv No', sortable: true },
        {
          key: 'invoicedate',
          label: 'Date',
          thStyle: 'max-width: 100px',
          tdClass: 'text-truncate',
          sortable: true,
        },
        // {key: "custname", label: 'Customer'},
        { key: 'netamt', label: 'Taxable Value', sortable: true },
        { key: 'taxamt', label: 'Integrated Tax', sortable: true },
        // { key: 'grossamt', label: 'Inv Total' },
      ];
      // if (this.taxGroup) {
      //   this.options.invOptions[this.taxGroup].fields;
      // }
      return fields;
    },
    invList: function() {
      const invoices = this.options.invoices;
      let list = [];
      switch (this.taxGroup) {
      case 'pos_unreg_comp_uin_igst':
        {
          let options = this.options.invOptions.pos_unreg_comp_uin_igst;
          list =
            invoices.pos_unreg_comp_uin_igst[options.type][options.stateCode];
        }
        break;
      default:
        list =
          invoices[this.taxGroup] && invoices[this.taxGroup].length
            ? invoices[this.taxGroup]
            : [];
      }
      return list;
    },
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
    datesValid: (self) => self.dateValidity.from && self.dateValidity.to,
    spreadSheetUrl: (self) => {
      return `/spreadsheet?type=gstr3b&calculateto=${self.toDate}&calculatefrom=${self.fromDate}&gstin=${self.orgGstin}&orgname=${self.orgName}`;
    },
    ...mapState(['yearStart', 'yearEnd', 'orgName']),
  },
  methods: {
    copyJsonToClipboard() {
      navigator.clipboard.writeText(this.jsonStr);
      this.$bvToast.show('clipboard-toast');
    },
    openInvoicesTable(taxGroup, stateCode, type) {
      this.taxGroup = taxGroup;
      this.showInvoices = true;
      if (stateCode && type) {
        Object.assign(this.options.invOptions.pos_unreg_comp_uin_igst, {
          stateCode,
          type,
        });
      }
    },
    updateValidity(validity) {
      this.periodValidity = validity;
    },
    onPeriodUpdate(period) {
      this.fromDate = period.from || null;
      this.toDate = period.to || null;
    },
    resetJson() {
      this.gstData = {
        gstin: '',
        ret_period: '',
        sup_details: {
          osup_zero: {},
          osup_nil_exmp: {},
          osup_nongst: {},
          osup_det: {},
          isup_rev: {},
        },
        inter_sup: { unreg_details: [], comp_details: [], uin_details: [] },
        itc_elg: {
          itc_avl: [{}, {}, {}, {}, {}],
          itc_net: {},
          itc_rev: [{}, {}],
          itc_inelg: [{}, {}],
        },
        inward_sup: {
          isup_details: [{}, {}],
        },
        intr_ltfee: {
          intr_details: {},
        },
      };
    },
    updateDateValidity(validity, key) {
      if (validity === null) {
        validity = true;
      }
      this.dateValidity[key] = validity;
    },
    getGst3rbJson() {
      this.isLoading = true;
      this.resetJson();
      const self = this;
      axios
        .get(
          `/gst/returns/3b?calculateto=${this.toDate}&calculatefrom=${this.fromDate}&gstin=${this.orgGstin}`
        )
        .then((resp) => {
          self.isLoading = false;
          if (resp.data.gkstatus === 0) {
            let result = resp.data.gkresult;
            self.gstData = result.json;
            self.options.invoices = result.invoice;
            let keys = Object.keys(self.options.invoices);
            keys.forEach((key) => {
              if (key === 'pos_unreg_comp_uin_igst') {
                // Unregistered
                let stateCodes = Object.keys(
                  self.options.invoices[key]['unreg']
                );
                self.options.invOptions[key]['unreg'].length = {};
                self.options.invOptions[key]['unreg'].title = {};
                stateCodes.forEach((state) => {
                  self.options.invOptions[key]['unreg'].length[state] =
                    self.options.invoices[key]['unreg'][state].length;
                  self.options.invOptions[key]['unreg'].title[
                    state
                  ] = `Supplies made to Unregistered Persons (${self.stateIdToName[state]})`;
                });

                // TODO: composition and uin
              } else {
                self.options.invOptions[key].length =
                  self.options.invoices[key].length;
              }
            });
          }
        })
        .catch(() => {
          this.isLoading = false;
        });
    },
    getOrgDetails() {
      return Promise.all([
        axios.get('/state'),
        axios.get('/organisation'),
      ]).then((resp) => {
        let stateMap = {}; // name to id
        let stateIdToName = {};
        if (resp[0].data.gkstatus === 0) {
          resp[0].data.gkresult.forEach((state) => {
            let name = Object.values(state)[0],
                id = Object.keys(state)[0];
            stateMap[name] = id;
            stateIdToName[id] = `${name} (${id})`;
          });

          this.stateIdToName = stateIdToName;
        }

        if (resp[1].data.gkstatus === 0) {
          let data = resp[1].data.gkdata;
          let stateCode = stateMap[data.orgstate]
            ? stateMap[data.orgstate]
            : Object.keys(data.gstin)[0];
          if (stateCode < 10) {
            stateCode = `0${parseInt(stateCode)}`;
          }
          let gstin;
          if (data.gstin) {
            gstin = stateCode ? data.gstin[stateCode] : '';
          }
          this.orgGstin = gstin || '';
        }
      });
    },
    showSummary() {
      this.$router.push(
        `/gst/3b/from=${this.fromDate}&to=${this.toDate}&state=${this.state}`
      );
    },
  },
  mounted() {
    // this.fromDate = this.yearStart;
    // this.toDate = this.yearEnd;
    this.getOrgDetails().then(() => {
      this.getGst3rbJson();
    });
  },
};
</script>

<style>
.print-format {
  padding: 15mm;
  font-size: 8pt !important;
  font-family: Tahoma, sans-serif;
}
.disabled {
  background-color: #d9d9d9;
}
.right {
  text-align: right;
}

#textarea {
  font-size: 0.8em;
}

.modal-content {
  /* height: 550px; */
}
.modal-backdrop {
  height: 100%;
  width: 100%;
}
</style>
