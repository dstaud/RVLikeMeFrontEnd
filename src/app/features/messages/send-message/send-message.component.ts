import { Component, OnInit, ViewChild, ElementRef, IterableDiffers } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, FormGroupDirective } from '@angular/forms';
import { Location } from '@angular/common';

import { Observable, throwError } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { AuthenticationService } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { MessagesService, Iconversation, Imessage } from '@services/data-services/messages.service';
import { ShareDataService, ImessageShareData, ImyStory } from '@services/share-data.service';
import { NewMessageCountService } from '@services/new-msg-count.service';
import { ThemeService } from '@services/theme.service';
import { EmailSmtpService } from '@services/data-services/email-smtp.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { SentryMonitorService } from '@services/sentry-monitor.service';
import { DeviceService } from '@services/device.service';

@Component({
  selector: 'app-rvlm-send-message',
  templateUrl: './send-message.component.html',
  styleUrls: ['./send-message.component.scss']
})
export class SendMessageComponent implements OnInit {

  @ViewChild(FormGroupDirective) myForm;

  @ViewChild('scrollable') private scrollable: ElementRef;

  // Set focus to input field
  @ViewChild('message') messageInput: ElementRef;
  focusOnPostInput(): void {
    this.messageInput.nativeElement.focus();
  }

  form: FormGroup;
  fromUserID: string;
  fromDisplayName: string;
  fromProfileImageUrl: string;
  toUserID: string;
  toDisplayName: string;
  toProfileImageUrl: string;
  messages: Array<Imessage> = [];
  conversation: Iconversation;
  theme: string;
  desktopUser: boolean = false;

  showSpinner: boolean = false;

  private conversationID: string;
  private originalMsgCount: number = 0;
  private newConversation: boolean = false;
  private userConversations: Observable<Iconversation[]>;
  private profile: IuserProfile;
  private userProfile: Observable<IuserProfile>;
  private sendMessageEmails: boolean;
  private shouldScrollDown: boolean;
  private numberOfMessagesChanged: boolean;
  private iterableDiffer;
  private emailVerified: boolean = false;

  constructor(private shareDataSvc: ShareDataService,
              private authSvc: AuthenticationService,
              private messagesSvc: MessagesService,
              private location: Location,
              private profileSvc: ProfileService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private newMsgCountSvc: NewMessageCountService,
              private themeSvc: ThemeService,
              private emailSmtpSvc: EmailSmtpService,
              private router: Router,
              private device: DeviceService,
              private sentry: SentryMonitorService,
              private iterableDiffers: IterableDiffers,
              fb: FormBuilder) {
                this.form = fb.group({
                  message: new FormControl('', Validators.required)
                });
              this.iterableDiffer = this.iterableDiffers.find([]).create(null);
     }

  ngOnInit(): void {
    let backPath: string;
    let self = this;
    window.onpopstate = function(event) {
      self.activateBackArrowSvc.setBackRoute('', 'backward');
    };
    console.log('SendMessageComponent:ngOnInit:')
    if (!this.authSvc.isLoggedIn()) {
      backPath = this.location.path().substring(1, this.location.path().length);
      this.activateBackArrowSvc.setBackRoute('*' + backPath, 'forward');
      this.router.navigateByUrl('/?e=signin');
    } else {
      if (window.innerWidth > 600) {
        this.desktopUser = true;
        console.log('SendMessageComponent:ngOnInit: getting conversations')
      }

      this.listenForUserProfile();

      this.getParameters()

      this.listenForChangeInColorTheme();
    }
  }

  ngDoCheck(): void {
    if (this.iterableDiffer.diff(this.messages)) {
        this.numberOfMessagesChanged = true;
    }
  }

  ngAfterViewChecked(): void {
    // const isScrolledDown = Math.abs(this.scrollable.nativeElement.scrollHeight - this.scrollable.nativeElement.scrollTop - this.scrollable.nativeElement.clientHeight) <= 3.0;

    // if (this.numberOfMessagesChanged && !isScrolledDown) {
    //     this.scrollToBottom();
    //     this.numberOfMessagesChanged = false;
    // }
  }

  ngOnDestroy() { }


  getClass() {
    let containerClass: string;
    let bottomSpacing: string;

    if (this.device.iPhoneModelXPlus) {
      bottomSpacing = 'bottom-bar-spacing-xplus';
    } else {
      bottomSpacing = 'bottom-bar-spacing';
    }
    containerClass = 'container ' + bottomSpacing;

    return containerClass;
  }


