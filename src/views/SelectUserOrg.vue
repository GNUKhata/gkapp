<template>
  <section class="m-2">
    <!-- User Login -->
    <b-card
      v-if="!userAuthToken"
      class="shadow mx-auto"
      style="max-width: 35em"
      header-bg-variant="dark"
      header-text-variant="light"
    >
      <template #header>
        Login
      </template>
      <!-- login banner -->
      <b-alert
        :show="gkConfig.login_banner.show"
        :variant="gkConfig.login_banner.variant"
        class="mb-2 mx-auto"
        style="max-width:35em"
        v-html="gkConfig.login_banner.content"
      />
      <b-form @submit.prevent="preUserLogin">
        <!--Username area-->
        <b-form-group
          :label="$gettext('Username')"
          label-cols="4"
          label-size="sm"
          label-align="right"
        >
          <b-form-input
            v-model.trim="form.name"
            type="text"
            size="sm"
            :placeholder="$gettext('Enter Username')"
            required
          />
        </b-form-group>
        <!-- Password area -->
        <b-form-group
          :label="$gettext('Password')"
          label-cols="4"
          label-align="right"
          label-size="sm"
        >
          <password
            v-model="form.pwd"
            :password-hint="false"
            :placeholder="$gettext('Password')"
            size="sm"
          />
          <b-button
            variant="link"
            class="p-0 float-right"
            @click="showForm.resetPwd = true"
          >
            <small><translate>Forgot Password?</translate></small>
          </b-button>
        </b-form-group>

        <!--Captcha question -->
        <!-- only shown if captcha is enabled in gkapp config -->
        <div v-if="gkConfig.login_captcha">
          <b-form-group
            :label="$gettext('Question')"
            label-align="right"
            label-cols="4"
            label-size="sm"
          >
            <captcha v-model="captcha.answer" />
          </b-form-group>

          <!-- captcha answer -->
          <b-form-group
            :label="$gettext('Answer')"
            label-cols="4"
            label-size="sm"
            label-align="right"
          >
            <b-form-input
              v-model="captcha.userAnswer"
              type="number"
              no-wheel
              :placeholder="$gettext('Enter the Answer')"
              required
              size="sm"
            />
          </b-form-group>
        </div>
        <b-button-group
          size="sm"
          class="row float-right"
        >
          <b-button
            variant="dark"
            class="m-1"
            @click="switchServer"
            :disabled="isOrgLoading"
          >
            <b-icon
              class="mr-1"
              icon="cloud"
            />
            <translate> Change Server</translate>
          </b-button>
          <b-button
            @click="showForm.createUser = true"
            variant="dark"
            class="m-1"
            :disabled="isOrgLoading"
          >
            <b-icon
              class="mr-1"
              icon="person-plus"
            />
            <translate> Create User</translate>
          </b-button>
          <b-button
            :disabled="isOrgLoading"
            class="m-1"
            variant="success"
            type="submit"
          >
            <b-spinner
              class="mr-1"
              v-if="isOrgLoading"
              small
            />
            <b-icon
              class="mr-1"
              v-else
              icon="box-arrow-in-right"
            />
            <translate> Login</translate>
          </b-button>
        </b-button-group>
      </b-form>
    </b-card>
    <!-- Org selection -->
    <b-card
      v-else
      class="mt-3"
    >
      <b-overlay
        :show="isLoading"
        variant="secondary"
        no-wrap
        blur
      />
      <div class="d-flex justify-content-between">
        <span class="">Welcome {{ form.name || userName || '' }}!</span>
        <b-dropdown
          :text="$gettext('Actions')"
          dropleft
          size="sm"
          variant="dark"
        >
          <b-dropdown-item
            @click="onLogout"
          >
            <translate>Log Out</translate>
          </b-dropdown-item>
          <b-dropdown-item
            v-b-modal.change-pwd
          >
            <translate>Change Password</translate>
          </b-dropdown-item>
          <b-dropdown-item
            @click="deleteUser"
            variant="danger"
          >
            <translate>Delete Account</translate>
          </b-dropdown-item>
        </b-dropdown>
      </div>
      <div class="clearfix" />
      <hr>
      <b-row>
        <b-col>
          <div class="mb-2">
            <h5 class="d-inline-block">
              Organisations <span> ({{ orgs.length }}) </span>
            </h5>
            <b-button
              size="sm"
              variant="success"
              :disabled="showForm.createOrg"
              @click="showForm.createOrg = true"
              class="float-right"
            >
              Create Org
            </b-button>
          </div>
          <b-table
            head-variant="dark"
            small
            bordered
            striped
            :items="orgs"
            :fields="orgFields"
            responsive
            :sticky-header="true"
            v-if="isOrgLoading || orgs.length"
            :busy="isOrgLoading"
            id="org-table"
          >
            <template #table-busy>
              <div class="text-center">
                <b-spinner
                  class="align-middle"
                  type="grow"
                />
                <strong> <translate>Fetching List...</translate> </strong>
              </div>
            </template>
            <template #cell(index)="data">
              {{ data.index + 1 }}
            </template>
            <template #cell(year)="data">
              <v-select
                :reduce="(option) => option.index"
                :options="data.item.yearData"
                v-model="data.item.selected"
              >
                <template #selected-option="{yend, ystart}">
                  <div class="text-truncate">
                    {{ ystart }}
                  </div>
                  <div>to</div>
                  <div class="text-truncate">
                    {{ yend }}
                  </div>
                </template>
              </v-select>
            </template>
            <template #cell(action)="data">
              <b-button
                size="sm"
                variant="dark"
                @click="orgLogin(data.item)"
              >
                Open
              </b-button>
            </template>
            <template #cell(role)="data">
              {{ userRoles[data.value] }}
            </template>
          </b-table>
          <b v-else>You are not part of any organisations yet</b>
        </b-col>
        <b-col>
          <h5 class="mb-3">
            Invitations <span> ({{ invitedOrgs.length }}) </span>
          </h5>
          <b-table
            head-variant="dark"
            small
            bordered
            striped
            :items="invitedOrgs"
            :fields="invOrgFields"
            responsive
            v-if="isOrgLoading || invitedOrgs.length"
            :busy="isOrgLoading"
          >
            <template #table-busy>
              <div class="text-center">
                <b-spinner
                  class="align-middle"
                  type="grow"
                />
                <strong> <translate>Fetching List...</translate> </strong>
              </div>
            </template>
            <template #cell(index)="data">
              {{ data.index + 1 }}
            </template>
            <template #cell(role)="data">
              {{ userRoles[data.value] }}
            </template>
            <template #cell(action)="data">
              <div class="d-flex">
                <b-button
                  @click="onAcceptInvite(data.index, data.item.name)"
                  size="sm"
                  class="p-1 mx-1"
                  variant="success"
                >
                  <b-icon
                    scale="0.9"
                    icon="check-circle"
                  />
                </b-button>
                <b-button
                  @click="onRejectInvite(data.index, data.item.name)"
                  size="sm"
                  class="p-1"
                  variant="danger"
                >
                  <b-icon
                    scale="0.9"
                    icon="trash"
                  />
                </b-button>
              </div>
            </template>
          </b-table>
          <b-alert
            class="text-center"
            variant="success"
            show
            v-else
          >
            No invitations pending!
          </b-alert>
        </b-col>
      </b-row>
    </b-card>
    <!-- create org modal -->
    <b-modal
      size="lg"
      v-model="showForm.createOrg"
      centered
      static
      body-class="p-0"
      id="contact-item-modal"
      hide-footer
      hide-header
    >
      <create-organisation
        :in-overlay="true"
        :on-save="onOrgCreate"
      />
    </b-modal>
    <!-- forgot password modal -->
    <b-modal
      size="lg"
      v-model="showForm.resetPwd"
      centered
      static
      body-class="p-0"
      id="contact-item-modal"
      hide-footer
      hide-header
    >
      <reset-password :on-success="onPwdReset" />
    </b-modal>
    <!-- create user modal -->
    <b-modal
      size="lg"
      v-model="showForm.createUser"
      centered
      static
      body-class="p-0"
      id="contact-item-modal"
      hide-footer
      hide-header
    >
      <create-user :on-success="onUserCreate" />
    </b-modal>
    <!-- Change password dialog -->
    <b-modal
      ref="change-pwd-close"
      id="change-pwd"
      size="md"
      :title="'Change Password for ' + userName"
      header-bg-variant="dark"
      header-text-variant="light"
      hide-footer
    >
      <change-pwd @close-pwd="closeModal" />
    </b-modal>
  </section>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
