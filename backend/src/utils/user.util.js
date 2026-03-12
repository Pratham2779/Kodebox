import { config } from 'dotenv';
config();
import { GetObjectCommand, PutObjectCommand, HeadObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../configs/S3/index.js";
import { randomUUID } from 'node:crypto';
import fs from 'fs';
import path from 'path';


const getProfilePhotoUrl = async (avatarKey) => {
  const key = avatarKey || process.env.DEFAULT_AVATAR_KEY;
  console.log(key);
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key
  });

  return await getSignedUrl(s3, command, {
    expiresIn: 60 * 60
  });
}


const uploadAvatar = async (localFilePath) => {
  if (!localFilePath || typeof localFilePath !== "string") {
    throw new Error("Invalid avatar file path");
  }

  const safePath = localFilePath.trim();


  if (!fs.existsSync(safePath)) {
    throw new Error("Avatar file does not exist on disk");
  }


  const allowedExt = [".jpg", ".jpeg", ".png", ".webp", ".svg"];
  const fileExt = path.extname(safePath).toLowerCase();

  if (!allowedExt.includes(fileExt)) {
    fs.unlinkSync(safePath); // cleanup
    throw new Error("Unsupported image format");
  }

  const s3Key = `avatars/${randomUUID()}${fileExt}`;

  let fileStream;

  try {
    fileStream = fs.createReadStream(safePath);

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: s3Key,
      Body: fileStream,
      ContentType: `image/${fileExt.replace(".", "")}`,
    });

    await s3.send(command);

    return { key: s3Key };
  } catch (error) {
    console.error("S3 avatar upload failed:", error);
    throw new Error("Failed to upload avatar");
  } finally {

    try {
      fs.unlinkSync(safePath);
    } catch (error) {
      throw new Error("Failed to clean local file..");
    }
  }
};




const deleteAvatar = async (avatarKey) => {

  if (!avatarKey || typeof avatarKey !== "string") {
    return;
  }

  const safeKey = avatarKey.trim();


  if (safeKey === process.env.DEFAULT_AVATAR_KEY) {
    return;
  }

  try {

    await s3.send(
      new HeadObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: safeKey,
      })
    );


    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: safeKey,
      })
    );
  } catch (error) {

    if (error?.$metadata?.httpStatusCode === 404) {
      return;
    }

    console.error("S3 avatar deletion failed:", {
      key: safeKey,
      error,
    });

    throw new Error("Failed to delete avatar");
  }
};





export {
  getProfilePhotoUrl,
  uploadAvatar,
  deleteAvatar
};