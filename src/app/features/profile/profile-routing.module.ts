import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProfileComponent } from './profile.component';
import { LifestyleComponent } from './lifestyle/lifestyle.component';
import { PersonalComponent } from './personal/personal.component';
import { RvRigComponent } from './rv-rig/rv-rig.component';
import { InterestsComponent } from './interests/interests.component';
import { MainComponent } from './main/main.component';
import { YourStoryComponent } from './your-story/your-story.component';
import { PageNotFoundComponent } from '@pageNotFound/page-not-found.component';
import { ImageCropperComponent } from './image-cropper/image-cropper.component';
import { ImageViewerComponent } from './image-viewer/image-viewer.component';
import { BlogLinkComponent } from './blog-link/blog-link.component';

const routes: Routes = [
  { path: '', component:ProfileComponent,
    children: [
      { path: 'main', component: MainComponent},
      { path: 'personal', component: PersonalComponent },
      { path: 'lifestyle', component: LifestyleComponent },
      { path: 'rig', component: RvRigComponent },
      { path: 'interests', component: InterestsComponent },
      { path: 'mystory', component: YourStoryComponent },
      { path: 'profile-image', component: ImageCropperComponent },
      { path: 'image-viewer', component: ImageViewerComponent },
      { path: 'blog-link', component: BlogLinkComponent }
    ]
  },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }
