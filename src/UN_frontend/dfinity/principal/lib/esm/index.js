import { decode, encode } from './utils/base32';
import { getCrc32 } from './utils/getCrc';
import { sha224 } from './utils/sha224';
export const JSON_KEY_PRINCIPAL = '__principal__';
const SELF_AUTHENTICATING_SUFFIX = 2;
const ANONYMOUS_SUFFIX = 4;
const MANAGEMENT_CANISTER_PRINCIPAL_HEX_STR = 'aaaaa-aa';
const fromHexString = (hexString) => { var _a; return new Uint8Array(((_a = hexString.match(/.{1,2}/g)) !== null && _a !== void 0 ? _a : []).map(byte => parseInt(byte, 16))); };
const toHexString = (bytes) => bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
export class Principal {
    constructor(_arr) {
        this._arr = _arr;
        this._isPrincipal = true;
    }
    static anonymous() {
        return new this(new Uint8Array([ANONYMOUS_SUFFIX]));
    }
    /**
     * Utility method, returning the principal representing the management canister, decoded from the hex string `'aaaaa-aa'`
     * @returns {Principal} principal of the management canister
     */
    static managementCanister() {
        return this.fromHex(MANAGEMENT_CANISTER_PRINCIPAL_HEX_STR);
    }
    static selfAuthenticating(publicKey) {
        const sha = sha224(publicKey);
        return new this(new Uint8Array([...sha, SELF_AUTHENTICATING_SUFFIX]));
    }
    static from(other) {
        if (typeof other === 'string') {
            return Principal.fromText(other);
        }
        else if (Object.getPrototypeOf(other) === Uint8Array.prototype) {
            return new Principal(other);
        }
        else if (typeof other === 'object' &&
            other !== null &&
            other._isPrincipal === true) {
            return new Principal(other._arr);
        }
        throw new Error(`Impossible to convert ${JSON.stringify(other)} to Principal.`);
    }
    static fromHex(hex) {
        return new this(fromHexString(hex));
    }
    static fromText(text) {
        let maybePrincipal = text;
        // If formatted as JSON string, parse it first
        if (text.includes(JSON_KEY_PRINCIPAL)) {
            const obj = JSON.parse(text);
            if (JSON_KEY_PRINCIPAL in obj) {
                maybePrincipal = obj[JSON_KEY_PRINCIPAL];
            }
        }
        const canisterIdNoDash = maybePrincipal.toLowerCase().replace(/-/g, '');
        let arr = decode(canisterIdNoDash);
        arr = arr.slice(4, arr.length);
        const principal = new this(arr);
        if (principal.toText() !== maybePrincipal) {
            throw new Error(`Principal "${principal.toText()}" does not have a valid checksum (original value "${maybePrincipal}" may not be a valid Principal ID).`);
        }
        return principal;
    }
    static fromUint8Array(arr) {
        return new this(arr);
    }
    isAnonymous() {
        return this._arr.byteLength === 1 && this._arr[0] === ANONYMOUS_SUFFIX;
    }
    toUint8Array() {
        return this._arr;
    }
    toHex() {
        return toHexString(this._arr).toUpperCase();
    }
    toText() {
        const checksumArrayBuf = new ArrayBuffer(4);
        const view = new DataView(checksumArrayBuf);
        view.setUint32(0, getCrc32(this._arr));
        const checksum = new Uint8Array(checksumArrayBuf);
        const bytes = Uint8Array.from(this._arr);
        const array = new Uint8Array([...checksum, ...bytes]);
        const result = encode(array);
        const matches = result.match(/.{1,5}/g);
        if (!matches) {
            // This should only happen if there's no character, which is unreachable.
            throw new Error();
        }
        return matches.join('-');
    }
    toString() {
        return this.toText();
    }
    /**
     * Serializes to JSON
     * @returns {JsonnablePrincipal} a JSON object with a single key, {@link JSON_KEY_PRINCIPAL}, whose value is the principal as a string
     */
    toJSON() {
        return { [JSON_KEY_PRINCIPAL]: this.toText() };
    }
    /**
     * Utility method taking a Principal to compare against. Used for determining canister ranges in certificate verification
     * @param {Principal} other - a {@link Principal} to compare
     * @returns {'lt' | 'eq' | 'gt'} `'lt' | 'eq' | 'gt'` a string, representing less than, equal to, or greater than
     */
    compareTo(other) {
        for (let i = 0; i < Math.min(this._arr.length, other._arr.length); i++) {
            if (this._arr[i] < other._arr[i])
                return 'lt';
            else if (this._arr[i] > other._arr[i])
                return 'gt';
        }
        // Here, at least one principal is a prefix of the other principal (they could be the same)
        if (this._arr.length < other._arr.length)
            return 'lt';
        if (this._arr.length > other._arr.length)
            return 'gt';
        return 'eq';
    }
    /**
     * Utility method checking whether a provided Principal is less than or equal to the current one using the {@link Principal.compareTo} method
     * @param other a {@link Principal} to compare
     * @returns {boolean} boolean
     */
    ltEq(other) {
        const cmp = this.compareTo(other);
        return cmp == 'lt' || cmp == 'eq';
    }
    /**
     * Utility method checking whether a provided Principal is greater than or equal to the current one using the {@link Principal.compareTo} method
     * @param other a {@link Principal} to compare
     * @returns {boolean} boolean
     */
    gtEq(other) {
        const cmp = this.compareTo(other);
        return cmp == 'gt' || cmp == 'eq';
    }
}
//# sourceMappingURL=index.js.map