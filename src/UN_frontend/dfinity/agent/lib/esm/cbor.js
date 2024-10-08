// This file is based on:
// https://github.com/dfinity-lab/dfinity/blob/9bca65f8edd65701ea6bdb00e0752f9186bbc893/docs/spec/public/index.adoc#cbor-encoding-of-requests-and-responses
import borc from 'borc';
import * as cbor from 'simple-cbor';
import { SelfDescribeCborSerializer } from 'simple-cbor';
import { concat, fromHex, toHex } from './utils/buffer';
// We are using hansl/simple-cbor for CBOR serialization, to avoid issues with
// encoding the uint64 values that the HTTP handler of the client expects for
// canister IDs. However, simple-cbor does not yet provide deserialization so
// we are using `Uint8Array` so that we can use the dignifiedquire/borc CBOR
// decoder.
class PrincipalEncoder {
    get name() {
        return 'Principal';
    }
    get priority() {
        return 0;
    }
    match(value) {
        return value && value._isPrincipal === true;
    }
    encode(v) {
        return cbor.value.bytes(v.toUint8Array());
    }
}
class BufferEncoder {
    get name() {
        return 'Buffer';
    }
    get priority() {
        return 1;
    }
    match(value) {
        return value instanceof ArrayBuffer || ArrayBuffer.isView(value);
    }
    encode(v) {
        return cbor.value.bytes(new Uint8Array(v));
    }
}
class BigIntEncoder {
    get name() {
        return 'BigInt';
    }
    get priority() {
        return 1;
    }
    match(value) {
        return typeof value === `bigint`;
    }
    encode(v) {
        // Always use a bigint encoding.
        if (v > BigInt(0)) {
            return cbor.value.tagged(2, cbor.value.bytes(fromHex(v.toString(16))));
        }
        else {
            return cbor.value.tagged(3, cbor.value.bytes(fromHex((BigInt('-1') * v).toString(16))));
        }
    }
}
const serializer = SelfDescribeCborSerializer.withDefaultEncoders(true);
serializer.addEncoder(new PrincipalEncoder());
serializer.addEncoder(new BufferEncoder());
serializer.addEncoder(new BigIntEncoder());
export var CborTag;
(function (CborTag) {
    CborTag[CborTag["Uint64LittleEndian"] = 71] = "Uint64LittleEndian";
    CborTag[CborTag["Semantic"] = 55799] = "Semantic";
})(CborTag || (CborTag = {}));
/**
 * Encode a JavaScript value into CBOR.
 */
export function encode(value) {
    return serializer.serialize(value);
}
function decodePositiveBigInt(buf) {
    const len = buf.byteLength;
    let res = BigInt(0);
    for (let i = 0; i < len; i++) {
        res = res * BigInt(0x100) + BigInt(buf[i]);
    }
    return res;
}
// A BORC subclass that decodes byte strings to ArrayBuffer instead of the Buffer class.
class Uint8ArrayDecoder extends borc.Decoder {
    createByteString(raw) {
        return concat(...raw);
    }
    createByteStringFromHeap(start, end) {
        if (start === end) {
            return new ArrayBuffer(0);
        }
        return new Uint8Array(this._heap.slice(start, end));
    }
}
export function decode(input) {
    const buffer = new Uint8Array(input);
    const decoder = new Uint8ArrayDecoder({
        size: buffer.byteLength,
        tags: {
            // Override tags 2 and 3 for BigInt support (borc supports only BigNumber).
            2: val => decodePositiveBigInt(val),
            3: val => -decodePositiveBigInt(val),
            [CborTag.Semantic]: (value) => value,
        },
    });
    try {
        return decoder.decodeFirst(buffer);
    }
    catch (e) {
        throw new Error(`Failed to decode CBOR: ${e}, input: ${toHex(buffer)}`);
    }
}
//# sourceMappingURL=cbor.js.map