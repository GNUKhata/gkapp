<template>
  <section class="m-2">
    <!-- Create user -->
    <b-card
      :header="$gettext('Invite User')"
      header-bg-variant="dark"
      header-text-variant="light"
      class="gkcard mx-auto"
    >
      <b-form
        ref="createUserForm"
        @submit.prevent="check"
      >
        <b-overlay
          :show="isLoading"
          blur
          no-wrap
        />
        <b-form-group
          :label="$gettext('Name')"
          label-align="right"
          label-cols="4"
          label-size="sm"
        >
          <b-input-group>
            <b-form-input
              :state="validUser"
              v-model="form.username"
              required
              type="text"
              trim
              size="sm"
            />
            <b-button
              :disabled="validating"
              @click="validateUser"
              size="sm"
            >
              <!-- <b-icon class="mr-1" type="submit" icon="search"></b-icon> -->
              <translate>Validate</translate>
            </b-button>
            <b-form-invalid-feedback id="input-live-feedback">
              <translate>
                Recommended uppercase, lowercase, number, _ & minimum 5 characters long,
                must start with a letter and underscores with at least one character after the underscore.
              </translate>
            </b-form-invalid-feedback>
          </b-input-group>
          <small><translate>* Type an existing user's name</translate></small>
        </b-form-group>
        <b-form-group
          :label="$gettext('Role')"
          label-size="sm"
          label-align="right"
          label-cols="4"
        >
          <b-form-select
            v-model="form.userrole"
            :options="roles"
            required
            size="sm"
            @change="getGodowns"
          >
            <b-form-select-option
              disabled
              value="null"
            >
              -- Select Role --
            </b-form-select-option>
          </b-form-select>
        </b-form-group>
        <b-table-simple
          v-if="form.userrole === 3"
          hover
          small
          caption-top
          responsive
          striped
        >
          <caption>
            <translate>Select Godowns</translate>
          </caption>
          <b-thead head-variant="dark">
            <b-tr>
              <b-th v-translate>
                Select
              </b-th>
              <b-th v-translate>
                Name
              </b-th>
              <b-th v-translate>
                State
              </b-th>
              <b-th v-translate>
                Address
              </b-th>
            </b-tr>
          </b-thead>
          <b-tbody>
            <b-tr
              v-for="godown in allGodowns"
              :key="godown.goid"
            >
              <b-td>
                <b-form-checkbox
                  value="accepted"
                  unchecked-value="not_accepted"
                  v-model="godown.checked"
                  switch
                />
              </b-td>
              <b-td>{{ godown.goname }}</b-td>
              <b-td>{{ godown.state }}</b-td>
              <b-td>{{ godown.goaddr }}</b-td>
              <!-- <b-td>{{ godown.checked }}</b-td> -->
            </b-tr>
          </b-tbody>
        </b-table-simple>
        <div
          v-if="!existUser && existUser !== null"
          class="mb-2"
        >
          <b-form-checkbox
            class="float-right"
            v-model="createUser"
            name="check-button"
          >
            <span> User not present, Do you want to create a new user? </span>
          </b-form-checkbox>
          <div class="clearfix" />
        </div>
        <!-- create new user -->
        <div v-if="createUser">
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
          <b-form-group
            :label="$gettext('Confirm Password')"
            label-align="right"
            label-cols="4"
            label-size="sm"
          >
            <b-form-input
              :state="pwdMatch"
              type="password"
              v-model="cnfPassword"
              size="sm"
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
        </div>
        <slot name="modal-footer">
          <b-button
            :disabled="!allValid"
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
            <span
              v-if="createUser"
            ><translate>Create & Invite User</translate></span>
            <span v-else><translate> Invite User </translate></span>
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
import Password from '../Password.vue';
import SecurityQuestions from '../SecurityQuestions.vue';
import { STATUS_CODES, USER_ROLES } from '@/js/enum.js';
export default {
  components: { SecurityQuestions, Password },
  name: 'InviteUser',
  data() {
    return {
      isLoading: false,
      allGodowns: [],
      cnfPassword: '',
      validUser: null,
      existUser: null,
      validating: false,
      createUser: false,
      form: {
        username: '',
        userpassword: '',
        userrole: Number,
        userquestion: '',
        useranswer: '',
        golist: [],
      },
      roles: [
        {
          value: -1,
          text: 'Admin',
        },
        {
          value: 0,
          text: 'Manager',
        },
        {
          value: 1,
          text: 'Operator',
        },
        {
          value: 2,
          text: 'Internal Auditor',
        },
        {
          value: 3,
          text: 'Godown In Charge',
        },
      ],
    };
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
    validateName() {
      // remove spaces in username
      this.form.username = this.form.username.split(' ').join('');
      if (this.form.username === '') {
        return null;
      }
      // username should be atleast three characters
      if (this.form.username.length < 5) {
        return false;
      } else {
        return true;
      }
    },
    allValid() {
      let validity = true;
      if (this.createUser) {
        validity = validity && this.pwdMatch && this.validateName;
      } else {
        validity = validity && this.validUser && this.existUser && this.validateName;
      }
      return validity;
    },
  },
  watch: {
    validateName(validity) {
      if (validity === null) {
        this.existUser = null;
      }
    },
  },
  methods: {
    check() {
      if (this.createUser) {
        this.addInviteNewUser();
      } else {
        this.inviteUser();
      }
    },
    validateUser() {
      this.validating = true;
      axios
        .get(`/gkuser/check/${this.form.username}`)
        .then((resp) => {
          // username should be atleast three characters
          if (this.form.username.length < 5 || !/^[a-zA-Z][a-zA-Z\d]*(?:_?[a-zA-Z\d]+)?$/.test(this.form.username)) {
            this.validUser = false;
          } else {
            this.validUser = true;
          }
          if (resp.data.gkstatus === STATUS_CODES['Success']) {
            this.existUser = !resp.data.gkresult;
          } else {
            this.existUser = false;
          }
        })
        .catch(() => {
          this.validUser = false;
        })
        .finally(() => {
          this.validating = false;
        });
    },
    inviteUser() {
      if (!this.allValid) {
        this.$bvToast.toast('Please check if username is valid', {
          variant: 'warning',
          solid: true,
        });
      }
      let payload = {
        userrole: this.form.userrole,
        username: this.form.username,
      };

      // If selected role is godown incharge, add selected godown id's to the submitted form
      if (this.form.userrole == USER_ROLES['godown_incharge']) {
        let list = [];
        for (let i in this.allGodowns) {
          if (this.allGodowns[i].checked === 'accepted') {
            list.push(this.allGodowns[i].goid);
          }
        }
        payload.golist = list;
      }
      axios
        .post('/invite', payload)
        .then((resp) => {
          switch (resp.data.gkstatus) {
            case STATUS_CODES['Success']:
              this.gk_log(`user invited: ${this.form.username}`);
              if(this.createUser) {
                this.$bvToast.toast(
                  `${this.form.username} has been created & Invited successfully.`,
                  {
                    variant: 'success',
                    solid: true,
                  }
                );
              } else {
                this.$bvToast.toast(
                  `${this.form.username} has been invited successfully.`,
                  {
                    variant: 'success',
                    solid: true,
                  }
                );
              }
              this.$refs['createUserForm'].reset();
              this.createUser = false;
              this.validUser = null;
              this.form.username = '';
              break;
            case STATUS_CODES['DuplicateEntry']:
              this.$bvToast.toast(
                this.$gettext(
                  'User is already part of the organisation, please try again with another user'
                ),
                {
                  variant: 'warning',
                  solid: true,
                }
              );
              break;
            case STATUS_CODES['UnauthorisedAccess']:
              this.$bvToast.toast(
                this.$gettext(
                  'User not authorised, Please check your login status'
                ),
                {
                  variant: 'warning',
                  solid: true,
                }
              );
              break;
            case STATUS_CODES['ActionDisallowed']:
              this.$bvToast.toast(
                this.$gettext(
                  'Authorization Error: User has not been granted invite permissions'
                ),
                {
                  variant: 'warning',
                  solid: true,
                }
              );
              break;
            case STATUS_CODES['ConnectionFailed']:
            default:
              this.$bvToast.toast(
                this.$gettext(
                  'Issue with invitation creation, please contact admin'
                ),
                {
                  variant: 'danger',
                  solid: true,
                }
              );
          }
        })
        .catch(() => {
          this.$bvToast.toast(
            this.$gettext(
              'Issue with invitation creation, please contact admin'
            ),
            {
              variant: 'danger',
              solid: true,
            }
          );
        });
    },
    /**
     * get all godowns in current organisation
     */
    getGodowns() {
      this.isLoading = true;
      axios
        .get(`${this.gkCoreUrl}/godown`, {
          headers: { gktoken: this.authToken },
        })
        .then((r) => {
          if (r.status == 200 && r.data.gkstatus == 0) {
            let godowns = r.data.gkresult;
            for (let i in godowns) {
              godowns[i].checked = 'not_accepted';
            }
            this.allGodowns = godowns;
            this.isLoading = false;
          }
        })
        .catch((e) => {
          this.$bvToast.toast(
            this.$gettext(
              'Failed to fetch godown info, Please reload the page'
            ),
            {
              title: e.message,
              variant: 'danger',
              solid: true,
            }
          );
          this.isLoading = false;
        });
    },
    // add a new user by calling the /gkuser api
    // on success, call the inviteUser() to invite
    // the created user
    addInviteNewUser() {
      this.isLoading = true;
      axios
        .post('/gkuser', this.form)
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
              case STATUS_CODES['Success']:
                this.validUser = true;
                // invoke invite user api & reset the form
                this.inviteUser();
                break;
              case STATUS_CODES['BadPrivilege']:
                this.$bvToast.toast(
                  this.$gettext(`User creation unsuccessful`),
                  {
                    title: 'error',
                    variant: 'danger',
                  }
                );
                break;
              case STATUS_CODES['ActionDisallowed']:
                this.$bvToast.toast(
                  this.$gettext(
                    `User creation is not allowed. Only a user with admin role can delete another user`
                  ),
                  {
                    title: 'error',
                    variant: 'danger',
                  }
                );
                break;
              case STATUS_CODES['ConnectionFailed']:
                this.$bvToast.toast(this.$gettext(`User creation failed`), {
                  title: 'error',
                  variant: 'danger',
                });
                break;
            }
          }
        })
        .catch((e) => {
          this.$bvToast.toast(e, {
            title: 'error',
            variant: 'danger',
          });
        });
      this.isLoading = false;
    },
  },
};
</script>
