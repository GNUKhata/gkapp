<template>
  <section class="m-2">
    <b-overlay
      :show="loading"
      blur
      no-wrap
    />
    <b-card
      header="Edit Godown"
      header-bg-variant="dark"
      header-text-variant="light"
      class="mx-auto gkcard p-0"
    >
      <b-form @submit.prevent="updateGodownInfo">
        <b-form-group
          label="Name"
          label-size="sm"
          label-align="right"
          label-cols="4"
        >
          <template #label>
            <translate> Name </translate>
          </template>
          <b-form-input
            size="sm"
            required
            v-model="form.goname"
          />
        </b-form-group>
        <b-form-group
          v-if="isIndia"
          size="sm"
          label="State"
          label-align="right"
          label-cols="4"
        >
          <template #label>
            <translate> State </translate>
          </template>
          <b-form-input
            size="sm"
            v-model="form.state"
          />
        </b-form-group>
        <b-form-group
          size="sm"
          label="Address"
          label-align="right"
          label-cols="4"
        >
          <template #label>
            <translate> Address </translate>
          </template>
          <b-form-input
            size="sm"
            v-model="form.goaddr"
          />
        </b-form-group>
        <b-form-group
          size="sm"
          label="Contact Person"
          label-align="right"
          label-cols="4"
        >
          <template #label>
            <translate> Contact Person </translate>
          </template>
          <b-form-input
            size="sm"
            v-model="form.contactname"
          />
        </b-form-group>
        <b-form-group
          size="sm"
          label="Contact Number"
          label-align="right"
          label-cols="4"
        >
          <template #label>
            <translate> Contact Number </translate>
          </template>
          <b-form-input
            size="sm"
            v-model="form.gocontact"
            type="tel"
            pattern="^\+?\d{0,13}"
          />
        </b-form-group>
        <b-form-group
          size="sm"
          label="Designation"
          label-align="right"
          label-cols="4"
        >
          <template #label>
            <translate> Designation </translate>
          </template>
          <b-form-input
            size="sm"
            v-model="form.designation"
          />
        </b-form-group>
        <div class="float-right">
          <b-button-group size="sm">
            <b-button
              variant="success"
              type="submit"
              class="mr-1"
            >
              <b-icon
                class="mr-1"
                icon="cloud-arrow-up"
              />
              <translate>Update</translate>
            </b-button>
            <b-button
              :disabled="isDefault"
              variant="danger"
              @click="confirm"
            >
              <b-icon
                class="mr-1"
                icon="x-circle"
              />
              <translate>Delete</translate>
            </b-button>
          </b-button-group>
        </div>
      </b-form>
    </b-card>
  </section>
</template>

<script>
import axios from 'axios';
import { mapGetters, mapState } from 'vuex';
export default {
  name: 'GodownEdit',
  data() {
    return {
      loading: false,
      form: {},
      id: Number,
      isDefault: null,
    };
  },
  computed: {
    ...mapState(['gkCoreUrl', 'authToken']),
    ...mapGetters('global', ['isIndia']),
  },
  methods: {
    confirm() {
      this.$bvModal
        .msgBoxConfirm(`Confirm delete ${this.form.goname}?`, {
          centered: true,
          okVariant: 'danger',
        })
        .then((r) => {
          if (r) {
            this.deleteGodown();
          }
        });
    },
    getGodownInfo() {
      this.loading = true;
      axios
        .get(`${this.gkCoreUrl}/godown?qty=single&goid=${this.id}`, {
          headers: {
            gktoken: this.authToken,
          },
        })
        .then((r) => {
          if (r.status == 200 && r.data.gkstatus == 0) {
            this.form = r.data.gkresult;
          }
          this.loading = false;
        })
        .catch((e) => {
          console.error(e.message);
        });
    },
    updateGodownInfo() {
      this.loading = true;
      axios
        .put(`${this.gkCoreUrl}/godown`, this.form, {
          headers: {
            gktoken: this.authToken,
          },
        })
        .then((r) => {
          switch (r.data.gkstatus) {
          case 0:
            this.$bvToast.toast(
              this.$gettext('Godown Info Updated Successfully'),
              {
                title: 'Success',
                variant: 'success',
                solid: true,
              }
            );
            axios.post(
              `${this.gkCoreUrl}/log`,
              {
                activity: `godown updated: ${this.form.goname}`,
              },
              {
                headers: {
                  gktoken: this.authToken,
                },
              }
            );
            this.$emit('godownupdate');
            this.loading = false;
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
            this.$bvToast.toast(this.$gettext('Data error'), {
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
          default:
            this.loading = false;
          }
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            variant: 'danger',
            solid: true,
          });
        });
    },
    deleteGodown() {
      this.loading = true;
      axios
        .delete(`${this.gkCoreUrl}/godown`, {
          headers: {
            gktoken: this.authToken,
          },
          data: {
            goid: this.id,
          },
        })
        .then((r) => {
          if ((r.status == 200) & (r.data.gkstatus == 0)) {
            axios
              .post(
                `${this.gkCoreUrl}/log`,
                {
                  activity: `godown deleted: ${this.form.goname}`,
                },
                {
                  headers: { gktoken: this.authToken },
                }
              )
              .then(() => {
                this.$emit('godownupdate');
                this.$bvModal.hide('edit-godown');
                this.loading = false;
              });
            // alter user about deleting the godown
            this.gk_toast('Success', `${this.form.goname} deleted`, 'success');
            setTimeout(() => this.$router.push('/godowns'), 2000);
          } else {
            this.gk_toast('Error', 'Failed To Delete Godown');
          }
        })
        .catch((e) => {
          this.gk_toast('Error', e.message);
        });
      this.loading = false;
    },
  },
  mounted() {
    this.id = this.$route.params.id;
    this.getGodownInfo();
    let defaultGodown = this.$store.getters['global/getDefaultGodown'];
    this.isDefault = defaultGodown == this.id;
  },
};
</script>
