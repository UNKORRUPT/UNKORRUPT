export declare const encodeLenBytes: (len: number) => number;
export declare const encodeLen: (buf: Uint8Array, offset: number, len: number) => number;
export declare const decodeLenBytes: (buf: Uint8Array, offset: number) => number;
export declare const decodeLen: (buf: Uint8Array, offset: number) => number;
/**
 * A DER encoded `SEQUENCE(OID)` for DER-encoded-COSE
 */
export declare const DER_COSE_OID: Uint8Array;
/**
 * A DER encoded `SEQUENCE(OID)` for the Ed25519 algorithm
 */
export declare const ED25519_OID: Uint8Array;
/**
 * A DER encoded `SEQUENCE(OID)` for secp256k1 with the ECDSA algorithm
 */
export declare const SECP256K1_OID: Uint8Array;
/**
 * Wraps the given `payload` in a DER encoding tagged with the given encoded `oid` like so:
 * `SEQUENCE(oid, BITSTRING(payload))`
 *
 * @param payload The payload to encode as the bit string
 * @param oid The DER encoded (and SEQUENCE wrapped!) OID to tag the payload with
 */
export declare function wrapDER(payload: ArrayBuffer, oid: Uint8Array): Uint8Array;
/**
 * Extracts a payload from the given `derEncoded` data, and checks that it was tagged with the given `oid`.
 *
 * `derEncoded = SEQUENCE(oid, BITSTRING(payload))`
 *
 * @param derEncoded The DER encoded and tagged data
 * @param oid The DER encoded (and SEQUENCE wrapped!) expected OID
 * @returns The unwrapped payload
 */
export declare const unwrapDER: (derEncoded: ArrayBuffer, oid: Uint8Array) => Uint8Array;
