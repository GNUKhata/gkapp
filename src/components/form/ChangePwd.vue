<template>
  <b-form
    @submit.prevent="validatePwd"
  >
    <b-overlay
      :show="isLoading"
      blur
      no-wrap
    />
    <b-form-group
      label-cols="4"
      label-size="sm"
      label-align="right"
      :label="$gettext('Current Password')"
    >
      <b-form-input
        size="sm"
        type="password"
        v-model.lazy="currentPwd"
        required
      />
    </b-form-group>
    <b-form-group
      label-cols="4"
      label-align="right"
      label-size="sm"
      :label="$gettext('New Password')"
    >
      <password
        size="sm"
        v-model="form.userpassword"
      />
    </b-form-group>
    <b-form-group
      label-cols="4"
      label-align="right"
      label-size="sm"
      :label="$gettext('Confirm Password')"
    >
      <b-form-input
        type="password"
        :state="matchingPwds"
        v-model="confirmPwd"
        required
        size="sm"
      />
      <b-form-invalid-feedback id="input-live-feedback">
        <translate>Passwords do not match</translate>
      </b-form-invalid-feedback>
    </b-form-group>
    <!--Captcha area-->
    <b-form-group
      :label="$gettext('Question')"
      label-size="sm"
      label-align="right"
      label-cols="4"
    >
      <captcha v-model="answer" />
    </b-form-group>
    <!-- captcha answer -->
    <b-form-group
      :label="$gettext('Answer')"
      label-size="sm"
      label-align="right"
      description="* Required"
      label-cols="4"
    >
      <b-form-input
        v-model="userAnswer"
        type="number"
        no-wheel
        placeholder="Enter the Answer"
        required
        size="sm"
      />
    </b-form-group>
    <b-button
      type="submit"
      size="sm"
      :disabled="!matchingPwds"
      variant="success"
      class="float-right"
    >
      <b-icon icon="key" /><translate> Change Password</translate>
    </b-button>
  </b-form>
</template>

<script>
/*
 /This module has functions to update current user's password
 */
import { mapState } from 'vuex';
import Captcha from '../Captcha.vue';
import Password from '../Password.vue';
import axios from 'axios';
export default {
  components: { Captcha, Password },
  name: 'ChangePwd',
  data() {
    return {
      isLoading: false,
      currentPwd: '',
      confirmPwd: '',
      answer: null,
      userAnswer: null,
      form: {
        userid: Number,
        userpassword: '',
      },
    };
  },
  computed: {
    ...mapState(['userName', 'gkCoreUrl', 'authToken']),
    matchingPwds() {
      if (this.confirmPwd === '') {
        return null;
      }
      if (this.form.userpassword === this.hashedPassword(this.confirmPwd)) {
        return true;
      } else {
        return false;
      }
    },
  },
  methods: {
    /* Get user's details from api */
    /* getUserInfo() {
      this.isLoading = true;
      axios
        .get(`${this.gkCoreUrl}/gkuser`, {
          headers: {
            gktoken: this.authToken,
          },
        })
        .then((r) => {
          if (r.status == 200) {
            let info = r.data.gkresult;
            switch (r.data.gkstatus) {
              case 0:
                this.form.userid = info.userid;
                this.isLoading = false;
                break;
              default:
                this.$bvToast.toast('Request failed', {
                  title: `status code ${r.data.gkstatus}`,
                  variant: 'danger',
                  solid: true,
                });
                this.isLoading = false;
            }
          }
        })
        .catch((e) => {
          console.log(e);
          this.isLoading = false;
        });
    }, */

    /* Check if user's password is valid */
    validatePwd() {
      this.isLoading = true;
      axios
        .post(
          `${this.gkCoreUrl}/gkuser/pwd/validate`,
          {
            username: this.userName,
            userpassword: this.hashedPassword(this.currentPwd),
          },
          { headers: { gktoken: this.authToken } }
        )
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
            case 0:
              if (this.userAnswer == this.answer) {
                // run the method which hits the change pwd API
                this.changePwd();
              } else {
                this.$bvToast.toast('Invalid Captcha', {
                  variant: 'danger',
                  solid: true,
                });
                this.isLoading = false;
              }
              break;
            case 4:
              this.$bvToast.toast(
                'Invalid current Password, Please try again',
                {
                  solid: true,
                  variant: 'danger',
                }
              );
              this.isLoading = false;
              break;
            default:
              this.$bvToast.toast(`Failed with gkstatus ${r.data.gkstatus}`, {
                solid: true,
                variant: 'danger',
              });
              this.isLoading = false;
            }
          }
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            solid: true,
            variant: 'danger',
          });
          this.isLoading = false;
        });
    },
    /* Proceed to changing user's password on successful validation */
    changePwd() {
      axios
        .put(
          `${this.gkCoreUrl}/gkuser/pwd/change`,
          {
            /* userid: this.form.userid,
            username: this.userName, */
            userpassword: this.form.userpassword,
          },
          {
            headers: { gktoken: this.authToken },
          }
        )
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
            case 0:
              this.$bvToast.toast(
                `Password Change Successful for ${this.userName}`,
                {
                  title: 'Success',
                  variant: 'success',
                  solid: true,
                }
              );
              this.isLoading = false;
              // send event to close the window
              this.$emit('close-pwd');
              break;
            default:
              this.$bvToast.toast(
                `Failed to update password for ${this.userName}`,
                {
                  title: `gkstatus ${r.data.gkstatus}`,
                  variant: 'danger',
                  solid: true,
                }
              );
              this.isLoading = false;
            }
          }
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            variant: 'danger',
            solid: true,
          });
          this.isLoading = false;
        });
    },
  },
};
</script>
