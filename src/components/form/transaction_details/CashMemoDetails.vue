<template>
  <b-card
    v-if="config"
    class="mb-2 mb-md-0"
    :class="config.class"
    border-variant="secondary"
    no-body
  >
    <b-overlay
      :show="isPreloading"
      variant="secondary"
      no-wrap
      blur
    />
    <div class="p-2 p-md-3">
      <div>
        <b v-translate>Cash Memo Details</b>
        <b-button
          variant="secondary"
          size="sm"
          class="float-right p-1 d-md-none"
          @click="
            () => {
              isCollapsed = !isCollapsed;
            }
          "
        >
          <b-icon
            :icon="isCollapsed ? 'dash' : 'arrows-fullscreen'"
            class="float-right"
          />
        </b-button>
      </div>
      <div
        class="mt-3"
        :class="{'d-md-block': true, 'd-none': !isCollapsed}"
      >
        <b-form-group
          label="No."
          label-for="cmd-input-10"
          label-cols-md="4"
          label-cols="3"
          label-size="sm"
        >
          <template #label>
            <translate> No. </translate>
          </template>
          <b-form-input
            size="sm"
            id="cmd-input-10"
            v-model="form.no"
            trim
            required
          />
        </b-form-group>
        <b-form-group
          label="Date"
          label-cols-md="4"
          label-cols="3"
          label-size="sm"
          id="cmd-input-group-1"
        >
          <template #label>
            <translate> Date </translate>
          </template>
          <gk-date
            id="cmd-date-1"
            :format="dateFormat"
            v-model="form.date"
            :min="minDate"
            :max="maxDate"
            @validity="setDateValidity"
            :required="true"
          />
        </b-form-group>
        <b-form-group
          v-if="isIndia"
          label="State"
          label-for="cmd-input-20"
          label-size="sm"
          label-cols-md="4"
          label-cols="3"
        >
          <template #label>
            <translate> State </translate>
          </template>
          <v-select
            size="sm"
            id="cmd-input-20"
            v-model="form.state"
            :options="options.states"
            label="name"
            @input="onSelectState"
            required
          />
        </b-form-group>
        <b-form-group
          v-if="isGstEnabled"
          label="GSTIN"
          label-for="cmd-input-30"
          label-cols-md="4"
          label-cols="3"
          label-size="sm"
        >
          <b-form-input
            size="sm"
            id="cmd-input-30"
            v-model="form.gstin"
            trim
            readonly
          />
        </b-form-group>
        <b-form-group
          :label="saleFlag ? 'From Godown' : 'To Godown'"
          label-for="ivd-input-21"
          label-size="sm"
          label-cols="3"
          label-cols-md="4"
          label-class="required"
        >
          <template #label>
            <span
              v-translate
              v-if="saleFlag"
            > From Godown </span>
            <span
              v-translate
              v-else
            > To Godown </span>
          </template>
          <v-select
            id="ivd-input-21"
            v-model="form.godown"
            :options="options.godowns"
            @input="onUpdateDetails"
            label="text"
            :reduce="(gdata) => gdata.value"
            :required="true"
          />
        </b-form-group>
      </div>
    </div>
  </b-card>
</template>

<script>
import axios from 'axios';
import { mapGetters } from 'vuex';

import GkDate from '../../GkDate.vue';

