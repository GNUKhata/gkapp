<template>
  <div>
    <section class="m-2">
      <h3 class="text-center" v-translate>Accounts</h3>
      <gk-toolbar>
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
          :commonParams="false"
          :messageFromParent="parentMessage"
        ></gk-file-download>
        <b-button
          v-b-modal.account-create
          variant="outline-primary"
          size="sm"
        >
          + Add Account
        </b-button>
        <router-link
          class="ml-2 btn btn-outline-info btn-sm"
          :to="`/sub-groups`"
        >
          <b-icon
            aria-hidden="true"
            class="align-middle mr-1"
            icon="grid"
          ></b-icon>
          Subgroups
        </router-link>
      </gk-toolbar>
      <div class="clearfix"></div>
      <div>
        <b-tabs content-class="mt-3">
          <b-tab
            v-for="group in groups"
            :title="group.groupname"
            v-bind:key="group.groupcode"
          >
            <div class="row">
              <div class="col">
                <h3>{{ group.groupname }}</h3>
              </div>
              <div>
                <b-form-group
                  class="mb-0"
                >
                  <b-input-group size="sm" class="col-auto">
                    <b-form-input
                      id="filter-input"
                      v-model="filter"
                      type="search"
                      placeholder="Type to Search"
                    ></b-form-input>

                    <b-input-group-append>
                      <b-button :disabled="!filter" @click="filter = ''">Clear</b-button>
                    </b-input-group-append>
                  </b-input-group>
                </b-form-group>
              </div>
            </div>
            <b-overlay :show="isLoading">
              <b-table
                borderless
                hover
                class="mt-3"
                :items="group.children"
                :fields="fields"
                :groupsSubgroups="groupsSubgroups"
                head-variant="light"
                responsive=""
                :filter="filter"
              >
                <template #cell(accountname)="data">
                  {{ data.value }}
                  <p class="text-muted">
                    {{ data.item?.subgroupname }}
                  </p>
                </template>
                <template #cell(openingbal)="data">
                  {{ data.value }}
                </template>
                <template #cell(current_balance)="data">
                  {{ data.value }}
                </template>
                <template #cell(accountcode)="data">
                  <b-button
                    @click="$bvModal.show('account-edit'+data.value)"
                    variant="outline-primary"
                    class="mr-2 pt-0"
                    size="sm"
                  >
                    <b-icon
                      font-scale="0.9"
                      icon="pencil"
                    ></b-icon>
                  </b-button>
                  <b-button
                    :disabled="data.item?.sysaccount ? true : false"
                    variant="danger"
                    @click.prevent="confirmOnDelete(data.item)"
                    class="pt-0"
                    size="sm"
                  >
                    <b-icon
                      font-scale="0.9"
                      icon="trash-fill"
                    ></b-icon>
                  </b-button>
                  <b-modal
                    centered
                    static
                    body-class="p-0"
                    :id="'account-edit'+data.value"
                    hide-header
                    hide-footer
                  >
                    <account
                      @account-edited="hideEditAccount('account-edit'+data.value)"
                      :groupsSubgroups="groupsSubgroups"
                      :accountDetails="data.item"
                    >
                      <template #close-button>
                        <b-button
                          size="sm"
                          class="float-right py-0"
                          @click="hideEditAccount('account-edit'+data.value)"
                        >
                          x
                        </b-button>
                      </template>
                    </account>
                  </b-modal>
                </template>
              </b-table>
            </b-overlay>
          </b-tab>
        </b-tabs>
      </div>
    </section>
    <b-modal
      centered
      static
      body-class="p-0"
      id="account-create"
      v-model="showCreateAccount"
      hide-footer
      hide-header
    >
      <account
        v-if="Object.values(groupsSubgroups).length"
        @account-created="hideCreateAccount"
        :groupsSubgroups="groupsSubgroups"
      >
        <template #close-button>
          <b-button
            size="sm"
            class="float-right py-0"
            @click="showCreateAccount = !showCreateAccount"
          >
            x
          </b-button>
        </template>
      </account>
    </b-modal>
  </div>
</template>

