<template>
  <div
    class="card"
    :style="{minWidth: '300px'}"
  >
    <b-overlay
      :show="isPreloading"
      variant="secondary"
      no-wrap
      blur
    />
    <div class="card-header py-2 text-left">
      <b>
        <span
          v-if="isEditMode"
          v-translate
        > Edit Budget Details</span>
        <span
          v-else
          v-translate
        > Create Budget Details </span>
      </b>
      <slot name="close-button" />
    </div>
    <div class="card-body pb-2 px-1 px-md-3">
      <b-form
        class="px-2 text-left"
        @submit.prevent="confirmOnSubmit"
      >
        <b-row>
          <b-col class="mb-3 px-3">
            <b-container
              fluid
              class="h-100"
            >
              <b-row class="align-content-around h-100">
                <b-col cols="12">
                  <b-form-group
                    label-size="sm"
                    label="Type"
                    label-for="bud-input-10"
                    label-cols="2"
                    label-class="required"
                  >
                    <b-form-radio-group
                      v-model="form.type"
                      button-variant="outline-secondary"
                      size="sm"
                      buttons
                      class="mx-1"
                    >
                      <b-form-radio value="cash">
                        <translate> Cash </translate>
                      </b-form-radio>
                      <b-form-radio value="pl">
                        <translate> Profit & Loss </translate>
                      </b-form-radio>
                    </b-form-radio-group>
                  </b-form-group>
                  <b-form-group
                    label-size="sm"
                    label="Name"
                    label-for="bud-input-20"
                    label-cols="2"
                    label-class="required"
                  >
                    <b-form-input
                      size="sm"
                      id="bud-input-20"
                      placeholder=""
                      v-model="form.name"
                      trim
                      required
                    />
                  </b-form-group>
                  <b-form-group
                    label-size="sm"
                    label="From"
                    label-for="bud-date-1"
                    label-cols="2"
                    label-class="required"
                  >
                    <GkDate
                      id="bud-date-1"
                      :format="dateFormat"
                      v-model="form.from"
                      :required="true"
                      @validity="onFromDateSet"
                    />
                  </b-form-group>
                  <b-form-group
                    label-size="sm"
                    label="To"
                    label-for="bud-date-2"
                    label-cols="2"
                    label-class="required"
                    :style="{minWidth: '180px'}"
                  >
                    <GkDate
                      id="bud-date-2"
                      :format="dateFormat"
                      :min="minDate"
                      v-model="form.to"
                      :required="true"
                      @validity="
                        (validity) => {
                          this.isValid.toDate = validity;
                        }
                      "
                    />
                  </b-form-group>
                </b-col>
                <b-col>
                  <b-table-simple
                    class="mt-3"
                    small
                    responsive="sm"
                    bordered
                    striped
                    caption-top
                    v-if="isCash"
                  >
                    <b-thead head-variant="dark">
                      <b-tr>
                        <b-th> <translate> Summary </translate> </b-th>
                        <b-th> <translate> (₹) </translate> </b-th>
                      </b-tr>
                    </b-thead>
                    <b-tbody>
                      <b-tr>
                        <td v-translate>
                          Opening Balance
                        </td>
                        <td>{{ form.budget.openingBalance }}</td>
                      </b-tr>
                      <b-tr>
                        <td v-translate>
                          Inflow
                        </td>
                        <td>{{ totalIn }}</td>
                      </b-tr>
                      <b-tr>
                        <td v-translate>
                          Cash Available
                        </td>
                        <td>{{ form.budget.openingBalance + totalIn }}</td>
                      </b-tr>
                      <b-tr>
                        <td v-translate>
                          Outflow
                        </td>
                        <td>{{ totalOut }}</td>
                      </b-tr>
                      <b-tr>
                        <td v-translate>
                          Closing Balance
                        </td>
                        <td>
                          {{
                            form.budget.openingBalance + (totalIn - totalOut)
                          }}
                        </td>
                      </b-tr>
                    </b-tbody>
                  </b-table-simple>
                  <b-table-simple
                    class="mt-3"
                    small
                    responsive="sm"
                    bordered
                    striped
                    caption-top
                    v-else
                  >
                    <b-thead head-variant="dark">
                      <b-tr>
                        <b-th> <translate> Summary </translate> </b-th>
                        <b-th> <translate> (₹) </translate> </b-th>
                      </b-tr>
                    </b-thead>
                    <b-tbody>
                      <b-tr>
                        <td v-translate>
                          Total Income
                        </td>
                        <td>{{ totalIn }}</td>
                      </b-tr>
                      <b-tr>
                        <td v-translate>
                          Total Expense
                        </td>
                        <td>{{ totalOut }}</td>
                      </b-tr>
                      <b-tr>
                        <td v-translate>
                          Net Profit
                        </td>
                        <td>{{ totalIn - totalOut }}</td>
                      </b-tr>
                    </b-tbody>
                  </b-table-simple>
                </b-col>
              </b-row>
            </b-container>
          </b-col>
          <b-col
            cols="12"
            :md="inOverlay ? 12 : 6"
            lg="6"
            class="mb-3"
          >
            <b-card
              no-body
              border-variant="dark"
            >
              <b-card-body class="p-2">
                <h5 v-translate>
                  Budget Amount
                </h5>
                <b-alert
                  class="mb-2 px-1 py-0"
                  variant="danger"
                  :show="totalIn === 0"
                >
                  <small>
                    <translate
                      translate-comment="%{inType} is a variable, translation is not required for it. Enter it, as it is while translation."
                      :translate-params="{inType: inType}"
                    >
                      Please enter atleast 1 budget amount for %{inType}!
                    </translate>
                  </small>
                </b-alert>
                <b-table-lite
                  :fields="accTableFields"
                  :items="accIn"
                  sticky-header="200px"
                  bordered
                  striped
                  small
                  thead-class="text-capitalize"
                  head-variant="dark"
                >
                  <template #head(acc)>
                    <translate
                      translate-comment="%{inType} is a variable, translation is not required for it. Enter it, as it is while translation."
                      :translate-params="{inType: inType}"
                    >
                      %{inType} Accounts
                    </translate>
                  </template>
                  <template #cell(bud)="data">
                    <b-input
                      size="sm"
                      type="number"
                      step="0.01"
                      v-model="form.budget[inType][data.item.code]"
                    />
                  </template>
                </b-table-lite>
                <b-alert
                  class="mb-2 px-1 py-0"
                  variant="danger"
                  :show="totalOut === 0"
                >
                  <small>
                    <translate
                      translate-comment="%{outType} is a variable, translation is not required for it. Enter it, as it is while translation."
                      :translate-params="{outType: outType}"
                    >
                      Please enter atleast 1 budget amount for %{outType}!
                    </translate>
                  </small>
                </b-alert>
                <b-table-lite
                  :fields="accTableFields"
                  :items="accOut"
                  sticky-header="200px"
                  bordered
                  striped
                  small
                  thead-class="text-capitalize"
                  head-variant="dark"
                >
                  <template #head(acc)>
                    <translate
                      translate-comment="%{outType} is a variable, translation is not required for it. Enter it, as it is while translation."
                      :translate-params="{outType: outType}"
                    >
                      %{outType} Accounts
                    </translate>
                  </template>
                  <template #cell(bud)="data">
                    <b-input
                      size="sm"
                      type="number"
                      step="0.01"
                      v-model="form.budget[outType][data.item.code]"
                    />
                  </template>
                </b-table-lite>
              </b-card-body>
            </b-card>
          </b-col>
        </b-row>
        <hr class="my-2">
        <div>
          <div class="float-right">
            <b-button
              v-if="!hideBackButton"
              size="sm"
              class="m-1"
              variant="danger"
              @click.prevent="$router.go(-1)"
            >
              <b-icon
                aria-hidden="true"
                class="align-middle mr-1"
                icon="arrow-left"
              />
              <span
                class="align-middle"
                v-translate
              >Back</span>
            </b-button>
            <b-button
              size="sm"
              class="m-1"
              variant="warning"
              @click.prevent="resetForm(true)"
            >
              <b-icon
                aria-hidden="true"
                class="align-middle mr-1"
                icon="arrow-repeat"
              />
              <span
                class="align-middle"
                v-translate
              >Reset</span>
            </b-button>
            <b-button
              :disabled="!isFormValid"
              size="sm"
              type="submit"
              class="m-1"
              variant="success"
            >
              <b-spinner
                v-if="isLoading"
                small
              />
              <b-icon
                v-else
                aria-hidden="true"
                class="align-middle mr-1"
                :icon="isEditMode ? 'cloud-arrow-up' : 'plus-square'"
              />
              <span
                class="align-middle"
                v-translate
                v-if="isEditMode"
              >
                Update
              </span>
              <span
                class="align-middle"
                v-translate
                v-else
              >Save</span>
            </b-button>
          </div>
        </div>
      </b-form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
