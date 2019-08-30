import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'appdashboard-hours-static',
  templateUrl: './hours-static.component.html',
  styleUrls: ['./hours-static.component.scss']
})
export class HoursStaticComponent implements OnInit {
  projectId: string;
  constructor(
    private router: Router,
    public auth: AuthService
  ) { }

  ngOnInit() {
    this.getCurrentProject();
  }


  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      console.log('!!! ANALYTICS STATIC - project ', project)

      if (project) {
        this.projectId = project._id
      }
    });
  }

  goToPricing() {
    console.log('goToPricing projectId ', this.projectId);
    this.router.navigate(['project/' + this.projectId + '/pricing']);
  }

}