  // This component expects data passed through a shared data service.
  // If no data (because user bookmarked this page perhaps), then redirect to message-list component.
  // Once have parameters, take action
  getParameters(params?: ImessageShareData) {
    const profileImageUrl: string = './../../../../assets/images/no-profile-pic.jpg'; // Default empty profile image
    let paramData: any;

    if (!this.shareDataSvc.getData('message').fromUserID && !params) {
      if (this.desktopUser) {
        console.log('SendMessageComponent:getParameters: listening for conversations');
        this.listenForUserConversations();
      } else {
        console.log('SendMessageComponent:getParameters: no param data and device, route to list');
        this.router.navigateByUrl('/messages/message-list');
      }
    } else {
      if (params) {
        paramData = params;
      } else {
        paramData = this.shareDataSvc.getData('message');
      }
      console.log('SendMessageComponent:getParameters: params=', paramData)
      this.fromUserID = paramData.fromUserID;
      this.fromDisplayName = paramData.fromDisplayName;
      if (!paramData.fromProfileImageUrl || paramData.fromProfileImageUrl === 'null') {
        this.fromProfileImageUrl = profileImageUrl;
      } else {
        this.fromProfileImageUrl = paramData.fromProfileImageUrl;
      }
      this.toUserID = paramData.toUserID;
      this.toDisplayName = paramData.toDisplayName;
      if (!paramData.toProfileImageUrl || paramData.toProfileImageUrl === 'null') {
        this.toProfileImageUrl = profileImageUrl;
      } else {
        this.toProfileImageUrl = paramData.toProfileImageUrl;
      }
      if (paramData.conversationID && paramData.conversationID !== 'null') {
        this.conversationID = paramData.conversationID;
      }
      this.getOtherUserProfile();
      this.getMessages();
    }
  }


  // Update conversation in database with new message
  onSubmit() {
    const message = this.form.controls.message.value;
    this.showSpinner = true;
    this.messagesSvc.sendMessage(this.conversationID, this.fromUserID, this.fromDisplayName, this.fromProfileImageUrl,
                                this.toUserID, this.toDisplayName, this.toProfileImageUrl, message)
    .pipe(untilComponentDestroyed(this))
    .subscribe(messageResult => {
      this.messages.push(messageResult.messages[messageResult.messages.length - 1]);

      this.myForm.resetForm(); // Only way to reset the form without having it invalidate because field is required.

      if (this.newConversation) {
        this.messagesSvc.getConversations();
        this.sendNotificationToRecipient();
      } else {
        this.updateConversation('sent');
      }
      this.showSpinner = false;
    }, error => {
        this.showSpinner = false;
        console.error('SendMessageComponent:onSubmit: error sending message ', error);
        throw new Error(error);
    });
  }


  // If user clicks to see story of another user, go to MyStory component
  onYourStory() {
    let userParams:ImessageShareData = this.packageParamsForMessaging();
    let params:ImyStory = {
      userID: this.toUserID,
      userIdViewer: this.fromUserID,
      params: userParams
    }

    this.activateBackArrowSvc.setBackRoute('messages/send-message', 'forward');
    this.shareDataSvc.setData('myStory', params);
    this.router.navigateByUrl('/profile/mystory');
  }


  // Use converation ID or from/to users to select the appropriate conversation
  private findConversation(conversations: Iconversation[], fromUserID: string, toUserID: string, conversationID?: string): number {
    let index: number = -1;

    for (let i=0; i < conversations.length; i++) {
      if (conversationID) {
        if (conversations[i]._id === conversationID) {
          index = i;
          break;
        }
      } else {
        if ((conversations[i].createdBy === fromUserID || conversations[i].createdBy === toUserID) &&
            (conversations[i].withUserID === fromUserID || conversations[i].withUserID === toUserID)) {
          index = i;
          break;
        }
      }
    }
    return index;
  }


  // Get previous messages in this conversation for display
  private getMessages() {
    console.log('SendMessageComponent:getMessages:')
    this.userConversations = this.messagesSvc.conversation$;
    this.userConversations
    .pipe(untilComponentDestroyed(this))
    .subscribe(conversations => {
      console.log('SendMessageComponent:getMessages: conversations=', conversations)
      // if (conversations.length > 0 && conversations[0]._id) {
        console.log('SendMessageComponent:getMessages: in Messages=', conversations)
        let conversationIndex = this.findConversation(conversations, this.fromUserID, this.toUserID, this.conversationID);
        console.log('SendMessageComponent:getMessages: index=', conversationIndex)
        if (conversationIndex === -1) { // Indicates not found in collection
          this.newConversation = true;
          this.conversation = null;
          this.conversationID = null;
          this.messages = [];
        } else {
          this.conversation = conversations[conversationIndex];
          this.conversationID = this.conversation._id;
          this.newConversation = false;
          this.messages = conversations[conversationIndex].messages;

          if (conversations[conversationIndex].createdBy === this.fromUserID) {
            this.originalMsgCount = conversations[conversationIndex].createdByUnreadMessages;
          } else {
            this.originalMsgCount = conversations[conversationIndex].withUserUnreadMessages;
          }
          if (this.originalMsgCount > 0) {
            this.updateConversation('read');
            this.newMsgCountSvc.updateMessageCount(this.originalMsgCount);
            this.originalMsgCount = 0;
          }
        }
      // }
      this.showSpinner = false;
    });
  }


  private getOtherUserProfile() {
    console.error('SendMessageComponent:getOtherUserProfile: getting profile for other user =', this.toUserID, this.toDisplayName);
    this.profileSvc.getUserProfile(this.toUserID)
    .subscribe(profileResult => {
      this.sendMessageEmails = profileResult.sendMessageEmails;

    }, error => {
      console.error('SendMessageComponent:getOtherUserProfile: Error getting other user profile=', error);
      throw new Error(error);
    })
  }


