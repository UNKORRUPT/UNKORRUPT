import { SignIdentity, wrapDER, DER_COSE_OID, fromHex, toHex, } from '@dfinity/agent';
import borc from 'borc';
import { randomBytes } from '@noble/hashes/utils';
import { bufFromBufLike } from '@dfinity/candid';
function _coseToDerEncodedBlob(cose) {
    return wrapDER(cose, DER_COSE_OID).buffer;
}
/**
 * From the documentation;
 * The authData is a byte array described in the spec. Parsing it will involve slicing bytes from
 * the array and converting them into usable objects.
 *
 * See https://webauthn.guide/#registration (subsection "Example: Parsing the authenticator data").
 * @param authData The authData field of the attestation response.
 * @returns The COSE key of the authData.
 */
function _authDataToCose(authData) {
    const dataView = new DataView(new ArrayBuffer(2));
    const idLenBytes = authData.slice(53, 55);
    [...new Uint8Array(idLenBytes)].forEach((v, i) => dataView.setUint8(i, v));
    const credentialIdLength = dataView.getUint16(0);
    // Get the public key object.
    return authData.slice(55 + credentialIdLength);
}
export class CosePublicKey {
    constructor(_cose) {
        this._cose = _cose;
        this._encodedKey = _coseToDerEncodedBlob(_cose);
    }
    toDer() {
        return this._encodedKey;
    }
    getCose() {
        return this._cose;
    }
}
/**
 * Create a challenge from a string or array. The default challenge is always the same
 * because we don't need to verify the authenticity of the key on the server (we don't
 * register our keys with the IC). Any challenge would do, even one per key, randomly
 * generated.
 * @param challenge The challenge to transform into a byte array. By default a hard
 *        coded string.
 */
function _createChallengeBuffer(challenge = '<ic0.app>') {
    if (typeof challenge === 'string') {
        return Uint8Array.from(challenge, c => c.charCodeAt(0));
    }
    else {
        return challenge;
    }
}
/**
 * Create a credentials to authenticate with a server. This is necessary in order in
 * WebAuthn to get credentials IDs (which give us the public key and allow us to
 * sign), but in the case of the Internet Computer, we don't actually need to register
 * it, so we don't.
 * @param credentialCreationOptions an optional CredentialCreationOptions object
 */
async function _createCredential(credentialCreationOptions) {
    const creds = (await navigator.credentials.create(credentialCreationOptions !== null && credentialCreationOptions !== void 0 ? credentialCreationOptions : {
        publicKey: {
            authenticatorSelection: {
                userVerification: 'preferred',
            },
            attestation: 'direct',
            challenge: _createChallengeBuffer(),
            pubKeyCredParams: [{ type: 'public-key', alg: PubKeyCoseAlgo.ECDSA_WITH_SHA256 }],
            rp: {
                name: 'Internet Identity Service',
            },
            user: {
                id: randomBytes(16),
                name: 'Internet Identity',
                displayName: 'Internet Identity',
            },
        },
    }));
    if (creds === null) {
        return null;
    }
    return {
        // do _not_ use ...creds here, as creds is not enumerable in all cases
        id: creds.id,
        response: creds.response,
        type: creds.type,
        authenticatorAttachment: creds.authenticatorAttachment,
        getClientExtensionResults: creds.getClientExtensionResults,
        // Some password managers will return a Uint8Array, so we ensure we return an ArrayBuffer.
        rawId: bufFromBufLike(creds.rawId),
    };
}
// See https://www.iana.org/assignments/cose/cose.xhtml#algorithms for a complete
// list of these algorithms. We only list the ones we support here.
var PubKeyCoseAlgo;
(function (PubKeyCoseAlgo) {
    PubKeyCoseAlgo[PubKeyCoseAlgo["ECDSA_WITH_SHA256"] = -7] = "ECDSA_WITH_SHA256";
})(PubKeyCoseAlgo || (PubKeyCoseAlgo = {}));
/**
 * A SignIdentity that uses `navigator.credentials`. See https://webauthn.guide/ for
 * more information about WebAuthentication.
 */
export class WebAuthnIdentity extends SignIdentity {
    constructor(rawId, cose, authenticatorAttachment) {
        super();
        this.rawId = rawId;
        this.authenticatorAttachment = authenticatorAttachment;
        this._publicKey = new CosePublicKey(cose);
    }
    /**
     * Create an identity from a JSON serialization.
     * @param json - json to parse
     */
    static fromJSON(json) {
        const { publicKey, rawId } = JSON.parse(json);
        if (typeof publicKey !== 'string' || typeof rawId !== 'string') {
            throw new Error('Invalid JSON string.');
        }
        return new this(fromHex(rawId), fromHex(publicKey), undefined);
    }
    /**
     * Create an identity.
     * @param credentialCreationOptions an optional CredentialCreationOptions Challenge
     */
    static async create(credentialCreationOptions) {
        var _a;
        const creds = await _createCredential(credentialCreationOptions);
        if (!creds || creds.type !== 'public-key') {
            throw new Error('Could not create credentials.');
        }
        const response = creds.response;
        if (response.attestationObject === undefined) {
            throw new Error('Was expecting an attestation response.');
        }
        // Parse the attestationObject as CBOR.
        const attObject = borc.decodeFirst(new Uint8Array(response.attestationObject));
        return new this(creds.rawId, _authDataToCose(attObject.authData), (_a = creds.authenticatorAttachment) !== null && _a !== void 0 ? _a : undefined);
    }
    getPublicKey() {
        return this._publicKey;
    }
    /**
     * WebAuthn level 3 spec introduces a new attribute on successful WebAuthn interactions,
     * see https://w3c.github.io/webauthn/#dom-publickeycredential-authenticatorattachment.
     * This attribute is already implemented for Chrome, Safari and Edge.
     *
     * Given the attribute is only available after a successful interaction, the information is
     * provided opportunistically and might also be `undefined`.
     */
    getAuthenticatorAttachment() {
        return this.authenticatorAttachment;
    }
    async sign(blob) {
        const result = (await navigator.credentials.get({
            publicKey: {
                allowCredentials: [
                    {
                        type: 'public-key',
                        id: this.rawId,
                    },
                ],
                challenge: blob,
                userVerification: 'preferred',
            },
        }));
        if (result.authenticatorAttachment !== null) {
            this.authenticatorAttachment = result.authenticatorAttachment;
        }
        const response = result.response;
        const cbor = borc.encode(new borc.Tagged(55799, {
            authenticator_data: new Uint8Array(response.authenticatorData),
            client_data_json: new TextDecoder().decode(response.clientDataJSON),
            signature: new Uint8Array(response.signature),
        }));
        if (!cbor) {
            throw new Error('failed to encode cbor');
        }
        return cbor.buffer;
    }
    /**
     * Allow for JSON serialization of all information needed to reuse this identity.
     */
    toJSON() {
        return {
            publicKey: toHex(this._publicKey.getCose()),
            rawId: toHex(this.rawId),
        };
    }
}
//# sourceMappingURL=webauthn.js.map