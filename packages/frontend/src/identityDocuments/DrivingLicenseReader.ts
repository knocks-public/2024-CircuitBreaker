import { IDataReader } from './interface/IDataReader';

export class DrivingLicenseReader implements IDataReader {
  async readData(): Promise<string> {
    return '19800101';
  }
}