import GkDate from '../GkDate.vue';
export default {
  name: 'BudgetItem',
  components: { GkDate },
  props: {
    id: {
      type: [String, Number],
      default: -1,
      required: false,
    },
    mode: {
      type: String,
      validator: function(value) {
        return ['create', 'edit'].indexOf(value) !== -1;
      },
      required: true,
    },
    type: {
      type: [String],
      validator: function(value) {
        return ['cash', 'pl'].indexOf(value) !== -1;
      },
      required: false,
      default: 'cash',
    },
    onSave: {
      type: Function,
      required: false,
    },
    hideBackButton: {
      type: Boolean,
      required: false,
      default: false,
    },
    inOverlay: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      isLoading: false,
      isPreloading: false,
      options: {
        cashAccs: {},
        plAccs: {},
        accCodes: {
          in: {},
          out: {},
        },
      },
      accTableFields: [
        {
          key: 'acc',
          label: 'Accounts',
          class: 'align-middle',
          thClass: 'text-center',
        },
        { key: 'bud', label: '(₹)', thClass: 'text-center' },
      ],
      isValid: {
        fromDate: null,
        toDate: null,
      },
      form: {
        type: 'cash',
        name: '',
        budget: {
          income: {},
          expense: {},
          inflow: {},
          outflow: {},
          openingBalance: 0,
        },
        from: '',
        to: '',
      },
    };
  },
  computed: {
    isEditMode: (self) => self.mode === 'edit',
    isFormValid: (self) =>
      self.isValid.fromDate &&
      self.isValid.toDate &&
      self.totalIn !== 0 &&
      self.totalOut !== 0,
    minDate: (self) =>
      self.dateReverse(self.isValid.fromDate ? self.form.from : self.yearStart),
    totalIn: (self) =>
      Object.values(self.form.budget[self.inType]).reduce(
        (sum, bud) => sum + parseFloat(bud),
        0
      ),
    totalOut: (self) =>
      Object.values(self.form.budget[self.outType]).reduce(
        (sum, bud) => sum + parseFloat(bud),
        0
      ),
    inType: (self) => (self.isCash ? 'inflow' : 'income'),
    outType: (self) => (self.isCash ? 'outflow' : 'expense'),
    isCash: (self) => self.form.type === 'cash',
    accIn: (self) =>
      self.isCash ? self.options.cashAccs.inflow : self.options.plAccs.income,
    accOut: (self) =>
      self.isCash ? self.options.cashAccs.outflow : self.options.plAccs.expense,
    dateFormat: (self) => self.$store.getters['global/getDateFormat'],
    ...mapState(['yearStart', 'yearEnd']),
  },
  watch: {
    id() {
      this.fetchBudgetDetails();
    },
    type(type) {
      this.form.type = type;
    },
  },
  methods: {
    onFromDateSet(isValid) {
      this.isValid.fromDate = isValid;
      if (isValid && this.isCash) {
        this.isPreloading = true;
        this.fetchBudgetAccounts(3)
          .then(() => {
            this.isPreloading = false;
          })
          .catch(() => {
            this.isPreloading = false;
          });
      }
    },
    confirmOnSubmit() {
      const self = this;
      let from = this.dateReverse(this.form.from),
          to = this.dateReverse(this.form.to);
      let action = this.isEditMode ? 'Update' : 'Create';
      let text = `${action} Budget <b>${this.form.name}</b> for the time period, (${from} to ${to})?`;
      let textDom = this.$createElement('div', {
        domProps: {
          innerHTML: text,
        },
      });
      this.$bvModal
        .msgBoxConfirm(textDom, {
          size: 'md',
          buttonSize: 'sm',
          okVariant: 'success',
          headerClass: 'p-0 border-bottom-0',
          footerClass: 'border-top-0', // p-1
          // bodyClass: 'p-2',
          centered: true,
        })
        .then((val) => {
          if (val) {
            self.onSubmit();
          }
        });
    },
    onSubmit() {
      const self = this;
      this.isLoading = true;
      const payload = this.initPayload();
      // console.log(payload);
      let formMode = 'Create',
          method = 'post';
      if (this.isEditMode) {
        formMode = 'Update';
        method = 'put';
      }
      axios({ method: method, url: '/budget', data: payload })
        .then((response) => {
          // console.log(response)
          self.isLoading = false;
          switch (response.data.gkstatus) {
          case 0:
            {
              // === Server Log ===
              let action = self.isEditMode ? 'updated' : 'created';
              let logdata = {
                activity: `budget ${action}: ${payload.budname}`,
              };
              axios.post('/log', logdata);
              self.displayToast(
                this.$gettext(`Success!`),
                `${formMode} Budget "${payload.budname} Successful"`,
                'success'
              );
              if (!self.isEditMode) {
                // only reset form on success, otherwise leave it as is so that user may edit their input and try again
                self.resetForm();
              }
            }
            break;
          case 1:
            self.displayToast(
              this.$gettextInterpolate(
                this.$gettext(`%{formMode} Budget Error!`),
                { formMode: formMode }
              ),
              this.$gettext(`Budget entry already exists!`),
              'warning'
            );
            break;
          case 2:
            self.displayToast(
              this.$gettextInterpolate(
                this.$gettext(`%{formMode} Budget Error!`),
                { formMode: formMode }
              ),
              this.$gettext(`Unauthorized access, please contact admin.`),
              'warning'
            );
            break;
          default:
            self.displayToast(
              this.$gettext(`Error!`),
              this.$gettextInterpolate(
                this.$gettext(
                  `Unable to %{formMode} Budget, please try again.`
                ),
                { formMode: formMode }
              ),
              'danger'
            );
          } // end switch
          if (self.onSave) {
            self.onSave(response.data);
          }
        })
        .catch((error) => {
          self.isLoading = false;
          self.displayToast(
            this.$gettextInterpolate(
              this.$gettext(`%{formMode} Budget Error!`),
              { formMode: formMode }
            ),
            `Error: ${error.message}`,
            'warning'
          );
        });
    },
    initPayload() {
      let payload = {
        budname: this.form.name,
        startdate: this.form.from.split('-').join(''),
        enddate: this.form.to.split('-').join(''),
        contents: {},
        budtype: this.isCash ? 3 : 16,
        gaflag: 1, // gaflag is for budget is group wise(7)/subgroup wise(19)/account wise(1)
      };
      let contents = {};
      Object.assign(contents, this.form.budget[this.inType]);
      Object.assign(contents, this.form.budget[this.outType]);
      for (const accId in contents) {
        contents[accId] = parseFloat(contents[accId]);
        if (contents[accId] === 0) {
          delete contents[accId];
        }
      }
      payload.contents = contents;
      if (this.isEditMode) {
        payload.budid = this.id;
      }
      return payload;
    },
    resetForm(fetchBalance) {
      this.form = {
        type: this.type,
        name: '',
        budget: {
          income: {},
          expense: {},
          inflow: {},
          outflow: {},
          openingBalance: 0,
        },
        from: this.yearStart,
        to: this.yearEnd,
      };
      this.onFromDateSet(fetchBalance);
    },
    fetchBudgetAccounts(type) {
      const self = this;
      return axios
        .get(
          `/budget?type=addtab&financialstart=${this.yearStart}&uptodate=${this.form.from}&btype=${type}`
        )
        .then((resp) => {
          if (resp.data.gkstatus === 0) {
            let codes = {
              in: {},
              out: {},
            };
            if (type === 16) {
              self.options.plAccs = {
                expense: resp.data.gkresult.expense.map((acc) => {
                  codes.out[acc.code] = true;
                  return {
                    acc: acc.name,
                    code: acc.code,
                    bud: 0,
                  };
                }),
                income: resp.data.gkresult.income.map((acc) => {
                  codes.in[acc.code] = true;
                  return {
                    acc: acc.name,
                    code: acc.code,
                    bud: 0,
                  };
                }),
              };
            } else {
              self.options.cashAccs = {
                inflow: resp.data.gkresult.inflow.map((acc) => {
                  codes.in[acc.code] = true;
                  return {
                    acc: acc.accountname,
                    code: acc.accountcode,
                    bud: 0,
                  };
                }),
                outflow: resp.data.gkresult.outflow.map((acc) => {
                  codes.out[acc.code] = true;
                  return {
                    acc: acc.accountname,
                    code: acc.accountcode,
                    bud: 0,
                  };
                }),
              };
              self.form.budget.openingBalance = parseFloat(
                resp.data.gkresult.openingbal
              );
            }
            Object.assign(self.options.accCodes.in, codes.in);
            Object.assign(self.options.accCodes.out, codes.out);
          }
        })
        .catch((error) => {
          this.displayToast(
            this.$gettext('Fetch Unit of Measurement Failed!'),
            error.message,
            'danger'
          );
          return error;
        });
    },
    fetchBudgetDetails() {
      if (parseInt(this.id) <= 0) {
        return;
      }

      axios
        .get(`/budget?bud=details&budid=${this.id}`)
        .then((resp) => {
          if (resp.data.gkstatus === 0) {
            let details = resp.data.gkresult;
            console.log(details);
            this.displayToast(
              this.$gettext(`Success!`),
              this.$gettext('Fetched Budget Details!'),
              'success'
            );

            Object.assign(this.form, {
              type: details.btype === 3 ? 'cash' : 'pl',
              name: details.budname,
              from: this.dateReverse(details.startdate),
              to: this.dateReverse(details.enddate),
            });
            let budget = {
              income: {},
              expense: {},
              inflow: {},
              outflow: {},
              openingBalance: 0,
            };
            let codes = this.options.accCodes;
            for (const accId in details.contents) {
              if (details.btype === 3) {
                if (codes.in[accId]) {
                  budget.inflow[accId] = details.contents[accId];
                } else {
                  budget.outflow[accId] = details.contents[accId];
                }
              } else {
                if (codes.in[accId]) {
                  budget.income[accId] = details.contents[accId];
                } else {
                  budget.expense[accId] = details.contents[accId];
                }
              }
            }
            this.form.budget = budget;
            if (details.btype === 3) {
              this.fetchBudgetAccounts(3);
            }
          } else {
            this.displayToast(
              this.$gettext(`Error!`),
              this.$gettext('Could not Fetch Budget Details!'),
              'danger'
            );
          }
        })
        .catch((e) => {
          this.displayToast(
            this.$gettext(`Fetch Budget Details Error!`),
            e.message,
            'danger'
          );
        });
    },
    preloadData() {
      this.isPreloading = true;
      const requests = [
        // profit and loss accounts
        this.fetchBudgetAccounts(16),
        // cash accounts
        this.fetchBudgetAccounts(3),
      ];

      const self = this;
      return Promise.all(requests).then(() => {
        self.isPreloading = false;
      });
    },
    displayToast(title, message, variant) {
      this.$bvToast.toast(message, {
        title: title,
        autoHideDelay: 3000,
        variant: variant,
        appendToast: true,
        solid: true,
      });
    },
  },
  mounted() {
    this.resetForm(false);
    this.preloadData().then(() => {
      if (this.mode === 'edit') {
        this.fetchBudgetDetails();
      }
    });
  },
};
</script>
