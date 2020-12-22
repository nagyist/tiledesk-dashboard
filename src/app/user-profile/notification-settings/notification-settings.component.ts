import { NotifyService } from './../../core/notify.service';
import { TranslateService } from '@ngx-translate/core';
import { UsersService } from './../../services/users.service';
import { NotificationService } from './../../services/notification.service';
import { ProjectService } from './../../services/project.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from './../../core/auth.service';
import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'appdashboard-notification-settings',
  templateUrl: './notification-settings.component.html',
  styleUrls: ['./notification-settings.component.scss']
})
export class NotificationSettingsComponent implements OnInit {

  userId: string;
  projectId: string;
  projects_length: number;
  translateparam: any;
  assigned_conv_on: boolean;
  unassigned_conv_on: boolean;
  project_user_id: string;
  showSpinner: boolean = true;

  updateSuccessMsg: string;
  updateErrorMsg: string;

  constructor(private _location: Location,
    private auth: AuthService,
    private router: Router,
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private usersService: UsersService,
    private translate: TranslateService,
    private notify: NotifyService) { }

  ngOnInit() {
    this.getUserIdFromRouteParams();
    this.getCurrentProject();
    this.getProjects();
    this.translateNotificationMsgs();
  }

  ngAfterViewInit() {
    this.checkCurrentStatus();
  }

  /**
   * GET PROJECTS   
   */
  getProjects() {
    this.projectService.getProjects().subscribe((projects: any) => {
      console.log('ACCOUNT_SETTINGS - GET PROJECTS ', projects);

      if (projects) {
        this.projects_length = projects.length;
        console.log('ACCOUNT_SETTINGS - GET PROJECTS - LENGTH ', this.projects_length);

        this.translateparam = { projects_length: this.projects_length };
      }
    }, error => {

      console.log('ACCOUNT_SETTINGS - GET PROJECTS - ERROR ', error)
    }, () => {
      console.log('ACCOUNT_SETTINGS - GET PROJECTS - COMPLETE')
    });
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {

      if (project) {
        console.log('ACCOUNT_SETTINGS - project from AUTH-SERV subscr ', project)
        this.projectId = project._id;

      } else {
        console.log('ACCOUNT_SETTINGS - project from AUTH-SERV subscr ? ', project)

        this.hideSidebar();
      }
    });
  }

  // hides the sidebar if the user is in the CHANGE PSW PAGE but has not yet selected a project
  hideSidebar() {
    const elemAppSidebar = <HTMLElement>document.querySelector('app-sidebar');
    console.log('ACCOUNT_SETTINGS  elemAppSidebar ', elemAppSidebar)
    elemAppSidebar.setAttribute('style', 'display:none;');

    const elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
    console.log('ACCOUNT_SETTINGS  elemMainPanel ', elemMainPanel)
    elemMainPanel.setAttribute('style', 'width:100% !important; overflow-x: hidden !important;');
  }

  getUserIdFromRouteParams() {
    this.userId = this.route.snapshot.params['userid'];
    console.log('ACCOUNT_SETTINGS - USER ID ', this.userId)
  }

  checkCurrentStatus() {
    this.usersService.project_user_id_bs.subscribe((project_user_id) => {

      console.log("################ CHECK NOTIFICATION checkCurrentStatus: ", project_user_id);
      this.notificationService.checkNotificationsStatus(project_user_id).subscribe((result: any) => {
        console.log("################ CHECK NOTIFICATION STATUS RESULT: ", result);

        if (result.settings) {

          if (result.settings.email.notification.conversation.assigned) {

            if (result.settings.email.notification.conversation.assigned.toyou === true) {
              this.assigned_conv_on = true;
              this.showSpinner = false;
            } else {
              this.assigned_conv_on = false;
              this.showSpinner = false;
            }
          } else {
            this.assigned_conv_on = true;
            this.showSpinner = false;
          }

          if (result.settings.email.notification.conversation.pooled === true) {
            this.unassigned_conv_on = true;
            this.showSpinner = false;
          } else {
            this.unassigned_conv_on = false;
            this.showSpinner = false;
          }

        }  else {
          this.assigned_conv_on = true;
          this.unassigned_conv_on = true;
          this.showSpinner = false;
        }

      })
    })
  }

  translateNotificationMsgs() {
    this.translate.get('NotificationSettings.NotificationMsgs').subscribe((translation: any) => {
      console.log('NOTIFICATION SETTINGS tranlsateNotificationMsgs text', translation)
      this.updateSuccessMsg = translation.UpdateSuccess;
      this.updateErrorMsg = translation.UpdateError;
    });
  }

  // TOGGLE ACTION
  toggleAssignedConversation($event) {
    console.log("Event Toggle Assigned: ", $event.target.checked);
    this.assigned_conv_on = $event.target.checked;
    this.notificationService.enableDisableAssignedNotification(this.assigned_conv_on).then((result) => {
      console.log("ASSIGNED NOTIFICATION RESULT: ", result)
      this.notify.showWidgetStyleUpdateNotification(this.updateSuccessMsg, 2, 'done')
    }).catch((err) => {
      console.log("Error during preferences updating: ", err)
      this.notify.showWidgetStyleUpdateNotification(this.updateErrorMsg, 4, 'report_problem')
    })
  }

  toggleUnassignedConversation($event) {
    console.log("Event Toggle Unassigned: ", $event.target.checked);
    this.unassigned_conv_on = $event.target.checked;
    this.notificationService.enableDisableUnassignedNotification(this.unassigned_conv_on).then((result) => {
      console.log("UNASSIGNED NOTIFICATION RESULT: ", result)
      this.notify.showWidgetStyleUpdateNotification(this.updateSuccessMsg, 2, 'done')
    }).catch((err) => {
      console.log("Error during preferences updating: ", err)
      this.notify.showWidgetStyleUpdateNotification(this.updateErrorMsg, 4, 'report_problem')
    })
  }
  // TOGGLE ACTION - END

  // GO TO
  goBack() {
    this._location.back();
  }

  goToChangePsw() {
    console.log('»» GO TO CHANGE PSW - PROJECT ID ', this.projectId)
    if (this.projectId === undefined) {
      this.router.navigate(['user/' + this.userId + '/password/change']);
    } else {
      this.router.navigate(['project/' + this.projectId + '/user/' + this.userId + '/password/change']);
    }
  }

  goToAccountSettings() {
    console.log('»» GO TO USER  PROFILE SETTINGS - PROJECT ID ', this.projectId)
    if (this.projectId === undefined) {
      this.router.navigate(['user/' + this.userId + '/settings']);
    } else {
      this.router.navigate(['project/' + this.projectId + '/user/' + this.userId + '/settings']);
    }
  }

  goToUserProfile() {
    console.log('»» GO TO USER PROFILE  - PROJECT ID ', this.projectId)
    if (this.projectId === undefined) {
      this.router.navigate(['user-profile']);
    } else {
      this.router.navigate(['project/' + this.projectId + '/user-profile']);
    }
  }
  // GO TO - END


}
