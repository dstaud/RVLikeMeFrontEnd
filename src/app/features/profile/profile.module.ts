import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { ImageCropperComponent } from './image-cropper/image-cropper.component';
import { ImageDialogComponent } from '@dialogs/image-dialog/image-dialog.component';
import { ImageViewDialogComponent } from '@dialogs/image-view-dialog/image-view-dialog.component';
import { ProfileComponent } from './profile.component';
import { SharedModule } from '../../shared/shared.module';
import { ProfileRoutingModule } from './profile-routing.module';
import { PersonalComponent } from './personal/personal.component';
import { RvRigComponent } from './rv-rig/rv-rig.component';
import { LifestyleComponent } from './lifestyle/lifestyle.component';
import { InterestsComponent } from './interests/interests.component';
import { MainComponent } from './main/main.component';
import { YourStoryComponent } from './your-story/your-story.component';
import { ImageViewerComponent } from './image-viewer/image-viewer.component';
import { BlogLinkComponent } from './blog-link/blog-link.component';


@NgModule({
  declarations: [
    ProfileComponent,
    PersonalComponent,
    RvRigComponent,
    LifestyleComponent,
    ImageCropperComponent,
    InterestsComponent,
    ImageDialogComponent,
    ImageViewDialogComponent,
    MainComponent,
    YourStoryComponent,
    ImageViewerComponent,
    BlogLinkComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ProfileRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class ProfileModule { }
