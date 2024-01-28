import { Notify } from 'notiflix/build/notiflix-notify-aio';

function createPromise(position, delay) {
  const shouldResolve = Math.random() > 0.3;
  if (shouldResolve) {
    return new Promise((resolve, _reject) => {
      setTimeout(resolve, delay, { position, delay });
    });
  } else {
    return new Promise((_resolve, reject) => {
      setTimeout(reject, delay, { position, delay });
    })
  }
}

Notify.init({ useIcon: false });
const form = document.forms[0];
form.addEventListener("submit", (event) => {
  event.preventDefault();
  formElements = form.elements
  for (let position = 1, delay = +formElements.delay.value; position <= +formElements.amount.value;
    position++, delay += +formElements.step.value)
    createPromise(position, delay)
      .then(({ position, delay }) => {
        Notify.success(`✅ Fulfilled promise ${position} in ${delay}ms`)
      })
      .catch(({ position, delay }) => {
        Notify.failure(`❌ Rejected promise ${position} in ${delay}ms`)
      });
});