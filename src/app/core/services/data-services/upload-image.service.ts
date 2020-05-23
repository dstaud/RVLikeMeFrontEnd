import { Injectable } from '@angular/core';
import { HttpEventType } from '@angular/common/http';

import { NgxImageCompressService } from 'ngx-image-compress';
import * as exifr from 'exifr/dist/mini.legacy.umd';

import { ImageService } from '@services/data-services/images.service';

export declare enum DOC_ORIENTATION {
  Up = 1,
  Down = 3,
  Right = 6,
  Left = 8,
  UpMirrored = 2,
  DownMirrored = 4,
  LeftMirrored = 5,
  RightMirrored = 7,
  NotJpeg = -1,
  NotDefined = -2
}

@Injectable({
  providedIn: 'root'
})
export class UploadImageService {

  constructor(private imageCompress: NgxImageCompressService,
              private imageSvc: ImageService) { }


  // Pre-process and then compress file
  compressImageFile(event: any, cb: CallableFunction) {
    this.processFile(event, (imageFile: File) => {
      cb(imageFile);
    })
  }



  // Upload image file to server
  uploadImage(imageFile: File, fileType: string, cb: CallableFunction) {
    let fd = new FormData();
    let imageFileUrl: string;

    // Convert to FormData type for upload
    fd.append('image', imageFile, imageFile.name);

    this.imageSvc.uploadProfileImage(fd)
    .subscribe(event => {
      if (event.type === HttpEventType.Response) {
          imageFileUrl = event.body['imageUrl'];
          cb(imageFileUrl);
      }
    }, error => {
      console.error('UploadImageService:uploadImage: throw error ', error);
      throw new Error(error);
    });
  }


  uploadImageBase64(croppedImage: string, cb: CallableFunction) {
    let profileImageUrl: string;

    this.imageSvc.uploadProfileImageBase64(croppedImage)
    .subscribe(event => {
    if (event.type === HttpEventType.Response) {
        profileImageUrl = event.body['imageUrl'];
        cb(profileImageUrl);
      }
    }, error => {
      console.error('UploadImageService:uploadImagebase64: throw error ', error);
      throw new Error(error);
    });
  }


  private compressFile(imageFile: File,  fileName: string, orientation: DOC_ORIENTATION, cb: CallableFunction) {
    let compressedImageFile:File = null;

    this.imageCompress.compressFile(imageFile, orientation, 50, 50)
    .then(result => {
        const imageBlob = this.dataURItoBlob(result.split(',')[1]);
        compressedImageFile = new File([imageBlob], fileName, { type: 'image/jpeg' });
        cb(compressedImageFile);
    })
    .catch(error => {
      console.error('UploadImageService:compressFile: error compressing file:', error);
    });
  }


  // Convert dataUri to a blob so that a File can be created
  private dataURItoBlob(dataURI) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([int8Array], { type: 'image/jpeg' });
    return blob;
  }


  /**** Compress image file before sending to server ****/
  private processFile(event: any, cb: CallableFunction) {
    let fileName: string;
    let reader = new FileReader();
    let imageFromSource: File;
    let orientation: DOC_ORIENTATION;

    // Extract image file from event
    imageFromSource = <File>event.target.files[0];
    fileName = imageFromSource['name'];

    // Compress file before uploading to server - Not sure what's going on here, but only this configuration with compress outside of orientation.then works
    // I thought wait until orientation is done so essentially put inside then, or tried chaining another callback but those did NOT work.  I would have
    // expected either of those to work and this one not to...
    // Then I commented  out exifr which actually gets the orientation and now orientation is undefined...but it works now with an undefined orientation!
    // The only thing I can think of, is when I do not pass an orientation, it realizes it is undefined and gets the right orientation through some error
    // handling, which is nice.  The orientation that I'm passing just must not be right, but it looks like just this ENUM that I copied out.  If i Pass a 6
    // it ignores it!
    // I originally tried to use the upload that is included with the compressFile that gets the orientation, but had to remove it because would not
    // work on the iPhone.   I had to upload myself, and then, I thought, get the orientation myself and then call compress.
    reader.onload = (event: any) => {
      this.compressFile(event.target.result, fileName, orientation, (imageFile: File) => {
        cb(imageFile);
      });
    }
    reader.readAsDataURL(event.target.files[0]);
  }
}
