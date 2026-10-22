export interface IP360UserPageResponse {
  Users: IP360UserContent[]
  TotalPageCount: number
  TotalCount: number
  Successful: boolean
  ErrorMessage: string
  ErrorDetails: string
}

export interface IP360UserContent {
  ContactExternalId: string
  IsActive: boolean
}
