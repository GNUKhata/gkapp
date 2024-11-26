<template>
  <b-modal
    size="xl"
    v-model="showModal"
    centered
    static
    body-class="px-0"
    id="print-page-modal"
    hide-footer
    hide-header
  >
    <div id="transaction-print-page">
      <b-container fluid>
        <h3 class="text-center">
          {{ title || name }}
        </h3>
        <br>
        <div class="text-md-right">
          <img
            v-if="orgDetails.logo"
            :src="orgDetails.logo"
            width="30"
            height="30"
            class="rounded d-inline-block align-top"
            alt="Logo"
          >
          <h5 class="d-inline-block ml-2">
            {{ orgDetails.name }}
          </h5>
          <br>
          <p class="ml-3">
            <small>{{ orgDetails.addr1 }}</small> <br>
            <small>{{ orgDetails.addr2 }}</small> <br>
            <small>{{ orgDetails.country }}</small> <br>
            <span v-if="orgDetails.phone">
              <small>Contact No: {{ orgDetails.phone }}</small> <br>
            </span>
            <span v-if="isGstEnabled">
              <small>GSTIN: {{ orgDetails.gstin }}</small>
            </span>
            <span v-if="orgDetails.email">
              <small>Email: {{ orgDetails.email }}</small>
            </span>
            <span v-if="orgDetails.site">
              <small>Website: {{ orgDetails.site }}</small>
            </span>
          </p>
        </div>
      </b-container>
      <br>
      <transaction-profile
        :name="name"
        :id="id"
        :pdata="pdata"
      />
      <div
        id="button-wrapper"
        class="d-print-none"
      >
        <b-button
          @click.prevent="closeModal"
          class="m-1 float-right"
          size="sm"
          variant="danger"
        >
          <b-icon
            aria-hidden="true"
            class="align-middle"
            icon="x-circle"
          />
        </b-button>
        <br>
        <div class="clearfix" />
        <div v-if="useTriplicate">
          <b-button
            class="m-1 float-right"
            @click="toggleTriplicateMenu"
            size="sm"
            variant="primary"
          >
            <b-icon
              aria-hidden="true"
              class="align-middle"
              icon="printer"
            />
            <span class="sr-only">Print</span>
          </b-button>
          <div class="clearfix" />
          <b-collapse
            id="triplicate-wrapper"
            class="shadow-sm"
            v-model="showTripMenu"
          >
            <print-helper
              class="d-block"
              content-id="transaction-print-page"
              variant="link"
              text-mode="Original"
              :page-title="triplicateTitle[0].page"
              :print-styles="printStyles"
              :file-name="triplicateTitle[0].file"
              :message-from-parent="printMessage"
            />
            <print-helper
              class="d-block"
              content-id="transaction-print-page"
              variant="link"
              text-mode="Duplicate"
              :page-title="triplicateTitle[1].page"
              :print-styles="printStyles"
              :file-name="triplicateTitle[1].file"
              :message-from-parent="printMessage"
            />
            <print-helper
              class="d-block"
              content-id="transaction-print-page"
              variant="link"
              text-mode="Triplicate"
              :page-title="triplicateTitle[2].page"
              :print-styles="printStyles"
              :file-name="triplicateTitle[2].file"
              :message-from-parent="printMessage"
            />
          </b-collapse>
        </div>
        <print-helper
          v-else
          class="btn-primary m-1 float-right"
          content-id="transaction-print-page"
          :page-title="printPageTitle"
          :print-styles="printStyles"
          :file-name="printFileTitle"
          :message-from-parent="printMessage"
        />
      </div>
    </div>
  </b-modal>
</template>

