import { Principal } from '@dfinity/principal';
import { Agent, RequestStatusResponseStatus } from '../agent';
import { Certificate, CreateCertificateOptions } from '../certificate';
import { RequestId } from '../request_id';
export * as strategy from './strategy';
export { defaultStrategy } from './strategy';
export declare type PollStrategy = (canisterId: Principal, requestId: RequestId, status: RequestStatusResponseStatus) => Promise<void>;
export declare type PollStrategyFactory = () => PollStrategy;
/**
 * Polls the IC to check the status of the given request then
 * returns the response bytes once the request has been processed.
 * @param agent The agent to use to poll read_state.
 * @param canisterId The effective canister ID.
 * @param requestId The Request ID to poll status for.
 * @param strategy A polling strategy.
 * @param request Request for the readState call.
 * @param blsVerify - optional replacement function that verifies the BLS signature of a certificate.
 */
export declare function pollForResponse(agent: Agent, canisterId: Principal, requestId: RequestId, strategy: PollStrategy, request?: any, blsVerify?: CreateCertificateOptions['blsVerify']): Promise<{
    certificate: Certificate;
    reply: ArrayBuffer;
}>;
