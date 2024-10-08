import { DerEncodedPublicKey, HttpAgentRequest, PublicKey, Signature, SignIdentity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import * as cbor from 'simple-cbor';
import { PartialIdentity } from './partial';
/**
 * A single delegation object that is signed by a private key. This is constructed by
 * `DelegationChain.create()`.
 *
 * {@see DelegationChain}
 */
export declare class Delegation {
    readonly pubkey: ArrayBuffer;
    readonly expiration: bigint;
    readonly targets?: Principal[] | undefined;
    constructor(pubkey: ArrayBuffer, expiration: bigint, targets?: Principal[] | undefined);
    toCBOR(): cbor.CborValue;
    toJSON(): JsonnableDelegation;
}
/**
 * Type of ReturnType<Delegation.toJSON>.
 * The goal here is to stringify all non-JSON-compatible types to some bytes representation we can
 * stringify as hex.
 * (Hex shouldn't be ambiguous ever, because you can encode as DER with semantic OIDs).
 */
interface JsonnableDelegation {
    expiration: string;
    pubkey: string;
    targets?: string[];
}
/**
 * A signed delegation, which lends its identity to the public key in the delegation
 * object. This is constructed by `DelegationChain.create()`.
 *
 * {@see DelegationChain}
 */
export interface SignedDelegation {
    delegation: Delegation;
    signature: Signature;
}
export interface JsonnableDelegationChain {
    publicKey: string;
    delegations: Array<{
        signature: string;
        delegation: {
            pubkey: string;
            expiration: string;
            targets?: string[];
        };
    }>;
}
/**
 * A chain of delegations. This is JSON Serializable.
 * This is the object to serialize and pass to a DelegationIdentity. It does not keep any
 * private keys.
 */
export declare class DelegationChain {
    readonly delegations: SignedDelegation[];
    readonly publicKey: DerEncodedPublicKey;
    /**
     * Create a delegation chain between two (or more) keys. By default, the expiration time
     * will be very short (15 minutes).
     *
     * To build a chain of more than 2 identities, this function needs to be called multiple times,
     * passing the previous delegation chain into the options argument. For example:
     * @example
     * const rootKey = createKey();
     * const middleKey = createKey();
     * const bottomeKey = createKey();
     *
     * const rootToMiddle = await DelegationChain.create(
     *   root, middle.getPublicKey(), Date.parse('2100-01-01'),
     * );
     * const middleToBottom = await DelegationChain.create(
     *   middle, bottom.getPublicKey(), Date.parse('2100-01-01'), { previous: rootToMiddle },
     * );
     *
     * // We can now use a delegation identity that uses the delegation above:
     * const identity = DelegationIdentity.fromDelegation(bottomKey, middleToBottom);
     * @param from The identity that will delegate.
     * @param to The identity that gets delegated. It can now sign messages as if it was the
     *           identity above.
     * @param expiration The length the delegation is valid. By default, 15 minutes from calling
     *                   this function.
     * @param options A set of options for this delegation. expiration and previous
     * @param options.previous - Another DelegationChain that this chain should start with.
     * @param options.targets - targets that scope the delegation (e.g. Canister Principals)
     */
    static create(from: SignIdentity, to: PublicKey, expiration?: Date, options?: {
        previous?: DelegationChain;
        targets?: Principal[];
    }): Promise<DelegationChain>;
    /**
     * Creates a DelegationChain object from a JSON string.
     * @param json The JSON string to parse.
     */
    static fromJSON(json: string | JsonnableDelegationChain): DelegationChain;
    /**
     * Creates a DelegationChain object from a list of delegations and a DER-encoded public key.
     * @param delegations The list of delegations.
     * @param publicKey The DER-encoded public key of the key-pair signing the first delegation.
     */
    static fromDelegations(delegations: SignedDelegation[], publicKey: DerEncodedPublicKey): DelegationChain;
    protected constructor(delegations: SignedDelegation[], publicKey: DerEncodedPublicKey);
    toJSON(): JsonnableDelegationChain;
}
/**
 * An Identity that adds delegation to a request. Everywhere in this class, the name
 * innerKey refers to the SignIdentity that is being used to sign the requests, while
 * originalKey is the identity that is being borrowed. More identities can be used
 * in the middle to delegate.
 */
export declare class DelegationIdentity extends SignIdentity {
    private _inner;
    private _delegation;
    /**
     * Create a delegation without having access to delegateKey.
     * @param key The key used to sign the reqyests.
     * @param delegation A delegation object created using `createDelegation`.
     */
    static fromDelegation(key: Pick<SignIdentity, 'sign'>, delegation: DelegationChain): DelegationIdentity;
    protected constructor(_inner: Pick<SignIdentity, 'sign'>, _delegation: DelegationChain);
    getDelegation(): DelegationChain;
    getPublicKey(): PublicKey;
    sign(blob: ArrayBuffer): Promise<Signature>;
    transformRequest(request: HttpAgentRequest): Promise<unknown>;
}
/**
 * A partial delegated identity, representing a delegation chain and the public key that it targets
 */
export declare class PartialDelegationIdentity extends PartialIdentity {
    #private;
    /**
     * The Delegation Chain of this identity.
     */
    get delegation(): DelegationChain;
    private constructor();
    /**
     * Create a {@link PartialDelegationIdentity} from a {@link PublicKey} and a {@link DelegationChain}.
     * @param key The {@link PublicKey} to delegate to.
     * @param delegation a {@link DelegationChain} targeting the inner key.
     * @constructs PartialDelegationIdentity
     */
    static fromDelegation(key: PublicKey, delegation: DelegationChain): PartialDelegationIdentity;
}
/**
 * List of things to check for a delegation chain validity.
 */
export interface DelegationValidChecks {
    /**
     * Check that the scope is amongst the scopes that this delegation has access to.
     */
    scope?: Principal | string | Array<Principal | string>;
}
/**
 * Analyze a DelegationChain and validate that it's valid, ie. not expired and apply to the
 * scope.
 * @param chain The chain to validate.
 * @param checks Various checks to validate on the chain.
 */
export declare function isDelegationValid(chain: DelegationChain, checks?: DelegationValidChecks): boolean;
export {};
