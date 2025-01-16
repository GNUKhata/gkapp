<template>
  <section>
    <b-button
      size="lg"
      class="d-print-none p-0 mr-2 mt-1 bordered"
      variant="light"
      title="Open Sidebar"
      :lazy="true"
      v-b-toggle.sidebar
    >
      <b-icon icon="list" />
    </b-button>
    <b-sidebar
      width="15em"
      v-model="opened"
      id="sidebar"
      shadow
      backdrop
    >
      <template #title>
        <div class="d-flex">
          <img
            src="../../public/img/gk.svg"
            width="30px"
            height="30px"
            class="ml-4 mt-1"
            alt="GNUKhata Logo"
          >
          <div
            style="font-size: 0.8em"
            class="font-weight-normal mt-1 ml-1"
          >
            <translate> GNUKhata </translate>
          </div>
        </div>
      </template>
      <hr class="m-0">
      <template>
        <b-nav class="text-small text-dark col">
          <div
            v-if="userRole == -1"
            role="button"
            @click="$store.commit('toggleSearchMenu', !searchMenu)"
            class="text-center mr-5 ml-3 mt-3"
          >
            <b-icon icon="search" />
            Search Menu
          </div>
          <template v-if="userRole == -1">
            <!-- Sales -->
            <h6
              v-b-toggle.sales
              class="text-center mr-5 ml-3 mt-3"
            >
              <b-icon
                :icon="
                  collapsed.invoice ? 'caret-down-fill' : 'caret-right-fill'
                "
              />
              <translate>Sales</translate>
            </h6>
            <b-collapse
              v-model="collapsed.sales"
              id="sales"
            >
              <b-nav-item
                :to="{
                  name: 'Workflow',
                  params: {
                    wfName: 'Transactions-Invoice',
                    wfId: -1,
                  },
                  query: {
                    type: 'sales',
                  },
                }"
              >
                <b-icon icon="receipt" /><translate>Sales Invoices</translate>
              </b-nav-item>
              <b-nav-item to="/workflow/Transactions-PurchaseSalesOrder/-1?type=sales">
                <b-icon icon="receipt" /><translate>Sales Order</translate>
              </b-nav-item>
              <b-nav-item to="/workflow/Contacts/-1?type=customer">
                <b-icon icon="person-lines-fill" /><translate>Customers</translate>
              </b-nav-item>
              <b-nav-item to="/workflow/Transactions-CashMemo/-1">
                <b-icon icon="receipt" /><translate>Point of Sales</translate>
              </b-nav-item>
              <b-nav-item to="/workflow/Transactions-DebitCreditNote/-1?type=sales">
                <b-icon icon="receipt" /><translate>Debit/Credit Note</translate>
              </b-nav-item>
              <b-nav-item to="/product-register">
                <b-icon icon="box-seam" /><translate>Sales Register</translate>
              </b-nav-item>
            </b-collapse>
          </template>

          <template v-if="userRole == -1">
            <!-- Purchase -->
            <h6
              v-b-toggle.purchases
              class="text-center mr-5 ml-3 mt-2"
            >
              <b-icon
                :icon="
                  collapsed.purchases ? 'caret-down-fill' : 'caret-right-fill'
                "
              />
              <translate>Purchases</translate>
            </h6>
            <b-collapse
              v-model="collapsed.purchases"
              id="purchases"
            >
              <b-nav-item
                :to="{
                  name: 'Workflow',
                  params: {
                    wfName: 'Transactions-Invoice',
                    wfId: -1,
                  },
                  query: {
                    type: 'purchase',
                  },
                }"
              >
                <b-icon icon="receipt" /><translate>Purchase Invoices</translate>
              </b-nav-item>
              <b-nav-item to="/workflow/Transactions-PurchaseSalesOrder/-1?type=purchase">
                <b-icon icon="receipt" /><translate>Purchase Orders</translate>
              </b-nav-item>
              <b-nav-item to="/workflow/Contacts/-1?type=supplier">
                <b-icon icon="person-lines-fill" /><translate>Suppliers</translate>
              </b-nav-item>
              <b-nav-item to="/workflow/Transactions-DebitCreditNote/-1?type=purchase">
                <b-icon icon="receipt" /><translate>Debit/Credit Note</translate>
              </b-nav-item>
              <b-nav-item to="/product-register">
                <b-icon icon="box-seam" /><translate>Purchase Register</translate>
              </b-nav-item>
            </b-collapse>
          </template>

          <template v-if="userRole == -1">
            <!-- Banking -->
            <h6
              v-b-toggle.banking
              class="text-center mr-5 ml-3 mt-2"
            >
              <b-icon
                :icon="
                  collapsed.banking ? 'caret-down-fill' : 'caret-right-fill'
                "
              />
              <translate>Banking</translate>
            </h6>
            <b-collapse
              v-model="collapsed.banking"
              id="banking"
            >
              <b-nav-item to="/accounts">
                <b-icon icon="people" /><translate>Accounts</translate>
              </b-nav-item>
              <b-nav-item to="/bank-recon">
                <b-icon icon="journals" /><translate>Reconciliation</translate>
              </b-nav-item>
            </b-collapse>
          </template>

          <template v-if="userRole == -1">
            <!-- Accounting -->
            <h6
              v-b-toggle.accounting
              class="text-center mr-5 ml-3 mt-2"
            >
              <b-icon
                :icon="
                  collapsed.accounting ? 'caret-down-fill' : 'caret-right-fill'
                "
              />
              <translate>Accounting</translate>
            </h6>
            <b-collapse
              v-model="collapsed.accounting"
              id="accounting"
            >
              <b-nav-item to="/workflow/Transactions-DeliveryNote/-1">
                <b-icon icon="receipt" /><translate>Delivery Note</translate>
              </b-nav-item>
              <b-nav-item to="/workflow/Transactions-Voucher/-1">
                <b-icon icon="receipt" /><translate>Manual Voucers</translate>
              </b-nav-item>
              <b-nav-item to="/accounts">
                <b-icon icon="files-alt" /><translate>Chart of Accounts</translate>
              </b-nav-item>
              <b-nav-item to="/budgets/cash/-1">
                <b-icon icon="file-ruled" /><translate>Budget</translate>
              </b-nav-item>
              <b-nav-item
                :to="{
                  name: 'Billwise',
                  params: {custType: 3, custName: '-1'},
                }"
              >
                <b-icon icon="clipboard" /><translate>Adjust Bills</translate>
              </b-nav-item>
              <b-nav-item to="/closebooks">
                <b-icon icon="journals" /><translate>Close Books</translate>
              </b-nav-item>
            </b-collapse>
          </template>

          <template v-if="userRole == -1">
            <!-- Products and Services -->
            <h6
              v-b-toggle.business
              class="text-center ml-3 mt-2"
            >
              <b-icon
                :icon="
                  collapsed.business ? 'caret-down-fill' : 'caret-right-fill'
                "
              />
              <translate>Products and Services</translate>
            </h6>
            <b-collapse
              v-model="collapsed.business"
              id="business"
            >
              <b-nav-item to="/workflow/Business/-1">
                <b-icon icon="box" /><translate>Products and Services</translate>
              </b-nav-item>
              <b-nav-item to="/workflow/Transactions-TransferNote/-1">
                <b-icon icon="receipt" /><translate>Transfer Notes</translate>
              </b-nav-item>
              <b-nav-item to="/godowns">
                <b-icon icon="building" /><translate>Godowns</translate>
              </b-nav-item>
              <b-nav-item
                v-if="userRole == -1 || 0"
                to="/uom"
              >
                <b-icon icon="thermometer" /><translate>Unit of measurement</translate>
              </b-nav-item>
            </b-collapse>
          </template>

          <template v-if="userRole == -1 || userRole == 0">
            <!-- Admin -->
            <h6
              v-b-toggle.admin
              class="text-center mr-5 ml-3 mt-2 "
            >
              <b-icon
                :icon="collapsed.admin ? 'caret-down-fill' : 'caret-right-fill'"
              />
              <translate>Administration</translate>
            </h6>
            <b-collapse
              v-model="collapsed.admin"
              id="admin"
            >
              <b-nav-item to="/users">
                <b-icon icon="people" /><translate>Manage Users</translate>
              </b-nav-item>
              <b-nav-item to="/settings">
                <b-icon icon="gear" /> <translate>Settings</translate>
              </b-nav-item>
              <b-nav-item to="/logs">
                <b-icon icon="server" /><translate>Audit Logs</translate>
              </b-nav-item>
            </b-collapse>
          </template>

          <template v-if="userRole == -1">
            <!-- Reports -->
            <!-- only admin role can access reports -->
            <h6
              v-b-toggle.reports
              class="text-cecnter ml-3 mr-5 mt-2"
            >
              <b-icon
                :icon="
                  collapsed.reports ? 'caret-down-fill' : 'caret-right-fill'
                "
                class="text-right"
              />
              <translate>Reports</translate>
            </h6>
            <b-collapse
              v-model="collapsed.reports"
              id="reports"
            >
              <b-nav-item to="/product-register">
                <b-icon icon="box-seam" /><translate>Product Register</translate>
              </b-nav-item>
              <b-nav-item to="/registers">
                <b-icon icon="receipt" /><translate>View Registers</translate>
              </b-nav-item>
              <b-nav-item to="/stock-on-hand">
                <b-icon icon="receipt" /><translate>Stock On Hand</translate>
              </b-nav-item>
              <b-nav-item to="/profit-loss">
                <b-icon icon="graph-up" /><translate v-if="orgType == 'Profit Making'">
                  Profit & Loss
                </translate>
                <translate v-else>
                  Income & Expenditure
                </translate>
              </b-nav-item>
              <b-nav-item to="/cash-flow">
                <b-icon icon="wallet" /><translate>Cash Flow</translate>
              </b-nav-item>
              <b-nav-item to="/trial-balance">
                <b-icon icon="wallet" />
                <translate>Trial Balance</translate>
              </b-nav-item>
              <b-nav-item to="/ledger">
                <b-icon icon="journals" /><translate>Ledger</translate>
              </b-nav-item>
              <b-nav-item to="/balance-sheet">
                <b-icon icon="journals" />
                <translate v-if="orgType == 'Profit Making'">
                  Balance Sheet
                </translate>
                <translate v-else>
                  Statement Of Affairs
                </translate>
              </b-nav-item>
            </b-collapse>
          </template>

          <template v-if="isGstEnabled && (userRole == -1 || userRole == 0)">
            <!-- GST -->
            <h6
              v-b-toggle.gst
              class="text-center ml-3 mr-5 mt-2"
            >
              <b-icon
                :icon="collapsed.gst ? 'caret-down-fill' : 'caret-right-fill'"
                class="text-right"
              />
              GST <b-badge pill>
                WIP
              </b-badge>
            </h6>
            <b-collapse
              v-model="collapsed.gst"
              id="gst"
            >
              <div class="ml-3">
                <small v-if="!gstinValid">
                  * Update
                  <b><i>Administration -> Organisation Profile </i></b> with a
                  valid GSTIN to access the GST reports
                </small>
              </div>
              <b-nav-item
                :disabled="!gstinValid"
                to="/gst/r1"
              >
                <b-icon icon="file-earmark" /><translate> R1 Report</translate>
              </b-nav-item>
              <b-nav-item
                :disabled="!gstinValid"
                to="/gst/3b"
              >
                <b-icon icon="file-earmark" /><translate> 3B Report</translate>
              </b-nav-item>
              <b-nav-item to="/gst/news">
                <b-icon icon="newspaper" /><translate> GST News</translate><b-icon
                  v-if="newGstNews"
                  icon="bell-fill"
                  variant="warning"
                  class="ml-1 pt-1"
                  animation="pulse"
                />
              </b-nav-item>
            </b-collapse>
          </template>

          <template>
            <!-- Help -->
            <h6
              v-b-toggle.help
              class="text-center ml-3 mt-2 mr-5"
            >
              <b-icon
                :icon="collapsed.help ? 'caret-down-fill' : 'caret-right-fill'"
              />
              <translate> Help</translate>
            </h6>
            <b-collapse
              v-model="collapsed.help"
              id="help"
            >
              <b-nav-item
                to="/about"
                class="mr-3"
              >
                <b-icon icon="info-circle" /><translate> About</translate>
              </b-nav-item>
              <b-nav-item
                class="mr-3"
                target="_blank"
                href="https://gnukhata.org"
              >
                <b-icon icon="globe" /><translate> Website</translate>
              </b-nav-item>
              <b-nav-item
                class="mr-3"
                target="_blank"
                href="https://gitlab.com/gnukhata"
              >
                <b-icon icon="code" /><translate> Source Code</translate>
              </b-nav-item>
              <b-nav-item
                class="mr-3"
                to="/report-bug"
              >
                <b-icon icon="bug" /><translate> Report Bug</translate>
              </b-nav-item>

              <b-nav-item
                class="mr-3"
                target="_blank"
                href="https://gnukhata.org/faq"
              >
                <b-icon icon="question-circle" /><translate> FAQ</translate>
              </b-nav-item>
            </b-collapse>
          </template>
        </b-nav>

        <hr>
        <b-alert
          class="m-2"
          :show="gkConfig.sidebar_banner.show"
          :variant="gkConfig.sidebar_banner.variant"
          v-html="gkConfig.sidebar_banner.content"
        />
      </template>
    </b-sidebar>
  </section>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
export default {
  name: 'Sidebar',
  data() {
    return {
      opened: false,
      collapsed: {},
    };
  },
  computed: {
    ...mapGetters('global', ['isGstEnabled']),
    ...mapState([
      'searchMenu',
      'newGstNews',
      'orgGstin',
      'orgType',
      'userRole',
    ]),
    gstinValid: (self) => !!self.orgGstin,
  },
};
</script>

<style>
.nav-link {
  font-size: 0.9em;
  margin-left: 1em;
}
.nav-link > svg {
  margin-right: 0.2em;
}
</style>
