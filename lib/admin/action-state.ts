export interface AdminActionState {
  success: boolean;
  message: string;
}

export const initialAdminActionState: AdminActionState = {
  success: false,
  message: "",
};
