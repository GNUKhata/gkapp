<template>
  <b-table-simple responsive>
    <b-thead>
      <b-tr>
        <b-th v-translate>
          Total
        </b-th>
        <b-th
          :style="{minWidth: '70px'}"
          class="text-right text-truncate"
        >
          ₹
        </b-th>
      </b-tr>
    </b-thead>
    <b-tbody>
      <template v-if="isIndia">
        <b-tr v-if="(gstFlag || vatFlag) && config.taxable">
          <b-td v-translate>
            Taxable Amount
          </b-td>
          <b-td class="text-right">
            {{ form.taxable || '-' }}
          </b-td>
        </b-tr>
        <b-tr v-if="gstFlag && cgstFlag && config.igst">
          <b-td>CGST</b-td>
          <b-td class="text-right">
            {{ form.igst / 2 || '-' }}
          </b-td>
        </b-tr>
        <b-tr v-if="gstFlag && cgstFlag && config.igst">
          <b-td>SGST</b-td>
          <b-td class="text-right">
            {{ form.igst / 2 || '-' }}
          </b-td>
        </b-tr>
        <b-tr v-if="gstFlag && !cgstFlag && config.igst">
          <b-td>IGST</b-td>
          <b-td class="text-right">
            {{ form.igst || '-' }}
          </b-td>
        </b-tr>
        <b-tr v-if="gstFlag && config.cess">
          <b-td>CESS</b-td>
          <b-td class="text-right">
            {{ form.cess || '-' }}
          </b-td>
        </b-tr>
        <b-tr v-if="vatFlag && config.vat">
          <b-td>VAT</b-td>
          <b-td class="text-right">
            {{ form.vat || '-' }}
          </b-td>
        </b-tr>
      </template>
      <b-tr v-if="config.discount">
        <b-td v-translate>
          Discount
        </b-td>
        <b-td class="text-right">
          {{ form.discount || '-' }}
        </b-td>
      </b-tr>
      <b-tr v-if="config.value">
        <b-td>
          <span class="float-left">{{ transactionName }}</span>
        </b-td>
        <b-td class="text-right">
          {{ form.amount || '-' }}
        </b-td>
      </b-tr>
      <b-tr v-if="form.roundFlag && config.roundOff">
        <b-td>
          {{ transactionName }} <span v-translate> (Rounded Off) </span>
        </b-td>
        <b-td class="text-right">
          {{ form.rounded || '-' }}
        </b-td>
      </b-tr>
      <b-tr v-if="config.valueText">
        <b-td>
          {{ transactionName }} <span v-translate> (in words) </span>
        </b-td>
        <b-td class="text-right">
          {{ totalText }}
        </b-td>
      </b-tr>
      <b-tr>
        <b-td>
          <b-form-checkbox
            switch
            inline
            size="sm"
            v-model="form.roundFlag"
            v-if="config.roundOff"
            class="ml-2 float-left"
          >
            <translate> Round Off Total Value </translate>
          </b-form-checkbox>
        </b-td>
        <b-td />
      </b-tr>
    </b-tbody>
  </b-table-simple>
</template>

<script>
import { mapGetters } from 'vuex';
import { numberToRupees } from '../../../js/utils';

export default {
  name: 'TotalTable',
  props: {
    config: {
      type: Object,
      required: true,
    },
    billData: {
      type: Array,
      required: true,
    },
    gstFlag: {
      type: Boolean,
      required: true,
    },
    cgstFlag: {
      type: Boolean,
      required: false,
      default: false,
    },
    vatFlag: {
      type: Boolean,
      required: false,
      default: false,
    },
    updateCounter: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  data() {
    return {
      form: {
        taxable: this.getTotal('taxable'),
        igst: this.getTotal('igst', 'amount'),
        cess: this.getTotal('cess', 'amount'),
        vat: this.getTotal('vat', 'amount'),
        discount: this.getTotal('discount', 'total'),
        amount: this.getTotal('total'),
        rounded: Math.round(this.getTotal('total')).toFixed(2),
        text: this.totalText,
        roundFlag: false,
      },
    };
  },
  watch: {
    updateCounter() {
      this.form = {
        taxable: this.getTotal('taxable'),
        igst: this.getTotal('igst', 'amount'),
        cess: this.getTotal('cess', 'amount'),
        vat: this.getTotal('vat', 'amount'),
        discount: this.getTotal('discount', 'total'),
        amount: this.getTotal('total'),
        rounded: Math.round(this.getTotal('total')).toFixed(2),
        text: this.totalText,
        roundFlag: this.form.roundFlag,
      };
      this.onUpdateDetails();
    },
  },
  computed: {
    totalText: (self) => {
      let total = self.form.amount;
      let text = '';
      if (total > 0) {
        if (self.form.roundFlag) {
          total = Math.round(total).toFixed(2);
        }
        text = numberToRupees(total);
      }
      return text;
    },
    transactionName: (self) => {
      return typeof self.config.value === 'object'
        ? self.config.value.text
        : self.$gettext('Grand Total');
    },
    ...mapGetters('global', ['isIndia']),
  },
  methods: {
    onUpdateDetails() {
      setTimeout(() =>
        this.$emit('details-updated', {
          data: this.form,
          name: 'total-table',
        })
      );
    },
    /**
     * getTotal(key)
     *
     * returns the total sum of the given key for all items in bill
     */
    getTotal(key, subKey) {
      let total = 0;
      if (subKey) {
        total = this.billData.reduce((acc, curr) => {
          return (
            parseFloat(acc) +
            (curr[key] ? parseFloat(curr[key][subKey]) || 0 : 0)
          );
        }, 0);
      } else {
        total = this.billData.reduce(
          (acc, curr) => parseFloat(acc) + (parseFloat(curr[key]) || 0),
          0
        );
      }
      if (isNaN(total)) {
        return null;
      }
      return total.toFixed(2);
    },
  },
};
</script>
