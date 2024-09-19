<template>
  <section class="container-fluid mt-2">
    <b-overlay :show="isPreloading" variant="secondary" no-wrap blur>
    </b-overlay>
    <b-container fluid v-if="activeWorkflow.index === null">
      <b-card-group role="tab" deck class="mt-5">
        <b-card
          tabindex="0"
          v-for="(tab, tabName, index) in options.tabs"
          v-on:keyup.enter="setActiveWorkflow(index, tabName, tab.icon)"
          :key="index"
          @click.prevent="setActiveWorkflow(index, tabName, tab.icon)"
          class="text-center"
          footer-text-variant="white"
          footer-tag="footer"
          :footer-bg-variant="tab.color"
          :border-variant="tab.color"
          style="width: 20em"
        >
          <b-card-text>
            <b-icon
              scale="4"
              :variant="tab.color"
              class="mt-4"
              :icon="tab.icon"
            ></b-icon>
          </b-card-text>
          <b-card-text class="mt-4">{{ tabName }}</b-card-text>
        </b-card>
      </b-card-group>
    </b-container>
    <b-row v-else no-gutters>
      <!-- Left Pane: Workflow Selection & Corresponding Data list -->
      <b-col
        cols="12"
        md="4"
        lg="3"
        ref="col-left"
        class="d-none d-md-block d-block"
      >
        <b-card no-body>
          <b-overlay :show="isLoading" blur no-wrap rounded="lg"></b-overlay>
          <!-- Workflow Selection & Filter -->
          <b-card-header ref="leftHeader" class="px-2">
            <!-- Drop down 1: Worflow selection -->
            <b-dropdown
              :variant="activeWorkflow.color"
              class="mr-3"
              dropright
              @hide="onDropdownHide"
              id="main-menu"
              ref="mainMenu"
            >
              <template #button-content>
                <div
                  class="d-inline-block text-truncate float-left mr-1"
                  style="max-width: 150px"
                >
                  <b-icon :icon="activeWorkflow.icon"></b-icon>
                  {{
                    activeWorkflow.name.includes('-')
                      ? activeWorkflow.tabName
                      : activeWorkflow.name
                  }}
                </div>
              </template>
              <b-dropdown-item
                v-for="(tab, tabName, index1) in options.tabs"
                :key="index1"
                @click.prevent="setActiveWorkflow(index1, tabName, tab.icon)"
                :link-class="{ 'p-0': tab.tabs }"
              >
                <!-- Option with Sub Menu -->
                <b-dropdown
                  v-if="tab.tabs"
                  id="sub-menu"
                  @show="onDropdownShow"
                  @hide="onDropdownHide"
                  variant="outline"
                  :toggle-class="['border-0', 'p-0']"
                  style="width: 100%"
                  class=""
                  dropleft
                  no-flip
                >
                  <template #button-content>
                    <b-icon :icon="tab.icon"></b-icon> {{ tabName }}
                  </template>
                  <b-dropdown-item
                    v-for="(tab2, tabName2, index2) in tab.tabs"
                    :key="index2"
                    @click.prevent="
                      setActiveWorkflow(
                        index2,
                        { parent: tabName, child: tabName2 },
                        tab2.icon
                      )
                    "
                  >
                    <b-icon :icon="tab2.icon"></b-icon> {{ tabName2 }}
                  </b-dropdown-item>
                </b-dropdown>
                <!-- Option without Sub Menu -->
                <span v-else>
                  <b-icon :icon="tab.icon"></b-icon> {{ tabName }}
                </span>
              </b-dropdown-item>
            </b-dropdown>
            <!-- Drop down 2: Filter -->
            <b-button
              class="px-1 float-right text-dark"
              variant="link"
              @click="isOptionsOpen = !isOptionsOpen; isSettingsOpen = false; isFilterOpen = false;"
              size="sm"
              title="Options"
            >
              <b-icon
                class="align-middle"
                :font-scale="1"
                icon="three-dots-vertical"
              ></b-icon
              ><span class="sr-only">Options</span>
            </b-button>
            <b-collapse v-model="isOptionsOpen">
              <b-button-group
                class="float-right"
                :class="{ 'mt-2': isOptionsOpen }"
              >
                <b-button
                  class="px-1"
                  variant="outline-dark"
                  @click="isFilterOpen = !isFilterOpen; isSettingsOpen = false"
                  title="Filters"
                >
                  <b-icon
                    class="align-middle"
                    :font-scale="1"
                    icon="funnel"
                  ></b-icon
                  ><span class="sr-only">Filter</span>
                </b-button>
                <print-helper
                  class="px-md-1 px-2"
                  :contentId="`list-${activeWorkflow.tabName}`"
                  :fontScale="1"
                  iconName="file-earmark-arrow-down"
                  variant="outline-dark"
                  :fileName="fileName.list"
                  :toggleFlag="toggleFlag"
                  title="Download Pdf"
                  :messageFromParent="parentMessage"
                ></print-helper>
                <!-- product / service spreadsheet -->
                <gk-file-download
                  variant="outline-dark"
                  v-if="activeWorkflow.name === 'Business'"
                  file-suffix="ProductServiceList"
                  class="px-1"
                  :font-scale="1"
                  :url="
                    `/spreadsheet?pslist&fystart=${this.yearStart}&fyend=${this.yearEnd}&orgname=${this.orgName}`
                  "
                  title="Download Product Service List"
                  :toggleFlag="toggleFlag"
                  :messageFromParent="parentMessage"
                ></gk-file-download>
                <!-- Invoice spreadsheet -->
                <gk-file-download
                  variant="outline-dark"
                  v-if="
                    activeWorkflow.name == 'Transactions-Invoice' &&
                      filters.active.length == 1 &&
                      filters.active[0] == 0
                  "
                  file-suffix="InvoiceList"
                  class="px-1"
                  :font-scale="1"
                  :url="
                    `/spreadsheet?invoice-list&fystart=${this.yearStart}&fyend=${this.yearEnd}&orgname=${this.orgName}&fromdate=${this.filters.range.from}&todate=${this.filters.range.to}&flag=0&type=invoice_list`
                  "
                  title="Download All Invoice List"
                  :toggleFlag="toggleFlag"
                  :messageFromParent="parentMessage"
                ></gk-file-download>
                <!-- Cancelled Invoice spreadsheet -->
                <gk-file-download
                  variant="outline-dark"
                  v-if="
                    activeWorkflow.name == 'Transactions-Invoice' &&
                      filters.active.length == 1 &&
                      filters.active[0] == 3
                  "
                  file-suffix="CancelledInvoiceList"
                  class="px-1"
                  :font-scale="1"
                  :url="
                    `/spreadsheet?invoice-cancelled&fystart=${this.yearStart}&fyend=${this.yearEnd}&orgname=${this.orgName}&fromdate=${this.filters.range.from}&todate=${this.filters.range.to}&flag=0&type=invoice_list`
                  "
                  title="Download Cancelled Invoice Spreadsheet"
                   :toggleFlag="toggleFlag"
                  :messageFromParent="parentMessage"
                ></gk-file-download>
                <!-- Credit Invoice Spreadsheet -->
                <gk-file-download
                  variant="outline-dark"
                  v-if="
                    activeWorkflow.name == 'Transactions-Invoice' &&
                      filters.active.length == 1 &&
                      filters.active[0] == 4
                  "
                  file-suffix="CreditInvoiceList"
                  class="px-1"
                  title="Download Credit Invoice Spreadsheet"
                  :font-scale="1"
                  :url="
                    `/spreadsheet?invoice-outstanding&fromdate=${dateReverse(
                      this.filters.range.from
                    )}&todate=${dateReverse(
                      this.filters.range.to
                    )}&inoutflag=15&orderflag=1&typeflag=4`
                  "
                  :toggleFlag="toggleFlag"
                  :messageFromParent="parentMessage"
                ></gk-file-download>
                <!-- Transfer Note Spreadsheet -->
                <gk-file-download
                  variant="outline-dark"
                  v-if="activeWorkflow.name == 'Transactions-TransferNote'"
                  file-suffix="TransferNoteList"
                  class="px-1"
                  :font-scale="1"
                  :url="
                    `/spreadsheet?transfer-notes&startdate=${this.dateReverse(
                      this.filters.range.from
                    )}&enddate=${this.dateReverse(this.filters.range.to)}`
                  "
                  title="Download Transfer Notes Spreadsheet"
                  :toggleFlag="toggleFlag"
                  :messageFromParent="parentMessage"
                ></gk-file-download>
                <!-- Unbilled Delivery Note Spreadsheet -->
                <gk-file-download
                  variant="outline-dark"
                  v-if="
                    activeWorkflow.name == 'Transactions-DeliveryNote' &&
                      filters.active.length == 1 &&
                      filters.active[0] == 4
                  "
                  file-suffix="UnbilledDeliveryNote"
                  class="px-1"
                  title="Download Unbilled Delivery Note Spreadsheet"
                  :font-scale="1"
                  :url="
                    `/spreadsheet?delivery-challan-unbilled&inputdate=${this.filters.range.to}&inout=9&del_unbilled_type=All`
                  "
                  :toggleFlag="toggleFlag"
                  :messageFromParent="parentMessage"
                ></gk-file-download>
                <!-- Cancelled Delivery Note Spreadsheet -->
                <gk-file-download
                  variant="outline-dark"
                  v-if="
                    activeWorkflow.name == 'Transactions-DeliveryNote' &&
                      filters.active.length == 1 &&
                      filters.active[0] == 3
                  "
                  file-suffix="CancelledDeliveryNote"
                  class="px-1"
                  title="Download Cancelled Delivery Note Spreadsheet"
                  :font-scale="1"
                  :url="
                    `/spreadsheet?delivery-challan-cancelled&inputdate=${this.filters.range.to}&inout=15&del_cancelled_type=All`
                  "
                  :toggleFlag="toggleFlag"
                  :messageFromParent="parentMessage"
                ></gk-file-download>
                <!-- Column settings -->
                <b-button
                  class="px-1"
                  variant="outline-dark"
                  @click="isSettingsOpen = !isSettingsOpen; isFilterOpen = false"
                  title="Column Settings"
                >
                  <b-icon
                    class="align-middle"
                    :font-scale="1"
                    icon="gear"
                  ></b-icon
                  ><span class="sr-only">Column Settings</span>
                </b-button>
              </b-button-group>
            </b-collapse>
            <!-- Table Column Chooser -->
            <b-collapse v-model="isSettingsOpen">
              <b-card
                no-body
                class="float-right w-100 mt-2"
                :style="{
                  'max-width': '450px',
                }"
                id="list-settings"
              >
                <b-card-body class="p-2">
                  <b v-translate> List Settings </b>
                  <hr class="mx-0 my-1" />
                  <div class="container">
                    <b-row>
                      <b-col class="px-1">
                        <b-form-select
                          v-model="listSettings.columns[0]"
                          text-field="label"
                          :options="activeTabOptions.options.columns"
                          placeholder="Column 1"
                        ></b-form-select>
                      </b-col>
                      <b-col class="px-0">
                        <b-form-select
                          v-model="listSettings.columns[1]"
                          text-field="label"
                          :options="activeTabOptions.options.columns"
                          placeholder="Column 2"
                        >
                        </b-form-select>
                      </b-col>
                      <b-col class="px-1">
                        <b-form-select
                          v-model="listSettings.columns[2]"
                          text-field="label"
                          :options="activeTabOptions.options.columns"
                          placeholder="Column 3"
                        >
                        </b-form-select>
                      </b-col>
                    </b-row>
                  </div>
                  <b-button
                    class="float-right px-1 mt-2"
                    size="sm"
                    variant="success"
                    @click.prevent="updateListSettings"
                  >
                    <translate> Save </translate>
                  </b-button>
                </b-card-body>
              </b-card>
            </b-collapse>
            <!-- Filter menu Collapsable card -->
            <b-collapse v-model="isFilterOpen">
              <b-card
                no-body
                class="float-right w-100 mt-2"
                :style="{
                  'max-width': '450px',
                }"
                id="list-filter"
              >
                <b-card-body class="p-2">
                  <b v-translate> Filter By </b>
                  <hr class="mx-0 my-1" />
                  <div class="my-2 ml-1">
                  <b-form-checkbox
                    v-model="allSelected"
                    aria-describedby="flavours"
                    aria-controls="flavours"
                    @change="toggleAll"
                  >
                    All
                  </b-form-checkbox>
                    <b-form-checkbox-group
                      id="checkbox-group-2"
                      v-model="filters.active"
                      name="flavour-2"
                    >
                      <b-form-checkbox
                        v-for="(filter, findex) in activeTabOptions.filterBy
                          .value"
                        :key="findex"
                        :value="findex"
                      >
                        <b-icon
                          v-if="filter.icon"
                          font-scale="0.75"
                          :variant="
                            filter.icon.variant ? filter.icon.variant : ''
                          "
                          :icon="filter.icon.name"
                          class="mr-1"
                        ></b-icon>
                        {{ filter.text }}
                      </b-form-checkbox>
                    </b-form-checkbox-group>
                    <b-button
                      @click="resetFilter"
                      title="Reset Filter"
                      class="py-0 px-1"
                      size="sm"
                      variant="primary"
                    >
                      <b-icon icon="arrow-clockwise"></b-icon>
                    </b-button>
                  </div>
                  <b-form-group
                    label="Date Range"
                    label-size="sm"
                    v-if="activeTabOptions.filterBy.range.length"
                  >
                    <div class="px-3">
                      <b-row>
                        <b-col class="px-1">
                          <b-input-group>
                            <b-form-input
                              class="px-1"
                              size="sm"
                              v-model="filters.range.from"
                              type="text"
                              placeholder="YYYY-MM-DD"
                              autocomplete="off"
                            ></b-form-input>
                            <b-input-group-append>
                              <b-form-datepicker
                                button-only
                                v-model="filters.range.from"
                                size="sm"
                                right
                                :min="yearStart"
                                :max="yearEnd"
                                locale="en-IN"
                              ></b-form-datepicker>
                            </b-input-group-append>
                          </b-input-group>
                        </b-col>
                        <b-col class="px-1">
                          <b-input-group>
                            <b-form-input
                              class="px-1"
                              size="sm"
                              v-model="filters.range.to"
                              type="text"
                              placeholder="YYYY-MM-DD"
                              autocomplete="off"
                            ></b-form-input>
                            <b-input-group-append>
                              <b-form-datepicker
                                button-only
                                v-model="filters.range.to"
                                size="sm"
                                right
                                :min="filters.range.from"
                                :max="yearEnd"
                                locale="en-IN"
                              ></b-form-datepicker>
                            </b-input-group-append>
                          </b-input-group>
                        </b-col>
                      </b-row>
                    </div>
                  </b-form-group>
                </b-card-body>
              </b-card>
            </b-collapse>
          </b-card-header>
          <!-- Worflow Data List -->

          <!-- Workflow Data List Start -->
          <div
            v-for="(tab, tabName) in allTabs"
            :key="tabName"
            :class="{ 'd-none': activeWorkflow.tabName !== tabName }"
          >
            <b-table
              striped
              small
              head-variant="dark"
              class="text-small print-table-border-dark"
              tbody-tr-class="bs-row"
              responsive=""
              fixed
              :sticky-header="`${listHeight}px`"
              :fields="activeTabOptions.fields"
              :items="activeTabOptions.data"
              :style="{ 'min-height': `${listHeight}px` }"
              selectable
              select-mode="single"
              @row-selected="setSelectedEntity"
              :ref="`list-${tabName}`"
              :id="`list-${tabName}`"
              :filter="
                activeTabOptions.data.length &&
                activeWorkflow.tabName === tabName
                  ? 'a'
                  : null
              "
              :filter-function="filterTable"
              sort-by="dateObj"
              :sort-desc="true"
            >
              <template #cell(dateObj)="data"> {{ data.item.date }} </template>
            </b-table>

            <!-- Add New Workflow Data Item -->
            <span v-if="tab.createNewPath?.name !== 'Delivery_Note'">
              <b-button
              :to="tab.createNewPath"
              class="btn shadow position-absolute"
              :style="{ bottom: '30px', right: '30px', zIndex: 2 }"
              id="add-item"
              >
                <b-icon icon="plus-circle"></b-icon>
              </b-button>
            </span>
          </div>
          <!-- Workflow Data List End -->
        </b-card>
      </b-col>
      <!-- Right Pane: Selected Workflow item's Data  -->
      <b-col cols="12" md="8" lg="9" ref="col-right" class="d-none d-md-block">
        <!-- Customer / Supplier profile -->
        <b-card
          no-body
          border-variant="dark"
          :style="{ height: '100%', overflowY: 'auto' }"
          class="ml-md-2 border-0"
          v-if="
            selectedEntity &&
              !selectedEntity.gsflag &&
              activeWorkflow.name === 'Contacts'
          "
        >
          <template #header v-if="selectedEntity !== null">
            <b-button @click.prevent="unsetSelectedEntity" class="d-md-none"
              ><b-icon icon="arrow-left"></b-icon
            ></b-button>
            <h5 class="m-2 d-inline-block">
              <b-icon class="mr-1" :icon="selectedEntity.icon"></b-icon>
              {{ selectedEntity.custname }}'s Profile
            </h5>
          </template>
          <b-card-body
            class="p-0"
            :style="{ height: rightPaneHeight + 'px', overflowY: 'auto' }"
            v-if="selectedEntity !== null"
          >
            <contact-profile
              :customer="selectedEntity"
              :key="selectedEntity.custid"
              :onUpdate="onSelectedEntityUpdate"
            ></contact-profile>
          </b-card-body>
        </b-card>
        <!-- Goods / Services Profile -->
        <b-card
          no-body
          border-variant="dark"
          :style="{ height: '100%', overflowY: 'auto' }"
          class="ml-md-2 border-0"
          v-if="
            selectedEntity &&
              selectedEntity.gsflag &&
              activeWorkflow.name === 'Business'
          "
        >
          <template #header v-if="selectedEntity !== null">
            <b-button @click.prevent="unsetSelectedEntity" class="d-md-none"
              ><b-icon icon="arrow-left"></b-icon
            ></b-button>
            <h5 class="m-2 d-inline-block">
              <b-icon class="mr-1" :icon="selectedEntity.icon"></b-icon>
              {{ selectedEntity.productdesc }} Details
            </h5>
          </template>
          <b-card-body
            class="p-0"
            :style="{ height: rightPaneHeight + 'px', overflowY: 'auto' }"
            v-if="selectedEntity !== null"
          >
            <business-profile
              :name="selectedEntity"
              :key="selectedEntity.srno"
              :onUpdate="onSelectedEntityUpdate"
            ></business-profile>
          </b-card-body>
        </b-card>
        <!-- Invoices Profile -->
        <b-card
          no-body
          class="ml-md-2"
          v-if="
            selectedEntity &&
              selectedEntity.id &&
              activeWorkflow.name.includes('Transactions')
          "
          header-class="p-2 d-flex align-items-center justify-content-between"
        >
          <template #header v-if="selectedEntity !== null">
            <b-button
              @click.prevent="unsetSelectedEntity"
              class="d-md-none float-left"
              size="sm"
              ><b-icon icon="arrow-left"></b-icon
            ></b-button>
            <h5 class="ml-3 mb-0">
              <b-icon class="mr-1" :icon="selectedEntity.icon"></b-icon>
              {{ selectedEntity.noteName }} :
              <br class="d-none d-lg-inline-block" />
              {{ selectedEntity.no }}
            </h5>
            <div v-if="usePrintTriplicate">
              <b-button
                class="float-right"
                v-b-toggle.p-collapse
                size="sm"
                variant="link"
              >
                <b-icon
                  aria-hidden="true"
                  class="align-middle"
                  icon="printer"
                ></b-icon>
                <span class="sr-only">Print</span>
              </b-button>
              <div class="clearfix"></div>
              <b-collapse id="p-collapse">
                <print-helper
                  contentId="transaction-profile-wrapper"
                  variant="link"
                  textMode="Original"
                  :pageTitle="getInvoiceTitle('orginal')"
                  fileName="Tax_Invoice_For_Recipient"
                  :messageFromParent="printMessage"
                ></print-helper>
                <print-helper
                  contentId="transaction-profile-wrapper"
                  variant="link"
                  textMode="Duplicate"
                  :pageTitle="getInvoiceTitle('duplicate')"
                  fileName="Tax_Invoice_For_Transporter"
                  :messageFromParent="printMessage"
                ></print-helper>
                <print-helper
                  contentId="transaction-profile-wrapper"
                  variant="link"
                  textMode="Triplicate"
                  :pageTitle="getInvoiceTitle('triplicate')"
                  fileName="Tax_Invoice_For_Supplier"
                  :messageFromParent="printMessage"
                ></print-helper>
              </b-collapse>
            </div>
            <print-helper
              v-else
              contentId="transaction-profile-wrapper"
              variant="link"
              :pageTitle="selectedEntity.noteName"
              :fileName="selectedEntity.noteName"
              :messageFromParent="printMessage"
            ></print-helper>
          </template>
          <b-card-body
            class="px-0"
            :style="{ height: rightPaneHeight + 'px', overflowY: 'auto' }"
            v-if="selectedEntity !== null"
          >
            <div id="transaction-profile-wrapper">
              <report-header class="mb-4"> </report-header>
              <transaction-profile
                :name="activeWorkflow.tabName"
                :id="selectedEntity.id"
                :pdata="profileData"
                :onUpdate="onSelectedEntityUpdate"
              >
              </transaction-profile>
            </div>
          </b-card-body>
        </b-card>
        <!-- Body -->
        <!-- <div :style="{ height: listHeight + 'px', overflowY: 'auto' }"></div> -->
      </b-col>
    </b-row>
  </section>
