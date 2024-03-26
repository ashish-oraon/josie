import { Component, OnDestroy } from '@angular/core';
import { CancelSubscriptions } from './cancel-subscription.decorator';

@Component({
  selector: 'lib-base',
  template: ``,
})
@CancelSubscriptions()
export class BaseComponent implements OnDestroy {
  constructor() {}
  ngOnDestroy() {}
}
