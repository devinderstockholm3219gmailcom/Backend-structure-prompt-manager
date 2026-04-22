
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface User {
  id: string
  username: string
  email: string
  createdAt: string
  updatedAt: string
  role: 'user' | 'admin'
}

export interface Prompt {
  _id: string
  title: string
  content: string
  description?: string
  tags: string[]
    isFavorite: boolean
  collectionId?: string | null
  userId: string
  createdAt: string
  updatedAt: string
}

export interface Collection {
  _id: string
  name: string
  description?: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface PaginatedPrompts {
  prompts: Prompt[]
  pagination: {
    total: number
    page: number
    totalPages: number
  }
}

// Wrap AuthResponse in the success envelope
export interface AuthResponse {
  success: boolean
  message: string
  data: {
    user: User
    tokens: {
      accessToken: string
      refreshToken: string
    }
  }
}