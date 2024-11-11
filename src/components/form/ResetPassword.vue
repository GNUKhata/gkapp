<template>
  <b-card
    :header="$gettext('Reset Password')"
    header-bg-variant="dark"
    header-text-variant="light"
  >
    <b-form @submit.prevent="onSubmit">
      <!-- username -->
      <b-form-group
        label-cols="4"
        label-align="right"
        label-size="sm"
        :label="$gettext('Username')"
        tooltip
        :state="valid.username"
        invalid-feedback="Enter valid username"
      >
        <b-overlay :show="userNameIsLoading">
          <b-form-input
            v-model="form.username"
            type="text"
            required
            :state="valid.username"
          />
        </b-overlay>
      </b-form-group>
      <b-form-group
        label-cols="4"
        label-align="right"
        label-size="sm"
        :label="$gettext('Select Organisation')"
        v-if="formPosition === 3 || valid.username_legacy"
      >
        <b-overlay :show="loadingOrgs">
          <v-select
            :reduce="(option) => option.value"
            :options="orgList"
            v-model="selectedOrg"
            placeholder="Select an Organisation"
          />
        </b-overlay>
      </b-form-group>
      <b-button
        type="submit"
        v-if="!valid.username"
        variant="success"
        class="float-right"
      >
        <!-- <b-icon class="mr-1" v-if="!submitting" icon="question-circle"></b-icon> -->
        <b-spinner
          v-if="submitting"
          small
        />
        <translate>Verify Username</translate>
      </b-button>
      <div v-if="valid.username">
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
          :state="valid.answer"
        >
          <b-form-input
            :state="valid.answer"
            v-model="form.useranswer"
            required
          />
        </b-form-group>
        <b-button
          v-if="!valid.answer"
          :disabled="!valid.username"
          variant="success"
          class="float-right"
          type="submit"
        >
          <!-- <b-icon class="mr-1" v-if="!submitting" icon="question-circle"></b-icon> -->
          <b-spinner
            v-if="submitting"
            small
          />
          <translate>Verify Answer</translate>
        </b-button>
      </div>
      <div v-if="valid.username && valid.answer">
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
            type="password"
          />
          <b-form-valid-feedback>
            <translate>Passwords Match</translate>
          </b-form-valid-feedback>
          <b-form-invalid-feedback>
            <translate>passwords does not match</translate>
          </b-form-invalid-feedback>
        </b-form-group>
        <!-- Reset password  button -->
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
      </div>
    </b-form>
  </b-card>
</template>

<script>
const POSITION = {
  VERIFY_USER: 0,
  VERIFY_ANSWER: 1,
  RESET_PASSWORD: 2,
  VERIFY_USER_LEGACY: 3,
};
Object.freeze(POSITION);

import axios from 'axios';
import { mapState } from 'vuex';
import Password from '@/components/Password.vue';
import { STATUS_CODES } from '@/js/enum.js';
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
      selectedOrg: {
        label: '',
      },
      password2: '',
      uid: null,
      form: {
        username: '',
        userquestion: '',
        useranswer: '',
        userpassword: '',
      },
      valid: {
        username: null,
        username_legacy: null,
        answer: null,
        password: null,
      },
      formPosition: POSITION['VERIFY_USER'],
    };
  },
  props: {
    onSuccess: {
      type: Function,
      required: false,
      default: () => {},
      note: 'on success callback, used to close the popup',
    },
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
  methods: {
    resetForm() {
      this.form = {
        username: '',
        userquestion: '',
        useranswer: '',
        userpassword: '',
      };
      this.valid = {
        username: null,
        username_legacy: null,
        answer: null,
        password: null,
      };
      this.formPosition = POSITION['VERIFY_USER'];
      this.password2 = '';
      this.uid = null;
    },
    onSubmit() {
      switch (this.formPosition) {
      case POSITION['VERIFY_USER']:
      case POSITION['VERIFY_USER_LEGACY']:
        {
          let url = `/gkuser/pwd/question?username=${this.form.username}`;
          if (this.formPosition === POSITION['VERIFY_USER_LEGACY']) {
            url += `&orgname=${this.selectedOrg.orgname}&orgtype=${this.selectedOrg.orgtype}`;
          }
          axios
            .get(url)
            .then((resp) => {
              switch (resp.data.gkstatus) {
              case STATUS_CODES['Success']: {
                this.form.userquestion = resp.data.gkresult.userquestion;
                this.uid = resp.data.gkresult.userid;
                this.valid.username = true;
                if (this.formPosition === POSITION['VERIFY_USER_LEGACY']) {
                  this.valid.username_legacy = true;
                }
                this.formPosition = POSITION['VERIFY_ANSWER'];
                break;
              }
              case STATUS_CODES['ActionDisallowed']: {
                this.formPosition = POSITION['VERIFY_USER_LEGACY'];
                break;
              }
              case STATUS_CODES['BadPrivilege']: {
                this.$bvToast.toast('Invalid Username', {
                  variant: 'danger',
                  solid: true,
                });
                this.valid.username = false;
                break;
              }
              }
            })
            .catch(() => {
              this.$bvToast.toast(
                'Issue verifying the username, please contact admin',
                {
                  variant: 'danger',
                  solid: true,
                }
              );
            });
        }
        break;
      case POSITION['VERIFY_ANSWER']: {
        axios
          .get(
            `/gkuser/pwd/answer?userid=${this.uid}&useranswer=${this.form.useranswer}`
          )
          .then((resp) => {
            switch (resp.data.gkstatus) {
            case STATUS_CODES['Success']:
              this.valid.answer = true;
              this.formPosition = POSITION['RESET_PASSWORD'];
              break;
            case STATUS_CODES['BadPrivilege']:
              this.$bvToast.toast('Invalid Answer', {
                variant: 'danger',
                solid: true,
              });
              this.valid.answer = false;
              break;
            default:
              this.$bvToast.toast(
                'Issue verifying the security answer, please contact admin',
                {
                  variant: 'danger',
                  solid: true,
                }
              );
            }
          })
          .catch(() => {
            this.$bvToast.toast(
              'Issue verifying the security answer, please contact admin',
              {
                variant: 'danger',
                solid: true,
              }
            );
          });
        break;
      }
      case POSITION['RESET_PASSWORD']: {
        let payload = {
          useranswer: this.form.useranswer,
          userid: this.uid,
          userpassword: this.form.userpassword,
        };
        axios
          .put(`/gkuser/pwd/reset`, payload)
          .then((resp) => {
            switch (resp.data.gkstatus) {
            case STATUS_CODES['Success']:
              this.resetForm();
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
                    this.onSuccess();
                  }
                });
              break;
            case STATUS_CODES['BadPrivilege']:
              this.$bvToast.toast('Invalid Answer', {
                variant: 'danger',
                solid: true,
              });
              break;
            default:
              this.$bvToast.toast(
                'Issue resetting the password, please contact admin',
                {
                  variant: 'danger',
                  solid: true,
                }
              );
            }
          })
          .catch(() => {
            this.$bvToast.toast(
              'Issue resetting the password, please contact admin',
              {
                variant: 'danger',
                solid: true,
              }
            );
          });
      }
      }
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
