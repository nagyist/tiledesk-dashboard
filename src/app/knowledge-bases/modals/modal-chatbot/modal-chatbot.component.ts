import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { AppConfigService } from 'app/services/app-config.service';
import { DepartmentService } from 'app/services/department.service';
import { FaqService } from 'app/services/faq.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { UploadImageNativeService } from 'app/services/upload-image-native.service';
import { UploadImageService } from 'app/services/upload-image.service';

@Component({
  selector: 'appdashboard-modal-chatbot',
  templateUrl: './modal-chatbot.component.html',
  styleUrls: ['./modal-chatbot.component.scss']
})
export class ModalChatbotComponent implements OnInit {
  HAS_CREATED_CB: boolean = false;
  chatbotName: string;
  exportedChatbot: any;

  importedChatbot: any

  id_faq_kb: string;

  showSpinnerInUploadImageBtn = false;
  botProfileImageurl: string;
  timeStamp: any;
  storageBucket: string;
  baseUrl: string;
  botProfileImageExist: boolean = false
  botImageHasBeenUploaded = false;
  UPLOAD_ENGINE_IS_FIREBASE: boolean

  // Hook bot to dept
  dept_id: string;
  depts_length: any
  depts_without_bot_array = [];


  @ViewChild('fileInputBotProfileImage', { static: false }) fileInputBotProfileImage: any;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModalChatbotComponent>,
    private uploadImageService: UploadImageService,
    private uploadImageNativeService: UploadImageNativeService,
    public appConfigService: AppConfigService,
    private logger: LoggerService,
    public faqService: FaqService,
    private departmentService: DepartmentService,
    private sanitizer: DomSanitizer
  ) {
    console.log('[MODAL-CHATBOT] data ', data)
    if (data && data.chatbot) {
      this.exportedChatbot = data.chatbot

    }
  }

  ngOnInit(): void {
    // if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
    //   this.checkBotImageExistOnFirebase();
    // } else {
    //   this.checkBotImageExistOnNative();
    // }

    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      // this.checkBotImageExistOnFirebase();
      const firebase_conf = this.appConfigService.getConfig().firebase;
      this.UPLOAD_ENGINE_IS_FIREBASE = true;
      this.storageBucket = firebase_conf['storageBucket'];
      // this.setImageProfileUrl(this.storageBucket)
    } else {
     this.baseUrl = this.appConfigService.getConfig().SERVER_BASE_URL;
     this.UPLOAD_ENGINE_IS_FIREBASE = false;
      // this.setImageProfileUrl_Native(baseUrl);
    }
  }

  importChatbotFromJSON(editedChatbot) {
    console.log('[MODAL-CHATBOT] - IMPORT CHATBOT FROM JSON editedChatbot ', editedChatbot)
    this.faqService.importChatbotFromJSONFromScratch(editedChatbot).subscribe((faqkb: any) => {
      console.log('[MODAL-CHATBOT] - IMPORT CHATBOT FROM JSON - ', faqkb)
      if (faqkb) {
        this.importedChatbot = faqkb
        this.id_faq_kb = faqkb._id
        // this.getChatbotUsingNamespace(this.selectedNamespace.id)

        // this.getDeptsByProjectId(faqkb)
        // goToCDSVersion(this.router, faqkb, this.project._id, this.appConfigService.getConfig().cdsBaseUrl)

      }

    }, (error) => {
      console.error('[MODAL-CHATBOT] -  IMPORT CHATBOT FROM JSON- ERROR', error);
    }, () => {
      console.log('[MODAL-CHATBOT] - IMPORT CHATBOT FROM JSON - COMPLETE');
      this.HAS_CREATED_CB = true;
      // this.presentDialogChatbotSuccessfullyCreated()

    });
  }


  onChangeChatbotName(event) {
    console.log('[MODAL-CHATBOT] ON CHANGE CHATBOT NAME event', event)
    this.exportedChatbot.name = event
  }

  // ---------------------------------------------------
  // Upload bot photo
  // ---------------------------------------------------
  upload(event) {
    this.botProfileImageExist = false
    console.log('[MODAL-CHATBOT] BOT PROFILE IMAGE (FAQ-COMP) upload')
    this.showSpinnerInUploadImageBtn = true;
    const file = event.target.files[0]

    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.uploadImageService.uploadBotAvatar(file, this.id_faq_kb);
      this.botProfileImageExist = true
      this.showSpinnerInUploadImageBtn = false;
    } else {

      // Native upload
      console.log('[MODAL-CHATBOT] BOT PROFILE IMAGE upload with native service file ', file)

      this.uploadImageNativeService.uploadBotPhotoProfile_Native(file, this.id_faq_kb).subscribe((downoloadurl) => {
        console.log('[MODAL-CHATBOT] BOT PROFILE IMAGE (FAQ-COMP) upload with native service - RES downoloadurl', downoloadurl);

        this.botProfileImageurl = downoloadurl
        this.botProfileImageExist = true
        this.showSpinnerInUploadImageBtn = false;
        // this.timeStamp = (new Date()).getTime();
      }, (error) => {

        console.error('[MODAL-CHATBOT] BOT PROFILE IMAGE (FAQ-COMP) upload with native service - ERR ', error);
      })

    }
    this.fileInputBotProfileImage.nativeElement.value = '';

    // if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
    //   // this.checkBotImageExistOnFirebase();
    //   const firebase_conf = this.appConfigService.getConfig().firebase;
    //   this.storageBucket = firebase_conf['storageBucket'];
    //   this.setImageProfileUrl(this.storageBucket)
    // } else {
    //   const baseUrl = this.appConfigService.getConfig().SERVER_BASE_URL;
    //   this.setImageProfileUrl_Native(baseUrl);
    // }
  }


   // ---------------------------------------------------
  // Delete bot photo
  // ---------------------------------------------------
  deleteBotProfileImage() {
    // const file = event.target.files[0]
    console.log('[FAQ-COMP] BOT PROFILE IMAGE (FAQ-COMP) deleteBotProfileImage')

    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.uploadImageService.deleteBotProfileImage(this.id_faq_kb);
    } else {
      this.logger.log('[FAQ-COMP] BOT PROFILE IMAGE (FAQ-COMP) deleteUserProfileImage with native service')
      this.uploadImageNativeService.deletePhotoProfile_Native(this.id_faq_kb, 'bot')
    }
    this.botProfileImageExist = false;
    this.botImageHasBeenUploaded = false;

    const delete_bot_image_btn = <HTMLElement>document.querySelector('.delete_bot_image_btn');
    delete_bot_image_btn.blur();
  }
  


