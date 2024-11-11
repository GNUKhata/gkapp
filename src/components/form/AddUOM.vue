<template>
  <section class="m-2">
    <b-card
      header="Add Unit"
      header-bg-variant="dark"
      header-text-variant="light"
      class="mx-auto gkcard"
    >
      <b-overlay :show="isLoading">
        <b-form
          ref="editingForm"
          @submit.prevent="createUOM"
        >
          <b-form-group
            :label="$gettext('Name')"
            label-align="right"
            label-cols="4"
            tooltip
          >
            <b-form-input
              v-model="form.unitname"
              type="text"
              required
            />
          </b-form-group>
          <b-form-group
            label-align="right"
            label-cols="4"
            :label="$gettext('Description')"
            tooltip
          >
            <b-form-input
              v-model="form.description"
              type="text"
              required
            />
          </b-form-group>
          <b-form-group
            label-align="right"
            label-cols="4"
            :label="$gettext('UQC')"
          >
            <v-select
              v-model="form.uqc"
              :options="uqcList"
              :reduce="(uqc) => uqc.value"
              :placeholder="$gettext('Select UQC')"
            >
              <template #search="{attributes, events}">
                <input
                  class="vs__search"
                  :required="!form.uqc"
                  v-bind="attributes"
                  v-on="events"
                >
              </template>
            </v-select>
          </b-form-group>
          <b-form-group
            label-align="right"
            label-cols="4"
            :label="$gettext('Sub Unit Of')"
            description="*optional"
          >
            <v-select
              v-model="form.subunitof"
              :options="uomList"
              :reduce="(uom) => uom.value"
              :placeholder="$gettext('Select Parent Unit')"
            />
          </b-form-group>
          <b-form-group
            label-align="right"
            label-cols="4"
            :label="$gettext('Conversion Rate')"
            v-if="form.subunitof"
          >
            <b-form-input
              v-model="form.conversionrate"
              type="number"
              required
              step="0.01"
              placeholder="0.00"
            />
          </b-form-group>
          <b-button
            type="submit"
            variant="success"
            class="float-right"
          >
            <b-icon icon="thermometer" />
            <translate>Create New Unit</translate>
          </b-button>
        </b-form>
      </b-overlay>
    </b-card>
  </section>
</template>

<script>
import { mapState } from 'vuex';
import axios from 'axios';
export default {
  name: 'AddUOM',
  data() {
    return {
      isLoading: false,
      uomList: [],
      uqcList: [],
      form: {
        unitname: '',
        description: '',
        subunitof: null,
        uqc: '',
      },
    };
  },
  computed: {
    ...mapState(['gkCoreUrl', 'authToken']),
  },
  methods: {
    /*
     * Get the list of units from the server & assign it to uomList.
     */
    getUOM() {
      this.isLoading = true;
      axios
        .get(`${this.gkCoreUrl}/unitofmeasurement`, {
          headers: { gktoken: this.authToken },
        })
        .then((r) => {
          if (r.status == 200 && r.data.gkstatus == 0) {
            let uomList = [],
                uqcList = [];
            r.data.gkresult.forEach((data) => {
              let obj = {
                label: `${data.unitname} - ${data.description}`,
                value: data.uomid,
              };
              uomList.push(obj);
              if (data.sysunit === 1) {
                uqcList.push(obj);
              }
            });
            this.uomList = uomList;
            this.uqcList = uqcList;
          } else {
            console.log(r.data.gkstatus);
            this.$bvToast.toast(
              'Unable to fetch UOM list, Please reload the page',
              { variant: 'danger' }
            );
          }
          this.isLoading = false;
        })
        .catch((e) => {
          this.isLoading = false;
          this.$bvToast.toast(e.message, { variant: 'danger' });
        });
    },
    /*
     * Create a new UOM with name, description & sub unit value (optional)
     */
    createUOM() {
      this.isLoading = true;
      axios
        .post(`${this.gkCoreUrl}/unitofmeasurement`, this.form, {
          headers: { gktoken: this.authToken },
        })
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
            case 0:
              this.$bvToast.toast(
                `UOM ${this.form.unitname} Created Successfully`,
                {
                  variant: 'success',
                  solid: true,
                }
              );
              this.isLoading = false;
              // Create log
              axios.post(
                `${this.gkCoreUrl}/log`,
                {
                  activity: `uom created: ${this.form.unitname}`,
                },
                {
                  headers: {
                    gktoken: this.authToken,
                  },
                }
              );
              this.$emit('refresh');
              this.$refs.editingForm.reset();
              break;
            case 1:
              this.$bvToast.toast(`Duplicate Entry`, {
                variant: 'warning',
                solid: true,
              });
              this.isLoading = false;
              break;
            case 2:
              this.$bvToast.toast(`Unauthorised Access`, {
                variant: 'danger',
                solid: true,
              });
              this.isLoading = false;
              break;
            case 3:
              this.$bvToast.toast(`Data error`, {
                variant: 'danger',
                solid: true,
              });
              this.isLoading = false;
              break;
            case 4:
              this.$bvToast.toast(`No Privilege`, {
                variant: 'danger',
                solid: true,
              });
              this.isLoading = false;
              break;
            case 5:
              this.$bvToast.toast(`Integrity error`, {
                variant: 'danger',
                solid: true,
              });
              this.isLoading = false;
              break;
            }
          } else {
            this.$bvToast.toast(`${r.status} error`, {
              variant: 'danger',
              solid: true,
            });
          }
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            variant: 'danger',
            solid: true,
          });
        });
    },
  },
  mounted() {
    this.getUOM();
  },
};
</script>
