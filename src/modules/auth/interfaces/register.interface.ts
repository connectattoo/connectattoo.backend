export interface IRegisterUser{
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthDate: string;
  termsAccepted: boolean;
  tattooArtist?: boolean;
}