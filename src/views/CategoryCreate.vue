<template>
  <section class="m-2">
    <b-card
      class="mx-auto gkcard text-small"
      header="Add Category"
      header-bg-variant="dark"
      header-text-variant="light"
      body-class="px-2"
    >
      <b-form
        class="align-form-label-right"
        @submit.prevent="onSubmit"
      >
        <b-form-group
          label-class="required"
          label="Name"
          label-cols="3"
        >
          <b-form-input
            required
            placeholder="Category name"
            type="text"
            size="sm"
            v-model="form.category"
          />
        </b-form-group>
        <b-form-group
          label="Parent Category"
          label-cols="3"
        >
          <template #label>
            <translate> Parent Category </translate>
          </template>
          <b-form-select
            @input="getParentData(form.parent)"
            v-model="form.parent"
            size="sm"
          >
            <b-form-select-option
              v-for="category in allCategories"
              :key="category.srno"
              :value="category.categorycode"
            >
              {{ category.categoryname }}
              <span
                v-if="category.subcount !== ''"
              >({{ category.subcount }})</span>
            </b-form-select-option>
          </b-form-select>
        </b-form-group>
        <!-- add tax & spec buttons -->
        <div class="mb-2 ml-4">
          <b-form-checkbox
            id="checkbox-2"
            v-model="specFlag"
            name="checkbox-2"
            class="mb-3 d-inline-block"
            size="sm"
            switch
          >
            <translate> Add Specification </translate>
          </b-form-checkbox>
          <b-form-checkbox
            id="checkbox-1"
            v-model="taxFlag"
            name="checkbox-1"
            class="mb-3 mx-2 d-inline-block"
            size="sm"
            switch
          >
            <translate> Add Tax </translate>
          </b-form-checkbox>
        </div>
        <!-- Spec table -->
        <b-table
          :fields="[
            {key: 'type', label: 'Specification'},
            {key: 'name', label: 'Title'},
            {key: 'edit', label: ''},
          ]"
          small
          :items="form.specs"
          head-variant="dark"
          v-if="specFlag"
        >
          <template #cell(type)="data">
            <b-form-select
              size="sm"
              v-model="form.specs[data.index].type"
              :options="specType"
              required
              :disabled="data.item.disabled"
            />
          </template>
          <template #cell(name)="data">
            <b-form-input
              v-model="form.specs[data.index].name"
              type="text"
              placeholder="Name"
              required
              size="sm"
              :disabled="data.item.disabled"
            />
          </template>
          <template #cell(edit)="data">
            <b-button-group
              v-if="!data.item.disabled"
              size="sm"
            >
              <b-button
                title="Add"
                variant="dark"
                class="px-1"
                @click="addSpec"
                size="sm"
              >
                <b-icon
                  class="align-middle"
                  icon="plus"
                />
              </b-button>
              <!-- delete spec -->
              <b-button
                title="delete"
                variant="danger"
                @click="form.specs.splice(data.index, 1)"
                size="sm"
                class="px-1"
                v-if="form.specs.length > 1"
              >
                <b-icon
                  class="align-middle"
                  font-scale="0.92"
                  icon="trash"
                />
              </b-button>
            </b-button-group>
          </template>
        </b-table>
        <!-- Tax -->
        <b-table
          :fields="[
            {key: 'type', label: 'Tax'},
            {key: 'state', label: 'State'},
            'rate',
            {key: 'edit', label: ''},
          ]"
          small
          :items="form.taxes"
          head-variant="dark"
          v-if="taxFlag"
        >
          <template #cell(type)="data">
            <b-form-input
              v-model="form.taxes[data.index].type"
              :title="data.value"
              type="text"
              size="sm"
              readonly
            />
          </template>
          <template #cell(state)="data">
            <autocomplete
              v-model="form.taxes[data.index].state"
              :options="states"
              placeholder="state"
              :readonly="data.item.type !== 'VAT' || data.item.disabled"
              :required="false"
            />
          </template>
          <template #cell(rate)="data">
            <b-form-input
              v-if="data.item.type !== 'IGST'"
              v-model="form.taxes[data.index].rate"
              :title="data.value"
              type="number"
              placeholder="%"
              no-wheel
              size="sm"
              :disabled="data.item.disabled"
            />
            <b-form-select
              v-else
              v-model="form.taxes[data.index].rate"
              size="sm"
              :options="gstRates"
              :disabled="data.item.disabled"
            />
          </template>
          <template #cell(edit)="data">
            <b-button-group
              v-if="
                (data.item.type === 'VAT' || data.index === 2) &&
                  !data.item.disabled
              "
            >
              <b-button
                title="Add"
                variant="dark"
                class="px-1"
                @click="addVAT"
                size="sm"
              >
                <b-icon
                  class="align-middle"
                  icon="plus"
                />
              </b-button>
              <!-- delete spec -->
              <b-button
                title="delete"
                variant="danger"
                @click="form.taxes.splice(data.index, 1)"
                size="sm"
                class="px-1"
                v-if="data.item.type === 'VAT'"
              >
                <b-icon
                  class="align-middle"
                  font-scale="0.92"
                  icon="trash"
                />
              </b-button>
            </b-button-group>
          </template>
        </b-table>
        <b-button
          type="submit"
          class="float-right"
          size="sm"
          variant="success"
        >
          <translate> Save </translate>
        </b-button>
      </b-form>
    </b-card>
  </section>
