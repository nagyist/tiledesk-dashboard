import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {
  private scrollPosition: number = 0;

  setScrollPosition(position: number): void {
    console.log('[Scroll-Service] setScrollPosition') 
    this.scrollPosition = position;
    console.log('[Scroll-Service] setScrollPosition scrollPosition',  this.scrollPosition) 
  }

  getScrollPosition(): number {
    console.log('[Scroll-Service] getScrollPosition scrollPosition',  this.scrollPosition) 
    return this.scrollPosition;
  }

  constructor() { }
}
