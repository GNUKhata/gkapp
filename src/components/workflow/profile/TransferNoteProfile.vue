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
        <b-button
          v-if="!tnote.recieved"
          @click.prevent="onSubmit"
          size="sm"
          variant="success"
        >
          <translate> Approve </translate>
        </b-button>
      </div>
    </div>
    <b-row>
      <b-col
        class="pl-0"
        order="2"
        order-md="1"
      >
        <b-container fluid>
          <b-col class="px-0">
            <b v-translate> Transfer From </b>
            <p class="text-small">
              <span> {{ godown.from.name }} </span> <br>
              <span> {{ godown.from.addr }} </span> <br>
              <span> {{ godown.from.state }} </span> <br>
            </p>
            <br class="d-none d-md-block">
          </b-col>
          <b-col class="px-0">
            <b v-translate> Transfer To </b>
            <p class="text-small">
              <span> {{ godown.to.name }} </span> <br>
              <span> {{ godown.to.addr }} </span> <br>
              <span> {{ godown.to.state }} </span> <br>
            </p>
          </b-col>
          <br class="d-none d-md-block">
        </b-container>
      </b-col>
      <b-col
        cols="12"
        md="6"
        order="1"
        order-md="2"
        class="text-md-right"
      >
        <b v-translate> Transfer Note Details </b>
        <!-- Note Details Table -->
        <b-table-lite
          :items="noteData"
          :fields="['title', 'value']"
          small
          bordered
          thead-class="d-none"
          fixed
          class="text-small table-border-dark"
        >
          <template #cell(value)="data">
            <div v-if="data.item.type === 'receipt'">
              <gk-date
                id="cmd-date-1"
                :format="dateFormat"
                v-model="tnote.rdate"
                :min="minDate"
                :required="true"
                v-if="!data.item.status"
                :input-style="{'max-width': '150px'}"
                class="d-inline-block d-print-none"
              />
              <span v-else>{{ data.value }}</span>
            </div>
            <span v-else>{{ data.value }}</span>
          </template>
        </b-table-lite>
      </b-col>
    </b-row>
    <!-- Content Table -->
    <b-table-lite
      :items="tnote.products"
      :fields="tableFields"
      bordered
      head-variant="dark"
      small
      class="text-small table-border-dark"
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
  </b-container>
</template>

<script>
import axios from 'axios';
import GkDate from '../../GkDate.vue';
export default {
  name: 'TransferNoteProfile',
  components: {
    GkDate,
  },
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
      tableFields: [
        {
          key: 'name',
          label: 'Item',
        },
        { key: 'qty', label: 'Qty' },
      ],
      tnote: {
        no: '',
        gracePeriod: '',
        recieved: false,
        rdate: '',
        date: '',
        dueDate: '',
        products: [],
        designation: '',
        issuer: '',
        packageCount: '',
        transportMode: '',
      },
      godown: {
        from: {
          name: '',
          addr: '',
          id: '',
          state: '',
        },
        to: {
          name: '',
          addr: '',
          id: '',
          state: '',
        },
      },
      toDate: '',
    };
  },
  computed: {
    noteData: (self) => {
      let grace = parseInt(self.tnote.gracePeriod) || 0;
      grace += grace > 1 || grace === 0 ? ' Days' : ' Day';
      let designation = self.tnote.designation
        ? `(${self.tnote.designation})`
        : '';
      return [
        { title: self.$gettext('No.'), value: self.tnote.no },
        { title: self.$gettext('Date'), value: self.tnote.date },
        {
          title: self.$gettext('No. of Packages'),
          value: self.tnote.packageCount,
        },
        {
          title: self.$gettext('Mode of Transport'),
          value: self.tnote.transportMode,
        },
        {
          title: self.$gettext('Grace Period'),
          value: grace,
        },
        {
          title: self.$gettext('Expected Receipt Date'),
          value: self.tnote.dueDate,
        },
        {
          title: self.$gettext('Actual Receipt Date'),
          value: self.tnote.rdate,
          status: self.tnote.recieved,
          type: 'receipt',
        },
        {
          title: self.$gettext('Issued By'),
          value: `${self.tnote.issuer}  ${designation}`,
        },
      ];
    },
    dateFormat: (self) => self.$store.getters['global/getDateFormat'],
    minDate: (self) =>
      self.dateFormat === 'dd-mm-yyyy'
        ? self.tnote.date
        : self.reverseDate(self.tnote.date),
  },
  methods: {
    onSubmit() {
      const payload = {
        transfernoteid: this.id,
        recieveddate: this.tnote.rdate,
      };
      axios.put('/transfernote?received=true', payload).then((resp) => {
        if (resp.data.gkstatus === 0) {
          let log = {
            activity: `transfer note updated; #${this.tnote.no}`,
          };
          axios.post('/log', log);

          this.displayToast(
            this.$gettext(`Success`),
            this.$gettextInterpolate(
              this.$gettext(
                `Transfer Note %{transferNoteNo} was successfully approved!`
              ),
              {
                transferNoteNo: this.tnote.no,
              }
            ),
            'success'
          );
          this.fetchAndUpdateData();
        }
      });
    },
    reverseDate(date) {
      return date
        ? date
          .split('-')
          .reverse()
          .join('-')
        : '';
    },
    formatDetails(details) {
      this.saleFlag = details.psflag === 19;

      this.tnote = {
        no: details.transfernoteno,
        date: details.transfernotedate,
        dueDate: details.duedate,
        gracePeriod: details.grace,
        recieved: details.recieved,
        rdate: details.receiveddate,
        products: [],
        designation: details.designation,
        issuer: details.issuername,
        packageCount: details.nopkt,
        transportMode: details.transportationmode,
      };

      this.godown.from = {
        name: details.fromgodown,
        addr: details.fromgodownaddr,
        id: details.fromgodownid,
        state: details.fromgodownstate,
      };

      this.godown.to = {
        name: details.togodown,
        addr: details.togodownaddr,
        id: details.togodownid,
        state: details.togodownstate,
      };

      this.tnote.products = [];
      for (const name in details.productdetails) {
        const item = details.productdetails[name];
        this.tnote.products.push({
          name: item.productdesc,
          qty: item.qty,
          unit: item.unitname,
          goid: item.goid,
          gsflag: item.gsflag,
          productcode: item.productcode,
        });
      }
    },
    getDetails() {
      return axios
        .get(`/transfernote?tn=single&transfernoteid=${this.id}`)
        .catch((error) => {
          this.$bvToast.toast(`Error: ${error.message}`, {
            title: this.$gettext(`Fetch Transfer Note Error!`),
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
          this.displayToast(
            this.$gettext(`Fetch Transfer Note Error!`),
            this.$gettext(`Unauthorized access, Please contact admin`),
            'warning'
          );
          break;
        default:
          this.displayToast(
            this.$gettext(`Fetch Transfer Note Error!`),
            this.$gettext(`Unable to Fetch Transaction Details! Please Try after sometime.`),
            'warning'
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
    }
  },
};
</script>
