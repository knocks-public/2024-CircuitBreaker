import { IDataReader } from './interface/IDataReader';

export class MyNumberCardReader implements IDataReader {
  async readData(): Promise<string> {
    return '20000101';
  }
}
