import { IDataReader } from './interface/IDataReader';

export class PassportReader implements IDataReader {
  async readData(): Promise<string> {
    return '19900101';
  }
}
