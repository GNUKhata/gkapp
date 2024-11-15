<template>
  <section class="ml-3 mr-3">
    <b-alert
      class="mt-3"
      show
      variant="warning"
    >
      <b>
        Please read and follow the instructions carefully for smooth and
        flawless data import.</b>
    </b-alert>
    <!-- Tally documentation -->
    <div
      v-if="help_type == 'tally'"
      v-translate
    >
      <h3 id="tally">
        Tally (.xlsx)
      </h3>
      <p>
        This section will assist you to import data from any software that
        exports data to XLSX spreadsheets.Such software includes Tally ERP 9
        (and GNUKhata itself), which exports list of accounts and vouchers in
        two separate spreadsheet. Note however that a spreadsheet containing
        data exported from GNUKhata precisely contains list of accounts and
        vouchers in two separate sheets. However if the proper specifications
        are followed, you can get data from other programs too. As an example,
        all you need is to export data from Tally to a spreadsheet in xlsx
        format. This can be done by following instructions given below.
      </p>
      <ul>
        <li>Export list of accounts and add their opening balances.</li>
        <li>
          Opening balances should be added in the columns next to the account
          name itself.
        </li>
        <li>
          In case of a debit opening balance the amount goes in the second
          column[column B].
        </li>
        <li>
          In case of a credit opening balance the amount goes in the third
          column[column C].
        </li>
        <li>Day Book should be exported in the next sheet.</li>
        <li>
          The date range for Day Book should be for entire financial year.
        </li>
        <li>
          While exporting the Day Book choose following options :
        </li>
        <ul style="list-style-type:circle">
          <li>Language : Default(Language).</li>
          <li>Format : Excel(Spreadsheet).</li>
          <li>Output File Name : Choose your own .</li>
          <li>Output Sheet Name : Choose your own .</li>
          <li>Format : Detailed</li>
          <li>Show Voucher Numbers also ? <code>Yes</code></li>
          <li>Show narrations ? <code>Yes</code></li>
          <li>Show bill wise details ?<code> No</code></li>
          <li>Show Cost Centre details also ?<code> No</code></li>
          <li>Show inventory details ? <code>No</code></li>
          <li>Show additional description of Stock item ? <code>No</code></li>
          <li>Show Bank Details also ? <code>No</code></li>
          <li>Show additional details ? <code>No</code></li>
        </ul>
      </ul>
      For more details on how to export, please refer Tally documentation.<br>
      Once data is exported to the spreadsheet, it however has to comply with
      the import specification given below, which need minor adjustment in the
      sheets. These adjustment applies to importing data from any software.
      <br>
      <div class="mygrid-wrapper ">
        <ul>
          <li>
            First sheet must have list of groups, subgroups and accounts.<br>
          </li>
          <li>
            The main groups exported should be only amongst the 13 given below:
            <ul>
              <li>
                Capital <i>[for Profit Making]</i> OR Corpus
                <i>[for Not for Profit]</i>
              </li>
              <li>Current Assets</li>
              <li>Current Liabilities</li>
              <li>Direct Expense</li>
              <li>Direct Income</li>
              <li>Fixed Assets</li>
              <li>Indirect Expense</li>
              <li>Indirect Income</li>
              <li>Investments</li>
              <li>Loans(Asset)</li>
              <li>Loans(Liability)</li>
              <li>
                Miscellaneous Expenses(Asset) <i>[Only for Profit Making]</i>
              </li>
              <li>Reserves</li>
            </ul>
          </li>
          <li>Every group must be followed by it's subgroups if any.<br></li>
          <li>
            Every subgroup must be followed by it's list of accounts.<br>
          </li>
          <li>
            Note the Sub Group Bank account under Current Assets must be 'Bank'
            and Cash in Hand must be 'Cash'.
          </li>
          <li>
            New Sub Groups can optionally be added under any group.
          </li>
          <li>
            If accounts are under a group directly, then the list must follow
            the group.<br>
          </li>
          <li>
            All groups must be in bold, accounts in italics and subgroups normal
            font.<br>
          </li>
          <li>This data must be in column A of the sheet.<br></li>
          <li>
            The following 2 columns B and C must have either Dr or Cr opening
            balance respectively for the account.<br>
          </li>
          <li>
            The Profit &amp; Loss A/c account should be rename to Profit &amp;
            Loss.<br>
          </li>
          <li>
            The said account should be under the group Direct Income. <br>
          </li>
          <li>
            All additional information must be removed such as Company name,
            address, fianancial year,etc.<br>
          </li>
          The above mentioned changes should be made once data is exported.

          <p />
        </ul>
      </div>
    </div>
    <!-- GNUKhata -->
    <div
      v-if="help_type == 'tally'"
      v-translate
    >
      <h3 id="gnukhata">
        GNUKhata (.xlsx)
      </h3>
      TODO
    </div>
    <!-- Json documentation -->
    <div
      v-translate
      v-else
    >
      <h3 id="json">
        JSON
      </h3>
      The following data is imported:
      <ul>
        <li>Customers / Suppliers (contacts)</li>
        <li>Godowns</li>
        <li>Accounts</li>
      </ul>
    </div>
  </section>
</template>

<script>
export default {
  name: 'Help',
  data() {
    return {
      help_type: 'tally',
    };
  },
  created() {
    this.help_type = this.$route.params['help_type'];
  },
};
</script>
