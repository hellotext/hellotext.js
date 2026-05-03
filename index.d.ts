// Type definitions for @hellotext/hellotext

export interface HellotextConfig {
  forms?: {
    autoMount?: boolean
    successMessage?: boolean | string
  }
  webchat?: false | HellotextWebchatConfig
  session?: string
  autoGenerateSession?: boolean
}

export type HellotextWebchatMode = 'modal' | 'popover'
export type HellotextWebchatStrategy = 'absolute' | 'fixed'
export type HellotextWebchatBehaviourTrigger = 'onClick' | 'onLoad'

export interface HellotextWebchatBehaviour {
  trigger: HellotextWebchatBehaviourTrigger
  delaySeconds: 0 | 5 | 10 | 30
  firstVisitOnly: boolean
  oncePerSession: boolean
}

export interface HellotextWebchatConfig {
  id?: string
  container?: string
  placement?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  classes?: string | string[]
  triggerClasses?: string | string[]
  mode?: HellotextWebchatMode
  behaviour?: HellotextWebchatBehaviour
  style?: {
    primaryColor?: string
    secondaryColor?: string
    typography?: string
  }
  strategy?: HellotextWebchatStrategy
}

export interface HellotextBusinessCountry {
  code?: string
  prefix?: string
  [key: string]: any
}

export interface HellotextBusinessData {
  id?: string
  country?: HellotextBusinessCountry | string
  features?: Record<string, any>
  locale?: string
  style_url?: string
  webchat?: HellotextWebchatConfig | null
  whitelist?: string | string[] | null
  subscription?: string | null
  [key: string]: any
}

export interface HellotextBusiness {
  id: string
  data: HellotextBusinessData | null
  readonly subscription: string | null | undefined
  readonly country: HellotextBusinessCountry | string | undefined
  readonly enabledWhitelist: boolean
  readonly locale: any
  readonly features: Record<string, any> | null | undefined
  hydrate(): Promise<HellotextBusinessData | null>
  setData(data: HellotextBusinessData): void
  setLocale(locale: string): void
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
  static business: HellotextBusiness
  static webchat: any
}

export declare class User {
  static get id(): string | undefined
  static get source(): string | undefined
  static get fingerprint(): string | undefined
  static remember(id: string, source?: string, fingerprint?: string): void
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
