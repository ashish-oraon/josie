import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  Renderer2,
  SimpleChanges,
} from '@angular/core';
@Directive({
  standalone: true,
  selector: '[appHighlight]',
})
export class HighlightDirective implements OnChanges {
  @Input('appHighlight') searchTerm: string = 'yellow';
  currentMatchIndex: number = 0;

  localSearchString: string = '';

  matches: number[] = [];
  constructor(private el: ElementRef, private renderer: Renderer2) {
    console.log('consturcuter executed');
    this.appendElement();
  }
  ngOnChanges(changes: SimpleChanges): void {
    const { action } = changes;
    if (action) {
      action.currentValue === 'prev' ? this.goNext() : this.goPrev();
    }
    if (this.localSearchString.length > 3) {
      const content = this.el.nativeElement as HTMLElement;
      console.log(content);
      this.doHighlightIn(content);
    }
  }
  goPrev() {
    this.currentMatchIndex =
      ((this.currentMatchIndex || 0) - 1 + this.matches.length) %
      this.matches.length;
  }
  goNext() {
    this.currentMatchIndex =
      ((this.currentMatchIndex || 0) + 1) % this.matches.length;
  }

  doHighlightIn(contentDiv: HTMLElement) {
    const contentText = contentDiv?.textContent?.toLowerCase();
    if (contentText) {
      const replaceRegex = new RegExp(
        `<span style="background-color:${this.searchTerm}; font-weight:bold">([^<]+)</span>`,
        'g'
      );
      contentDiv.innerHTML = contentText.replace(replaceRegex, '$1');

      this.matches = [];
      if (this.localSearchString) {
        let match: number = contentText.indexOf(this.localSearchString);
        while (match !== -1) {
          this.matches.push(match);
          match = contentText.indexOf(
            this.localSearchString,
            match + this.localSearchString.length
          );
        }

        if (this.currentMatchIndex !== -1) {
          this.doHighlight(
            this.currentMatchIndex || 0,
            contentText,
            contentDiv
          );
        }
      }
    }
  }

  doHighlight(
    currentMatchIndex: number,
    contentText: string,
    contentDiv: HTMLElement
  ) {
    const highlightedContent = contentText.replace(
      new RegExp(this.localSearchString, 'gi'),
      (match: any, index: any) =>
        index === this.matches[currentMatchIndex]
          ? `<span style="background-color:${this.searchTerm}; font-weight:bold">${match}</span>`
          : match
    );
    contentDiv.innerHTML = highlightedContent;
  }

  private appendElement() {
    // Create the button element
    const searchContainer = this.renderer.createElement('div');
    this.renderer.addClass(searchContainer, 'search-container');
    const searchInput = this.renderer.createElement('input');
    console.log(searchInput);
    // searchInput.attributes.push('matInput');
    // console.log(searchInput);
    searchInput.setAttribute('matInput', '');
    searchInput.setAttribute('placeholder', 'Ex. Pizza');

    const searchButton = this.renderer.createElement('button');
    searchButton.innerHTML = 'Search';

    const nextButton = this.renderer.createElement('button');
    nextButton.innerHTML = 'Next';

    const prevButton = this.renderer.createElement('button');
    prevButton.innerHTML = 'Previous';

    this.renderer.appendChild(searchContainer, searchInput);
    this.renderer.appendChild(searchContainer, searchButton);
    this.renderer.appendChild(searchContainer, nextButton);
    this.renderer.appendChild(searchContainer, prevButton);

    // Add an event listener to the button
    this.renderer.listen(searchButton, 'click', () => {
      if (this.localSearchString.length > 3) {
        const content = this.el.nativeElement as HTMLElement;
        this.doHighlightIn(content);
      }
    });
    this.renderer.listen(nextButton, 'click', () => {
      if (this.localSearchString.length > 3) {
        this.goNext();
        const content = this.el.nativeElement as HTMLElement;
        this.doHighlightIn(content);
      }
    });
    this.renderer.listen(prevButton, 'click', () => {
      if (this.localSearchString.length > 3) {
        this.goPrev();
        const content = this.el.nativeElement as HTMLElement;
        this.doHighlightIn(content);
      }
    });

    this.renderer.listen(searchInput, 'input', () => {
      this.localSearchString = searchInput.value;
    });

    // Insert the button before the target div
    this.renderer.insertBefore(
      this.el.nativeElement.parentNode,
      searchContainer,
      this.el.nativeElement
    );
  }
}
