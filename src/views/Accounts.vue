<template>
  <section class="m-2">
    <h3
      class="text-center"
      v-translate
    >
      Accounts
    </h3>
    <gk-toolbar>
      <b-button
        class="float-right p-1"
        :class="{'mb-2': showSearchBar}"
        variant="link"
        @click="showSearchBar = !showSearchBar"
      >
        <b-icon icon="funnel" />
      </b-button>
      <gk-file-download
        file-suffix="AccountList"
        :font-scale="1"
        :url="
          `/accounts/spreadsheet?fystart=${this.dateReverse(
            this.yearStart,
          )}&fyend=${this.dateReverse(this.yearEnd)}&orgname=${
            this.orgName
          }&orgtype=${this.orgType}`
        "
        title="Download Account List"
        :common-params="false"
        :message-from-parent="parentMessage"
      />
    </gk-toolbar>
    <div class="clearfix" />
    <b-collapse
      v-model="showSearchBar"
      id="search-bar"
    >
      <b-card body-class="py-2">
        <div :class="{'mb-3': showSearchBar}">
          <h6
            class="d-inline-block"
            v-translate
          >
            Filter By
          </h6>
        </div>
        <b-row>
          <b-col
            class="px-1"
            cols="12"
            md="4"
          >
            <b-form-group
              label-for="search-by-group"
              label="Group"
              label-class="label-on-input"
            >
              <template #label>
                <translate> Group </translate>
              </template>
              <v-select
                id="search-by-group"
                v-model="searchBy.group"
                :options="options.groups"
                label="text"
                :reduce="(gdata) => gdata.value"
                @input="openSearchedCard(!!searchBy.group, null, null)"
              />
            </b-form-group>
          </b-col>
          <b-col
            class="px-1"
            cols="12"
            md="4"
          >
            <b-form-group
              label-for="search-by-sub-group"
              label="Sub Group"
              label-class="label-on-input"
            >
              <template #label>
                <translate> Sub Group </translate>
              </template>
              <v-select
                id="search-by-sub-group"
                v-model="searchBy.subGroup"
                :options="subGroups"
                @input="openSearchedCard(null, !!searchBy.subGroup, null)"
                label="text"
                :reduce="(sgdata) => sgdata.value"
                :reset-on-options-change="true"
              />
            </b-form-group>
          </b-col>
          <b-col
            class="px-1"
            cols="12"
            md="4"
          >
            <b-form-group
              label-for="search-by-account"
              label="Account"
              label-class="label-on-input"
            >
              <template #label>
                <translate> Account </translate>
              </template>
              <v-select
                id="search-by-account"
                v-model="searchBy.account"
                :options="accounts"
                @input="openSearchedCard(null, null, !!searchBy.account)"
                label="text"
                :reduce="(accdata) => accdata.value"
                :reset-on-options-change="true"
              />
            </b-form-group>
          </b-col>
        </b-row>
      </b-card>
    </b-collapse>

    <u><small
      class="ml-2"
      v-translate
    >Groups</small></u>
    <b-container fluid>
      <b-row>
        <b-col
          cols="12"
          :lg="gdata.open ? 12 : 4"
          v-for="(gdata, gname) in options.accData"
          :key="gdata.id"
          class="p-1"
          :class="{'d-none': !gdata.show}"
        >
          <b-card
            v-if="gdata.show"
            body-class="p-2 bg-dark-grey"
            class="shadow-sm"
          >
            <div
              class="acc-card-header"
              v-b-toggle="`g-${gdata.id}`"
            >
              <h4 class="d-inline-block">
                {{ gname }}
              </h4>
              <b-icon
                class="float-right"
                font-scale="0.7"
                :icon="gdata.open ? 'dash' : 'arrows-fullscreen'"
              />
            </div>
            <div v-if="!gdata.open">
              <small>Sub-Groups: {{ gdata.subCount }}</small> <br>
              <small>Accounts: {{ gdata.accCount }}</small>
            </div>
            <b-collapse
              :id="`g-${gdata.id}`"
              v-model="gdata.open"
            >
              <u>
                <small>Sub-Groups: {{ gdata.subCount }}</small>
              </u>
              <b-container
                class="mt-1"
                fluid
              >
                <b-row>
                  <b-col
                    cols="12"
                    :md="sgdata.open ? 12 : 6"
                    class="p-1"
                    v-for="(sgdata, sgname) in gdata.subGroups"
                    :key="sgdata.id"
                    :class="{'d-none': !sgdata.show}"
                  >
                    <b-card
                      v-if="sgdata.show"
                      body-class="p-2 bg-light-grey"
                      class="shadow-sm"
                    >
                      <div
                        class="acc-card-header"
                        v-b-toggle="`sg-${sgdata.id}`"
                      >
                        <h5 class="d-inline-block">
                          {{ sgname }}
                        </h5>
                        <b-icon
                          class="float-right"
                          font-scale="0.7"
                          :icon="sgdata.open ? 'dash' : 'arrows-fullscreen'"
                        />
                      </div>
                      <br>
                      <u>
                        <small>Accounts: {{ sgdata.accCount }}</small>
                      </u>
                      <b-button
                        class="ml-2 py-0 px-1"
                        variant="success"
                        size="sm"
                        @click.prevent="onCreateAccount(gdata.id, sgdata.id)"
                      >
                        +
                      </b-button>
                      <b-collapse
                        :id="`sg-${sgdata.id}`"
                        class="mt-2"
                        v-model="sgdata.open"
                      >
                        <b-container
                          fluid
                          style=""
                        >
                          <b-row>
                            <b-col
                              cols="12"
                              :md="sgdata.open ? 4 : 12"
                              class="px-1"
                              v-for="(accData, accId) in sgdata.accounts"
                              :key="accId"
                              :class="{'d-none': !accData.show}"
                            >
                              <b-card
                                :id="`acc-${accId}`"
                                class="my-1"
                                body-class="p-2"
                                v-if="accData.show"
                              >
                                <b-button
                                  class="p-0"
                                  variant="link"
                                  @click.prevent="
                                    onGoToLedger(gdata.id, sgdata.id, accId)
                                  "
                                >
                                  {{ accData.name }}
                                </b-button>
                                <div class="d-inline-block float-right">
                                  <b-button
                                    v-if="accData.sysFlag === 0"
                                    size="sm"
                                    variant="danger"
                                    class="pt-0"
                                    @click.prevent="
                                      confirmOnDelete(
                                        accData,
                                        gdata.id,
                                        sgdata.id,
                                        accId,
                                      )
                                    "
                                  >
                                    <b-icon
                                      font-scale="0.9"
                                      icon="trash-fill"
                                    />
                                  </b-button>
                                  <b-button
                                    size="sm"
                                    variant="dark"
                                    class="pt-0 mx-1"
                                    @click.prevent="
                                      onEditAccount(
                                        gdata.id,
                                        sgdata.id,
                                        accId,
                                        accData.sysFlag,
                                      )
                                    "
                                  >
                                    <b-icon
                                      class="font-bold"
                                      font-scale="0.8"
                                      icon="pencil-fill"
                                    />
                                  </b-button>
                                </div>
                                <br>
                                ₹ {{ accData.openingBal }}
                              </b-card>
                            </b-col>
                          </b-row>
                        </b-container>
                      </b-collapse>
                    </b-card>
                  </b-col>
                </b-row>
              </b-container>
            </b-collapse>
          </b-card>
        </b-col>
      </b-row>
    </b-container>
  </section>
