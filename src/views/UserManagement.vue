<template>
  <section class="mt-2 mr-3 ml-3">
    <b-input-group class="mb-3 container-sm gksearch d-print-none">
      <template #prepend>
        <b-button
          translate
          @click="$router.push('/users/invite')"
          variant="outline-primary"
          v-b-modal.create-user
        >
          <b-icon
            class="mr-1"
            icon="person-plus"
          />
          <translate>Invite User</translate>
        </b-button>
      </template>
      <b-form-input
        type="text"
        :placeholder="$gettext('Search Users')"
        v-model="searchText"
      />
    </b-input-group>
    <!-- Toolbar -->
    <gk-toolbar>
      <gk-file-download
        file-suffix="UserList"
        :url="
          `/spreadsheet?user-list&fystart=${dateReverse(
            this.yearStart,
          )}&fyend=${dateReverse(this.yearEnd)}&orgname=${this.orgName}`
        "
        :message-from-parent="parentMessage"
      />
    </gk-toolbar>
    <b-row>
      <b-col>
        <h5 class="mb-3">
          Users
        </h5>
        <b-table
          head-variant="dark"
          class="table-border-dark"
          hover
          outlined
          striped
          small
          :filter="searchText"
          :fields="userFields"
          :items="userList"
        >
          <template #cell(action)="data">
            <b-button
              @click="confirmRemoveUser(data.item)"
              variant="danger"
              size="sm"
            >
              <B-Icon
                role="button"
                icon="person-x"
                v-b-tooltip.focus
                title="remove user"
              />
            </b-button>
          </template>
        </b-table>
      </b-col>
      <b-col>
        <h5 class="mb-3">
          Invitations
        </h5>
        <b-table-lite
          head-variant="dark"
          class="table-border-dark"
          hover
          outlined
          striped
          small
          :fields="invitedUserFields"
          :items="invitedUsers"
          v-if="invitedUsers.length"
        >
          <template #cell(action)="data">
            <b-icon
              v-if="data.item.status === true"
              icon="pencil-square"
              class="mr-1"
              role="button"
            />
            <b-icon
              v-if="data.item.roleid !== -1"
              icon="trash"
              variant="danger"
              class="ml-1"
              role="button"
              @click="onCancelInvite(data.item)"
            />
          </template>
        </b-table-lite>
        <b v-else>No pending invitations</b>
      </b-col>
    </b-row>
  </section>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
import GkToolbar from '../components/GkToolbar.vue';
import GkFileDownload from '../components/GkFileDownload.vue';
import { STATUS_CODES } from '@/js/enum';

export default {
  components: { GkToolbar, GkFileDownload },
  name: 'UserManagement',
  data() {
    return {
      parentMessage: '',
      fields: [
        {
          key: this.$gettext('user'),
          sortable: true,
        },
        {
          key: this.$gettext('role'),
          sortable: true,
        },
        {
          key: this.$gettext('action'),
        },
      ],
      userList: [],
      invitedUsers: [],
      userFields: [{ key: 'name', label: 'User' }, 'role', 'action'],
      invitedUserFields: [
        { key: 'name', label: 'User' },
        'role',
        'status',
        'action',
      ],
      searchText: '',
      isLoading: false,
      selectedUserId: '',
    };
  },
  computed: {
    ...mapState(['authToken', 'gkCoreUrl', 'orgName', 'yearStart', 'yearEnd']),
  },
  methods: {
    // remove a user from organisation
    removeUser(userID, userName) {
      this.isLoading = true;
      let payload = {
        headers: {
          gktoken: this.authToken,
          gkauthtoken: this.userAuthToken,
        },
        data: {
          userid: userID,
        },
      };
      axios
        .delete('/organisation/remove-user', payload)
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
            case STATUS_CODES['Success']:
              this.gk_log(`user removed: ${userName}`);
              this.$bvToast.toast(this.$gettext('User is removed'), {
                title: 'Success',
                variant: 'success',
              });
              // refresh user list
              this.getUsers();
              break;
            case STATUS_CODES['BadPrivilege']:
              this.$bvToast.toast(
                this.$gettext('No privileges to delete the user'),
                {
                  title: 'Error',
                  variant: 'danger',
                }
              );
              break;
            case STATUS_CODES['ActionDisallowed']:
              this.$bvToast.toast(
                this.$gettext('User deletion is not allowed'),
                {
                  title: 'Error',
                  variant: 'danger',
                }
              );
              break;
            case STATUS_CODES['ConnectionFailed']:
              this.$bvToast.toast(this.$gettext('User deletion failed'), {
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
    onCancelInvite(userData) {
      this.$bvModal
        .msgBoxConfirm(`Cancel invite for user: ${userData.name} ?`, {
          centered: true,
          size: 'md',
          okVariant: 'danger',

          headerBgVariant: 'danger',
          headerTextVariant: 'light',
        })
        // delete user is confirmed
        .then((r) => {
          if (r) {
            this.cancelInvite(userData.name, userData.userid);
            return;
          }
        });
    },
    confirmRemoveUser(obj) {
      this.$bvModal
        .msgBoxConfirm(`Delete user: ${obj.name} ?`, {
          centered: true,
          size: 'sm',
          okVariant: 'danger',
          okTitle: 'Remove',
        })
        // remove user is confirmed
        .then((r) => {
          if (r) {
            this.removeUser(obj.userid, obj.name);
            return;
          }
        });
    },
    // get users who are part of the org
    getUsers() {
      this.isLoading = true;
      axios
        .get('/organisation/gkusers')
        .then((resp) => {
          if (resp.status == 200 && resp.data.gkstatus == 0) {
            // let usr = resp.data.gkresult.map((data) => {
            //   return {
            //     user: data.username,
            //     role: data.userrolename,
            //     roleid: data.userrole,
            //     userid: data.userid,
            //   };
            // });
            this.userList = [];
            this.invitedUsers = [];
            resp.data.gkresult.forEach((item) => {
              if (item.invitestatus === true) {
                this.userList.push({
                  name: item.username,
                  role: item.userrolename,
                  userid: item.userid,
                });
              } else {
                this.invitedUsers.push({
                  name: item.username,
                  role: item.userrolename,
                  userid: item.userid,
                  status: item.invitestatus,
                });
              }
            });
            // this.userList = usr;
          }
        })
        .catch((e) => {
          console.log(e);
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    cancelInvite(name, id) {
      const config = {
        headers: {
          gktoken: this.authToken,
        },
        data: {
          userid: id,
        },
      };
      axios.delete('/invite', config).then((resp) => {
        switch (resp.data.gkstatus) {
        case STATUS_CODES['Success']:
          this.$bvToast.toast(`Invite for ${name} cancelled successfully`, {
            variant: 'success',
          });
          this.getUsers();
          break;
        case STATUS_CODES['UnauthorisedAccess']:
          this.$bvToast.toast(`Please check login status`, {
            variant: 'warning',
          });
          break;
        case STATUS_CODES['ActionDisallowed']:
          this.$bvToast.toast(
            `User does not have the ability to cancel invites. Please contact admin.`,
            {
              variant: 'warning',
            }
          );
          break;
        case STATUS_CODES['ConnectionFailed']:
        default:
          this.$bvToast.toast(
            `Could not cancel invite, please contact admin`,
            {
              variant: 'danger',
            }
          );
        }
      });
    },
  },
  mounted() {
    this.getUsers();
  },
};
</script>

<style scoped>
table {
  width: 70%;
}
@media all and (max-width: 600px) {
  table {
    width: 100%;
  }
}
</style>
