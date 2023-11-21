export interface AuthState {
  user: User | null;
}

export interface User {
  sub?: string | null;
  expiresIn?: any | null;
  name?: string | null;
  preferredUsername?: string | null;
  email?: string | null;
  emailVerified?: boolean | null;
  perfisUnificados?: string[] | null;
  perfis?: string[] | null;
  permissoes?: string[] | null;
  status?: string | null;
  cnpj?: any | null;
  cpf?: string | null;
  accessToken?: string | null;
  loginUnico?: any | null;
  loginOrigem?: string | null;
  cnpjsRepresentados?: [] | null;
}

export interface AuthAction {
  type: string;
  user: User | null;
}
