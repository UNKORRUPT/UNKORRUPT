/**
 * Hashes a string to a number. Algorithm can be found here:
 * https://caml.inria.fr/pub/papers/garrigue-polymorphic_variants-ml98.pdf
 * @param s - string to hash
 * @returns number representing hashed string
 */
function idlHash(s) {
    const utf8encoder = new TextEncoder();
    const array = utf8encoder.encode(s);
    let h = 0;
    for (const c of array) {
        h = (h * 223 + c) % 2 ** 32;
    }
    return h;
}
/**
 *
 * @param label string
 * @returns number representing hashed label
 */
export function idlLabelToId(label) {
    if (/^_\d+_$/.test(label) || /^_0x[0-9a-fA-F]+_$/.test(label)) {
        const num = +label.slice(1, -1);
        if (Number.isSafeInteger(num) && num >= 0 && num < 2 ** 32) {
            return num;
        }
    }
    return idlHash(label);
}
//# sourceMappingURL=hash.js.map