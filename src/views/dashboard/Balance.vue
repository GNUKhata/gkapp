<template>
  <div
    v-if="show"
    class="mb-3 d-flex flex-row justify-content-center"
  >
    <div class="rounded  m-2 p-3 bg-warning">
      <div class="row">
        <div class="col">
          <b-icon
            icon="building"
            class="mr-1"
          />
          <b>
            Bank Balance: {{ gk_currency(bankBalance) }}
          </b>
        </div>
      </div>
    </div>
    <div class="rounded m-2 p-3 bg-success text-light">
      <div class="row">
        <div class="col">
          <b-icon
            icon="cash"
            class="mr-1"
          />
          <b>
            Cash Balance: {{ gk_currency(cashBalance) }}
          </b>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'Balance',
  data() {
    return {
      bankBalance: 0,
      cashBalance: 0,
      show: false,
    };
  },
  methods: {
    getBalances() {
      axios
        .get('/dashboard?type=cashbankaccountdata')
        .then((r) => {
          if (r.status == 200) {
            this.bankBalance = r.data.bankaccdata.reduce(
              (sum,item) => sum + item.bankbalance*(item.baltype === "Cr" ? -1 : 1), 0
            );
            this.cashBalance = r.data.cashaccdata.reduce(
              (sum,item) => sum + item.cashbalance*(item.baltype === "Cr" ? -1 : 1), 0
            );
            this.show = true;
          }
        })
        .catch((e) => {
          console.log(e);
        });
    },
  },
  created() {
    this.getBalances();
  },
};
</script>
