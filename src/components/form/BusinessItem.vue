<template>
  <div
    class="card"
    :style="{minWidth: '300px'}"
  >
    <b-overlay
      :show="isPreloading"
      variant="secondary"
      no-wrap
      blur
    />
    <div class="card-header bg-dark text-left text-light py-2">
      <b v-translate>Business Item Details</b>
      <slot name="close-button" />
    </div>
    <div class="card-body pb-2 px-1 px-md-3">
      <b-form
        class="text-left px-2"
        @submit.prevent="confirmOnSubmit"
      >
        <b-row>
          <b-col class="mb-3 px-3">
            <b-row>
              <b-col
                cols="5"
                class="mb-3"
              >
                <b-form-radio-group
                  button-variant="outline-dark"
                  v-model="type"
                  buttons
                  size="sm"
                  name="filter-form-sort"
                  @change="resetForm"
                >
                  <b-form-radio value="product">
                    <translate> Product </translate>
                  </b-form-radio>
                  <b-form-radio value="service">
                    <translate> Service </translate>
                  </b-form-radio>
                </b-form-radio-group>
              </b-col>
              <b-col
                cols="12"
                sm="7"
              >
                <b-form-group
                  label-size="sm"
                  label="Name"
                  label-for="bi-input-1"
                  label-cols="auto"
                  label-class="required"
                >
                  <template #label>
                    <translate> Name </translate>
                  </template>
                  <b-form-input
                    size="sm"
                    id="bi-input-1"
                    placeholder=""
                    v-model="form.name"
                    trim
                    required
                  />
                </b-form-group>
              </b-col>
            </b-row>
            <!-- price card -->
            <b-card
              border-variant="dark"
              no-body
            >
              <b-card-body class="p-2 mb-2">
                <b b-translate>Price</b>
                <b-form-group
                  label-size="sm"
                  label="Cost Price"
                  label-for="bi-input-4"
                  label-cols="3"
                  v-if="!isService"
                >
                  <template #label>
                    <translate> Cost Price </translate>
                  </template>
                  <b-input-group
                    size="sm"
                    append="₹"
                  >
                    <b-form-input
                      id="bi-input-4"
                      placeholder=""
                      v-model="form.mrp"
                      type="number"
                      no-wheel
                      step="0.01"
                    />
                  </b-input-group>
                </b-form-group>
                <b-form-group
                  label-size="sm"
                  label="Sale Price"
                  label-for="bi-input-5"
                  label-cols="3"
                >
                  <template #label>
                    <span v-if="isGstEnabled || isVatEnabled">
                      Taxable
                    </span>
                    Sale Price
                  </template>
                  <b-input-group
                    append="₹"
                    size="sm"
                  >
                    <b-form-input
                      size="sm"
                      id="bi-input-5"
                      placeholder=""
                      v-model="form.salePrice"
                      type="number"
                      no-wheel
                      step="0.01"
                    />
                  </b-input-group>
                </b-form-group>
                <b-form-group
                  label-size="sm"
                  label="Discount"
                  label-for="bi-input-6"
                  label-cols="3"
                >
                  <template #label>
                    <translate> Discount </translate>
                  </template>
                  <b-row>
                    <b-col class="pr-1">
                      <b-input-group
                        append="₹"
                        size="sm"
                      >
                        <b-form-input
                          size="sm"
                          id="bi-input-6"
                          placeholder=""
                          v-model="form.discountAmount"
                          type="number"
                          no-wheel
                          step="0.01"
                        />
                      </b-input-group>
                    </b-col>
                    <b-col class="pl-1">
                      <b-input-group
                        append="%"
                        size="sm"
                      >
                        <b-form-input
                          size="sm"
                          id="bi-input-11"
                          placeholder=""
                          v-model="discountPercentage"
                          type="number"
                          no-wheel
                          step="0.01"
                        />
                      </b-input-group>
                    </b-col>
                  </b-row>
                </b-form-group>
              </b-card-body>
            </b-card>
            <!-- Stock -->
            <b-card
              border-variant="dark"
              class="mt-2"
              v-if="!isService"
              no-body
            >
              <b-card-body class="p-2">
                <b>Stock</b>
                <b-form-group
                  label-size="sm"
                  label="Unit of Measure"
                  label-for="bi-input-2"
                  label-cols="3"
                  label-class="required"
                >
                  <template #label>
                    <translate> Unit of Measure </translate>
                  </template>
                  <v-select
                    id="bi-input-2"
                    v-model="uom"
                    :options="options.uom"
                    label="name"
                  >
                    <template #search="{attributes, events}">
                      <input
                        class="vs__search"
                        :required="!uom"
                        v-bind="attributes"
                        v-on="events"
                      >
                    </template>
                  </v-select>
                </b-form-group>
                <b-form-group
                  label-size="sm"
                  label="Opening Stock"
                  label-for="bi-input-3"
                  label-cols="3"
                  v-if="!form.stock.godownFlag"
                >
                  <template #label>
                    <translate> Opening Stock </translate>
                  </template>
                  <b-input-group
                    :append="form.uomCode"
                    size="sm"
                  >
                    <b-form-input
                      size="sm"
                      id="bi-input-3"
                      placeholder=""
                      v-model="form.stock.value"
                      type="number"
                      no-wheel
                      step="0.01"
                    />
                  </b-input-group>
                </b-form-group>
                <b-card no-body>
                  <div class="p-2">
                    <div class="mb-2">
                      <b v-translate>Opening Stock</b>
                      <b-button
                        size="sm"
                        class="mx-1 py-0 px-1 float-right"
                        @click.prevent="addGodown"
                        variant="success"
                      >
                        <translate> + Stock </translate>
                      </b-button>
                      <b-button
                        class="mx-1 py-0 px-1 float-right"
                        size="sm"
                        variant="success"
                        @click.prevent="showGodownForm = true"
                      >
                        <translate> + Godown </translate>
                      </b-button>
                      <div class="clearfix" />
                    </div>
                    <div v-if="form.stock.godownFlag">
                      <b-input-group
                        v-for="(godown, index) in godownItems"
                        :key="index"
                        class="mb-1"
                        :id="'vat-inp-' + index"
                      >
                        <b-input-group-prepend>
                          <b-form-select
                            size="sm"
                            style="max-width: 150px"
                            v-model="godownItems[index].id"
                            :options="options.godowns"
                            :required="!!godownItems.qty"
                            :readonly="!index"
                            @change="warnDuplicateGodown"
                          />
                        </b-input-group-prepend>
                        <b-form-input
                          size="sm"
                          v-model="godown.qty"
                          type="number"
                          no-wheel
                          step="0.01"
                          placeholder="Stock Qty"
                        />
                        <b-form-input
                          size="sm"
                          v-model="godown.rate"
                          type="number"
                          no-wheel
                          step="0.01"
                          placeholder="Stock Value (Cost Price x Stock Qty)"
                        />
                        <b-input-group-append>
                          <b-button
                            size="sm"
                            @click.prevent="deleteGodown(index)"
                            :disabled="!index"
                            variant="danger"
                          >
                            <B-Icon
                              icon="trash"
                              variant="light"
                            />
                          </b-button>
                        </b-input-group-append>
                      </b-input-group>
                    </div>
                  </div>
                </b-card>
              </b-card-body>
            </b-card>
          </b-col>
          <b-col
            v-if="isIndia"
            cols="12"
            :md="inOverlay ? 12 : 6"
            lg="6"
            class="mb-3"
          >
            <b-card
              no-body
              border-variant="dark"
            >
              <b-card-body cla="p-2">
                <b>Tax</b>
                <b-row>
                  <b-col cols="12">
                    <div v-if="isGstEnabled">
                      <b-form-group
                        label-size="sm"
                        :label="isService ? 'SAC' : 'HSN'"
                        label-for="bi-input-10"
                        label-cols="3"
                        :label-class="isHsnRequired ? 'required' : ''"
                      >
                        <gk-hsn
                          v-model="form.hsn"
                          :required="isHsnRequired"
                        />
                      </b-form-group>

                      <!-- GST -->
                      <b-form-group
                        label-size="sm"
                        label="GST"
                        label-for="bi-input-7"
                        label-cols="3"
                        class="mb-0"
                      >
                        <b-input-group
                          append="%"
                          size="sm"
                        >
                          <b-form-select
                            size="sm"
                            id="bi-input-7"
                            v-model="form.tax.gsts[0].rate"
                            :options="gstRates"
                            :disabled="form.tax.gstFlag"
                          />
                        </b-input-group>
                      </b-form-group>
                      <b-form-checkbox
                        size="sm"
                        v-model="form.tax.gstFlag"
                        class="d-inline-block float-right mb-2"
                        switch
                      >
                        <small>
                          <translate>
                            Add GST rates based on date of applicability
                          </translate>
                        </small>
                      </b-form-checkbox>
                      <div class="clearfix" />
                      <b-form-group
                        label-size="sm"
                        label="CESS"
                        label-for="bi-input-8"
                        label-cols="3"
                      >
                        <b-input-group
                          append="%"
                          size="sm"
                        >
                          <b-form-input
                            size="sm"
                            id="bi-input-8"
                            placeholder=""
                            v-model="form.tax.cess"
                            type="number"
                            no-wheel
                            step="0.01"
                          />
                        </b-input-group>
                      </b-form-group>
                      <b-collapse v-model="form.tax.gstFlag">
                        <b-card no-body>
                          <b-card-body
                            class="p-2"
                            style="min-height: 50px"
                          >
                            <div class="mb-2">
                              <b>GST</b>
                              <b-button
                                size="sm"
                                @click.prevent="addGst"
                                class="px-1 py-0 float-right"
                              >
                                + GST
                              </b-button>
                            </div>
                            <b-table-lite
                              bordered
                              head-variant="dark"
                              striped
                              small
                              class="text-small table-border-dark"
                              tbody-tr-class="gk-vertical-row"
                              :items="form.tax.gsts"
                              :fields="[
                                {key: 'rate', label: 'Rate %'},
                                {key: 'from', label: 'Applicable From'},
                                {key: 'edit', label: ''},
                              ]"
                            >
                              <template #cell(rate)="data">
                                <b-form-select
                                  size="sm"
                                  id="bi-input-7"
                                  v-model="form.tax.gsts[data.index].rate"
                                  :options="gstRates"
                                />
                              </template>
                              <template #cell(from)="data">
                                <gk-date
                                  v-model="form.tax.gsts[data.index].from"
                                  :id="`gst-from-${data.index}`"
                                  :input-style="{'max-width': '120px'}"
                                  :min="form.tax.gsts[data.index].min"
                                  @validity="
                                    updateGstDateValidity($event, data.index)
                                  "
                                  @input="updateGst"
                                  :readonly="!data.index"
                                />
                              </template>
                              <template #cell(edit)="data">
                                <b-button
                                  variant="secondary"
                                  size="sm"
                                  @click.prevent="deleteGst(data.index)"
                                  :disabled="!data.index"
                                >
                                  -
                                </b-button>
                              </template>
                            </b-table-lite>
                          </b-card-body>
                        </b-card>
                      </b-collapse>
                    </div>
                    <b-form-group
                      v-if="isVatEnabled"
                      label-size="sm"
                      label="CVAT"
                      label-for="bi-input-9"
                      label-cols="3"
                    >
                      <b-input-group
                        append="%"
                        size="sm"
                      >
                        <b-form-input
                          size="sm"
                          id="bi-input-9"
                          placeholder=""
                          v-model="form.tax.cvat"
                          type="number"
                          no-wheel
                          step="0.01"
                        />
                      </b-input-group>
                    </b-form-group>
                    <b-card
                      v-if="isVatEnabled"
                      no-body
                      class="mt-2 mb-2"
                    >
                      <b-card-body
                        class="px-2 pb-3"
                        style="min-height: 50px"
                      >
                        <div class="mb-2">
                          <b>VAT</b>
                          <b-button
                            size="sm"
                            @click.prevent="addVat"
                            class="px-1 py-0 float-right"
                          >
                            + VAT
                          </b-button>
                        </div>
                        <b-input-group
                          v-for="(vat, index) in form.tax.vat"
                          :key="index"
                          class="mb-2"
                          :id="'vat-inp-' + index"
                          size="sm"
                        >
                          <b-input-group-prepend>
                            <b-form-select
                              size="sm"
                              style="max-width: 150px"
                              v-model="vat.state"
                              :options="options.states"
                              :required="!!vat.rate"
                            />
                          </b-input-group-prepend>
                          <b-form-input
                            size="sm"
                            v-model="vat.rate"
                            type="number"
                            no-wheel
                            step="0.01"
                            placeholder="VAT %"
                          />
                          <b-input-group-append>
                            <b-button
                              size="sm"
                              @click.prevent="deleteVat(index)"
                            >
                              -
                            </b-button>
                          </b-input-group-append>
                        </b-input-group>
                      </b-card-body>
                    </b-card>
                    <b-alert
                      v-if="!isGstEnabled && !isVatEnabled"
                      show
                      variant="warning"
                      class="mt-2"
                    >
                      Please add a valid GSTIN/TIN in organisation settings to
                      enable GST/VAT options
                    </b-alert>
                  </b-col>
                </b-row>
              </b-card-body>
            </b-card>
          </b-col>
        </b-row>
        <hr class="my-2">
        <div>
          <div class="float-right">
            <b-button
              v-if="!hideBackButton"
              size="sm"
              class="m-1"
              variant="danger"
              @click.prevent="$router.go(-1)"
            >
              <b-icon
                aria-hidden="true"
                class="align-middle mr-1"
                icon="arrow-left"
              />
              <span
                class="align-middle"
                v-translate
              >Back</span>
            </b-button>
            <b-button
              size="sm"
              class="m-1"
              variant="warning"
              @click.prevent="resetForm"
            >
              <b-icon
                aria-hidden="true"
                class="align-middle mr-1"
                icon="arrow-repeat"
              />
              <span
                class="align-middle"
                v-translate
              >Reset</span>
            </b-button>
            <b-button
              size="sm"
              type="submit"
              class="m-1"
              variant="success"
              :disabled="gstDateValidity === false"
            >
              <b-spinner
                v-if="isLoading"
                small
              />
              <b-icon
                v-else
                aria-hidden="true"
                class="align-middle mr-1"
                icon="plus-square"
              />
              <span
                class="align-middle"
                v-translate
              >Save</span>
            </b-button>
          </div>
        </div>
      </b-form>
    </div>
    <b-modal
      size="lg"
      v-model="showGodownForm"
      centered
      static
      body-class="p-0"
      id="contact-item-modal"
      hide-footer
      hide-header
    >
      <godown
        :hide-back-button="true"
        mode="create"
        :in-overlay="true"
        :on-save="onGodownSave"
      >
        <template #close-button>
          <b-button
            size="sm"
            class="float-right py-0 p-0"
            variant="dark"
            @click.prevent="
              () => {
                showGodownForm = false;
              }
            "
          >
            <b-icon icon="x-circle" />
          </b-button>
        </template>
      </godown>
    </b-modal>
  </div>