</template>

<script>
import axios from 'axios';
import GkFileDownload from '../components/GkFileDownload.vue';
import GkToolbar from '../components/GkToolbar.vue';
import { mapState } from 'vuex';
export default {
  name: 'Accounts',
  components: { GkFileDownload, GkToolbar },
  props: {
    acc: {
      type: [Number, String],
      required: true,
    },
    group: {
      type: [Number, String],
      required: true,
    },
    subGroup: {
      type: [Number, String],
      required: true,
    },
  },
  data() {
    return {
      parentMessage: '',
      searchBy: {
        group: null,
        subGroup: null,
        account: null,
      },
      showSearchBar: false,
      showAccountForm: false,
      tableHeight: window.innerHeight - 175,
      searchText: '',
      accountMode: 'create',
      accountId: -1,
      isSysAccount: false,
      tableFields: [
        { key: 'index', label: 'No', thStyle: { width: '45px' } },
        { key: 'account', sortable: true },
        { key: 'group', sortable: true },
        { key: 'subGroup', sortable: true },
        { key: 'defaultFor', class: 'd-none d-sm-table-cell' },
        {
          key: 'options',
          label: 'Options',
          thClass: 'options-col',
        },
      ],
      options: {
        accounts: [],
        groups: [],
        subGroups: [],
        accData: {},
        groupIdToName: {},
      },
      loading: false,
    };
  },
  computed: {
    accounts: (self) => {
      let subGroup = self.searchBy.subGroup;
      let group = self.searchBy.group;
      let res = [];
      if (subGroup) {
        res = self.options.accounts.filter((sg) => sg.subGroup === subGroup);
      } else if (group) {
        res = self.options.accounts.filter((g) => g.group === group);
      } else {
        res = self.options.accounts;
      }
      return res;
    },
    subGroups: (self) => {
      let group = self.searchBy.group;
      let res = [];
      if (group) {
        res = self.options.subGroups.filter((sg) => sg.group === group);
      } else {
        res = self.options.subGroups;
      }
      return res;
    },
    ...mapState(['orgName', 'yearStart', 'yearEnd', 'orgType']),
  },
  methods: {
    onGoToLedger(gid, sgid, accId) {
      this.updateUrl(gid, sgid, accId);
      this.$router.push({
        path: `/ledger/${accId}`,
      });
    },
    onCreateAccount(gid, sgid) {
      this.updateUrl(gid, sgid, -1);
      this.$router.push({
        name: 'Create_Account',
        params: { group: gid, subGroup: sgid },
      });
    },
    onEditAccount(gid, sgid, accId, isSys) {
      this.updateUrl(gid, sgid, accId);
      this.$router.push({
        name: 'Edit_Account',
        params: { id: accId, sysFlag: isSys },
      });
    },
    deleteAccount(accountId, accountName, custId, custName, isCustomer) {
      if (!accountId) return;
      return axios
        .delete('/accounts', {
          data: {
            accountcode: accountId,
          },
        })
        .then((resp) => {
          if (resp.data.gkstatus === 0) {
            if (custId) {
              axios.delete(`/customer/${custId}`).then((resp2) => {
                let custType = isCustomer ? 'customer' : 'supplier';
                if (resp2.data.gkstatus !== 0) {
                  this.$bvToast.toast(
                    `Delete ${custType} ${custName} Failed!`,
                    {
                      variant: 'danger',
                      solid: true,
                    }
                  );
                  return;
                }
                let custLog = {
                  activity: `${custName} ${custType} deleted.`,
                };
                axios.post('/log', custLog);
                this.$bvToast.toast(`Delete ${custType} ${custName} Success!`, {
                  variant: 'success',
                  solid: true,
                });
              });
            }
            let log = { activity: `${accountName} account deleted.` };
            axios.post('/log', log);
            this.$bvToast.toast(`Delete account ${accountName} Success!`, {
              variant: 'success',
              solid: true,
            });
            return resp.data.gkstatus;
          } else {
            this.$bvToast.toast(`Delete Account: ${accountName} Failed!`, {
              variant: 'danger',
              solid: true,
            });
          }
        });
    },
    getCust(groupCode, account) {
      return axios.get('/groupsubgroups?groupflatlist').then((resp) => {
        if (resp.data.gkstatus !== 0) {
          return null;
        }
        let debtGroupCode = resp.data.gkresult['Sundry Debtors'],
            credGroupCode = resp.data.gkresult['Sundry Creditors for Purchase'];
        if (debtGroupCode === groupCode || credGroupCode === groupCode) {
          let custType = debtGroupCode === groupCode ? 'custall' : 'supall';
          return axios.get(`/customer?qty=${custType}`).then((resp2) => {
            if (resp2.data.gkstatus === 0) {
              let cust = resp2.data.gkresult.find(
                (cust) => cust.custname === account
              );
              if (cust) {
                cust.isCustomer = debtGroupCode === groupCode;
              }
              return cust;
            }
            return null;
          });
        } else {
          return null;
        }
      });
    },
    confirmOnDelete(accDetails, groupCode, subGroupCode, accountId) {
      this.getCust(subGroupCode, accDetails.name).then((cust) => {
        const self = this;
        let text = `Delete Account <b>${accDetails.name}</b> ?`;
        if (cust) {
          text += ` This will also delete the ${
            cust.isCustomer ? 'Customer' : 'Supplier'
          } <b>${cust.custname}.</b> Do you want to proceed?`;
        } else {
          cust = {};
        }
        let textDom = this.$createElement('div', {
          domProps: {
            innerHTML: text,
          },
        });
        this.$bvModal
          .msgBoxConfirm(textDom, {
            size: 'md',
            buttonSize: 'sm',
            okVariant: 'danger',
            headerClass: 'p-0 border-bottom-0',
            footerClass: 'border-top-0', // p-1
            centered: true,
          })
          .then((val) => {
            if (val) {
              self
                .deleteAccount(
                  accountId,
                  accDetails.name,
                  cust.custid,
                  cust.custname,
                  cust.isCustomer
                )
                .then((status) => {
                  if (status === 0) {
                    self.getAccountsList().then(() => {
                      self.updateUrl(groupCode, subGroupCode, -1);
                      location.reload();
                    });
                  }
                });
            }
          });
      });
    },
    /* Fetch all accounts */
    getAccountsList() {
      this.loading = true;
      return axios
        .get(`/accounts`)
        .then((resp) => {
          if (resp.data.gkstatus === 0) {
            let accData = {};
            let idToName = {};
            let emptySGCounter = 0;
            let groups = [],
                accounts = [],
                subGroups = [];
            resp.data.gkresult.forEach((acc) => {
              if (!accData[acc.groupname]) {
                accData[acc.groupname] = {
                  subGroups: {},
                  subCount: 0,
                  accCount: 0,
                  id: acc.groupcode,
                  open: false,
                  show: true,
                };
                idToName[acc.groupcode] = acc.groupname;
                groups.push({
                  text: acc.groupname,
                  value: acc.groupcode,
                });
              }
              let group = accData[acc.groupname];
              if (!group.subGroups[acc.subgroupname]) {
                let sgId = acc.subgroupcode || `-${++emptySGCounter}`;
                group.subGroups[acc.subgroupname] = {
                  accounts: {},
                  accCount: 0,
                  id: sgId,
                  open: false,
                  show: true,
                };
                group.subCount++;
                idToName[sgId] = acc.subgroupname;
                if (acc.subgroupname) {
                  subGroups.push({
                    text: acc.subgroupname,
                    value: sgId,
                    group: acc.groupcode,
                  });
                }
              }
              let subGroup = group.subGroups[acc.subgroupname];
              subGroup.accounts[acc.accountcode] = {
                name: acc.accountname,
                sysFlag: acc.sysaccount,
                defaultFlag: acc.defaultflag,
                openingBal: !isNaN(acc.openingbal)
                  ? parseFloat(acc.openingbal).toFixed(2)
                  : '0.00',
                show: true,
              };

              if (acc.openingbal > 0) {
                subGroup.accounts[acc.accountcode].openingBal += ' Dr';
              } else if (acc.openingbal < 0) {
                subGroup.accounts[acc.accountcode].openingBal = Math.abs(
                  acc.openingbal
                ).toFixed(2);
                subGroup.accounts[acc.accountcode].openingBal += ' Cr';
              }

              accounts.push({
                text: acc.accountname,
                value: acc.accountcode,
                group: acc.groupcode,
                subGroup: group.subGroups[acc.subgroupname].id,
                show: true,
              });
              subGroup.accCount++;
              group.accCount++;
            });

            this.options.accData = accData;
            this.options.groupIdToName = idToName;
            this.options.accounts = accounts;
            this.options.groups = groups;
            this.options.subGroups = subGroups;
          } else {
            this.$bvToast.toast(this.$gettext('Failed to fetch Accounts'), {
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
    /** Update the URL based on the group and subgroup open last */
    updateUrl(gid, sgid, aid) {
      let url = window.location.href.split('#')[0];
      url += `#/accounts/${gid}/${sgid}/${aid}`;
      history.replaceState(null, '', url); // replace state method allows us to update the last history instance inplace,
      // instead of creating a new history instances for every entity selected
    },
    hideAllCards(showFlag) {
      showFlag = !!showFlag;
      const groups = this.options.accData;
      for (const gname in groups) {
        groups[gname].show = showFlag;
        let subg = groups[gname].subGroups;
        for (const sgName in subg) {
          subg[sgName].show = showFlag;
          let acc = subg[sgName].accounts;
          for (const accName in acc) {
            acc[accName].show = showFlag;
          }
        }
      }
    },
    closeAllCards() {
      const groups = this.options.accData;
      for (const gname in groups) {
        groups[gname].open = false;
        let subg = groups[gname].subGroups;
        for (const sgName in subg) {
          subg[sgName].open = false;
          let acc = subg[sgName].accounts;
          for (const accName in acc) {
            acc[accName].open = false;
          }
        }
      }
    },
    openCard(groupId, subGroupId, accId) {
      const self = this;
      const groups = self.options.accData;
      const idToName = self.options.groupIdToName;
      let gname = idToName[groupId];
      let sgname = idToName[subGroupId];
      if (groups[gname]) {
        groups[gname].open = true;
        groups[gname].show = true;
        if (groups[gname].subGroups[sgname]) {
          let subg = groups[gname].subGroups;
          subg[sgname].open = true;
          subg[sgname].show = true;
          if (accId && subg[sgname].accounts[accId]) {
            subg[sgname].accounts[accId].show = true;
          } else {
            let acc = subg[sgname].accounts;
            for (const accName in acc) {
              acc[accName].show = true;
            }
          }
        } else {
          let subg = groups[gname].subGroups;
          for (const sgName in subg) {
            subg[sgName].show = true;
            let acc = subg[sgName].accounts;
            for (const accName in acc) {
              acc[accName].show = true;
            }
          }
        }
      }
      this.$forceUpdate();
      this.$nextTick().then(() => {
        let openDom = document.getElementById(`g-${groupId}`);
        if (groups[gname]) {
          if (groups[gname].subGroups[sgname]) {
            openDom = document.getElementById(`sg-${subGroupId}`);
            if (accId) {
              if (groups[gname].subGroups[sgname].accounts[accId]) {
                openDom = document.getElementById(`acc-${accId}`);
              }
            }
          }
        }
        if (openDom) {
          window.setTimeout(() => {
            openDom.scrollIntoView({ block: 'center', inline: 'nearest' });
          }, 500);
        }
      });
    },
    openSearchedCard(groupFlag, subGroupFlag, accountFlag) {
      if (!(groupFlag || subGroupFlag || accountFlag)) {
        // if all the flags are false or null return
        // return;
      }
      let accCode = this.searchBy.account;
      let sgCode = this.searchBy.subGroup;
      let gcode = this.searchBy.group;
      if (accCode) {
        let account = this.accounts.filter((acc) => acc.value === accCode)[0];
        if (account) {
          this.hideAllCards();
          this.openCard(account.group, account.subGroup, accCode);
        }
      } else if (sgCode) {
        let subGroup = this.subGroups.filter((sg) => sg.value === sgCode)[0];
        if (subGroup) {
          this.hideAllCards();
          this.openCard(subGroup.group, sgCode);
        }
      } else if (gcode) {
        this.hideAllCards();
        this.openCard(gcode);
      } else {
        this.closeAllCards();
        this.hideAllCards(true);
      }
    },
  },
  mounted() {
    const self = this;
    this.getAccountsList().then(() => {
      // open the group and subgroup from URL
      if (self.group) {
        self.openCard(
          parseInt(self.group),
          parseInt(self.subGroup),
          parseInt(self.acc)
        );
      }
    });
  },
};
</script>

<style>
.acc-card-header {
  border-bottom: 1px solid #0000001a;
}
.acc-card-header:hover {
  border-bottom: 1px solid #000;
}
.bg-dark-grey {
  background-color: #d6d6d6;
}
.bg-light-grey {
  background-color: #ecebeb;
}
@media all and (max-width: 576px) {
  .options-col {
    width: 50px;
  }
}
</style>
