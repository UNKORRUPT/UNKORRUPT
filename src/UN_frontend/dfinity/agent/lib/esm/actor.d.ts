import { Agent, HttpDetailsResponse, QueryResponseRejected, SubmitResponse } from './agent';
import { AgentError } from './errors';
import { IDL } from '@dfinity/candid';
import { PollStrategyFactory } from './polling';
import { Principal } from '@dfinity/principal';
import { RequestId } from './request_id';
import { Certificate, CreateCertificateOptions } from './certificate';
import _SERVICE, { canister_install_mode } from './canisters/management_service';
export declare class ActorCallError extends AgentError {
    readonly canisterId: Principal;
    readonly methodName: string;
    readonly type: 'query' | 'update';
    readonly props: Record<string, string>;
    constructor(canisterId: Principal, methodName: string, type: 'query' | 'update', props: Record<string, string>);
}
export declare class QueryCallRejectedError extends ActorCallError {
    readonly result: QueryResponseRejected;
    constructor(canisterId: Principal, methodName: string, result: QueryResponseRejected);
}
export declare class UpdateCallRejectedError extends ActorCallError {
    readonly requestId: RequestId;
    readonly response: SubmitResponse['response'];
    constructor(canisterId: Principal, methodName: string, requestId: RequestId, response: SubmitResponse['response']);
}
/**
 * Configuration to make calls to the Replica.
 */
export interface CallConfig {
    /**
     * An agent to use in this call, otherwise the actor or call will try to discover the
     * agent to use.
     */
    agent?: Agent;
    /**
     * A polling strategy factory that dictates how much and often we should poll the
     * read_state endpoint to get the result of an update call.
     */
    pollingStrategyFactory?: PollStrategyFactory;
    /**
     * The canister ID of this Actor.
     */
    canisterId?: string | Principal;
    /**
     * The effective canister ID. This should almost always be ignored.
     */
    effectiveCanisterId?: Principal;
}
/**
 * Configuration that can be passed to customize the Actor behaviour.
 */
export interface ActorConfig extends CallConfig {
    /**
     * The Canister ID of this Actor. This is required for an Actor.
     */
    canisterId: string | Principal;
    /**
     * An override function for update calls' CallConfig. This will be called on every calls.
     */
    callTransform?(methodName: string, args: unknown[], callConfig: CallConfig): Partial<CallConfig> | void;
    /**
     * An override function for query calls' CallConfig. This will be called on every query.
     */
    queryTransform?(methodName: string, args: unknown[], callConfig: CallConfig): Partial<CallConfig> | void;
    /**
     * Polyfill for BLS Certificate verification in case wasm is not supported
     */
    blsVerify?: CreateCertificateOptions['blsVerify'];
}
/**
 * A subclass of an actor. Actor class itself is meant to be a based class.
 */
export declare type ActorSubclass<T = Record<string, ActorMethod>> = Actor & T;
/**
 * An actor method type, defined for each methods of the actor service.
 */
export interface ActorMethod<Args extends unknown[] = unknown[], Ret = unknown> {
    (...args: Args): Promise<Ret>;
    withOptions(options: CallConfig): (...args: Args) => Promise<Ret>;
}
/**
 * An actor method type, defined for each methods of the actor service.
 */
export interface ActorMethodWithHttpDetails<Args extends unknown[] = unknown[], Ret = unknown> extends ActorMethod {
    (...args: Args): Promise<{
        httpDetails: HttpDetailsResponse;
        result: Ret;
    }>;
}
/**
 * An actor method type, defined for each methods of the actor service.
 */
export interface ActorMethodExtended<Args extends unknown[] = unknown[], Ret = unknown> extends ActorMethod {
    (...args: Args): Promise<{
        certificate?: Certificate;
        httpDetails?: HttpDetailsResponse;
        result: Ret;
    }>;
}
export declare type FunctionWithArgsAndReturn<Args extends unknown[] = unknown[], Ret = unknown> = (...args: Args) => Ret;
export declare type ActorMethodMappedWithHttpDetails<T> = {
    [K in keyof T]: T[K] extends FunctionWithArgsAndReturn<infer Args, infer Ret> ? ActorMethodWithHttpDetails<Args, Ret> : never;
};
export declare type ActorMethodMappedExtended<T> = {
    [K in keyof T]: T[K] extends FunctionWithArgsAndReturn<infer Args, infer Ret> ? ActorMethodExtended<Args, Ret> : never;
};
/**
 * The mode used when installing a canister.
 */
