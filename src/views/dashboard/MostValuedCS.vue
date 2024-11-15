<template>
  <b-card-group
    deck
    class="mt-5"
  >
    <!-- Most valude customer -->
    <b-card class="shadow">
      <b-card-header
        header-bg-variant="light"
        header-class="mb-1 font-weight-bold"
        header-text-variant="dark"
      >
        <translate>Most Valued Customer</translate>
      </b-card-header>
      <b-table
        :items="info.topfivecustlist"
        :fields="cusFields"
        class="table-border-dark"
        head-variant="dark"
        striped
        small
      >
        <template #cell(custname)="d">
          <a
            @click="handleCustNameClick(d.item)"
            style="cursor: pointer; color: #007bff;"
          >
            {{ d.item.custname }}
          </a>
        </template>
        <template #cell(data)="d">
          {{ gk_currency(d.item.data) }}
        </template>
      </b-table>
      <template #footer>
        <router-link to="/contact-details/create/customer">
          <b-button
            size="sm"
            variant="dark float-right"
          >
            <translate>Add Customer</translate>
          </b-button>
        </router-link>
      </template>
    </b-card>
    <!-- Most Valued Supplier -->
    <b-card class="shadow">
      <b-card-header
        header-bg-variant="light"
        header-class="mb-1 font-weight-bold"
        header-text-variant="dark"
      >
        <translate>Most Valued Supplier</translate>
      </b-card-header>
      <b-table
        :fields="supFields"
        :items="info.topfivesuplist"
        class="table-border-dark"
        head-variant="dark"
        striped
        small
      >
        <template #cell(custname)="d">
          <a
            @click="handleCustNameClick(d.item)"
            style="cursor: pointer; color: #007bff;"
          >
            {{ d.item.custname }}
          </a>
        </template>
        <template #cell(data)="d">
          {{ parseInt(d.item.data) }}
        </template>
      </b-table>
      <template #footer>
        <router-link to="/contact-details/create/supplier">
          <b-button
            size="sm"
            variant="dark float-right"
          >
            <BIcon
              icon="briefcase"
              class="mr-1"
            />
            <translate>Add Supplier</translate>
          </b-button>
        </router-link>
      </template>
    </b-card>
  </b-card-group>
</template>

<script>
import axios from 'axios';
export default {
  name: 'MostValuedCS',
  props: {
    info: {
      type: [Array, Object],
    },
  },
  data() {
    return {
      cusFields: [
        {
          key: 'custname',
          label: 'Name',
        },
        {
          key: 'invoice_total',
          label: 'Amount',
          sortable: true,
          class: 'gk-currency',
        },
      ],
      supFields: [
        {
          key: 'custname',
          label: 'Name',
        },
        {
          key: 'invoice_total',
          label: 'Amount',
          sortable: true,
          class: 'gk-currency',
        },
      ],
    };
  },
  methods: {
    /*Let's Rename the columns with one's specified via prop `columns`*/
    renameColumns() {
      const newNames = this.info.map((obj) => {
        let newObj = {};
        newObj[this.columns[0]] = Object.values(obj)[0];
        newObj[this.columns[1]] = Object.values(obj)[1];
        return newObj;
      });
      return newNames;
    },
    handleCustNameClick(customer) {
      axios.get(`/accounts?type=getAccCode&accountname=${customer.custname}`)
        .then(response => {
          this.custid = response.data.accountcode;
          this.$router.push(`/ledger/${this.custid}`);
        })
        .catch(error => {
          this.error = 'Failed to load data: ' + error.message;
        });
    },
  },
};
</script>
