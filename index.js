console.clear();

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
      this.destroy()
    }
  }

  destroy() {
    clearInterval(this._id);
  }
}

function myObservable(observer) {
  const dataSource = new DataSource();
  dataSource.onData = (e) => observer.next(e);
  dataSource.onError = () => observer.error('error');
  dataSource.onComplete = () => observer.complete();

  return () => {
    dataSource.destroy();
  };
}

const unsub = myObservable({
    next(x) { console.log(x); },
    error(err) { console.error(err); },
    complete() { console.log('done')}
});

setTimeout(unsub, 6000);

  
