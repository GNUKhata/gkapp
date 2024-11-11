<template>
  <section class="m-2">
    <b-card
      :header="$gettext('Reset Password')"
      header-bg-variant="dark"
      header-text-variant="light"
      class="mx-auto"
      style="max-width: 40em"
    >
      <b-form @submit.prevent="changePassword">
        <b-form-group
          label-cols="4"
          label-align="right"
          label-size="sm"
          :label="$gettext('Select Organisation')"
        >
          <b-overlay :show="loadingOrgs">
            <b-form-select
              v-model="selectedOrg"
              @change="getOrgYears"
              :options="orgList"
              required
            >
              <b-form-select-option
                disabled
                value="null"
              >
                <translate>
                  -- Select an Organisation --
                </translate>
              </b-form-select-option>
            </b-form-select>
          </b-overlay>
        </b-form-group>
        <!-- username -->
        <b-form-group
          label-cols="4"
          label-align="right"
          label-size="sm"
          :label="$gettext('Username')"
          tooltip
        >
          <b-overlay :show="userNameIsLoading">
            <b-form-input
              @blur="getQuestion"
              v-model="form.username"
              type="text"
              required
              :disabled="disableUserName"
            />
          </b-overlay>
        </b-form-group>
        <!-- security question -->
        <b-form-group
          label-cols="4"
          label-align="right"
          label-size="sm"
          :label="$gettext('Security Question')"
          tooltip
        >
          <b-overlay :show="isLoading">
            <b-form-input
              v-model="form.userquestion"
              type="text"
              disabled
            />
            <template #overlay>
              <div class="text-center">
                <b-icon
                  icon="cloud-arrow-down"
                  font-scale="2"
                  animation="throb"
                />
                <br>
                <small>
                  <translate>Getting Security Question</translate>
                </small>
              </div>
            </template>
          </b-overlay>
        </b-form-group>
        <!-- Answer  -->
        <b-form-group
          label-cols="4"
          label-size="sm"
          label-align="right"
          :label="$gettext('Answer')"
        >
          <b-form-input
            v-model="form.useranswer"
            required
          />
        </b-form-group>
        <!--New Password -->
        <b-form-group
          label-cols="4"
          label-size="sm"
          label-align="right"
          :label="$gettext('New Password')"
        >
          <!-- <b-form-input v-model="form.userpassword" required></b-form-input> -->
          <password v-model="form.userpassword" />
        </b-form-group>
        <!-- Confirm Password -->
        <b-form-group
          label-cols="4"
          label-align="right"
          label-size="sm"
          :label="$gettext('Confirm Password')"
        >
          <b-form-input
            :state="matchingPwd"
            required
            v-model="password2"
          />
          <b-form-valid-feedback>
            <translate>Passwords Match</translate>
          </b-form-valid-feedback>
          <b-form-invalid-feedback>
            <translate>passwords does not match</translate>
          </b-form-invalid-feedback>
        </b-form-group>
        <!-- submit  button -->
        <b-button
          :disabled="!matchingPwd"
          type="submit"
          variant="success"
          class="float-right"
        >
          <b-icon
            class="mr-1"
            v-if="!submitting"
            icon="key-fill"
          />
          <b-spinner
            v-if="submitting"
            small
          />
          <translate>Reset Password</translate>
        </b-button>
      </b-form>
    </b-card>
  </section>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
import Password from '../components/Password.vue';
export default {
  components: { Password },
  name: 'ResetPassword',
  data() {
    return {
      orgList: [],
      loadingOrgs: true,
      isLoading: false,
      userNameIsLoading: false,
      disableUserName: true,
      submitting: false,
      selectedOrg: Object,
      password2: '',
      uid: Number,
      form: {
        username: '',
        userquestion: '',
        useranswer: '',
        userpassword: '',
      },
    };
  },
  computed: {
    ...mapState(['orgCode']),
    matchingPwd() {
      if (this.password2 == '') {
        return null;
      }
      if (this.form.userpassword === this.hashedPassword(this.password2)) {
        return true;
      } else {
        return false;
      }
    },
  },
  mounted() {
    this.fetchOrgs();
  },
  methods: {
    /**
     * Get list of companies & show them in login form for user to select
     * */
    fetchOrgs() {
      this.loadingOrgs = true;
      axios
        .get(`/organisation/all`)
        .then((response) => {
          this.orgList = response.data.gkdata;
          let opt = [];
          for (const i in this.orgList) {
            const item = {
              value: this.orgList[i],
              text: `${this.orgList[i].orgname} (${this.orgList[i].orgtype})`,
            };
            opt.push(item);
          }
          this.orgList = opt;
          this.loadingOrgs = false;
        })
        .catch(function(error) {
          console.log(error);
          this.loadingOrgs = false;
        });
    },
    /*
     * send org name & type & get a org's financial years as objects
     */
    getOrgYears() {
      this.userNameIsLoading = true;
      axios
        .get(
          `/orgyears/${this.selectedOrg.orgname}/${this.selectedOrg.orgtype}`
        )
        .then((r) => {
          if (r.status == 200) {
            this.uid = r.data.gkdata[0].orgcode;
            this.disableUserName = false;
            this.userNameIsLoading = false;
          } else {
            console.log('Unable to fetch org years');
          }
        })
        .catch((e) => {
          console.log(e.message);
        });
    },
    /* Get user's security question */
    getQuestion() {
      this.isLoading = true;
      axios
        .get(
          `/forgotpassword?username=${this.form.username}&orgcode=${this.uid}`
        )
        .then((r) => {
          if (r.status == 200) {
            let usr = r.data.gkresult;
            switch (r.data.gkstatus) {
            case 0:
              this.form.userquestion = usr.userquestion;
              this.uid = usr.userid;
              break;
            default:
              this.$bvToast.toast('Invalid Username', {
                variant: 'danger',
                solid: true,
              });
              this.form.userquestion = '';
            }
          } else {
            console.log(r.status);
          }
          this.isLoading = false;
          this.cardLoading = false;
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            variant: 'danger',
            solid: true,
          });
          this.isLoading = false;
        });
    },
    /* Check the given security answer & validate it. If it's valid, show password change inputs*/
    changePassword() {
      this.submitting = true;
      axios
        .put(`/forgotpassword`, {
          userid: this.uid,
          userpassword: this.form.userpassword,
          useranswer: this.form.useranswer,
        })
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
            case 0:
              this.$bvModal
                .msgBoxOk(
                  this.$gettext(
                    'Password Change Successful, Memorize it well this time 😉'
                  ),
                  {
                    title: this.$gettext('Success'),
                    headerTextVariant: 'light',
                    headerBgVariant: 'success',
                    okVariant: 'success',
                  }
                )
                .then((res) => {
                  if (res == true) {
                    this.$router.push('/');
                  }
                });
              break;
            default:
              this.$bvToast.toast(
                this.$gettext('Invalid answer, Please try again'),
                {
                  variant: 'danger',
                  solid: true,
                }
              );
              this.submitting = false;
            }
          } else {
            this.$bvToast.toast(
              this.$gettext('Failed with Status code ') + r.status,
              {
                variant: 'danger',
                solid: true,
              }
            );
            this.submitting = false;
          }
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            variant: 'danger',
            solid: true,
          });
          this.submitting = false;
        });
    },
  },
};
</script>
