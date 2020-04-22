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



  compressImageFile(event: any, cb: CallableFunction) {
    console.log('UploadImageService:compressImageFile: processing file')
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
      console.log('UploadImageService:uploadImage: throw error ', error);
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
      console.log('UploadImageService:uploadImagebase64: throw error ', error);
      throw new Error(error);
    });
  }


  private compressFile(imageFile: File,  fileName: string, orientation: DOC_ORIENTATION, cb: CallableFunction) {
    console.log('UploadImageService:compressTheFile:')
    let compressedImageFile:File = null;

    console.log('UploadImageService:compressTheFile: Orientation = ', orientation)
    console.warn('File size before:',  this.imageCompress.byteCount(imageFile)/(1024*1024));

    this.imageCompress.compressFile(imageFile, orientation, 50, 50)
    .then(result => {
      console.log('UploadImageService:compressTheFile: back from compress')
        // Creates a blob from dataUri
        const imageBlob = this.dataURItoBlob(result.split(',')[1]);
        compressedImageFile = new File([imageBlob], fileName, { type: 'image/jpeg' });
        cb(compressedImageFile);
      }
    );
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

    // Get image orientation so can adjust it when compressing
    exifr.orientation(imageFromSource).catch(err => undefined).then(orient => {
      console.log('UploadImageService:ProcessFile: got orientation ONE=', orient, ' now compressing file');
      orientation = orient;
    });

    console.log('UploadImageService:ProcessFile: got orientation=', orientation);

    // Compress file before uploading to server
    reader.onload = (event: any) => {
      // Determine image orientation
      console.log('UploadImageService:ProcessFile: got file from user, getting Orientation ', fileName)

      this.compressFile(event.target.result, fileName, orientation, (imageFile: File) => {
        cb(imageFile);
      });
    }
    reader.readAsDataURL(event.target.files[0]);
  }
}
