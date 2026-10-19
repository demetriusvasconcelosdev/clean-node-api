export interface Authentication {
  auth: (
    authenticationParams: Authentication.Params
  ) => Promise<Authentication.Result | null>
}

export namespace Authentication {
  export interface Params {
    email: string
    password: string
  }

  export interface Result {
    accessToken: string
    name: string
  }
}
