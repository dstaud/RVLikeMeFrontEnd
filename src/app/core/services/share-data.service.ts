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
  fromLandingPage: boolean
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
  createdBy: string,
  createdAt: Date
}

export interface IprofileImage {
  profileID: string,
  imageSource: string,
  newImageUrl?: string
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
  profileImage: IprofileImage
}



@Injectable({
  providedIn: 'root'
})
export class ShareDataService {
  private data:IshareData = {
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
      mobileInternet: null

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
      fromLandingPage: false
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
      createdBy: null,
      createdAt: null
    },
    profileImage: {
      profileID: null,
      imageSource: null,
      newImageUrl: null
    }
  }

  constructor() { }

  setData(type: string, data:any) {
      this.data[type] = data;
  }

  getData(type: string):any {
      return this.data[type];
  }
}
