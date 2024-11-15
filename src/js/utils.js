function numberToWords(number) {
  // https://stackoverflow.com/questions/5529934/javascript-numbers-to-words/46221860#46221860
  var NS = [
    { value: 10000000, str: 'Crore' },
    { value: 100000, str: 'Lakh' },
    { value: 1000, str: 'Thousand' },
    { value: 100, str: 'Hundred' },
    { value: 90, str: 'Ninety' },
    { value: 80, str: 'Eighty' },
    { value: 70, str: 'Seventy' },
    { value: 60, str: 'Sixty' },
    { value: 50, str: 'Fifty' },
    { value: 40, str: 'Forty' },
    { value: 30, str: 'Thirty' },
    { value: 20, str: 'Twenty' },
    { value: 19, str: 'Nineteen' },
    { value: 18, str: 'Eighteen' },
    { value: 17, str: 'Seventeen' },
    { value: 16, str: 'Sixteen' },
    { value: 15, str: 'Fifteen' },
    { value: 14, str: 'Fourteen' },
    { value: 13, str: 'Thirteen' },
    { value: 12, str: 'Twelve' },
    { value: 11, str: 'Eleven' },
    { value: 10, str: 'Ten' },
    { value: 9, str: 'Nine' },
    { value: 8, str: 'Eight' },
    { value: 7, str: 'Seven' },
    { value: 6, str: 'Six' },
    { value: 5, str: 'Five' },
    { value: 4, str: 'Four' },
    { value: 3, str: 'Three' },
    { value: 2, str: 'Two' },
    { value: 1, str: 'One' },
  ];

  var result = '';
  for (var n of NS) {
    if (number >= n.value) {
      if (number <= 99) {
        result += n.str;
        number -= n.value;
        if (number > 0) result += ' ';
      } else {
        var t = Math.floor(number / n.value);
        var d = number % n.value;
        if (d > 0) {
          return numberToWords(t) + ' ' + n.str + ' ' + numberToWords(d);
        } else {
          return numberToWords(t) + ' ' + n.str;
        }
      }
    }
  }
  return result;
}

function numberToRupees(number) {
  let text = numberToWords(number) + ' Rupees';
  let paise = Math.round((number * 100) % 100);
  if (paise > 0) {
    text += ' ' + numberToWords(paise) + ' Paise Only';
  } else {
    text += ' Only';
  }
  return text;
}

/**
 * reverseDate
 * @param {*} date
 *
 * Description: Given a date in yyyy-mm-dd or dd-mm-yyyy format,
 * returns a reversed string
 */
function reverseDate(date) {
  return date
    .split('-')
    .reverse()
    .join('-');
}

/**
 * formatDateObj
 * @param {*} date
 *
 * Description: Converts a js Date object, into yyyy-mm-dd string
 */
function formatDateObj(date) {
  let month = date.getMonth() + 1;
  month = month > 9 ? month : '0' + month;
  let day = date.getDate();
  day = day > 9 ? day : '0' + day;
  return `${date.getFullYear()}-${month}-${day}`;
}

function debounceEvent(target, event, handler, interval) {
  target.addEventListener(
    event,
    (function() {
      let timeout;
      return function() {
        clearTimeout(timeout);
        timeout = setTimeout(handler, interval);
      };
    })()
  );
}

function debounce(callback, interval, ctxt, args) {
  let timeout;
  return function() {
    clearTimeout(timeout);
    timeout = setTimeout(callback.bind(ctxt, args), interval);
  };
}

/*
 * Image Handling methods
 */
function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

export {
  numberToWords,
  numberToRupees,
  reverseDate,
  formatDateObj,
  debounceEvent,
  debounce,
  getBase64,
};
