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


  // Use ngx-Image-Compress to upload a file, compress and orient the image
  compressFile(fileType: string, cb: CallableFunction) {
    this.imageCompress.uploadFile().then(({image, orientation}) => {
      let compressedImageFile:File = null;
      console.warn('Size in bytes was:', this.imageCompress.byteCount(image));

      this.imageCompress.compressFile(image, orientation, 50, 50).then(
        result => {
          console.warn('Size in bytes is now:', this.imageCompress.byteCount(result));
          const imageBlob = this.dataURItoBlob(result.split(',')[1]);
          compressedImageFile = new File([imageBlob], fileType, { type: 'image/jpeg' });
          cb(compressedImageFile);
        }
      );

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
