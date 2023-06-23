import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HomeWhatsappAccountWizardModalComponent } from './home-whatsapp-account-wizard-modal/home-whatsapp-account-wizard-modal.component';


@Component({
  selector: 'appdashboard-home-whatsapp-account-wizard',
  templateUrl: './home-whatsapp-account-wizard.component.html',
  styleUrls: ['./home-whatsapp-account-wizard.component.scss']
})
export class HomeWhatsappAccountWizardComponent implements OnInit, OnChanges {
   
  @Output() goToConnectWA = new EventEmitter();
  @Output() goToCreateChatbot = new EventEmitter();
  @Input() whatsAppIsConnected: boolean; 
  @Input() wadepartmentName: string; 
  @Input() chatbotConnectedWithWA: boolean; 
  constructor(
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges() {
    console.log('[HOME-WA-WIZARD] whatsAppIsConnected ', this.whatsAppIsConnected)
    console.log('[HOME-WA-WIZARD] wadepartmentName ', this.wadepartmentName)
    console.log('[HOME-WA-WIZARD] chatbotConnectedWithWA ', this.chatbotConnectedWithWA)
  }

  // background-color: rgba(0,0,0,.4);
  connectWatsapp() {
    const elemHomeMainContent = <HTMLElement>document.querySelector('.home-main-content');
    console.log('[HOME-WA-WIZARD] elemHomeMainContent ', elemHomeMainContent)
    const elemHomeMainContentHeight = elemHomeMainContent.offsetHeight;
    console.log('[HOME-WA-WIZARD] elemHomeMainContent Height', elemHomeMainContentHeight)
  }

  presentModalConnectWAfirstStep() {
    // this.goToConnectWA.emit()

    console.log('[HOME-WA-WIZARD] - presentModalConnectWAfirstStep ');
    const dialogRef = this.dialog.open(HomeWhatsappAccountWizardModalComponent, {
      width: '600px',
      data: {
        calledBy: 'step1'
      },
    })

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result:`, result);

      if (result === 'go-to-next-step') {
        this.goToConnectWA.emit()
      }
    });
  }

  presentModalCreateChatbotOnWaChannel() {
    console.log('[HOME-WA-WIZARD] - presentModalCreateChatbotOnWaChannel ');
    const dialogRef = this.dialog.open(HomeWhatsappAccountWizardModalComponent, {
      width: '600px',
      data: {
        calledBy: 'step2',
        waDeptName: this.wadepartmentName
      },
    })

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result:`, result);

      if (result === 'go-to-next-step') {
        this.goToCreateChatbot.emit()
      }
    });
  }

  
      

}