import Captcha from '@/components/Captcha.vue';
import Password from '@/components/Password.vue';
import CreateOrganisation from '@/components/form/CreateOrganisation.vue';
import ResetPassword from '@/components/form/ResetPassword.vue';
import CreateUser from '@/components/form/CreateUser.vue';
import ChangePwd from '@/components/form/ChangePwd.vue';
import { STATUS_CODES } from '@/js/enum';
export default {
  components: {
    Password,
    Captcha,
    CreateOrganisation,
    ResetPassword,
    CreateUser,
    ChangePwd,
  },
  name: 'SelectUserOrg',
  data() {
    return {
      isLoading: false,
      isOrgLoading: false,
      showForm: {
        createOrg: false,
        resetPwd: false,
        createUser: false,
      },
      form: {
        name: '',
        pwd: '',
      },
      captcha: {
        answer: null,
        userAnswer: null,
      },
      orgs: [],
      invitedOrgs: [],
      orgFields: [
        { label: 'No.', key: 'index', stickyColumn: true },
        { label: 'Name', key: 'name', stickyColumn: true },
        'role',
        'action',
      ],
      invOrgFields: [
        { label: 'No.', key: 'index', stickyColumn: true },
        { label: 'Name', key: 'name', stickyColumn: true },
        'role',
        'action',
      ],
      selectedOrg: null,
      userRoles: {
        '-1': 'Admin',
        0: 'Manager',
        1: 'Operator',
        2: 'Internal Auditor',
        3: 'Godown In Charge',
      },
    };
  },
  computed: {
    ...mapState([
      'gkCoreUrl',
      'userAuthToken',
      'userAuthenticated',
      'userName',
    ]),
  },
  methods: {
    /*
     * Close Change password window on successful password change
     */
    closeModal() {
      setTimeout(() => {
        this.$refs['change-pwd-close'].hide();
      }, 1500);
    },
    deleteUser() {
      // confirm before sending the delete api request
      this.$bvModal
        .msgBoxConfirm(`confirm deletion? This action cannot be reversed.`, {
          centered: true,
          size: 'md',
          okVariant: 'danger',

          headerBgVariant: 'danger',
          headerTextVariant: 'light',
        })
        // send the api request if the user confirmed
        .then((r) => {
          if (r) {
            axios.delete('/gkuser').then((r) => {
              if (r.status === 200) {
                if (r.data.gkstatus == 0) {
                  this.$bvToast.toast(`Account Deletion Successful`, {
                    autoHideDelay: 3000,
                    variant: 'success',
                  });
                  this.onLogout();
                } else {
                  this.$bvToast.toast(
                    `Delete all the organisations which you created first, or leave the organisations which you are already part of, where you have admin role`,
                    {
                      title: 'Account Deletion Unsuccessful',
                      autoHideDelay: 5000,
                      variant: 'danger',
                      solid: true,
                    }
                  );
                }
              } else {
                this.$bvToast.toast(
                  `Request failed with status code ${r.status}`,
                  {
                    autoHideDelay: 3000,
                    variant: 'danger',
                  }
                );
              }
            });
          }
        });
    },
    onPwdReset() {
      this.showForm.resetPwd = false;
    },
    onUserCreate({ token, username }) {
      this.showForm.createUser = false;
      this.$store.dispatch('setSessionStates', {
        userAuth: true,
        userAuthToken: token,
        user: { username },
      });
      this.fetchUserOrgs();
    },
    onOrgCreate(success) {
      if (success) {
        this.showForm.createOrg = false;
        this.fetchUserOrgs();
      }
    },
    onLogout() {
      this.$store.dispatch('setSessionStates', {
        userAuth: false,
        userAuthToken: null,
        authToken: null,
        finYears: [],
        orgName: null,
        orgYears: null,
      });
      this.orgs = [];
      this.invitedOrgs = [];
      localStorage.removeItem('userName');
    },
    initOrgs(orgsData) {
      this.orgs = [];
      this.invitedOrgs = [];
      for (let orgName in orgsData) {
        // orgsData[orgName];
        orgsData[orgName].reverse(); // reverse the order of financial year data, so that the latest years come on top
        let orgData = {
          name: orgName,
          type: orgsData[orgName][0].orgtype,
          yearData: orgsData[orgName].map((org, index) => {
            return {
              index,
              code: org.orgcode,
              label: `${org.yearstart} - ${org.yearend}`,
              ystart: org.yearstart,
              yend: org.yearend,
            };
          }),
          role: orgsData[orgName][0].userrole,
          selected: 0,
        };
        if (orgsData[orgName][0].invitestatus) {
          this.orgs.push(orgData);
        } else {
          this.invitedOrgs.push(orgData);
        }
      }
    },
    onRejectInvite(index, name) {
      this.$bvModal
        .msgBoxConfirm(`Reject invitation to organisation: ${name} ?`, {
          centered: true,
          size: 'md',
          okVariant: 'danger',

          headerBgVariant: 'danger',
          headerTextVariant: 'light',
        })
        // delete user is confirmed
        .then((r) => {
          if (r) {
            this.rejectInvite(index);
            return;
          }
        });
    },
    rejectInvite(index) {
      let org = this.invitedOrgs[index];
      let payload = { orgcode: parseInt(org.yearData[org.selected].code) };
      axios.post('/invite/reject', payload).then((resp) => {
        switch (resp.data.gkstatus) {
        case STATUS_CODES['Success']:
          this.$bvToast.toast(
            `Invitation to ${org.name} organisation has been rejected successfully`,
            {
              autoHideDelay: 3000,
              variant: 'success',
            }
          );
          this.fetchUserOrgs();
          break;
        case STATUS_CODES['ActionDisallowed']:
          this.$bvToast.toast(
            `Please check the invitation status with the organisation`,
            {
              autoHideDelay: 3000,
              variant: 'warning',
            }
          );
          break;
        case STATUS_CODES['UnauthorisedAccess']:
          this.$bvToast.toast(`Please check your login status`, {
            autoHideDelay: 3000,
            variant: 'warning',
          });
          break;
        case STATUS_CODES['ConnectionFailed']:
        default:
          this.$bvToast.toast(
            `An issue has ocurred while trying to reject the invitation to ${org.name}. Please contact admin`,
            {
              autoHideDelay: 3000,
              variant: 'danger',
            }
          );
        }
      });
    },
    onAcceptInvite(index, name) {
      this.$bvModal
        .msgBoxConfirm(`Accept invitation to organisation: ${name} ?`, {
          centered: true,
          size: 'md',
          okVariant: 'success',

          headerBgVariant: 'success',
          headerTextVariant: 'light',
        })
        // delete user is confirmed
        .then((r) => {
          if (r) {
            this.acceptInvite(index);
            return;
          }
        });
    },
    acceptInvite(index) {
      let org = this.invitedOrgs[index];
      let payload = { orgcode: parseInt(org.yearData[org.selected].code) };
      axios.post('/invite/accept', payload).then((resp) => {
        switch (resp.data.gkstatus) {
        case STATUS_CODES['Success']:
          this.$bvToast.toast(
            `Invitation to ${org.name} organisation has been accepted successfully`,
            {
              autoHideDelay: 3000,
              variant: 'success',
            }
          );
          this.fetchUserOrgs();
          break;
        case STATUS_CODES['ActionDisallowed']:
          this.$bvToast.toast(
            `Please check the invitation status with the organisation`,
            {
              autoHideDelay: 3000,
              variant: 'warning',
            }
          );
          break;
        case STATUS_CODES['UnauthorisedAccess']:
          this.$bvToast.toast(`Please check your login status`, {
            autoHideDelay: 3000,
            variant: 'warning',
          });
          break;
        case STATUS_CODES['ConnectionFailed']:
        default:
          this.$bvToast.toast(
            `An issue has ocurred while trying to accept the invitation to ${org.name}. Please contact admin`,
            {
              autoHideDelay: 3000,
              variant: 'danger',
            }
          );
        }
      });
    },
    // to save to local storage on login
    // orgChoice -> orgname (orgtype)
    // orgArray -> [orgname, orgtype]
    // orgCodeChoice -> orgcode
    // save org year start and year end

    // perform checks before logging a user
    // if captcha is disabled, login the user directly
    // or verify the captcha & login the user or throw the error
    preUserLogin() {
      if (!this.gkConfig.login_captcha) {
        this.userLogin();
      } else {
        if (this.captcha.answer == this.captcha.userAnswer) {
          this.userLogin();
        } else {
          // Alert the user on captcha failure
          this.$bvToast.toast(this.$gettext(`Incorrect Answer`), {
            title: this.$gettext('Captcha failed'),
            autoHideDelay: 3000,
            appendToast: true,
            variant: 'danger',
            solid: true,
          });
        }
      }
    },
    userLogin() {
      let payload = {
        username: this.form.name,
        userpassword: this.form.pwd,
      };
      this.isOrgLoading = true;
      axios
        .post(`${this.gkCoreUrl}/login/user`, payload)
        .then((resp) => {
          switch (resp.data.gkstatus) {
          case 0:
            this.$bvToast.toast(`Welcome ${this.form.name}`, {
              title: 'Login Success!',
              autoHideDelay: 3000,
              variant: 'success',
            });
            // set the user auth status
            this.$store.dispatch('setSessionStates', {
              userAuth: true,
              userAuthToken: resp.data.token,
              user: { username: payload.username },
            });
            this.initOrgs(resp.data.gkresult);
            break;
          case 2:
            this.$bvToast.toast(`Invalid login details`, {
              title: 'Login Error!',
              autoHideDelay: 3000,
              variant: 'danger',
            });
            break;
          case 5:
            // Username was not unique but exists in the old users table, so try loggin in the old way
            this.$router.push('/select-org');
            break;
          default:
            this.$bvToast.toast(`Internal Server Error`, {
              title: 'Login Error!',
              autoHideDelay: 3000,
              variant: 'danger',
            });
          }
        })
        .finally(() => {
          this.isOrgLoading = false;
        });
    },
    orgLogin(orgData) {
      const userAuthToken = this.userAuthToken;
      let selectedYear = orgData.yearData[orgData.selected];
      let payload = {
        orgcode: selectedYear.code,
      };
      this.isLoading = true;
      // TODO: here instead of sending the username and password, send the new user auth token
      axios
        .post(`${this.gkCoreUrl}/login/org`, payload, {
          headers: {
            gktoken: userAuthToken,
            gkusertoken: userAuthToken,
          },
        })
        .then((resp) => {
          switch (resp.data.gkstatus) {
          case 0:
            {
              axios.defaults.baseURL = this.gkCoreUrl;
              axios.defaults.headers = { gktoken: resp.data.token };

              // Initiate Custom states to localhost
              let orgName = orgData.name;
              let orgType = orgData.type;
              // useful in consolidated final accounts
              sessionStorage.setItem(
                'orgArray',
                JSON.stringify([orgName, orgType])
              );
              sessionStorage.setItem('orgCodeChoice', selectedYear.code);

              // Initiate vuex store
              this.$store.dispatch('setSessionStates', {
                auth: true,
                orgCode: selectedYear.code,
                orgName: `${orgName} (${orgType})`,
                authToken: resp.data.token,
                user: { username: this.form.name },
                orgYears: {
                  yearStart: selectedYear.ystart
                    .split('-')
                    .reverse()
                    .join('-'),
                  yearEnd: selectedYear.yend
                    .split('-')
                    .reverse()
                    .join('-'),
                },
                finYears: orgData.yearData,
              });
              Promise.all([
                this.$store.dispatch('initLocalStates'), // initialises vuex, org image and org address
                this.$store.dispatch('global/initGlobalConfig'), // initialises global config
                this.$store.dispatch('initGstin'), // initialises org GSTIN
              ])
                .then(() => {
                  this.$store
                    .dispatch('global/initGlobalState', {
                      lang: this.$language,
                    })
                    .then(() => {
                      this.$store.commit('setUserRole', orgData.role);
                      this.$store.commit('setOrgType', orgType);
                      // visit the dashboard page
                      this.$router
                        .push('/dashboard')
                        .then(() => {
                          this.isLoading = false;
                        })
                        .catch((e) => {
                          console.error(e);
                          this.isLoading = false;
                        });
                    });
                })
                .catch((e) => {
                  console.error(e);
                });
            }
            break;
          case 2:
            this.$bvToast.toast(`Invalid login details`, {
              title: 'Login Error!',
              autoHideDelay: 3000,
              variant: 'danger',
            });
            break;
          case 5:
            this.$router.push('/select-org');
            break;
          default:
            this.$bvToast.toast(`Internal Server Error`, {
              title: 'Login Error!',
              autoHideDelay: 3000,
              variant: 'danger',
            });
          }
          if (resp.data.gkstatus) {
            this.isLoading = false;
          }
        })
        .catch(() => {
          this.isLoading = false;
        });
    },
    fetchUserOrgs() {
      const userAuthStatus = this.userAuthenticated;
      const userAuthToken = this.userAuthToken;
      if (userAuthStatus) {
        this.isOrgLoading = true;
        axios
          .get(`${this.gkCoreUrl}/gkuser/orgs`, {
            headers: {
              gktoken: userAuthToken,
              gkusertoken: userAuthToken,
            },
          })
          .then((resp) => {
            if (resp.data.gkstatus === 0) {
              this.initOrgs(resp.data.gkresult);
            }
          })
          .finally(() => {
            this.isOrgLoading = false;
          });
      }
    },
  },
  mounted() {
    if (this.gkCoreUrl == null) {
      this.$router.push('/server-setup');
    } else {
      this.fetchUserOrgs();
    }
  },
};
</script>

<style>
#org-table .vs__selected {
  display: flex;
  flex-direction: column;
}
</style>
