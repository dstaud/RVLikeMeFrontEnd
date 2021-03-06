import { Injectable, ElementRef } from '@angular/core';
import { IuserProfile } from './data-services/profile.service';

export interface IforumsMain {
  _id?: string,
  forumType: string,
  theme?: string
  topicID?: string,
  topicDesc?: string,
  yearOfBirth?: number;
  gender?: string;
  homeCountry?: string;
  homeState?: string;
  aboutMe?: string;
  rvUse?: string;
  worklife?: string;
  campsWithMe?: string;
  boondocking?: string;
  traveling?: string;
  rigType?: string;
  rigLength?: number;
  rigManufacturer?: string;
  rigBrand?: string;
  rigModel?: string;
  rigTow?: string;
  atv?: boolean;
  motorcycle?: boolean;
  travel?: boolean;
  quilting?: boolean;
  cooking?: boolean;
  painting?: boolean;
  blogging?: boolean;
  livingFrugally?: boolean;
  gaming?: boolean;
  musicalInstrument?: boolean;
  programming?: boolean;
  mobileInternet?: boolean;
  boondock?: boolean;
  offGridLiving?: boolean;
  solarPower?: boolean;
  hiking?: boolean;
  fishing?: boolean;
  hunting?: boolean;
  kayaking?: boolean;
  yoga?: boolean;
  knitting?: boolean;
  crocheting?: boolean;
}

export interface IuserQuery {
    yearOfBirth?: number;
    gender?: string;
    homeCountry?: string;
    homeState?: string;
    aboutMe?: string;
    rvUse?: string;
    worklife?: string;
    campsWithMe?: string;
    boondocking?: string;
    traveling?: string;
    rigType?: string;
    rigLength?: number;
    rigManufacturer?: string;
    rigBrand?: string;
    rigModel?: string;
    atv?: boolean;
    motorcycle?: boolean;
    travel?: boolean;
    quilting?: boolean;
    cooking?: boolean;
    painting?: boolean;
    blogging?: boolean;
    livingFrugally?: boolean;
    gaming?: boolean;
    musicalInstrument?: boolean;
    programming?: boolean;
    mobileInternet?: boolean;
    boondock?: boolean;
    offGridLiving?: boolean;
    solarPower?: boolean;
    hiking?: boolean;
    fishing?: boolean;
    hunting?: boolean;
    kayaking?: boolean;
    yoga?: boolean;
    knitting?: boolean;
    crocheting?: boolean;
}

export interface ImessageShareData {
  fromUserID: string,
  fromDisplayName: string,
  fromProfileImageUrl: string,
  toUserID: string,
  toDisplayName: string,
  toProfileImageUrl: string,
  conversationID?: string
}

export interface InewbieTopic {
  topicID: string,
  topicDesc: string
}

export interface ImyStory {
  userID: string,
  userIdViewer: string,
  params: ImessageShareData,
  topicID?: string,
  topicDesc?: string
}

export interface IdashboardDrilldown {
  control: string
}

export interface InewbieHelp {
  displayName: string,
  profileImageUrl: string
}

export interface Isignin {
  fromLandingPage: boolean,
  install?: boolean,
  installDevice?: string
}

export interface Idashboard {
  nbrLogins: number
}

export interface Ipost {
  groupID: string,
  userDisplayName: string,
  userProfileUrl: string,
  body: string,
  photoUrl: string,
  link: string,
  linkDesc: string,
  linkTitle: string,
  linkImage: string,
  createdBy: string,
  createdAt: Date,
  fragment?: string
}

export interface IprofileImage {
  profileID: string,
  imageSource: string,
  newImageUrl?: string
}

export interface IviewImage {
  profileID?: string,
  imageType: string,
  imageSource: string,
  imageOwner: boolean
  newImageUrl?: string
}

export interface Iregister {
  aboutMe: string,
  aboutMeGroup: string,
  rvUse: string,
  rvUseGroup: string,
  rigType: string,
  rigTypeGroup: string
}


export interface IshareData {
  forumsMain: IforumsMain,
  myStory: ImyStory,
  userQuery: Array<IuserQuery>,
  dashboardDrilldown: IdashboardDrilldown,
  newbieHelp: InewbieHelp,
  message: ImessageShareData,
  newbieTopic: InewbieTopic,
  signin: Isignin,
  dashboard: Idashboard,
  post: Ipost,
  profileImage: IprofileImage,
  viewImage: IviewImage,
  register: Iregister
}



@Injectable({
  providedIn: 'root'
})
export class ShareDataService {
  private data:IshareData;

  constructor() {
    this.initializeData();
  }

  clearAllData() {
    this.initializeData();
  }

  setData(type: string, data: any) {
    this.data[type] = data;
  }

  getData(type: string):any {
    return this.data[type];
  }

  private initializeData() {
    this.data = {
      forumsMain: {
        _id: null,
        forumType: null,
        theme: null,
        topicID: null,
        topicDesc: null,
        yearOfBirth: null,
        gender: null,
        homeCountry: null,
        homeState: null,
        aboutMe: null,
        rvUse: null,
        worklife: null,
        campsWithMe: null,
        boondocking: null,
        traveling: null,
        rigType: null,
        rigLength: null,
        rigManufacturer: null,
        rigBrand: null,
        rigModel: null,
        rigTow: null,
        atv: null,
        motorcycle: null,
        travel: null,
        quilting: null,
        cooking: null,
        painting: null,
        blogging: null,
        livingFrugally: null,
        gaming: null,
        musicalInstrument: null,
        programming: null,
        mobileInternet: null,
        boondock: null,
        offGridLiving: null,
        solarPower: null,
        hiking: null,
        fishing: null,
        hunting: null,
        kayaking:null,
        yoga: null,
        knitting: null,
        crocheting: null
      },
      myStory: {
        userID: null,
        userIdViewer: null,
        params: {
          fromUserID: null,
          fromDisplayName: null,
          fromProfileImageUrl: null,
          toUserID: null,
          toDisplayName: null,
          toProfileImageUrl: null,
          conversationID: null
        },
        topicID: null,
        topicDesc: null
      },
      userQuery: [],
      dashboardDrilldown: {
        control: null
      },
      newbieHelp: {
        displayName: null,
        profileImageUrl: null
      },
      message: {
        fromUserID: null,
        fromDisplayName: null,
        fromProfileImageUrl: null,
        toUserID: null,
        toDisplayName: null,
        toProfileImageUrl: null,
        conversationID: null
      },
      newbieTopic: {
        topicID: null,
        topicDesc: null
      },
      signin: {
        fromLandingPage: false,
        install: false,
        installDevice: null
      },
      dashboard: {
        nbrLogins: null
      },
      post: {
        groupID: null,
        userDisplayName: null,
        userProfileUrl: null,
        body: null,
        photoUrl: null,
        link: null,
        linkDesc: null,
        linkTitle: null,
        linkImage: null,
        createdBy: null,
        createdAt: null,
        fragment: null
      },
      profileImage: {
        profileID: null,
        imageSource: null,
        newImageUrl: null
      },
      viewImage: {
        profileID: null,
        imageType: null,
        imageSource: null,
        imageOwner: false,
        newImageUrl: null
      },
      register: {
        aboutMe: null,
        aboutMeGroup: null,
        rvUse: null,
        rvUseGroup: null,
        rigType: null,
        rigTypeGroup: null
      }
    }
  }
}
