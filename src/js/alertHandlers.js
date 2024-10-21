import Vue from 'vue';

function showAlert(title, message) {
  const vm = new Vue();
  vm.$bvToast.toast(message, {
    title,
    variant: 'danger',
  });
}

function handleHttpError(error, customMessage) {
  const { status } = error.response ?? {};
  let message = customMessage;
  if (!message) {
    if (status >= 400 && status < 500) {
      message = 'Client side error occurred, please try again later';
    } else if (status >= 500 && status < 600) {
      message = 'Server side error occurred, please try again later';
    } else {
      message = 'Some error occurred, please try again later';
    }
  }
  showAlert('Error', message);
}

export {  handleHttpError };
