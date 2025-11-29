import { CreateAwsS3Dto } from './dto/create-aws-s3.dto';
import { UpdateAwsS3Dto } from './dto/update-aws-s3.dto';
import { S3 } from 'aws-sdk';
import { Logger, Injectable } from '@nestjs/common';

@Injectable()
export class AwsS3Service {
  // Source - https://stackoverflow.com/a
  // Posted by Willian, modified by community. See post 'Timeline' for change history
  // Retrieved 2025-11-23, License - CC BY-SA 4.0

  async upload(file) {
    const { originalname } = file;
    const bucketS3 = 'my-aws-bucket';
    await this.uploadS3(file.buffer, bucketS3, originalname);
  }

  async uploadS3(file, bucket, name) {
    const s3 = this.getS3();
    const params = {
      Bucket: bucket,
      Key: String(name),
      Body: file,
    };
    return new Promise((resolve, reject) => {
      s3.upload(params, (err, data) => {
        if (err) {
          Logger.error(err);
          reject(err.message);
        }
        resolve(data);
      });
    });
  }

  getS3() {
    return new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
  }
}
