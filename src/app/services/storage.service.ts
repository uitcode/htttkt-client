import { Injectable } from '@angular/core';

export interface StorageInterface {
  // LOCAL STORAGE
  getLocalValue(key: string): string;
  setLocalValue(key: string, value: string): void;
  getLocalValueAsObject<T = any>(key: string): T | null;
  setLocalValueAsObject(key: string, value: any): void;
  removeLocal(key: string): void;
  removeLocalAll(key: string): void;

  // SESSION STORAGE
  getSessionValue(key: string): string;
  setSessionValue(key: string, value: string): void;
  getSessionValueAsObject<T = any>(key: string): T | null;
  setSessionValueAsObject(key: string, value: any): void;
  removeSession(key: string): void;
  removeSessionAll(key: string): void;
}

@Injectable({
  providedIn: 'root',
})
export class StorageService implements StorageInterface {
  local!: Storage;
  session!: Storage;

  constructor() {
    if (!window.sessionStorage && !window.localStorage) {
      console.error('Current browser does not support Storage API');
      return;
    }
    this.local = window.localStorage;
    this.session = window.sessionStorage;
  }

  // LOCAL STORAGE

  getLocalValue(key: string): string {
    return this.local.getItem(key) || '';
  }

  setLocalValue(key: string, value: string): void {
    this.local.setItem(key, value);
  }

  getLocalValueAsObject<T = any>(key: string): T | null {
    return JSON.parse(this.getLocalValue(key)) as T;
  }

  setLocalValueAsObject(key: string, value: any): void {
    this.setLocalValue(key, JSON.stringify(value));
  }

  removeLocal(key: string): void {
    this.local.removeItem(key);
  }

  removeLocalAll(): void {
    this.local.clear();
  }

  // SESSION STORAGE

  getSessionValue(key: string): string {
    return this.session.getItem(key) || '';
  }

  setSessionValue(key: string, value: string): void {
    this.session.setItem(key, value);
  }

  getSessionValueAsObject<T = any>(key: string): T | null {
    return JSON.parse(this.getSessionValue(key)) as T;
  }

  setSessionValueAsObject(key: string, value: any): void {
    this.setSessionValue(key, JSON.stringify(value));
  }

  removeSession(key: string): void {
    this.session.removeItem(key);
  }

  removeSessionAll(): void {
    this.session.clear();
  }
}