<script>
import axios from 'axios';
import { mapGetters } from 'vuex';
import TransactionProfile from '../workflow/profile/Transaction.vue';
import PrintHelper from '../PrintHelper.vue';
export default {
  name: 'PrintPage',
  components: {
    TransactionProfile,
    PrintHelper,
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      required: false,
      default: '',
    },
    name: {
      type: String,
      required: true,
      validator: function(value) {
        return (
          [
            'Invoice',
            'DebitCreditNote',
            'CashMemo',
            'DeliveryNote',
            'PurchaseSalesOrder',
            'TransferNote',
          ].indexOf(value) !== -1
        );
      },
    },
    id: {
      type: Number,
      required: true,
      note: 'Transaction Id',
    },
    pdata: {
      type: Object,
      required: true,
      note: `Data for the Transaction Profiles
        {
          title: {
            page: 'page name',
            file: 'file name
          }
          useTriplicate: Boolean
        }
      `,
    },
  },
  data() {
    return {
      printMessage: 'toggleFlagPrintTrue',
      showTripMenu: false,
      printStyles: `.table .thead-dark th {
          color: #fff !important;
          background-color: #343a40 !important;
          border-color: #454d55 !important;
      }`,
      showModal: false,
      orgDetails: {
        name: '',
        addr1: '',
        addr2: '',
        country: '',
        phone: '',
        email: '',
        site: '',
        gstin: '',
        logo: 'img/gk.png',
      },
    };
  },
  computed: {
    useTriplicate: (self) => !!self.pdata.useTriplicate,
    printPageTitle: (self) => {
      let title = self.title;
      if (self.useTriplicate) {
        title = self.pdata.printTitle.page;
      }
      return title;
    },
    printFileTitle: (self) => {
      let title = self.title.split(' ').join('_');
      if (self.useTriplicate) {
        title = self.pdata.printTitle.file;
      }
      return title;
    },
    triplicateTitle: (self) => {
      return [
        {
          page: `${self.printPageTitle} - Original for Recipient`,
          file: `${self.printFileTitle}_original_for_recipient`,
        },
        {
          page: `${self.printPageTitle} - Duplicate for Transporter`,
          file: `${self.printFileTitle}_duplicate_for_transporter`,
        },
        {
          page: `${self.printPageTitle} - Triplicate for Supplier`,
          file: `${self.printFileTitle}_triplicate_for_supplier`,
        },
      ];
    },
    ...mapGetters('global', ['isGstEnabled']),
  },
  watch: {
    show() {
      this.showModal = this.show;
    },
    showModal(show) {
      if (!show) {
        this.$emit('hidden');
      }
    },
  },
  methods: {
    toggleTriplicateMenu() {
      if (this.useTriplicate) {
        this.showTripMenu = !this.showTripMenu;
      }
    },
    getOrgDetails() {
      const requests = [
        axios.get('/state').catch((e) => e),
        axios.get(`/organisation`).catch((e) => {
          return e;
        }),
        axios.get('/organisation/attachment').catch((e) => e),
      ];
      Promise.all(requests).then(([resp1, resp2, resp3]) => {
        let states = {};
        if (resp1.data.gkstatus === 0) {
          resp1.data.gkresult.forEach((state) => {
            states[Object.values(state)[0]] = Object.keys(state)[0];
          });
        }

        if (resp2.data.gkstatus === 0) {
          const details = resp2.data.gkdata;
          let stateCode = states[details.orgstate] || null;
          this.orgDetails = {
            name: details.orgname,
            addr1: `${details.orgaddr},`,
            addr2: `${details.orgcity} - ${details.orgpincode}. ${details.orgstate}.`,
            country: details.country,
            phone: details.orgtelno,
            email: details.orgemail,
            site: details.orgwebsite,
            gstin: details.gstin && stateCode ? details.gstin[stateCode] : '',
          };
        }
        if (resp3.data.logo !== null) {
          this.orgDetails.logo = `data:image/png;base64,${resp3.data.logo}`;
        } else {
          this.orgDetails.logo = `img/gk.png`;
        }
      });
    },
    closeModal() {
      this.showModal = false;
    },
  },
  mounted() {
    this.getOrgDetails();
  },
};
</script>

<style>
#triplicate-wrapper {
  background-color: white;
  border-radius: 3px;
  border: 1px solid;
}

#triplicate-wrapper > button:not(:last-child) {
  border-bottom: 1px solid;
  display: block !important;
  width: 100%;
}
#button-wrapper {
  position: fixed;
  right: 25px;
  top: 50px;
}
@media screen and (max-width: 576px) {
  #button-wrapper {
    right: 10px;
  }
}
</style>
