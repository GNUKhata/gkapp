<template>
  <section class="m-2">
    <b-overlay
      :show="loading"
      fixed
      spinner-type="grow"
      blur
    >
      <b-form
        ref="costCenterAdd"
        @submit.prevent="createCostCenter"
      >
        <b-form-group :label="$gettext('Name')">
          <b-form-input
            v-model="form.projectname"
            required
          />
        </b-form-group>
        <b-form-group :label="$gettext('Budgeted Amount')">
          <b-form-input
            v-model="form.sanctionedamount"
            required
            no-wheel
            type="number"
            placeholder="0.00"
            step="0.01"
          />
        </b-form-group>
        <b-button
          type="submit"
          variant="success"
        >
          <b-icon icon="plus" /> <translate>Add</translate>
        </b-button>
      </b-form>
    </b-overlay>
  </section>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
export default {
  name: 'CostCenterCreate',
  data() {
    return {
      loading: false,
      form: {
        projectname: '',
        sanctionedamount: null,
      },
    };
  },
  computed: {
    ...mapState(['gkCoreUrl', 'authToken']),
  },
  methods: {
    createCostCenter() {
      axios
        .post('/projects', this.form)
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
            case 0:
              this.$bvToast.toast(
                `${this.form.projectname} Created Successfully`,
                {
                  variant: 'success',
                  solid: true,
                }
              );
              //reset the form
              this.$refs.costCenterAdd.reset();
              axios.post('/log', {
                activity: 'cost center create: ' + this.form.projectname,
              });
              this.$emit('created');
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
          } else {
            this.$bvToast.toast(r.status + ' error', {
              variant: 'danger',
              solid: true,
            });
            this.loading = false;
          }
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
