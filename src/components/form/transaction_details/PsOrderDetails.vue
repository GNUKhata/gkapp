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
        <b>
          <span
            v-if="saleFlag"
            v-translate
          > Sale Order Details </span>
          <span
            v-else
            v-translate
          > Purchase Order Details </span>
        </b>
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
        <b-row>
          <b-col
            v-if="config.no"
            cols="12"
          >
            <b-form-group
              label="No."
              label-for="pod-input-10"
              label-cols="3"
              label-cols-md="4"
              label-size="sm"
              label-class="required"
            >
              <template #label>
                <translate> No. </translate>
              </template>
              <b-form-input
                size="sm"
                id="pod-input-10"
                v-model="form.no"
                trim
                required
              />
            </b-form-group>
          </b-col>
          <b-col
            v-if="config.date"
            cols="12"
          >
            <b-form-group
              label="Date"
              label-cols="3"
              label-cols-md="4"
              label-size="sm"
              id="pod-input-group-1"
              label-class="required"
            >
              <template #label>
                <translate> Date </translate>
              </template>
              <gk-date
                id="pod-date-1"
                :format="dateFormat"
                v-model="form.date"
                :min="minDate"
                :max="maxDate"
                @validity="setDateValidity"
                :required="true"
              />
            </b-form-group>
          </b-col>
        </b-row>
        <b-row>
          <b-col
            cols="12"
            v-if="config.gstin && isGstEnabled"
          >
            <b-form-group
              label="GSTIN"
              label-for="pod-input-20"
              label-cols="3"
              label-cols-md="4"
              label-size="sm"
            >
              <b-form-input
                size="sm"
                id="pod-input-20"
                v-model="form.gstin"
                trim
                required
                readonly
              />
            </b-form-group>
          </b-col>
          <b-col
            cols="12"
            v-if="saleFlag && config.addr"
          >
            <b-form-group
              label-cols="3"
              label-cols-md="4"
              label="Address"
              label-for="pod-input-30"
              label-size="sm"
            >
              <template #label>
                <translate> Address </translate>
              </template>
              <b-form-textarea
                size="sm"
                id="pod-input-30"
                v-model="form.addr"
                rows="2"
                max-rows="2"
                trim
                required
                readonly
                tabindex="-1"
              />
            </b-form-group>
          </b-col>
          <b-col
            class="pr-lg-2"
            cols="12"
            v-if="saleFlag && config.pin"
          >
            <b-form-group
              label-cols="3"
              label-cols-md="4"
              label="Postal Code"
              label-for="pod-input-40"
              label-size="sm"
            >
              <b-form-input
                size="sm"
                id="pod-input-40"
                v-model="form.pin"
                trim
                readonly
                tabindex="-1"
              />
            </b-form-group>
          </b-col>
          <b-col
            v-if="config.state && isIndia"
          >
            <b-form-group
              label="State"
              label-for="pod-input-50"
              label-size="sm"
              :label-cols="3"
              :label-cols-md="4"
            >
              <template #label>
                <translate> State </translate>
              </template>
              <b-form-select
                size="sm"
                id="pod-input-50"
                v-model="form.state"
                :options="options.states"
                required
                disabled
                tabindex="-1"
              />
            </b-form-group>
          </b-col>
        </b-row>
        <b-row v-if="saleFlag">
          <b-col
            v-if="config.issuer"
            cols="12"
          >
            <b-form-group
              label="Issuer"
              label-for="pod-input-60"
              label-cols="3"
              label-cols-md="4"
              label-size="sm"
            >
              <template #label>
                <translate> Issuer </translate>
              </template>
              <b-form-input
                size="sm"
                id="pod-input-60"
                v-model="form.issuer"
                trim
                required
                readonly
                tabindex="-1"
              />
            </b-form-group>
          </b-col>
          <b-col
            v-if="config.role"
            cols="12"
          >
            <b-form-group
              label="Role"
              label-for="pod-input-70"
              label-cols="3"
              label-cols-md="4"
              label-size="sm"
            >
              <template #label>
                <translate> Role </translate>
              </template>
              <b-form-input
                size="sm"
                id="pod-input-70"
                v-model="form.role"
                trim
                required
                readonly
                tabindex="-1"
              />
            </b-form-group>
          </b-col>
        </b-row>
        <b-row>
          <b-col
            v-if="config.terms"
            cols="12"
          >
            <b-form-group
              label="Terms"
              label-for="pod-input-80"
              label-size="sm"
              label-cols="3"
              label-cols-md="4"
            >
              <template #label>
                <translate> Terms </translate>
              </template>
              <b-form-input
                size="sm"
                id="pod-input-80"
                v-model="form.terms"
                trim
              />
            </b-form-group>
          </b-col>
          <b-col
            v-if="config.creditPeriod"
            cols="12"
          >
            <b-form-group
              label="Credit Period"
              label-for="pod-input-90"
              label-cols="3"
              label-cols-md="4"
              label-size="sm"
            >
              <template #label>
                <translate> Credit Period </translate>
              </template>
              <b-form-input
                size="sm"
                id="pod-input-90"
                v-model="form.creditPeriod"
                trim
                type="number"
                no-wheel
                min="0"
              />
            </b-form-group>
          </b-col>
          <b-col
            cols="12"
            v-if="config.godown"
          >
            <b-form-group
              :label="saleFlag ? 'Dispatch From' : 'Dispatch To'"
              label-for="pod-input-100"
              label-cols="3"
              label-cols-md="4"
              label-size="sm"
              label-class="required"
            >
              <template #label>
                <span
                  v-if="saleFlag"
                  v-translate
                > Dispatch From </span>
                <span
                  v-else
                  v-translate
                > Dispatch To </span>
              </template>
              <v-select
                id="pod-input-100"
                v-model="form.godown"
                :options="options.godowns"
                @input="onUpdateDetails"
                required
                label="text"
                :reduce="(gdata) => gdata.value"
              />
            </b-form-group>
          </b-col>
        </b-row>
      </div>
    </div>
  </b-card>
