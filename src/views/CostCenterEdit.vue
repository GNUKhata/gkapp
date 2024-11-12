<template>
  <section class="m-2">
    <b-overlay
      :show="loading"
      fixed
      spinner-type="grow"
      blur
    >
      <b-form @submit.prevent="updateCostCenter">
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
          <b-icon
            class="mr-1"
            icon="cloud-arrow-up"
          />
          <translate>Update</translate>
        </b-button>
      </b-form>
    </b-overlay>
  </section>
</template>

<script>
import axios from 'axios';
export default {
  name: 'CostCenterEdit',
  props: {
    id: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      form: {
        projectname: '',
        sanctionedamount: null,
      },
    };
  },
  methods: {
    getCostCenterInfo() {
      this.loading = true;
      axios
        .get(`/project/${this.id}`)
        .then((r) => {
          if (r.status == 200) {
            let data = r.data.gkresult;
            this.form.projectname = data.projectname;
            this.form.sanctionedamount = data.sanctionedamount;
            this.form.projectcode = data.projectcode;
          } else {
            console.log(r.status);
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
    updateCostCenter() {
      this.loading = true;
      axios
        .put('/projects', this.form)
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
            case 0:
              this.$bvToast.toast(
                `${this.form.projectname} updated Successfully`,
                {
                  variant: 'success',
                  solid: true,
                }
              );
              axios.post('/log', {
                activity: `cost center modified: ${this.form.projectname}`,
              });
              this.$emit('modified');
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
            }
          } else {
            this.$bvToast.toast(r.status + ' error', {
              variant: 'danger',
              solid: true,
            });
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
  mounted() {
    this.getCostCenterInfo();
  },
};
</script>