</template>

<script>
import { mapState } from 'vuex';
import axios from 'axios';
import Autocomplete from '../components/Autocomplete.vue';
export default {
  components: { Autocomplete },
  name: 'CategoryCreate',
  data() {
    return {
      form: {
        category: '',
        parent: null,
        specs: [{ type: '', name: '', edit: '', disabled: false }],
        taxes: [
          { type: 'IGST', state: '', rate: '', edit: '', disabled: false },
          { type: 'CESS', state: '', rate: '', edit: '', disabled: false },
          { type: 'CVAT', state: '', rate: '', edit: '', disabled: false },
          { type: 'VAT', state: '', rate: '', edit: '', disabled: false },
        ],
      },
      specFlag: false,
      taxFlag: false,
      states: [],
      stateMap: {},
      allCategories: [],
      specType: [
        { value: 0, text: 'Text' },
        { value: 1, text: 'Number' },
        { value: 2, text: 'Date' },
      ],
      taxType: [
        { value: 'IGST', text: 'GST' },
        { value: 'CESS', text: 'CESS' },
        { value: 'CVAT', text: 'CVAT' },
        { value: 'VAT', text: 'VAT' },
      ],
    };
  },
  computed: {
    gstRates: (self) => self.$store.getters['global/getGstRates'],
    ...mapState([]),
  },
  methods: {
    /** Add a VAT row to the tax table data array */
    addVAT() {
      this.form.taxes.push({
        type: 'VAT',
        state: '',
        rate: '',
        edit: '',
        disabled: false,
      });
    },
    /** Add a row to the specification table data array */
    addSpec() {
      this.form.specs.push({ type: '', name: '', edit: '', disabled: false });
    },
    /** Initializes the form fields to their default values.
     * taxSpecFlag - A flag if true will only init the tax and spec related fields
     */
    initForm(taxSpecFlag) {
      if (!taxSpecFlag) {
        this.form.category = '';
        this.form.parent = null;
      }
      this.form.specs = [{ type: '', name: '', edit: '', disabled: false }];
      this.form.taxes = [
        { type: 'IGST', state: '', rate: '', edit: '', disabled: false },
        { type: 'CESS', state: '', rate: '', edit: '', disabled: false },
        { type: 'CVAT', state: '', rate: '', edit: '', disabled: false },
        { type: 'VAT', state: '', rate: '', edit: '', disabled: false },
      ];
      this.specFlag = false;
      this.taxFlag = false;
    },
    /** Fetch the parent category's taxes and specs and update it */
    getParentData(parentId) {
      this.initForm(true);
      const self = this;
      if (!parentId) {
        return;
      }
      Promise.all([
        axios.get(`/tax/search/c?categorycode=${parentId}`),
        axios.get(`/categoryspecs?categorycode=${parentId}`),
      ]).then((resp) => {
        if (resp[0].data.gkstatus === 0) {
          let vat = [];
          resp[0].data.gkresult.forEach((tax) => {
            switch (tax.taxname) {
            case 'IGST':
              self.form.taxes[0].rate = tax.taxrate;
              self.form.taxes[0].disabled = true;
              break;
            case 'CESS':
              self.form.taxes[1].rate = tax.taxrate;
              self.form.taxes[1].disabled = true;
              break;
            case 'CVAT':
              self.form.taxes[2].rate = tax.taxrate;
              self.form.taxes[2].disabled = true;
              break;
            case 'VAT':
              vat.push({
                type: tax.taxname,
                state: tax.state,
                rate: tax.taxrate,
                edit: '',
                disabled: true,
              });
              break;
            }
          });
          if (vat.length) {
            self.form.taxes.pop();
            self.form.taxes.push(...vat);
            self.addVAT();
          }
          if (resp[0].data.gkresult.length) {
            self.taxFlag = true;
          }
        }

        if (resp[1].data.gkstatus === 0) {
          self.form.specs = resp[1].data.gkresult.map((spec) => {
            return {
              type: spec.attrtype,
              name: spec.attrname,
              edit: '',
              disabled: true,
            };
          });
          if (resp[1].data.gkresult.length) {
            self.specFlag = true;
          }
          self.addSpec();
        }
      });
    },
    /* Fetch all categories from api and assign it to allCategories */
    getAllCategories() {
      this.loading = true;
      return axios
        .get(`/categories`)
        .then((resp) => {
          if (resp.status == 200) {
            this.allCategories = [
              {
                srno: '0',
                categorycode: null,
                categoryname: 'Choose a Category',
                subcount: '',
              },
              ...resp.data.gkresult,
            ];
          } else {
            this.$bvToast.toast(this.$gettext('Failed to fetch categories'), {
              variant: 'danger',
              solid: true,
            });
          }
          this.loading = false;
        })
        .catch((e) => {
          this.loading = false;
          this.$bvToast.toast(e.message, {
            variant: 'danger',
            solid: true,
          });
        });
    },
    getStates() {
      const self = this;
      axios.get('/state').then((resp) => {
        if (resp.data.gkstatus === 0) {
          self.states = resp.data.gkresult.map((state) => {
            let key = Object.keys(state)[0];
            self.stateMap[key] = state[key];
            return {
              value: key,
              text: state[key],
            };
          });
        }
      });
    },
    onSubmit() {
      const catName = this.form.category;
      const payload = { categoryname: catName };
      const self = this;

      if (this.form.parent) {
        payload.subcategoryof = parseInt(this.form.parent);
      }
      axios.post('/categories', payload).then((resp1) => {
        let specFlag = self.form.specs.length,
            taxFlag = self.form.taxes.length;
        if (resp1.data.gkstatus === 0) {
          const specs = JSON.parse(JSON.stringify(self.form.specs));
          const taxes = JSON.parse(JSON.stringify(self.form.taxes));
          let catCode = resp1.data.gkresult;
          let specRequests = [];
          let taxRequests = [];
          if (specFlag) {
            specRequests = specs
              .filter((spec) => !!spec.name)
              .map((spec) => {
                let specPayload = {
                  attrname: spec.name,
                  attrtype: spec.type,
                  categorycode: catCode,
                };
                return axios.post('/categoryspecs', specPayload);
              });
          }
          if (taxFlag) {
            taxRequests = taxes
              .filter((tax) => parseFloat(tax.rate) > 0)
              .map((tax) => {
                let taxPayload = {
                  taxname: tax.type,
                  taxrate: parseFloat(tax.rate),
                  categorycode: catCode,
                };
                if (tax.state) {
                  taxPayload.state = self.stateMap[tax.state];
                }
                return axios.post('/tax', taxPayload);
              });
          }

          let log = { activity: `Category created: ${catName}` };
          axios.post('/log', log);
          self.$bvToast.toast(`Category ${catName} created!`, {
            variant: 'success',
            solid: true,
          });

          if (specFlag) {
            Promise.all(specRequests)
              .then((specResp) => {
                specResp.forEach((resp, i) => {
                  let spec = specs[i].name;
                  let specLog = {
                    activity:
                      resp.data.gkstatus === 0
                        ? `Category Specification for ${catName} created: ${spec}`
                        : `Category Specification for ${catName} not created: ${spec}`,
                  };
                  axios.post('/log', specLog);
                });
              })
              .catch((e) => {
                self.$bvToast.toast(e.message, {
                  variant: 'danger',
                  solid: true,
                });
              });
          }

          if (taxFlag) {
            Promise.all(taxRequests)
              .then((taxResp) => {
                taxResp.forEach((resp, i) => {
                  let tax = `${taxes[i].type}: ${taxes[i].rate}%`;
                  let taxLog = {
                    activity:
                      resp.data.gkstatus === 0
                        ? `Category tax for ${catName} created: ${tax}`
                        : `Category tax for ${catName} not created: ${tax}`,
                  };
                  axios.post('/log', taxLog);
                });
              })
              .catch((e) => {
                self.$bvToast.toast(e.message, {
                  variant: 'danger',
                  solid: true,
                });
              });
          }
          self.getAllCategories();
          self.initForm();
        } else if(resp1.data.gkstatus === 1) {
          this.gk_toast(
            this.$gettext('Alert'),
            this.$gettext('Duplicate Category not allowed'),
            'warning'
          );
        }
      });
    },
  },
  mounted() {
    this.getAllCategories();
    this.getStates();
  },
};
</script>
