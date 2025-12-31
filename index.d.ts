// Type definitions for @hellotext/hellotext

export interface HellotextConfig {
  forms?: {
    autoMount?: boolean
    successMessage?: boolean | string
  }
  webchat?: {
    id?: string
    container?: string
    placement?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
    classes?: string | string[]
    triggerClasses?: string | string[]
    behaviour?: 'modal' | 'popover'
    style?: {
      primaryColor?: string
      secondaryColor?: string
      typography?: string
    }
    strategy?: 'absolute' | 'fixed'
  }
  session?: string
  autoGenerateSession?: boolean
}

export interface TrackingParams {
  amount?: number
  currency?: string
  metadata?: Record<string, any>
  tracked_at?: number
  url?: string
  headers?: Record<string, string>
  object?: string
  object_parameters?: Record<string, any>
  object_type?: string
}

export interface IdentificationOptions {
  email?: string
  phone?: string
  name?: string
  source?: string
}

export interface IdentificationData {
  id: string
  source?: string
}

export interface Response {
  data: any
  succeeded: boolean
  failed: boolean
}

declare class Hellotext {
  static initialize(businessId: string, config?: HellotextConfig): Promise<void>
  static track(action: string, params?: TrackingParams): Promise<Response>
  static identify(userId: string, options?: IdentificationOptions): Promise<Response>
  static forget(): void
  static on(event: string, callback: (data: any) => void): void
  static removeEventListener(event: string, callback: (data: any) => void): void
  static get session(): string
  static get isInitialized(): boolean
  static forms: any
  static business: any
  static webchat: any
}

export declare class User {
  static get id(): string | undefined
  static get source(): string | undefined
  static remember(id: string, source?: string): void
  static forget(): void
  static get identificationData(): IdentificationData | Record<string, never>
}

export declare class Cookies {
  static get(name: string): string | undefined
  static set(name: string, value: string): string
  static delete(name: string): void
}

export default Hellotext

// Declare the CSS module
declare module '@hellotext/hellotext/styles/index.css' {
  const styles: string
  export default styles
}
