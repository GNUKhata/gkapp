<template>
  <div
    class="card mx-sm-auto"
    :class="{'mt-4': !inOverlay, 'mx-2': !inOverlay, gkcard: !inOverlay}"
    :style="{minWidth: '300px'}"
  >
    <b-overlay
      :show="isPreloading"
      variant="secondary"
      no-wrap
      blur
    />
    <!-- <div class="card-header text-left py-2">
         <b>Create Godown</b>
         <slot name="close-button"> </slot>
         </div> -->
    <b-card
      header-bg-variant="dark"
      header-text-variant="light"
    >
      <template #header>
        <div>
          <translate> Create Godown </translate>
          <slot name="close-button" />
        </div>
      </template>
      <b-form
        class="text-left"
        @submit.prevent="confirmOnSubmit"
      >
        <b-row>
          <b-col
            cols="12"
            :md="inOverlay ? 12 : 6"
            lg="6"
          >
            <b-form-group
              label-size="sm"
              label="Name"
              label-for="go-input-1"
              label-cols="3"
              label-class="required"
            >
              <template #label>
                <translate> Name </translate>
              </template>
              <b-form-input
                size="sm"
                id="go-input-1"
                placeholder="Godown Name"
                v-model="form.name"
                trim
                required
              />
            </b-form-group>
            <b-form-group
              v-if="isIndia"
              label-size="sm"
              label="State"
              label-for="go-input-2"
              label-cols="3"
              label-class="required"
            >
              <template #label>
                <translate> State </translate>
              </template>
              <v-select
                id="go-input-2"
                v-model="form.state"
                :options="options.states"
                required
                label="name"
              />
            </b-form-group>
            <b-form-group
              label-size="sm"
              label="Address"
              label-class="required"
            >
              <template #label>
                <translate> Address </translate>
              </template>
              <b-form-textarea
                id="go-input-3"
                v-model="form.address"
                size="sm"
                rows="2"
                max-rows="3"
                required
              />
            </b-form-group>
          </b-col>
          <b-col>
            <b-form-group
              label-size="sm"
              label="Contact Person"
              label-for="go-input-4"
              label-cols="3"
            >
              <template #label>
                <translate> Contact Person </translate>
              </template>
              <b-form-input
                size="sm"
                id="go-input-4"
                placeholder="Contact Person"
                v-model="form.contactPerson"
                trim
              />
            </b-form-group>
            <b-form-group
              label-size="sm"
              label="Contact Number"
              label-for="ci-input-5"
              label-cols="3"
              invalid-feedback="Require 10 digit number"
            >
              <template #label>
                <translate> Contact Number </translate>
              </template>
              <b-form-input
                size="sm"
                id="go-input-5"
                type="tel"
                pattern="^\+?\d{0,13}"
                no-wheel
                v-model="form.contactNumber"
              />
            </b-form-group>
          </b-col>
        </b-row>
        <hr class="my-2">
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
      </b-form>
    </b-card>
  </div>
</template>

<script>
import axios from 'axios';
import { mapGetters } from 'vuex';
export default {
  name: 'Godown',
  data() {
    return {
      form: {
        name: null,
        address: null,
        state: null,
        contactNumber: null,
        contactPerson: null,
      },
      isPreloading: false,
      isLoading: false,
      options: {
        states: [],
      },
    };
  },
  computed: {
    ...mapGetters('global', ['isIndia']),
  },
  props: {
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
  methods: {
    confirmOnSubmit() {
      const self = this;
      let text = `Create Godown <b>${this.form.name}</b>?`;
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
          // bodyClass: 'p-2',
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
      // console.log('in submit')
      const payload = this.initPayload();
      // console.log(payload);
      axios
        .post('/godown', payload)
        .then((response) => {
          // console.log(response)
          this.isLoading = false;
          switch (response.data.gkstatus) {
          case 0:
            {
              this.$bvToast.toast(
                this.$gettext(`Godown created successfully`),
                {
                  title: `Success!`,
                  autoHideDelay: 3000,
                  variant: 'success',
                  appendToast: true,
                  solid: true,
                }
              );
              this.$emit('godownCreated');
              // === Server Log ===
              let logdata = { activity: '' };
              logdata.activity = 'godown created ' + payload.goname;
              axios.post('/log', logdata);

              // only reset form on success, otherwise leave it as is so that user may edit their input and try again
              this.resetForm();
            }
            break;
          case 1:
            this.$bvToast.toast(
              this.$gettext(
                `Godown entry already exists! (Please check Name)`
              ),
              {
                title: this.$gettext(`Create Godown Error!`),
                autoHideDelay: 3000,
                variant: 'warning',
                appendToast: true,
                solid: true,
              }
            );
            break;
          case 2:
            this.$bvToast.toast(
              this.$gettext(`Unauthorized access, Please contact admin`),
              {
                title: this.$gettext(`Create Godown Error!`),
                autoHideDelay: 3000,
                variant: 'warning',
                appendToast: true,
                solid: true,
              }
            );
            break;
          default:
            this.$bvToast.toast(
              this.$gettext(`Unable to create Godown, Please try again`),
              {
                title: this.$gettext(`Create Godown Error!`),
                autoHideDelay: 3000,
                variant: 'danger',
                appendToast: true,
                solid: true,
              }
            );
          } // end switch
          if (this.onSave) {
            this.onSave(response.data);
          }
        })
        .catch((error) => {
          this.$bvToast.toast(`Error: ${error.message}`, {
            title: this.$gettext(`Create Godown Error!`),
            autoHideDelay: 3000,
            variant: 'warning',
            appendToast: true,
            solid: true,
          });
        });
    },
    initPayload() {
      return {
        goname: this.form.name,
        goaddr: this.form.address,
        state: this.form.state.name,
        gocontact: this.form.contactNumber || '',
        contactname: this.form.contactPerson || '',
      };
    },
    resetForm() {
      this.form = {
        name: null,
        address: null,
        state: '',
        contactNumber: null,
        contactPerson: null,
      };
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
    preloadData() {
      this.isPreloading = true;
      axios
        .get('/state')
        .then((resp) => {
          this.isPreloading = false;
          if (resp.data.gkstatus === 0) {
            this.options.states = resp.data.gkresult.map((item) => {
              const name = Object.values(item)[0];
              let code = Object.keys(item)[0] + '';
              if (code.length < 2) {
                code = '0' + code;
              }
              return {
                name: name,
                code: code,
              };
            });
          } else {
            this.displayToast(
              this.$gettext('Preload Data Failed!'),
              this.$gettext(
                'Error fetching State List, please try again after sometime.'
              ),
              'warning'
            );
          }
        })
        .catch((error) => {
          this.displayToast(
            this.$gettext('Preload Data Failed!'),
            error.message,
            'warning'
          );
          return error;
        });
    },
  },
  mounted() {
    this.preloadData();
  },
};
</script>