</template>

<script>
import axios from 'axios';
import { mapGetters, mapState } from 'vuex';

import ContactConf from '../js/config/workflow/contacts.js';
import BusinessConf from '../js/config/workflow/business.js';
import TransactionConf from '../js/config/workflow/transactions.js';

import ContactProfile from '@/components/ContactProfile';
import BusinessProfile from '@/components/BusinessProfile.vue';
import TransactionProfile from '@/components/workflow/profile/Transaction.vue';
import ReportHeader from '@/components/ReportHeader.vue';
import PrintHelper from '@/components/PrintHelper.vue';

import GkFileDownload from '@/components/GkFileDownload.vue';

export default {
  name: 'Workflow',
  components: {
    ContactProfile,
    BusinessProfile,
    TransactionProfile,
    ReportHeader,
    PrintHelper,
    GkFileDownload,
  },
  props: {
    wfName: {
      type: String,
      validator: function(value) {
        return (
          [
            'Contacts',
            'Business',
            'Reports',
            'Transactions-Invoice',
            'Transactions-DebitCreditNote',
            'Transactions-CashMemo',
            'Transactions-DeliveryNote',
            'Transactions-PurchaseSalesOrder',
            'Transactions-RejectionNote',
            'Transactions-TransferNote',
            'Transactions-Voucher',
          ].indexOf(value) !== -1
        );
      },
      required: true,
    },
    wfId: {
      type: [Number, String],
      required: true,
      default: null,
      validator: function() {
        // console.log(value)
        return true;
      },
    },
  },
  data() {
    return {
      allSelected: false,
      parentMessage: 'toggleFlagTrue',
      printMessage: 'toggleFlagPrintTrue',
      leftHeaderHeight: {
        min: 63,
        max: 0,
      },
      listHeight: 0,
      tabChoice: 0,
      isPreloading: false,
      isLoading: false,
      isSubMenuOpen: false,
      isOptionsOpen: false,
      activeWorkflow: {
        index: null,
        icon: '',
        name: '',
        id: -1,
      },
      customerList: [],
      supplierList: [],
      products: [],
      services: [],
      isPageFresh: true,
      isFilterOpen: false,
      isSettingsOpen: false,
      listSettings: {
        columns: [null, null, null],
      },
      selectedEntity: null,
      selectedEntityIndex: 0,
      filters: {
        active: [],
        range: {
          props: {},
          from: null,
          to: null,
        },
        isActive: false,
      },
      sort: {
        props: {},
        isAscending: true,
      },
      options: {
        /**
         * tabs: Contains the meta data based on which the left and right pane are rendered.
         *       Contains different workflow items, their data list, filter options, sortBy options, etc
         *
         * Explanation for the fields:
         * icon             ->  icon associated with the workflow, used in workflow cards and dropdown
         * color            ->  the color associated with the workflow, used in workflow cards and dropdown
         * data             ->  the list of data associated with the workflow, listed in the left pane
         * createNewPath    ->  the vue router path object for creating a new workflow item
         * filters          ->  array of filter options, can be found by clicking the funnel icon in the left pane
         * sortBy           ->  array of sorting options, can be found in the left pane just above the data list cards
         */
        tabs: {
          Contacts: ContactConf,
          Business: BusinessConf,
          Transactions: TransactionConf,
        }, // Reports: {
        //   icon: 'journals',
        //   color: 'danger',
        //   data: [],
        //   key: '',
        //   uidKey: '',
        //   filterBy: {
        //     value: [],
        //     range: [],
        //   },
        //   fields: [],
        //   initListColumns: () => {},
        //   loadList: async () => {
        //     return new Promise((resolve) => {
        //       resolve();
        //     }).then(() => {
        //       return [];
        //     });
        //   },
        // },
      },
    };
  },
  watch: {
   'filters.active': {
      handler() {
        this.updateIndeterminate();
      },
      deep: true,
    },
    wfName: function(wfname) {
      // Run when visiting a workflow page using URL, when already in a workflow page
      if (this.activeWorkflow.name !== wfname) {
        this.autoSetActiveWorkflow();
      }
    },
    isFilterOpen: function(isOpen) {
      let self = this;
      window.setTimeout(() => {
        if (isOpen) {
          if (self.leftHeaderHeight.max === 0) {
            self.leftHeaderHeight.max = self.$refs.leftHeader.offsetHeight;
          }
        } else {
          self.leftHeaderHeight.max = 0;
        }
        // this.updateListHeight();
      }, 650);
    },
  },
  computed: {
    ...mapGetters('global', ['isIndia', 'isGstEnabled', 'isVatEnabled']),
    invoiceTitleText: (self) => (
      (self.isGstEnabled || self.isVatEnabled)
      ? 'Tax Invoice'
      : 'Invoice'
    ),
    usePrintTriplicate: (self) =>
      ['Invoice', 'CashMemo', 'DeliveryNote'].indexOf(
        self.activeWorkflow.tabName
      ) > -1,
    fileName: (self) => {
      return {
        list: `${self.activeWorkflow.name}-List`,
        profile: `${self.activeWorkflow.name}-Profile`,
      };
    },
    // data required by the transaction profile page
    profileData: (self) => {
      let data = {};
      let entity = self.selectedEntity;
      switch (self.activeWorkflow.tabName) {
        case 'Invoice':
          data = {
            onCreditFlag: entity.onCreditFlag,
            rectifyFlag: entity.rectifyFlag,
            cancelFlag: !!entity.cancelflag,
            deletedFlag: entity.deletedFlag,
          };
          break;
        case 'CashMemo':
          break;
        case 'DebitCreditNote':
          break;
        case 'DeliveryNote':
          data = {
            cancelledFlag: entity.cancelledFlag,
            unbilledFlag: entity.unbilledFlag,
            invLinkedFlag: entity.invLinkedFlag,
          };
          break;
        case 'PurchaseSalesOrder':
          break;
        case 'RejectionNote':
          break;
        case 'TransferNote':
          break;
        case 'Voucher':
          data = self.selectedEntity;
          break;
      }
      return data;
    },
    allTabs: (self) => {
      let tabs = {};
      const transactionTabs = self.options.tabs['Transactions'].tabs;
      for (let tab in self.options.tabs) {
        tabs[tab] = self.options.tabs[tab];
      }
      for (let tab2 in transactionTabs) {
        tabs[tab2] = transactionTabs[tab2];
      }
      return tabs;
    },
    activeTabOptions: (self) => {
      // debugger;
      if (self.activeWorkflow.name.includes('-')) {
        const name = self.activeWorkflow.name.split('-');
        return self.options.tabs[name[0]].tabs[name[1]];
      }
      console.log(self.options.tabs[self.activeWorkflow.name])
      return self.options.tabs[self.activeWorkflow.name];
    },
    // headerHeight is the height of the top nav bar
    headerHeight: () => document.getElementById('app-header').offsetHeight,

    rightPaneHeight: (self) =>
      window.innerHeight - (self.headerHeight + self.leftHeaderHeight.min + 55), // 55 is the remaining vertical space in the screen

    ...mapState(['yearStart', 'yearEnd', 'orgCode', 'orgName']),
  },
  methods: {
    getInvoiceTitle(invoiceType) {
      const _invoiceType = invoiceType.charAt(0).toUpperCase() + invoiceType.slice(1);
      return (
        `<div class="text-center">
          ${this.invoiceTitleText} - ${_invoiceType} for Recipient
        </div>`
      );
    },
    toggleAll() {
      if (this.allSelected) {
        console.log(this.activeTabOptions)
        this.filters.active = this.activeTabOptions.filterBy.value.map((_, index) => index);
      } else {
        this.filters.active = [];
      }
    },
    updateIndeterminate() {
      const allSelected = this.filters.active.length === this.activeTabOptions.filterBy.value.length;
      this.allSelected = allSelected;
    },
    toggleFlag() {
      this.isFilterOpen = false; 
      this.isSettingsOpen = false;
    },
    /**
     * updateListSettings
     *
     * Description: Updates the left pane column config to localhost for persistence
     */
    updateListSettings() {
      // debugger;
      let colMap = this.activeTabOptions.options.columnMap;
      let sortBy = this.listSettings.columns
        .filter((column) => {
          return column;
        })
        .map((column) => {
          return colMap[column];
        });
      if (sortBy.length) {
        // this.activeTabOptions.sortBy = sortBy;
        this.activeTabOptions.setListColumns(sortBy).then((resp) => {
          if (resp.gkstatus === 0) {
            this.$bvToast.toast('Update column config success!', {
              variant: 'success',
              solid: true,
            });
          } else {
            this.$bvToast.toast('Update column config failure!', {
              variant: 'danger',
              solid: true,
            });
          }
        });
      }
    },
    updateListHeight() {
      // listHeight is the height that the left pane data list should be, (Total screen height - (top nav bar height - leftpane top bar height))
      this.listHeight =
        window.innerHeight -
        (this.headerHeight +
          70 +
          (this.isFilterOpen
            ? this.leftHeaderHeight.max
            : this.leftHeaderHeight.min)); // 70 is the sum of sortable heading height + remaining vertical space in the screen
    },
    callSortData(data, props) {
      // this.sort.isActive = true;
      if (this.sort.props.key === props.key) {
        props.isAsc = !props.isAsc;
      }
      this.sort.props.key = props.key;
      this.sort.isAscending = props.isAsc;
    },
    sortData(data, isAscending, sortBy) {
      let sorted = [];
      if (data.length) {
        let isString = isNaN(data[0][sortBy]);
        let min = isAscending ? -1 : 1;
        let max = min === 1 ? -1 : 1;
        if (isString) {
          sorted = data.sort((A, B) => {
            let a = A[sortBy].toLowerCase(),
              b = B[sortBy].toLowerCase();
            if (a < b) {
              return min;
            }
            if (a > b) {
              return max;
            }
            return 0;
          });
        } else {
          sorted = data.sort((A, B) => {
            return max * (A[sortBy] - B[sortBy]);
          });
        }
      }
      return sorted;
    },
    resetFilter() {
      this.filters = {
        active: [],
        range: {
          props: {},
          from: this.yearStart,
          to: this.yearEnd,
        },
        isActive: false,
      };

      //sets the first filter in the filter array, which should be "all" ( used to display every item )
      if (this.activeTabOptions.filterBy.value.length) {
        this.filters.active = this.activeTabOptions.filterBy.value.map((_, index) => index);
      }

      //sets the props object, which contains the key's value to perform the range filter
      if (this.activeTabOptions.filterBy.range.length) {
        this.filters.range.props = Object.assign(
          {},
          this.activeTabOptions.filterBy.range[0].props || {}
        );
      }

      // sets the first sortBy in the sortBy array
      // if (this.activeTabOptions.sortBy.length) {
      //   this.sort.props = Object.assign(
      //     {},
      //     this.activeTabOptions.sortBy[0].props
      //   );
      // }

      // if (this.activeTabOptions.filterBy.range.length) {
      // }
    },
    filterByValue(data, filters) {
      return filters.reduce(
        (acc, filter) =>
          filter ? acc || data[filter.key] === filter.value : true,
        false
      );
    },
    filterByRange(data, key, from, to) {
      return data[key] >= from && data[key] <= to;
    },
    filterTable(row) {
      let result;
      if (row.noteName === "Transfer Note" || row.noteName === "Cash Memo") {
        result = true;
      } else {
        const self = this;
        if (this.filters.active.length) {
          let filters = this.filters.active.map((filterIndex) =>
            filterIndex >= 0
              ? self.activeTabOptions.filterBy.value[filterIndex].props || null
              : null
          );
          result = this.filterByValue(row, filters);
        }
      }
      if (this.filters.range.props.key !== undefined) {
        result =
          result &&
          this.filterByRange(
            row,
            this.filters.range.props.key,
            Date.parse(this.filters.range.from), // converting date "yyyy-mm-dd" into a format that can be compared with logical operators
            Date.parse(this.filters.range.to)
          );
      }
      return result;
    },
    /**
     * setActiveWorkflow(index, name, icon)
     *
     * Description: As the name suggests it stores the details about the active workflow.
     * Also initializes the filters and sorts, after that.
     */
    setActiveWorkflow(index, name, icon, skipUpdate) {
      // console.log('In manual set active workflow, ' + skipUpdate);
      let color, tabName;
      let activeWorkflow = name.parent
        ? this.options.tabs[name.parent].tabs[name.child]
        : this.options.tabs[name];
      if (name.parent && name.child) {
        tabName = name.child;
        color = this.options.tabs[name.parent].tabs[name.child].color;
        name = `${name.parent}-${name.child}`;
      } else {
        if (name === 'Transactions') {
          return;
        }
        color = this.options.tabs[name].color;
        tabName = name;
      }
      // console.log(this.activeWorkflow.id);
      this.isFilterOpen = false;
      this.leftHeaderHeight.max = 0;
      this.unsetSelectedEntity();
      this.activeWorkflow = {
        index,
        name,
        icon,
        color: color,
        tabName,
        id: skipUpdate ? this.activeWorkflow.id : -1,
      };
      this.resetFilter();
      // if (!skipUpdate) {
      //   this.updateUrl();
      // }
      const self = this;
      if (!activeWorkflow.data.length) {
        this.isLoading = true;
        activeWorkflow.initListColumns(this.orgCode);
        this.$nextTick(() => {
          self.listSettings.columns = activeWorkflow.fields.map((col) => {
            return col.key;
          });
        });
        return activeWorkflow
          .loadList(this.yearStart, this.yearEnd)
          .then((resp) => {
            activeWorkflow.data = resp;
            self.isLoading = false;
            // debugger;
            // select first item only if wfId = -1, i.e. nothing is selected
            // console.log(self.activeWorkflow.id);
            if (parseInt(self.activeWorkflow.id) == -1) {
              self.selectFirstListItem();
              self.updateUrl();
            }
            return true;
          })
          .catch((e) => {
            console.log(e.message);
            self.isLoading = false;
          });
      } else {
        // select first item only if wfId = -1, i.e. nothing is selected
        // console.log(self.activeWorkflow.id);
        if (parseInt(self.activeWorkflow.id) == -1) {
          self.selectFirstListItem();
          self.updateUrl();
        }
      }
    },
    /** Sets the active workflow based on the URL props */
    autoSetActiveWorkflow() {
      // console.log('In auto select active workflow');
      let self = this;
      let tab, index;
      let setActiveWorkflow;
      this.activeWorkflow.id = this.wfId || -1;
      if (this.wfName.includes('-')) {
        let name = this.wfName.split('-');
        tab = this.options.tabs[name[0]].tabs[name[1]];
        index = Object.keys(this.options.tabs[name[0]]).indexOf(name[1]);
        setActiveWorkflow = this.setActiveWorkflow(
          index,
          { parent: name[0], child: name[1] },
          tab.icon,
          true
        );
      } else {
        tab = this.options.tabs[this.wfName];
        index = Object.keys(this.options.tabs).indexOf(this.wfName);
        setActiveWorkflow = this.setActiveWorkflow(
          index,
          this.wfName,
          tab.icon,
          true
        );
      }
      if (!this.is_mobile() || parseInt(this.wfId) !== -1) {
        if (setActiveWorkflow) {
          setActiveWorkflow.then(() => {
            self.initSelectedEntity(tab);
          });
        } else {
          this.initSelectedEntity(tab);
        }
      }
    },
    selectFirstListItem() {
      // console.log('In select first item method');
      if (!this.is_mobile()) {
        const self = this;
        this.$forceUpdate();
        this.$nextTick().then(() => {
          if (self.$refs[`list-${self.activeWorkflow.tabName}`]) {
            // console.log('Selecting the first row as active');
            self.$refs[`list-${self.activeWorkflow.tabName}`][0].selectRow(0);
          }
        });
      }
    },
    setSelectedEntity(entity) {
      // remove selected class from the last selected item
      // if (selectedDom) selectedDom.classList.remove('selected-data-list');

      if (!entity[0]) return;

      this.selectedEntity = entity[0];
      if (this.$refs['col-left'])
        this.$refs['col-left'].classList.remove('d-block');
      if (this.$refs['col-right'])
        this.$refs['col-right'].classList.add('d-block');
      let key = this.activeTabOptions.uidKey;
      let wfId = this.selectedEntity ? this.selectedEntity[key] || -1 : -1;
      this.activeWorkflow.id = wfId;
      this.updateUrl();
      if (this.isPageFresh) {
        this.isPageFresh = false;
        let table = document.querySelector(
          `#list-${this.activeWorkflow.tabName}`
        );
        let selectedRow = table.querySelector(
          `tr:nth-child(${this.selectedEntityIndex + 1})`
        );
        selectedRow.scrollIntoView({ block: 'center' });
      }
    },
    /** Update the URL based on current entity selected */
    updateUrl() {
      // console.log("Url Update")
      let url = window.location.href.split('#')[0];
      let wfName = this.activeWorkflow.name;
      let key = this.activeTabOptions.uidKey;
      let wfId = this.selectedEntity ? this.selectedEntity[key] || -1 : -1;
      // console.log(wfId);
      url += `#/workflow/${wfName}/${wfId}`;
      if (url != window.location.href) {
        this.$router.replace({
          name: 'Workflow',
          params: { wfName: wfName, wfId: wfId },
        });
        // history.replaceState(null, '', url); // replace state method allows us to update the last history instance inplace,
        // instead of creating a new history instances for every entity selected
      }
    },
    unsetSelectedEntity() {
      const self = this;
      this.selectedEntity = null;
      if (this.$refs['col-left']) {
        this.$refs['col-left'].classList.add('d-block');
      }
      if (this.$refs['col-right']) {
        this.$refs['col-right'].classList.remove('d-block');
      }
      this.$forceUpdate();
      this.$nextTick().then(() => {
        if (self.$refs[`list-${self.activeWorkflow.tabName}`]) {
          self.$refs[`list-${self.activeWorkflow.tabName}`][0].clearSelected();
        }
      });
    },
    /** Description: A callback to update the left pane list, based on the changes in the right pane
     *
     * params: updatedData - The rightpane's data from gkcore after update
     */
    onSelectedEntityUpdate(updatedData) {
      switch (this.activeWorkflow.name) {
        case 'Transactions':
          {
            if (updatedData.gkstatus === 0) {
              // if the invoice exists after update, gkstatus will be 0
              this.selectedEntity.onCreditFlag = !updatedData.gkresult
                .billentrysingleflag;
            } else {
              // If the invoice was deleted as an update, then gkstatus will be 3 or something else
              this.activeTabOptions.data.splice(this.selectedEntityIndex, 1);
              this.unsetSelectedEntity();
            }
          }
          break;
        case 'Transactions-Voucher':
          {
            if (updatedData.type === 'delete') {
              this.displayToast(
                `Voucher Delete success!`,
                `${this.selectedEntity.noteName} : ${this.selectedEntity.no}, deleted successfully.`,
                'success'
              );
              let id = this.selectedEntity.id;
              let index = this.activeTabOptions.data.findIndex(
                (voucher) => voucher.id === id
              );
              this.unsetSelectedEntity();
              this.activeTabOptions.data.splice(index, 1);
            }
          }
          break;
        case 'Transactions-DeliveryNote':
          {
            if (updatedData.type === 'delete') {
              this.displayToast(
                `Delivery Note Delete success!`,
                `Delivery Note : ${this.selectedEntity.no}, deleted successfully.`,
                'success'
              );
              let id = this.selectedEntity.id;
              let index = this.activeTabOptions.data.findIndex(
                (delNote) => delNote.id === id
              );
              this.unsetSelectedEntity();
              this.activeTabOptions.data.splice(index, 1);
            }
          }
          break;
        case 'Contacts':
          {
            if (updatedData.type === 'update') {
              Object.assign(this.selectedEntity, updatedData.data);
            } else if (updatedData.type === 'delete') {
              let id = this.selectedEntity.custid;
              let index = this.activeTabOptions.data.findIndex(
                (item) => item.custid === id
              );
              this.displayToast(
                `Contact Delete success!`,
                `Contact : ${this.selectedEntity.custname}, deleted successfully.`,
                'success'
              );
              this.unsetSelectedEntity();
              this.activeTabOptions.data.splice(index, 1);
            }
          }
          break;
        case 'Business': {
          if (updatedData.type === 'update') {
            Object.assign(this.selectedEntity, updatedData.data);
          } else if (updatedData.type === 'delete') {
            this.displayToast(
              `Business Item Delete success!`,
              `Business Item : ${this.selectedEntity.productdesc}, deleted successfully.`,
              'success'
            );
            let id = this.selectedEntity.productcode;
            let index = this.activeTabOptions.data.findIndex(
              (item) => item.productcode === id
            );
            this.unsetSelectedEntity();
            this.activeTabOptions.data.splice(index, 1);
          }
        }
        break;
        case 'Transactions-Invoice': {
          if (updatedData.gkstatus === 3) {
              // if the invoice cancel after update, gkstatus will be 3
              this.selectedEntity.deletedFlag = true;
          } 
        }
      }
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
    // fetch products & services list
    psList() {
      this.isLoading = true;
      axios
        .get('/product')
        .then((res) => {
          this.filterProducts(res.data.gkresult);
          this.isLoading = false;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    // filter products & services list & store them seperately
    filterProducts(allProducts) {
      for (const i in allProducts) {
        if (allProducts[i].gsflag === 7) {
          this.products.push(allProducts[i]);
        } else {
          this.services.push(allProducts[i]);
        }
      }
    },
    onDropdownHide(event) {
      // console.log(`${event.componentId} is closing`);
      if (event.componentId === 'sub-menu') {
        this.isSubMenuOpen = false;
        this.$refs.mainMenu.hide();
      }
      if (this.isSubMenuOpen) {
        event.preventDefault();
      }
    },
    onDropdownShow(event) {
      if (event.componentId === 'sub-menu') {
        this.isSubMenuOpen = true;
      }
    },
    initSelectedEntity(tab) {
      const self = this;
      self.$forceUpdate();
      self.$nextTick().then(() => {
        let table = self.$refs[`list-${self.activeWorkflow.tabName}`][0];
        let wfId = parseInt(self.wfId);
        let key = tab.uidKey;
        // table.sortedItems will have the filtered and sorted items
        let entityIndex =
          parseInt(self.wfId) >= 0
            ? table.sortedItems.findIndex((item) => item[key] === wfId)
            : 0;
        if (entityIndex >= 0) {
          self.selectedEntityIndex = entityIndex;
          table.clearSelected();
          table.selectRow(entityIndex);
        }
      });
    },
  },
  mounted() {
    this.updateListHeight();
    this.autoSetActiveWorkflow();
  },
  destroyed() {
    this.options.tabs['Contacts'].data = [];
    this.options.tabs['Business'].data = [];
    this.options.tabs['Transactions'].tabs['Invoice'].data = [];
    this.options.tabs['Transactions'].tabs['DebitCreditNote'].data = [];
    this.options.tabs['Transactions'].tabs['CashMemo'].data = [];
    this.options.tabs['Transactions'].tabs['DeliveryNote'].data = [];
    this.options.tabs['Transactions'].tabs['PurchaseSalesOrder'].data = [];
    this.options.tabs['Transactions'].tabs['RejectionNote'].data = [];
    this.options.tabs['Transactions'].tabs['TransferNote'].data = [];
    this.options.tabs['Transactions'].tabs['Voucher'].data = [];
  },
};
</script>
<style scoped>
.bg-light-gray {
  background-color: #f1f1f1;
}

.data-list {
  padding: 0;
}
.data-list > div {
  padding: 0.75rem 1.25rem;
}
.text-overline-danger {
  text-decoration: overline;
  text-decoration-color: #dc3545;
}

#add-item {
  opacity: 0.55;
}

#add-item:hover {
  opacity: 1;
}

.selected-data-list {
  border: 2px solid black;
  background-color: #f3f3f3;
}
</style>
