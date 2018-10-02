class DataSource {
  constructor() {
    let i = 0;
    this._id = setInterval(() => this.emit(i++), 1000);
  }

  emit(n) {
    let limit = 10;
    if (this.onData) {
      this.onData(n);
    }

    if (n === limit) {
      if (this.onComplete) {
        this.onComplete();
      }
    }
  }
  destroy() {
    clearInterval(this._id);
  }
}

class SafeObervable {
  constructor(destination) {
    this.destination = destination;
  }

  next(value) {
    if (!this.isUnsubscribed && this.destination.next) {
      try {
        this.destination.next(value);
      } catch (error) {
        this.unsubscribe();
        throw error;
      }
    }
  }

  error() {
    if (!this.isUnsubscribed && this.destination.error) {
      try {
        this.destination.error();
      } catch (error) {
        this.unsubscribe();
        throw error;
      }
      this.unsubscribe();
    }
  }

  complete() {
    if (!this.isUnsubscribed && this.destination.complete) {
      try {
        this.destination.complete();
      } catch (error) {
        this.unsubscribe();
        throw error;
      }
      this.unsubscribe();
    }
  }

  unsubscribe() {
    this.isUnsubscribed = true;
    if (this.unsub) {
      this.unsub();
    }
  }
}

class Observable {
  constructor(_subscribe) {
    this._subscribe = _subscribe;
  }
  subscribe(observer) {
    const safeObserver = new SafeObervable(observer);
    safeObserver.unsub = this._subscribe(safeObserver);
    return safeObserver.unsubscribe.bind(safeObserver);
  }
}

function map(project) {
  return source =>
    new Observable(observer => {
      const mapObserver = {
        next: x => observer.next(project(x)),
        error: err => observer.error(err),
        complete: () => observer.complete()
      };
      return source.subscribe(mapObserver);
    });
}

/**
 * pipe helper
 */
function pipe(initialValue, ...fns) {
  return fns.reduce((state, fn) => fn(state), initialValue);
}

const myObservable = new Observable(oberver => {
  const dataSource = new DataSource();
  dataSource.onData = e => oberver.next(e);
  dataSource.onComplete = () => oberver.complete();
  dataSource.onError = () => oberver.error();

  return () => dataSource.destroy();
});

const unsub = pipe(
  myObservable,
  map(x => x + x),
  map(x => x + "!")
).subscribe({
  next(x) {
    console.log(x);
  },
  error(err) {
    console.error(err);
  },
  complete() {
    console.log("done");
  }
});
