/** @module AuthClient */
import { Identity, SignIdentity } from '@dfinity/agent';
import { DelegationChain } from '@dfinity/identity';
import { Principal } from '@dfinity/principal';
import { IdleManager, IdleManagerOptions } from './idleManager';
import { AuthClientStorage } from './storage';
import { PartialIdentity } from '@dfinity/identity/lib/cjs/identity/partial';
export { AuthClientStorage, IdbStorage, LocalStorage, KEY_STORAGE_DELEGATION, KEY_STORAGE_KEY } from './storage';
export { IdbKeyVal, DBCreateOptions } from './db';
declare const ECDSA_KEY_LABEL = "ECDSA";
declare const ED25519_KEY_LABEL = "Ed25519";
declare type BaseKeyType = typeof ECDSA_KEY_LABEL | typeof ED25519_KEY_LABEL;
export declare const ERROR_USER_INTERRUPT = "UserInterrupt";
/**
 * List of options for creating an {@link AuthClient}.
 */
export interface AuthClientCreateOptions {
    /**
     * An identity to use as the base
     */
    identity?: SignIdentity | PartialIdentity;
    /**
     * Optional storage with get, set, and remove. Uses {@link IdbStorage} by default
     */
    storage?: AuthClientStorage;
    /**
     * type to use for the base key
     * @default 'ECDSA'
     * If you are using a custom storage provider that does not support CryptoKey storage,
     * you should use 'Ed25519' as the key type, as it can serialize to a string
     */
    keyType?: BaseKeyType;
    /**
     * Options to handle idle timeouts
     * @default after 30 minutes, invalidates the identity
     */
    idleOptions?: IdleOptions;
}
export interface IdleOptions extends IdleManagerOptions {
    /**
     * Disables idle functionality for {@link IdleManager}
     * @default false
     */
    disableIdle?: boolean;
    /**
     * Disables default idle behavior - call logout & reload window
     * @default false
     */
    disableDefaultIdleCallback?: boolean;
}
export * from './idleManager';
export declare type OnSuccessFunc = (() => void | Promise<void>) | ((message: InternetIdentityAuthResponseSuccess) => void | Promise<void>);
export declare type OnErrorFunc = (error?: string) => void | Promise<void>;
export interface AuthClientLoginOptions {
    /**
     * Identity provider
     * @default "https://identity.ic0.app"
     */
    identityProvider?: string | URL;
    /**
     * Expiration of the authentication in nanoseconds
     * @default  BigInt(8) hours * BigInt(3_600_000_000_000) nanoseconds
     */
    maxTimeToLive?: bigint;
    /**
     * If present, indicates whether or not the Identity Provider should allow the user to authenticate and/or register using a temporary key/PIN identity. Authenticating dapps may want to prevent users from using Temporary keys/PIN identities because Temporary keys/PIN identities are less secure than Passkeys (webauthn credentials) and because Temporary keys/PIN identities generally only live in a browser database (which may get cleared by the browser/OS).
     */
    allowPinAuthentication?: boolean;
    /**
     * Origin for Identity Provider to use while generating the delegated identity. For II, the derivation origin must authorize this origin by setting a record at `<derivation-origin>/.well-known/ii-alternative-origins`.
     * @see https://github.com/dfinity/internet-identity/blob/main/docs/internet-identity-spec.adoc
     */
    derivationOrigin?: string | URL;
    /**
     * Auth Window feature config string
     * @example "toolbar=0,location=0,menubar=0,width=500,height=500,left=100,top=100"
     */
    windowOpenerFeatures?: string;
    /**
     * Callback once login has completed
     */
    onSuccess?: OnSuccessFunc;
    /**
     * Callback in case authentication fails
     */
    onError?: OnErrorFunc;
    /**
     * Extra values to be passed in the login request during the authorize-ready phase
     */
    customValues?: Record<string, unknown>;
}
export interface InternetIdentityAuthResponseSuccess {
    kind: 'authorize-client-success';
    delegations: {
        delegation: {
            pubkey: Uint8Array;
            expiration: bigint;
            targets?: Principal[];
        };
        signature: Uint8Array;
    }[];
    userPublicKey: Uint8Array;
    authnMethod: 'passkey' | 'pin' | 'recovery';
}
/**
 * Tool to manage authentication and identity
 * @see {@link AuthClient}
 */