export declare type CanisterInstallMode = {
    reinstall: null;
} | {
    upgrade: [] | [
        {
            skip_pre_upgrade: [] | [boolean];
        }
    ];
} | {
    install: null;
};
/**
 * Internal metadata for actors. It's an enhanced version of ActorConfig with
 * some fields marked as required (as they are defaulted) and canisterId as
 * a Principal type.
 */
interface ActorMetadata {
    service: IDL.ServiceClass;
    agent?: Agent;
    config: ActorConfig;
}
declare const metadataSymbol: unique symbol;
export interface CreateActorClassOpts {
    httpDetails?: boolean;
    certificate?: boolean;
}
interface CreateCanisterSettings {
    freezing_threshold?: bigint;
    controllers?: Array<Principal>;
    memory_allocation?: bigint;
    compute_allocation?: bigint;
}
/**
 * An actor base class. An actor is an object containing only functions that will
 * return a promise. These functions are derived from the IDL definition.
 */
export declare class Actor {
    /**
     * Get the Agent class this Actor would call, or undefined if the Actor would use
     * the default agent (global.ic.agent).
     * @param actor The actor to get the agent of.
     */
    static agentOf(actor: Actor): Agent | undefined;
    /**
     * Get the interface of an actor, in the form of an instance of a Service.
     * @param actor The actor to get the interface of.
     */
    static interfaceOf(actor: Actor): IDL.ServiceClass;
    static canisterIdOf(actor: Actor): Principal;
    static install(fields: {
        module: ArrayBuffer;
        mode?: canister_install_mode;
        arg?: ArrayBuffer;
    }, config: ActorConfig): Promise<void>;
    static createCanister(config?: CallConfig, settings?: CreateCanisterSettings): Promise<Principal>;
    static createAndInstallCanister(interfaceFactory: IDL.InterfaceFactory, fields: {
        module: ArrayBuffer;
        arg?: ArrayBuffer;
    }, config?: CallConfig): Promise<ActorSubclass>;
    static createActorClass(interfaceFactory: IDL.InterfaceFactory, options?: CreateActorClassOpts): ActorConstructor;
    static createActor<T = Record<string, ActorMethod>>(interfaceFactory: IDL.InterfaceFactory, configuration: ActorConfig): ActorSubclass<T>;
    /**
     * Returns an actor with methods that return the http response details along with the result
     * @param interfaceFactory - the interface factory for the actor
     * @param configuration - the configuration for the actor
     * @deprecated - use createActor with actorClassOptions instead
     */
    static createActorWithHttpDetails<T = Record<string, ActorMethod>>(interfaceFactory: IDL.InterfaceFactory, configuration: ActorConfig): ActorSubclass<ActorMethodMappedWithHttpDetails<T>>;
    /**
     * Returns an actor with methods that return the http response details along with the result
     * @param interfaceFactory - the interface factory for the actor
     * @param configuration - the configuration for the actor
     * @param actorClassOptions - options for the actor class extended details to return with the result
     */
    static createActorWithExtendedDetails<T = Record<string, ActorMethod>>(interfaceFactory: IDL.InterfaceFactory, configuration: ActorConfig, actorClassOptions?: CreateActorClassOpts): ActorSubclass<ActorMethodMappedExtended<T>>;
    private [metadataSymbol];
    protected constructor(metadata: ActorMetadata);
}
export declare type ActorConstructor = new (config: ActorConfig) => ActorSubclass;
export declare const ACTOR_METHOD_WITH_HTTP_DETAILS = "http-details";
export declare const ACTOR_METHOD_WITH_CERTIFICATE = "certificate";
export declare type ManagementCanisterRecord = _SERVICE;
/**
 * Create a management canister actor
 * @param config - a CallConfig
 */
export declare function getManagementCanister(config: CallConfig): ActorSubclass<ManagementCanisterRecord>;
export declare class AdvancedActor extends Actor {
    constructor(metadata: ActorMetadata);
}
export {};
