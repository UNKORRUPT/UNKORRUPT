import type { Principal } from '@dfinity/principal';
import { Expiry } from './transforms';
/**
 * @internal
 */
export declare const enum Endpoint {
    Query = "read",
    ReadState = "read_state",
    Call = "call"
}
export declare type HttpAgentRequest = HttpAgentQueryRequest | HttpAgentSubmitRequest | HttpAgentReadStateRequest;
export interface HttpAgentBaseRequest {
    readonly endpoint: Endpoint;
    request: RequestInit;
}
export declare type HttpHeaderField = [string, string];
export interface HttpAgentSubmitRequest extends HttpAgentBaseRequest {
    readonly endpoint: Endpoint.Call;
    body: CallRequest;
}
export interface HttpAgentQueryRequest extends HttpAgentBaseRequest {
    readonly endpoint: Endpoint.Query;
    body: ReadRequest;
}
export interface HttpAgentReadStateRequest extends HttpAgentBaseRequest {
    readonly endpoint: Endpoint.ReadState;
    body: ReadRequest;
}
export interface Signed<T> {
    content: T;
    sender_pubkey: ArrayBuffer;
    sender_sig: ArrayBuffer;
}
export interface UnSigned<T> {
    content: T;
}
export declare type Envelope<T> = Signed<T> | UnSigned<T>;
export interface HttpAgentRequestTransformFn {
    (args: HttpAgentRequest): Promise<HttpAgentRequest | undefined | void>;
    priority?: number;
}
export interface CallRequest extends Record<string, any> {
    request_type: SubmitRequestType.Call;
    canister_id: Principal;
    method_name: string;
    arg: ArrayBuffer;
    sender: Uint8Array | Principal;
    ingress_expiry: Expiry;
    nonce?: Nonce;
}
export declare enum SubmitRequestType {
    Call = "call"
}
export declare const enum ReadRequestType {
    Query = "query",
    ReadState = "read_state"
}
export interface QueryRequest extends Record<string, any> {
    request_type: ReadRequestType.Query;
    canister_id: Principal;
    method_name: string;
    arg: ArrayBuffer;
    sender: Uint8Array | Principal;
    ingress_expiry: Expiry;
    nonce?: Nonce;
}
export interface ReadStateRequest extends Record<string, any> {
    request_type: ReadRequestType.ReadState;
    paths: ArrayBuffer[][];
    ingress_expiry: Expiry;
    sender: Uint8Array | Principal;
}
export declare type ReadRequest = QueryRequest | ReadStateRequest;
export declare type Nonce = Uint8Array & {
    __nonce__: void;
};
/**
 * Create a random Nonce, based on random values
 */
export declare function makeNonce(): Nonce;
