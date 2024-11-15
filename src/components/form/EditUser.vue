<template>
  <section class="m-1">
    <b-card
      header="Edit User"
      header-bg-variant="dark"
      header-text-variant="light"
      class="gkcard mx-auto"
    >
      <!-- Manage Users -->
      <b-form @submit.prevent="confirm('update')">
        <b-overlay
          :show="isLoading"
          blur
          no-wrap
        />
        <!-- username -->
        <b-form-group
          label-size="sm"
          label-align="right"
          label-cols="3"
          :label="$gettext('Name')"
        >
          <b-form-input
            :state="validateName"
            required
            size="sm"
            v-model="form.username"
            trim
          />
          <b-form-invalid-feedback id="userid-feedback">
            <translate>Username must be minimum 3 characters</translate>
          </b-form-invalid-feedback>
        </b-form-group>
        <!-- user role -->
        <!-- If there is only one admin, Prevent admin from changing self's role -->
        <b-form-group
          label-size="sm"
          label-align="right"
          label-cols="3"
          :label="$gettext('Role')"
        >
          <b-form-select
            size="sm"
            v-model="form.userrole"
            :disabled="form.userrole == -1 && admins.length == 1"
          >
            <template #first>
              <b-form-select-option
                value="null"
                disabled
              >
                <translate> -- Select User --</translate>
              </b-form-select-option>
            </template>
            <b-form-select-option
              v-for="role in roles"
              :key="role.value"
              :value="role.value"
            >
              {{ role.text }}
            </b-form-select-option>
          </b-form-select>
        </b-form-group>
        <!-- user godowns -->
        <b-table-simple
          v-if="form.userrole === 3"
          hover
          small
          caption-top
          responsive
        >
          <caption v-translate>
            Select Godowns
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
              v-for="godown in userGodowns"
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
            </b-tr>
          </b-tbody>
        </b-table-simple>
        <!-- password -->
        <b-form-group
          label-align="right"
          label-size="sm"
          label-cols="3"
          :label="$gettext('New Password')"
        >
          <password
            size="sm"
            v-model="form.userpassword"
          />
        </b-form-group>
        <!-- Security question -->
        <b-form-group
          label-align="right"
          label-size="sm"
          label-cols="3"
          :label="$gettext('Question')"
        >
          <security-questions
            size="sm"
            v-model="form.userquestion"
          />
        </b-form-group>
        <!-- answer -->
        <b-form-group
          label-align="right"
          label-size="sm"
          label-cols="3"
          :label="$gettext('Answer')"
        >
          <b-form-input
            v-model="form.useranswer"
            size="sm"
            type="text"
            :required="form.userquestion !== ''"
          />
        </b-form-group>
        <b-button-group
          size="sm"
          class="float-right"
        >
          <b-button
            type="submit"
            class="mr-1"
            variant="warning"
          >
            <b-icon
              class="mr-1"
              icon="cloud-arrow-up"
            />
            <translate>Update user</translate>
          </b-button>
          <b-button
            variant="danger"
            :disabled="form.userrole == -1 && admins.length == 1"
            @click="confirm('delete')"
          >
            <b-icon
              class="mr-1"
              icon="x-circle"
            />
            <translate>Delete User</translate>
          </b-button>
        </b-button-group>
      </b-form>
    </b-card>
  </section>
</template>

<script>
// TODO: Must update this view to be compatible with the new user flow
// Possibly make it a component that can be accessed in the org login page that comes after user is logged in
import axios from 'axios';
import { mapState } from 'vuex';
import SecurityQuestions from '../SecurityQuestions.vue';
import Password from '../Password.vue';

