// AgeVerificationService.ts
import { scan as scanMyNumberCard } from '../identityDocuments/MyNumberCardReader';
import { scan as scanPassport } from '../identityDocuments/PassportReader';
import { scan as scanDrivingLicense } from '../identityDocuments/DrivingLicenseReader';

export const verifyAge = async (documentType: 'MyNumberCard' | 'Passport' | 'DrivingLicense', pin?: string) => {
  switch (documentType) {
    case 'MyNumberCard':
      return scanMyNumberCard(pin);
    case 'Passport':
      return scanPassport();
    case 'DrivingLicense':
      return scanDrivingLicense();
    default:
      throw new Error('Unsupported document type');
  }
};
