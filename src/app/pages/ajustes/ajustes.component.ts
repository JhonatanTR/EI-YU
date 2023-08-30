import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SettingsService } from 'src/app/_service/settings.service';

@Component({
  selector: 'app-ajustes',
  templateUrl: './ajustes.component.html',
  styleUrls: ['./ajustes.component.css']
})
export class AjustesComponent implements OnInit {

  constructor(
    private router: Router,
    private settingsService: SettingsService
  ) {
  }

  ngOnInit(): void {
  }
  get showSettingsContent() {
    return this.settingsService.getShowSettingsContent();
  }

  changePassword() {
    this.router.navigate(['/ajustes/change-password']);
    this.settingsService.setShowSettingsContent(false);
  }
}
