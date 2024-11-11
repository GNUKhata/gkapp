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
          <span v-if="form.type === 'credit'"> Credit Note Details </span>
          <span v-else> Debit Note Details </span>
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
        <b-form-group>
          <b-form-radio-group
            button-variant="outline-secondary"
            size="sm"
            buttons
            v-model="form.type"
            @input="onNoteTypeUpdate"
          >
            <b-form-radio value="debit">
              <translate> Debit Note </translate>
            </b-form-radio>
            <b-form-radio value="credit">
              <translate> Credit Note </translate>
            </b-form-radio>
          </b-form-radio-group>
        </b-form-group>
        <b-form-group
          :label="isCredit ? 'Cr Note No.' : 'Dr Note No.'"
          label-for="dcd-input-10"
          label-cols-lg="3"
          label-cols="4"
          label-size="sm"
        >
          <template #label>
            <span
              v-if="isCredit"
              v-translate
            > Cr Note No. </span>
            <span
              v-else
              v-translate
            > Dr Note No. </span>
          </template>
          <b-form-input
            size="sm"
            id="dcd-input-10"
            v-model="form.no"
            trim
            required
          />
        </b-form-group>
        <b-form-group
          id="dcd-input-group-1"
          :label="isCredit ? 'Cr Note Date' : 'Dr Note Date'"
          label-cols-lg="3"
          label-cols="4"
          label-for="dcd-date-1"
          label-size="sm"
        >
          <template #label>
            <span
              v-if="isCredit"
              v-translate
            > Cr Note Date </span>
            <span
              v-else
              v-translate
            > Dr Note Date </span>
          </template>
          <gk-date
            v-model="form.date"
            :format="dateFormat"
            :min="minimumDate"
            :max="maxDate"
            id="dcd-date-1"
            @validity="setDateValidity"
            :required="true"
          />
        </b-form-group>
        <!-- <b-form-group
          label="GSTIN"
          label-for="dcd-input-20"
          label-cols-lg="3"
          label-cols="4"
          label-size="sm"
        >
          <b-form-input
            size="sm"
            id="dcd-input-20"
            v-model="form.gstin"
            trim
            required
            readonly
          ></b-form-input>
        </b-form-group> -->
        <b-form-group
          label="Purpose"
          label-for="dcd-input-20"
          label-size="sm"
          label-cols-lg="3"
          label-cols="4"
        >
          <template #label>
            <translate> Purpose </translate>
          </template>
          <b-form-select
            size="sm"
            id="dcd-input-20"
            v-model="form.purpose"
            required
            tabindex="-1"
            @input="onUpdateDetails"
            :options="options.drcrModes"
            @change="onDropdownChange"
          />
        </b-form-group>
        <b-form-group v-if="isCredit && isReturn && saleFlag">
          <b-form-checkbox
            v-model="form.badQuality"
            size="sm"
          >
            <translate> Bad Quality Goods </translate>
          </b-form-checkbox>
        </b-form-group>
        <b-form-group>
          <b-form-checkbox
            v-model="form.referenceFlag"
            size="sm"
          >
            <translate> Reference (If received) </translate>
          </b-form-checkbox>
        </b-form-group>
        <b-form-group
          v-if="form.referenceFlag"
          :label="isCredit ? 'Dr Note No.' : 'Cr Note No.'"
          label-for="dcd-input-50"
          label-cols-lg="3"
          label-cols="4"
          label-size="sm"
        >
          <template #label>
            <span
              v-if="isCredit"
              v-translate
            > Dr Note No. </span>
            <span
              v-else
              v-translate
            > Cr Note No. </span>
          </template>
          <b-form-input
            size="sm"
            id="dcd-input-50"
            v-model="form.ref.no"
            trim
            required
          />
        </b-form-group>
        <b-form-group
          v-if="form.referenceFlag"
          id="dcd-input-group-2"
          :label="isCredit ? 'Dr Note Date' : 'Cr Note Date'"
          label-cols-lg="3"
          label-cols="4"
          label-for="dcd-date-2"
          label-size="sm"
        >
          <template #label>
            <span
              v-if="isCredit"
              v-translate
            > Dr Note Date </span>
            <span
              v-else
              v-translate
            > Cr Note Date </span>
          </template>
          <gk-date
            v-model="form.ref.date"
            :format="dateFormat"
            :min="refMinDate"
            :max="maxDate"
            id="dcd-date-2"
            @validity="setDateValidity"
            :required="true"
          />
        </b-form-group>
      </div>
    </div>
  </b-card>
</template>

