<template>
  <b-card
    class="mb-2 mb-md-0"
    :class="config.class"
    border-variant="secondary"
    no-body
    v-if="config"
  >
    <div class="p-2 p-md-3">
      <div>
        <b
          class="mr-1"
          v-translate
        > Payment Details </b>
        <gk-tooltip
          help-title="Mode of Payment"
          help-body="Available mode of payments are Cash, Bank, Credit. Default mode is Cash. This option can be changed in Administration > Settings > Transaction > Payment Mode"
        />
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
        <!-- payment details -->
        <b-form-group
          label="Mode of Payment"
          label-for="pmd-input-10"
          label-size="sm"
          label-cols="auto"
          v-if="config.mode"
        >
          <template #label>
            <translate> {{ saleFlag ? 'Mode Of Receipt' : 'Mode of Payment' }} </translate>
          </template>
          <b-form-select
            size="sm"
            id="pmd-input-10"
            v-model.lazy="form.mode"
            :options="options.payModes"
            required
            @input="onUpdateDetails"
          />
        </b-form-group>
        <div v-if="form.mode === 2">
          <b v-translate> Bank Details </b>
          <b-form-group
            label="IFSC"
            label-for="pmd-input-50"
            label-cols="3"
            label-size="sm"
            label-cols-lg="autauto"
            v-if="config.bank.ifsc && isIndia"
          >
            <gk-ifsc
              size="sm"
              @fill="autoFillBankInfo"
              :ifsc-code="form.bank.ifsc"
            />
          </b-form-group>
          <b-form-group
            label="Account Number"
            label-for="pmd-input-20"
            label-cols="3"
            label-size="sm"
            label-cols-lg="autauto"
            v-if="config.bank.no"
          >
            <template #label>
              <translate> Account Number </translate>
            </template>
            <b-form-input
              size="sm"
              id="pmd-input-20"
              v-model="form.bank.no"
              trim
              required
              pattern="[A-Z0-9]+"
            />
          </b-form-group>
          <b-form-group
            label="Bank Name"
            label-for="pmd-input-30"
            label-cols="3"
            label-size="sm"
            label-cols-lg="autauto"
          >
            <template #label>
              <translate> Bank Name </translate>
            </template>
            <b-form-input
              size="sm"
              id="pmd-input-30"
              v-if="config.bank.name"
              v-model="form.bank.name"
              trim
              required
            />
          </b-form-group>
          <b-form-group
            label="Branch"
            label-for="pmd-input-40"
            label-cols="3"
            label-size="sm"
            label-cols-lg="autauto"
            v-if="config.bank.branch"
          >
            <template #label>
              <translate> Branch </translate>
            </template>
            <b-form-input
              size="sm"
              id="pmd-input-40"
              v-model="form.bank.branch"
              trim
              required
            />
          </b-form-group>
        </div>
        <b
          v-if="form.mode === 15"
          v-translate
        >ON CREDIT</b>
      </div>
    </div>
  </b-card>
</template>

<script>
import { mapGetters } from 'vuex';
import GkIfsc from '../../GkIfsc.vue';
import GkTooltip from '@/components/GkTooltip.vue';
export default {
  components: { GkIfsc, GkTooltip },
  name: 'PaymentDetails',
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
    parentData: {
      type: Object,
      required: false,
      default: function() {
        return {
          mode: 3,
          bank: {
            no: null,
            name: null,
            branch: null,
            ifsc: null,
          },
        };
      },
    },
    optionsData: {
      type: Object,
      required: false,
      default: function() {
        return {};
      },
    },
  },
  computed: {
    ...mapGetters('global', ['isIndia']),
  },
  watch: {
    updateCounter() {
      Object.assign(this.form, this.parentData);
    },
  },
  data() {
    return {
      form: {
        // default is cash mode
        mode: 3,
        bank: {
          no: null,
          name: null,
          branch: null,
          ifsc: '',
        },
      },
      options: {
        payModes: [
          { text: '-- Payment Mode --', value: null },
          { text: 'Cash', value: 3 },
          { text: 'Bank', value: 2 },
          { text: 'On Credit', value: 15 },
        ],
      },
      isCollapsed: true,
      ifscCode: '',
    };
  },
  methods: {
    autoFillBankInfo(bank) {
      this.form.bank.name = bank.BANK;
      this.form.bank.branch = bank.BRANCH;
      this.form.bank.ifsc = bank.IFSC;
    },
    onUpdateDetails() {
      this.ifscCode = this.form.bank.ifsc;
      setTimeout(() =>
        this.$emit('details-updated', {
          data: this.form,
          name: 'payment-details',
        })
      );
    },
  },
  mounted() {
    if (this.optionsData.payModes) {
      this.options.payModes = this.optionsData.payModes;
    } else {
      // translating the paymodes
      this.options.payModes = [
        { text: this.$gettext('-- Payment Mode --'), value: null },
        { text: this.$gettext('Cash'), value: 3 },
        { text: this.$gettext('Bank'), value: 2 },
        { text: this.$gettext('On Credit'), value: 15 },
      ];
    }
  },
};
</script>