</template>

<script>
import axios from 'axios';
import { mapGetters, mapState } from 'vuex';
import Godown from './Godown';
import GkDate from '../GkDate.vue';
import GkHsn from '../GkHsn.vue';

export default {
  name: 'BusinessItem',
  components: { Godown, GkDate, GkHsn },
  props: {
    mode: {
      type: String,
      validator: function(value) {
        return ['create', 'edit'].indexOf(value) !== -1;
      },
      required: true,
    },
    onSave: {
      type: Function,
      required: false,
    },
    hideBackButton: {
      type: Boolean,
      required: false,
      default: false,
    },
    inOverlay: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      invalidProduct: true,
      showGodownForm: false,
      type: 'product', // product, service
      isLoading: false,
      isPreloading: false,
      showOptional: false,
      uomCode: 'UOM',
      options: {
        godowns: [],
        states: [],
        stateCodes: [],
        uom: [],
        uomIds: [],
      },
      uomTyped: '',
      form: {
        name: null,
        uom: null,
        stock: {
          godownFlag: true,
          godowns: [
            {
              id: '',
              qty: null,
              rate: null,
            },
          ], // opening stock based on godown
          value: 0, // opening stock
        },
        mrp: null,
        salePrice: null,
        discountAmount: null,
        discountPercent: null,
        tax: {
          cess: null,
          gst: null,
          gsts: [{ rate: 0, from: '' }],
          cvat: null,
          vat: [],
          gstFlag: false,
        },
        hsn: null,
      },
      uom: { name: '' },
    };
  },
  computed: {
    defaultGodown: (self) => self.$store.getters['global/getDefaultGodown'],
    gstDateValidity: (self) =>
      self.form.tax.gsts.reduce((acc, gst) => acc && gst.dateValidity, true),
    gstRates: (self) => self.$store.getters['global/getGstRates'],
    isHsnRequired: (self) => self.form.tax.gst > 0 || self.form.tax.cess > 0,
    isService: (self) => self.type === 'service',
    formType: (self) => (self.type === 'product' ? 'Product' : 'Service'),
    formMode: (self) => (self.mode === 'create' ? 'Create' : 'Edit'),
    titleIcon: (self) =>
      self.type === 'product' ? 'cart-variant' : 'face-agent',
    discountPercentage: {
      get: function () {
        return parseFloat(
          parseFloat(
            this.form.discountAmount * 100 / this.form.salePrice
          ).toFixed(2)
        );
      },
      set: function (discount) {
        this.form.discountAmount = parseFloat(
          discount * this.form.salePrice / 100
        ).toFixed(2);
      }
    },
    vatLength: (self) => self.form.tax.vat.length,
    godownLength: (self) => self.form.stock.godowns.length,
    godownItems: (self) => {
      for (var i = 0; i < self.form.stock.godowns.length; i++) {
        let godown = self.form.stock.godowns[i];
        godown.rate = self.form.mrp * godown.qty;
      }
      return self.form.stock.godowns
    },
    ...mapState(['yearStart', 'yearEnd', 'orgGstin']),
    ...mapGetters('global', ['isIndia', 'isGstEnabled', 'isVatEnabled']),
  },
  watch: {
    uom(newValue) {
      if (newValue) {
        this.form.uom = newValue.id;
        this.form.uomCode = newValue.code;
      }
    },
  },
  methods: {
    updateGstDateValidity(validity, index) {
      if (index === 0 && validity === null) {
        validity = true;
      }
      this.form.tax.gsts[index].dateValidity = validity;
    },
    addVat() {
      this.form.tax.vat.push({ state: '', rate: null });
      setTimeout(() => {
        document
          .getElementById(`vat-inp-${this.vatLength - 1}`)
          .scrollIntoView();
      }, 200);
    },
    deleteVat(index) {
      this.form.tax.vat.splice(index, 1);
    },
    updateGst() {
      let prev = null;
      let gsts = this.form.tax.gsts;
      if (gsts.length) {
        gsts.forEach((item) => {
          if (prev) {
            let min = '';
            let lastDate = new Date(prev.from);
            let minDate = new Date(lastDate.getTime() + 24 * 60 * 60 * 1000);
            min = this.dateReverse(minDate.toISOString().substr(0, 10));
            item.min = min;
          } else {
            item.min = this.dateReverse(item.from);
          }
          prev = item;
        });
      }
    },
    addGst() {
      let gsts = this.form.tax.gsts;
      let min = '';
      if (gsts.length && gsts[gsts.length - 1].from) {
        let lastDate = new Date(gsts[gsts.length - 1].from);
        let minDate = new Date(lastDate.getTime() + 24 * 60 * 60 * 1000);
        min = this.dateReverse(minDate.toISOString().substr(0, 10));
      }
      this.form.tax.gsts.push({
        rate: 0,
        from: null,
        min: min,
        dateValidity: true,
      });
    },
    deleteGst(index) {
      this.form.tax.gsts.splice(index, 1);
    },
    warnDuplicateGodown() {
      let selectedGodowns = []
      this.godownItems.forEach((obj) => {
        if (selectedGodowns.includes(obj.id)) {
          let godown = this.options.godowns.find(item => item.value === obj.id);
          this.$bvToast.toast(
            this.$gettext(
              `Multiple entries found for godown "${godown.text}",
               sum of all entries will be submitted.`
            ),
            {
              title: `Duplication Error!`,
              autoHideDelay: 3000,
              variant: 'warning',
              appendToast: true,
              solid: true,
            }
          );
        } else {
          selectedGodowns.push(obj.id)
        }
      })
    },
    addGodown() {
      this.form.stock.godowns.push({ id: '', qty: null, rate: null });
    },
    deleteGodown(index) {
      this.form.stock.godowns.splice(index, 1);
    },
    confirmOnSubmit() {
      const self = this;
      let itemType = this.isService ? 'Service' : 'Product';
      let text = `Create ${itemType} <b>${this.form.name}</b>?`;
      let textDom = this.$createElement('div', {
        domProps: {
          innerHTML: text,
        },
      });
      this.$bvModal
        .msgBoxConfirm(textDom, {
          size: 'md',
          buttonSize: 'sm',
          okVariant: 'success',
          headerClass: 'p-0 border-bottom-0',
          footerClass: 'border-top-0', // p-1
          centered: true,
        })
        .then((val) => {
          if (val) {
            self.onSubmit();
          }
        });
    },
    onSubmit() {
      this.isLoading = true;
      const payload = this.initPayload();
      axios
        .post('/product', payload.product)
        .then((response) => {
          this.isLoading = false;
          let productCode, taxPayload, taxRequests;
          switch (response.data.gkstatus) {
          case 7:
            response.data?.error.forEach((field_err) => {
              let location = field_err.loc.join(" at ");
              let message = (location ? location+": " : "") + field_err.msg;
              this.displayToast("Validation Error", message, "warning");
            });
            break;
          case 0:
            this.$emit('childValueUpdate', !this.invalidProduct);
            {
              // store the tax when the product has been created successfully
              productCode = response.data.gkresult;
              taxPayload = {};
              taxRequests = payload.tax.map((item) => {
                taxPayload = {
                  taxname: item.taxname,
                  taxrate: item.taxrate,
                  productcode: productCode,
                  taxfromdate: item.taxfromdate,
                  state: item.taxname === 'VAT' ? item.state : '',
                };
                return axios.post('/tax', taxPayload);
              });
              Promise.all(taxRequests).then(() => {
              });

              // === Server Log ===
              let logdata = { activity: '' };
              let name = '';
              if (payload.product.godownflag === true) {
                let godownIds = Object.keys(payload.product.godetails);
                // comma separated godown names
                this.options.godowns.forEach((gdn) => {
                  if (godownIds.includes(gdn.value + '')) {
                    name += ' ' + gdn.text + ',';
                  }
                });

                logdata.activity =
                  payload.product.productdetails.productdesc +
                  ' product created in ' +
                  name +
                  ' godowns';
              } else {
                logdata.activity =
                  payload.product.productdetails.productdesc +
                  ' product created';
              }
              axios.post('/log', logdata);

              let message = `${this.formType} created successfully`;

              if (name) {
                message += ' in ' + name + ' Godowns.';
              }

              this.$bvToast.toast(message, {
                title: `${this.formMode} ${this.formType} Success!`,
                autoHideDelay: 3000,
                variant: 'success',
                appendToast: true,
                solid: true,
              });

              // only reset form on success, otherwise leave it as is so that user may edit their input and try again
              this.resetForm();
            }
            break;
          case 1:
            this.$emit('childValueUpdate', this.invalidProduct);
            this.$bvToast.toast(
              this.$gettextInterpolate(
                this.$gettext(
                  `%{formType} entry already exists! (Please check Name, FAX or PAN)`
                ),
                { formType: this.formType }
              ),
              {
                title: `${this.formMode} ${this.formType} Error!`,
                autoHideDelay: 3000,
                variant: 'warning',
                appendToast: true,
                solid: true,
              }
            );
            this.resetForm();
            break;
          case 2:
            this.$emit('childValueUpdate', this.invalidProduct);
            this.$bvToast.toast(
              this.$gettext(`Unauthorized access, Please contact admin`),
              {
                title: `${this.formMode} ${this.formType} Error!`,
                autoHideDelay: 3000,
                variant: 'warning',
                appendToast: true,
                solid: true,
              }
            );
            break;
          default:
            this.$bvToast.toast(
              this.$gettextInterpolate(
                this.$gettext(
                  `Unable to create %{formType}, Please try again`
                ),
                { formType: this.formType }
              ),
              {
                title: `${this.formMode} ${this.formType} Error!`,
                autoHideDelay: 3000,
                variant: 'danger',
                appendToast: true,
                solid: true,
              }
            );
            this.resetForm();
          } // end switch
          if (this.onSave) {
            this.onSave(response.data);
          }
        })
        .catch((error) => {
          this.$bvToast.toast(`Error: ${error.message}`, {
            title: `${this.formMode} ${this.formType} Error!`,
            autoHideDelay: 3000,
            variant: 'warning',
            appendToast: true,
            solid: true,
          });
        })
        .then(() => {
          this.isLoading = false;
        });
    },
    initPayload() {
      const product = {
        productdetails: {
          gsflag: this.isService ? 19 : 7,
          productdesc: this.form.name,
          prodmrp: parseFloat(this.form.mrp) || 0,
          prodsp: parseFloat(this.form.salePrice) || 0,
          amountdiscount: parseFloat(this.form.discountAmount) || 0,
          percentdiscount: parseFloat(this.form.discountPercent) || 0,
          gscode: this.form.hsn,
          specs: {},
        },
        godetails: {},
        godownflag: false,
      };

      // === Product specific fields ===
      if (!this.isService) {
        product.productdetails.openingstock =
          parseFloat(this.form.stock.value) || 0;
        product.productdetails.uomid = this.form.uom;
        product.productdetails.categorycode = null;

        // === Godown Stock Data ===
        if (this.form.stock.godownFlag) {
          // openingstock becomes 0, when godownflag is true
          product.productdetails.openingstock = 0;

          // format and store godetails, format -> {godownId : stockCount}
          product.godetails = this.form.stock.godowns.reduce((acc, godown) => {
            if (godown.qty >= 0 && godown.id) {
              if (!Object.hasOwn(acc, godown.id)) {
                acc[godown.id] = {
                  qty: parseFloat(godown.qty),
                  rate: parseFloat(godown.rate),
                };
              } else {
                acc[godown.id]["qty"] += parseFloat(godown.qty);
                acc[godown.id]["rate"] += parseFloat(godown.rate);
              }
            }
            return acc;
          }, {});

          // set godownflag true if length > 0, else remains false
          if (Object.keys(product.godetails).length) {
            product.godownflag = true;
          }
        }
      }

      const tax = [];

      // CESS
      if (this.form.tax.cess > 0) {
        tax.push({
          taxname: 'CESS',
          state: '',
          taxrate: parseFloat(this.form.tax.cess) || 0,
          taxfromdate: this.yearStart,
        });
      }

      // CVAT
      if (this.form.tax.cvat > 0) {
        tax.push({
          taxname: 'CVAT',
          state: '',
          taxrate: parseFloat(this.form.tax.cvat) || 0,
          taxfromdate: this.yearStart,
        });
      }

      // VAT []
      if (this.form.tax.vat.length && this.form.tax.vat[0].rate > 0) {
        tax.push(
          ...this.form.tax.vat.reduce((acc, vat) => {
            if (vat.state && vat.rate >= 0) {
              acc.push({
                taxname: 'VAT',
                state: vat.state,
                taxrate: parseFloat(vat.rate) || 0,
                taxfromdate: this.yearStart,
              });
            }
            return acc;
          }, [])
        );
      }

      // GST []
      if (this.form.tax.gsts.length && this.form.tax.gsts[0].rate > 0) {
        this.form.tax.gsts.forEach((gst) => {
          if (gst.rate > 0 && gst.from && gst.dateValidity) {
            tax.push({
              taxname: 'IGST',
              taxrate: parseFloat(gst.rate) || 0,
              taxfromdate: gst.from,
              state: '',
            });
          }
        });
      } else if (this.form.tax.gst > 0) {
        tax.push({
          taxname: 'IGST',
          state: '',
          taxrate: parseFloat(this.form.tax.gst) || 0,
          taxfromdate: this.yearStart,
        });
      }

      // product and tax details will be used by separate API's
      return { product, tax };
    },
    onGodownSave() {
      this.showGodownForm = false;
      this.fetchGodownList().then(() => {
        if (this.form.stock.godownFlag) {
          let stockGdnCount = this.form.stock.godowns.length;
          let godownCount = this.options.godowns.length;
          if (this.form.stock.godowns[stockGdnCount - 1].id !== null) {
            this.addGodown();
            stockGdnCount++;
          }
          this.form.stock.godowns[stockGdnCount - 1].id = this.options.godowns[
            godownCount - 1
          ].value;
        }

        this.form.showGodownForm = false;
      });
    },
    resetForm() {
      Object.assign(this.form, {
        name: null,
        mrp: null,
        salePrice: null,
        discountAmount: null,
        discountPercent: null,
        tax: {
          cess: null,
          gst: null,
          cvat: null,
          vat: [],
          gsts: [
            {
              rate: 0,
              from: this.yearStart,
              min: this.dateReverse(this.yearStart),
              dateValidity: true,
            },
          ],
          gstFlag: false,
        },
        hsn: null,
      });

      this.form.stock.godowns = [{ id: this.defaultGodown, value: 0 }];

      this.$forceUpdate();
    },
    fetchGodownList() {
      let self = this;
      return axios
        .get('/godown')
        .then((resp) => {
          if (resp.status === 200) {
            if (resp.data.gkstatus === 0) {
              resp.data.gkresult.sort((a, b) => a.goid - b.goid); // sorting the godown list based on goid, to order it in creation order
              self.options.godowns = resp.data.gkresult.map((item) => {
                return {
                  text: `${item.goname} (${item.goaddr})`,
                  value: item.goid,
                };
              });
            } else {
              this.displayToast(
                this.$gettext('Fetch Product Data Failed!'),
                this.$gettext(
                  'Please try again later, if problem persists, contact admin'
                ),
                'danger'
              );
            }
          }
        })
        .catch((error) => {
          this.displayToast(
            this.$gettext('Fetch Godowns Failed!'),
            error.message,
            'danger'
          );
          return error;
        });
    },
    preloadData() {
      this.isPreloading = true;
      const requests = [
        axios.get('/unitofmeasurement').catch((error) => {
          this.displayToast(
            this.$gettext('Fetch Unit of Measurement Failed!'),
            error.message,
            'danger'
          );
          return error;
        }),
        axios.get('/state').catch((error) => {
          this.displayToast(
            this.$gettext('Fetch State Data Failed!'),
            error.message,
            'danger'
          );
          return error;
        }),
        this.fetchGodownList(),
      ];

      const self = this;
      return Promise.all(requests).then(([resp1, resp2, resp3]) => {
        self.isPreloading = false;
        let preloadErrorList = ''; // To handle the unloaded data, at once than individually
        /**
         * The data obtained are updated, to be comptaible with the
         * component they are used with (<b-form-select>)
         * and based on requirement
         */

        // === UOM List ===
        if (resp1.status === 200) {
          if (resp1.data.gkstatus === 0) {
            self.options.uom = resp1.data.gkresult.map((uom) => {
              return {
                id: uom.uomid,
                name: `${uom.unitname} (${uom.description})`,
                code: uom.unitname,
              };
            });
            self.uom = self.options.uom.filter((uom) => uom.code === 'PCS')[0];
          } else {
            preloadErrorList += ' Unit of Measurement List, ';
          }
        }

        // === State List ===
        if (resp2.status === 200) {
          if (resp2.data.gkstatus === 0) {
            self.options.states = resp2.data.gkresult.map((item) => {
              return {
                text: Object.values(item)[0],
                value: Object.values(item)[0],
              };
            });
          } else {
            preloadErrorList += ' States,';
          }
        }

        // === Godown List ===
        if (resp3 !== undefined) {
          preloadErrorList += ' Godowns,';
        }

        if (preloadErrorList !== '') {
          this.displayToast(
            this.$gettext('Error: Unable to Preload Data'),
            this.$gettextInterpolate(
              this.$gettext(
                `Issues with fetching %{preloadErrorList} Please try again or Contact Admin`
              ),
              {
                preloadErrorList: preloadErrorList,
              }
            ),
            'danger'
          );
        }
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
  mounted() {
    this.preloadData().then(() => {
      this.resetForm();
    });
  },
};
</script>
