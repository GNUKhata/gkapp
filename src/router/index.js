import Vue from "vue";
import VueRouter from "vue-router";
import OrgProfile from "@/views/OrgProfile.vue";
import Logs from "@/views/Logs.vue";
import CloseBooks from "@/views/CloseBooks.vue";
import UserManagement from "@/views/UserManagement.vue";
import UOM from "@/views/UOM.vue";
import Categories from "@/views/Categories.vue";
import AddCategory from "@/views/CategoryCreate.vue";

Vue.use(VueRouter);

const routes = [
  {
    meta: {
      title: "User Login",
    },
    path: "/",
    name: "Login",
    component: () =>
      import(
        /* webpackChunkName: "select-user-org" */ "../views/SelectUserOrg.vue"
      ),
  },
  {
    meta: {
      title: "User Login",
    },
    path: "/user-login",
    name: "User Login",
    component: () =>
      import(/* webpackChunkName: "user-login" */ "../views/SelectUserOrg.vue"),
  },
  {
    meta: {
      title: "Server Setup",
    },
    path: "/server-setup",
    name: "Server Setup",
    component: () =>
      import(/* webpackChunkName: "server-setup" */ "../views/ServerSetup.vue"),
  },
  {
    meta: {
      title: "Organisation Profile",
      requiresOrgAuth: true,
    },
    path: "/orgprofile",
    name: "Organisation Profile",
    component: OrgProfile,
  },
  {
    meta: {
      title: "Organisation Logs",
      requiresOrgAuth: true,
    },
    path: "/logs",
    name: "Audit Logs",
    component: Logs,
  },
  {
    meta: {
      title: "Settings",
      requiresOrgAuth: true,
    },
    path: "/settings",
    name: "Settings",
    component: () =>
      import(/* webpackChunkName: "workflow" */ "../views/Settings.vue"),
  },
  // User Management
  {
    meta: {
      title: "User Management",
      requiresOrgAuth: true,
    },
    path: "/users",
    name: "User Management",
    component: UserManagement,
  },
  {
    meta: {
      title: "User invite",
      requiresOrgAuth: true,
    },
    path: "/users/invite",
    name: "User Invite",
    component: () =>
      import(
        /* webpackChunkName: "useradd" */ "../components/form/InviteUser.vue"
      ),
  },
  {
    meta: {
      title: "User Edit",
      requiresOrgAuth: true,
    },
    path: "/users/:id",
    name: "User Edit",
    component: () =>
      import(
        /* webpackChunkName: "useredit" */ "../components/form/EditUser.vue"
      ),
  },
  {
    meta: {
      title: "Close Books & Roll Over",
      requiresOrgAuth: true,
    },
    path: "/closebooks",
    name: "Close Books & Roll Over",
    component: CloseBooks,
  },
  {
    meta: {
      title: "Unit Of Measurement",
      requiresOrgAuth: true,
    },
    path: "/uom",
    name: "Unit Of Measurement",
    component: UOM,
  },
  {
    meta: {
      title: "Unit Add",
      requiresOrgAuth: true,
    },
    path: "/uom/add",
    name: "Unit Add",
    component: () =>
      import(/* webpackChunkName: "uomadd" */ "../components/form/AddUOM.vue"),
  },
  {
    meta: {
      title: "Unit Edit",
      requiresOrgAuth: true,
    },
    path: "/uom/:id",
    name: "Unit Edit",
    component: () =>
      import(
        /* webpackChunkName: "uomedit" */ "../components/form/EditUOM.vue"
      ),
  },
  {
    meta: {
      title: "Categories",
      requiresOrgAuth: true,
    },
    path: "/categories",
    name: "Categories",
    component: Categories,
  },
  {
    meta: {
      title: "Add Category",
      requiresOrgAuth: true,
    },
    path: "/categories/add",
    name: "Add Category",
    component: AddCategory,
  },
  {
    meta: {
      title: "Edit_Category",
      requiresOrgAuth: true,
    },
    path: "/categories/edit/:id",
    name: "Edit_Category",
    component: () =>
      import(
        /* webpackChunkName: "edit_category" */ "../views/CategoryEdit.vue"
      ),
    props: true,
  },
  {
    meta: {
      title: "Stock On Hand",
      requiresOrgAuth: true,
    },
    path: "/stock-on-hand",
    name: "Stock On Hand",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "stockonhand" */ "../views/StockOnHand.vue"),
  },
  {
    meta: {
      title: "Category Wise Stock On Hand",
      requiresOrgAuth: true,
    },
    path: "/categorywise-stock-on-hand",
    name: "Category Wise Stock On Hand",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(
        /* webpackChunkName: "catstockonhand" */ "../views/CategorywiseStockOnHand.vue"
      ),
  },
  {
    meta: {
      title: "View Registers",
      requiresOrgAuth: true,
    },
    path: "/registers",
    name: "View Registers",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "registers" */ "../views/Registers.vue"),
  },
  {
    meta: {
      title: "Cost Center Statement",
      requiresOrgAuth: true,
    },
    path: "/cost-center-statement",
    name: "Cost Center Statement",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(
        /* webpackChunkName: "costcenterstatement" */ "../components/CostCenterStatement.vue"
      ),
  },
  {
    meta: {
      title: "Product Register",
      requiresOrgAuth: true,
    },
    path: "/product-register",
    name: "Product Register",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(
        /* webpackChunkName: "productregister" */ "../components/ProductRegister.vue"
      ),
  },
  {
    meta: {
      title: "Cost Center",
      requiresOrgAuth: true,
    },
    path: "/costcenter",
    name: "Cost Center",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "costcenter" */ "../views/CostCenter.vue"),
  },
  {
    meta: {
      title: "Godowns",
      requiresOrgAuth: true,
    },
    path: "/godowns",
    name: "Godowns",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "godowns" */ "../views/Godowns.vue"),
  },
  {
    meta: {
      title: "Add Godown",
      requiresOrgAuth: true,
    },
    path: "/godowns/add",
    name: "Add Godown",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(
        /* webpackChunkName: "addgodown" */ "../components/form/Godown.vue"
      ),
  },
  {
    meta: {
      title: "Edit Godown",
      requiresOrgAuth: true,
    },
    path: "/godowns/:id",
    name: "Edit Godown",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "editgodown" */ "../views/GodownEdit.vue"),
  },
  {
    meta: {
      title: "About",
      requiresOrgAuth: true,
    },
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue"),
  },
  {
    meta: {
      title: "Dashboard",
      requiresOrgAuth: true,
    },
    path: "/dashboard",
    name: "Dashboard",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "dashboard" */ "../views/dashboard/Dashboard.vue"),
  },
  {
    meta: {
      title: "Workflow",
      requiresOrgAuth: true,
    },
    path: "/workflow/:wfName/:wfId", // wf -> workflow
    name: "Workflow",
    component: () =>
      import(/* webpackChunkName: "workflow" */ "../views/Workflow.vue"),
    props: true,
  },
  {
    meta: {
      title: "Contact_Details",
      requiresOrgAuth: true,
    },
    path: "/contact-details/:mode/:type", // mode = create/edit, type = customer/supplier
    name: "Contact_Details",
    component: () =>
      import(
        /* webpackChunkName: "contact_details" */ "../views/ContactDetails.vue"
      ),
    props: true,
  },
  {
    meta: {
      title: "Business_Details",
      requiresOrgAuth: true,
    },
    path: "/business-details/:mode",
    name: "Business_Details",
    component: () =>
      import(
        /* webpackChunkName: "business_details" */ "../views/BusinessDetails.vue"
      ),
    props: true,
  },
  {
    meta: {
      title: "Invoice",
      requiresOrgAuth: true,
    },
    path: "/invoice",
    name: "Invoice",
    component: () =>
      import(
        /* webpackChunkName: "invoice" */ "../views/Transactions/Invoice.vue"
      ),
    props: true,
  },
  {
    meta: {
      title: "Invoice_Edit",
      requiresOrgAuth: true,
    },
    path: "/invoice/:invid",
    name: "Invoice_Edit",
    component: () =>
      import(
        /* webpackChunkName: "invoice_edit" */ "../views/Transactions/InvoiceEdit.vue"
      ),
    props: true,
  },
  {
    meta: {
      title: "Create_Voucher",
      requiresOrgAuth: true,
    },
    path: "/voucher/create/:type/:customer",
    name: "Create_Voucher",
    component: () =>
      import(
        /* webpackChunkName: "createvoucher" */ "../views/CreateVoucher.vue"
      ),
    props: true,
  },
  {
    meta: {
      title: "Edit_Voucher",
      requiresOrgAuth: true,
    },
    path: "/voucher/edit/:vid",
    name: "Edit_Voucher",
    component: () =>
      import(/* webpackChunkName: "voucheredit" */ "../views/VoucherEdit.vue"),
    props: true,
  },
  {
    meta: {
      title: "Billwise",
      requiresOrgAuth: true,
    },
    path: "/billwise/:custType/:custName",
    name: "Billwise",
    component: () =>
      import(/* webpackChunkName: "billwise" */ "../views/Billwise.vue"),
    props: true,
  },
  {
    meta: {
      title: "Delivery_Note",
      requiresOrgAuth: true,
    },
    path: "/delivery-note/:mode/:invid",
    name: "Delivery_Note",
    component: () =>
      import(
        /* webpackChunkName: "delivery_note" */ "../views/Transactions/DeliveryNote.vue"
      ),
    props: true,
  },
  {
    meta: {
      title: "Cash_Memo",
      requiresOrgAuth: true,
    },
    path: "/cash-memo",
    name: "Cash_Memo",
    component: () =>
      import(
        /* webpackChunkName: "cash_memo" */ "../views/Transactions/CashMemo.vue"
      ),
  },
  {
    meta: {
      title: "Purchase_Sales_Order",
      requiresOrgAuth: true,
    },
    path: "/ps-order",
    name: "Purchase_Sales_Order",
    component: () =>
      import(
        /* webpackChunkName: "ps_order" */ "../views/Transactions/PurchaseSaleOrder.vue"
      ),
  },
  {
    meta: {
      title: "Debit_Credit_Note",
      requiresOrgAuth: true,
    },
    path: "/dc-note",
    name: "Debit_Credit_Note",
    component: () =>
      import(
        /* webpackChunkName: "dc_note" */ "../views/Transactions/DebitCreditNote.vue"
      ),
  },
  {
    meta: {
      title: "Transfer_Note",
      requiresOrgAuth: true,
    },
    path: "/transfer-note",
    name: "Transfer_Note",
    component: () =>
      import(
        /* webpackChunkName: "transfer_note" */ "../views/Transactions/TransferNote.vue"
      ),
  },
  {
    meta: {
      title: "Rejection_Note",
      requiresOrgAuth: true,
    },
    path: "/rejection-note",
    name: "Rejection_Note",
    component: () =>
      import(
        /* webpackChunkName: "rejection_note" */ "../views/Transactions/RejectionNote.vue"
      ),
  },
  {
    meta: {
      title: "Accounts",
      requiresOrgAuth: true,
    },
    path: "/accounts/:group/:subGroup/:acc",
    name: "Accounts",
    component: () =>
      import(/* webpackChunkName: "accounts-all" */ "../views/Accounts.vue"),
    props: true,
  },
  {
    meta: {
      title: "Create_Account",
      requiresOrgAuth: true,
    },
    path: "/account/create/:group/:subGroup",
    name: "Create_Account",
    component: () =>
      import(
        /* webpackChunkName: "create-account" */ "../views/AccountCreate.vue"
      ),
    props: true,
  },
  {
    meta: {
      title: "Edit_Account",
      requiresOrgAuth: true,
    },
    path: "/account/edit/:id/:sysFlag",
    name: "Edit_Account",
    component: () =>
      import(/* webpackChunkName: "edit-account" */ "../views/AccountEdit.vue"),
    props: true,
  },
  {
    meta: {
      title: "Product List",
      requiresOrgAuth: true,
    },
    path: "/product-list",
    name: "Product List",
    component: () =>
      import(/* webpackChunkName: "product-list" */ "../views/ProductList.vue"),
  },
  {
    meta: {
      title: "Contact List",
      requiresOrgAuth: true,
    },
    path: "/contact-list",
    name: "Contact List",
    component: () =>
      import(/* webpackChunkName: "contact-list" */ "../views/ContactList.vue"),
  },
  {
    meta: {
      title: "Budget",
      requiresOrgAuth: true,
    },
    path: "/budgets/:type/:id",
    name: "Budget",
    component: () =>
      import(/* webpackChunkName: "budget" */ "../views/Budget.vue"),
    props: true,
  },
  {
    meta: {
      title: "Create_Budget",
      requiresOrgAuth: true,
    },
    path: "/budget/create/:type",
    name: "Create_Budget",
    component: () =>
      import(
        /* webpackChunkName: "create_budget" */ "../views/BudgetCreate.vue"
      ),
    props: true,
  },
  {
    meta: {
      title: "Edit_Budget",
      requiresOrgAuth: true,
    },
    path: "/budget/edit/:id",
    name: "Edit_Budget",
    component: () =>
      import(/* webpackChunkName: "edit_budget" */ "../views/BudgetEdit.vue"),
    props: true,
  },
  // Reports
  {
    meta: {
      title: "Profit & Loss",
      requiresOrgAuth: true,
    },
    path: "/profit-loss",
    name: "Profit & Loss",
    component: () =>
      import(/* webpackChunkName: "profit-loss" */ "../views/ProfitLoss.vue"),
  },
  {
    meta: {
      title: "Cash Flow",
      requiresOrgAuth: true,
    },
    path: "/cash-flow",
    name: "Cash Flow",
    component: () =>
      import(/* webpackChunkName: "cash-flow" */ "../views/CashFlow.vue"),
  },
  {
    meta: {
      title: "Trial Balance",
      requiresOrgAuth: true,
    },
    path: "/trial-balance",
    name: "Trial Balance",
    component: () =>
      import(
        /* webpackChunkName: "trial-balance" */ "../views/TrialBalance.vue"
      ),
  },
  {
    meta: {
      title: "Balance Sheet",
      requiresOrgAuth: true,
    },
    path: "/balance-sheet",
    name: "Balance Sheet",
    component: () =>
      import(
        /* webpackChunkName: "balance-sheet" */ "../views/BalanceSheet.vue"
      ),
  },
  {
    meta: {
      title: "View Ledger",
      requiresOrgAuth: true,
    },
    path: "/ledger",
    name: "View Ledger",
    component: () =>
      import(/* webpackChunkName: "ledger" */ "../views/Ledger.vue"),
  },
  {
    meta: {
      title: "Monthly Ledger",
      requiresOrgAuth: true,
    },
    path: "/ledger/monthly/:id",
    name: "Monthly Ledger",
    component: () =>
      import(
        /* webpackChunkName: "ledger-monthly" */ "../views/LedgerMonthly.vue"
      ),
  },
  {
    // ac=accountcode, pc=productcode, fs=financialstart, fd=fromdate, td=todate,
    meta: {
      title: "Ledger Full",
      requiresOrgAuth: true,
    },
    path: "/ledger/:ac&:pc&:fd&:td",
    name: "Ledger Full",
    component: () =>
      import(/* webpackChunkName: "ledger-full" */ "../views/LedgerFull.vue"),
  },
  {
    // ac=accountcode
    meta: {
      title: "Ledger Single",
      requiresOrgAuth: true,
    },
    path: "/ledger/:ac",
    name: "Ledger Single",
    component: () =>
      import(/* webpackChunkName: "ledger-ac" */ "../views/LedgerFull.vue"),
  },
  {
    // ac=accountcode
    meta: {
      title: "Bank_Reconc",
      requiresOrgAuth: true,
    },
    path: "/bank-recon",
    name: "Bank_Reconc",
    component: () =>
      import(/* webpackChunkName: "bank-recon" */ "../views/BankRecon.vue"),
  },

  // GST
  {
    meta: {
      title: "GST R1 Report",
      requiresOrgAuth: true,
    },
    path: "/gst/r1",
    name: "GST R1 Report",
    component: () =>
      import(/* webpackChunkName: "gst-r1" */ "../views/gst/R1.vue"),
  },
  {
    meta: {
      title: "GST R1 Summary",
      requiresOrgAuth: true,
    },
    path: "/gst/r1/summary/from=:fd&to=:td",
    name: "GST R1 Summary",
    component: () =>
      import(
        /* webpackChunkName: "gst-r1-summary" */ "../views/gst/R1Summary.vue"
      ),
    props: true,
  },
  {
    meta: {
      title: "GST R1 Detailed",
      requiresOrgAuth: true,
    },
    path: "/gst/r1/:type/:fd&:td",
    name: "GST R1 Detailed",
    component: () =>
      import(
        /* webpackChunkName: "gst-r1-detailed" */ "../views/gst/R1Detailed.vue"
      ),
  },
  {
    meta: {
      title: "GST 3B Report",
      requiresOrgAuth: true,
    },
    path: "/gst/3b",
    name: "GST 3B Report",
    component: () =>
      import(/* webpackChunkName: "gst-3b" */ "../views/gst/3B/3B.vue"),
  },
  {
    meta: {
      title: "GST 3B Full",
      requiresOrgAuth: true,
    },
    path: "/gst/3b/from=:fd&to=:td&state=:state",
    name: "GST 3B Full",
    component: () =>
      import(
        /* webpackChunkName: "gst-3b-full" */ "../views/gst/3B/Report.vue"
      ),
  },
  {
    meta: {
      title: "GNUKhata Export",
      requiresOrgAuth: true,
    },
    path: "/data/export",
    name: "Export Data",
    component: () =>
      import(/* webpackChunkName: "export-data" */ "../views/data/Export.vue"),
  },
  {
    meta: {
      title: "GNUKhata Import",
      requiresOrgAuth: true,
    },
    path: "/data/import",
    name: "Import Data",
    component: () =>
      import(/* webpackChunkName: "import-data" */ "../views/data/Import.vue"),
  },
  {
    meta: {
      title: "Import Help",
      requiresOrgAuth: true,
    },
    path: "/data/import/help/:help_type",
    name: "Import Data Help",
    component: () =>
      import(
        /* webpackChunkName: "import-data-help" */ "../views/data/Help.vue"
      ),
  },
  {
    path: "/gst/news",
    name: "GST News",
    component: () =>
      import(
        /* webpackChunkName: "gstnews-all-posts" */ "../views/gst-news/AllPosts.vue"
      ),
  },
  {
    path: "/gst/news/:id",
    name: "GST News Single",
    props: true,
    component: () =>
      import(
        /* webpackChunkName: "gstnews-single-post" */ "../views/gst-news/SinglePost.vue"
      ),
  },
  {
    path: "/report-bug",
    name: "Report Bug",
    component: () =>
      import(
        /* webpackChunkName: "gstnews-single-post" */ "../views/report-bug/ReportBug.vue"
      ),
  },
];

const router = new VueRouter({
  routes,
});

// check whether the user is authenticated before loading each route
// see https://v3.router.vuejs.org/guide/advanced/navigation-guards.html#global-before-guards
router.beforeEach((to, _from, next) => {
  if (to.meta.requiresOrgAuth) {
    // login required
    const userOrgAuthStatus = sessionStorage.getItem("userOrgAuthenticated");
    if (userOrgAuthStatus !== "true") {
      next({ name: "User Login" });
    } else {
      next();
    }
  } else {
    next();
  }
});

const defaultDocumentTitle = "GNUKhata";

router.afterEach((to) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} — ${defaultDocumentTitle}`;
  } else {
    document.title = defaultDocumentTitle;
  }
});

export default router;
