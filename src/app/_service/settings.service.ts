import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  private showSettingsContent = true;

  setShowSettingsContent(value: boolean) {
    this.showSettingsContent = value;
  }

  getShowSettingsContent() {
    return this.showSettingsContent;
  }
}