export default {
  components: { SecurityQuestions, Password },
  name: 'EditUser',
  data() {
    return {
      id: Number,
      userList: [],
      user: '',
      userGodowns: '',
      isLoading: false,
      isTableLoading: true,
      admins: [],
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
      form: {
        username: '',
        userid: Number,
        userrole: '',
        userquestion: '',
        useranswer: '',
      },
    };
  },
  computed: {
    ...mapState(['authToken', 'gkCoreUrl']),
    validateName() {
      // username should be atleast three characters
      if (this.form.username.length < 3) {
        return false;
      } else {
        return true;
      }
    },
  },
  methods: {
    confirm(type) {
      if (type == 'delete') {
        this.$bvModal
          .msgBoxConfirm(`Delete user ${this.form.username} ?`, {
            centered: true,
            size: 'md',
            okVariant: 'danger',
            okTitle: 'Delete',
            headerBgVariant: 'danger',
            headerTextVariant: 'light',
          })
          .then((r) => {
            if (r) {
              this.delUser();
            }
          });
      } else {
        this.$bvModal
          .msgBoxConfirm(`Update user ${this.form.username} ?`, {
            centered: true,
            size: 'md',
            okVariant: 'warning',
            okTitle: 'Update',
          })
          .then((r) => {
            if (r) {
              this.updateUser();
            }
          });
      }
    },
    getUserInfo() {
      this.isLoading = true;
      axios
        .get(`/user?userAllData&userid=${this.id}`)
        .then((r) => {
          if (r.status == 200) {
            let data = r.data.gkresult;
            this.form.username = data.username;
            this.form.userrole = data.userrole;
            this.form.userid = data.userid;
            this.form.userquestion = data.userquestion;
            this.form.useranswer = data.useranswer;

            this.isLoading = false;
            this.getUserGodowns(this.id);
          }
        })
        .catch((e) => {
          console.error(e.message);
        });

      this.getAdmins();
    },
    /*
    / This method gets the array of admin objects of the org and assigns them to admins key. We can use this
    / info to prevent deletion of all admins accidentally in an org which results in a zombie org which cannot
    / be accessed in any other way. Since, gkcore does not have any validation as such, atleast at the time of
    / writing this method
    */
    getAdmins() {
      axios
        .get('/user?sameRoleUsers&userrole=-1')
        .then((r) => {
          if (r.status === 200 && r.data.gkstatus === 0) {
            this.admins = r.data.gkresult;
          }
        })
        .catch((e) => {
          console.error(e.message);
        });
    },
    /**
     * get all godowns & filter the one's which user is incharge
     */
    getUserGodowns(id) {
      this.isLoading = true;
      const ug = axios.get(`/godown?type=byuser&userid=${id}`);
      const ag = axios.get('/godown');
      Promise.all([ug, ag])
        .then((val) => {
          let userGodowns = val[0].data.gkresult;
          let allGodowns = val[1].data.gkresult;
          let i, u;
          for (i in allGodowns) {
            for (u in userGodowns) {
              if (userGodowns[u].goid === allGodowns[i].goid) {
                allGodowns[i].checked = 'accepted';
              }
            }
          }
          this.userGodowns = allGodowns;
          this.isLoading = false;
        })
        .catch((e) => {
          this.$bvToast.toast(
            'Failed to fetch godown info, Please refresh the page',
            {
              title: e.message,
              variant: 'danger',
              solid: true,
            }
          );
          this.isLoading = false;
        });
    },
    updateUser() {
      // If selected role is godown incharge, add selected godown id's to the submitted form
      if (this.form.userrole == 3) {
        let list = [];
        for (let i in this.userGodowns) {
          if (this.userGodowns[i].checked === 'accepted') {
            list.push(this.userGodowns[i].goid);
          }
        }
        this.form.golist = list;
      }
      this.isLoading = true;
      axios.put('/users?editdata', this.form).then((r) => {
        if (r.status == 200)
          switch (r.data.gkstatus) {
          case 0:
            {
              this.$bvToast.toast(
                `user ${this.form.username} updated successfully`,
                {
                  title: 'Success',
                  variant: 'success',
                  solid: true,
                }
              );
              // Add delete user log to server
              const payload = {
                activity: `user ${this.form.username} details updated`,
              };
              axios.post(`${this.gkCoreUrl}/log`, payload, {
                headers: { gktoken: this.authToken },
              });
              this.isLoading = false;
              this.$emit('refreshUsers');
            }
            break;
          case 1:
            this.$bvToast.toast(
              `Username ${this.form.username} already exists`,
              {
                title: 'Duplicate Entry',
                variant: 'danger',
                solid: true,
              }
            );
            this.isLoading = false;
            break;
          case 2:
            this.$bvToast.toast('Unauthorised access', {
              variant: 'danger',
              solid: true,
            });
            this.isLoading = false;
            break;
          case 3:
            this.$bvToast.toast('Connection Failed', {
              variant: 'danger',
              solid: true,
            });
            this.isLoading = false;
            break;
          case 4:
            this.$bvToast.toast('Bad Privilege', {
              variant: 'danger',
              solid: true,
            });
            this.isLoading = false;
            break;
          case 5:
            this.$bvToast.toast('Action Disallowed', {
              variant: 'danger',
              solid: true,
            });
            this.isLoading = false;
            break;
          }
      });
    },
    delUser() {
      this.isLoading = true;
      axios
        .delete('/users', {
          headers: {
            gktoken: this.authToken,
          },
          data: {
            userid: this.form.userid,
          },
        })
        .then((r) => {
          if (r.status == 200 && r.data.gkstatus == 0) {
            this.$bvToast.toast(`${this.form.username} removed successfully`, {
              title: 'Delete Success',
              variant: 'success',
              solid: true,
            });

            // Add delete user log to server
            const payload = {
              activity: `user ${this.form.username} deleted`,
            };
            axios.post(`${this.gkCoreUrl}/log`, payload, {
              headers: { gktoken: this.authToken },
            });
            this.isLoading = false;
            setTimeout(() => {
              this.$router.push('/users');
            }, 3000);
          }
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            title: e.message,
            variant: 'danger',
            solid: true,
          });
          this.isLoading = false;
        });
    },
  },
  mounted() {
    this.id = this.$route.params.id;
    this.getUserInfo();
  },
};
</script>