<script>
import axios from 'axios';
// import { mapState } from 'vuex';
import GkDate from '../../GkDate.vue';
import trnDetailsMixin from '@/mixins/transactionProfile.js';
import { DR_CR_MODE } from '@/js/enum.js';
import { EventBus } from '@/js/eventBus';
export default {
  name: 'DcNoteDetails',
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
    invDate: {
      type: String,
      required: false,
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
      date: {
        valid: null,
        format: 'dd-mm-yyyy',
      },
      drNo: '',
      crNo: '',
      form: {
        type: 'credit', // debit, credit
        no: null,
        date: new Date().toISOString().slice(0, 10),
        gstin: null,
        referenceFlag: false,
        badQuality: false,
        purpose: DR_CR_MODE['discount'], // 'qty'
        ref: {
          date: '',
          number: '',
        },
      },
      options: {
        invoices: {
          dr: { sale: [], purchase: [] },
          cr: { sale: [], purchase: [] },
        },
        drcrModes: [
          {
            text: this.$gettext('Adjust Price / Discount'),
            value: DR_CR_MODE['discount'],
          },
          {
            text: this.$gettext('Adjust Qty / Return Goods'),
            value: DR_CR_MODE['returns'],
          },
          {
            text: this.$gettext('Deficiency in services'),
            value: DR_CR_MODE['service_deficiency'],
          },
          {
            text: this.$gettext('Correction in Invoice'),
            value: DR_CR_MODE['inv_correction'],
          },
          {
            text: this.$gettext('Change in POS'),
            value: DR_CR_MODE['pos_change'],
          },
          {
            text: this.$gettext('Finalization of Provisional assessment'),
            value: DR_CR_MODE['prov_assessment'],
          },
          { text: this.$gettext('Others'), value: DR_CR_MODE['others'] },
        ],
      },
    };
  },
  computed: {
    isReturn: (self) => self.form.purpose === 18,
    isCredit: (self) => self.form.type === 'credit',
    minimumDate: (self) => {
      let date = self.reverseDate(self.yearStart);
      let ref = self.form.ref.date ? new Date(self.form.ref.date).getTime : '';
      let inv = self.invDate ? new Date(self.invDate).getTime : '';
      let invDate = inv ? self.reverseDate(self.invDate) : '';
      if (ref) {
        let refDate = self.reverseDate(self.form.ref.date);
        if (inv) {
          date = ref < inv ? refDate : invDate;
        } else {
          date = refDate;
        }
      } else if (inv) {
        date = invDate;
      }
      return date;
    },
    refMinDate: (self) =>
      self.reverseDate(self.invDate ? self.invDate : self.yearStart),
  },
  watch: {
    updateCounter() {
      this.resetForm();
    },
    invDate() {
      this.form.ref.date = this.invDate;
    },
    saleFlag(isSale) {
      if (isSale) {
        this.form.type = 'credit';
      } else {
        this.form.type = 'debit';
      }
    },
  },
  methods: {
    onDropdownChange(value) {
      EventBus.$emit('dropdown-change', value);
    },
    onNoteTypeUpdate() {
      this.setNoteNo();
      this.onUpdateDetails();
    },
    setNoteNo(fetchNew) {
      if (!fetchNew) {
        this.form.no = this.isCredit ? this.crNo : this.drNo;
        if (this.form.no) {
          return;
        }
      } else {
        this.crNo = '';
        this.drNo = '';
      }
      const url = `/drcrnote?drcr=all&drcrflag=${this.isCredit ? 3 : 4}`;
      axios
        .get(url)
        .then((resp) => {
          if (resp.data.gkstatus === 0) {
            let counter = resp.data.gkresult.length;
            let codes = this.config.no.format
              ? this.config.no.format.code
              : { dr: 'DN', cr: 'CN' };
            let code = this.isCredit ? codes.cr : codes.dr;
            this.form.no = this.formatNoteNo(
              this.numberFormat,
              counter + 1,
              code,
              this.form.date,
              this.yearEnd
            );
            if (this.isCredit) {
              this.crNo = this.form.no;
            } else {
              this.drNo = this.form.no;
            }
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
      const self = this;
      setTimeout(() =>
        self.$emit('details-updated', {
          data: self.form,
          name: 'dc-note-details',
          options: {
            isDateValid: self.date.valid,
          },
        })
      );
    },
    resetForm() {
      this.date.valid = null;
      this.form.purpose = DR_CR_MODE['discount'];
      this.form.date = this.getNoteDate();
      this.setNoteNo(true);
      this.onUpdateDetails();
    },
  },
  mounted() {
    this.resetForm(true);
  },
};
</script>
