<template>
  <section class="m-2">
    <b-card
      class="mx-auto gkcard text-small"
      header="Edit Category"
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
            v-model="form.parent"
            size="sm"
            :disabled="true"
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
                @click="deleteRow(true, data.index)"
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
              :style="{minWidth: '120px'}"
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
                @click="deleteRow(false, data.index)"
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
          <translate> Update </translate>
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
  name: 'EditCategory',
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
        deletedSpecs: [],
        deletedTaxes: [],
      },
      editFlag: false,
      specFlag: false,
      taxFlag: false,
      states: [],
      stateIdMap: {},
      stateNameMap: {},
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
  props: {
    id: {
      type: [Number, String],
      required: true,
    },
  },
  computed: {
    gstRates: (self) => self.$store.getters['global/getGstRates'],
    ...mapState([]),
  },
  methods: {
    /** Delete row from Specs or Taxes table*/
    deleteRow(specFlag, index) {
      if (specFlag) {
        if (this.form.specs[index].id) {
          this.form.deletedSpecs.push(this.form.specs[index].id);
        }
        this.form.specs.splice(index, 1);
      } else {
        if (this.form.taxes[index].id) {
          this.form.deletedTaxes.push(this.form.taxes[index].id);
        }
        this.form.taxes.splice(index, 1);
      }
    },
    /** Add a VAT row to the tax table data array */
    addVAT() {
      this.form.taxes.push({
        type: 'VAT',
        state: '',
        rate: '',
        edit: '',
        disabled: false,
        id: '',
      });
    },
    /** Add a row to the specification table data array */
    addSpec() {
      this.form.specs.push({
        type: '',
        name: '',
        edit: '',
        disabled: false,
        id: '',
      });
    },
    /** Resets the form fields to their default values.
     * taxSpecFlag - A flag if true will only init the tax and spec related fields
     */
    resetForm() {
      this.form = {
        category: '',
        parent: null,
        specs: [{ type: '', name: '', edit: '', disabled: false, id: '' }],
        taxes: [
          {
            type: 'IGST',
            state: '',
            rate: '',
            edit: '',
            disabled: false,
            id: '',
          },
          {
            type: 'CESS',
            state: '',
            rate: '',
            edit: '',
            disabled: false,
            id: '',
          },
          {
            type: 'CVAT',
            state: '',
            rate: '',
            edit: '',
            disabled: false,
            id: '',
          },
          {
            type: 'VAT',
            state: '',
            rate: '',
            edit: '',
            disabled: false,
            id: '',
          },
        ],
        deletedSpecs: [],
        deletedTaxes: [],
      };
      this.specFlag = false;
      this.taxFlag = false;
    },
    /** Fetch the category's data and update it */
    getCategoryData(id) {
      const self = this;
      if (!id) {
        return;
      }
      Promise.all([
        axios.get(`/categories?type=single&categorycode=${id}`),
        axios.get(`/tax/search/c?categorycode=${id}`),
        axios.get(`/categoryspecs?categorycode=${id}`),
        axios.get(`/product/category/${id}`),
      ]).then((resp) => {
        // Category name and parent
        if (resp[0].data.gkstatus === 0) {
          self.form.category = resp[0].data.gkresult.categoryname;
          self.form.parent = resp[0].data.gkresult.subcategoryof;
        }

        // Taxes
        if (resp[1].data.gkstatus === 0) {
          let vat = [];
          let vatStates = [];
          resp[1].data.gkresult.forEach((tax) => {
            switch (tax.taxname) {
            case 'IGST':
              self.form.taxes[0].rate =
                tax.taxrate % 1
                  ? parseFloat(tax.taxrate)
                  : parseInt(tax.taxrate);
              self.form.taxes[0].id = tax.taxid;
              break;
            case 'CESS':
              self.form.taxes[1].rate = parseFloat(tax.taxrate);
              self.form.taxes[1].id = tax.taxid;
              break;
            case 'CVAT':
              self.form.taxes[2].rate = parseFloat(tax.taxrate);
              self.form.taxes[2].id = tax.taxid;
              break;
            case 'VAT':
              vat.push({
                type: tax.taxname,
                state: '',
                rate: parseFloat(tax.taxrate),
                edit: '',
                id: tax.taxid,
              });
              vatStates.push(self.stateNameMap[tax.state]);
              break;
            }
          });
          if (vat.length) {
            self.form.taxes.pop();
            self.form.taxes.push(...vat);
            if (vatStates.length) {
              self.$nextTick().then(() => {
                setTimeout(() => {
                  vatStates.forEach((state, index) => {
                    self.form.taxes[index + 3].state = state;
                  });
                }, 500);
              });
            }
          }
          if (resp[1].data.gkresult.length) {
            self.taxFlag = true;
          }
        }

        // Specifications
        if (resp[2].data.gkstatus === 0) {
          self.form.specs = resp[2].data.gkresult.map((spec) => {
            return {
              type: spec.attrtype,
              name: spec.attrname,
              edit: '',
              id: spec.spcode,
            };
          });
          if (resp[2].data.gkresult.length) {
            self.specFlag = true;
          } else {
            self.addSpec();
          }
        }

        // Edit Flag Check
        if (resp[3].data.gkstatus === 0) {
          self.editFlag = !resp[3].data.gkresult.length;
        }
      });
    },
    /** Preloads the required data and initializes the form */
    initForm() {
      const self = this;
      Promise.all([this.getAllCategories(), this.getStates()]).then(() => {
        self.$forceUpdate();
        self.$nextTick().then(() => {
          self.getCategoryData(self.id);
        });
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
                categoryname: this.$gettext('Choose a Category'),
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
          return 1;
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
      return axios.get('/state').then((resp) => {
        if (resp.data.gkstatus === 0) {
          self.states = resp.data.gkresult.map((state) => {
            let key = Object.keys(state)[0];
            self.stateIdMap[key] = state[key];
            self.stateNameMap[state[key]] = key;
            return {
              value: key,
              text: state[key],
            };
          });
          return 1;
        }
      });
    },
    /** Delete the Specs and Taxes removed during edit with corresponding DELETE APIs */
    deleteData() {
      this.form.taxes.forEach((tax) => {
        if (tax.id && !parseFloat(tax.rate)) {
          if (this.form.deletedTaxes.indexOf(tax.id) < 0) {
            this.form.deletedTaxes.push(tax.id);
          }
        }
      });
      this.form.specs.forEach((spec) => {
        if (spec.id && !spec.name) {
          if (this.form.deletedSpecs.indexOf(spec.id) < 0) {
            this.form.deletedSpecs.push(spec.id);
          }
        }
      });

      this.form.deletedTaxes.forEach((taxid) => {
        axios.delete(`/tax/${taxid}`);
      });
      this.form.deletedSpecs.forEach((spcode) => {
        let payload = {
          data: { spcode: spcode },
        };
        axios.delete('/categoryspecs', payload);
      });
    },
    onSubmit() {
      const catName = this.form.category;
      const catCode = this.id;
      const payload = {
        categoryname: catName,
        subcategoryof: parseInt(this.form.parent) || null,
        categorycode: parseInt(this.id),
      };
      const self = this;
      axios.put('/categories', payload).then((resp) => {
        let specFlag = self.form.specs.length,
            taxFlag = self.form.taxes.length;
        if (resp.data.gkstatus === 0) {
          const newSpecs = self.form.specs.filter(
            (spec) => !spec.id && spec.name
          );
          const newTaxes = self.form.taxes.filter(
            (tax) => !tax.id && parseFloat(tax.rate)
          );
          const editSpecs = self.form.specs.filter(
            (spec) => spec.id && spec.name
          );
          const editTaxes = self.form.taxes.filter(
            (tax) => tax.id && parseFloat(tax.rate)
          );
          if (specFlag) {
            // new
            newSpecs.forEach((spec) => {
              let payload = {
                attrname: spec.name,
                attrtype: spec.type,
                categorycode: catCode,
              };
              axios.post('/categoryspecs', payload);
            });
            // edit
            editSpecs.forEach((spec) => {
              let payload = {
                attrname: spec.name,
                attrtype: spec.type,
                categorycode: catCode,
                spcode: spec.id,
              };
              axios.put('/categoryspecs', payload);
            });
          }
          if (taxFlag) {
            // new
            newTaxes.forEach((tax) => {
              let payload = {
                taxname: tax.type,
                taxrate: parseFloat(tax.rate),
                categorycode: catCode,
              };
              if (tax.state) {
                payload.state = self.stateIdMap[tax.state];
              }
              axios.post('/tax', payload);
            });
            // edit
            editTaxes.forEach((tax) => {
              let payload = {
                taxid: tax.id,
                taxname: tax.type,
                taxrate: parseFloat(tax.rate),
                categorycode: catCode,
                state: tax.state ? self.stateIdMap[tax.state] : null,
              };
              axios.put(`/tax/${tax.id}`, payload);
            });
          }

          // delete
          this.deleteData();

          let log = { activity: `Category Updated: ${catName}` };
          axios.post('/log', log);
          self.$bvToast.toast(`Category ${catName} Updated!`, {
            variant: 'success',
            solid: true,
          });

          this.resetForm();
          this.initForm();
        }
      });
    },
  },
  mounted() {
    this.initForm();
  },
};
</script>
