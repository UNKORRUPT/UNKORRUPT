import { DerEncodedPublicKey, PublicKey, Signature, SignIdentity } from '@dfinity/agent';
/**
 * Options used in a {@link ECDSAKeyIdentity}
 */
export declare type CryptoKeyOptions = {
    extractable?: boolean;
    keyUsages?: KeyUsage[];
    subtleCrypto?: SubtleCrypto;
};
export declare class CryptoError extends Error {
    readonly message: string;
    constructor(message: string);
}
export interface DerCryptoKey extends CryptoKey {
    toDer: () => DerEncodedPublicKey;
}
/**
 * An identity interface that wraps an ECDSA keypair using the P-256 named curve. Supports DER-encoding and decoding for agent calls
 */
export declare class ECDSAKeyIdentity extends SignIdentity {
    /**
     * Generates a randomly generated identity for use in calls to the Internet Computer.
     * @param {CryptoKeyOptions} options optional settings
     * @param {CryptoKeyOptions['extractable']} options.extractable - whether the key should allow itself to be used. Set to false for maximum security.
     * @param {CryptoKeyOptions['keyUsages']} options.keyUsages - a list of key usages that the key can be used for
     * @param {CryptoKeyOptions['subtleCrypto']} options.subtleCrypto interface
     * @constructs ECDSAKeyIdentity
     * @returns a {@link ECDSAKeyIdentity}
     */
    static generate(options?: CryptoKeyOptions): Promise<ECDSAKeyIdentity>;
    /**
     * generates an identity from a public and private key. Please ensure that you are generating these keys securely and protect the user's private key
     * @param keyPair a CryptoKeyPair
     * @param subtleCrypto - a SubtleCrypto interface in case one is not available globally
     * @returns an {@link ECDSAKeyIdentity}
     */
    static fromKeyPair(keyPair: CryptoKeyPair | {
        privateKey: CryptoKey;
        publicKey: CryptoKey;
    }, subtleCrypto?: SubtleCrypto): Promise<ECDSAKeyIdentity>;
    protected _derKey: DerEncodedPublicKey;
    protected _keyPair: CryptoKeyPair;
    protected _subtleCrypto: SubtleCrypto;
    protected constructor(keyPair: CryptoKeyPair, derKey: DerEncodedPublicKey, subtleCrypto: SubtleCrypto);
    /**
     * Return the internally-used key pair.
     * @returns a CryptoKeyPair
     */
    getKeyPair(): CryptoKeyPair;
    /**
     * Return the public key.
     * @returns an {@link PublicKey & DerCryptoKey}
     */
    getPublicKey(): PublicKey & DerCryptoKey;
    /**
     * Signs a blob of data, with this identity's private key.
     * @param {ArrayBuffer} challenge - challenge to sign with this identity's secretKey, producing a signature
     * @returns {Promise<Signature>} signature
     */
    sign(challenge: ArrayBuffer): Promise<Signature>;
}
export default ECDSAKeyIdentity;
