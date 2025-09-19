export type User = {
  _id?: string;
  firstName: string;
  lastName: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  email: string;
  phoneNumber: string;
  password: string;
  country: string;
  state: string;
  city: string;
  testing?: boolean;
  // klaviyoProfileId?: string; TODO: create after a marketing list with klaviyo
  // marketingLists?: string[];
  role: 'user' | 'admin' | 'employee';
  createdAt?: Date;
  updatedAt?: Date;
};
