import { Principal } from '@dfinity/principal';
import { HttpAgentRequest } from './agent/http/types';
/**
 * A Key Pair, containing a secret and public key.
 */
export interface KeyPair {
    secretKey: ArrayBuffer;
    publicKey: PublicKey;
}
/**
 * A public key that is DER encoded. This is a branded ArrayBuffer.
 */
export declare type DerEncodedPublicKey = ArrayBuffer & {
    __derEncodedPublicKey__?: void;
};
/**
 * A signature array buffer.
 */
export declare type Signature = ArrayBuffer & {
    __signature__: void;
};
/**
 * A Public Key implementation.
 */
export interface PublicKey {
    toDer(): DerEncodedPublicKey;
    toRaw?(): ArrayBuffer;
    rawKey?: ArrayBuffer;
    derKey?: DerEncodedPublicKey;
}
/**
 * A General Identity object. This does not have to be a private key (for example,
 * the Anonymous identity), but it must be able to transform request.
 */
export interface Identity {
    /**
     * Get the principal represented by this identity. Normally should be a
     * `Principal.selfAuthenticating()`.
     */
    getPrincipal(): Principal;
    /**
     * Transform a request into a signed version of the request. This is done last
     * after the transforms on the body of a request. The returned object can be
     * anything, but must be serializable to CBOR.
     */
    transformRequest(request: HttpAgentRequest): Promise<unknown>;
}
/**
 * An Identity that can sign blobs.
 */
export declare abstract class SignIdentity implements Identity {
    protected _principal: Principal | undefined;
    /**
     * Returns the public key that would match this identity's signature.
     */
    abstract getPublicKey(): PublicKey;
    /**
     * Signs a blob of data, with this identity's private key.
     */
    abstract sign(blob: ArrayBuffer): Promise<Signature>;
    /**
     * Get the principal represented by this identity. Normally should be a
     * `Principal.selfAuthenticating()`.
     */
    getPrincipal(): Principal;
    /**
     * Transform a request into a signed version of the request. This is done last
     * after the transforms on the body of a request. The returned object can be
     * anything, but must be serializable to CBOR.
     * @param request - internet computer request to transform
     */
    transformRequest(request: HttpAgentRequest): Promise<unknown>;
}
export declare class AnonymousIdentity implements Identity {
    getPrincipal(): Principal;
    transformRequest(request: HttpAgentRequest): Promise<unknown>;
}
export interface AnonymousIdentityDescriptor {
    type: 'AnonymousIdentity';
}
export interface PublicKeyIdentityDescriptor {
    type: 'PublicKeyIdentity';
    publicKey: string;
}
export declare type IdentityDescriptor = AnonymousIdentityDescriptor | PublicKeyIdentityDescriptor;
/**
 * Create an IdentityDescriptor from a @dfinity/identity Identity
 * @param identity - identity describe in returned descriptor
 */
export declare function createIdentityDescriptor(identity: SignIdentity | AnonymousIdentity): IdentityDescriptor;
