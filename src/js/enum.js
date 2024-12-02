const STATUS_CODES = {
  Success: 0,
  DuplicateEntry: 1,
  UnauthorisedAccess: 2,
  ConnectionFailed: 3,
  BadPrivilege: 4,
  ActionDisallowed: 5,
  ProxyServerError: 6,
  ValidationError: 7,
};

const PAGES = {
  global: 0,
  workflow: 10,
  'workflow-invoice': 20,
  'workflow-dc-note': 30,
  'workflow-cash-memo': 40,
  'workflow-delivery-note': 50,
  'workflow-ps-order': 60,
  'workflow-rejection-note': 70,
  'workflow-transfer-note': 80,
  'workflow-voucher': 90,
  'workflow-business': 100,
  'workflow-contacts': 110,
  'create-invoice': 120,
  'create-dcnote': 130,
  'create-cash-memo': 140,
  'create-delivery-note': 150,
  'create-psorder': 160,
  'create-rejection-note': 170,
  'create-transfer-note': 180,
  'create-voucher': 190,
};

const CONFIGS = {
  global: 0,
  'workflow-left-pane-columns': 11,
  'page-layout': 121,
};

const GST_REG_TYPE = {
  unregistered: 0,
  consumer: 1,
  regular: 2,
  composition: 3,
};

// https://github.com/frappe/erpnext/issues/27880
const GST_PARTY_TYPE = {
  deemed_export: 0,
  sez: 1,
  overseas: 2,
  uin_holders: 3,
};

const PAYMENT_TYPE = {
  bank: 2,
  cash: 3,
  credit: 15,
};

/*
Debit Credit Note reasons
  01-Sales Return 
  02-Post Sale Discount 
  03-Deficiency in services 
  04-Correction in Invoice 
  05-Change in POS 
  06-Finalization of Provisional assessment 
  07-Others 

Common Reasons for which Debit Note is issued

By buyer, on purchase return
By buyer, on receiving damaged goods or short quantity.
By buyer, if he is overcharged or seller agrees to give discount.
By seller, if he by mistake undercharged the buyer.

Common Reasons for which Credit Note is issued

By seller, on sales return.
By seller, if he has overcharged.
By seller, if he has to give discount or a scheme benefit.
By buyer, if he by mistake undercharged the seller.

https://taxadda.com/meaning-of-debit-note-and-credit-note/
*/
const DR_CR_MODE = {
  discount: 4,
  returns: 18,
  service_deficiency: 10,
  inv_correction: 11,
  pos_change: 12,
  prov_assessment: 13,
  others: 14,
};

const USER_ROLES = {
  admin: -1,
  manager: 0,
  operator: 1,
  auditor: 2,
  godown_incharge: 3,
};

Object.freeze(PAGES);
Object.freeze(CONFIGS);
Object.freeze(GST_REG_TYPE);
Object.freeze(GST_PARTY_TYPE);
Object.freeze(DR_CR_MODE);
Object.freeze(PAYMENT_TYPE);
Object.freeze(USER_ROLES);

export {
  STATUS_CODES,
  PAGES,
  CONFIGS,
  GST_REG_TYPE,
  GST_PARTY_TYPE,
  DR_CR_MODE,
  PAYMENT_TYPE,
  USER_ROLES,
};