</template>

<script>
import axios from 'axios';
import { mapGetters} from 'vuex';

import GkDate from '../../GkDate.vue';

import trnDetailsMixin from '@/mixins/transactionProfile.js';

export default {
  name: 'PsOrderDetails',
  components: {
    GkDate,
  },
  mixins: [trnDetailsMixin],
  props: {
    saleFlag: {
      type: Boolean,
      required: true,
    },
    config: {
      type: Object,
      required: true,
    },
    updateCounter: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  data() {
    return {
      isCollapsed: false,
      isPreloading: false,
      orderNo: {
        purchase: '',
        sale: '',
      },
      date: {
        format: 'dd-mm-yyyy',
        valid: null,
      },
      form: {
        no: null,
        date: new Date().toISOString().slice(0, 10),
        addr: null,
        pin: null,
        gstin: null,
        state: {},
        issuer: null,
        role: null,
        terms: null,
        creditPeriod: null,
        godown: '',
      },
      options: {
        states: [],
        orgDetails: {},
        godowns: [],
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
    },
  },
  methods: {
    setNoteNo(fetchNew) {
      if (!fetchNew) {
        this.form.no = this.saleFlag
          ? this.orderNo['sale']
          : this.orderNo['purchase'];
        if (this.form.no) {
          return;
        }
      } else {
        this.orderNo = {
          sale: '',
          purchase: '',
        };
      }
      let url = `/purchaseorder?psflag=${this.saleFlag ? 19 : 16}`;
      axios
        .get(url)
        .then((resp) => {
          if (resp.data.gkstatus === 0) {
            let counter = resp.data.gkresult.length;
            let codes = this.config.no.format
              ? this.config.no.format.code
              : { sale: 'SO', purchase: 'PO' };
            let code = this.saleFlag ? codes.sale : codes.purchase;
            this.form.no = this.formatNoteNo(
              this.numberFormat,
              counter + 1,
              code,
              this.form.date,
              this.yearEnd
            );
            this.orderNo[this.saleFlag ? 'sale' : 'purchase'] = this.form.no;
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
    onUpdateDetails() {
      setTimeout(() =>
        this.$emit('details-updated', {
          data: this.form,
          name: 'ps-order-details',
          options: {
            isDateValid: this.date.valid,
          },
        })
      );
    },
    fetchUserData() {
      let self = this;
      return axios
        .get(`/gkuser`)
        .then((resp) => {
          // === User name and role ===
          if (resp.status === 200) {
            if (resp.data.gkstatus === 0) {
              self.form.issuer = resp.data.gkresult.username;
              self.form.role = resp.data.gkresult.userroleName;
            } else {
              // User data not available, check again
            }
          } else {
            // User data not available, check again
          }
        })
        .catch((error) => {
          this.displayToast(
            this.$gettext('Fetch User Data Failed!'),
            error.message,
            'danger'
          );
          return error;
        });
    },
    setOrgDetails() {
      if (this.options.orgDetails !== null) {
        if (this.options.orgDetails.orgname) {
          let orgstate = (this.options.orgDetails.orgstate || '').toLowerCase();
          let state = orgstate
            ? this.options.states.find(
              (state) => state.text.toLowerCase() === orgstate
            )
            : null;
          let gstin = this.options.orgDetails.gstin;
          Object.assign(this.form, {
            addr: this.options.orgDetails.orgaddr,
            pin: this.options.orgDetails.orgpincode,
            state: state ? state.value : {},
            options: {
              gstin: gstin || {},
            },
            gstin: gstin && state ? gstin[state.value.id] : '',
          });
        }
      }
    },
    preloadData() {
      this.isPreloading = true;
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
        this.fetchUserData(),
      ];
      const self = this;
      return Promise.all(requests)
        .then(([resp1, resp2, resp3]) => {
          this.isPreloading = false;
          if (resp1.data.gkstatus === 0) {
            self.options.states = resp1.data.gkresult.map((item) => {
              return {
                text: Object.values(item)[0],
                value: {
                  id: Object.keys(item)[0],
                  name: Object.values(item)[0],
                },
              };
            });
          }
          if (resp2.data.gkstatus === 0) {
            self.options.orgDetails = resp2.data.gkdata;
            setTimeout(() => {
              self.setOrgDetails();
            }, 1);
          }
          if (resp3.data.gkstatus === 0) {
            self.options.godowns = resp3.data.gkresult.map((godown) => {
              return {
                text: `${godown.goname} (${godown.goaddr})`,
                value: godown.goid,
              };
            });
          }
        })
        .catch(() => {
          this.isPreloading = false;
        });
    },
    resetForm() {
      const self = this;
      this.$forceUpdate();
      this.$nextTick().then(() => {
        self.setOrgDetails();
        self.form.date = self.getNoteDate();
        self.form.terms = null;
        self.form.creditPeriod = null;
        self.form.godown = '';
        self.setNoteNo(true);
        if (self.form.godown === '') {
          self.$store.dispatch('global/initDefaultGodown').then((defGodown) => {
            self.form.godown = defGodown;
          });
        }
        self.onUpdateDetails();
      });
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
