import { useEffect, useState, useRef } from "react";
import { interval, Subject, fromEvent } from "rxjs";
import {
  startWith,
  takeWhile,
  buffer,
  filter,
  debounceTime,
} from "rxjs/operators";
import "./App.css";

let observable$ = interval(10).pipe(startWith(0));

function App() {
  const [timer, setTimer] = useState(0);
  const [timerOn, setTimerOn] = useState(false);
  const [resetOn, setResetOn] = useState(true);

  const action$ = new Subject();

  action$.subscribe((v) => {
    switch (v) {
      case "start":
        setTimerOn((state) => !state);
        break;
      case "stop":
        setTimerOn((state) => !state);
        setTimer(0);
        break;
      case "wait":
        setTimerOn(false);
        break;
      case "resetOn":
        setResetOn(false);
        setTimerOn(true);
        setTimer(0);
        break;
      case "resetOff":
        setResetOn(true);
        setTimerOn(true);
        setTimer(0);
        break;
    }
  });

  useEffect(() => {
    let sub = observable$
      .pipe(takeWhile(() => timerOn))
      .subscribe((value) => setTimer(timer + value * 10));

    return () => sub.unsubscribe();
  }, [timerOn, resetOn]);

  const waitBtnRef = useRef(null);

  const clicks$ = fromEvent(document.getElementById("root"), "click");
  clicks$
    .pipe(
      buffer(clicks$.pipe(debounceTime(300))),
      filter((clickArray) => clickArray.length === 2)
    )
    .subscribe(() => action$.next("wait"));

  const startBtn = (
    <button className="start-btn btn" onClick={() => action$.next("start")}>
      Start
    </button>
  );
  const stopBtn = (
    <button className="stop-btn btn" onClick={() => action$.next("stop")}>
      Stop
    </button>
  );
  const waitBtn = (
    <button id="root" className="wait-btn btn" ref={waitBtnRef}>
      Wait
    </button>
  );
  const resetBtn = (
    <button
      className="reset-btn btn"
      onClick={() =>
        resetOn ? action$.next("resetOn") : action$.next("resetOff")
      }
    >
      Reset
    </button>
  );

  return (
    <div className="App">
      <div className="timer">
        <div className="timer-items">
          <span>{("0" + Math.floor((timer / 60000) % 60)).slice(-2)}:</span>
          <span>{("0" + Math.floor((timer / 1000) % 60)).slice(-2)}:</span>
          <span>{("0" + ((timer / 10) % 100)).slice(-2)}</span>
        </div>
      </div>
      <div className="btns">
        {!timerOn && startBtn}
        {timerOn && stopBtn}
        {(timerOn || !!timer) && waitBtn}
        {(timerOn || !!timer) && resetBtn}
      </div>
    </div>
  );
}

export default App;
