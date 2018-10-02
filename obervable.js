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
      if(this.unsub) {
          this.unsub();
      }
  }
}

class Observable {
  constructor(_subscribe) {
    this._subscribe = _subscribe;
  }
  subscribe(oberver) {
      const safeObervable = new SafeObervable(oberver);
      return this._subscribe(safeObervable);
  }
}

const myObervable = new Observable((oberver) => {
 const safeObervable = new SafeObervable(oberver);
 const dataSource = new DataSource();

 dataSource.onData = (e) => safeObervable.next(e);
 dataSource.onComplete = () => safeObervable.complete();
 dataSource.onError = () => safeObervable.error();

 safeObervable.unsub = () => {
     dataSource.destroy();
 }

 return safeObervable.unsubscribe.bind(safeObervable);
})

const unsub = myObervable.subscribe({
  next(x) { console.log(x); },
  error(err) { console.error(err); },
  complete() { console.log('done')}
})


