import { ObjectId } from 'mongodb';

const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;

export function isObjectId(value: string): boolean {
  return OBJECT_ID_REGEX.test(value);
}

export function toObjectId(value: string): ObjectId | null {
  return isObjectId(value) ? new ObjectId(value) : null;
}
