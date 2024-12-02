<template>
  <section>
    <!-- Create user -->
    <b-card
      :header="$gettext('Add User')"
      header-bg-variant="dark"
      header-text-variant="light"
    >
      <b-form
        ref="createForm"
        @submit.prevent="addUser"
      >
        <b-overlay
          :show="isLoading"
          blur
          no-wrap
        />
        <!-- user name -->
        <b-form-group
          :label="$gettext('Name')"
          label-align="right"
          label-cols="4"
          label-size="sm"
          :state="valid.username"
          invalid-feedback="Username not unique or less than 3 characters"
        >
          <b-form-input
            v-model="form.username"
            required
            type="text"
            trim
            debounce="500"
            size="sm"
            :state="valid.username"
            @update="validateName"
          />
        </b-form-group>
        <b-form-group
          :label="$gettext('Password')"
          label-align="right"
          label-cols="4"
          label-size="sm"
        >
          <password
            size="sm"
            v-model="form.userpassword"
          />
        </b-form-group>
        <!-- confirm pwd -->
        <b-form-group
          :label="$gettext('Confirm Password')"
          label-align="right"
          label-cols="4"
          label-size="sm"
        >
          <b-form-input
            :state="pwdMatch"
            v-model="cnfPassword"
            size="sm"
            type="password"
          />
          <b-form-invalid-feedback>
            <translate>
              Passwords do not match
            </translate>
          </b-form-invalid-feedback>
        </b-form-group>
        <b-form-group
          label-size="sm"
          label-cols="4"
          label-align="right"
          :label="$gettext('Question')"
        >
          <security-questions
            size="sm"
            v-model="form.userquestion"
          />
        </b-form-group>
        <b-form-group
          label-cols="4"
          label-size="sm"
          label-align="right"
          :label="$gettext('Answer')"
        >
          <b-form-input
            v-model="form.useranswer"
            required
            type="text"
            size="sm"
          />
        </b-form-group>
        <hr>
        <b-form-group
          label-size="md"
          id="input-group-1"
          label="Captcha"
          label-for="captcha-1"
          label-cols="3"
        >
          <template #label>
            <captcha
              width="90"
              v-model="answer"
            />
          </template>
          <!-- user answer -->
          <b-form-input
            size="md"
            class="mt-1"
            id="captcha-1"
            v-model="userAnswer"
            type="text"
            placeholder="Captcha Answer"
            required
          />
        </b-form-group>
        <!-- create user  -->
        <slot name="modal-footer">
          <b-button
            :disabled="!pwdMatch"
            size="sm"
            type="submit"
            class="float-right"
            variant="success"
          >
            <b-icon
              class="mr-1"
              type="submit"
              icon="person-plus"
            />
            <translate>Create User</translate>
          </b-button>
        </slot>
      </b-form>
    </b-card>
  </section>
</template>

<script>
// L292 & validateName computed property has some warnings. disable those
/* eslint-disable */
import { mapState } from 'vuex';
import axios from 'axios';
import Password from '@/components/Password.vue';
import SecurityQuestions from '@/components/SecurityQuestions.vue';
import { STATUS_CODES } from '@/js/enum.js';
import Captcha from '@/components/Captcha.vue';
export default {
  components: { SecurityQuestions, Password, Captcha },
  name: 'CreateUser',
  data() {
    return {
      isLoading: false,
      cnfPassword: '',
      answer: null,
      userAnswer: null,
      form: {
        username: '',
        userpassword: '',
        userquestion: '',
        useranswer: '',
      },
      valid: {
        username: null,
      },
    };
  },
  watch: {
    'form.username'(v) {
      this.validateName();
    },
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
    ...mapState(['gkCoreUrl', 'authToken']),
    pwdMatch() {
      if (this.cnfPassword == '') {
        return null;
      }

      if (this.form.userpassword === this.hashedPassword(this.cnfPassword)) {
        return true;
      } else {
        return false;
      }
    },
  },
  methods: {
    validateName() {
      // remove spaces in username
      this.form.username = this.form.username.split(' ').join('');
      if (this.form.username === '') {
        this.valid.username = null;
        return;
      }
      // username should be atleast three characters
      if (this.form.username.length < 5) {
        this.valid.username = false;
        return;
      } else {
        this.valid.username = true;
        this.checkUserName();
      }
    },
    resetForm() {
      this.form = {
        username: '',
        userpassword: '',
        userquestion: '',
        useranswer: '',
      };
    },
    checkUserName(query) {
      const self = this;
      axios.get(`/gkuser/check/${query}?check_legacy=true`).then((resp) => {
        if (query === self.form.username) {
          if (resp.data.gkstatus === STATUS_CODES['Success']) {
            self.valid.username = resp.data.gkresult;
          } else {
            self.valid.username = false;
          }
        }
      });
    },
    /* Create User */
    addUser() {
      if (this.form.username.length < 5) {
        // Alert the user on username length
        this.$bvToast.toast(
          this.$gettext(`Username is less than 5 characters`),
          {
            title: this.$gettext('Invalid username'),
            autoHideDelay: 3000,
            variant: 'danger',
            appendToast: true,
            solid: true,
          }
        );
        return;
      }
      if (this.userAnswer != this.answer) {
        // Alert the user on captcha failure
        this.$bvToast.toast(
          this.$gettext(`Captcha is incorrect. Please try again`),
          {
            title: this.$gettext('Captcha Error!'),
            autoHideDelay: 3000,
            variant: 'warning',
            appendToast: true,
            solid: true,
          }
        );
        return;
      }

      this.isLoading = true;
      // If selected role is godown incharge, add selected godown id's to the submitted form

      let userName = this.form.username;
      axios
        .post(`/gkuser`, this.form)
        .then((resp) => {
          switch (resp.data.gkstatus) {
            case STATUS_CODES['Success']:
              {
                this.$bvToast.toast(`${userName} created successfully`, {
                  title: 'Success',
                  variant: 'success',
                  solid: true,
                });
                // Add user created log to server
                const payload = {
                  activity: `user ${userName} created`,
                };
                axios.post(`/log`, payload, {
                  headers: {
                    usertoken: resp.data.token,
                  },
                });
                // refresh users list in USerManagement.vue
                this.onSuccess({
                  token: resp.data.token,
                  username: userName,
                });
                this.resetForm();
              }
              break;
            case STATUS_CODES['DuplicateEntry']:
              this.$bvToast.toast(`Username ${userName} already exists`, {
                variant: 'danger',
                solid: true,
              });
              break;
            case STATUS_CODES['ConnectionFailed']:
              this.$bvToast.toast('Connection Failed', {
                variant: 'danger',
                solid: true,
              });
              break;
          }
        })
        .catch(() => {
          this.$bvToast.toast(
            'Connection failed with status code ' + resp.status,
            {
              variant: 'danger',
              solid: true,
            }
          );
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
  },
};
</script>
