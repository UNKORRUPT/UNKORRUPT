import * as cbor from 'simple-cbor';
import { HttpAgentRequestTransformFn, HttpHeaderField, Nonce } from './types';
export declare class Expiry {
    private readonly _value;
    constructor(deltaInMSec: number);
    toCBOR(): cbor.CborValue;
    toHash(): ArrayBuffer;
}
/**
 * Create a Nonce transform, which takes a function that returns a Buffer, and adds it
 * as the nonce to every call requests.
 * @param nonceFn A function that returns a buffer. By default uses a semi-random method.
 */
export declare function makeNonceTransform(nonceFn?: () => Nonce): HttpAgentRequestTransformFn;
/**
 * Create a transform that adds a delay (by default 5 minutes) to the expiry.
 *
 * @param delayInMilliseconds The delay to add to the call time, in milliseconds.
 */
export declare function makeExpiryTransform(delayInMilliseconds: number): HttpAgentRequestTransformFn;
/**
 * Maps the default fetch headers field to the serializable HttpHeaderField.
 *
 * @param headers Fetch definition of the headers type
 * @returns array of header fields
 */
export declare function httpHeadersTransform(headers: Headers): HttpHeaderField[];
