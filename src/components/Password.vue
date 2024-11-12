<template>
  <b-form-group
    :state="isPasswordValid"
    :invalid-feedback="passwordFeedback"
    :valid-feedback="passwordFeedback"
  >
    <b-input-group>
      <b-form-input
        :size="size"
        :type="field.type"
        v-model.lazy="userPassword"
        :state="isPasswordValid"
        required
        aria-label="Password input"
        :placeholder="placeholder"
      />
      <b-input-group-append>
        <b-button
          @click="toggleVisibility"
          :size="size"
          class="ml-1"
          variant="light"
        >
          <b-icon :icon="field.icon" />
        </b-button>
      </b-input-group-append>
    </b-input-group>
  </b-form-group>
</template>

<script>
import { passwordStrength } from 'check-password-strength';
// import sha512 from 'crypto-js/sha512';

export default {
  name: 'Password',
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    size: String,
    passwordHint: {
      type: Boolean,
      required: false,
      default: true,
    },
    placeholder: {
      type: String,
      required: false,
    },
  },
  data() {
    return {
      userPassword: '',
      field: {
        type: 'password',
        icon: 'eye-fill',
      },
      pwdFieldTypes: ['lowercase', 'uppercase', 'symbol', 'number'],
    };
  },
  methods: {
    toggleVisibility() {
      if (this.field.type === 'password') {
        this.field.type = 'text';
        this.field.icon = 'eye-slash-fill';
      } else {
        this.field.type = 'password';
        this.field.icon = 'eye-fill';
      }
    },
    getPasswordHint(pwdStrength) {
      if (this.passwordHint) {
        const available = pwdStrength.contains.map((item) => item.message);
        let hint = this.pwdFieldTypes
          .filter((item) => !available.includes(item))
          .reduce((prev, cur) => {
            return `${prev} ${cur},`;
          }, '');
        hint = hint.substring(0, hint.length - 1);
        if (available.length < 4) {
          hint = `Recommended atleast 1 ${hint}`;
        }
        if (pwdStrength.length < 8) {
          hint += ' & minimum 8 characters long';
        }
        return hint;
      }
    },
  },
  computed: {
    pwdStrength: (self) =>
      self.userPassword !== '' &&
      self.userPassword !== null &&
      self.passwordHint
        ? passwordStrength(self.userPassword)
        : { value: 'Empty' },

    allFieldsValid: (self) =>
      !self.isPasswordValid && !self.arePasswordsSame && self.passwordHint,
    isPasswordValid: (self) =>
      self.pwdStrength.value === 'Empty'
        ? null
        : self.pwdStrength.value === 'Strong',
    passwordFeedback() {
      let text = '';
      if (this.userPassword) {
        switch (this.pwdStrength.value) {
        case 'Strong':
          text = 'Your Password is Strong!';
          break;
        default:
          text = this.getPasswordHint(this.pwdStrength);
          break;
        }
        // v-model will emit hashed password digest
        this.$emit('change', this.hashedPassword(this.userPassword));
      }
      return text;
    },
  },
};
</script>
