import {
  Component,
  signal,
  ViewChild,
  type ElementRef,
  type OnInit,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
interface IWatchState {
  breakLength: number;
  sessionLength: number;
  timeLeft: number;
  pauseTimer: boolean;
  viewMinutes: number;
  viewSeconds: number;
  disabledBtn: boolean;
  startBreak: boolean;
  playAudio: boolean;
  label: string;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected title = 'stop-watch';
  @ViewChild('beep') beep!: ElementRef<HTMLAudioElement>;

  state = signal<IWatchState>({
    breakLength: 300,
    sessionLength: 1500,
    timeLeft: 1500,
    pauseTimer: true,
    viewMinutes: 25,
    viewSeconds: 0,
    disabledBtn: false,
    startBreak: false,
    playAudio: false,
    label: 'Session',
  });

  intervalId: number | undefined = undefined;

  constructor() {}

  ngOnInit(): void {}

  playPauseTimer() {
    // console.log('This is timeLeft', this.state().timeLeft);
    // console.log('this is sessionLength', this.state().sessionLength);

    const { pauseTimer, disabledBtn } = this.state();
    // console.log('This is pauseTimer', pauseTimer);

    if (pauseTimer) {
      this.intervalId = setInterval(() => {
        this.state.update((prevState: IWatchState) => {
          const newTime = prevState.timeLeft - 1;
          // console.log({ newTime });

          if (newTime < 0) {
            const isSession = !prevState.startBreak;
            const nextTime = isSession
              ? this.state().breakLength
              : this.state().sessionLength;
            const label = isSession ? 'Break' : 'Session';

            const audio = this.beep.nativeElement;
            audio.play();
            audio.volume = 0.4;

            return {
              ...prevState,
              startBreak: isSession,
              timeLeft: nextTime,
              label,
            };
          }
          return { ...prevState, timeLeft: newTime };
        });
      }, 1000);
    } else {
      clearInterval(this.intervalId);
      this.state.update((prevState) => ({ ...prevState, disabledBtn: false }));
    }

    this.state.update((prevState) => {
      return {
        ...prevState,
        pauseTimer: !pauseTimer,
        disabledBtn: !disabledBtn,
      };
    });
  }

  showTime(timer: number) {
    const viewMinutes = Math.floor(timer / 60);
    const viewSeconds = timer % 60;

    return `${viewMinutes < 10 ? '0' : ''}${viewMinutes}:${
      viewSeconds < 10 ? '0' : ''
    }${viewSeconds}`;
  }

  showMinutes(timer: number) {
    const newMinutes = timer / 60;
    return `${newMinutes}`;
  }

  onReset() {
    clearInterval(this.intervalId);

    const audio = this.beep.nativeElement;
    audio.pause();
    audio.currentTime = 0;

    this.state.update((prevState) => ({
      ...prevState,
      breakLength: 300,
      sessionLength: 1500,

      pauseTimer: true,
      disabledBtn: false,
      startBreak: false,
      playAudio: false,
      timeLeft: 1500,
      label: 'Session',
    }));
  }

  decrementBreak() {
    this.state.update((prevState) => {
      if (prevState.breakLength > 61) {
        const newBreak = prevState.breakLength - 60;
        return {
          ...prevState,
          breakLength: newBreak,
        };
      } else {
        // console.log("Reached mininum break length");
        return { ...prevState };
      }
    });
  }

  incrementBreak() {
    this.state.update((prevState) => {
      if (prevState.breakLength < 3600) {
        const newBreak = prevState.breakLength + 60;

        return {
          ...prevState,
          breakLength: newBreak,
        };
      } else {
        // console.log("Reached max break length");
        return { ...prevState };
      }
    });
  }

  decrementSession() {
    if (this.state().sessionLength > 61) {
      const newSession = this.state().sessionLength - 60;

      this.state.update((prevState) => ({
        ...prevState,
        sessionLength: newSession,
        timeLeft: newSession,
      }));
    } else {
      // console.log("Reached mininum session length");
      this.state.update((prevState) => ({ ...prevState }));
    }
  }

  incrementSession() {
    if (this.state().sessionLength < 3600) {
      const newSession = this.state().sessionLength + 60;

      this.state.update((prevState) => ({
        ...prevState,
        sessionLength: newSession,
        timeLeft: newSession,
      }));
    } else {
      this.state.update((prevState) => ({ ...prevState }));
      // console.log("Reached mininum session length");
    }
  }
}
