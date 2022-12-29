import { EventKinds } from '../constants/base'
import { Pubkey } from './base'

export interface Info {
  relay_url?: string
  name?: string
  description?: string
  pubkey?: string
  contact?: string
}

export interface Network {
  max_payload_size?: number
  remote_ip_header?: string
}

export interface EventIdLimits {
  minLeadingZeroBits?: number
}

export interface PubkeyLimits {
  minLeadingZeroBits: number
  whitelist?: Pubkey[]
  blacklist?: Pubkey[]
}

export type EventKindsRange = [EventKinds, EventKinds]

export interface EventRateLimit {
  kinds?: (EventKinds | [EventKinds, EventKinds])[]
  rate: number
  period: number
}

export interface KindLimits {
  whitelist?: (EventKinds | EventKindsRange)[]
  blacklist?: (EventKinds | EventKindsRange)[]
}

export interface CreatedAtLimits {
  /**
   * Maximum number of seconds allowed before the current unix timestamp
   */
  maxNegativeDelta?: number
  /**
   * Maximum number of seconds allowed after the current unix timestamp
   */
  maxPositiveDelta?: number
}

export interface ContentLimits {
  maxLength?: number
}

export interface EventWhitelists {
  pubkeys?: Pubkey[]
  ipAddresses?: string[]
}

export interface EventLimits {
  eventId?: EventIdLimits
  pubkey?: PubkeyLimits
  kind?: KindLimits
  createdAt?: CreatedAtLimits
  content?: ContentLimits
  rateLimits?: EventRateLimit[]
  whitelists?: EventWhitelists
}

export interface ClientSubscriptionLimits {
  maxSubscriptions?: number
  maxFilters?: number
}

export interface ClientLimits {
  subscription?: ClientSubscriptionLimits
}

export interface MessageRateLimit {
  rate: number
  period: number
}

export interface MessageLimits {
  rateLimits?: MessageRateLimit[]
  ipWhitelist?: string[]
}

export interface Limits {
  client?: ClientLimits
  event?: EventLimits
  message?: MessageLimits
}

export interface Worker {
  count: number
}

export interface ISettings {
  info: Info
  network?: Network
  workers?: Worker
  limits?: Limits
}
