export function CancelSubscriptions() {
  return function (constructor: any) {
    const orig = constructor.prototype.ngOnDestroy;
    constructor.prototype.ngOnDestroy = function () {
      if (this.cancellableSubscriptions) {
        for (const prop in this.cancellableSubscriptions) {
          if (this.cancellableSubscriptions.hasOwnProperty(prop)) {
            const currentSubject = this.cancellableSubscriptions[prop];
            currentSubject.unsubscribe();
          }
        }
      }
      orig.apply();
    };
  };
}
