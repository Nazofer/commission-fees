import { promises } from 'fs';
import { Operation } from '../interfaces/operation.interface.ts';

const exists = async (path: string): Promise<boolean> => {
  try {
    await promises.stat(path);
    return true;
  } catch (err) {
    return false;
  }
};

export const getData = async (path: string): Promise<Operation[] | null> => {
  if (!(await exists(path))) {
    return null;
  }

  const file = await promises.readFile(path, { encoding: 'utf8' });
  return JSON.parse(file) as Operation[];
};
