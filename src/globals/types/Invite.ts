export type Invite = {
    _id: string;
    token: string;
    email: string;
    organizationId: string;
    organizationName: string;
    role: string;
    expiresAt: string;
    status: 'pending' | 'accepted' | 'declined';
    createdAt: string;
  };
  