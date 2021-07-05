import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private stockCode = new BehaviorSubject(null);


  stock = this.stockCode.asObservable();
  constructor() { }

  setStock(data) {
    this.stockCode.next(data);
  }
}
