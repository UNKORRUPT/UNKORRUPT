export declare type RequestId = ArrayBuffer & {
    __requestId__: void;
};
/**
 * sha256 hash the provided Buffer
 * @param data - input to hash function
 */
export declare function hash(data: ArrayBuffer): ArrayBuffer;
/**
 *
 * @param value unknown value
 * @returns ArrayBuffer
 */
export declare function hashValue(value: unknown): ArrayBuffer;
/**
 * Get the RequestId of the provided ic-ref request.
 * RequestId is the result of the representation-independent-hash function.
 * https://sdk.dfinity.org/docs/interface-spec/index.html#hash-of-map
 * @param request - ic-ref request to hash into RequestId
 */
export declare function requestIdOf(request: Record<string, any>): RequestId;
/**
 * Hash a map into an ArrayBuffer using the representation-independent-hash function.
 * https://sdk.dfinity.org/docs/interface-spec/index.html#hash-of-map
 * @param map - Any non-nested object
 * @returns ArrayBuffer
 */
export declare function hashOfMap(map: Record<string, unknown>): ArrayBuffer;
