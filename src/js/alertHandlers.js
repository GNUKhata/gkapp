import Vue from 'vue';
import { STATUS_CODES } from '@/js/enum';

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

function handleCustomError(statusCode, error) {
  let title = 'Error';
  let message;

  // Check for GNUKhata specific status codes.
  // If status code is invalid, show alert for the same.
  // If error is an object, iterate and show alert for each property.
  // If error is a string, use that as message body for alert.
  // If error is not provided, show status name as the error.
  const status = Object.entries(STATUS_CODES).find((_status) => (
    statusCode === _status[1]
  ))?.[0];
  if (!status) {
    message = 'Invalid status code received from server';
  } else if (status === 'ValidationError' && error) {
    error.forEach((err) => {
      title = status;
      message = `${err.loc.join('.')}: ${err.msg}`;
      showAlert(status, message);
    });
    return;
  } else if (error?.constructor === Object) {
    for (let err in error) {
      title = status;
      message = `${err}: ${error[err]}`;
      showAlert(status, message);
    }
    return;
  } else if (typeof(error) === 'string') {
    title = status;
    message = error;
  } else {
    message = status;
  }

  showAlert(title, message);
}

export { handleCustomError, handleHttpError };
