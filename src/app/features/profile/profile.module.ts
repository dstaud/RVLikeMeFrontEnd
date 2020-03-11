import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { ImageCropperComponent } from './image-cropper/image-cropper.component';

import { ProfileComponent } from './profile.component';
import { SharedModule } from '../../shared/shared.module';
import { ProfileRoutingModule } from './profile-routing.module';
import { PersonalComponent } from './personal/personal.component';
import { RvRigComponent } from './rv-rig/rv-rig.component';
import { LifestyleComponent } from './lifestyle/lifestyle.component';
import { InterestsComponent } from './interests/interests.component';



@NgModule({
  declarations: [
    ProfileComponent,
    PersonalComponent,
    RvRigComponent,
    LifestyleComponent,
    ImageCropperComponent,
    InterestsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ProfileRoutingModule,
    ReactiveFormsModule
  ]
})
export class ProfileModule { }
