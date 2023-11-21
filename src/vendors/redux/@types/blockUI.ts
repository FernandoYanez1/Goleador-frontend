export interface BlockUIState {
  blocked: boolean;
}

export interface BlockUIAction {
  type: string;
  blocked: boolean;
}