export declare class AuthClient {
    private _identity;
    private _key;
    private _chain;
    private _storage;
    idleManager: IdleManager | undefined;
    private _createOptions;
    private _idpWindow?;
    private _eventHandler?;
    /**
     * Create an AuthClient to manage authentication and identity
     * @constructs
     * @param {AuthClientCreateOptions} options - Options for creating an {@link AuthClient}
     * @see {@link AuthClientCreateOptions}
     * @param options.identity Optional Identity to use as the base
     * @see {@link SignIdentity}
     * @param options.storage Storage mechanism for delegration credentials
     * @see {@link AuthClientStorage}
     * @param options.keyType Type of key to use for the base key
     * @param {IdleOptions} options.idleOptions Configures an {@link IdleManager}
     * @see {@link IdleOptions}
     * Default behavior is to clear stored identity and reload the page when a user goes idle, unless you set the disableDefaultIdleCallback flag or pass in a custom idle callback.
     * @example
     * const authClient = await AuthClient.create({
     *   idleOptions: {
     *     disableIdle: true
     *   }
     * })
     */
    static create(options?: {
        /**
         * An {@link SignIdentity} or {@link PartialIdentity} to authenticate via delegation.
         */
        identity?: SignIdentity | PartialIdentity;
        /**
         * {@link AuthClientStorage}
         * @description Optional storage with get, set, and remove. Uses {@link IdbStorage} by default
         */
        storage?: AuthClientStorage;
        /**
         * type to use for the base key
         * @default 'ECDSA'
         * If you are using a custom storage provider that does not support CryptoKey storage,
         * you should use 'Ed25519' as the key type, as it can serialize to a string
         */
        keyType?: BaseKeyType;
        /**
         * Options to handle idle timeouts
         * @default after 10 minutes, invalidates the identity
         */
        idleOptions?: IdleOptions;
    }): Promise<AuthClient>;
    protected constructor(_identity: Identity | PartialIdentity, _key: SignIdentity | PartialIdentity, _chain: DelegationChain | null, _storage: AuthClientStorage, idleManager: IdleManager | undefined, _createOptions: AuthClientCreateOptions | undefined, _idpWindow?: Window | undefined, _eventHandler?: ((event: MessageEvent) => void) | undefined);
    private _registerDefaultIdleCallback;
    private _handleSuccess;
    getIdentity(): Identity;
    isAuthenticated(): Promise<boolean>;
    /**
     * AuthClient Login -
     * Opens up a new window to authenticate with Internet Identity
     * @param {AuthClientLoginOptions} options - Options for logging in
     * @param options.identityProvider Identity provider
     * @param options.maxTimeToLive Expiration of the authentication in nanoseconds
     * @param options.allowPinAuthentication If present, indicates whether or not the Identity Provider should allow the user to authenticate and/or register using a temporary key/PIN identity. Authenticating dapps may want to prevent users from using Temporary keys/PIN identities because Temporary keys/PIN identities are less secure than Passkeys (webauthn credentials) and because Temporary keys/PIN identities generally only live in a browser database (which may get cleared by the browser/OS).
     * @param options.derivationOrigin Origin for Identity Provider to use while generating the delegated identity
     * @param options.windowOpenerFeatures Configures the opened authentication window
     * @param options.onSuccess Callback once login has completed
     * @param options.onError Callback in case authentication fails
     * @example
     * const authClient = await AuthClient.create();
     * authClient.login({
     *  identityProvider: 'http://<canisterID>.127.0.0.1:8000',
     *  maxTimeToLive: BigInt (7) * BigInt(24) * BigInt(3_600_000_000_000), // 1 week
     *  windowOpenerFeatures: "toolbar=0,location=0,menubar=0,width=500,height=500,left=100,top=100",
     *  onSuccess: () => {
     *    console.log('Login Successful!');
     *  },
     *  onError: (error) => {
     *    console.error('Login Failed: ', error);
     *  }
     * });
     */
    login(options?: AuthClientLoginOptions): Promise<void>;
    private _getEventHandler;
    private _handleFailure;
    private _removeEventListener;
    logout(options?: {
        returnTo?: string;
    }): Promise<void>;
}
