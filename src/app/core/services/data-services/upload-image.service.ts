import { Injectable } from '@angular/core';
import { HttpEventType } from '@angular/common/http';

import { NgxImageCompressService } from 'ngx-image-compress';

import { ImageService } from '@services/data-services/images.service';

@Injectable({
  providedIn: 'root'
})
export class UploadImageService {

  constructor(private imageCompress: NgxImageCompressService,
              private imageSvc: ImageService) { }

  // Get image selected from file system or device or camera, compress and upload
  compressImageFile(event: any, cb: CallableFunction) {
    this.processFile(event, (imageFile: File) => {
      cb(imageFile);
    });
  }

  // Upload image file to server
  uploadImage(imageFile: File, cb: CallableFunction) {
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

  /**** Compress image file before sending to server ****/
  private processFile(event: any, cb: CallableFunction) {
    let fileName: string;
    let reader = new FileReader();
    let imageFromSource: File;

    // Extract image file from event
    imageFromSource = <File>event.target.files[0];
    fileName = imageFromSource['name'];

    // Compress file before uploading to server
    reader.onload = (event: any) => {
      this.compressFile(event.target.result, fileName, (imageFile: File) => {
        cb(imageFile);
      });
    }
    reader.readAsDataURL(event.target.files[0]);
  }

  private compressFile(imageFile: File,  fileName: string, cb: CallableFunction) {
    const orientation = -1;
    let compressedImageFile:File = null;

    console.warn('File size before:',  this.imageCompress.byteCount(imageFile)/(1024*1024));

    this.imageCompress.compressFile(imageFile, orientation, 50, 50)
    .then(result => {
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
}
