import { DerEncodedPublicKey, PublicKey, Signature, SignIdentity } from '@dfinity/agent';
export declare class CosePublicKey implements PublicKey {
    protected _cose: ArrayBuffer;
    protected _encodedKey: DerEncodedPublicKey;
    constructor(_cose: ArrayBuffer);
    toDer(): DerEncodedPublicKey;
    getCose(): ArrayBuffer;
}
/**
 * A SignIdentity that uses `navigator.credentials`. See https://webauthn.guide/ for
 * more information about WebAuthentication.
 */
export declare class WebAuthnIdentity extends SignIdentity {
    readonly rawId: ArrayBuffer;
    protected authenticatorAttachment: AuthenticatorAttachment | undefined;
    /**
     * Create an identity from a JSON serialization.
     * @param json - json to parse
     */
    static fromJSON(json: string): WebAuthnIdentity;
    /**
     * Create an identity.
     * @param credentialCreationOptions an optional CredentialCreationOptions Challenge
     */
    static create(credentialCreationOptions?: CredentialCreationOptions): Promise<WebAuthnIdentity>;
    protected _publicKey: CosePublicKey;
    constructor(rawId: ArrayBuffer, cose: ArrayBuffer, authenticatorAttachment: AuthenticatorAttachment | undefined);
    getPublicKey(): PublicKey;
    /**
     * WebAuthn level 3 spec introduces a new attribute on successful WebAuthn interactions,
     * see https://w3c.github.io/webauthn/#dom-publickeycredential-authenticatorattachment.
     * This attribute is already implemented for Chrome, Safari and Edge.
     *
     * Given the attribute is only available after a successful interaction, the information is
     * provided opportunistically and might also be `undefined`.
     */
    getAuthenticatorAttachment(): AuthenticatorAttachment | undefined;
    sign(blob: ArrayBuffer): Promise<Signature>;
    /**
     * Allow for JSON serialization of all information needed to reuse this identity.
     */
    toJSON(): JsonnableWebAuthnIdentity;
}
/**
 * ReturnType<WebAuthnIdentity.toJSON>
 */
export interface JsonnableWebAuthnIdentity {
    publicKey: string;
    rawId: string;
}
