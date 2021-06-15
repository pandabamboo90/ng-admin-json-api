import { Directive, Input } from '@angular/core';
import { STComponent } from '@delon/abc/st';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: 'st:[hrztal-scroll]',
})
export class ScrollDirective {
  @Input()
  set scroll_xy(value: { y?: string, x?: string }) {
    if (!value) {
      value = { y: '768px', x: '768px' };
    }
    this.st.scroll = { ...value };
  }

  constructor(private st: STComponent) {
    this.st.scroll = { y: '768px', x: '768px' };
  }

}
