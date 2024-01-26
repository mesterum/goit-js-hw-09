import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const fp = flatpickr("input#datetime-picker", {
  enableTime: true,
  time_24hr: true,
  defaultDate: new Date(),
  minuteIncrement: 1,
  enableSeconds: true,
  onOpen(selectedDates) {
    fp.setDate(new Date(Date.now() + 30_000));
  },
  onClose([selectedDate]) {
    if (selectedDate - Date.now() < 0) {
      Notify.failure("Please choose a date in the future")
      return
    }
    targetDate = selectedDate;
    enableStartButton()
    times = convertMs(targetDate - Date.now() + 1000);
    timeElements.forEach((element, index) => { element.textContent = addLeadingZero(times[index]) })
    // console.log(times)
    // console.log(convertMs(selectedDate - Date.now()))
    /* selectedDate.setTime(selectedDate.getTime() - Date.now() + selectedDate.getTimezoneOffset() * 60_000);
    console.log(
      flatpickr.formatDate(selectedDate, "d H i S")
    ); */
  },
})

function enableStartButton() {
  startButton.disabled = false
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    startButton.disabled = true
  }, Math.min(targetDate - Date.now(), 0xFFFFFFFF)); //0x17FFFFFFF
  // https://stackoverflow.com/questions/3468607/why-does-settimeout-break-for-large-millisecond-delay-values
  // https://stackoverflow.com/questions/16314750/settimeout-fires-immediately-if-the-delay-more-than-2147483648-milliseconds
  // https://www.npmjs.com/package/safe-timers
}

let targetDate, timer
const timeElements = ["days", "hours", "minutes", "seconds"]
  .map(element => document.querySelector(`[data-${element}]`))
const startButton = document.querySelector("[data-start]")
const stopButton = document.querySelector("[data-stop]")

startButton.disabled = true
stopButton.disabled = true

const timeMultipliers = [Number.MAX_VALUE, 24, 60, 60, 1000]
function convertMs(ms) {
  return timeMultipliers.reduceRight(({ acc, times }, multiplier, _index) => {
    const value = acc % multiplier
    return {
      acc: acc / multiplier | 0,
      times: [value, ...times]
    }
  }, { acc: ms, times: [] }).times
}

// https://www.youtube.com/watch?v=MCi6AZMkxcU
// https://gist.github.com/jakearchibald/cb03f15670817001b1157e62a076fe95
function animationInterval(endTime, callback, { ms = 1000, signal, lastCB = (aborted) => { } } = {}) {
  const start = document.timeline ? document.timeline.currentTime : performance.now();
  let lastTick = endTime - Date.now()
  const end = lastTick + start;
  let nextTick = lastTick / ms | 0;
  lastTick = nextTick + 1

  function frame(time) {
    if (nextTick < 0 && lastTick > 0) nextTick = 0;
    if (signal?.aborted || nextTick < 0) {
      lastCB(nextTick >= 0); return;
    }
    callback(lastTick - nextTick);
    if (lastTick = nextTick)
      scheduleFrame(time);
    else
      lastCB();
  }

  function scheduleFrame(time) {
    const remaining = end - time;
    nextTick = Math.round(remaining / ms) - 1;
    const targetNext = end - nextTick * ms;
    const delay = targetNext - performance.now();
    setTimeout(requestAnimationFrame, delay, frame);
  }

  setTimeout(requestAnimationFrame, end - nextTick * ms - performance.now(), frame);
}

let times = [0, 0, 0, 0]
let controller = new AbortController();
startButton.addEventListener("click", () => {
  if (timer) clearTimeout(timer)
  startButton.disabled = true
  stopButton.disabled = false
  fp.input.disabled = true
  if (controller.signal.aborted) controller = new AbortController();
  times = convertMs(targetDate - Date.now() + 1000);
  timeElements.forEach((element, index) => { element.textContent = addLeadingZero(times[index]) })
  animationInterval(targetDate, (ticks) => {
    for (let i = timeElements.length - 1; i >= 0 && ticks > 0; i--) {
      times[i] -= ticks;
      if (times[i] < 0) {
        ticks = ((times[i] + 1) / timeMultipliers[i] | 0) + 1;
        times[i] += ticks * timeMultipliers[i];
      } else ticks = 0;
      timeElements[i].textContent = addLeadingZero(times[i])
    }
  }, {
    lastCB(aborted) {
      fp.input.disabled = false
      stopButton.disabled = true
      // if (aborted) enableStartButton()
    }, signal: controller.signal
  })
})

stopButton.addEventListener("click", () => {
  controller.abort();
  enableStartButton()
  stopButton.disabled = true
})

function addLeadingZero(value) {
  return ("" + value).padStart(2, "0")
}