  // Listen for changes in color theme;
  private listenForChangeInColorTheme() {
    this.themeSvc.defaultGlobalColorTheme
    .pipe(untilComponentDestroyed(this))
    .subscribe(themeData => {
      this.theme = themeData.valueOf();
    });
  }


  // Listen for conversations for this user.
  private listenForUserConversations() {
    let params: ImessageShareData;
    let message: Imessage;

    this.userConversations = this.messagesSvc.conversation$;
    this.userConversations
    .pipe(untilComponentDestroyed(this))
    .subscribe(conversations => {
      console.log('SendMessageComponent:listenForUserConversations: conversations=', conversations, ' length=', conversations.length)

      if (conversations.length > 0) {
        if (conversations[0]._id) {
          message = conversations[0].messages[conversations[0].messages.length - 1];
          console.log('SendMessageComponent:listenForUserConversations: message=', message);
          if (this.profile.userID === message.createdBy) { // profile not there yet!  Geez.
            console.log('SendMessageComponent:listenForUserConversations: user is from user');
            params = {
              fromUserID: message.createdBy,
              fromDisplayName: message.createdByDisplayName,
              fromProfileImageUrl: message.createdByProfileImageUrl,
              toUserID: message.sentToUserID,
              toDisplayName: message.sentToDisplayName,
              toProfileImageUrl: message.sentToProfileImageUrl,
              conversationID: conversations[0]._id
            }
          } else {
            console.log('SendMessageComponent:listenForUserConversations: user is to user');
            params = {
              fromUserID: message.sentToUserID,
              fromDisplayName: message.sentToDisplayName,
              fromProfileImageUrl: message.sentToProfileImageUrl,
              toUserID: message.createdBy,
              toDisplayName: message.createdByDisplayName,
              toProfileImageUrl: message.createdByProfileImageUrl,
              conversationID: conversations[0]._id
            }
          }

          console.log('SendMessageComponent:listenForUserConversations: params=', params);
          this.getParameters(params);
        } else {
          console.log('SendMessageComponent:listenForUserConversations: no conversation ID conversations=', conversations);
          // this.router.navigateByUrl('/messages/message-list');
        }
      } else {
        console.log('SendMessageComponent:listenForUserConversations: conversations length zero conversations=', conversations);
        // this.router.navigateByUrl('/messages/message-list');
      }
    }, error => {
      console.error('MessageList:listenForUserConversations: unable to get conversations. Error=', error);
      throw new Error(error);
    });
  }


    // Listen for Profile changes
    private listenForUserProfile() {
      this.userProfile = this.profileSvc.profile;
      this.userProfile
      .pipe(untilComponentDestroyed(this))
      .subscribe(data => {

        if (data._id) {
          this.profile = data;
        }
      }, error => {
        console.error('MessageListComponent:listenForUserProfile: error getting user profile. error=', error);
        throw new Error(error);
      });
    }


  private packageParamsForMessaging(): ImessageShareData {
    let params:ImessageShareData = {
      fromUserID: this.fromUserID,
      fromDisplayName: this.fromDisplayName,
      fromProfileImageUrl: this.fromProfileImageUrl,
      toUserID: this.toUserID,
      toDisplayName: this.toDisplayName,
      toProfileImageUrl: this.toProfileImageUrl
    }

    return params;
  }


  scrollToBottom() {
    try {
        this.scrollable.nativeElement.scrollTop = this.scrollable.nativeElement.scrollHeight;
    } catch (e) {
        console.error('SendMessageComponent:scrollToBottom:', e);
    }
  }


  // Send notification to recipient about new message if user wants them and if the user's email was verified
  private sendNotificationToRecipient() {

    if (this.sendMessageEmails) {
      this.authSvc.getOtherUserEmail(this.toUserID)
      .subscribe(userResult => {

        if (!userResult.emailNotVerified) {
          this.emailSmtpSvc.sendMessageAlertEmail(userResult.email)
          .subscribe(emailResult => {
          }, error => {
            this.sentry.logError(error);
          });
        }
      }, error => {
        this.sentry.logError(error);
      });
    }
  }


  // Update count of unread messages in conversation in database
  // If user viewed unread messages, set to zero
  // If user sent a new message, add to the count for the person sent to.
  private updateConversation(action: string) {
    let userIdType: string;

    if (this.conversation.createdBy === this.fromUserID) {
      userIdType = 'createdBy';
    } else {
      userIdType = 'withUserID';
    }

    this.messagesSvc.updateConversation(this.conversationID, userIdType, action)
    .pipe(untilComponentDestroyed(this))
    .subscribe(conversationResult => {
      this.messagesSvc.getConversations(); // Get updated conversation into behaviorSubject
      this.sendNotificationToRecipient();
    }, error => {
      console.error('SendMessageComponent:updateConversation: throw error ', error);
      throw new Error(error);
    })
  }

}
