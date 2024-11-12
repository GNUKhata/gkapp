<template>
  <!--add custom data here  -->
  <div>
    <component
      :is="name"
      :pdata="pdata"
      :id="id"
      :on-update="onUpdate"
    />
  </div>
</template>

<script>
import Invoice from './InvoiceProfile.vue';
import CashMemo from './CashMemoProfile.vue';
import DebitCreditNote from './DcNoteProfile.vue';
import DeliveryNote from './DeliveryNoteProfile.vue';
import PurchaseSalesOrder from './PsOrderProfile.vue';
import RejectionNote from './RejectionNoteProfile.vue';
import TransferNote from './TransferNoteProfile.vue';
import Voucher from './VoucherProfile.vue';
import { mapState } from 'vuex';
export default {
  name: 'Transaction',
  components: {
    Invoice,
    CashMemo,
    DebitCreditNote,
    DeliveryNote,
    PurchaseSalesOrder,
    RejectionNote,
    TransferNote,
    Voucher,
  },
  props: {
    name: {
      type: String,
      required: true,
      validator: function(value) {
        return (
          [
            'Invoice',
            'DebitCreditNote',
            'CashMemo',
            'DeliveryNote',
            'PurchaseSalesOrder',
            'RejectionNote',
            'TransferNote',
            'Voucher',
          ].indexOf(value) !== -1
        );
      },
    },
    id: {
      type: Number,
      required: true,
      note: 'Transaction Id',
    },
    pdata: {
      type: Object,
      required: true,
      note: 'Data for the Transaction Profiles',
    },
    onUpdate: {
      type: Function,
      required: false,
      note: `Run after every update of the Transaction, as a callback.
      Used to update the data used in workflow.`,
    },
  },
  computed: {
    ...mapState(['orgAddress', 'orgImg', 'orgGstin']),
  },
};
</script>