<script>
 import axios from 'axios';
 import GkFileDownload from '../components/GkFileDownload.vue';
 import GkToolbar from '../components/GkToolbar.vue';
 import Account from '../components/form/Account.vue';
 import { mapState } from 'vuex';
 export default {
   name: 'Accounts',
   components: { GkFileDownload, GkToolbar, Account },
   data() {
     return {
       fields: [
         {
           key: 'accountname',
           label: 'Account',
           class: 'text-break col-6',
         },
         {
           key: 'openingbal',
           label: 'Opening Balance',
           class: 'text-right text-break col-2',
         },
         {
           key: 'account_balance',
           label: 'Current Balance',
           class: ' text-right text-break col-2',
         },
         {
           key: 'accountcode',
           label: '',
           class: 'text-break text-right col-2',
         },
       ],
       isLoading: false,
       groups: [],
       groupsSubgroups: {},
       filter: null,
       showCreateAccount: false,
       showEditAccount: {},
       parentMessage: '',
     };
   },
   computed: {
     ...mapState(['orgName', 'yearStart', 'yearEnd', 'orgType']),
   },
   methods: {
     /**
      * hideCreateAccount
      *
      * Actions: Hides create account modal form and updates accout list.
      */
     hideCreateAccount() {
       this.showCreateAccount = false;
       this.getAccountsList();
     },
     /**
      * hideEditAccount
      *
      * Actions: Hides edit account modal form and updates accout list.
      */
     hideEditAccount(modalId) {
       this.$bvModal.hide(modalId);
       this.getAccountsList();
     },
     /**
      * deleteAccount
      *
      * Actions: Delete account. This will also delete related customer if exists.
      */
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
     /**
      * getCust
      *
      * Actions: Fetch customer details.
      */
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
     /**
      * confirmOnDelete
      *
      * Actions: Asks for deletion confirmation, shows warning if a contact
      * is being deleted with it.
      */
     confirmOnDelete(accDetails) {
       let subGroupCode = accDetails.subgroupcode;
       let accountId = accDetails.accountcode;
       let accountName = accDetails.accountname;
       this.getCust(subGroupCode, accountName).then((cust) => {
         const self = this;
         let text = `Delete Account <b>${accountName}</b> ?`;
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
               footerClass: 'border-top-0',
               centered: true,
             })
             .then(val => {
               if (val) {
                 self.deleteAccount(
                   accountId,
                   accountName,
                   cust.custid,
                   cust.custname,
                   cust.isCustomer
                 )
                     .then((status) => {
                       if (status === 0) {
                         self.getAccountsList();
                       }
                     });
               }
             });
       });
     },

     /**
      * prepareGroupsSubgroups
      *
      * Actions: Groupwise organize subgroups and update groupsSubgroups.
      */
     prepareGroupsSubgroups(groupsSubgroupsArray) { // To convert list to key value object
       let groupSubgroupsObj = {};
       groupsSubgroupsArray.forEach((group) => {
         let parentGroup = group?.subgroupof;
         if (parentGroup) {
           if (!groupSubgroupsObj?.[parentGroup]) {
             groupSubgroupsObj = Object.assign(
               {}, groupSubgroupsObj, {[parentGroup]: {"childGroups": {}}}
             );
           }
           groupSubgroupsObj[parentGroup]["childGroups"][group.groupcode] = group;
         } else {
           groupSubgroupsObj[group.groupcode] = {...group, "childGroups": {}};
         }
       });
       this.groupsSubgroups = Object.assign(
         {}, this.groupsSubgroups, groupSubgroupsObj
       );
     },

     /**
      * prepareGroups
      *
      * Actions: Groupwise organize accounts and update groups table.
      */
     prepareGroups(accounts) {
       accounts = accounts.map(account => {
         account.account_balance = parseFloat(account.account_balance).toFixed(2)
         account.openingbal = parseFloat(account.openingbal).toFixed(2)
         return account;
       });
       let accountsGroupwise = Object.groupBy(accounts, ({ groupcode }) => groupcode);
       this.groups = [...new Map(accounts.map(
         item => {
           return [
             item["groupcode"],
             (
               ({ groupname, groupcode }) => (
                 { groupname, groupcode, "children": accountsGroupwise[groupcode] }
               )
             )(item)
           ];
         }
       )).values()];
     },
     /**
      * getGroupsSubgroups
      *
      * Actions: Fetch groups and send to prepare the data.
      */
     getGroupsSubgroups() {
       this.isLoading = true;
       return axios.get('/groups-subgroups').then((resp) => {
         if (resp.data.gkstatus === 0) {
           this.prepareGroupsSubgroups(resp.data.gkresult);
         }
         this.isLoading = false;
       });
     },
     /**
      * getAccountsList
      *
      * Actions: Fetch accounts and send to prepare the data.
      */
     getAccountsList() {
       this.isLoading = true;
       return axios
         .get(`/accounts`)
         .then((resp) => {
           if (resp.data.gkstatus === 0) {
             this.prepareGroups(resp.data.gkresult);
           }
           this.isLoading = false;
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
   /**
    * Actions: Fetch accounts, groups and subgroups
    */
   mounted() {
     this.getAccountsList();
     this.getGroupsSubgroups();
   },
 };
</script>