// checkBotImageExistOnFirebase() {
//   this.logger.log('[FAQ-COMP] checkBotImageExistOnFirebase (FAQ-COMP) ')
//   this.logger.log('[FAQ-COMP] STORAGE-BUCKET (FAQ-COMP) firebase_conf ', this.appConfigService.getConfig().firebase)

//   const firebase_conf = this.appConfigService.getConfig().firebase;
//   if (firebase_conf) {
//     this.storageBucket = firebase_conf['storageBucket'];
//     this.logger.log('[FAQ-COMP] STORAGE-BUCKET (FAQ-COMP) ', this.storageBucket)
//   }

//   const imageUrl = 'https://firebasestorage.googleapis.com/v0/b/' + this.storageBucket + '/o/profiles%2F' + this.id_faq_kb + '%2Fphoto.jpg?alt=media';

//   const self = this;
//   this.verifyImageURL(imageUrl, function (imageExists) {

//     if (imageExists === true) {
//       self.botProfileImageExist = imageExists
//       self.logger.log('[FAQ-COMP] BOT PROFILE IMAGE (FAQ-COMP) - BOT PROFILE IMAGE EXIST ? ', imageExists, 'usecase firebase')
//       self.setImageProfileUrl(self.storageBucket);
//     } else {
//       self.botProfileImageExist = imageExists
//       self.logger.log('[FAQ-COMP] BOT PROFILE IMAGE (FAQ-COMP) - BOT PROFILE IMAGE EXIST ? ', imageExists, 'usecase firebase')
//     }
//   })
// }


// checkBotImageExistOnNative() {
//   const baseUrl = this.appConfigService.getConfig().SERVER_BASE_URL;
//   if (this.id_faq_kb) {
//   const imageUrl = baseUrl + 'images?path=uploads%2Fusers%2F' + this.id_faq_kb + '%2Fimages%2Fthumbnails_200_200-photo.jpg';
//   const self = this;
//   this.verifyImageURL(imageUrl, (imageExists) => {

//     if (imageExists === true) {
//       self.botProfileImageExist = imageExists
//      console.log('[FAQ-COMP] BOT PROFILE IMAGE (FAQ-COMP) - BOT PROFILE IMAGE EXIST ? ', imageExists, 'usecase native')

//       self.setImageProfileUrl_Native(baseUrl)

//     } else {
//       self.botProfileImageExist = imageExists
//       console.log('[FAQ-COMP] BOT PROFILE IMAGE (FAQ-COMP) - BOT PROFILE IMAGE EXIST ? ', imageExists, 'usecase native')
//     }
//   })
// } else {
//   .botProfileImageExist = false
// }
// }


// verifyImageURL(image_url, callBack) {
//   const img = new Image();
//   img.src = image_url;
//   img.onload = function () {
//     callBack(true);
//   };
//   img.onerror = function () {
//     callBack(false);
//   };
// }




// setImageProfileUrl(storageBucket) {
//   this.botProfileImageurl = 'https://firebasestorage.googleapis.com/v0/b/' + storageBucket + '/o/profiles%2F' + this.id_faq_kb + '%2Fphoto.jpg?alt=media';

//   this.timeStamp = (new Date()).getTime();
// }

// setImageProfileUrl_Native(storage) {
//   this.botProfileImageurl = storage + 'images?path=uploads%2Fusers%2F' + this.id_faq_kb + '%2Fimages%2Fthumbnails_200_200-photo.jpg';
//   console.log('PROFILE IMAGE (USER-PROFILE ) - botProfileImageurl ', this.botProfileImageurl);
//   this.timeStamp = (new Date()).getTime();
// }

// getBotProfileImage() {
//   if (this.timeStamp) {
//     return this.sanitizer.bypassSecurityTrustUrl(this.botProfileImageurl + '&' + this.timeStamp);
//   }
//   return this.sanitizer.bypassSecurityTrustUrl(this.botProfileImageurl)
// }


onOkPresssed(chatbot) {
  // console.log('[MODAL-CHATBOT-NAME] chatbot ', this.exportedChatbot)
  // this.dialogRef.close(this.exportedChatbot);

  if (this.exportedChatbot) {
    this.importChatbotFromJSON(this.exportedChatbot)
  }
}

onFinishPresssed() {
  this.dialogRef.close(this.importedChatbot)
}

onNoClick(): void {
  this.dialogRef.close();
}

}
