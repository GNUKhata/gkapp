<template>
  <b-table
    :items="tableData"
    :fields="tableFields"
    thead-class="d-none"
    outlined
    hover
    responsive
    show-empty
  >
    <template
      #cell(account_name)="data"
    >
      <p class="h5 text-muted m-0">
        {{ data.value }}
      </p>
      <p class="text-right text-dark font-weight-light h3 m-0">
        {{ data.item.account_balance }} ₹
      </p>
    </template>
  </b-table>
</template>

<script>

export default {
  name: 'CashAccounts',
  data() {
    return {
      tableData: [],
      tableFields: [
        {
          key: 'account_name',
          label: 'Account Name',
        },
      ],
    }
  },
  methods: {
    getAccountsData() {
      this.$axios({ method: "GET", url: '/dashboard?type=account_balances&group=cash_accounts' })
        .then((resp) => {
          let account_names = resp["account_names"];
          let account_balances = resp["account_balances"];
          let result = account_names.reduce(
            (result, field, index) => {
              return result.concat({
                "account_name": field,
                "account_balance": parseFloat(account_balances[index]).toFixed(2),
              });
            },
            []
          );
          this.tableData = result;
        })
    },
  },
  mounted() {
    this.getAccountsData();
  },
};
</script>
