<template>
  <div>
    <b-overlay :show="loading">
      <!-- Input area -->
      <b-input-group>
        <b-form-input
          :required="required"
          placeholder="eg: KARB0000001"
          :size="size"
          v-model="bankIfsCode"
          trim
        />
        <!-- Validate button -->
        <b-input-group-append>
          <b-button
            :title="$gettext('validate')"
            @click="validateIfsc"
            size="sm"
            variant="dark"
          >
            <b-icon icon="search" />
          </b-button>
        </b-input-group-append>
      </b-input-group>
    </b-overlay>
    <!-- popup modal -->
    <b-modal
      id="ifsc-info"
      size="md"
      :title="$gettext('IFSC Details')"
      scrollable
      header-bg-variant="dark"
      header-text-variant="light"
      header-class="p-2"
      v-if="ifscData"
    >
      <template #modal-footer>
        <b-button
          variant="dark"
          size="sm"
          @click="autoFill"
        >
          <translate> Auto fill</translate>
        </b-button>
      </template>
      <b-form-group
        label-align="right"
        label-size="sm"
        label-cols="3"
        :label="$gettext('Bank')"
      >
        <b-form-input
          v-model="ifscData.BANK"
          size="sm"
        />
      </b-form-group>
      <b-form-group
        label-align="right"
        label-size="sm"
        label-cols="3"
        :label="$gettext('Branch')"
      >
        <b-form-input
          size="sm"
          v-model="ifscData.BRANCH"
        />
      </b-form-group>

      <b-form-group
        label-align="right"
        label-size="sm"
        label-cols="3"
        :label="$gettext('Center')"
      >
        <b-form-input
          size="sm"
          v-model="ifscData.CENTRE"
        />
      </b-form-group>
      <b-form-group
        label-align="right"
        label-size="sm"
        label-cols="3"
        :label="$gettext('City')"
      >
        <b-form-input
          size="sm"
          v-model="ifscData.CITY"
        />
      </b-form-group>
      <b-form-group
        label-align="right"
        label-size="sm"
        label-cols="3"
        :label="$gettext('Address')"
      >
        <b-form-input
          size="sm"
          v-model="ifscData.ADDRESS"
        />
      </b-form-group>
      <b-form-group
        label-align="right"
        label-size="sm"
        label-cols="3"
        :label="$gettext('State')"
      >
        <b-form-input
          size="sm"
          v-model="ifscData.STATE"
        />
      </b-form-group>
      <b-form-group
        label-align="right"
        label-size="sm"
        label-cols="3"
        :label="$gettext('Contact')"
      >
        <b-form-input
          size="sm"
          v-model="ifscData.CONTACT"
        />
      </b-form-group>
      <b-form-group
        label-align="right"
        label-size="sm"
        label-cols="3"
        :label="$gettext('MICR')"
      >
        <b-form-input
          size="sm"
          v-model="ifscData.MICR"
        />
      </b-form-group>
      <b-badge
        class="mr-2"
        :variant="ifscData.UPI ? 'success' : 'danger'"
      >
        <b-icon
          :icon="ifscData.UPI ? 'check-circle-fill' : 'x-circle-fill'"
        />
        UPI
      </b-badge>
      <b-badge
        class="mr-2"
        :variant="ifscData.RTGS ? 'success' : 'danger'"
      >
        <b-icon
          :icon="ifscData.UPI ? 'check-circle-fill' : 'x-circle-fill'"
        />
        RTGS
      </b-badge>
      <b-badge
        class="mr-2"
        :variant="ifscData.NEFT ? 'success' : 'danger'"
      >
        <b-icon
          :icon="ifscData.UPI ? 'check-circle-fill' : 'x-circle-fill'"
        />
        NEFT
      </b-badge>
      <b-badge
        :variant="ifscData.IMPS ? 'success' : 'danger'"
      >
        <b-icon
          :icon="ifscData.UPI ? 'check-circle-fill' : 'x-circle-fill'"
        />
        IMPS
      </b-badge>
    </b-modal>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'GkIfsc',
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    size: {
      type: String,
      default: 'md',
      description:
        'Default value is "md". Possible values are "sm", "md", "xl"',
    },
    required: {
      type: [String, Boolean],
      default: false,
    },
    value: {
      type: String,
    },
    ifscCode: {
      type: String,
    }
  },
  data() {
    return {
      loading: false,
      ifscData: Object,
      bankIfsCode: this.ifscCode,
    };
  },
  watch: {
    value(c) {
      this.bankIfsCode = c;
    },
  },
  methods: {
    /**
     * send the ifsc object to the parent
     */
    autoFill() {
      this.$emit('fill', this.ifscData);
      this.$bvModal.hide('ifsc-info');
    },
    /**
     * validate the given ifsc string with razorpay/ifsc
     * proxy server & get appropriate response
     */
    validateIfsc() {
      this.loading = true;
      axios
        .get(`/ifsc?check=${this.bankIfsCode}`)
        .then((r) => {
          switch (r.data.gkstatus) {
          case 0:
            this.ifscData = r.data.gkresult;
            this.$emit('change', this.bankIfsCode);
            this.$bvModal.show('ifsc-info');
            break;
          case 1:
            this.$bvToast.toast(this.$gettext('Duplicate Entry'), {
              variant: 'warning',
              solid: true,
            });
            break;
          case 2:
            this.$bvToast.toast(this.$gettext('Unauthorised Access'), {
              variant: 'danger',
              solid: true,
            });
            break;
          case 3:
            this.$bvToast.toast(this.$gettext('Invalid IFSC Code'), {
              variant: 'danger',
              solid: true,
            });
            break;
          case 4:
            this.$bvToast.toast(this.$gettext('No Privilege'), {
              variant: 'danger',
              solid: true,
            });
            break;
          case 5:
            this.$bvToast.toast(this.$gettext('Integrity error'), {
              variant: 'danger',
              solid: true,
            });
            break;
          case 6:
            this.$bvToast.toast(this.$gettext('Proxy Server Error'), {
              variant: 'danger',
              solid: true,
            });
            break;
          }
          this.loading = false;
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            variant: 'danger',
            solid: true,
          });
          this.loading = false;
        });
    },
  },
};
</script>