import trnDetailsMixin from '@/mixins/transactionProfile.js';
export default {
  name: 'CashMemoDetails',
  components: { GkDate },
  mixins: [trnDetailsMixin],
  props: {
    config: {
      type: Object,
      required: true,
    },
    states: {
      type: Object,
      required: false,
    },
    parentData: {
      type: Object,
      required: true,
    },
    updateCounter: {
      type: Number,
      required: false,
      default: 0,
    },
    saleFlag: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      isCollapsed: false,
      isPreloading: false,
      date: {
        format: 'dd-mm-yyyy',
        valid: null,
      },
      memoNo: {
        purchase: '',
        sale: '',
      },
      form: {
        no: null,
        delNoteNo: '',
        date: new Date().toISOString().slice(0, 10),
        state: {name: ''},
        gstin: null,
        godown: null,
        taxState: {},
        options: {
          gstin: {},
        },
      },
      options: {
        godowns: [],
        states: [],
        orgDetails: {},
      },
    };
  },
  computed: {
    ...mapGetters('global', ['isIndia', 'isGstEnabled']),
  },
  watch: {
    saleFlag() {
      this.setNoteNo();
    },
    updateCounter() {
      this.resetForm();
      if (this.parentData.taxState) {
        if (this.parentData.taxState.id) {
          this.form.taxState = this.parentData.taxState;
        }
      }
    },
  },
  methods: {
    setNoteNo(fetchNew) {
      if (!fetchNew) {
        this.form.no = this.saleFlag ? this.memoNo.sale : this.memoNo.purchase;
        if (this.form.no) {
          return;
        }
      } else {
        this.memoNo = {
          purchase: '',
          sale: '',
        };
      }
      let url = `/cashmemo?inoutflag=${this.saleFlag ? 15 : 9}`;
      axios
        .get(url)
        .then((resp) => {
          if (resp.data.gkstatus === 0) {
            let counter = resp.data.gkresult.length;
            let codes = this.config.no.format
              ? this.config.no.format.code
              : { sale: 'CMS', purchase: 'CMP' };
            let code = this.saleFlag ? codes.sale : codes.purchase;
            this.form.no = this.formatNoteNo(
              this.numberFormat,
              counter + 1,
              code,
              this.form.date,
              this.yearEnd
            );
            this.memoNo[this.saleFlag ? 'sale' : 'purchase'] = this.form.no;
          }
        })
        .catch((error) => {
          return error;
        });
    },
    setDateValidity(validity) {
      this.date.valid = validity;
      this.onUpdateDetails();
    },
    onUpdateDetails(extraPayload) {
      let payload = { isDateValid: this.date.valid };

      if (extraPayload && typeof extraPayload === 'object') {
        Object.assign(payload, extraPayload);
      }

      setTimeout(() =>
        this.$emit('details-updated', {
          data: this.form,
          name: 'cash-memo-details',
          options: payload,
        })
      );
    },
    onSelectState() {
      this.onUpdateDetails();
    },
    setOrgDetails() {
      if (this.options.orgDetails !== null) {
        if (this.options.orgDetails.orgname) {
          let orgstate = (this.options.orgDetails.orgstate || '').toLowerCase();
          let state = orgstate
            ? this.options.states.find(
              (state) => state.name.toLowerCase() === orgstate
            )
            : null;
          let stateCode = state ? state.id : '';
          if (stateCode && stateCode < 9) {
            stateCode = `0${stateCode}`;
          }
          let gstin = this.options.orgDetails.gstin;
          Object.assign(this.form, {
            state: state || {name: ''},
            taxState: state || null,
            options: {
              gstin: gstin || {},
            },
            gstin: gstin && state ? gstin[stateCode] : '',
          });
        }
      }
    },
    preloadData() {
      this.isPreloading = true;
      const self = this;
      const requests = [
        axios.get('/state').catch((error) => {
          this.displayToast(
            this.$gettext('Fetch State Data Failed!'),
            error.message,
            'danger'
          );
          return error;
        }),
        axios.get(`/organisation`).catch((error) => {
          this.displayToast(
            this.$gettext('Fetch Organisation Profile Data Failed!'),
            error.message,
            'danger'
          );
          return error;
        }),
        axios.get(`/godown`).catch((error) => {
          this.displayToast(
            this.$gettext('Fetch Godowns Failed!'),
            error.message,
            'danger'
          );
          return error;
        }),
      ];

      return Promise.all(requests)
        .then(([resp1, resp2, resp3]) => {
          if (resp1.data.gkstatus === 0) {
            self.options.states = resp1.data.gkresult.map((item) => {
              return {
                id: Object.keys(item)[0],
                name: Object.values(item)[0],
              };
            });
          }

          if (resp2.data.gkstatus === 0) {
            self.options.orgDetails = resp2.data.gkdata;
            setTimeout(() => {
              self.setOrgDetails();
            }, 1);
            self.onUpdateDetails({
              bankDetails: resp2.data.gkdata.bankdetails,
            });
          }

          if (resp3.data.gkstatus === 0) {
            self.options.godowns = resp3.data.gkresult.map((godown) => {
              return {
                text: `${godown.goname} (${godown.goaddr})`,
                value: godown.goid,
              };
            });
          }
          this.isPreloading = false;
        })
        .catch(() => {
          this.isPreloading = false;
        });
    },
    updateDelNoteNo() {
      const conf = this.config.delNote;
      let codes = { in: 'DIN', out: 'DOUT' };

      if (typeof conf === 'object' && conf.no) {
        if (conf.no.format) {
          codes = conf.no.format.code;
        }
      }

      const self = this;
      return this.fetchDelNoteCounter().then((no) => {
        // debugger;
        let code = self.saleFlag ? codes.out : codes.in;
        let dnNo =
          isNaN(no) || no === -1
            ? no
            : self.formatNoteNo(self.numberFormat, no, code, self.form.date);
        self.form.delNoteNo = dnNo;
        self.onUpdateDetails();
      });
    },
    fetchDelNoteCounter() {
      let trnCode = this.saleFlag ? 15 : 9;
      let url = `/delchal/next_id?status=${trnCode}`;
      return axios
        .get(url)
        .then((resp) => {
          if (resp.data.gkstatus === 0) {
            return resp.data.dcid;
          }
          return -1;
        })
        .catch(() => {
          return -1;
        });
    },
    resetForm() {
      this.setOrgDetails();
      this.form.godown = '';
      this.form.date = this.getNoteDate();
      this.setNoteNo(true);
      this.$nextTick().then(() => {
        this.form.godown = this.$store.getters['global/getDefaultGodown'];
      });
      this.updateDelNoteNo();
      this.onUpdateDetails();
    },
  },
  mounted() {
    const self = this;
    this.preloadData().then(() => {
      self.resetForm();
    });
  },
};
</script>
